import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/passwordUtils';
import Stripe from 'stripe';
import { BadRequestError, ConflictError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// Inicializa o cliente Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

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
  // Registrar uma nova operadora com integração Stripe
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
          subscriptionStatus: 'pending_payment',
        }
      });

      // Criar usuário admin
      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'operator_admin',
          status: 'active',
          operatorId: operator.id
        }
      });

      return operator;
    });

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

  // Obter planos de assinatura disponíveis
  getSubscriptionPlans: async () => {
    try {
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