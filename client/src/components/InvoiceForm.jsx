import { useState, useEffect } from 'react';
import { getClients } from '../api/enquiryApi';
import { getQuotations, getQuotationById } from '../api/quotationApi';

const emptyItem = { description: '', quantity: 1, rate: '' };
const emptyForm = {
  client_id: '',
  quotation_id: '',
  invoice_date: new Date().toISOString().slice(0, 10),
  discount: 0,
  gst_applied: true,
  payment_status: 'Pending',
  notes: '',
  items: [{ ...emptyItem }],
};

function InvoiceForm({ onSubmit, editingInvoice, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [clients, setClients] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getClients().then((res) => setClients(res.data));
    getQuotations().then((res) => setQuotations(res.data));
  }, []);

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        ...editingInvoice,
        invoice_date: editingInvoice.invoice_date ? editingInvoice.invoice_date.slice(0, 10) : '',
        gst_applied: Boolean(editingInvoice.gst_applied),
        items: editingInvoice.items?.length ? editingInvoice.items : [{ ...emptyItem }],
      });
    } else {
      setFormData(emptyForm);
    }
    setError('');
  }, [editingInvoice]);

  const clientQuotations = quotations.filter(
    (q) => String(q.client_id) === String(formData.client_id)
  );

  const handleImportQuotation = async (e) => {
    const qId = e.target.value;
    if (!qId) {
      setFormData((prev) => ({ ...prev, quotation_id: '' }));
      return;
    }
    const res = await getQuotationById(qId);
    const q = res.data;
    setFormData((prev) => ({
      ...prev,
      quotation_id: qId,
      discount: q.discount || 0,
      gst_applied: Boolean(q.gst_applied),
      items: q.items?.length
        ? q.items.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate }))
        : [{ ...emptyItem }],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    setFormData({ ...formData, items });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { ...emptyItem }] });

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const subtotal = formData.items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.rate) || 0),
    0
  );
  const taxable = Math.max(subtotal - Number(formData.discount || 0), 0);
  const taxAmount = formData.gst_applied ? taxable * 0.18 : 0;
  const grandTotal = taxable + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.client_id) {
      setError('Please select a client.');
      return;
    }
    if (!formData.items.some((i) => i.description.trim() && Number(i.rate) >= 0)) {
      setError('Please add at least one valid service item.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div className="field-grid">
          <div className="field">
            <label>Client*</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, quotation_id: '' })}
              required
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.client_name} {c.company_name ? `(${c.company_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Import from Quotation (Optional)</label>
            <select
              name="quotation_id"
              value={formData.quotation_id}
              onChange={handleImportQuotation}
              disabled={!formData.client_id}
            >
              <option value="">-- Custom Invoice --</option>
              {clientQuotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotation_number} — ₹{Number(q.total_amount).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Invoice Date*</label>
            <input type="date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Payment Status</label>
            <select name="payment_status" value={formData.payment_status} onChange={handleChange}>
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </div>
        </div>

        <label style={{ fontSize: 14, fontWeight: 600, color: '#4B5568' }}>Services</label>
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          {formData.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                placeholder="Service description"
                value={item.description}
                onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleItemChange(i, 'rate', e.target.value)}
                required
              />
              <div style={{ fontSize: 13, color: '#4B5568' }}>
                ₹{((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString('en-IN')}
              </div>
              <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#DC2645', cursor: 'pointer', fontSize: 16 }}>
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: 4 }}>
            + Add Service
          </button>
        </div>

        <div className="field-grid">
          <div className="field">
            <label>Discount (₹)</label>
            <input type="number" min="0" name="discount" value={formData.discount} onChange={handleChange} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
            <input type="checkbox" name="gst_applied" checked={formData.gst_applied} onChange={handleChange} style={{ width: 'auto' }} />
            <label style={{ margin: 0 }}>Apply GST (18%)</label>
          </div>
          <div className="field field-full">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Amount (Subtotal)</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Discount</span><span>−₹{Number(formData.discount || 0).toLocaleString('en-IN')}</span>
          </div>
          {formData.gst_applied && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>Tax (GST 18%)</span><span>₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 6 }}>
            <span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{editingInvoice ? 'Update Invoice' : 'Generate Invoice'}</button>
      </div>
    </form>
  );
}

export default InvoiceForm;