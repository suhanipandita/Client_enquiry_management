import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/enquiries', label: 'Client Enquiries' },
  { to: '/quotations', label: 'Quotations' },
  { to: '/payments', label: 'Client Payments' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/employee-payments', label: 'Employee Payments' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/amc', label: 'Website AMC' },
];

function Layout({ pageTitle, children }) {
  useEffect(() => { document.title = `${pageTitle} | Codexlabz`; }, [pageTitle]);

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CX</span>
          <span className="brand-name">Codexlabz</span>
        </div>

        <nav className="nav-pill" aria-label="Modules">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-right">
          <span className="topbar-date">{today}</span>
          <span className="avatar">A</span>
        </div>
      </header>

      <main className="page">{children}</main>
    </div>
  );
}

export default Layout;