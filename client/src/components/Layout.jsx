import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/enquiries', label: 'Client Enquiries' },
  { to: '/quotations', label: 'Quotations' },
  { to: '/payments', label: 'Client Payments' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/employee-payments', label: 'Employee Payments' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/amc', label: 'Website AMC' },
];

function Layout() {
  const { pathname } = useLocation();
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const [animate, setAnimate] = useState(false);

  const activeItem = navItems.find(i => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
  const activeTo = activeItem ? activeItem.to : null;

  useEffect(() => {
    document.title = `${activeItem ? activeItem.label : 'Not found'} | Codexlabz`;
  }, [activeItem]);

  // Place the sliding highlight under the active link
  useLayoutEffect(() => {
    let cancelled = false;
    const place = () => {
      if (cancelled) return;
      const el = activeTo && linkRefs.current[activeTo];
      if (!el) {
        setIndicator(s => ({ ...s, visible: false }));
        return;
      }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
      el.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', place);
    };
  }, [activeTo]);

  // Enable transitions only after the first paint, so the highlight doesn't slide in from 0 on load
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="topbar-wrap">
        <header className="topbar container">
          <div className="brand">
            <span className="brand-mark">CX</span>
            <span className="brand-name">Codexlabz</span>
          </div>

          <nav className="nav-pill" aria-label="Modules">
            <span
              className={'nav-indicator' + (animate ? ' animate' : '')}
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width,
                opacity: indicator.visible ? 1 : 0,
              }}
              aria-hidden="true"
            />
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                ref={el => { linkRefs.current[item.to] = el; }}
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
      </div>

      <main className="container page">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;