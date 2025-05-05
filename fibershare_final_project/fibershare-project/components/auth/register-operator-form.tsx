"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function RegisterOperatorForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const operatorName = formData.get("operatorName") as string
    const operatorEmail = formData.get("operatorEmail") as string
    const adminName = formData.get("adminName") as string
    const adminEmail = formData.get("adminEmail") as string
    const adminPassword = formData.get("adminPassword") as string

    try {
      // TODO: Implement API call to backend endpoint for registration
      console.log("Form Data:", {
        operatorName,
        operatorEmail,
        adminName,
        adminEmail,
        adminPassword,
      })

      // Simulating API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Placeholder for success handling - In reality, this would likely redirect
      // to Stripe checkout or a confirmation page after backend processing.
      toast({
        title: "Pré-cadastro realizado!",
        description: "Você será redirecionado para o pagamento.",
      })

      // Placeholder: Redirect to a dummy payment page or dashboard after successful registration
      // router.push('/payment'); // Example redirect

    } catch (error) {
      console.error("Erro no cadastro:", error)
      setError(error instanceof Error ? error.message : "Erro ao cadastrar operadora")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Cadastrar Nova Operadora</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para registrar sua operadora e criar o usuário administrador.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Operator Details */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold">Dados da Operadora</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="operatorName">Nome da Operadora</Label>
                <Input
                  id="operatorName"
                  name="operatorName"
                  placeholder="Nome Fantasia da Operadora"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatorEmail">Email da Operadora</Label>
                <Input
                  id="operatorEmail"
                  name="operatorEmail"
                  type="email"
                  placeholder="contato@operadora.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Admin User Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados do Administrador</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminName">Nome do Administrador</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  placeholder="Seu nome completo"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  placeholder="admin@operadora.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do Administrador</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={8} // Example: Enforce minimum password length
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar e ir para Pagamento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

