"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Home, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function RegisterSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)

  useEffect(() => {
    const opId = searchParams.get('operatorId')
    const devMode = searchParams.get('dev') === 'true'
    
    setOperatorId(opId)
    setIsDevelopmentMode(devMode)

    // Se não tiver operatorId, redirecionar
    if (!opId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Dados de registro não encontrados.",
      })
      router.push('/register-operator')
    }
  }, [searchParams, router, toast])

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Cadastro Realizado!
          </CardTitle>
          <CardDescription>
            {isDevelopmentMode 
              ? "Sua operadora foi registrada com sucesso em modo de desenvolvimento."
              : "Sua operadora foi registrada com sucesso!"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ID da Operadora: <span className="font-mono font-medium">{operatorId}</span>
            </p>
            
            {isDevelopmentMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Modo de Desenvolvimento:</strong> Você pode acessar o sistema imediatamente.
                  Em produção, seria necessário completar o pagamento.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-center">Próximos Passos:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Operadora criada</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Usuário administrador configurado</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Plano de assinatura selecionado</span>
              </div>
              {isDevelopmentMode && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Acesso liberado (modo dev)</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
              size="lg"
            >
              <User className="mr-2 h-4 w-4" />
              Fazer Login
            </Button>
            
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>

          {!isDevelopmentMode && (
            <div className="text-center text-xs text-muted-foreground">
              <p>
                Você receberá um email de confirmação em breve com mais detalhes 
                sobre sua assinatura e acesso ao sistema.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterSuccessContent />
    </Suspense>
  )
} 