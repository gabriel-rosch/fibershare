"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { DevLoginButton } from "@/components/dev-login-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Define the form schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
})

// Define the form values type
type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const { t } = useTranslations()
  const router = useRouter()
  const { signIn, isLoading, error, user } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development"

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      if (user.isFirstAccess) {
        router.push("/first-access")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await signIn(values.email, values.password)
      // O redirecionamento será feito pelo useEffect acima
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Erro",
        description: "Falha ao fazer login. Verifique suas credenciais.",
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
            <CardTitle className="text-2xl font-bold tracking-tight">{t("auth", "loginTitle")}</CardTitle>
            <CardDescription>{t("auth", "loginSubtitle")}</CardDescription>
            {isDevelopment && (
              <div className="mt-2 rounded-md bg-yellow-100 p-2 text-center text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Ambiente de desenvolvimento detectado. Use o botão de login de desenvolvimento abaixo.
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive">{error}</div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common", "email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          {...field}
                          disabled={isLoading}
                          className="input-new-york"
                        />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("common", "password")}</FormLabel>
                        <Button variant="link" className="h-auto p-0 text-xs" type="button">
                          {t("common", "forgotPassword")}
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          className="input-new-york"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">{t("common", "rememberMe")}</FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? t("common", "loading") : t("common", "signIn")}
                </Button>
              </form>
            </Form>

            {isDevelopment && <DevLoginButton />}
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
