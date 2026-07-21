import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail-Adresse eingeben.'),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
})

export const loginSchema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail-Adresse eingeben.'),
  password: z.string().min(1, 'Bitte ein Passwort eingeben.'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
