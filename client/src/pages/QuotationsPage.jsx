import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateQuotationPDF } from '../utils/pdfGenerator';

import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';
import QuotationForm from '../components/QuotationForm';
import { formatDate } from '../utils/dates';
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

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new')) {
      setEditingQuotation(null);
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
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
      <div className="page-head">
        <div>
          <h1 className="page-title">Quotations & Proposals</h1>
          <p className="page-sub">Create and manage client proposals.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingQuotation(null); setShowModal(true); }}>
          + New Quotation
        </button>
      </div>

      <section className="stat-strip">
        <Stat label="Total Quotations" value={counts.total} />
        <Stat label="Accepted" value={counts.accepted} />
        <Stat label="Pending / Sent" value={counts.pendingSent} />
        <Stat label="Rejected" value={counts.rejected} />
      </section>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Client</th>
                <th>Type</th>
                <th>Date</th>
                <th>Valid Until</th>
                <th className="num">Amount</th>
                <th className="num">Total (incl. GST)</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan={9} className="empty-cell">No quotations yet.</td></tr>
              ) : quotations.map(q => (
                <tr key={q.id}>
                  <td><div className="cell-strong">{q.quotation_number}</div></td>
                  <td>{q.client_name}</td>
                  <td>{q.proposal_type}</td>
                  <td>{formatDate(q.quotation_date)}</td>
                  <td>{formatDate(q.valid_until)}</td>
                  <td className="num">₹{Number(q.subtotal).toLocaleString('en-IN')}</td>
                  <td className="num">₹{Number(q.total_amount).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td className="num">
                    <button className="link-btn" onClick={() => generateQuotationPDF(q)}>PDF</button>
                    <button className="link-btn" onClick={() => openEdit(q)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">Showing {quotations.length} total quotations</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingQuotation ? 'Edit Quotation' : 'New Quotation'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <QuotationForm 
              onSubmit={handleSubmit} 
              editingQuotation={editingQuotation} 
              onCancel={() => { setShowModal(false); setEditingQuotation(null); }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuotationsPage;