import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/passwordUtils';
import Stripe from 'stripe';
import { BadRequestError, ConflictError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// Verificar se deve usar Stripe ou modo de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DISABLE_STRIPE === 'true';
const stripeKey = process.env.STRIPE_SECRET_KEY;

// Inicializa o cliente Stripe apenas se não estiver em modo de desenvolvimento
let stripe: Stripe | null = null;
if (!isDevelopment && stripeKey && stripeKey !== 'sk_test_fake_key_for_development') {
  stripe = new Stripe(stripeKey, {
    apiVersion: '2025-04-30.basil',
  });
}

interface RegisterOperatorData {
  operatorName: string;
  operatorEmail: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  stripePriceId: string;
  region: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

export const operatorService = {
  // Buscar planos do Stripe e sincronizar com o banco
  syncSubscriptionPlansFromStripe: async () => {
    try {
      console.log('🔄 Sincronizando planos do Stripe...');
      
      if (!stripe) {
        console.log('⚠️ Stripe não configurado, pulando sincronização');
        return false;
      }
      
      // Buscar preços ativos do Stripe
      const prices = await stripe.prices.list({
        active: true,
        type: 'recurring',
        limit: 100,
      });

      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });

      const productMap = new Map();
      products.data.forEach(product => {
        productMap.set(product.id, product);
      });

      // Sincronizar com o banco
      for (const price of prices.data) {
        const product = productMap.get(price.product);
        
        if (product) {
          // Verificar se o plano já existe
          const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { stripePriceId: price.id }
          });

          const planData = {
            name: product.name,
            description: product.description || '',
            stripePriceId: price.id,
            price: price.unit_amount ? price.unit_amount / 100 : 0, // Converter de centavos
            currency: price.currency.toUpperCase(),
            interval: price.recurring?.interval || 'month',
            intervalCount: price.recurring?.interval_count || 1,
            active: price.active,
            portsCapacity: product.metadata?.portsCapacity ? 
              parseInt(product.metadata.portsCapacity) : 100,
          };

          if (existingPlan) {
            // Atualizar plano existente
            await prisma.subscriptionPlan.update({
              where: { id: existingPlan.id },
              data: planData,
            });
            console.log(`✅ Plano atualizado: ${planData.name}`);
          } else {
            // Criar novo plano
            await prisma.subscriptionPlan.create({
              data: planData,
            });
            console.log(`✅ Plano criado: ${planData.name}`);
          }
        }
      }

      console.log('✅ Sincronização concluída!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao sincronizar planos do Stripe:', error);
      throw error;
    }
  },

  // Processar webhook do Stripe (versão simplificada)
  handleStripeWebhook: async (event: Stripe.Event) => {
    try {
      console.log(`Processando evento: ${event.type}`);
      
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('Checkout session completado');
          break;
        case 'invoice.payment_succeeded':
          console.log('Pagamento bem-sucedido');
          break;
        case 'invoice.payment_failed':
          console.log('Pagamento falhou');
          break;
        case 'customer.subscription.updated':
          console.log('Subscription atualizada');
          break;
        case 'customer.subscription.deleted':
          console.log('Subscription cancelada');
          break;
        default:
          console.log(`Evento não processado: ${event.type}`);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  },

  // Registrar uma nova operadora com integração Stripe (ou modo de desenvolvimento)
  registerOperator: async (data: RegisterOperatorData) => {
    const {
      operatorName,
      operatorEmail,
      adminName,
      adminEmail,
      adminPassword,
      stripePriceId,
      region,
      description,
      contactEmail,
      contactPhone
    } = data;

    console.log('🚀 Iniciando registro de operadora:', { operatorName, isDevelopment });

    // Verificar se operadora já existe
    const existingOperator = await prisma.operator.findUnique({
      where: { email: operatorEmail }
    });

    if (existingOperator) {
      throw new ConflictError('Já existe uma operadora com este email.');
    }

    // Verificar se usuário admin já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      throw new ConflictError('Já existe um usuário com este email.');
    }

    // Criptografar senha
    const hashedPassword = await hashPassword(adminPassword);

    // Criar operadora e usuário admin em uma transação
    const newOperator = await prisma.$transaction(async (tx) => {
      // Criar operadora
      const operator = await tx.operator.create({
        data: {
          name: operatorName,
          email: operatorEmail,
          region,
          description,
          contactEmail,
          contactPhone,
          subscriptionStatus: isDevelopment ? 'active' : 'pending_payment', // Em dev, já ativo
        }
      });

      // Criar usuário admin
      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin', // Sempre define como admin
          status: 'active',
          operatorId: operator.id
        }
      });

      console.log('✅ Operadora e usuário admin criados:', operator.id);
      return operator;
    });

    // Se estiver em modo de desenvolvimento, retornar sucesso sem Stripe
    if (isDevelopment) {
      console.log('🔧 Modo de desenvolvimento: pulando integração Stripe');
      return {
        operatorId: newOperator.id,
        message: 'Operadora registrada com sucesso! (Modo de desenvolvimento)',
        developmentMode: true
      };
    }

    // Modo produção com Stripe
    if (!stripe) {
      throw new Error('Stripe não configurado para produção');
    }

    // Criar cliente no Stripe
    const stripeCustomer = await stripe.customers.create({
      email: operatorEmail,
      name: operatorName,
      metadata: {
        operatorId: newOperator.id
      }
    });

    // Atualizar operadora com ID do cliente Stripe
    await prisma.operator.update({
      where: { id: newOperator.id },
      data: { stripeCustomerId: stripeCustomer.id }
    });

    // Criar sessão de checkout no Stripe
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      mode: 'subscription',
      customer: stripeCustomer.id,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/register-operator?canceled=true`,
      subscription_data: {
        metadata: {
          operatorId: newOperator.id
        }
      },
      allow_promotion_codes: true
    });

    return {
      operatorId: newOperator.id,
      checkoutUrl: session.url
    };
  },

  // Obter planos de assinatura disponíveis (com opção de sincronizar)
  getSubscriptionPlans: async (syncFromStripe = false) => {
    try {
      // Se solicitado, sincronizar com Stripe primeiro (apenas se não for desenvolvimento)
      if (syncFromStripe && !isDevelopment) {
        await operatorService.syncSubscriptionPlansFromStripe();
      }

      const plans = await prisma.subscriptionPlan.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          description: true,
          stripePriceId: true,
          price: true,
          currency: true,
          interval: true,
          portsCapacity: true
        }
      });
      
      return plans;
    } catch (error) {
      console.error('Erro ao buscar planos de assinatura:', error);
      throw error;
    }
  }
}; 