import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginInput } from '@/schemas/auth'
import { apiFetch, ApiError } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered
  )
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setToken(token)
      navigate('/')
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Login fehlgeschlagen. Bitte versuche es erneut.'
      )
    }
  }

  return (
    <section id="center" className="mx-auto w-full max-w-sm px-4">
      <h1>Login</h1>

      {justRegistered && (
        <p className="text-sm text-muted-foreground">
          Konto erstellt! Bitte melde dich jetzt an.
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 text-left"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Wird angemeldet…' : 'Anmelden'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Noch keinen Account?{' '}
        <Link
          to="/register"
          className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0 align-baseline')}
        >
          Jetzt registrieren
        </Link>
      </p>
    </section>
  )
}

export default Login
