"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function DevLoginButton() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(false)

  const handleDevLogin = async () => {
    setIsLoading(true)
    try {
      // Buscar o usuário de desenvolvimento (FiberShare)
      const { data: operators, error } = await supabase
        .from("operators")
        .select("*")
        .eq("email", "admin@fibershare.com")
        .limit(1)

      if (error) {
        console.error("Erro ao buscar usuário de desenvolvimento:", error)
        throw new Error("Erro ao buscar usuário de desenvolvimento. Verifique os logs.")
      }

      if (!operators || operators.length === 0) {
        throw new Error("Usuário de desenvolvimento não encontrado. Execute o script de seed primeiro.")
      }

      // Usar o primeiro operador encontrado
      const operator = operators[0]

      // Definir o usuário no estado global
      setUser({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        role: operator.role,
        avatar_url: operator.avatar_url,
        isDevelopmentUser: true,
      })

      toast({
        title: "Login de desenvolvimento",
        description: "Você entrou como administrador no modo de desenvolvimento.",
      })

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro no login de desenvolvedor:", error)
      toast({
        title: "Erro no login",
        description: error.message || "Erro no login de desenvolvedor. Verifique se o script de seed foi executado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDevLogin}
      disabled={isLoading}
      className="w-full mt-4 border-dashed border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 dark:text-yellow-400"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Entrando...
        </>
      ) : (
        "Login de Desenvolvimento (apenas DEV)"
      )}
    </Button>
  )
}
