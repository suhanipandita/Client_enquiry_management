import { useState, useEffect } from 'react';
import EnquiryForm from '../components/EnquiryForm';
import StatusBadge from '../components/StatusBadge';
import { getEnquiries, createEnquiry, updateEnquiry, deleteEnquiry, searchEnquiries } from '../api/enquiryApi';

const filters = ['All', 'New', 'Follow-up', 'Converted', 'Closed'];

function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);

  const loadEnquiries = async () => {
    const res = await getEnquiries();
    setEnquiries(res.data);
  };

  useEffect(() => { loadEnquiries(); }, []);

  const handleSubmit = async (formData) => {
    if (editingEnquiry) {
      await updateEnquiry(editingEnquiry.id, formData);
    } else {
      await createEnquiry(formData);
    }
    setShowPanel(false);
    setEditingEnquiry(null);
    loadEnquiries();
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) return loadEnquiries();
    const res = await searchEnquiries(term);
    setEnquiries(res.data);
  };

  const visibleEnquiries = activeFilter === 'All'
    ? enquiries
    : enquiries.filter(e => e.status === activeFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Client Enquiries</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Track and manage all inbound enquiries.</p>
        </div>
        <button
          onClick={() => { setEditingEnquiry(null); setShowPanel(true); }}
          style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Enquiry
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
        <input
          placeholder="Search by name or company..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border)' }}
        />
        <div style={{ display: 'flex', background: 'white', borderRadius: 10, border: '1px solid var(--border)', padding: 4 }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                background: activeFilter === f ? 'var(--navy-dark)' : 'transparent',
                color: activeFilter === f ? 'white' : 'var(--text)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['CLIENT', 'MOBILE / EMAIL', 'SOURCE', 'SERVICE', 'ASSIGNEE', 'FOLLOW-UP', 'STATUS', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)', padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleEnquiries.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>No enquiries found.</td></tr>
            ) : visibleEnquiries.map(e => (
              <tr key={e.id}>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600 }}>{e.client_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{e.company_name}</div>
                </td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                  <div>{e.mobile_number}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{e.email}</div>
                </td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{e.source}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{e.service_required}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{e.employee_name || '—'}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>{e.follow_up_date ? e.follow_up_date.slice(0, 10) : '—'}</td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={e.status} /></td>
                <td style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => { setEditingEnquiry(e); setShowPanel(true); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '0.9rem 1.2rem', color: 'var(--muted)', fontSize: 13 }}>
          Showing {visibleEnquiries.length} of {enquiries.length} enquiries
        </div>
      </div>

      {showPanel && (
        <div className="modal-overlay" onClick={() => setShowPanel(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}</h2>
              <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
            </div>
            <EnquiryForm
              onSubmit={handleSubmit}
              editingEnquiry={editingEnquiry}
              onCancel={() => { setShowPanel(false); setEditingEnquiry(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiriesPage;