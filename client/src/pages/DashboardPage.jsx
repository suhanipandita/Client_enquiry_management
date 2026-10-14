import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { getEnquiries } from '../api/enquiryApi';
import { getQuotations } from '../api/quotationApi';

const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// 'YYYY-MM-DD' (or an ISO string) -> local Date at midnight, built from its parts so nothing shifts
const toLocalDate = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const shortDate = (s) => toLocalDate(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !target) { setValue(target); return; }
    let raf, start;
    const tick = (now) => {
      if (start === undefined) start = now;
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Stat({ label, value, format = (n) => n.toLocaleString('en-IN') }) {
  const shown = useCountUp(value ?? 0);
  return (
    <div className="stat">
      <div className="stat-value">{value == null ? '—' : format(shown)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function DashboardPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getEnquiries(), getQuotations()])
      .then(([e, q]) => { setEnquiries(e.data); setQuotations(q.data); })
      .catch(() => setFailed(true))
      .finally(() => setLoaded(true));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);

  const followUps = enquiries
    .filter(e => (e.status === 'New' || e.status === 'Follow-up') && e.follow_up_date && toLocalDate(e.follow_up_date) <= weekAhead)
    .sort((a, b) => toLocalDate(a.follow_up_date) - toLocalDate(b.follow_up_date));

  const awaiting = quotations.filter(q => q.status === 'Sent').length;
  const acceptedValue = quotations
    .filter(q => q.status === 'Accepted')
    .reduce((sum, q) => sum + Number(q.total_amount), 0);

  const dueLabel = (s) => {
    const diff = Math.round((toLocalDate(s) - today) / 86400000);
    if (diff < 0) return { text: `${plural(-diff, 'day')} overdue`, overdue: true };
    if (diff === 0) return { text: 'Today' };
    if (diff === 1) return { text: 'Tomorrow' };
    return { text: `In ${diff} days` };
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const ok = loaded && !failed;
  const summary = failed
    ? "We couldn't reach the server, so nothing below is up to date."
    : followUps.length === 0 && awaiting === 0
    ? 'Nothing is waiting on you right now.'
    : `${plural(followUps.length, 'follow-up')} due within a week, ${plural(awaiting, 'quotation')} waiting on a reply.`;

  return (
    <div>
      <section className="hero">
        <h1>{greeting}, Admin.</h1>
        <p>{loaded ? summary : 'Loading your overview...'}</p>
        <div className="hero-actions">
          <Link to="/enquiries?new=1" className="pill-btn pill-amber">
            Add enquiry <span className="pill-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link to="/quotations?new=1" className="pill-btn pill-ghost">New quotation</Link>
        </div>
      </section>

      <section className="stat-strip">
        <Stat label="Total enquiries" value={failed ? null : enquiries.length} />
        <Stat label="Total quotations" value={failed ? null : quotations.length} />
        <Stat label="Awaiting reply" value={failed ? null : awaiting} />
        <Stat label="Accepted value" value={failed ? null : acceptedValue} format={money} />
      </section>
      <p className="strip-note">Payments, invoices, expenses and AMC figures will appear here as those modules are built.</p>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Follow-ups due</h2>
            <Link to="/enquiries" className="panel-link">View all</Link>
          </div>
          {ok && followUps.length === 0 && <div className="row-empty">No follow-ups due this week.</div>}
          {followUps.slice(0, 6).map(e => {
            const due = dueLabel(e.follow_up_date);
            return (
              <div className="row" key={e.id}>
                <div>
                  <div className="row-title">{e.client_name}</div>
                  <div className="row-sub">{e.company_name ? `${e.company_name}, ` : ''}{e.service_required}</div>
                </div>
                <div className="row-end">
                  <div className="row-date">{shortDate(e.follow_up_date)}</div>
                  <div className={due.overdue ? 'row-flag' : 'row-sub'}>{due.text}</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Recent quotations</h2>
            <Link to="/quotations" className="panel-link">View all</Link>
          </div>
          {ok && quotations.length === 0 && <div className="row-empty">No quotations yet.</div>}
          {quotations.slice(0, 5).map(q => (
            <div className="row" key={q.id}>
              <div>
                <div className="row-title">{q.quotation_number}</div>
                <div className="row-sub">{q.client_name}</div>
              </div>
              <div className="row-end">
                <div className="row-date">{money(q.total_amount)}</div>
                <StatusBadge status={q.status} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;