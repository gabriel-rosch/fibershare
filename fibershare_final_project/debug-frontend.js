// Script para debug do frontend
// Execute no console do navegador (F12)

console.log('🔍 INICIANDO DEBUG DO FRONTEND');

// 1. Verificar se a página carregou
console.log('1. Verificando elementos da página...');
const form = document.querySelector('form');
const submitButton = document.querySelector('[type="submit"]');
const tabs = document.querySelectorAll('[role="tab"]');

console.log('📋 Elementos encontrados:', {
  form: !!form,
  submitButton: !!submitButton,
  tabs: tabs.length,
  submitButtonText: submitButton?.textContent,
  submitButtonDisabled: submitButton?.disabled
});

// 2. Verificar se os planos carregaram
console.log('2. Verificando planos...');
fetch('/api/subscription-plans')
  .then(res => res.json())
  .then(plans => {
    console.log('📊 Planos carregados:', plans.length);
    plans.forEach((plan, i) => {
      console.log(`   ${i+1}. ${plan.name} - R$ ${plan.price}`);
    });
  })
  .catch(err => console.error('❌ Erro ao buscar planos:', err));

// 3. Simular preenchimento dos campos (execute após carregar a página)
function preencherFormulario() {
  console.log('3. Preenchendo formulário de teste...');
  
  // Dados de teste
  const testData = {
    operatorName: 'Teste Debug Operadora',
    operatorEmail: 'debug@operadora.com',
    region: 'Sul',
    description: 'Operadora de teste para debug do sistema',
    contactEmail: 'contato@debug.com',
    contactPhone: '(48) 99999-9999',
    adminName: 'Admin Debug',
    adminEmail: 'admin@debug.com',
    adminPassword: 'senha123456'
  };
  
  // Preencher campos
  Object.entries(testData).forEach(([name, value]) => {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Campo ${name} preenchido`);
    } else {
      console.log(`❌ Campo ${name} não encontrado`);
    }
  });
  
  console.log('📝 Formulário preenchido! Agora teste a navegação entre abas.');
}

// 4. Verificar estado do formulário
function verificarEstadoFormulario() {
  console.log('4. Verificando estado do formulário...');
  
  const inputs = document.querySelectorAll('input, textarea');
  const filledInputs = Array.from(inputs).filter(input => input.value.trim().length > 0);
  
  console.log('📊 Estado dos campos:', {
    totalInputs: inputs.length,
    filledInputs: filledInputs.length,
    emptyInputs: inputs.length - filledInputs.length
  });
  
  // Verificar se há erros de validação
  const errorMessages = document.querySelectorAll('[data-slot="error-message"]');
  console.log('⚠️ Mensagens de erro encontradas:', errorMessages.length);
  
  return {
    filled: filledInputs.length,
    total: inputs.length,
    errors: errorMessages.length
  };
}

console.log('🎯 Comandos disponíveis:');
console.log('  - preencherFormulario() - Preenche dados de teste');
console.log('  - verificarEstadoFormulario() - Verifica estado atual');

// Disponibilizar funções globalmente
window.preencherFormulario = preencherFormulario;
window.verificarEstadoFormulario = verificarEstadoFormulario; 