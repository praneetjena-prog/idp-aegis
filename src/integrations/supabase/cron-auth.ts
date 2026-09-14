import { timingSafeEqual } from 'node:crypto'

export function verifyCronRequest(authHeader: string | null | undefined): boolean {
  if (!authHeader) return false
  const currentSecret = process.env['CRON_SECRET']
  const previousSecret = process.env['CRON_SECRET_PREVIOUS']
  const secrets = [currentSecret, previousSecret].filter(Boolean) as string[]
  if (secrets.length === 0) return false

  return secrets.some((secret) => {
    const expected = `Bearer ${secret}`
    if (authHeader.length !== expected.length) return false
    try {
      return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
    } catch {
      return false
    }
  })
}
