const loadPorts = async () => {
  setLoading(true);
  try {
    const result = await ctoPortService.getPortsByCTOId(ctoId);
    setPorts(result.ports);
    setCtoInfo(result.ctoInfo);
    setOccupiedCount(result.occupiedCount);
  } catch (error) {
    console.error('Erro ao carregar portas:', error);
    toast.error('Não foi possível carregar as portas da CTO. Tente novamente mais tarde.');
  } finally {
    setLoading(false);
  }
}; 