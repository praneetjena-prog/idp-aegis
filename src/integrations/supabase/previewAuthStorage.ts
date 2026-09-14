export function brokeredPreviewStorage() {
  return typeof window !== 'undefined' ? window.localStorage : undefined;
}
