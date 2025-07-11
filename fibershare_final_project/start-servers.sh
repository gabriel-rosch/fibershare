#!/bin/bash

echo "🚀 Iniciando servidores FiberShare..."

# Função para limpar processos ao sair
cleanup() {
    echo -e "\n🛑 Parando servidores..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "🔧 Iniciando backend na porta 3001..."
cd fibershare-backend
npm run dev &
BACKEND_PID=$!

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend na porta 3000..."
cd ../fibershare-project
npm run dev &
FRONTEND_PID=$!

echo -e "\n✅ Servidores iniciados!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📝 Registro de Operadora: http://localhost:3000/register-operator/new"
echo -e "\n💡 Para parar os servidores, pressione Ctrl+C"

# Aguardar indefinidamente
wait 