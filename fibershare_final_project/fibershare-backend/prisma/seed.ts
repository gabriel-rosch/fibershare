import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/passwordUtils'

const prisma = new PrismaClient()

async function main() {
  // Criar a operadora
  const operator = await prisma.operator.create({
    data: {
      name: 'Operadora Exemplo',
      region: 'Sul',
      description: 'Primeira operadora do sistema',
      contactEmail: 'contato@operadora.com',
      contactPhone: '(48) 99999-9999',
      logo: null,
      rating: 5.0,
      partnershipStatus: 'active',
    },
  })

  // Criar um usuário admin para a operadora
  const hashedPassword = await hashPassword('123456')
  await prisma.user.create({
    data: {
      name: 'Admin Operadora',
      email: 'admin@operadora.com',
      password: hashedPassword,
      role: 'operator_admin',
      status: 'active',
      operatorId: operator.id,
    },
  })

  console.log('Seed concluído! Dados criados:')
  console.log('Operadora:', operator)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 