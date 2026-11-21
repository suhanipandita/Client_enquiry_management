import { useState, useEffect } from 'react';
import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';
import PaymentForm from '../components/PaymentForm';
import { formatDate } from '../utils/dates';
import { getPayments, createPayment, updatePayment } from '../api/paymentApi';

const filters = ['All', 'Paid', 'Partial', 'Pending'];
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const load = async () => {
    const res = await getPayments();
    setPayments(res.data);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSubmit = async (formData) => {
    if (editingPayment) {
      await updatePayment(editingPayment.id, formData);
    } else {
      await createPayment(formData);
    }
    closeModal();
    load();
  };

  const totalBilled = payments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.received_amount || 0), 0);
  const totalPending = payments.reduce((sum, p) => sum + Number(p.pending_amount || 0), 0);
  const paidCount = payments.filter((p) => p.payment_status === 'Paid').length;

  const visible = payments.filter((p) => {
    const matchesStatus = activeFilter === 'All' || p.payment_status === activeFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.client_name || '').toLowerCase().includes(q) ||
      (p.company_name || '').toLowerCase().includes(q) ||
      (p.project_name || '').toLowerCase().includes(q) ||
      (p.transaction_id || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Client Payments</h1>
          <p className="page-sub">Record payments received, track dues, and store payment proofs.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingPayment(null); setShowModal(true); }}>
          + Record Payment
        </button>
      </div>

      <section className="stat-strip">
        <Stat label="Total Billed" value={totalBilled} format={money} />
        <Stat label="Received Amount" value={totalReceived} format={money} />
        <Stat label="Pending Dues" value={totalPending} format={money} />
        <Stat label="Fully Paid" value={paidCount} />
      </section>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by client, project/workshop, or transaction ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="tabs" role="tablist">
          {filters.map((f) => (
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
                <th>Project / Workshop</th>
                <th>Date</th>
                <th>Mode / Txn ID</th>
                <th className="num">Total</th>
                <th className="num">Received</th>
                <th className="num">Pending</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={9} className="empty-cell">No payment records found.</td></tr>
              ) : visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-strong">{p.client_name}</div>
                    {p.company_name && <div className="cell-sub">{p.company_name}</div>}
                  </td>
                  <td>
                    <div>{p.project_name || '—'}</div>
                    <div className="cell-sub">{p.payment_type}</div>
                  </td>
                  <td>{formatDate(p.payment_date)}</td>
                  <td>
                    <div>{p.payment_mode}</div>
                    {p.transaction_id && <div className="cell-sub">{p.transaction_id}</div>}
                  </td>
                  <td className="num">{money(p.total_amount)}</td>
                  <td className="num">{money(p.received_amount)}</td>
                  <td className="num">{money(p.pending_amount)}</td>
                  <td><StatusBadge status={p.payment_status} /></td>
                  <td className="num" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    {p.payment_proof && (
                      <a
                        href={`http://localhost:5001${p.payment_proof}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link-btn"
                      >
                        Proof
                      </a>
                    )}
                    <button className="link-btn" onClick={() => { setEditingPayment(p); setShowModal(true); }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">Showing {visible.length} of {payments.length} payment records</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPayment ? 'Edit Payment Record' : 'Record Client Payment'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <PaymentForm onSubmit={handleSubmit} editingPayment={editingPayment} onCancel={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage;