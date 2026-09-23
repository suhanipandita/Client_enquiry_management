import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EnquiriesPage from './pages/EnquiriesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/enquiries" element={<Layout pageTitle="Client Enquiries"><EnquiriesPage /></Layout>} />
        <Route path="/" element={<Layout pageTitle="Dashboard"><div>Dashboard coming soon</div></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;