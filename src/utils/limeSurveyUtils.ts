export function extractCurrentLimeDomain(): string {
  const hostnameParts = window.location.hostname.split('.');
  return hostnameParts.slice(1).join('.')
    ? `https://lime.${hostnameParts.slice(1).join('.')}/admin/`
    : 'https://lime.platform-test.umm.redlink.io/admin';
}
