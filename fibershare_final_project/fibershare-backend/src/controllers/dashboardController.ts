import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string; name?: string };
}

// Obter estatísticas para o dashboard
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Estatísticas diferentes dependendo do papel do usuário
    if (userRole === 'admin') {
      // Estatísticas para administradores
      const totalUsers = await prisma.user.count();
      const totalCTOs = await prisma.cTO.count();
      const totalPorts = await prisma.cTOPort.count();
      const occupiedPorts = await prisma.cTOPort.count({ where: { status: 'occupied' } });
      const pendingOrders = await prisma.serviceOrder.count({ where: { status: 'pending' } });

      const stats = [
        {
          id: '1',
          title: 'Usuários',
          value: totalUsers.toString(),
          icon: 'users',
          color: 'blue',
          description: 'Total de usuários registrados'
        },
        {
          id: '2',
          title: 'CTOs',
          value: totalCTOs.toString(),
          icon: 'server',
          color: 'green',
          description: 'Total de CTOs no sistema'
        },
        {
          id: '3',
          title: 'Portas',
          value: `${occupiedPorts}/${totalPorts}`,
          icon: 'plug',
          color: 'purple',
          description: 'Portas ocupadas/total'
        },
        {
          id: '4',
          title: 'Ordens Pendentes',
          value: pendingOrders.toString(),
          icon: 'clipboard',
          color: 'orange',
          description: 'Ordens de serviço aguardando ação'
        }
      ];

      res.status(200).json(stats);
    } else if (userRole === 'operator_admin' || userRole === 'operator_user') {
      // Estatísticas para operadores
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { operator: true }
      });

      if (!user?.operator) {
        return res.status(404).json({ message: 'Operador não encontrado para este usuário.' });
      }

      const operatorId = user.operator.id;
      
      const totalCTOs = await prisma.cTO.count({ where: { operatorId } });
      const totalPorts = await prisma.cTOPort.count({ where: { cto: { operatorId } } });
      const occupiedPorts = await prisma.cTOPort.count({ 
        where: { 
          cto: { operatorId },
          status: 'occupied'
        } 
      });
      const pendingPortOrders = await prisma.portServiceOrder.count({ 
        where: { 
          ownerId: userId,
          status: 'pending_approval'
        } 
      });

      const stats = [
        {
          id: '1',
          title: 'Minhas CTOs',
          value: totalCTOs.toString(),
          icon: 'server',
          color: 'green',
          description: 'Total de CTOs gerenciadas'
        },
        {
          id: '2',
          title: 'Portas',
          value: `${occupiedPorts}/${totalPorts}`,
          icon: 'plug',
          color: 'purple',
          description: 'Portas ocupadas/total'
        },
        {
          id: '3',
          title: 'Taxa de Ocupação',
          value: totalPorts > 0 ? `${Math.round((occupiedPorts / totalPorts) * 100)}%` : '0%',
          icon: 'chart-pie',
          color: 'blue',
          description: 'Percentual de portas ocupadas'
        },
        {
          id: '4',
          title: 'Solicitações',
          value: pendingPortOrders.toString(),
          icon: 'clipboard',
          color: 'orange',
          description: 'Solicitações de aluguel pendentes'
        }
      ];

      res.status(200).json(stats);
    } else {
      // Estatísticas para clientes
      const myRentals = await prisma.cTOPort.count({ where: { currentTenantId: userId } });
      const pendingRequests = await prisma.portServiceOrder.count({ 
        where: { 
          requesterId: userId,
          NOT: { status: { in: ['completed', 'cancelled', 'rejected'] } }
        } 
      });
      const totalSpent = await prisma.portServiceOrder.aggregate({
        where: {
          requesterId: userId,
          status: 'completed'
        },
        _sum: {
          price: true,
          installationFee: true
        }
      });

      const stats = [
        {
          id: '1',
          title: 'Portas Alugadas',
          value: myRentals.toString(),
          icon: 'plug',
          color: 'green',
          description: 'Total de portas atualmente alugadas'
        },
        {
          id: '2',
          title: 'Solicitações',
          value: pendingRequests.toString(),
          icon: 'clipboard',
          color: 'orange',
          description: 'Solicitações de aluguel em andamento'
        },
        {
          id: '3',
          title: 'Total Gasto',
          value: `R$ ${((totalSpent._sum.price || 0) + (totalSpent._sum.installationFee || 0)).toFixed(2)}`,
          icon: 'money-bill',
          color: 'blue',
          description: 'Valor total gasto em aluguéis'
        }
      ];

      res.status(200).json(stats);
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter estatísticas do dashboard.' });
  }
};

// Obter atividades recentes para o dashboard
export const getDashboardActivities = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Buscar atividades do banco de dados
    // Aqui você pode implementar uma lógica mais complexa para gerar atividades
    // com base em diferentes eventos do sistema
    
    // Exemplo simples: buscar as últimas ordens de serviço e mensagens
    let activities: any[] = [];
    
    // Buscar ordens de serviço recentes
    const serviceOrders = await prisma.serviceOrder.findMany({
      where: userRole === 'admin' 
        ? {} // Admin vê todas
        : { OR: [{ requesterId: userId }, { targetId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { requester: true, target: true }
    });
    
    // Converter ordens de serviço em atividades
    const orderActivities = serviceOrders.map((order: any) => ({
      id: `so-${order.id}`,
      action: `Nova ordem de serviço: ${order.title}`,
      details: `${order.requester.name} criou uma ordem para ${order.target.name}`,
      date: order.createdAt.toISOString(),
      type: 'service_order'
    }));
    
    activities = [...activities, ...orderActivities];
    
    // Buscar ordens de serviço de porta recentes
    const portOrders = await prisma.portServiceOrder.findMany({
      where: userRole === 'admin' 
        ? {} // Admin vê todas
        : { OR: [{ requesterId: userId }, { ownerId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { requester: true, owner: true, port: { include: { cto: true } } }
    });
    
    // Converter ordens de porta em atividades
    const portOrderActivities = portOrders.map((order: any) => ({
      id: `po-${order.id}`,
      action: `Nova solicitação de porta`,
      details: `${order.requester.name} solicitou aluguel de porta na CTO ${order.port.cto.name}`,
      date: order.createdAt.toISOString(),
      type: 'port_order'
    }));
    
    activities = [...activities, ...portOrderActivities];
    
    // Ordenar todas as atividades por data (mais recentes primeiro)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Limitar ao número solicitado
    activities = activities.slice(0, limit);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error('Erro ao obter atividades do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter atividades do dashboard.' });
  }
};

// Obter ações rápidas para o dashboard
export const getDashboardQuickActions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    let quickActions: any[] = [];
    
    // Ações diferentes dependendo do papel do usuário
    if (userRole === 'admin') {
      quickActions = [
        {
          id: '1',
          title: 'Adicionar Usuário',
          icon: 'user-plus'
        },
        {
          id: '2',
          title: 'Ver Relatórios',
          icon: 'chart-bar'
        },
        {
          id: '3',
          title: 'Gerenciar CTOs',
          icon: 'server'
        },
        {
          id: '4',
          title: 'Configurações',
          icon: 'cog'
        }
      ];
    } else if (userRole === 'operator_admin' || userRole === 'operator_user') {
      quickActions = [
        {
          id: '1',
          title: 'Adicionar CTO',
          icon: 'plus-circle'
        },
        {
          id: '2',
          title: 'Gerenciar Portas',
          icon: 'plug'
        },
        {
          id: '3',
          title: 'Ver Solicitações',
          icon: 'clipboard-list'
        },
        {
          id: '4',
          title: 'Suporte',
          icon: 'headset'
        }
      ];
    } else {
      quickActions = [
        {
          id: '1',
          title: 'Buscar Portas',
          icon: 'search'
        },
        {
          id: '2',
          title: 'Minhas Portas',
          icon: 'plug'
        },
        {
          id: '3',
          title: 'Suporte',
          icon: 'headset'
        },
        {
          id: '4',
          title: 'Pagamentos',
          icon: 'credit-card'
        }
      ];
    }
    
    res.status(200).json(quickActions);
  } catch (error) {
    console.error('Erro ao obter ações rápidas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter ações rápidas do dashboard.' });
  }
};

// Obter resumo para o dashboard
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Resumo diferente dependendo do papel do usuário
    if (userRole === 'operator_admin' || userRole === 'operator_user') {
      // Para operadores, mostrar resumo de receitas
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { operator: true }
      });
      
      if (!user?.operator) {
        return res.status(404).json({ message: 'Operador não encontrado para este usuário.' });
      }
      
      const operatorId = user.operator.id;
      
      const portOrders = await prisma.portServiceOrder.findMany({
        where: {
          port: { cto: { operatorId } },
          status: 'completed'
        }
      });
      
      const totalRevenue = portOrders.reduce((sum: number, order: any) => sum + order.price, 0);
      const installationRevenue = portOrders.reduce((sum: number, order: any) => sum + order.installationFee, 0);
      
      const summary = {
        totalRented: portOrders.length.toString(),
        totalReceived: `R$ ${totalRevenue.toFixed(2)}`,
        periodBalance: `R$ ${(totalRevenue + installationRevenue).toFixed(2)}`
      };
      
      res.status(200).json(summary);
    } else {
      // Para clientes, mostrar resumo de gastos
      const portOrders = await prisma.portServiceOrder.findMany({
        where: {
          requesterId: userId,
          status: 'completed'
        }
      });
      
      const totalSpent = portOrders.reduce((sum: number, order: any) => sum + order.price, 0);
      const installationSpent = portOrders.reduce((sum: number, order: any) => sum + order.installationFee, 0);
      
      const summary = {
        totalRented: portOrders.length.toString(),
        totalSpent: `R$ ${totalSpent.toFixed(2)}`,
        periodBalance: `R$ ${(totalSpent + installationSpent).toFixed(2)}`
      };
      
      res.status(200).json(summary);
    }
  } catch (error) {
    console.error('Erro ao obter resumo do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter resumo do dashboard.' });
  }
};
