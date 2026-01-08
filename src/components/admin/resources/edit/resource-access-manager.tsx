"use client"

import React, { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Users,
  Plus,
  Search,
  X,
  Calendar as CalendarIcon,
  ShieldCheck,
  Shield,
  Loader2,
  Clock
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, addMonths, addYears } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DeleteConfirmDialog } from "@/components/admin/crud/delete-confirm-dialog"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
}

interface AccessRecord {
  id: string
  userId: string
  resourceId: string
  user: {
    id: string
    name: string
    email: string
  }
  source: string | null
  grantedAt: string
  expiresAt: string | null
}

interface ResourceAccessManagerProps {
  resourceId: string
}

export function ResourceAccessManager({
  resourceId,
}: ResourceAccessManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch current access records
  const { data: accessListData, refetch: refetchAccessList } = useQuery({
    queryKey: ["resource-access", resourceId],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch access records")
      }
      return response.json() as Promise<{ accessList: AccessRecord[] }>
    },
  })

  // Search users
  const { data: usersData } = useQuery({
    queryKey: ["users-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return { users: [] }
      const response = await fetch(
        `/api/v1/admin/users/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (!response.ok) {
        throw new Error("Failed to search users")
      }
      return response.json() as Promise<{ users: User[] }>
    },
    enabled: searchQuery.length >= 2,
  })

  // Grant access mutation
  const grantMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            expiresAt: expiresAt || null,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to grant access")
      }

      return response.json()
    },
    onSuccess: () => {
      setSelectedUserId(null)
      setExpiresAt(undefined)
      setSearchQuery("")
      refetchAccessList()
    },
  })

  // Revoke access mutation
  const revokeMutation = useMutation({
    mutationFn: async (accessId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access/${accessId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to revoke access")
      }
    },
    onSuccess: () => {
      refetchAccessList()
    },
  })

  const handleGrantAccess = () => {
    if (selectedUserId) {
      grantMutation.mutate(selectedUserId)
    }
  }

  const handlePeriodSelect = (value: string) => {
    const now = new Date()
    switch (value) {
      case "1-month":
        setExpiresAt(addMonths(now, 1))
        break
      case "3-months":
        setExpiresAt(addMonths(now, 3))
        break
      case "6-months":
        setExpiresAt(addMonths(now, 6))
        break
      case "1-year":
        setExpiresAt(addYears(now, 1))
        break
      case "unlimited":
        setExpiresAt(undefined)
        break
    }
  }

  const selectedUser = (usersData?.users || []).find(
    (u) => u.id === selectedUserId
  )
  const accessList = accessListData?.accessList || []
  const filteredUsers = (usersData?.users || []).filter(
    (u) => !accessList.some((a) => a.userId === u.id)
  )

  return (
    <div className="space-y-8">
      {/* Search & Grant Section */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Conceder Novo Acesso
          </CardTitle>
          <CardDescription className="text-xs">
            Procure por um usuário e defina um período de expiração se necessário.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Buscar Usuário por Nome ou Email
                </label>
                <div className="relative">
                  <Input
                    placeholder="Ex: joao@email.com..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
                </div>

                {/* Suggestions Dropdown */}
                {searchQuery.length >= 2 && filteredUsers.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-w-xl bg-background border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto pt-2 pb-2">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setSearchQuery("")
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors border-b last:border-0 border-muted/30"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery.length >= 2 && filteredUsers.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-background border rounded-xl shadow-xl p-6 text-center animate-in fade-in slide-in-from-top-1">
                    <p className="text-sm text-muted-foreground">Nenhum usuário encontrado com este critério.</p>
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-left-2 transition-all">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <button
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 space-y-4">
              <div className="space-y-4 p-4 bg-muted/20 border border-muted-foreground/10 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Período de Acesso
                  </label>
                  <Select onValueChange={handlePeriodSelect}>
                    <SelectTrigger className="h-11 bg-background border-muted-foreground/20 focus:ring-primary">
                      <SelectValue placeholder="Escolha um período..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited" className="font-bold text-emerald-600">Acesso Vitalício</SelectItem>
                      <SelectItem value="1-month">1 Mês</SelectItem>
                      <SelectItem value="3-months">3 Meses</SelectItem>
                      <SelectItem value="6-months">6 Meses</SelectItem>
                      <SelectItem value="1-year">1 Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <CalendarIcon className="h-3 w-3" />
                    Expiração (Personalizada)
                  </label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-11 justify-start text-left font-medium bg-background border-muted-foreground/20 focus:ring-primary",
                            !expiresAt && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/50" />
                          {expiresAt ? format(expiresAt, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={expiresAt}
                          onSelect={setExpiresAt}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    {expiresAt && (
                      <button
                        onClick={() => setExpiresAt(undefined)}
                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGrantAccess}
                disabled={!selectedUserId || grantMutation.isPending}
                className="w-full h-11 font-bold shadow-md"
              >
                {grantMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Liberar Acesso
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold tracking-tight">Usuários Ativos ({accessList.length})</h3>
          </div>
        </div>

        {accessList.length === 0 ? (
          <div className="bg-background/40 border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum acesso manual concedido ainda.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Os acessos através de assinaturas automáticas não aparecem aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {accessList.map((access) => (
              <Card
                key={access.id}
                className="overflow-hidden border shadow-sm hover:border-primary/20 transition-all hover:shadow-md group"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {access.user.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{access.user.name}</p>
                      {access.source && (
                        <Badge variant="outline" className="h-5 text-[10px] bg-muted/30 border-none capitalize">
                          {access.source}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{access.user.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-tighter">Concedido em</span>
                      <span className="text-xs font-semibold">{new Date(access.grantedAt).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {access.expiresAt ? (
                      <div className="flex flex-col items-end px-3 border-l">
                        <span className="text-[10px] uppercase font-bold text-orange-500/60 tracking-tighter">Expira em</span>
                        <span className="text-xs font-bold text-orange-600 italic">
                          {new Date(access.expiresAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end px-3 border-l">
                        <span className="text-[10px] uppercase font-bold text-emerald-500/60 tracking-tighter">Validade</span>
                        <span className="text-xs font-bold text-emerald-600">Permanente</span>
                      </div>
                    )}
                  </div>

                  <div className="sm:ml-4 flex items-center justify-end">
                    <DeleteConfirmDialog
                      onConfirm={() => revokeMutation.mutate(access.id)}
                      isLoading={revokeMutation.isPending}
                      title="Revogar Acesso?"
                      description={`O usuário ${access.user.name} perderá imediatamente o acesso a este recurso.`}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={revokeMutation.isPending}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
