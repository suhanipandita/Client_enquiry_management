const statusStyles = {
  New: { bg: 'var(--status-new-bg)', text: 'var(--status-new-text)' },
  'Follow-up': { bg: 'var(--status-followup-bg)', text: 'var(--status-followup-text)' },
  Converted: { bg: 'var(--status-converted-bg)', text: 'var(--status-converted-text)' },
  Closed: { bg: 'var(--status-closed-bg)', text: 'var(--status-closed-text)' },
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.Closed;
  return (
    <span style={{
      background: style.bg, color: style.text,
      padding: '4px 12px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, display: 'inline-block',
    }}>
      {status}
    </span>
  );
}

export default StatusBadge;