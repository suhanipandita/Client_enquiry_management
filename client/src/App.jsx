import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EnquiriesPage from './pages/EnquiriesPage';
import QuotationsPage from './pages/QuotationsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout pageTitle="Dashboard"><div>Dashboard coming soon</div></Layout>} />
        <Route path="/enquiries" element={<Layout pageTitle="Client Enquiries"><EnquiriesPage /></Layout>} />
        <Route path="/quotations" element={<Layout pageTitle="Quotations"><QuotationsPage /></Layout>} />
        <Route path="/payments" element={<Layout pageTitle="Client Payments"><div> Client Payments coming soon</div></Layout>} />
        <Route path="/invoices" element={<Layout pageTitle="Invoices"><div>Invoices coming soon</div></Layout>} />
        <Route path="/employee-payments" element={<Layout pageTitle="Employee Payments"><div>Employee-payments coming soon</div></Layout>} />
        <Route path="/expenses" element={<Layout pageTitle="Expenses"><div>Expenses coming soon</div></Layout>} />
        <Route path="/amc" element={<Layout pageTitle="Website AMC"><div>Website AMC coming soon</div></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;