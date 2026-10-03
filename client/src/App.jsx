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
      </Routes>
    </BrowserRouter>
  );
}

export default App;