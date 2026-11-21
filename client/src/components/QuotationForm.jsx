import { useState, useEffect } from 'react';
import { getClients } from '../api/enquiryApi';

const emptyItem = { description: '', quantity: 1, rate: '' };
const emptyForm = {
  client_id: '',
  quotation_date: new Date().toISOString().slice(0, 10),
  valid_until: '',
  proposal_type: 'Website Development',
  discount: 0,
  gst_applied: false,
  terms: '',
  notes: '',
  status: 'Draft',
  items: [{ ...emptyItem }],
};

function QuotationForm({ onSubmit, editingQuotation, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getClients().then((res) => setClients(res.data));
  }, []);

  useEffect(() => {
    if (editingQuotation) {
      setFormData({
        ...editingQuotation,
        quotation_date: editingQuotation.quotation_date ? editingQuotation.quotation_date.slice(0, 10) : '',
        valid_until: editingQuotation.valid_until ? editingQuotation.valid_until.slice(0, 10) : '',
        gst_applied: Boolean(editingQuotation.gst_applied),
        status: editingQuotation.status || 'Draft',
        items: editingQuotation.items?.length ? editingQuotation.items : [{ ...emptyItem }],
      });
    } else {
      setFormData(emptyForm);
    }
    setError('');
  }, [editingQuotation]);

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
  const gstAmount = formData.gst_applied ? taxable * 0.18 : 0;
  const total = taxable + gstAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.quotation_date && formData.valid_until && formData.valid_until < formData.quotation_date) {
      setError('The "Valid Until" date cannot be earlier than the Quotation Date.');
      return;
    }

    if (!formData.items || formData.items.length === 0 || !formData.items[0].description.trim()) {
      setError('Please add at least one valid service line item.');
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
            <select name="client_id" value={formData.client_id} onChange={handleChange} required>
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.client_name} {c.company_name ? `(${c.company_name})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Proposal Type</label>
            <select name="proposal_type" value={formData.proposal_type} onChange={handleChange}>
              <option>Website Development</option>
              <option>Workshop</option>
            </select>
          </div>
          <div className="field">
            <label>Quotation Date*</label>
            <input type="date" name="quotation_date" value={formData.quotation_date} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Valid Until*</label>
            <input type="date" name="valid_until" value={formData.valid_until} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>Draft</option>
              <option>Sent</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <label style={{ fontSize: 14, fontWeight: 600, color: '#4B5568' }}>Services</label>
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          {formData.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                placeholder="Description"
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
            <label>Terms & Conditions</label>
            <textarea name="terms" value={formData.terms || ''} onChange={handleChange} />
          </div>
          <div className="field field-full">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Discount</span><span>−₹{Number(formData.discount || 0).toLocaleString('en-IN')}</span>
          </div>
          {formData.gst_applied && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>GST (18%)</span><span>₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 6 }}>
            <span>Total</span><span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{editingQuotation ? 'Update Quotation' : 'Create Quotation'}</button>
      </div>
    </form>
  );
}

export default QuotationForm;