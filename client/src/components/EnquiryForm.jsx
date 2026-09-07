import { useState, useEffect } from 'react';

const emptyForm = {
  client_name: '', company_name: '', mobile_number: '', email: '',
  address: '', enquiry_date: '', source: 'Call', service_required: 'Website Development',
  requirement_description: '', assigned_employee: '', follow_up_date: '',
  status: 'New', notes: ''
};

function EnquiryForm({ onSubmit, editingEnquiry, onCancelEdit }) {
  const [formData, setFormData] = useState(emptyForm);

  // When editingEnquiry changes (user clicked "Edit" on a row), fill the form with its data
  useEffect(() => {
    if (editingEnquiry) {
      setFormData(editingEnquiry);
    } else {
      setFormData(emptyForm);
    }
  }, [editingEnquiry]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Client Name" required />
      <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" />
      <input name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Mobile Number" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
      <input type="date" name="enquiry_date" value={formData.enquiry_date} onChange={handleChange} required />

      <select name="source" value={formData.source} onChange={handleChange}>
        <option>Call</option>
        <option>WhatsApp</option>
        <option>Website</option>
        <option>Reference</option>
        <option>Social Media</option>
      </select>

      <select name="service_required" value={formData.service_required} onChange={handleChange}>
        <option>Website Development</option>
        <option>Workshop</option>
      </select>

      <textarea name="requirement_description" value={formData.requirement_description} onChange={handleChange} placeholder="Requirement Description" />
      <input name="assigned_employee" value={formData.assigned_employee} onChange={handleChange} placeholder="Assigned Employee" />
      <input type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} />

      <select name="status" value={formData.status} onChange={handleChange}>
        <option>New</option>
        <option>Follow-up</option>
        <option>Converted</option>
        <option>Closed</option>
      </select>

      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" />

      <button type="submit">{editingEnquiry ? 'Update Enquiry' : 'Add Enquiry'}</button>
      {editingEnquiry && <button type="button" onClick={onCancelEdit}>Cancel</button>}
    </form>
  );
}

export default EnquiryForm;