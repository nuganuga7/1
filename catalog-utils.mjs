export const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
export function matchesProduct(product, query) {
  return normalize(product.name + ' ' + product.description).includes(normalize(query));
}
export function parseSaleEnd(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) return NaN;
  const ms = Date.parse(value.replace(' ', 'T') + ':00+09:00');
  if (!Number.isFinite(ms)) return NaN;
  const roundTrip = new Date(ms + 9 * 3600000).toISOString().slice(0,16).replace('T', ' ');
  return roundTrip === value ? ms : NaN;
}
export function countdownText(end, now) {
  if (!Number.isFinite(end)) return '시간 미설정';
  const total = Math.max(0, Math.ceil((end - now) / 1000));
  if (!total) return '종료';
  return [Math.floor(total / 3600), Math.floor(total % 3600 / 60), total % 60].map(n => String(n).padStart(2, '0')).join(':');
}
export function safeOrderUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function safeImageUrl(value, base) {
  if (!value || typeof value !== 'string') return '';
  try { const u = new URL(value, base); return u.protocol === 'https:' || (u.origin === new URL(base).origin && u.protocol === 'http:') ? u.href : ''; } catch { return ''; }
}
export function validCatalog(value) {
  return Array.isArray(value) && value.every(p => p && typeof p.name === 'string' && typeof p.price === 'string' && typeof p.description === 'string' && ['selling','soldout','hidden'].includes(p.status));
}
