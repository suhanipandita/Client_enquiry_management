// 'YYYY-MM-DD' (or an ISO string) -> local Date at midnight, built from its parts so nothing shifts
export const toLocalDate = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDate = (s) =>
  s ? toLocalDate(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';