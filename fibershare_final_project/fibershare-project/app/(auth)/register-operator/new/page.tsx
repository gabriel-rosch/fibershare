"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Building, CreditCard, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Schema de validação
const formSchema = z.object({
  // Dados da operadora
  operatorName: z.string().min(3, { message: "Nome da operadora deve ter pelo menos 3 caracteres" }),
  operatorEmail: z.string().email({ message: "Email inválido" }),
  region: z.string().min(2, { message: "Região é obrigatória" }),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  contactEmail: z.string().email({ message: "Email de contato inválido" }),
  contactPhone: z.string().min(10, { message: "Telefone de contato inválido" }),
  
  // Dados do administrador
  adminName: z.string().min(3, { message: "Nome do administrador deve ter pelo menos 3 caracteres" }),
  adminEmail: z.string().email({ message: "Email inválido" }),
  adminPassword: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
  
  // Plano selecionado
  stripePriceId: z.string().min(1, { message: "Selecione um plano" }),
});

// Interface para os planos de assinatura
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  stripePriceId: string;
  price: number;
  currency: string;
  interval: string;
  portsCapacity: number;
}

export default function NewOperatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState("operator");

  // Buscar planos de assinatura
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/subscription-plans');
        if (!response.ok) throw new Error('Falha ao buscar planos');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os planos de assinatura.",
        });
        // Planos de exemplo para desenvolvimento
        setPlans([
          {
            id: "1",
            name: "Plano Básico",
            description: "Ideal para pequenas operadoras",
            stripePriceId: "price_1234",
            price: 99.90,
            currency: "BRL",
            interval: "month",
            portsCapacity: 100
          },
          {
            id: "2",
            name: "Plano Profissional",
            description: "Para operadoras em crescimento",
            stripePriceId: "price_5678",
            price: 199.90,
            currency: "BRL",
            interval: "month",
            portsCapacity: 500
          },
          {
            id: "3",
            name: "Plano Enterprise",
            description: "Para grandes operadoras",
            stripePriceId: "price_9012",
            price: 499.90,
            currency: "BRL",
            interval: "month",
            portsCapacity: 2000
          }
        ]);
      }
    }
    
    fetchPlans();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorName: "",
      operatorEmail: "",
      region: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      stripePriceId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('🚀 onSubmit chamado!', { 
      operatorName: values.operatorName,
      adminEmail: values.adminEmail,
      stripePriceId: values.stripePriceId 
    });
    
    setIsLoading(true);
    try {
      console.log('📤 Enviando dados completos:', values);
      
      const response = await fetch('/api/auth/register-operator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar operadora');
      }

      console.log('✅ Resposta recebida:', data);

      // Se tiver URL de checkout (modo produção), redirecionar para o Stripe
      if (data.checkoutUrl) {
        toast({
          title: "Redirecionando...",
          description: "Você será redirecionado para o pagamento.",
        });
        window.location.href = data.checkoutUrl;
        return;
      }

      // Se for modo de desenvolvimento ou sucesso direto
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message || "Operadora registrada com sucesso!",
        });
        
        // Redirecionar conforme indicado pela API
        if (data.redirectTo) {
          router.push(data.redirectTo);
        } else {
          router.push('/login');
        }
        return;
      }

      // Fallback para sucesso sem dados específicos
      toast({
        title: "Sucesso!",
        description: "Operadora registrada com sucesso.",
      });
      
      router.push('/login');
    } catch (error: any) {
      console.error('❌ Erro ao registrar operadora:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao registrar a operadora.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Função para avançar para a próxima aba
  const nextTab = async () => {
    if (activeTab === "operator") {
      // Validar campos da operadora antes de avançar
      const operatorFields = ["operatorName", "operatorEmail", "region", "description", "contactEmail", "contactPhone"] as const;
      const isValid = await form.trigger(operatorFields);
      
      console.log('🔍 Validação aba operadora:', isValid);
      
      if (isValid) {
        setActiveTab("admin");
      }
    } else if (activeTab === "admin") {
      // Validar campos do admin antes de avançar
      const adminFields = ["adminName", "adminEmail", "adminPassword"] as const;
      const isValid = await form.trigger(adminFields);
      
      console.log('🔍 Validação aba admin:', isValid);
      
      if (isValid) {
        setActiveTab("plan");
      }
    }
  };

  // Função para voltar para a aba anterior
  const prevTab = () => {
    if (activeTab === "admin") {
      setActiveTab("operator");
    } else if (activeTab === "plan") {
      setActiveTab("admin");
    }
  };

  // Função para verificar se pode submeter
  const canSubmit = () => {
    const values = form.getValues();
    
    // Verificar campos obrigatórios
    const requiredFields = {
      operatorName: values.operatorName,
      operatorEmail: values.operatorEmail,
      region: values.region,
      description: values.description,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      adminName: values.adminName,
      adminEmail: values.adminEmail,
      adminPassword: values.adminPassword,
      stripePriceId: values.stripePriceId
    };
    
    const emptyFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim().length === 0)
      .map(([field, _]) => field);
    
    const allFieldsFilled = emptyFields.length === 0;
    const isOnPlanTab = activeTab === "plan";
    const notLoading = !isLoading;
    
    const canSubmitNow = allFieldsFilled && isOnPlanTab && notLoading;
    
    console.log('🔍 Debug submit:', {
      canSubmit: canSubmitNow,
      allFieldsFilled,
      isOnPlanTab,
      notLoading,
      activeTab,
      emptyFields,
      totalFields: Object.keys(requiredFields).length,
      filledFields: Object.keys(requiredFields).length - emptyFields.length
    });
    
    return canSubmitNow;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/register-operator')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="ml-2">Voltar</span>
          </div>
          <CardTitle className="text-2xl font-bold">Registrar Nova Operadora</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua operadora e escolher um plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="operator">Operadora</TabsTrigger>
                  <TabsTrigger value="admin">Administrador</TabsTrigger>
                  <TabsTrigger value="plan">Plano</TabsTrigger>
                </TabsList>
                
                {/* Aba de dados da operadora */}
                <TabsContent value="operator" className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Dados da Operadora</h3>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="operatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Operadora</FormLabel>
                          <FormControl>
                            <Input placeholder="Fibra Rápida Ltda." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="operatorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email da Operadora</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@fibrarapida.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Região de Atuação</FormLabel>
                        <FormControl>
                          <Input placeholder="Sul, Sudeste, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva brevemente sua operadora..." 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="suporte@fibrarapida.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone de Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Aba de dados do administrador */}
                <TabsContent value="admin" className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Dados do Administrador</h3>
                  </div>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="adminName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@exemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este será seu email de login no sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mínimo de 8 caracteres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Aba de seleção de plano */}
                <TabsContent value="plan" className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Escolha seu Plano</h3>
                  </div>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="stripePriceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                            className="space-y-4"
                          >
                            {plans.map((plan) => (
                              <div key={plan.id} className="flex items-start space-x-2">
                                <RadioGroupItem value={plan.stripePriceId} id={plan.id} className="mt-1" />
                                <div className="grid gap-1 w-full">
                                  <label
                                    htmlFor={plan.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    <div className="flex justify-between">
                                      <span>{plan.name}</span>
                                      <span className="font-bold">
                                        {new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: plan.currency
                                        }).format(plan.price)}
                                        /{plan.interval === 'month' ? 'mês' : 'ano'}
                                      </span>
                                    </div>
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    {plan.description}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Capacidade: até {plan.portsCapacity} portas
                                  </div>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!canSubmit()}
                      onClick={async (e) => {
                        e.preventDefault();
                        console.log('🔥 Botão clicado!', {
                          canSubmit: canSubmit(),
                          isLoading,
                          activeTab,
                          formValues: form.getValues()
                        });
                        
                        // Forçar validação completa antes de submeter
                        const isValid = await form.trigger();
                        console.log('🔍 Validação completa:', isValid);
                        
                        if (isValid && canSubmit()) {
                          console.log('🚀 Executando submit manualmente...');
                          const values = form.getValues();
                          await onSubmit(values);
                        } else {
                          console.log('❌ Validação falhou ou botão não pode submeter');
                          const errors = form.formState.errors;
                          console.log('🔍 Erros de validação:', errors);
                        }
                      }}
                    >
                      {isLoading ? "Processando..." : "Finalizar e Pagar"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Ao registrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </CardFooter>
      </Card>
    </div>
  )
} 