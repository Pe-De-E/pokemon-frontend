import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterInput } from '@/schemas/auth'
import { apiFetch, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

function Register() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
      )
    }
  }

  return (
    <section id="center" className="mx-auto w-full max-w-sm px-4">
      <h1>Registrieren</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 text-left"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
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
          {isSubmitting ? 'Wird erstellt…' : 'Konto erstellen'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Schon registriert?{' '}
        <Link
          to="/login"
          className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0 align-baseline')}
        >
          Zum Login
        </Link>
      </p>
    </section>
  )
}

export default Register
