import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Stat from '../components/Stat';
import { getEnquiries } from '../api/enquiryApi';
import { getQuotations } from '../api/quotationApi';
import { getPayments } from '../api/paymentApi';
import { getInvoices } from '../api/invoiceApi';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const toLocalDate = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const shortDate = (s) => toLocalDate(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

function DashboardPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getEnquiries(), getQuotations(), getPayments(), getInvoices()])
      .then(([e, q, p, inv]) => {
        setEnquiries(e.data);
        setQuotations(q.data);
        setPayments(p.data);
        setInvoices(inv.data);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoaded(true));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);

  const followUps = enquiries
    .filter(
      (e) =>
        (e.status === 'New' || e.status === 'Follow-up') &&
        e.follow_up_date &&
        toLocalDate(e.follow_up_date) <= weekAhead
    )
    .sort((a, b) => toLocalDate(a.follow_up_date) - toLocalDate(b.follow_up_date));

  const websiteProjects = quotations.filter((q) => q.proposal_type === 'Website Development').length;
  const workshops = quotations.filter((q) => q.proposal_type === 'Workshop').length;
  const awaitingQuotes = quotations.filter((q) => q.status === 'Sent').length;

  const paymentsReceived = payments.reduce((sum, p) => sum + Number(p.received_amount || 0), 0);
  const pendingPayments = payments.reduce((sum, p) => sum + Number(p.pending_amount || 0), 0);
  const pendingPaymentRows = payments.filter((p) => p.payment_status !== 'Paid');

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
    : followUps.length === 0 && awaitingQuotes === 0 && pendingPaymentRows.length === 0
    ? 'Everything is caught up right now.'
    : `${plural(followUps.length, 'follow-up')} due within a week, ${plural(awaitingQuotes, 'quotation')} awaiting reply, and ${plural(pendingPaymentRows.length, 'pending payment')}.`;

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
          <Link to="/payments" className="pill-btn pill-ghost">Record payment</Link>
          <Link to="/invoices" className="pill-btn pill-ghost">New invoice</Link>
        </div>
      </section>

      <section className="stat-strip">
        <Stat label="Total enquiries" value={failed ? null : enquiries.length} />
        <Stat label="Total quotations" value={failed ? null : quotations.length} />
        <Stat label="Website projects" value={failed ? null : websiteProjects} />
        <Stat label="Workshops" value={failed ? null : workshops} />
      </section>

      <section className="stat-strip" style={{ marginTop: 12 }}>
        <Stat label="Payments received" value={failed ? null : paymentsReceived} format={money} />
        <Stat label="Pending payments" value={failed ? null : pendingPayments} format={money} />
        <Stat label="Total invoices" value={failed ? null : invoices.length} />
        <Stat label="Awaiting quote reply" value={failed ? null : awaitingQuotes} />
      </section>

      <div className="dash-grid" style={{ marginTop: 28 }}>
        <section className="panel">
          <div className="panel-head">
            <h2>Follow-ups due</h2>
            <Link to="/enquiries" className="panel-link">View all</Link>
          </div>
          {ok && followUps.length === 0 && <div className="row-empty">No follow-ups due this week.</div>}
          {followUps.slice(0, 5).map((e) => {
            const due = dueLabel(e.follow_up_date);
            return (
              <div className="row" key={e.id}>
                <div>
                  <div className="row-title">{e.client_name}</div>
                  <div className="row-sub">
                    {e.company_name ? `${e.company_name}, ` : ''}
                    {e.service_required}
                  </div>
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
            <h2>Pending client dues</h2>
            <Link to="/payments" className="panel-link">View all</Link>
          </div>
          {ok && pendingPaymentRows.length === 0 && <div className="row-empty">No pending client dues.</div>}
          {pendingPaymentRows.slice(0, 5).map((p) => (
            <div className="row" key={p.id}>
              <div>
                <div className="row-title">{p.client_name}</div>
                <div className="row-sub">{p.project_name || p.payment_type}</div>
              </div>
              <div className="row-end">
                <div className="row-date">{money(p.pending_amount)} due</div>
                <StatusBadge status={p.payment_status} />
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Recent quotations</h2>
            <Link to="/quotations" className="panel-link">View all</Link>
          </div>
          {ok && quotations.length === 0 && <div className="row-empty">No quotations yet.</div>}
          {quotations.slice(0, 5).map((q) => (
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

        <section className="panel">
          <div className="panel-head">
            <h2>Recent invoices</h2>
            <Link to="/invoices" className="panel-link">View all</Link>
          </div>
          {ok && invoices.length === 0 && <div className="row-empty">No invoices generated yet.</div>}
          {invoices.slice(0, 5).map((inv) => (
            <div className="row" key={inv.id}>
              <div>
                <div className="row-title">{inv.invoice_number}</div>
                <div className="row-sub">{inv.client_name}</div>
              </div>
              <div className="row-end">
                <div className="row-date">{money(inv.grand_total)}</div>
                <StatusBadge status={inv.payment_status} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;