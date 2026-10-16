import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnquiryForm from '../components/EnquiryForm';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/dates';
import { getEnquiries, createEnquiry, updateEnquiry, searchEnquiries } from '../api/enquiryApi';

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

  // Opened from the Dashboard's "Add enquiry" button (/enquiries?new=1)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new')) {
      setEditingEnquiry(null);
      setShowPanel(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const closeModal = () => { setShowPanel(false); setEditingEnquiry(null); };

  const handleSubmit = async (formData) => {
    if (editingEnquiry) {
      await updateEnquiry(editingEnquiry.id, formData);
    } else {
      await createEnquiry(formData);
    }
    closeModal();
    loadEnquiries();
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) return loadEnquiries();
    const res = await searchEnquiries(term);
    setEnquiries(res.data);
  };

  const visible = activeFilter === 'All' ? enquiries : enquiries.filter(e => e.status === activeFilter);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Client Enquiries</h1>
          <p className="page-sub">Track and manage all inbound enquiries.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingEnquiry(null); setShowPanel(true); }}>
          + Add Enquiry
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by name, company, mobile or email"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <div className="tabs" role="tablist">
          {filters.map(f => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={'tab' + (activeFilter === f ? ' active' : '')}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Mobile / Email</th>
                <th>Source</th>
                <th>Service</th>
                <th>Assignee</th>
                <th>Follow-up</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} className="empty-cell">No enquiries found.</td></tr>
              ) : visible.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="cell-strong">{e.client_name}</div>
                    {e.company_name && <div className="cell-sub">{e.company_name}</div>}
                  </td>
                  <td>
                    <div>{e.mobile_number}</div>
                    {e.email && <div className="cell-sub">{e.email}</div>}
                  </td>
                  <td>{e.source}</td>
                  <td>{e.service_required}</td>
                  <td>{e.employee_name || '—'}</td>
                  <td>{formatDate(e.follow_up_date)}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td className="num">
                    <button className="link-btn" onClick={() => { setEditingEnquiry(e); setShowPanel(true); }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">Showing {visible.length} of {enquiries.length} enquiries</div>
      </div>

      {showPanel && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <EnquiryForm onSubmit={handleSubmit} editingEnquiry={editingEnquiry} onCancel={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiriesPage;