import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Iniciando seed dos planos de assinatura...');

    // Primeiro, limpar planos existentes
    await prisma.subscriptionPlan.deleteMany({});
    console.log('✅ Planos existentes removidos');

    // Inserir planos de exemplo
    const plans = [
      {
        name: 'Plano Básico',
        description: 'Ideal para pequenas operadoras iniciantes',
        stripePriceId: 'price_basic_monthly', // Substitua pelos IDs reais do Stripe
        price: 99.90,
        currency: 'BRL',
        interval: 'month',
        intervalCount: 1,
        active: true,
        portsCapacity: 100,
      },
      {
        name: 'Plano Profissional',
        description: 'Para operadoras em crescimento',
        stripePriceId: 'price_pro_monthly',
        price: 199.90,
        currency: 'BRL',
        interval: 'month',
        intervalCount: 1,
        active: true,
        portsCapacity: 500,
      },
      {
        name: 'Plano Enterprise',
        description: 'Para grandes operadoras',
        stripePriceId: 'price_enterprise_monthly',
        price: 499.90,
        currency: 'BRL',
        interval: 'month',
        intervalCount: 1,
        active: true,
        portsCapacity: 2000,
      },
      {
        name: 'Plano Básico Anual',
        description: 'Plano básico com desconto anual',
        stripePriceId: 'price_basic_yearly',
        price: 999.90,
        currency: 'BRL',
        interval: 'year',
        intervalCount: 1,
        active: true,
        portsCapacity: 100,
      },
      {
        name: 'Plano Enterprise Anual',
        description: 'Plano enterprise com desconto anual',
        stripePriceId: 'price_enterprise_yearly',
        price: 4999.90,
        currency: 'BRL',
        interval: 'year',
        intervalCount: 1,
        active: true,
        portsCapacity: 2000,
      },
    ];

    for (const plan of plans) {
      const created = await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`✅ Plano criado: ${created.name} - R$ ${created.price}`);
    }

    console.log('🎉 Seed dos planos de assinatura concluído!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed dos planos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSubscriptionPlans(); 