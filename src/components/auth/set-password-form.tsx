'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { authClient } from '@/lib/auth/auth-client'

const formSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof formSchema>

export function SetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: FormValues) {
    if (!token) {
      toast.error('Token não fornecido')
      return
    }

    setIsLoading(true)

    try {
      // Usar o Better Auth para redefinir a senha
      const { error } = await authClient.resetPassword({
        token,
        newPassword: data.password,
      })

      if (error) {
        throw new Error(error.message || 'Erro ao redefinir senha')
      }

      toast.success('Senha redefinida com sucesso!')
      
      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao redefinir senha')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-center">
        <Link href="/" className="inline-block">
          <Image 
            src="/images/system/logo_transparent.png" 
            alt="Kadernim Logo" 
            width={150} 
            height={50} 
            className="transition-opacity hover:opacity-90"
            priority
          />
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Definir Senha'}
        </Button>
      </form>
    </Form>
    </>
  )
}
