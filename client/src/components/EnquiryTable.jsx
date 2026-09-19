function EnquiryTable({ enquiries, onEdit, onDelete }) {
  return (
    <table border="1" cellPadding="6">
      <thead>
        <tr>
          <th>Client</th><th>Company</th><th>Mobile</th><th>Service</th>
          <th>Status</th><th>Follow-up</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {enquiries.map((enquiry) => (
          <tr key={enquiry.id}>
            <td>{enquiry.client_name}</td>
            <td>{enquiry.company_name}</td>
            <td>{enquiry.mobile_number}</td>
            <td>{enquiry.service_required}</td>
            <td>{enquiry.status}</td>
            <td>{enquiry.follow_up_date ? enquiry.follow_up_date.slice(0, 10) : '-'}</td>
            <td>{enquiry.employee_name || 'Unassigned'}</td>
            <td>
              <button onClick={() => onEdit(enquiry)}>Edit</button>
              <button onClick={() => onDelete(enquiry.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EnquiryTable;