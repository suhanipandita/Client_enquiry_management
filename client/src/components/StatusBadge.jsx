const dotColors = {
  New: '#3B6EA8',
  'Follow-up': '#B7791F',
  Converted: '#2F7D52',
  Closed: '#8A8F8C',
  Draft: '#8A8F8C',
  Sent: '#3B6EA8',
  Accepted: '#2F7D52',
  Rejected: '#B42318',
};

function StatusBadge({ status }) {
  return (
    <span className="status">
      <i className="status-dot" style={{ '--dot': dotColors[status] || dotColors.Closed }} />
      {status}
    </span>
  );
}

export default StatusBadge;