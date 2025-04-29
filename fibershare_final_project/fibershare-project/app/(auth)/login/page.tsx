"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
// import { useAuthStore } from "@/lib/store/auth-store"; // Remover import antigo
import { useAuth } from "@/lib/authContext"; // Importar o novo hook useAuth
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the form schema
const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  rememberMe: z.boolean(),
})

// Define the form values type
type FormData = z.infer<typeof formSchema>

// No topo do arquivo, adicionar o schema de registro
const registerFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
  role: z.enum(["client", "operator_user"]),
  operatorId: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function LoginPage() {
  const { t } = useTranslations()
  const router = useRouter()
  const { login, isLoading, isAuthenticated, user } = useAuth(); // Usar o novo contexto
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null); // Estado para erro de login
  const { toast } = useToast()
  const [showRegister, setShowRegister] = useState(false)


  // Redirecionar se já estiver logado
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user }); // Debug
    
    if (isAuthenticated && user) {
      console.log('Redirecionando para dashboard...'); // Debug
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router])

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormData) => {
    setLoginError(null); // Limpar erro anterior
    try {
      await login(values.email, values.password)
      // O redirecionamento será feito pelo useEffect acima
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      })
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Falha ao fazer login. Verifique suas credenciais.";
      setLoginError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/50">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggleSimple />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Image src="/images/logo.png" alt="FIBERSHARE Logo" width={240} height={80} className="mb-4" />
        </div>

        <Card className="card-new-york border-none shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {showRegister ? "Criar Conta" : t("auth", "loginTitle")}
            </CardTitle>
            <CardDescription>
              {showRegister ? "Preencha os dados para se registrar" : t("auth", "loginSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRegister ? (
              <RegisterForm onCancel={() => setShowRegister(false)} />
            ) : (
              <LoginForm onRegisterClick={() => setShowRegister(true)} />
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="mt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">FIBERSHARE GIS Solution</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Componente do formulário de login
function LoginForm({ onRegisterClick }: { onRegisterClick: () => void }) {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (values: FormData) => {
    setLoginError(null)
    try {
      await login(values.email, values.password)
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
        variant: "default",
      })
      
      // Redirecionar explicitamente
      router.push('/dashboard')
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Falha ao fazer login"
      setLoginError(errorMessage)
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })

      // Limpar o campo de senha em caso de erro
      form.setValue('password', '')
      // Focar no campo com erro
      if (errorMessage.toLowerCase().includes('email')) {
        form.setFocus('email')
      } else {
        form.setFocus('password')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {loginError && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive">
            {loginError}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type={showPassword ? "text" : "password"} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0" onClick={onRegisterClick}>
              Registre-se
            </Button>
          </span>
        </div>
      </form>
    </Form>
  )
}

// Componente do formulário de registro
function RegisterForm({ onCancel }: { onCancel: () => void }) {
  const { register, isLoading } = useAuth()
  const { toast } = useToast()
  const [operators, setOperators] = useState([])
  const [loadingOperators, setLoadingOperators] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "client",
    },
  })

  useEffect(() => {
    const fetchOperators = async () => {
      setLoadingOperators(true)
      try {
        const response = await fetch('http://localhost:3001/api/operators')
        if (!response.ok) {
          throw new Error('Falha ao carregar operadoras')
        }
        const data = await response.json()
        setOperators(data)
      } catch (error) {
        console.error('Erro ao carregar operadoras:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de operadoras",
          variant: "destructive",
        })
      } finally {
        setLoadingOperators(false)
      }
    }

    fetchOperators()
  }, [toast])

  const onSubmit = async (values: RegisterFormData) => {
    try {
      await register(values)
      
      // Feedback positivo com toast
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login com suas credenciais.",
        variant: "default",
        duration: 5000,
      })

      // Pequeno delay antes de mudar para o formulário de login
      setTimeout(() => {
        onCancel() // Voltar para o login
      }, 1000)

    } catch (error: any) {
      toast({
        title: "Erro no registro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input {...field} type="password" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="operator_user">Funcionário de Operadora</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("role") === "operator_user" && (
          <FormField
            control={form.control}
            name="operatorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operadora</FormLabel>
                <Select onValueChange={field.onChange} disabled={loadingOperators}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOperators ? "Carregando..." : "Selecione a operadora"} />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op: any) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar"}
        </Button>

        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Button variant="link" className="p-0" onClick={onCancel}>
              Fazer login
            </Button>
          </span>
        </div>
      </form>
    </Form>
  )
}

