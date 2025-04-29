"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Search, Copy } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggeredTableRows } from "@/components/animations/staggered-table-rows"
import { AnimatedButton } from "@/components/animations/animated-button"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { ApiService, type User, type CreateUserData } from "@/lib/services/api-service"
import { useAuthStore, type UserRole } from "@/lib/store/auth-store"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

export default function UsersPage() {
  const { t } = useTranslations()
  const { user: authUser } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    email: "",
    role: "viewer",
    status: "active",
  })
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  // Estados para gerenciar os dados, carregamento e erros
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Função para buscar usuários
  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ApiService.getUsers(debouncedSearch, roleFilter)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Efeito para buscar usuários quando os filtros mudarem
  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch, roleFilter])

  // Função para criar um novo usuário
  const handleCreateUser = async () => {
    try {
      const response = await ApiService.createUser({
        ...newUser,
        operatorId: authUser?.operatorId,
      })

      // Se a resposta incluir uma senha temporária, armazená-la
      if (response.tempPassword) {
        setTempPassword(response.tempPassword)
      } else {
        setIsCreateDialogOpen(false)
        setNewUser({
          name: "",
          email: "",
          role: "viewer",
          status: "active",
        })
        toast({
          title: "Usuário criado",
          description: "O usuário foi criado com sucesso.",
        })
        fetchUsers()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      })
    }
  }

  // Função para copiar a senha temporária para a área de transferência
  const copyTempPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      toast({
        title: "Senha copiada",
        description: "A senha temporária foi copiada para a área de transferência.",
      })
    }
  }

  // Função para fechar o diálogo de senha temporária
  const closeTempPasswordDialog = () => {
    setTempPassword(null)
    setIsCreateDialogOpen(false)
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
      status: "active",
    })
    fetchUsers()
  }

  // Função para editar um usuário existente
  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      await ApiService.updateUser(selectedUser.id, selectedUser)
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      })
    }
  }

  // Função para excluir um usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await ApiService.deleteUser(selectedUser.id)
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Funcionários</h1>
          <AnimatedButton
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </AnimatedButton>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("common", "search")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("users", "userRole")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="admin">{t("users", "admin")}</SelectItem>
              <SelectItem value="manager">{t("users", "manager")}</SelectItem>
              <SelectItem value="technician">{t("users", "technician")}</SelectItem>
              <SelectItem value="viewer">{t("users", "viewer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t("users", "userName")}</TableHead>
                <TableHead>{t("users", "userEmail")}</TableHead>
                <TableHead>{t("users", "userRole")}</TableHead>
                <TableHead>{t("users", "userStatus")}</TableHead>
                <TableHead>Primeiro Acesso</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            ) : error ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    Erro ao carregar usuários. Por favor, tente novamente.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : users.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("common", "noData")}
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <StaggeredTableRows>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{t("users", user.role)}</TableCell>
                    <TableCell>
                      <motion.span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {t("users", user.status)}
                      </motion.span>
                    </TableCell>
                    <TableCell>
                      {user.isFirstAccess ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Pendente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Completo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            {t("common", "edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            {t("common", "delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </StaggeredTableRows>
            )}
          </Table>
        </div>
      </FadeIn>

      {/* Create User Dialog */}
      <AnimatePresence>
        {isCreateDialogOpen && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Funcionário</DialogTitle>
                <DialogDescription>
                  Adicione um novo funcionário à sua operadora. Uma senha temporária será gerada para o primeiro acesso.
                </DialogDescription>
              </DialogHeader>
              <motion.div
                className="space-y-4 py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <label htmlFor="name">Nome Completo</label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role">Função</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status">Status</label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value) => setNewUser({ ...newUser, status: value as "active" | "inactive" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t("common", "cancel")}
                </Button>
                <AnimatedButton
                  onClick={handleCreateUser}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium"
                >
                  {t("common", "create")}
                </AnimatedButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Temporary Password Dialog */}
      <AnimatePresence>
        {tempPassword && (
          <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Funcionário Adicionado</DialogTitle>
                <DialogDescription>
                  O funcionário foi adicionado com sucesso. Compartilhe a senha temporária abaixo com o funcionário para
                  que ele possa fazer o primeiro acesso.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="tempPassword">Senha Temporária</label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tempPassword"
                      type={showTempPassword ? "text" : "password"}
                      value={tempPassword}
                      readOnly
                      className="font-mono"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={copyTempPassword}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar senha</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="showPassword"
                      checked={showTempPassword}
                      onCheckedChange={() => setShowTempPassword(!showTempPassword)}
                    />
                    <label htmlFor="showPassword" className="text-sm">
                      Mostrar senha
                    </label>
                  </div>
                </div>
                <div className="rounded-md bg-yellow-100 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <p>
                    <strong>Importante:</strong> Esta senha só será exibida uma vez. Certifique-se de copiá-la ou
                    anotá-la antes de fechar esta janela.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={closeTempPasswordDialog}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Edit User Dialog */}
      <AnimatePresence>
        {isEditDialogOpen && selectedUser && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Funcionário</DialogTitle>
                <DialogDescription>Edite as informações do funcionário.</DialogDescription>
              </DialogHeader>
              <motion.div
                className="space-y-4 py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <label htmlFor="edit-name">Nome</label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-email">Email</label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-role">Função</label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status">Status</label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, status: value as "active" | "inactive" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-first-access">Primeiro Acesso</label>
                  <Select
                    value={selectedUser.isFirstAccess ? "true" : "false"}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, isFirstAccess: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Pendente</SelectItem>
                      <SelectItem value="false">Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t("common", "cancel")}
                </Button>
                <AnimatedButton
                  onClick={handleEditUser}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium"
                >
                  {t("common", "save")}
                </AnimatedButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Delete User Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Funcionário</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  {t("common", "cancel")}
                </Button>
                <AnimatedButton variant="destructive" onClick={handleDeleteUser}>
                  {t("common", "delete")}
                </AnimatedButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
