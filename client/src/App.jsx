import { useState, useEffect } from 'react';
import EnquiryForm from './components/EnquiryForm';
import EnquiryTable from './components/EnquiryTable';
import { getEnquiries, createEnquiry, updateEnquiry, deleteEnquiry, searchEnquiries } from './api/enquiryApi';

function App() {
  const [enquiries, setEnquiries] = useState([]);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEnquiries = async () => {
    const res = await getEnquiries();
    setEnquiries(res.data);
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingEnquiry) {
        await updateEnquiry(editingEnquiry.id, formData);
        setEditingEnquiry(null);
      } else {
        await createEnquiry(formData);
      }
      loadEnquiries(); // refresh the table after any change
    } catch (err) {
      alert('Error saving enquiry: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    await deleteEnquiry(id);
    loadEnquiries();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return loadEnquiries();
    const res = await searchEnquiries(searchTerm);
    setEnquiries(res.data);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Client Enquiry Management</h1>

      <input
        placeholder="Search by name, company, mobile, or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={loadEnquiries}>Reset</button>

      <EnquiryForm
        onSubmit={handleSubmit}
        editingEnquiry={editingEnquiry}
        onCancelEdit={() => setEditingEnquiry(null)}
      />

      <EnquiryTable
        enquiries={enquiries}
        onEdit={setEditingEnquiry}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;