/**
 * Application error reporting utility.
 */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Aegis Error]', error, context);
  }
}
