import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
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
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          {[
            ['/payments', 'Client Payments'],
            ['/invoices', 'Invoices'],
            ['/employee-payments', 'Employee Payments'],
            ['/expenses', 'Expenses'],
            ['/amc', 'Website AMC'],
          ].map(([path, name]) => (
            <Route key={path} path={path} element={<ComingSoon name={name} />} />
          ))}
          <Route path="*" element={<ComingSoon name="Page not found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;