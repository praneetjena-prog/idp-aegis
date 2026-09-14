/**
 * Application error reporting utility.
 */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.error('[Aegis Error]', error, context);
  }
}
