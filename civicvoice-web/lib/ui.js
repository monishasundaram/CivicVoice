export const C = {
  page: '#080c16', card: '#0f1a2e', card2: '#1e293b', border: '#1e293b',
  border2: '#334155', text: '#e2e8f0', muted: '#94a3b8', blue: '#2563eb', blueLt: '#3b82f6',
};
const STATUS = { 'Filed': '#475569', 'Under Review': '#ca8a04', 'In Progress': '#2563eb', 'Resolved': '#16a34a' };
export function Badge({ status }) {
  return <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, color: '#fff', background: STATUS[status] || '#475569', whiteSpace: 'nowrap' }}>{status}</span>;
}