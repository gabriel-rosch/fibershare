"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/authContext"
import { Eye, EyeOff, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function FirstAccessPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Redirecionar se o usuário não estiver logado ou não for primeiro acesso
  useEffect(() => {
    if (!isLoading && (!user || !user.isFirstAccess)) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Avaliar a força da senha
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Comprimento mínimo
    if (newPassword.length >= 8) strength += 1
    // Letras maiúsculas e minúsculas
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength += 1
    // Números
    if (/[0-9]/.test(newPassword)) strength += 1
    // Caracteres especiais
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength += 1

    setPasswordStrength(strength)
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    // Validar as senhas
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength < 3) {
      toast({
        title: "Erro",
        description: "A senha não é forte o suficiente",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/first-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao atualizar a senha")
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      })

      // Atualizar o estado do usuário e redirecionar
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar a senha",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Primeiro Acesso</CardTitle>
            <CardDescription className="text-center">Por favor, defina uma nova senha para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Indicador de força da senha */}
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= level
                            ? level <= 1
                              ? "bg-red-500"
                              : level <= 2
                                ? "bg-orange-500"
                                : level <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordStrength === 0 && "Digite uma senha"}
                    {passwordStrength === 1 && "Senha fraca"}
                    {passwordStrength === 2 && "Senha média"}
                    {passwordStrength === 3 && "Senha boa"}
                    {passwordStrength === 4 && "Senha forte"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Confirme sua nova senha"
                  />
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500">As senhas não coincidem</p>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Sua senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas, números e
                  caracteres especiais.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processando...
                </>
              ) : (
                "Definir Nova Senha"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
