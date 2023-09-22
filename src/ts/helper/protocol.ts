export function is_secure_connection(): boolean {
  return window.location.protocol === 'https:';
}
