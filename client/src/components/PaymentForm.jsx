import { useState, useEffect } from 'react';
import { getClients } from '../api/enquiryApi';
import { getQuotations } from '../api/quotationApi';

const emptyForm = {
  client_id: '',
  quotation_id: '',
  project_name: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_type: 'Website Development',
  payment_mode: 'UPI',
  total_amount: '',
  received_amount: '',
  transaction_id: '',
  payment_status: 'Pending',
  existing_proof: '',
};

function PaymentForm({ onSubmit, editingPayment, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [proofFile, setProofFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getClients().then((res) => setClients(res.data));
    getQuotations().then((res) => setQuotations(res.data));
  }, []);

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        client_id: editingPayment.client_id || '',
        quotation_id: editingPayment.quotation_id || '',
        project_name: editingPayment.project_name || '',
        payment_date: editingPayment.payment_date ? editingPayment.payment_date.slice(0, 10) : '',
        payment_type: editingPayment.payment_type || 'Website Development',
        payment_mode: editingPayment.payment_mode || 'UPI',
        total_amount: editingPayment.total_amount ?? '',
        received_amount: editingPayment.received_amount ?? '',
        transaction_id: editingPayment.transaction_id || '',
        payment_status: editingPayment.payment_status || 'Pending',
        existing_proof: editingPayment.payment_proof || '',
      });
    } else {
      setFormData(emptyForm);
    }
    setProofFile(null);
    setError('');
  }, [editingPayment]);

  const clientQuotations = quotations.filter(
    (q) => String(q.client_id) === String(formData.client_id)
  );

  const handleQuotationSelect = (e) => {
    const qId = e.target.value;
    const selected = quotations.find((q) => String(q.id) === String(qId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        quotation_id: qId,
        project_name: selected.quotation_number,
        payment_type: selected.proposal_type || prev.payment_type,
        total_amount: selected.total_amount,
      }));
    } else {
      setFormData((prev) => ({ ...prev, quotation_id: '' }));
    }
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    const total = Number(updated.total_amount) || 0;
    const received = Number(updated.received_amount) || 0;

    if (total > 0 && received >= total) {
      updated.payment_status = 'Paid';
    } else if (received > 0) {
      updated.payment_status = 'Partial';
    } else {
      updated.payment_status = 'Pending';
    }
    setFormData(updated);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const total = Number(formData.total_amount) || 0;
  const received = Number(formData.received_amount) || 0;
  const pending = Math.max(total - received, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.client_id) {
      setError('Please select a client.');
      return;
    }
    if (total <= 0) {
      setError('Total amount must be greater than zero.');
      return;
    }
    if (received < 0 || received > total) {
      setError('Received amount must be between 0 and the Total Amount.');
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null && val !== undefined) payload.append(key, val);
    });
    if (proofFile) {
      payload.append('payment_proof', proofFile);
    }

    onSubmit(payload);
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
            <label>Link Quotation (Optional)</label>
            <select name="quotation_id" value={formData.quotation_id} onChange={handleQuotationSelect} disabled={!formData.client_id}>
              <option value="">-- Standalone / Custom Project --</option>
              {clientQuotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotation_number} — ₹{Number(q.total_amount).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Project / Workshop Name*</label>
            <input
              name="project_name"
              placeholder="e.g. Corporate Website or React Workshop"
              value={formData.project_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Payment Type*</label>
            <select name="payment_type" value={formData.payment_type} onChange={handleChange}>
              <option>Website Development</option>
              <option>Workshop</option>
            </select>
          </div>

          <div className="field">
            <label>Payment Date*</label>
            <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Payment Mode*</label>
            <select name="payment_mode" value={formData.payment_mode} onChange={handleChange}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </div>

          <div className="field">
            <label>Total Amount (₹)*</label>
            <input type="number" min="0" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleAmountChange} required />
          </div>

          <div className="field">
            <label>Received Amount (₹)*</label>
            <input type="number" min="0" step="0.01" name="received_amount" value={formData.received_amount} onChange={handleAmountChange} required />
          </div>

          <div className="field">
            <label>Pending Amount (₹)</label>
            <input value={`₹${pending.toLocaleString('en-IN')}`} readOnly style={{ background: 'var(--cream)', fontWeight: 600 }} />
          </div>

          <div className="field">
            <label>Payment Status</label>
            <select name="payment_status" value={formData.payment_status} onChange={handleChange}>
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </div>

          <div className="field">
            <label>Transaction ID / Ref</label>
            <input name="transaction_id" placeholder="UPI Ref / Cheque No." value={formData.transaction_id} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Upload Payment Proof</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files[0])} />
            {formData.existing_proof && !proofFile && (
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <a href={`http://localhost:5001${formData.existing_proof}`} target="_blank" rel="noreferrer" className="link-btn">
                  View current proof
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{editingPayment ? 'Update Payment' : 'Record Payment'}</button>
      </div>
    </form>
  );
}

export default PaymentForm;