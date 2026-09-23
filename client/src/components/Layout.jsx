import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/enquiries', label: 'Client Enquiries', icon: '◎' },
  { to: '/quotations', label: 'Quotations', icon: '▢' },
  { to: '/payments', label: 'Client Payments', icon: '₹' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/employee-payments', label: 'Employee Payments', icon: '👤' },
  { to: '/expenses', label: 'Expenses', icon: '📊' },
  { to: '/amc', label: 'Website AMC', icon: '🔄' },
];

function Layout({ pageTitle, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 260, background: 'var(--navy-dark)', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>CX</div>
          <div>
            <div style={{ fontWeight: 700 }}>Codexlabz</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Business Suite</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.75rem 1rem', margin: '2px 0', borderRadius: 10,
                color: 'white', textDecoration: 'none', fontSize: 14,
                background: isActive ? 'var(--accent)' : 'transparent',
              })}
            >
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width : '100%' ,display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>A</div>
          </div>
        </header>
        <div style={{ padding: '2rem' }}>{children}</div>
      </main>
    </div>
  );
}

export default Layout;