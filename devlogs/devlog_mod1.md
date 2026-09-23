# Development Log — Business Management System

**Codexlabz Technologies | Full Stack Developer Internship** **Module 1: Client Enquiry Management**

---

## Sep 2, 2026 — Project Setup & Foundation

- Set up separate `/client` (React + Vite) and `/server` (Node/Express) folders as independent projects.
- Scaffolded Express with `/api/health` check route first, to verify the server independent of any feature logic.
- Resolved a port conflict (macOS AirPlay uses port 5000) by moving to 5001.
- Confirmed frontend-backend connectivity via a basic `fetch` call, verifying CORS and JSON middleware.
- Designed and created the initial `enquiries` table: used `ENUM` for fixed-choice fields (source, status, service), `VARCHAR` vs `TEXT` based on expected length, and auto-managed `created_at`/`updated_at`.
- Connected Express to MySQL via a `mysql2/promise` connection pool; credentials kept in `.env`, `.env` git-ignored from day one.

---

## Sep 7, 2026 — Full CRUD API

- Structured backend as routes → controllers → db, anticipating this pattern repeating across future modules.
- Built full CRUD + search for enquiries (`POST`, `GET` all/one, `PUT`, `DELETE`, `GET /search`).
- Used parameterized (`?`) queries throughout to prevent SQL injection.
- Ordered `/search` before `/:id` in routes to avoid Express's wildcard route capturing it incorrectly.
- Added proper status codes (`201`, `404`, `500`) and checked `affectedRows` to correctly detect "not found" on update/delete.
- Fully tested every endpoint in Postman before writing frontend code.
- Built initial React form + table, with shared state lifted into `App.jsx`.

---

## Sep 16, 2026 — Schema Redesign: Normalization

The key architectural decision of Module 1, made deliberately before starting Module 2.

- **Problem identified:** `enquiries` stored client info as plain text — would cause duplication once Quotations, Payments, Invoices, and AMC all needed the same client data.
- **Designed master tables:** `clients` (with `mobile_number UNIQUE` for dedup) and `employees` (with `employee_code` + `status` for soft-deletion).
- **Mapped the full system's relational model** upfront: master tables (clients, employees) vs. transaction tables (enquiries, quotations, payments, etc.), with `expenses` standing alone.
- **Chose raw SQL over an ORM** deliberately, to strengthen SQL fundamentals on a first production project.
- **Migrated safely, in stages:** added new FK columns → backfilled `clients` from existing data → linked via `mobile_number` → verified with a `JOIN` query → only then dropped the old redundant columns.
- Rewrote `enquiryController.js` around the new schema: added a `findOrCreateClient()` helper, used `LEFT JOIN` for the optional employee link (to avoid dropping unassigned enquiries), and aliased ambiguous columns.
- Built full CRUD for `clients`/`employees` (deliberately no client `DELETE`, to respect FK constraints — soft-delete would be the correct future approach).
- Debugged an Express startup crash caused by a route referencing a controller function removed mid-rewrite.
- Re-verified the entire CRUD + search flow in Postman against the new schema.

---

## Sep 20, 2026 — Frontend Integration with Normalized Schema

- Wired `EnquiryForm.jsx` to fetch real employees and render them as a dropdown, replacing free text.
- Fixed a field-naming mismatch (`employee_id` from the API vs. `assigned_employee_id` expected by the form) so editing correctly pre-selects the assigned employee.
- Updated the table to show `employee_name` with an "Unassigned" fallback.

---

## Sep 24, 2026 — UI/UX Overhaul, Design Match, Repo Cleanup

- Extracted design tokens from a Figma reference (navy sidebar, pink accent, pastel status pills, Plus Jakarta Sans).
- Built shared, reusable components first — `Layout` (sidebar/topbar + routing), `StatusBadge`, `StatCard` — so future modules inherit consistency automatically instead of each being styled separately.
- Rebuilt the Enquiries page to match the design: search bar, client-side status filter tabs, and the exact column set from the reference.
- Built a real Dashboard showing live enquiry data, using `—` instead of `0` for modules that don't exist yet, to avoid implying false data.
- Iterated the Add/Edit UI from a slide-over to a centered modal to match the actual Figma mock, including `stopPropagation()` so clicks inside don't trigger "click outside to close."
- **Repo hygiene:** accidentally committed `.vscode`/`.postman`/`postman`; untracked with `git rm -r --cached` and added `.gitignore` entries. Confirmed no real secrets were exposed.

---

## Summary

End-to-end delivery of a normalized schema, secure REST API, and a design-matched React UI — including catching and properly fixing a real data-modeling problem before it could propagate across future modules, and building shared frontend components ahead of replicating the pattern six more times.