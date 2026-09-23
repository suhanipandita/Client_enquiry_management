import { useState, useEffect } from 'react';
import { getEmployees } from '../api/employeeApi';

const emptyForm = {
  client_name: '', company_name: '', mobile_number: '', email: '',
  address: '', source: 'Call', service_required: 'Website Development',
  status: 'New', assigned_employee_id: '', follow_up_date: '', notes: ''
};

function EnquiryForm({ onSubmit, editingEnquiry, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [employees, setEmployees] = useState([]);

  useEffect(() => { getEmployees().then(res => setEmployees(res.data)); }, []);

  useEffect(() => {
    if (editingEnquiry) {
      setFormData({ ...editingEnquiry, assigned_employee_id: editingEnquiry.employee_id || '' });
    } else {
      setFormData(emptyForm);
    }
  }, [editingEnquiry]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="field-grid">
          <div className="field">
            <label>Client Name*</label>
            <input name="client_name" value={formData.client_name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Company Name</label>
            <input name="company_name" value={formData.company_name} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Mobile Number*</label>
            <input name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email ID</label>
            <input name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="field field-full">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Source</label>
            <select name="source" value={formData.source} onChange={handleChange}>
              <option>Call</option><option>WhatsApp</option><option>Website</option>
              <option>Reference</option><option>Social Media</option>
            </select>
          </div>
          <div className="field">
            <label>Service Required</label>
            <select name="service_required" value={formData.service_required} onChange={handleChange}>
              <option>Website Development</option><option>Workshop</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>New</option><option>Follow-up</option><option>Converted</option><option>Closed</option>
            </select>
          </div>
          <div className="field">
            <label>Assigned Employee</label>
            <select name="assigned_employee_id" value={formData.assigned_employee_id} onChange={handleChange}>
              <option value="">-- Select --</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.employee_name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Follow-up Date</label>
            <input type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} />
          </div>
          <div className="field field-full">
            <label>Notes / Remarks</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{editingEnquiry ? 'Update Enquiry' : 'Add Enquiry'}</button>
      </div>
    </form>
  );
}

export default EnquiryForm;