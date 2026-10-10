# Development Log — Business Management System

**Codexlabz Technologies | Full Stack Developer Internship** **Module 2: Quotation Management**

---

## Sep 29, 2026 – Mapped the module before writing SQL

- one quotation has multiple service line items, so used a master/detail table pair — `quotations` (one row per quotation) and `quotation_items` (one row per service line) — rather than fixed `service_1`/`service_2` columns.
- Used `DECIMAL(10,2)` for all money fields, not `FLOAT`, to avoid floating-point rounding drift on financial totals.
- Added `ON DELETE CASCADE` on `quotation_items` (deleting a quotation removes its line items, since they're meaningless alone) — a deliberate contrast with `clients`, where no cascade is allowed.
- Decided GST is a fixed 18%, applied via a checkbox rather than an editable rate, matching actual Figma numbers (₹45,000 → ₹53,100).


## Oct 5, 2026 — Built transactional create/update

- all SQL for one quotation runs on a single pooled connection via `beginTransaction()`/`commit()`/`rollback()`, so a quotation and all its line items are saved together or not at all.
- Auto-generated quotation numbers (`QT-2026-001`, etc.) server-side using `MAX(...)` (not `COUNT(*)+1`, which would misbehave after a deletion) with `FOR UPDATE` row locking to prevent duplicate numbers under concurrent requests.
- **All money math happens server-side only** — the frontend sends quantities/rates, the backend computes subtotal, discount, GST, and total, so a tampered client request can't fake a lower price.
- Added a separate `PATCH /status` endpoint (not full `PUT`) for quick status changes (Draft/Sent/Accepted/Rejected), validated against an explicit allow-list.
- Built the frontend: extended `StatusBadge` with quotation statuses (same component, bigger vocabulary), and built a dynamic, repeatable line-items form (array-of-objects state, add/remove rows, live client-side total preview that mirrors — but never replaces — the server's calculation).
- Fixed a blank-screen crash caused by importing a `getClients` function that didn't exist yet in the API helper file — a reminder that named-import errors fail at module load time, before any component runs.
- Full stack (schema, transactional API, design-matched UI) tested and confirmed working.

---

## Summary

End-to-end delivery of a normalized schema, secure REST API, and a design-matched React UI across two modules — including catching and properly fixing a real data-modeling problem before it could propagate, building shared frontend components ahead of replicating the pattern, and extending into transactional multi-table writes and server-trusted financial calculations for Module 2.