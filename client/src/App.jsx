import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EnquiriesPage from './pages/EnquiriesPage';
import QuotationsPage from './pages/QuotationsPage';

function ComingSoon({ name }) {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{name}</h1>
      <p style={{ color: 'var(--muted)' }}>This module hasn't been built yet.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout pageTitle="Dashboard"><div>Dashboard coming soon</div></Layout>} />
        <Route path="/enquiries" element={<Layout pageTitle="Client Enquiries"><EnquiriesPage /></Layout>} />
        <Route path="/quotations" element={<Layout pageTitle="Quotations"><QuotationsPage /></Layout>} />
        {[
          ['/payments', 'Client Payments'],
          ['/invoices', 'Invoices'],
          ['/employee-payments', 'Employee Payments'],
          ['/expenses', 'Expenses'],
          ['/amc', 'Website AMC'],
        ].map(([path, name]) => (
          <Route key={path} path={path} element={<Layout pageTitle={name}><ComingSoon name={name} /></Layout>} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;