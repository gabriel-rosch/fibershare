getPortsByCTOId: async (ctoId: string) => {
  try {
    const response = await api.get(`/ctos/${ctoId}/ports`);
    
    // Verificar se response.data tem a estrutura esperada
    const ports = response.data.ports || [];
    const ctoInfo = response.data.cto || {};
    
    return {
      ports: ports,
      ctoInfo: ctoInfo,
      occupiedCount: ports.filter((port: any) => port.status === 'occupied').length
    };
  } catch (error) {
    console.error('Erro ao buscar portas da CTO:', error);
    return { ports: [], ctoInfo: {}, occupiedCount: 0 };
  }
}, 