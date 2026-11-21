import { useState, useEffect } from 'react';
import Stat from '../components/Stat';
import StatusBadge from '../components/StatusBadge';
import InvoiceForm from '../components/InvoiceForm';
import { formatDate } from '../utils/dates';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice } from '../api/invoiceApi';

const filters = ['All', 'Paid', 'Partial', 'Pending'];
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const load = async () => {
    const res = await getInvoices();
    setInvoices(res.data);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleSubmit = async (data) => {
    if (editingInvoice) {
      await updateInvoice(editingInvoice.id, data);
    } else {
      await createInvoice(data);
    }
    closeModal();
    load();
  };

  const openEdit = async (inv) => {
    const res = await getInvoiceById(inv.id);
    setEditingInvoice(res.data);
    setShowModal(true);
  };

  const handleExport = async (inv, mode) => {
    const res = await getInvoiceById(inv.id);
    generateInvoicePDF(res.data, mode);
  };

  const totalBilled = invoices.reduce((sum, i) => sum + Number(i.grand_total || 0), 0);
  const paidTotal = invoices
    .filter((i) => i.payment_status === 'Paid')
    .reduce((sum, i) => sum + Number(i.grand_total || 0), 0);
  const pendingTotal = invoices
    .filter((i) => i.payment_status !== 'Paid')
    .reduce((sum, i) => sum + Number(i.grand_total || 0), 0);

  const visible = invoices.filter((i) => {
    const matchesStatus = activeFilter === 'All' || i.payment_status === activeFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (i.invoice_number || '').toLowerCase().includes(q) ||
      (i.client_name || '').toLowerCase().includes(q) ||
      (i.company_name || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-sub">Generate GST invoices, download PDFs, and track invoice history.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingInvoice(null); setShowModal(true); }}>
          + New Invoice
        </button>
      </div>

      <section className="stat-strip">
        <Stat label="Total Invoices" value={invoices.length} />
        <Stat label="Total Billed" value={totalBilled} format={money} />
        <Stat label="Paid Invoices" value={paidTotal} format={money} />
        <Stat label="Unpaid / Pending" value={pendingTotal} format={money} />
      </section>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by invoice number, client, or company"
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
                <th>Invoice No.</th>
                <th>Client</th>
                <th>Date</th>
                <th className="num">Amount</th>
                <th className="num">Tax (GST)</th>
                <th className="num">Grand Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} className="empty-cell">No invoices found.</td></tr>
              ) : visible.map((inv) => (
                <tr key={inv.id}>
                  <td><div className="cell-strong">{inv.invoice_number}</div></td>
                  <td>
                    <div className="cell-strong">{inv.client_name}</div>
                    {inv.company_name && <div className="cell-sub">{inv.company_name}</div>}
                  </td>
                  <td>{formatDate(inv.invoice_date)}</td>
                  <td className="num">{money(inv.subtotal)}</td>
                  <td className="num">{money(inv.tax_amount)}</td>
                  <td className="num"><strong>{money(inv.grand_total)}</strong></td>
                  <td><StatusBadge status={inv.payment_status} /></td>
                  <td className="num" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="link-btn" onClick={() => handleExport(inv, 'print')}>Print</button>
                    <button className="link-btn" onClick={() => handleExport(inv, 'download')}>PDF</button>
                    <button className="link-btn" onClick={() => openEdit(inv)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">Showing {visible.length} of {invoices.length} invoices</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingInvoice ? `Edit ${editingInvoice.invoice_number}` : 'Generate New Invoice'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <InvoiceForm onSubmit={handleSubmit} editingInvoice={editingInvoice} onCancel={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoicesPage;