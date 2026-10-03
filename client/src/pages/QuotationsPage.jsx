import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import QuotationForm from '../components/QuotationForm';
import { getQuotations, getQuotationById, createQuotation, updateQuotation } from '../api/quotationApi';

function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  const load = async () => {
    const res = await getQuotations();
    setQuotations(res.data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    if (editingQuotation) {
      await updateQuotation(editingQuotation.id, data);
    } else {
      await createQuotation(data);
    }
    setShowModal(false);
    setEditingQuotation(null);
    load();
  };

  const openEdit = async (q) => {
    const res = await getQuotationById(q.id);
    setEditingQuotation(res.data);
    setShowModal(true);
  };

  const counts = {
    total: quotations.length,
    accepted: quotations.filter(q => q.status === 'Accepted').length,
    pendingSent: quotations.filter(q => q.status === 'Draft' || q.status === 'Sent').length,
    rejected: quotations.filter(q => q.status === 'Rejected').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Quotations & Proposals</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Create and manage client proposals.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingQuotation(null); setShowModal(true); }}>+ New Quotation</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <StatCard icon="▢" iconBg="#F1F1F4" value={counts.total} label="Total Quotations" />
        <StatCard icon="✓" iconBg="#E4F7EA" value={counts.accepted} label="Accepted" />
        <StatCard icon="→" iconBg="#FDF3E1" value={counts.pendingSent} label="Pending / Sent" />
        <StatCard icon="✕" iconBg="#FCE8EC" value={counts.rejected} label="Rejected" />
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['QUOTE NO.', 'CLIENT', 'TYPE', 'DATE', 'VALID UNTIL', 'AMOUNT', 'TOTAL (INCL. GST)', 'STATUS', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)', padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>No quotations yet.</td></tr>
            ) : quotations.map(q => (
              <tr key={q.id}>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{q.quotation_number}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{q.client_name}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{q.proposal_type}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{q.quotation_date?.slice(0, 10)}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{q.valid_until?.slice(0, 10)}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>₹{Number(q.subtotal).toLocaleString('en-IN')}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>₹{Number(q.total_amount).toLocaleString('en-IN')}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={q.status} /></td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                  <button onClick={() => openEdit(q)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '0.9rem 1.2rem', color: 'var(--muted)', fontSize: 13 }}>{quotations.length} quotations total</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingQuotation ? 'Edit Quotation' : 'New Quotation'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <QuotationForm onSubmit={handleSubmit} editingQuotation={editingQuotation} onCancel={() => { setShowModal(false); setEditingQuotation(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuotationsPage;