"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, User } from "lucide-react"

export default function RegisterOperatorPage() {
  const router = useRouter()

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/login')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="ml-2">Voltar para login</span>
          </div>
          <CardTitle className="text-2xl font-bold">Registro de Operadora</CardTitle>
          <CardDescription>
            Escolha uma das opções abaixo para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-2 hover:border-primary cursor-pointer" onClick={() => router.push('/register-operator/new')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Nova Operadora</CardTitle>
              </div>
              <CardDescription>
                Crie uma nova operadora e torne-se administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Crie sua própria operadora de fibra óptica</li>
                <li>Escolha um plano de assinatura</li>
                <li>Gerencie sua infraestrutura e equipe</li>
                <li>Compartilhe e monetize sua rede</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Criar Nova Operadora</Button>
            </CardFooter>
          </Card>

          <Card className="border-2 hover:border-primary cursor-pointer" onClick={() => router.push('/register')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Usuário de Operadora Existente</CardTitle>
              </div>
              <CardDescription>
                Registre-se como usuário de uma operadora já cadastrada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Junte-se a uma operadora existente</li>
                <li>Acesse as funcionalidades conforme seu perfil</li>
                <li>Colabore com sua equipe</li>
                <li>Sem necessidade de assinatura individual</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">Registrar como Usuário</Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
} 