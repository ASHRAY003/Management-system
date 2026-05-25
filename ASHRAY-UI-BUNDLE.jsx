/* ============================================================================
   ASHRAY UI — Performance Management Frontend Bundle
   ----------------------------------------------------------------------------
   This file concatenates every frontend source needed to reproduce the
   Worker / Manager (client) / Goals & OKRs / Reviews / 1:1 modules
   from the Payo WFM Performance Management module.

   Stack: React 18 + ReactDOM (UMD via <script>) + in-browser Babel.
   No bundler. Each <script type="text/babel"> defines components on
   `window` (e.g. window.PerformanceStore, components attached implicitly
   through global scope inside babel-transformed scripts).

   ============================================================================
   ROUTING MAP   (from app.html — copy verbatim into your new project)
   ============================================================================
   Hash routes are read by `useHash()` and dispatched in `renderView(hash)`.

   Auth
     #/login                  → <LoginScreen />

   Client / Manager
     #/client/dashboard       → <ClientDashboard />
     #/client/okrs            → <ClientOKRs />
     #/client/create-goal     → <Shell><GoalStepper kind="goal" .../></Shell>
     #/client/goal-detail     → <Shell><GoalDetail role="manager" .../></Shell>
     #/client/reviews         → <ClientReviews />
     #/client/all-cycles      → <ClientAllCycles />
     #/client/meetings        → <ClientMeetings />
     #/client/notes           → <Shell><MeetingNotesEditor .../></Shell>
     #/client/notifications   → <NotificationsPage persona="client" />
     #/projects               → <ProjectsPage />

   Worker
     #/worker/dashboard       → <WorkerDashboard />
     #/worker/projects        → <ProjectsPage persona="worker" />
     #/worker/goals           → <WorkerGoals />
     #/worker/meetings        → <WorkerMeetings />
     #/worker/reviews         → <WorkerReviews />
     #/worker/reviews/all     → <AllReviewCyclesPage />
     #/worker/notifications   → <NotificationsPage persona="worker" />

   ============================================================================
   CROSS-REFERENCES   (which file calls which)
   ============================================================================
   shared.jsx
     ├─ exports: <Shell>, navigation chrome, common UI primitives
     └─ used by: every screen below

   frames/performance-store.jsx
     ├─ exports: window.PerformanceStore  (REST client + in-memory store)
     ├─ talks to: http://localhost:4000/api
     └─ used by: every screen for data fetch / mutation

   frames/login.jsx              → calls PerformanceStore.login()
   frames/notifications.jsx      → reads PerformanceStore.notifications
   frames/projects.jsx           → standalone module, persona-aware

   Goals & OKRs
     frames/worker-goals.jsx     → opens GoalStepper, GoalDetail
     frames/client-okrs.jsx      → opens GoalStepper, GoalDetail
     frames/goal-stepper.jsx     → invoked from both worker & client routes
     frames/goal-detail.jsx      → invoked from both

   Reviews
     frames/worker-reviews.jsx   → opens WorkerSelfReview, AllReviewCyclesPage
     frames/client-reviews.jsx   → opens ManagerReviewForm, ReviewCycleStepper
     frames/worker-self-review.jsx
     frames/manager-review-form.jsx
     frames/review-cycle-stepper.jsx
     frames/all-review-cycles.jsx

   1:1 Meetings
     frames/worker-meetings.jsx  → opens MeetingNotesEditor
     frames/client-meetings.jsx  → opens MeetingNotesEditor
     frames/meeting-notes.jsx    → invoked from both

   Dashboards
     frames/worker-dashboard.jsx
     frames/client-dashboard.jsx
     frames/projects.jsx

   ============================================================================
   HOW TO PORT TO A REAL BUNDLER (Vite / Next / CRA)
   ============================================================================
   1. Add `import React, { useState, useEffect } from 'react'` at the top of
      every file (currently React is global from the <script> tag).
   2. Replace `window.PerformanceStore.*` with named imports from a
      converted module, OR keep it global by exporting a singleton.
   3. Replace `<script type="text/babel">` references in app.html with the
      router of your choice (React Router, Next.js app dir, etc).
   4. tokens.css is plain CSS variables — copy into your global stylesheet.
   5. The `<Shell>` wrapper provides the left nav + top bar; wrap each
      route in it as shown above.

   ============================================================================


/* ============================================================================
   FILE: tokens.css
   ============================================================================ */

/* ============================================================
   Payo WFM tokens — colors, spacing, type, radii, shadows
   Sourced from the design system (no new colors invented).
   ============================================================ */

@font-face { font-family: 'Nunito Sans'; font-style: normal; font-weight: 400 700; font-display: swap;
  src: url("assets/nunito-sans.woff2") format('woff2'); }
@font-face { font-family: 'Material Symbols Rounded'; font-style: normal; font-weight: 100 700; font-display: block;
  src: url("assets/material-symbols.woff2") format('woff2'); }

.ms {
  font-family: 'Material Symbols Rounded';
  font-weight: normal; font-style: normal; font-size: 20px; line-height: 1;
  letter-spacing: normal; text-transform: none; display: inline-block;
  white-space: nowrap; word-wrap: normal; direction: ltr;
  font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  user-select: none;
}
.ms.filled { font-variation-settings: 'FILL' 1, 'wght' 500; }

:root {
  /* Brand scales */
  --brand-blue-50:#F4FAFE; --brand-blue-100:#EDF6FE; --brand-blue-200:#D0E7F9;
  --brand-blue-300:#8CC9F8; --brand-blue-400:#5FB2FF; --brand-blue-500:#0075E1;
  --brand-blue-600:#1257A9; --brand-blue-700:#0D3C61;

  --brand-red-100:#FDEDEC; --brand-red-200:#FFC9C6; --brand-red-300:#F18D85;
  --brand-red-400:#FF5C3B; --brand-red-500:#E31B0C; --brand-red-600:#9F1308;
  --brand-red-700:#710E06;

  --brand-green-100:#EBF8F2; --brand-green-200:#C8F1DE; --brand-green-300:#98EDC4;
  --brand-green-400:#31DA89; --brand-green-500:#00A75B; --brand-green-600:#007540;

  --brand-gold-100:#FEF3EB; --brand-gold-200:#FFDDC3; --brand-gold-300:#F6B680;
  --brand-gold-400:#FFB547; --brand-gold-500:#ED6C02; --brand-gold-600:#A64C01;

  --brand-pink-200:#FFDEFF; --brand-pink-300:#ECADEB; --brand-pink-500:#D85AD6;
  --brand-pink-600:#6C2D6B;

  --brand-purple-100:#F7F3FF; --brand-purple-200:#E3D6FF; --brand-purple-300:#BDA0FE;
  --brand-purple-400:#9A6CFF; --brand-purple-500:#702FFF; --brand-purple-600:#4716B3;
  --brand-purple-700:#31194C;

  --brand-blueberry-200:#D6DEFF; --brand-blueberry-300:#A8B9FF; --brand-blueberry-500:#5173FF;
  --brand-blueberry-600:#3950B3; --brand-blueberry-700:#283980;

  /* Neutrals */
  --white:#FFFFFF; --grey-50:#F7F7F7; --grey-100:#EFEFEF; --grey-200:#DCDCDC;
  --grey-300:#A8A8A8; --grey-500:#878787; --grey-600:#666666; --grey-700:#252526;

  /* Semantic */
  --primary-main:var(--brand-blue-500); --primary-dark:var(--brand-blue-600); --primary-bg:var(--brand-blue-100);
  --info-main:#59B0EF; --info-dark:#3F7DAA; --info-bg:#EEF7FD;
  --success-main:var(--brand-green-500); --success-dark:var(--brand-green-600); --success-bg:var(--brand-green-100);
  --warning-main:var(--brand-gold-500); --warning-dark:var(--brand-gold-600); --warning-bg:var(--brand-gold-100);
  --error-main:var(--brand-red-500); --error-dark:var(--brand-red-600); --error-bg:var(--brand-red-100);

  --fg-primary:var(--grey-700); --fg-secondary:var(--grey-600); --fg-disabled:var(--grey-500);
  --bg-paper:var(--white); --bg-app:#FAFAFA; --bg-sidebar:#1F2933;
  --border-subtle:var(--grey-100); --border-default:var(--grey-200); --border-strong:var(--grey-300);

  --gradient-button:linear-gradient(95.74deg, #D85AD6 -53.26%, #0075E1 118.75%);
  --gradient-button-hover:linear-gradient(95.74deg, #5173FF -30.01%, #973F96 142.86%);
  --gradient-bg:linear-gradient(268deg,#FFE6DD -0.13%,#FDD2C7 17.29%,#F8D3DC 40.65%,#F1D5EB 58.79%,#E4D9F5 78.85%,#E6EDFC 99.09%);
  --gradient-progress:linear-gradient(96deg, rgb(216,90,214) -53.26%, rgb(0,117,225) 109.15%);

  --font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ============================================================
   Reset + base
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body {
  background: #F1EFEC; color: var(--fg-primary);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}

/* ============================================================
   App shell
   ============================================================ */
.app { display: grid; grid-template-columns: 248px 1fr; min-height: 100%; background: #FAFAFA; height:100%;}
.app.admin-shell { background: #F5F4FA; }
.app.worker-shell { background: #FAFAFA; }
.app .content { display: flex; flex-direction: column; min-width:0; height:100%; }
.app .page { padding: 24px 32px 40px; flex:1; overflow:auto; }
.app .page::-webkit-scrollbar { display: none; }
.app .page { scrollbar-width: none; }

/* ----- Sidebar ----- */
.sb { background:#1F2933; color:#fff; display:flex; flex-direction:column; padding:14px 12px; overflow:hidden;}
.sb .brand { display:flex; align-items:center; gap:10px; padding:6px 8px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom:8px; }
.sb .brand .logo { width:32px; height:32px; border-radius:9px; background: var(--brand-blue-500);
  display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:15px; letter-spacing:-0.02em; flex-shrink:0;}
.sb .brand .name { font-weight:800; font-size:15px; letter-spacing:-0.01em; }
.sb .brand .sub { font-size:11px; color: rgba(255,255,255,0.6); margin-top:1px; }
.sb .role-pill { margin: 0 6px 12px; padding: 8px 10px; background: rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.08); border-radius: 8px;
  display:flex; align-items:center; gap:8px; font-size:11px; color: rgba(255,255,255,0.75);
  font-weight:600; }
.sb .role-pill .ms { font-size:14px; color: var(--brand-blue-400); }
.sb .role-pill.admin .ms { color: var(--brand-pink-300); }
.sb .role-pill.worker .ms { color: var(--brand-green-300); }
.sb .group { font-size:10px; text-transform:uppercase; letter-spacing:0.08em;
  color: rgba(255,255,255,0.45); padding:14px 10px 6px; font-weight:700; }
.sb .nav { display:flex; flex-direction:column; gap:1px; }
.sb .item { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:7px;
  font-size:13.5px; color: rgba(255,255,255,0.78); cursor:pointer; user-select:none; line-height:1;}
.sb .item:hover { background: rgba(255,255,255,0.06); color:#fff; }
.sb .item.active { background: var(--brand-blue-500); color:#fff; font-weight:600; }
.sb .item .ms { font-size:19px; flex-shrink:0; }
.sb .item.disabled { opacity:0.4; cursor:not-allowed; }
.sb .item.disabled .ms.lock { font-size:13px; margin-left:auto; opacity:0.6;}
.sb .item .badge { margin-left:auto; background: var(--brand-pink-500); color:#fff;
  font-size:10px; padding:2px 7px; border-radius:40px; font-weight:700; }
.sb .item .badge.amber { background: var(--warning-main); }
.sb .footer { margin-top:auto; padding: 12px 10px 6px; font-size:11px; color: rgba(255,255,255,0.5);
  display:flex; align-items:center; gap:10px; border-top:1px solid rgba(255,255,255,0.08);}
.sb .footer .user-row { display:flex; align-items:center; gap:10px; width:100%; }
.sb .footer .user-row .info { line-height:1.2;}
.sb .footer .user-row .info .n { font-size:12px; font-weight:700; color:#fff; }
.sb .footer .user-row .info .e { font-size:10px; color: rgba(255,255,255,0.55);}

/* Sidebar variant: admin (Payoneer internal) */
.sb.admin { background: #261D43; }
.sb.admin .brand .logo { background: linear-gradient(135deg, #D85AD6, #702FFF); }
.sb.admin .item.active { background: var(--brand-purple-500); }
.sb.admin .role-pill { background: rgba(216,90,214,0.10); border-color: rgba(216,90,214,0.25); }

/* Sidebar variant: worker */
.sb.worker { background: #1F2933; }
.sb.worker .item.active { background: var(--brand-green-500); }

/* ----- Topbar ----- */
.tb { height:60px; background:#fff; border-bottom:1px solid var(--grey-100);
  display:flex; align-items:center; padding:0 24px; gap:14px; flex-shrink:0;}
.tb .crumb { color: var(--fg-secondary); font-weight:500; font-size:12px; display:flex; align-items:center; gap:6px;}
.tb .crumb .ms { font-size:14px; }
.tb .crumb .lead { color: var(--grey-700); font-weight:700;}
.tb .role-banner { display:flex; align-items:center; gap:8px; padding: 5px 12px;
  background: var(--brand-purple-100); color: var(--brand-purple-600);
  border:1px solid var(--brand-purple-200); border-radius: 999px;
  font-size:11.5px; font-weight:700; letter-spacing:0.02em;}
.tb .role-banner .ms { font-size:13px; }
.tb .role-banner.worker { background: var(--success-bg); color: var(--success-dark); border-color: var(--brand-green-200); }
.tb .role-banner.client { background: var(--brand-blue-100); color: var(--brand-blue-600); border-color: var(--brand-blue-200); }
.tb .search { flex:0 1 360px; margin-left:auto; display:flex; align-items:center; gap:8px;
  background: var(--grey-50); padding:7px 12px; border-radius:8px; color: var(--fg-secondary);
  border:1px solid var(--grey-100);}
.tb .search input { border:none; outline:none; background:transparent; font-family:var(--font-family);
  font-size:13px; flex:1; color:var(--grey-700); min-width:0;}
.tb .ib { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center;
  color:var(--fg-secondary); cursor:pointer; position:relative; }
.tb .ib:hover { background: var(--grey-100); color: var(--grey-700);}
.tb .ib .dot { position:absolute; top:7px; right:7px; width:8px; height:8px;
  background: var(--error-main); border-radius:50%; border:2px solid #fff; }
.tb .client-selector { display:flex; align-items:center; gap:10px; padding: 6px 12px 6px 8px;
  background: var(--grey-50); border:1px solid var(--grey-200); border-radius: 8px;
  font-size:13px; color: var(--grey-700); cursor:pointer;}
.tb .client-selector:hover { background:#fff; border-color: var(--brand-purple-300); }
.tb .client-selector .ms { color: var(--fg-secondary); }
.tb .client-selector .label { font-size:10px; color: var(--fg-secondary); text-transform:uppercase; letter-spacing:0.06em; font-weight:700;}
.tb .client-selector .name { font-weight:700; }

/* ----- Buttons ----- */
.btn { font-family: var(--font-family); font-weight:600; font-size:13.5px; border-radius:8px;
  padding:8px 16px; cursor:pointer; border:none; text-transform:none; box-shadow:none;
  display:inline-flex; align-items:center; gap:7px; transition: background .15s; line-height:1.2; white-space:nowrap;}
.btn-primary { color:#fff; background: var(--brand-blue-500); }
.btn-primary:hover { background: var(--brand-blue-600); }
.btn-gradient { color:#fff; background: var(--gradient-button); }
.btn-gradient:hover { background: var(--gradient-button-hover); }
.btn-outlined { color: var(--brand-blue-500); background:#fff; border:1px solid var(--brand-blue-300); }
.btn-outlined:hover { background: var(--brand-blue-50); border-color: var(--brand-blue-500); }
.btn-ghost { color: var(--grey-700); background:#fff; padding:8px 14px; border:1px solid var(--grey-200); }
.btn-ghost:hover { background: var(--grey-50); border-color: var(--grey-300); }
.btn-text { color: var(--brand-blue-500); background:transparent; padding:7px 10px; }
.btn-text:hover { background: var(--brand-blue-100); }
.btn-danger { color: var(--error-dark); background: var(--error-bg); }
.btn-danger:hover { background: var(--brand-red-200); }
.btn-purple { color:#fff; background: var(--brand-purple-500); }
.btn-purple:hover { background: var(--brand-purple-600); }
.btn-sm { font-size:12px; padding:6px 12px; border-radius:6px; }
.btn-lg { font-size:14.5px; padding:11px 22px; }
.btn .ms { font-size:17px; }
.btn-icon { padding: 7px; }
.btn-icon .ms { font-size: 18px; }

/* ----- Chip / pill ----- */
.chip { display:inline-flex; align-items:center; gap:6px; font-family: var(--font-family);
  font-weight:700; font-size:11px; border-radius:40px; padding:3px 10px; height:22px;
  line-height:1; letter-spacing:0.01em; white-space:nowrap;}
.chip .dot { width:6px; height:6px; border-radius:50%; }
.chip.active     { background:var(--success-bg); color:var(--success-dark); }
.chip.overdue    { background:var(--error-bg); color:var(--error-dark); }
.chip.draft      { background:var(--grey-100); color:var(--grey-700); }
.chip.progress   { background:var(--info-bg); color:var(--info-dark); }
.chip.completed  { background:var(--success-bg); color:var(--success-dark); }
.chip.warning    { background:var(--warning-bg); color:var(--warning-dark); }
.chip.contractor { background:var(--brand-purple-200); color:var(--brand-purple-700); }
.chip.employee   { background:var(--brand-blueberry-200); color:var(--brand-blueberry-700); }
.chip.on-track   { background:var(--success-bg); color:var(--success-dark); }
.chip.at-risk    { background:var(--warning-bg); color:var(--warning-dark); }
.chip.done       { background:var(--brand-purple-100); color:var(--brand-purple-700); }
.chip.lagging    { background:var(--warning-bg); color:var(--warning-dark); }
.chip.no-activity{ background:var(--grey-100); color:var(--grey-600); }
.chip.needs-support { background:var(--error-bg); color:var(--error-dark); }
.chip.eligible   { background:var(--brand-purple-100); color:var(--brand-purple-700); }
.chip.monitor    { background:var(--warning-bg); color:var(--warning-dark); }
.chip.review-due { background:var(--brand-blue-100); color:var(--brand-blue-600); }
.chip.owner      { background:#FFF3E5; color:#9A4A00; }
.chip.contrib    { background:var(--brand-blueberry-200); color:var(--brand-blueberry-700); }
.chip.stakeholder{ background:var(--grey-100); color:var(--grey-700); }
.chip.lg { font-size:12px; height:26px; padding: 4px 12px; }

/* ----- Avatar ----- */
.av { border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
  font-weight:700; color:#fff; flex-shrink:0; letter-spacing:0.02em; }
.av.xs { width:22px; height:22px; font-size:9px; }
.av.sm { width:30px; height:30px; font-size:11px; }
.av.md { width:38px; height:38px; font-size:13px; }
.av.lg { width:48px; height:48px; font-size:16px; }
.av.xl { width:64px; height:64px; font-size:20px; }
.av-stack { display:flex; }
.av-stack .av { margin-left:-8px; border:2px solid #fff; }
.av-stack .av:first-child { margin-left: 0; }
.av-more { background: var(--grey-100); color: var(--grey-700); }

/* ----- Card ----- */
.card { background:#fff; border-radius:12px; border:1px solid var(--grey-100);
  box-shadow: 0 1px 2px rgba(20,30,55,0.04), 0 2px 4px rgba(20,30,55,0.03);}
.card-pad { padding: 18px 20px; }
.card-head { padding: 16px 20px 14px; display:flex; align-items:center; justify-content:space-between;
  gap:12px; border-bottom: 1px solid var(--grey-100); }
.card-head .title { font-size:14px; font-weight:700; color:var(--grey-700); letter-spacing:-0.01em;}
.card-head .sub { font-size:11.5px; color:var(--fg-secondary); margin-top:3px; font-weight:500;}
.card-head .title .ms { color: var(--fg-secondary); font-size:18px; vertical-align: -3px; margin-right:4px;}

/* ----- KPI stat cards ----- */
.stats-row { display:grid; gap:14px; }
.stats-row.c-4 { grid-template-columns: repeat(4, 1fr); }
.stats-row.c-6 { grid-template-columns: repeat(6, 1fr); }
.stats-row.c-3 { grid-template-columns: repeat(3, 1fr); }
.stat {
  background:#fff; border:1px solid var(--grey-100); border-radius:12px;
  padding:16px 18px; display:flex; flex-direction:column; gap:4px; position:relative; overflow:hidden;
  box-shadow: 0 1px 2px rgba(20,30,55,0.03);
}
.stat .label { font-size:10.5px; color:var(--fg-secondary); text-transform:uppercase;
  letter-spacing:0.06em; font-weight:700; }
.stat .value-row { display:flex; align-items:baseline; gap:8px; margin-top:4px;}
.stat .value { font-size:28px; font-weight:700; color:var(--grey-700);
  letter-spacing:-0.02em; line-height:1.05; font-variant-numeric: tabular-nums; }
.stat .trend { font-size:11.5px; font-weight:700; display:flex; align-items:center; gap:2px; }
.stat .trend.up   { color: var(--success-dark); }
.stat .trend.down { color: var(--error-dark); }
.stat .trend.flat { color: var(--fg-secondary); }
.stat .trend .ms { font-size:14px; }
.stat .sub { font-size:11.5px; color:var(--fg-secondary); margin-top:2px; }
.stat .ico { position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; }
.stat .ico .ms { font-size:18px; }
.stat.blue   .ico { background: var(--brand-blue-100); color: var(--brand-blue-500); }
.stat.amber  .ico { background: var(--warning-bg); color: var(--warning-dark); }
.stat.green  .ico { background: var(--success-bg); color: var(--success-dark); }
.stat.neutral .ico { background: var(--grey-100); color: var(--grey-600); }
.stat.purple .ico { background: var(--brand-purple-100); color: var(--brand-purple-600); }
.stat.red    .ico { background: var(--error-bg); color: var(--error-dark); }
.stat.teal   .ico { background: #DCFBF4; color: #007F6E; }
.stat.pink   .ico { background: var(--brand-pink-200); color: var(--brand-pink-600); }

/* ----- Filter bar ----- */
.filter-bar { display:flex; align-items:center; gap:10px; padding: 12px 16px;
  background:#fff; border:1px solid var(--grey-100); border-radius: 10px; margin-bottom: 16px;
  flex-wrap: wrap;}
.filter-bar .lbl { font-size:11px; color: var(--fg-secondary); font-weight:700;
  text-transform:uppercase; letter-spacing:0.06em; margin-right: 4px;}
.filter-bar .sep { width:1px; height:18px; background: var(--grey-100); }
.filter { display:inline-flex; align-items:center; gap:6px; padding: 6px 10px;
  background: var(--grey-50); border:1px solid var(--grey-100); border-radius: 7px;
  font-size:12.5px; font-weight:600; color: var(--grey-700); cursor:pointer;}
.filter:hover { background:#fff; border-color: var(--grey-200); }
.filter .ms { font-size:15px; color: var(--fg-secondary); }
.filter .k { color: var(--fg-secondary); font-weight:600; margin-right:2px; }

/* ----- Table ----- */
.tbl { width:100%; font-size:13px; border-collapse: separate; border-spacing:0;
  background:#fff; border-radius:0; overflow:hidden;}
.tbl th { text-align:left; font-weight:700; padding:11px 16px; color:var(--fg-secondary);
  font-size:10.5px; text-transform:uppercase; letter-spacing:0.05em;
  border-bottom:1px solid var(--grey-100); background:var(--grey-50); white-space:nowrap;}
.tbl td { padding:14px 16px; border-bottom:1px solid var(--grey-50);
  color:var(--grey-700); vertical-align:middle; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover { background: var(--grey-50); }
.tbl tr.lagging-row { background: #FEF7EE; }
.tbl tr.lagging-row:hover { background: #FCEDD8; }
.tbl tr.flagged-row { background: #FEF3F2; }
.tbl .num { text-align:right; font-variant-numeric: tabular-nums; font-weight:600; }
.tbl .actions-cell { text-align:right; white-space:nowrap;}
.tbl-card { background:#fff; border-radius:12px; border:1px solid var(--grey-100); overflow:hidden;
  box-shadow: 0 1px 2px rgba(20,30,55,0.04);}

/* Cell helpers */
.worker-cell { display:flex; align-items:center; gap:10px; }
.worker-cell .name { font-weight:700; color:var(--grey-700); font-size:13px; line-height:1.2; }
.worker-cell .role { font-size:11px; color:var(--fg-secondary); margin-top:2px; line-height:1; }
.link-cell { display:inline-flex; align-items:center; gap:6px; font-size:12.5px;
  font-weight:600; color: var(--brand-blue-600); cursor:pointer;}
.link-cell:hover { text-decoration: underline;}
.link-cell .ms { font-size:14px; color: var(--brand-blue-500); }
.link-cell.muted { color: var(--fg-disabled); cursor:default;}
.link-cell.muted:hover { text-decoration:none; }

/* ----- Page header ----- */
.page-head { display:flex; align-items:flex-start; justify-content:space-between;
  gap:24px; margin-bottom: 18px; }
.page-head .h-title { font-size:24px; font-weight:800; color: var(--grey-700);
  letter-spacing:-0.02em; margin:0 0 4px; line-height:1.2; display:flex; align-items:center; gap:12px;}
.page-head .h-sub { font-size:13px; color: var(--fg-secondary); line-height:1.45; max-width:680px;}
.page-head .h-actions { display:flex; gap:10px; flex-shrink:0; }

/* ----- Progress bar ----- */
.pbar { position:relative; height:6px; background: var(--grey-100); border-radius:40px; overflow:hidden; }
.pbar > i { display:block; height:100%; background: var(--brand-blue-500); border-radius:40px; }
.pbar.lg { height:10px; }
.pbar.green > i { background: var(--success-main); }
.pbar.amber > i { background: var(--warning-main); }
.pbar.red > i { background: var(--error-main); }
.pbar.purple > i { background: var(--gradient-progress); }
.pbar-row { display:flex; align-items:center; gap:10px; }
.pbar-row .pbar { flex:1; min-width:60px;}
.pbar-row .pct { font-size:12px; font-weight:700; color: var(--grey-700);
  font-variant-numeric: tabular-nums; min-width:36px; text-align:right; }

/* ----- Callout ----- */
.callout { display:flex; gap:14px; padding:14px 18px; border-radius:10px;
  border:1px solid; align-items:flex-start; }
.callout .ms { font-size:22px; flex-shrink:0; }
.callout .b-title { font-weight:700; font-size:13.5px; line-height:1.3; color: var(--grey-700);}
.callout .b-body { font-size:12.5px; color: var(--fg-secondary); margin-top:4px; line-height:1.5; }
.callout.info    { background: var(--info-bg);    border-color: #BFDFF5; }
.callout.info    .ms { color: var(--info-dark); }
.callout.purple  { background: var(--brand-purple-100); border-color: var(--brand-purple-200); }
.callout.purple  .ms { color: var(--brand-purple-600); }
.callout.warning { background: var(--warning-bg); border-color: #FAD6AC; }
.callout.warning .ms { color: var(--warning-dark); }
.callout.danger  { background: var(--error-bg);   border-color: #F8C7C3; }
.callout.danger  .ms { color: var(--error-dark); }
.callout.success { background: var(--success-bg); border-color: #B7E6CC; }
.callout.success .ms { color: var(--success-dark); }
.callout.gradient { background: linear-gradient(96deg, rgba(216,90,214,0.07) 0%, rgba(0,117,225,0.08) 100%);
  border-color: var(--brand-purple-200); }
.callout.gradient .ms { color: var(--brand-purple-600); }

/* ----- Tabs ----- */
.tabs { display:flex; gap:0; border-bottom: 1px solid var(--grey-100); margin-bottom: 16px;
  padding: 0 4px;}
.tabs .tab { padding: 10px 16px; font-size:13.5px; font-weight:600; color: var(--fg-secondary);
  cursor:pointer; border-bottom: 2px solid transparent; margin-bottom:-1px; display:flex; align-items:center; gap:8px;
  transition: color .15s;}
.tabs .tab:hover { color: var(--grey-700); }
.tabs .tab.active { color: var(--brand-blue-600); border-bottom-color: var(--brand-blue-500); font-weight:700;}
.tabs .tab .count { background: var(--grey-100); color: var(--grey-700); border-radius: 40px;
  font-size:10.5px; padding: 2px 7px; font-weight:700;}
.tabs .tab.active .count { background: var(--brand-blue-100); color: var(--brand-blue-600);}
.tabs .tab .ms { font-size:15px; }
.tabs .tab .ms.lock { font-size:13px; opacity:0.7; }

/* ----- AI alert inline ----- */
.ai-flag { display:flex; gap:12px; padding: 14px; border-radius: 10px;
  background: linear-gradient(96deg, rgba(216,90,214,0.06) 0%, rgba(0,117,225,0.06) 100%);
  border:1px solid var(--brand-purple-200); align-items:flex-start;}
.ai-flag .glyph { width:32px; height:32px; border-radius: 50%;
  background: var(--gradient-button); color:#fff; display:flex; align-items:center; justify-content:center;
  flex-shrink:0;}
.ai-flag .glyph .ms { font-size: 18px;}
.ai-flag .b { flex:1; min-width:0;}
.ai-flag .b .t { font-size:12.5px; font-weight:700; color: var(--brand-purple-700); margin-bottom:3px;
  display:flex; align-items:center; gap:8px;}
.ai-flag .b .d { font-size:12.5px; color: var(--grey-700); line-height:1.45;}
.ai-flag .b .actions { display:flex; gap:8px; margin-top:10px;}

/* ----- Meeting card ----- */
.meeting { display:flex; gap:12px; padding: 14px 16px; border:1px solid var(--grey-100);
  border-radius: 10px; background:#fff;}
.meeting + .meeting { margin-top: 10px;}
.meeting .when { width: 72px; flex-shrink:0; text-align:center; padding-right: 12px;
  border-right: 1px solid var(--grey-100);}
.meeting .when .time { font-size:14px; font-weight:800; color: var(--grey-700); letter-spacing:-0.02em;
  font-variant-numeric: tabular-nums;}
.meeting .when .dur { font-size:10.5px; color: var(--fg-secondary); font-weight:600; margin-top:2px;}
.meeting .when .ap { font-size:10px; color: var(--fg-secondary); font-weight:700; text-transform:uppercase;
  letter-spacing:0.04em;}
.meeting .b { flex:1; min-width:0;}
.meeting .b .top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px;}
.meeting .b .who { display:flex; align-items:center; gap:10px;}
.meeting .b .who .name { font-size:13.5px; font-weight:700; color: var(--grey-700); line-height:1.2;}
.meeting .b .who .role { font-size:11px; color: var(--fg-secondary); margin-top:2px;}
.meeting .b .agenda { font-size:12.5px; color: var(--grey-700); margin-top:10px; line-height:1.5;}
.meeting .b .links { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;}
.meeting .b .actions { display:flex; gap:8px; flex-shrink:0;}
.meeting.upcoming { border-color: var(--brand-blue-200); background: linear-gradient(0deg, #fff 70%, var(--brand-blue-50));}
.meeting.now { border-color: var(--brand-blue-500); box-shadow: 0 0 0 3px var(--brand-blue-100);}
.meeting.past { opacity: 0.86; background: var(--grey-50); border-style: dashed;}

.day-row { display:flex; align-items:center; gap:12px; margin: 18px 0 10px; }
.day-row:first-child { margin-top: 4px; }
.day-row .label { font-size:11px; font-weight:800; color: var(--grey-700);
  text-transform:uppercase; letter-spacing:0.08em;}
.day-row .date { font-size:11px; color: var(--fg-secondary); font-weight:600;}
.day-row .count { font-size:11px; color: var(--fg-secondary); font-weight:600; padding: 2px 8px;
  background: var(--grey-100); border-radius:40px;}
.day-row .line { flex:1; height:1px; background: var(--grey-100); }

/* ----- OKR card ----- */
.okr-card { padding: 16px 18px; border:1px solid var(--grey-100); border-radius: 11px;
  background:#fff; }
.okr-card + .okr-card { margin-top: 12px; }
.okr-card.locked { background: var(--grey-50); border-style: dashed;}
.okr-card .o-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px;}
.okr-card .o-title-block { flex:1; min-width:0;}
.okr-card .o-eyebrow { font-size:10.5px; font-weight:800; color: var(--fg-secondary);
  text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; display:flex; gap:6px; align-items:center;}
.okr-card .o-title { font-size:15.5px; font-weight:700; color: var(--grey-700); letter-spacing:-0.01em;
  line-height:1.3; margin-bottom:4px;}
.okr-card .o-desc { font-size:12.5px; color: var(--fg-secondary); line-height:1.45;}
.okr-card .o-meta { display:flex; align-items:center; gap:16px; margin-top:12px; flex-wrap:wrap;}
.okr-card .o-meta .item { display:flex; align-items:center; gap:6px; font-size:11.5px; color: var(--fg-secondary); font-weight:600;}
.okr-card .o-meta .item .ms { font-size:14px; color: var(--fg-disabled);}
.okr-card .o-meta .item .v { color: var(--grey-700); font-weight:700;}
.okr-card .o-prog { display:grid; grid-template-columns: minmax(160px, 1fr) 200px; gap: 16px; align-items:center;
  margin-top: 14px; padding-top:14px; border-top:1px solid var(--grey-100);}
.okr-card .o-prog .pbar-row { width:200px; min-width:200px;}
.okr-card .o-actions { display:flex; gap:8px; flex-shrink:0;}

.kr-list { margin-top:14px; padding-top:14px; border-top:1px solid var(--grey-100);
  display:flex; flex-direction:column; gap:10px;}
.kr { display:grid; grid-template-columns: 24px 1fr 60px 200px 80px; gap: 12px; align-items:center;}
.kr .num { font-size:10.5px; font-weight:800; color: var(--fg-disabled);
  text-transform:uppercase; letter-spacing:0.04em;}
.kr .text { font-size:12.5px; color: var(--grey-700); line-height:1.35;}
.kr .target { font-size:11px; color: var(--fg-secondary); font-weight:600; font-variant-numeric: tabular-nums; text-align:right;}

/* ----- Feed item ----- */
.feed-item { display:flex; gap:12px; padding: 12px 16px; border-bottom: 1px solid var(--grey-50);
  align-items:flex-start;}
.feed-item:last-child { border-bottom: none; }
.feed-item .b { flex:1; min-width:0;}
.feed-item .b .t { font-size:13px; color: var(--grey-700); line-height:1.4;}
.feed-item .b .t strong { font-weight:700;}
.feed-item .b .meta { font-size:11px; color: var(--fg-secondary); margin-top:3px; display:flex; gap:8px; align-items:center;}

/* ----- Status sparkline / mini-chart ----- */
.spark { display:flex; align-items:flex-end; gap:2px; height:24px;}
.spark .b { width: 5px; background: var(--brand-blue-300); border-radius:1px;}
.spark.green .b { background: var(--success-main); opacity:0.55;}
.spark.green .b.curr { opacity:1;}
.spark .b.curr { background: var(--brand-blue-500);}

/* ----- Trend chip ----- */
.trend-chip { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:700;
  padding: 2px 6px; border-radius: 4px; line-height:1;}
.trend-chip.up   { color: var(--success-dark); background: var(--success-bg);}
.trend-chip.down { color: var(--error-dark); background: var(--error-bg);}
.trend-chip .ms { font-size: 12px;}

/* ----- Misc utilities ----- */
.row { display:flex; }
.col { display:flex; flex-direction: column; }
.gap-2 { gap:8px; } .gap-3 { gap:12px; } .gap-4 { gap:16px; } .gap-5 { gap:20px;} .gap-6 { gap:24px; }
.items-center { align-items:center; }
.items-start { align-items:flex-start; }
.between { justify-content:space-between; }
.flex-1 { flex:1; min-width:0;}
.text-secondary { color: var(--fg-secondary); }
.text-xs { font-size:11px; } .text-sm { font-size:12px; } .text-md { font-size:13px; }
.fw-7 { font-weight:700; } .fw-6 { font-weight:600; }
.mt-2 { margin-top:8px; } .mt-3 { margin-top:12px; } .mt-4 { margin-top:16px; } .mt-6 { margin-top:24px; }
.mb-2 { margin-bottom:8px; } .mb-3 { margin-bottom:12px; } .mb-4 { margin-bottom:16px; } .mb-6 { margin-bottom:24px; }
.tabular { font-variant-numeric: tabular-nums; }
.truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* ----- Modal demo ----- */
.modal-demo { position: relative; padding: 4px; }
.modal-overlay { position:absolute; inset:0; background: rgba(20,30,55,0.32);
  border-radius: 12px; backdrop-filter: blur(2px);}
.modal { position:absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 460px; max-width: 96%; background:#fff; border-radius: 14px; padding: 22px 24px;
  box-shadow: 0 14px 40px rgba(20,30,55,0.18); border:1px solid var(--grey-100);}
.modal h3 { margin:0 0 6px; font-size:17px; font-weight:800; color: var(--grey-700); letter-spacing:-0.01em;
  display:flex; align-items:center; gap:10px;}
.modal h3 .glyph { width: 32px; height:32px; border-radius:9px; background: var(--brand-blue-100);
  color: var(--brand-blue-500); display:flex; align-items:center; justify-content:center;}
.modal .body { font-size:13px; color: var(--fg-secondary); line-height:1.5; margin-bottom: 18px;}
.modal .body .pill-row { display:flex; gap:6px; margin: 10px 0; flex-wrap:wrap;}
.modal .footer { display:flex; justify-content:flex-end; gap:8px; padding-top: 14px;
  border-top: 1px solid var(--grey-100);}

/* ============================================================
   Review Editor (Client · Write a review)
   ============================================================ */
.re-textarea { border: 1px solid var(--grey-200); border-radius: 10px; overflow: hidden;
  background: #fff; }
.re-textarea:focus-within { border-color: var(--brand-blue-500); box-shadow: 0 0 0 3px rgba(0,117,225,0.10);}
.re-toolbar { display: flex; align-items: center; gap: 2px; padding: 6px 10px;
  background: var(--grey-50); border-bottom: 1px solid var(--grey-100); }
.re-toolbar .tb-btn { width: 30px; height: 30px; border-radius: 6px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; color: var(--grey-600); cursor: pointer;}
.re-toolbar .tb-btn:hover { background: var(--grey-100); color: var(--grey-700);}
.re-toolbar .tb-btn .ms { font-size: 18px;}
.re-toolbar .tb-sep { width: 1px; height: 18px; background: var(--grey-200); margin: 0 6px;}
.re-toolbar .tb-right { margin-left: auto; }
.re-body { padding: 14px 16px; min-height: 140px; font-size: 14px; color: var(--grey-700); line-height: 1.6;
  outline: none;}
.re-body[contenteditable]:empty::before { content: attr(data-placeholder);
  color: var(--fg-disabled); font-style: italic;}
.re-footer { display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-top: 1px solid var(--grey-100); background: var(--grey-50);
  font-size: 11.5px; color: var(--fg-secondary); }
.re-footer .char-count { font-weight: 600; }
.re-footer .saved-i { display: inline-flex; align-items: center; gap: 4px; color: var(--success-dark); font-weight: 700;}
.re-footer .saved-i .ms { color: var(--success-main); font-size: 16px;}

.re-outcome { display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border: 1px solid var(--grey-200); border-radius: 8px; cursor: pointer;
  font-size: 13px; transition: all .15s;}
.re-outcome:hover { background: var(--grey-50); }
.re-outcome input { display: none; }
.re-outcome .re-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--grey-300);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #fff;}
.re-outcome .re-radio.on { background: var(--brand-blue-500); border-color: var(--brand-blue-500); }
.re-outcome .re-radio.on .ms { color: #fff; font-size: 12px; }
.re-outcome:has(input:checked) { border-color: var(--brand-blue-500); background: var(--brand-blue-50);}

/* ============================================================
   Star rating
   ============================================================ */
.stars { display:inline-flex; gap:2px; align-items:center; }
.stars .ms { font-size:18px; color: var(--grey-200); }
.stars .ms.on { color: var(--warning-main); font-variation-settings: 'FILL' 1, 'wght' 500; }
.stars.sm .ms { font-size:14px; }
.stars.lg .ms { font-size:22px; }

/* ============================================================
   Review tile (Worker · date-wise reviews)
   ============================================================ */
.review-tile { background: #fff; border: 1px solid var(--grey-100); border-radius: 12px;
  padding: 16px 18px; font-family: var(--font-family); text-align: left; cursor: pointer;
  transition: all .15s; box-shadow: 0 1px 2px rgba(20,30,55,0.03); display: block; width: 100%;}
.review-tile:hover { border-color: var(--brand-blue-300); box-shadow: 0 4px 14px rgba(0,117,225,0.08);
  transform: translateY(-1px);}

/* Goal Detail page (shared between client and worker) */
.goal-detail { background: #FAFAFA; min-height: 100%; margin: -24px -32px -40px;
  display: flex; flex-direction: column; }
.goal-detail .strip { height: 4px; background: var(--brand-blue-500); }
.goal-detail .gd-crumbbar { background: #fff; padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;}
.goal-detail .gd-crumbbar .left { display: flex; align-items: center; gap: 10px; font-size: 14px;}
.goal-detail .gd-crumbbar .back { width: 32px; height: 32px; border-radius: 6px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; color: var(--fg-secondary); cursor: pointer;}
.goal-detail .gd-crumbbar .back:hover { background: var(--grey-100); color: var(--grey-700); }
.goal-detail .gd-crumbbar .crumb-lead { color: var(--brand-blue-600); font-weight: 700; cursor: pointer; }
.goal-detail .gd-crumbbar .crumb-curr { color: var(--grey-700); font-weight: 500; }

.goal-detail .gd-body { padding: 28px 32px 48px; max-width: 1280px; margin: 0 auto; width: 100%; flex: 1; overflow: auto; }
.goal-detail .gd-body::-webkit-scrollbar { display: none; }
.goal-detail .gd-body { scrollbar-width: none; }

.goal-detail .gd-head { margin-bottom: 24px; }
.goal-detail .gd-title { font-size: 30px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.02em;
  margin: 0 0 12px; line-height: 1.2; max-width: 880px; display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;}
.goal-detail .gd-edit-i { background: transparent; border: none; cursor: pointer; color: var(--brand-blue-500);
  width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; padding: 0;}
.goal-detail .gd-edit-i .ms { font-size: 16px;}
.goal-detail .gd-edit-i:hover { color: var(--brand-blue-600);}
.goal-detail .gd-desc { font-size: 14px; color: var(--fg-secondary); margin-bottom: 16px; display: inline-flex;
  align-items: center; font-style: italic;}

.goal-detail .gd-tag-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;}
.goal-detail .gd-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px;
  background: var(--brand-blue-50); border: 1px solid var(--brand-blue-200); border-radius: 999px;
  font-size: 12.5px; font-weight: 700; color: var(--grey-700); cursor: pointer;}
.goal-detail .gd-pill .ms { font-size: 14px; color: var(--brand-blue-500);}
.goal-detail .gd-pill.perf { background: rgba(0,167,91,0.08); border-color: var(--brand-green-200); color: var(--success-dark);}
.goal-detail .gd-pill.perf .ms { color: var(--success-main);}

.goal-detail .gd-meta { display: flex; gap: 44px; padding-top: 14px; border-top: 1px solid var(--grey-100); }
.goal-detail .gd-meta-cell .k { font-size: 11px; color: var(--fg-secondary); text-transform: uppercase;
  letter-spacing: 0.06em; font-weight: 700; margin-bottom: 6px;}
.goal-detail .gd-meta-cell .gd-meta-v { display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid var(--grey-200); border-radius: 8px; padding: 6px 14px;
  font-size: 14px; font-weight: 700; color: var(--grey-700); cursor: pointer;}
.goal-detail .gd-meta-cell .gd-meta-v .ms { font-size: 18px; }

.goal-detail .gd-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 18px; }

.goal-detail .gd-card { background: #fff; border-radius: 12px; border: 1px solid var(--grey-100);
  box-shadow: 0 1px 2px rgba(20,30,55,0.04); }

.goal-detail .gd-progress-head { padding: 18px 22px; border-bottom: 1px solid var(--grey-100); }
.goal-detail .gd-progress-head .lbl { font-size: 16px; font-weight: 800; color: var(--grey-700); margin-bottom: 12px; letter-spacing: -0.01em;}
.goal-detail .gd-pct { font-size: 16px; font-weight: 800; color: var(--grey-700); font-variant-numeric: tabular-nums;}

.goal-detail .gd-kr-block { padding: 18px 22px 8px; }
.goal-detail .gd-kr-head { font-size: 16px; font-weight: 800; color: var(--grey-700); margin-bottom: 18px; letter-spacing: -0.01em;}
.goal-detail .gd-kr-row { display: grid; grid-template-columns: 18px 36px 130px 1fr auto 28px;
  gap: 14px; align-items: center; padding: 10px 0; }
.goal-detail .gd-kr-row + .gd-kr-row { border-top: 1px solid var(--grey-50); }
.goal-detail .gd-drag { background: transparent; border: none; cursor: grab; padding: 0;
  color: var(--fg-disabled); display: flex; align-items: center;}
.goal-detail .gd-drag .ms { font-size: 16px;}
.goal-detail .gd-kr-val { background: var(--grey-100); border-radius: 999px; padding: 6px 12px;
  font-size: 13px; font-weight: 700; color: var(--grey-700); text-align: center;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 130px;}
.goal-detail .gd-kr-val .ms.refresh { color: var(--fg-secondary); font-size: 14px;}
.goal-detail .gd-kr-text { font-size: 14px; color: var(--grey-700); line-height: 1.4; }
.goal-detail .gd-kr-more { background: transparent; border: none; cursor: pointer; color: var(--fg-secondary);
  width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center;}
.goal-detail .gd-kr-more:hover { background: var(--grey-100); }
.goal-detail .gd-kr-add { display: flex; justify-content: space-between; align-items: center;
  padding: 18px 0 8px; font-size: 13.5px; }
.goal-detail .gd-kr-add span { color: var(--fg-secondary); font-weight: 600;}
.goal-detail .gd-kr-add a { color: var(--brand-blue-500); font-weight: 700; cursor: pointer;}
.goal-detail .gd-kr-add a:hover { color: var(--brand-blue-600); text-decoration: underline; }

.goal-detail .gd-section-head { padding: 14px 20px 8px; font-size: 15px; font-weight: 800; color: var(--grey-700);
  letter-spacing: -0.01em;}
.goal-detail .gd-legend { display: flex; gap: 16px; justify-content: center; padding: 4px 16px 14px;
  font-size: 11px; color: var(--fg-secondary); font-weight: 600;}
.goal-detail .gd-legend span { display: inline-flex; align-items: center; gap: 5px;}
.goal-detail .gd-legend .dot { width: 8px; height: 8px; display: inline-block;}
.goal-detail .gd-legend .dot.today { background: var(--brand-blue-500); border-radius: 50%;}
.goal-detail .gd-legend .dot.start { background: var(--grey-700); }
.goal-detail .gd-legend .dot.due   { background: var(--error-main); transform: rotate(45deg);}

.goal-detail .gd-link { color: var(--brand-blue-500); font-size: 13.5px; font-weight: 700; cursor: pointer;}
.goal-detail .gd-link:hover { color: var(--brand-blue-600); text-decoration: underline;}

.goal-detail .gd-attachment { display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: var(--grey-50); border-radius: 8px;}
.goal-detail .gd-attachment .t { font-size: 13px; font-weight: 700; color: var(--grey-700); line-height: 1.3;}
.goal-detail .gd-attachment .d { font-size: 11px; color: var(--fg-secondary); margin-top: 2px;}

/* Client card (admin overview · pickable) */
.client-card { background: #fff; border: 1px solid var(--grey-100); border-radius: 12px;
  padding: 16px 18px; font-family: var(--font-family); text-align: left; cursor: pointer;
  transition: all .15s; box-shadow: 0 1px 2px rgba(20,30,55,0.03);}
.client-card:hover { border-color: var(--brand-purple-300); box-shadow: 0 4px 14px rgba(70,22,179,0.10);
  transform: translateY(-1px);}
.client-card:hover .ms { color: var(--brand-purple-500);}

/* ============================================================
   Performance horizontal sub-nav (lives just under the topbar)
   ============================================================ */
.perf-tabs { display: flex; align-items: stretch; gap: 0; background: #fff;
  border-bottom: 1px solid var(--grey-100); padding: 0 32px; margin: -24px -32px 20px;
  overflow-x: auto; scrollbar-width: none;}
.perf-tabs::-webkit-scrollbar { display: none; }
.perf-tab { padding: 14px 18px 12px; font-size: 13.5px; font-weight: 600; color: var(--fg-secondary);
  cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; white-space: nowrap;
  transition: color .15s, border-color .15s;}
.perf-tab:hover { color: var(--grey-700); }
.perf-tab.active { color: var(--grey-700); font-weight: 800; border-bottom-color: var(--brand-purple-500); }
.perf-tabs-spacer { flex: 1; }
.perf-tabs-end { padding: 14px 0 12px; font-size: 13.5px; font-weight: 700; color: var(--brand-blue-500);
  cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;}
.perf-tabs-end .ms { font-size: 18px; }

/* Impersonation (view-as-client) banner — strip above the client Shell */
.impersonation-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: linear-gradient(96deg, #261D43 0%, #4716B3 100%); color: #fff;
  padding: 10px 32px; flex-shrink: 0;}
.impersonation-bar .left { display: flex; align-items: center; gap: 12px; }
.impersonation-bar .left > .ms { font-size: 22px; color: var(--brand-pink-300); }
.impersonation-bar .t { font-size: 13px; font-weight: 600;}
.impersonation-bar .t strong { font-weight: 800; color: #fff; }
.impersonation-bar .d { font-size: 11.5px; color: rgba(255,255,255,0.7); margin-top: 1px;}
.impersonation-bar .btn-ghost { background: rgba(255,255,255,0.10); color: #fff;
  border-color: rgba(255,255,255,0.20);}
.impersonation-bar .btn-ghost:hover { background: rgba(255,255,255,0.18); }

/* 1:1 Notes editor takeover */
.notes-takeover { background: #FAFAFA; min-height: 100%; margin: -24px -32px -40px;
  display: flex; flex-direction: column; }
.notes-takeover .topbar { padding: 18px 32px; background: #fff; border-bottom: 1px solid var(--grey-100);
  display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.notes-takeover .topbar .lead { display: flex; align-items: center; gap: 14px; }
.notes-takeover .topbar .lead .back { width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; color: var(--fg-secondary);
  background: transparent; border: none; cursor: pointer;}
.notes-takeover .topbar .lead .back:hover { background: var(--grey-100); color: var(--grey-700);}
.notes-takeover .topbar .lead h2 { margin: 0; font-size: 22px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.02em;
  display: flex; align-items: center; gap: 12px;}
.notes-takeover .topbar .lead h2 .av { margin-right: 4px; }
.notes-takeover .topbar .actions { display: flex; gap: 10px; align-items: center; }

.notes-body { padding: 28px 32px 48px; max-width: 1024px; margin: 0 auto; width: 100%; flex: 1; overflow: auto; position: relative;}
.notes-body::-webkit-scrollbar { display: none; }
.notes-body { scrollbar-width: none; }

/* Timeline */
.notes-rail { position: relative; padding-left: 32px; }
.notes-rail::before { content: ''; position: absolute; left: 7px; top: 18px; bottom: 18px;
  width: 2px; background: var(--grey-200); }
.notes-event { position: relative; margin-bottom: 28px; }
.notes-event::before { content: ''; position: absolute; left: -32px; top: 8px;
  width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 3px solid var(--brand-blue-500);
  box-shadow: 0 0 0 3px #FAFAFA;}
.notes-event.past::before { border-color: var(--grey-300); }
.notes-event .when { font-size: 14px; font-weight: 700; color: var(--brand-blue-600); margin-bottom: 14px;
  display: inline-flex; align-items: center; gap: 8px; letter-spacing: -0.01em; }
.notes-event.past .when { color: var(--fg-secondary); }
.notes-event .when .sep { color: var(--fg-disabled); font-weight: 500;}

/* Notes card */
.notes-card { background: #fff; border-radius: 10px; border: 1px solid var(--grey-100);
  border-left: 4px solid var(--warning-main); margin-bottom: 14px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(20,30,55,0.04);}
.notes-card.private { border-left-color: var(--error-main); }
.notes-card .nc-head { display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid var(--grey-100); }
.notes-card .nc-head .lead { display: flex; align-items: center; gap: 8px; font-size: 13.5px;
  font-weight: 700; color: var(--grey-700);}
.notes-card .nc-head .lead .ms { font-size: 18px; color: var(--fg-secondary); }
.notes-card .nc-head .lead .meta { font-size: 11.5px; color: var(--fg-secondary); font-weight: 500; margin-left: 4px;
  display: inline-flex; align-items: center; gap: 4px;}
.notes-card .nc-head .lead .meta .ms { font-size: 14px; }
.notes-card .nc-head .saved { font-size: 12px; color: var(--fg-secondary); font-weight: 500;
  display: inline-flex; align-items: center; gap: 8px; }
.notes-card .nc-head .saved .ind { width: 8px; height: 8px; border-radius: 50%; background: var(--success-main); }
.notes-card .nc-head .saved .ind.unsaved { background: var(--warning-main); }
.notes-card .nc-head .help-i { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--grey-200);
  display: flex; align-items: center; justify-content: center; color: var(--grey-500); margin-left: 12px;
  background: var(--grey-50); cursor: pointer;}
.notes-card .nc-head .help-i .ms { font-size: 14px; }

/* Editor toolbar */
.editor-toolbar { display: flex; align-items: center; padding: 6px 12px; border-bottom: 1px solid var(--grey-100);
  background: #fff; gap: 2px;}
.editor-toolbar .tb-btn { width: 32px; height: 32px; border-radius: 6px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; color: var(--grey-600); cursor: pointer;
  font-size: 14px; font-weight: 700; font-family: var(--font-family);}
.editor-toolbar .tb-btn:hover { background: var(--grey-100); color: var(--grey-700); }
.editor-toolbar .tb-btn.active { background: var(--brand-blue-100); color: var(--brand-blue-600); }
.editor-toolbar .tb-btn .ms { font-size: 18px; }
.editor-toolbar .tb-btn .h-num { font-size: 9px; font-weight: 700; margin-left: -2px; }
.editor-toolbar .tb-sep { width: 1px; height: 18px; background: var(--grey-200); margin: 0 6px;}
.editor-toolbar .tb-right { margin-left: auto; display: flex; align-items: center; gap: 6px;}

/* Editor body */
.editor-body { padding: 18px 22px 22px; min-height: 110px; font-size: 14px; color: var(--grey-700); line-height: 1.6;}
.editor-body[contenteditable]:empty::before { content: attr(data-placeholder); color: var(--fg-disabled); font-style: italic;}
.editor-body .ai-prompt { font-size: 12px; color: var(--fg-secondary); font-style: italic; background: var(--brand-purple-100);
  border: 1px dashed var(--brand-purple-200); border-radius: 6px; padding: 8px 12px; margin: 12px 0; }

/* Action items section */
.action-section { padding: 4px 22px 18px; }
.action-section .h { font-size: 14px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.01em; margin: 4px 0 12px;}
.action-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--grey-50);}
.action-row:last-of-type { border-bottom: none; }
.action-row .check-sq { width: 20px; height: 20px; border-radius: 4px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1.5px solid var(--grey-300);
  background: #fff;}
.action-row .check-sq.done { background: var(--success-main); border-color: var(--success-main);}
.action-row .check-sq.done .ms { color: #fff; font-size: 14px; }
.action-row .text { flex: 1; font-size: 13.5px; color: var(--grey-700); }
.action-row.done .text { text-decoration: line-through; color: var(--fg-disabled);}
.action-row .owner-chip { padding: 4px 8px; border-radius: 5px; background: var(--brand-purple-200);
  color: var(--brand-purple-700); font-size: 11px; font-weight: 800; min-width: 24px; text-align: center;}
.action-row .due-chip { font-size: 11px; color: var(--fg-secondary); font-weight: 600;
  display: inline-flex; align-items: center; gap: 4px;}
.action-row .due-chip .ms { font-size: 13px; }
.action-row .row-x { color: var(--fg-disabled); cursor: pointer; }
.action-row .row-x:hover { color: var(--grey-700); }

.action-section .add-row { display: flex; align-items: center; gap: 10px; padding: 10px 0;
  font-size: 12.5px; color: var(--fg-secondary); cursor: pointer; font-weight: 600;}
.action-section .add-row:hover { color: var(--brand-blue-600); }
.action-section .add-row .ms { font-size: 18px; }

/* Linked context inside notes editor */
.linked-strip { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.linked-strip .linked-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px;
  background: var(--grey-100); border-radius: 6px; font-size: 11.5px; font-weight: 700;
  color: var(--grey-700);}
.linked-strip .linked-chip .ms { font-size: 14px; color: var(--fg-secondary); }

/* Sidebar quick-jump for notes */
.notes-side { width: 240px; flex-shrink: 0; }
.notes-side .h { font-size: 10.5px; font-weight: 800; color: var(--fg-secondary); text-transform: uppercase;
  letter-spacing: 0.06em; margin-bottom: 10px; padding: 0 6px;}
.notes-side .item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px;
  cursor: pointer; font-size: 12.5px; color: var(--grey-700); font-weight: 600;}
.notes-side .item:hover { background: var(--grey-100); }
.notes-side .item.active { background: var(--brand-blue-50); color: var(--brand-blue-600); font-weight: 700;}
.notes-side .item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--grey-300); flex-shrink: 0;}
.notes-side .item.active .dot { background: var(--brand-blue-500); }
.notes-side .item .meta { font-size: 11px; color: var(--fg-secondary); margin-left: auto; font-weight: 500;}

/* ============================================================
   Goal / OKR stepper (create flow)
   ============================================================ */
.stepper-takeover { background: #F4F4F8; min-height: 100%; display:flex; flex-direction:column;
  margin: -24px -32px -40px; }
.stepper-takeover .strip { height: 4px; background: var(--brand-blue-500);}
.stepper-takeover .topbar { background:#fff; padding: 18px 32px; border-bottom: 1px solid var(--grey-100);
  display:flex; align-items:center; justify-content:space-between; gap: 16px;}
.stepper-takeover .topbar .brand { display:flex; align-items:center; gap: 12px;}
.stepper-takeover .topbar .brand .icon { width: 36px; height: 36px; display:flex; align-items:center; justify-content:center;
  color: #F18D85; }
.stepper-takeover .topbar .brand .icon .ms { font-size: 32px; }
.stepper-takeover .topbar .brand h2 { margin: 0; font-size: 22px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.02em;}
.stepper-takeover .topbar .x { width: 36px; height: 36px; border-radius: 8px; display:flex; align-items:center; justify-content:center;
  color: var(--fg-secondary); cursor: pointer; border:none; background:transparent;}
.stepper-takeover .topbar .x:hover { background: var(--grey-100); }
.stepper-takeover .body { padding: 28px 24px 36px; flex:1; overflow:auto; }
.stepper-takeover .body::-webkit-scrollbar { display: none; }
.stepper-takeover .body { scrollbar-width: none; }

.step-progress { display: flex; align-items: center; justify-content: center;
  max-width: 880px; margin: 0 auto 24px; padding: 0 16px; }
.step-progress .step { display: flex; flex-direction: column; align-items:center; gap: 10px; flex-shrink:0;
  position: relative; min-width: 0; }
.step-progress .step .dot { width: 14px; height: 14px; border-radius: 50%;
  background: #fff; border: 2px solid var(--grey-200); display:flex; align-items:center; justify-content:center;
  flex-shrink: 0; transition: all .2s;}
.step-progress .step.done .dot { background: var(--success-main); border-color: var(--success-main);}
.step-progress .step.done .dot::before { content: ''; }
.step-progress .step.active .dot { background: var(--brand-blue-500); border-color: var(--brand-blue-500); }
.step-progress .step .label { font-size: 13px; font-weight: 500; color: var(--fg-secondary); white-space: nowrap;
  letter-spacing: -0.01em;}
.step-progress .step.active .label { color: var(--grey-700); font-weight: 800; }
.step-progress .step.done .label { color: var(--grey-700); font-weight: 600; }
.step-progress .line { flex: 1; height: 1px; background: var(--grey-200); min-width: 32px; margin: 0 8px;
  align-self: flex-start; margin-top: 8px; transition: background .2s;}
.step-progress .line.done { background: var(--success-main); }

.step-card { max-width: 880px; margin: 0 auto; background: #fff; border-radius: 12px;
  border: 1px solid var(--grey-100); padding: 56px 56px 44px; position: relative;
  box-shadow: 0 1px 2px rgba(20,30,55,0.04);}
.step-card .avatar-icon { position: absolute; top: -28px; left: 50%; transform: translateX(-50%);
  width: 56px; height: 56px; border-radius: 50%; background: #8CC9F8; color: #fff;
  display:flex; align-items:center; justify-content:center; border: 4px solid #F4F4F8;}
.step-card .avatar-icon .ms { font-size: 28px; }
.step-card .trash { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px;
  border-radius: 50%; border: 1px solid var(--grey-200); background: #fff;
  display:flex; align-items:center; justify-content:center; color: var(--grey-600); cursor:pointer;}
.step-card .trash:hover { background: var(--grey-50); }
.step-card .trash .ms { font-size: 18px; }
.step-card .goal-name { text-align:center; font-size: 28px; font-weight: 800; color: var(--grey-700);
  letter-spacing: -0.02em; margin: 4px 0 28px; }

.step-card .field { margin-bottom: 20px; }
.step-card .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
.step-card .field .lh { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;}
.step-card .field .lh .lbl { font-size: 16px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.01em; }
.step-card .field .lh .lbl .req { color: var(--error-main); margin-left: 2px; }
.step-card .field .lh .count { font-size: 13px; color: var(--fg-secondary); font-weight: 500;}
.step-card .field .help { font-size: 13.5px; color: var(--fg-secondary); margin-top: 8px; line-height: 1.5;}
.step-card .inp { width: 100%; font-family: var(--font-family); font-size: 14.5px; padding: 12px 14px;
  border: 1px solid var(--grey-200); border-radius: 8px; background:#fff; color: var(--grey-700); outline:none;
  transition: border-color .15s, box-shadow .15s;}
.step-card .inp:focus { border-color: var(--brand-blue-500); box-shadow: 0 0 0 3px rgba(0,117,225,0.12);}
.step-card .inp::placeholder { color: var(--fg-disabled); }
.step-card .sel { width:100%; font-family: var(--font-family); font-size: 14.5px;
  padding: 12px 36px 12px 14px; border:1px solid var(--grey-200); border-radius: 8px; background: #fff;
  color: var(--grey-700); outline: none; appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat:no-repeat; background-position: right 8px center;
  display:flex; align-items:center;}
.step-card .sel.with-icon { padding-left: 42px;
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'><path d='M7 10l5 5 5-5z'/></svg>"),
    none;
  background-position: right 8px center, left 14px center;}
.step-card .sel-wrap { position: relative; }
.step-card .sel-wrap .lead-icon { position:absolute; left: 12px; top: 50%; transform: translateY(-50%);
  width: 20px; height: 20px; display:flex; align-items:center; justify-content:center;
  color: var(--brand-blue-500); pointer-events: none;}
.step-card .sel-wrap .lead-icon .ms { font-size: 18px; }
.step-card .sel-wrap select.with-lead { padding-left: 40px; }

.step-card .switch-row { display: flex; align-items: center; gap: 14px; margin: 10px 0; }
.step-card .switch { position: relative; width: 44px; height: 24px; border-radius: 999px;
  background: var(--grey-200); cursor: pointer; flex-shrink: 0; transition: background .15s;}
.step-card .switch::after { content: ''; position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  transition: left .15s; }
.step-card .switch.on { background: var(--brand-blue-500); }
.step-card .switch.on::after { left: 22px; }
.step-card .switch-row .label-block { font-size: 16px; font-weight: 800; color: var(--grey-700); letter-spacing:-0.01em; }
.step-card .switch-row + .help { margin-top: 0; margin-bottom: 20px; padding-left: 58px; }

.step-card .more-options { padding-top: 8px; border-top: 1px solid var(--grey-100); margin-top: 8px;}
.step-card .more-options .h { font-size: 15px; font-weight: 800; color: var(--grey-700); margin: 12px 0 12px; }
.step-card .more-options .chips { display: flex; gap: 12px; flex-wrap: wrap; }
.step-card .opt-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
  border: 1px solid var(--grey-200); border-radius: 8px; background: #fff; color: var(--grey-700);
  font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s;}
.step-card .opt-chip:hover { background: var(--grey-50); border-color: var(--grey-300); }
.step-card .opt-chip .ms { font-size: 16px; color: var(--fg-secondary);}
.step-card .opt-chip.active { background: var(--brand-blue-50); border-color: var(--brand-blue-300); color: var(--brand-blue-600);}
.step-card .opt-chip.active .ms { color: var(--brand-blue-500);}

/* Key Results step */
.step-card .kr-block { padding: 22px 22px 14px; border-radius: 10px; background: #FAFBFC;
  border: 1px solid var(--grey-100); margin-bottom: 16px; position: relative; }
.step-card .kr-block .drag { position:absolute; top: 26px; left: -12px; width: 24px; height: 24px;
  background: var(--brand-blue-500); color: #fff; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; cursor: grab;}
.step-card .kr-block .drag .ms { font-size: 16px; }
.step-card .kr-block .kr-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;}
.step-card .kr-block .kr-head .name { font-size: 15px; font-weight: 800; color: var(--grey-700); letter-spacing:-0.01em;}
.step-card .kr-block .kr-head .count { font-size: 13px; color: var(--fg-secondary); }
.step-card .kr-block .kr-help { font-size: 13px; color: var(--fg-secondary); margin: 8px 0 14px; }
.step-card .kr-block .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.step-card .kr-block .grid-3 .sub { font-size: 14px; font-weight: 800; color: var(--grey-700); margin-bottom: 6px;}
.step-card .kr-block .trackline { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--grey-100); font-size: 13px; color: var(--grey-700);}
.step-card .kr-block .trackline .tools { display: flex; gap: 4px; }
.step-card .kr-block .trackline .tools button { border:none; background: transparent; color: var(--brand-blue-500);
  width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;}
.step-card .kr-block .trackline .tools button:hover { background: var(--brand-blue-50); }
.step-card .kr-block .trackline .tools button .ms { font-size: 18px; }
.step-card .kr-block .trackline .tools button.danger { color: var(--error-dark);}
.step-card .kr-block .trackline .tools button.danger:hover { background: var(--error-bg);}

.step-card .new-kr-row { display: flex; align-items: center; gap: 14px; margin: 18px 0 4px;}
.step-card .new-kr-row .line { flex: 1; height: 1px; background: var(--grey-100);}
.step-card .new-kr-btn { padding: 10px 18px; border-radius: 8px; background: var(--grey-50);
  border: 1px dashed var(--grey-200); color: var(--grey-700); font-size: 13.5px; font-weight: 700;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.step-card .new-kr-btn:hover { background: var(--grey-100); }

/* Date step */
.step-card .date-q { font-size: 17px; font-weight: 800; color: var(--grey-700); text-align: center;
  letter-spacing: -0.01em; margin-bottom: 18px;}
.step-card .date-pick { display: flex; align-items: center; gap: 12px; padding: 16px 24px;
  border: 1px solid var(--grey-200); border-radius: 999px; cursor: pointer;
  max-width: 520px; margin: 0 auto;}
.step-card .date-pick .ms.lead { font-size: 22px; color: var(--grey-600); }
.step-card .date-pick .v { font-size: 18px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.01em;}
.step-card .date-pick .ms.caret { margin-left: auto; color: var(--grey-500);}

/* Users step */
.step-card .user-field { border: 1px solid var(--grey-200); border-radius: 8px; padding: 8px 12px;
  display: flex; flex-direction: column; gap: 6px; min-height: 64px;}
.step-card .user-field .floating-label { font-size: 11.5px; color: var(--fg-secondary); }
.step-card .user-field .selected { display: inline-flex; align-items: center; gap: 6px;
  background: var(--grey-100); color: var(--grey-700); font-size: 13px; padding: 4px 10px; border-radius: 4px; font-weight: 600; align-self: flex-start;}
.step-card .user-field .selected .x { margin-left: 4px; color: var(--fg-secondary); font-size: 14px; cursor: pointer; }
.step-card .user-field input { border: none; outline: none; font-family: var(--font-family); font-size: 14px;
  color: var(--grey-700); padding: 4px 0; background: transparent;}

/* Review step */
.step-card .review-card { text-align: center; padding: 20px 0 8px; }
.step-card .review-card .subtype { font-size: 17px; color: var(--grey-700); font-weight: 500; margin-bottom: 22px;}
.step-card .review-meta-row { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px;}
.step-card .review-meta-row .item { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800;
  color: var(--grey-700); letter-spacing: -0.01em;}
.step-card .review-meta-row .item .ms { font-size: 20px; color: var(--grey-500);}
.step-card .review-sec h4 { font-size: 18px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.01em;
  margin: 0 0 12px; text-align: left;}
.step-card .review-sec { margin-bottom: 22px; text-align: left;}
.step-card .dotted-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0;
  font-size: 14.5px; color: var(--grey-700);}
.step-card .dotted-row .dots { flex: 1; border-bottom: 2px dotted var(--grey-300); height: 8px; margin: 0 8px;}
.step-card .dotted-row .k { color: var(--fg-secondary); font-weight: 500; }
.step-card .dotted-row .v { font-weight: 800; display:inline-flex; align-items: center; gap: 8px;}

/* Footer */
.stepper-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  max-width: 880px; margin: 28px auto 0; padding: 0 16px;}
.stepper-footer .saved { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px;
  color: var(--success-dark); font-weight: 600;}
.stepper-footer .saved .ms { color: var(--success-main); font-size: 18px; }
.stepper-footer .right-actions { display: flex; align-items: center; gap: 12px;}
.stepper-footer .btn-back { padding: 10px 26px; font-size: 14.5px; }
.stepper-footer .btn-next { padding: 10px 32px; font-size: 14.5px; }
.stepper-footer .btn-draft { border: 1px solid #FFB547; background: #fff; color: var(--grey-700);
  font-size: 14.5px; padding: 10px 22px; border-radius: 8px; font-weight: 700; cursor: pointer;}
.stepper-footer .btn-draft:hover { background: #FFFAEB; }

/* Create dropdown menu */
.create-menu { position: absolute; right: 0; top: calc(100% + 8px); z-index: 30;
  background: #fff; border: 1px solid var(--grey-100); border-radius: 10px;
  box-shadow: 0 12px 32px rgba(20,30,55,0.16); min-width: 260px; padding: 6px;}
.create-menu .opt { display: flex; gap: 12px; padding: 12px 14px; border-radius: 8px; cursor: pointer; align-items: flex-start; }
.create-menu .opt:hover { background: var(--grey-50); }
.create-menu .opt .gi { width: 32px; height: 32px; border-radius: 9px; display:flex; align-items:center; justify-content:center;
  flex-shrink: 0; }
.create-menu .opt .gi.goal { background: var(--brand-blue-100); color: var(--brand-blue-500);}
.create-menu .opt .gi.okr  { background: var(--brand-purple-100); color: var(--brand-purple-600);}
.create-menu .opt .gi .ms { font-size: 18px; }
.create-menu .opt .b .t { font-size: 13.5px; font-weight: 800; color: var(--grey-700); letter-spacing: -0.01em;}
.create-menu .opt .b .d { font-size: 11.5px; color: var(--fg-secondary); margin-top: 2px; line-height: 1.4;}

/* Filter chip with remove (used on People OKRs after View OKRs) */
.filter-chip-active { display:inline-flex; align-items:center; gap: 8px; padding: 6px 8px 6px 12px;
  background: var(--brand-blue-50); border: 1px solid var(--brand-blue-200); border-radius: 7px;
  font-size: 12.5px; font-weight: 700; color: var(--brand-blue-600);}
.filter-chip-active .k { color: var(--brand-blue-600); opacity: 0.8; font-weight: 600;}
.filter-chip-active .x { width: 18px; height: 18px; border-radius: 4px; display:flex; align-items:center; justify-content:center;
  cursor: pointer; background: rgba(0,117,225,0.10); color: var(--brand-blue-600);}
.filter-chip-active .x:hover { background: rgba(0,117,225,0.20);}
.filter-chip-active .x .ms { font-size: 14px;}

/* ----- Severity dot (admin AI flags) ----- */
.sev { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color: var(--grey-700);}
.sev .d { width:8px; height:8px; border-radius:50%; }
.sev.high .d { background: var(--error-main); box-shadow: 0 0 0 3px rgba(227,27,12,0.12);}
.sev.med  .d { background: var(--warning-main); box-shadow: 0 0 0 3px rgba(237,108,2,0.12);}
.sev.low  .d { background: var(--brand-blue-400); box-shadow: 0 0 0 3px rgba(95,178,255,0.16);}


/* ============================================================================
   FILE: app.html
   ============================================================================ */

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Payo WFM — Performance Management</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="tokens.css">
<style>
html, body { margin: 0; padding: 0; background: #F1EFEC; min-height: 100vh; }

/* ── Nav home page ── */
.nav-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 56px 24px 80px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.nav-home h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.nav-home p {
  color: #6b6b6b;
  font-size: 15px;
  margin: 0 0 40px;
}
.nav-sections {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 960px;
  width: 100%;
}
.nav-section {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  padding: 24px;
  flex: 1 1 260px;
  min-width: 240px;
}
.nav-section h2 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #999;
  margin: 0 0 16px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.12s;
  margin-bottom: 4px;
}
.nav-link:hover { background: #f5f4f1; }
.nav-link-num {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.client-num { background: #e8f1ff; color: #1e5bcc; }
.admin-num  { background: #f0e8ff; color: #7230c8; }
.worker-num { background: #e8f9f0; color: #1a8a50; }

/* ── Back bar ── */
.back-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 44px;
  background: rgba(241,239,236,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.07);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.back-bar button:hover { background: rgba(0, 117, 225, 0.08); }
.back-bar a {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 7px;
  transition: background 0.12s, color 0.12s;
}
.back-bar a:hover { background: rgba(0,0,0,0.06); color: #111; }
.back-bar .sep { color: #bbb; font-size: 13px; }
.back-bar .route-label { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.view-wrap { padding-top: 44px; }
</style>
</head>
<body>
<div id="root"></div>

<!-- React + Babel -->
<script src="vendor/react.js"></script>
<script src="vendor/react-dom.js"></script>
<script src="vendor/babel.js"></script>

<!-- Shared shell + components -->
<script type="text/babel" src="shared.jsx?v=20"></script>
<script type="text/babel" src="frames/performance-store.jsx?v=18"></script>
<script type="text/babel" src="frames/projects.jsx?v=23"></script>
<script type="text/babel" src="frames/login.jsx?v=18"></script>

<!-- Shared sub-screens -->
<script type="text/babel" src="frames/goal-detail.jsx?v=18"></script>
<script type="text/babel" src="frames/goal-stepper.jsx?v=23"></script>
<script type="text/babel" src="frames/meeting-notes.jsx?v=18"></script>
<script type="text/babel" src="frames/review-cycle-stepper.jsx?v=18"></script>
<script type="text/babel" src="frames/manager-review-form.jsx?v=19"></script>
<script type="text/babel" src="frames/worker-self-review.jsx?v=18"></script>
<script type="text/babel" src="frames/notifications.jsx?v=18"></script>
<script type="text/babel" src="frames/all-review-cycles.jsx?v=18"></script>

<!-- Client screens -->
<script type="text/babel" src="frames/client-dashboard.jsx?v=22"></script>
<script type="text/babel" src="frames/client-okrs.jsx?v=25"></script>
<script type="text/babel" src="frames/client-reviews.jsx?v=18"></script>
<script type="text/babel" src="frames/client-meetings.jsx?v=18"></script>

<!-- Worker screens -->
<script type="text/babel" src="frames/worker-dashboard.jsx?v=19"></script>
<script type="text/babel" src="frames/worker-goals.jsx?v=25"></script>
<script type="text/babel" src="frames/worker-meetings.jsx?v=18"></script>
<script type="text/babel" src="frames/worker-reviews.jsx?v=20"></script>

<!-- Admin -->
<script type="text/babel" src="frames/admin-dashboard.jsx?v=18"></script>

<script type="text/babel">
const { useState, useEffect } = React;

/* ── Route map ── */
const ROUTES = [
  {
    section: 'Auth',
    colorClass: 'admin-num',
    items: [
      { hash: '/login',              num: '00', label: 'Login / Switch account' },
    ],
  },
  {
    section: 'Client / Manager',
    colorClass: 'client-num',
    items: [
      { hash: '/client/dashboard',   num: '01', label: 'Performance Dashboard' },
      { hash: '/client/okrs',        num: '02', label: 'Goals & OKRs' },
      { hash: '/client/create-goal', num: '02b', label: 'Create Goal (Stepper)' },
      { hash: '/client/goal-detail', num: '02c', label: 'Goal Detail' },
      { hash: '/client/reviews',     num: '03', label: 'Reviews' },
      { hash: '/client/all-cycles',  num: '03b', label: 'All Review Cycles' },
      { hash: '/client/meetings',    num: '04', label: '1:1 Meetings' },
      { hash: '/client/notes',       num: '04b', label: '1:1 Notes Editor' },
      { hash: '/client/notifications', num: '04c', label: 'Notifications' },
      { hash: '/projects',            num: '04d', label: 'Projects Module' },
    ],
  },
  {
    section: 'Internal Admin',
    colorClass: 'admin-num',
    items: [
      { hash: '/admin/dashboard', num: '05', label: 'Clients Overview' },
    ],
  },
  {
    section: 'Worker',
    colorClass: 'worker-num',
    items: [
      { hash: '/worker/dashboard',  num: '06', label: 'My Dashboard' },
      { hash: '/worker/projects',   num: '06b', label: 'My Projects' },
      { hash: '/worker/goals',     num: '07', label: 'My Goals' },
      { hash: '/worker/meetings',  num: '08', label: 'My 1:1 Sessions' },
      { hash: '/worker/reviews',   num: '09', label: 'Feedback & Reviews' },
      { hash: '/worker/notifications', num: '10', label: 'Notifications' },
    ],
  },
];

/* ── Hash reader ── */
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  useEffect(() => {
    const handler = () => setHash(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

/* ── Render a route ── */
function renderView(hash) {
  if (hash === '/login') return <LoginScreen />;
  switch (hash) {
    case '/client/dashboard':
      return <ClientDashboard />;
    case '/client/okrs':
      return <ClientOKRs />;
    case '/client/create-goal':
      return (
        <Shell persona="client" active="performance"
          crumb={['Acme Holdings', 'Performance', 'Goals & OKRs', 'New Goal']}>
          <GoalStepper kind="goal" onCancel={() => { window.location.hash = '/client/okrs'; }}
            onCreate={async (payload) => {
              // The stepper's buildPayload already sets ownerUserId, source,
              // createdByRole correctly for both managers and workers. We
              // simply pass it through and surface any backend error.
              try {
                await window.PerformanceStore.createGoal(payload);
                window.location.hash = '/client/okrs';
              } catch (e) {
                console.error('createGoal failed', e);
                alert(`Could not create goal: ${e.message}`);
              }
            }} />
        </Shell>
      );
    case '/client/goal-detail':
      return (
        <Shell persona="client" active="performance"
          crumb={['Acme Holdings', 'Performance', 'Goals & OKRs', 'Build a Scalable Operations Engine…']}>
          <GoalDetail role="manager" onBack={() => { window.location.hash = '/client/okrs'; }} />
        </Shell>
      );
    case '/client/reviews':
      return <ClientReviews />;
    case '/client/all-cycles':
      return <ClientAllCycles />;
    case '/client/meetings':
      return <ClientMeetings />;
    case '/client/notes':
      return (
        <Shell persona="client" active="performance"
          crumb={['Acme Holdings', 'Performance', '1:1 Meetings', 'Notes — Aditi Sharma']}>
          <MeetingNotesEditor
            worker="Aditi Sharma"
            role="Senior Ops · weekly"
            linked={[
              { icon: 'flag',          label: 'Complete 6 migrations' },
              { icon: 'rocket_launch', label: 'Payroll Migration EU' },
            ]}
            onBack={() => { window.location.hash = '/client/meetings'; }}
          />
        </Shell>
      );
    case '/admin/dashboard':
      return <AdminDashboard />;
    case '/projects':
      return <ProjectsPage />;
    case '/client/notifications':
      return <NotificationsPage persona="client" />;
    case '/worker/projects':
      return <ProjectsPage persona="worker" />;
    case '/worker/dashboard':
      return <WorkerDashboard />;
    case '/worker/goals':
      return <WorkerGoals />;
    case '/worker/meetings':
      return <WorkerMeetings />;
    case '/worker/reviews':
      return <WorkerReviews />;
    case '/worker/reviews/all':
      return <AllReviewCyclesPage />;
    case '/worker/notifications':
      return <NotificationsPage persona="worker" />;
    default:
      return null;
  }
}

/* ── Label for back bar ── */
function labelFor(hash) {
  for (const section of ROUTES) {
    for (const item of section.items) {
      if (item.hash === hash) return `${item.num} · ${item.label}`;
    }
  }
  return null;
}

/* ── Home nav ── */
function HomeNav() {
  return (
    <div className="nav-home">
      <h1>Payo WFM — Performance Management</h1>
      <p>Select a view to open it full-screen</p>
      <div className="nav-sections">
        {ROUTES.map(s => (
          <div key={s.section} className="nav-section">
            <h2>{s.section}</h2>
            {s.items.map(item => (
              <a key={item.hash} className="nav-link" href={`#${item.hash}`}>
                <span className={`nav-link-num ${s.colorClass}`}>{item.num}</span>
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Root app ── */
function App() {
  const hash = useHash();
  const isHome = hash === '/' || hash === '';
  const isLogin = hash === '/login';
  const label = labelFor(hash);

  const [authState, setAuthState] = useState(() => ({
    bootstrapping: window.PerformanceStore.isAuthenticated(),
    user: window.PerformanceStore.getCurrentUser(),
  }));

  useEffect(() => {
    // Force re-render on store changes (user login/logout/data refresh).
    const off = window.PerformanceStore.subscribe(() => {
      setAuthState({
        bootstrapping: false,
        user: window.PerformanceStore.getCurrentUser(),
      });
    });
    if (window.PerformanceStore.isAuthenticated() && !window.PerformanceStore.isBootstrapped()) {
      window.PerformanceStore.bootstrap()
        .finally(() => setAuthState({
          bootstrapping: false,
          user: window.PerformanceStore.getCurrentUser(),
        }));
    } else {
      setAuthState({ bootstrapping: false, user: window.PerformanceStore.getCurrentUser() });
    }
    return off;
  }, []);

  // Re-fetch every slice when the route changes so a tab that was open
  // before a write happened in another session picks up the latest data.
  useEffect(() => {
    if (!hash || hash === '/login' || hash === '/' || hash === '') return;
    if (!window.PerformanceStore.isAuthenticated()) return;
    window.PerformanceStore.refreshAll();
  }, [hash]);

  // Auth gate: unauthenticated users can only see HomeNav + LoginScreen.
  const requiresAuth = !isHome && !isLogin;
  if (requiresAuth && !window.PerformanceStore.isAuthenticated()) {
    window.location.hash = '/login';
    return null;
  }

  if (isLogin) {
    return renderView('/login');
  }
  if (isHome) return <HomeNav user={authState.user} />;

  if (authState.bootstrapping) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#666', fontSize: 14,
      }}>
        Loading your workspace…
      </div>
    );
  }

  const view = renderView(hash);
  if (!view) return (
    <div className="nav-home">
      <h1>404 — View not found</h1>
      <p><a href="#">← Back to all views</a></p>
    </div>
  );

  return (
    <>
      <div className="back-bar">
        <a href="#">← All views</a>
        {label && <><span className="sep">/</span><span className="route-label">{label}</span></>}
        <span style={{ flex: 1 }} />
        {authState.user && (
          <span style={{ fontSize: 12.5, color: '#555' }}>
            Signed in as <strong style={{ color: '#1a1a1a' }}>{authState.user.name}</strong>
            <span style={{ color: '#999' }}> · {authState.user.role}</span>
          </span>
        )}
        <button
          onClick={() => window.PerformanceStore.logout()}
          style={{
            border: 'none', background: 'transparent',
            color: '#0075E1', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            padding: '4px 10px', borderRadius: 6,
          }}>
          {authState.user ? 'Log out' : 'Sign in'}
        </button>
      </div>
      <div className="view-wrap">{view}</div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>


/* ============================================================================
   FILE: shared.jsx
   ============================================================================ */

/* Shared shell + UI primitives for the Payo WFM Performance Management module.
   Three role variants: client, admin (Payoneer internal), worker.
   Sidebar nav, topbar, and feature surfaces differ per role to make RBAC obvious. */

const { useState: useStateP } = React;

/* ============================================================
   Avatar (color-by-name)
   ============================================================ */
const AVATAR_COLORS = ['#0075E1', '#4716B3', '#D85AD6', '#5173FF', '#ED6C02', '#00A75B', '#1257A9', '#E31B0C', '#3F7DAA', '#9F1308'];
function avatarColorFor(name = '') {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function Avatar({ name = '??', size = 'md', bg }) {
  const initials = name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <span className={`av ${size}`} style={{ background: bg || avatarColorFor(name) }}>{initials}</span>;
}
function AvatarStack({ names = [], size = 'sm', max = 4 }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="av-stack">
      {shown.map((n, i) => <Avatar key={i} name={n} size={size} />)}
      {rest > 0 && <span className={`av ${size} av-more`}>+{rest}</span>}
    </span>
  );
}

/* ============================================================
   Button
   ============================================================ */
function Btn({ variant = 'primary', size, icon, iconTrailing, onClick, children, style, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''}`.trim();
  return (
    <button className={cls} onClick={onClick} style={style} {...rest}>
      {icon && <span className="ms">{icon}</span>}
      {children}
      {iconTrailing && <span className="ms">{iconTrailing}</span>}
    </button>
  );
}
function IconBtn({ icon, onClick, title }) {
  return (
    <button className="btn btn-ghost btn-icon" onClick={onClick} title={title}>
      <span className="ms">{icon}</span>
    </button>
  );
}

/* ============================================================
   Chip / pill
   ============================================================ */
function Pill({ variant, dot = false, icon, children, size }) {
  return (
    <span className={`chip ${variant || ''} ${size === 'lg' ? 'lg' : ''}`}>
      {dot && <span className="dot" style={{ background: 'currentColor' }} />}
      {icon && <span className="ms" style={{ fontSize: 13 }}>{icon}</span>}
      {children}
    </span>
  );
}

/* ============================================================
   Progress bar w/ pct
   ============================================================ */
function ProgressBar({ pct = 0, color, big, hidePct }) {
  const tone = color || (pct >= 70 ? 'green' : pct >= 35 ? '' : 'amber');
  return (
    <div className="pbar-row">
      <div className={`pbar ${big ? 'lg' : ''} ${tone}`}>
        <i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      {!hidePct && <span className="pct">{pct}%</span>}
    </div>
  );
}

/* ============================================================
   Star rating
   ============================================================ */
function Stars({ value = 0, max = 5, size = 'md' }) {
  return (
    <span className={`stars ${size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : ''}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`ms ${i < value ? 'on' : ''}`}>star</span>
      ))}
    </span>
  );
}

/* ============================================================
   Trend chip
   ============================================================ */
function TrendChip({ dir = 'up', children }) {
  const icon = dir === 'up' ? 'trending_up' : dir === 'down' ? 'trending_down' : 'trending_flat';
  return (
    <span className={`trend-chip ${dir}`}>
      <span className="ms">{icon}</span>{children}
    </span>
  );
}

/* ============================================================
   Sparkline (bars)
   ============================================================ */
function Spark({ values = [], color = '' }) {
  const max = Math.max(...values, 1);
  return (
    <div className={`spark ${color}`}>
      {values.map((v, i) => (
        <span
          key={i}
          className={`b ${i === values.length - 1 ? 'curr' : ''}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Sidebar — role-aware navigation
   ============================================================ */
const CLIENT_NAV = [
  { group: 'Workforce', items: [
    { id: 'dashboard',  icon: 'dashboard',     label: 'Dashboard' },
    { id: 'people',     icon: 'groups',        label: 'People' },
    { id: 'contracts',  icon: 'description',   label: 'Contracts' },
    { id: 'projects',   icon: 'work',          label: 'Projects',   route: '/projects' },
    { id: 'payroll',    icon: 'sync',          label: 'Payroll' },
    { id: 'performance',icon: 'insights',      label: 'Performance', route: '/client/dashboard' },
  ]},
  { group: 'Workspace', items: [
    { id: 'time',      icon: 'schedule',     label: 'Time & leave' },
    { id: 'expenses',  icon: 'receipt_long', label: 'Expenses' },
    { id: 'documents', icon: 'folder',       label: 'Documents' },
    { id: 'reports',   icon: 'bar_chart',    label: 'Reports' },
    { id: 'settings',  icon: 'settings',     label: 'Settings' },
  ]},
];

const ADMIN_NAV = [
  { group: 'Internal Ops', items: [
    { id: 'admin-overview', icon: 'dashboard',   label: 'Overview',     route: '/admin/dashboard' },
    { id: 'clients',        icon: 'apartment',   label: 'Clients',      badge: '47', route: '/admin/dashboard' },
    { id: 'workers',        icon: 'groups',      label: 'All Workers' },
    { id: 'compliance',     icon: 'gavel',       label: 'Compliance' },
  ]},
  { group: 'Tools', items: [
    { id: 'audit',          icon: 'fact_check',  label: 'Audit log' },
    { id: 'admin-settings', icon: 'settings',    label: 'Settings' },
  ]},
];

const WORKER_NAV = [
  { group: 'My workspace', items: [
    { id: 'home',        icon: 'home',     label: 'Home' },
    { id: 'profile',     icon: 'person',   label: 'My profile' },
    { id: 'pay',         icon: 'payments', label: 'Pay' },
    { id: 'time',        icon: 'schedule', label: 'Time off' },
    { id: 'performance', icon: 'insights', label: 'Performance', route: '/worker/dashboard' },
    { id: 'projects',    icon: 'work',     label: 'Projects',     route: '/worker/projects' },
  ]},
  { group: 'Restricted', items: [
    { id: 'comp-others',   icon: 'paid',         label: 'Compensation insights', disabled: true },
    { id: 'others-okrs',   icon: 'flag',         label: 'Other workers\u2019 OKRs', disabled: true },
    { id: 'manager-notes', icon: 'lock',         label: 'Manager private notes', disabled: true },
  ]},
];

function Sidebar({ persona = 'client', active }) {
  const nav = persona === 'admin' ? ADMIN_NAV : persona === 'worker' ? WORKER_NAV : CLIENT_NAV;
  const brand = {
    client: { logo: 'P', title: 'Payo WFM', sub: 'Acme Holdings · HR' },
    admin:  { logo: 'P', title: 'Payo WFM', sub: 'Internal · Performance Ops' },
    worker: { logo: 'P', title: 'Payo WFM', sub: 'My workspace' },
  }[persona];
  const role = {
    client: { ms: 'badge', txt: 'HR Admin · Client manager' },
    admin:  { ms: 'shield_person', txt: 'Payoneer Internal · Performance' },
    worker: { ms: 'verified_user', txt: 'Worker · Self-service' },
  }[persona];
  const currentUser = window.PerformanceStore?.getCurrentUser?.();
  const user = currentUser
    ? { name: currentUser.name, email: currentUser.email }
    : ({
        client: { name: 'Manager', email: '' },
        admin:  { name: 'Admin', email: '' },
        worker: { name: 'Worker', email: '' },
      }[persona]);

  return (
    <aside className={`sb ${persona}`}>
      <div className="brand">
        <div className="logo">{brand.logo}</div>
        <div>
          <div className="name">{brand.title}</div>
          <div className="sub">{brand.sub}</div>
        </div>
      </div>

      <div className={`role-pill ${persona}`}>
        <span className="ms">{role.ms}</span>
        <span>{role.txt}</span>
      </div>

      {nav.map(sec => (
        <div key={sec.group}>
          <div className="group">{sec.group}</div>
          <div className="nav">
            {sec.items.map(it => (
              <div
                key={it.id}
                className={`item ${active === it.id ? 'active' : ''} ${it.disabled ? 'disabled' : ''}`}
                style={{ cursor: it.route && !it.disabled ? 'pointer' : undefined }}
                onClick={() => { if (it.route && !it.disabled) window.location.hash = it.route; }}
              >
                <span className="ms">{it.icon}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                {it.badge && <span className={`badge ${it.badgeColor || ''}`}>{it.badge}</span>}
                {it.disabled && <span className="ms lock">lock</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="footer">
        <div className="user-row">
          <Avatar name={user.name} size="sm" />
          <div className="info">
            <div className="n">{user.name}</div>
            <div className="e">{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   Topbar
   ============================================================ */
function TopBar({ persona = 'client', crumb = [], clientSelector }) {
  const banner = {
    client: { cls: 'client', icon: 'badge', txt: 'Client / Manager view' },
    admin:  { cls: '',       icon: 'shield_person', txt: 'Internal Admin view' },
    worker: { cls: 'worker', icon: 'verified_user',  txt: 'Worker self-service' },
  }[persona];

  return (
    <div className="tb">
      <div className="crumb">
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="ms">chevron_right</span>}
            <span className={i === crumb.length - 1 ? 'lead' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <span className={`role-banner ${banner.cls}`}>
        <span className="ms">{banner.icon}</span>{banner.txt}
      </span>

      {clientSelector && (
        <div className="client-selector">
          <Avatar name={clientSelector} size="xs" />
          <div className="col" style={{ lineHeight: 1.1 }}>
            <span className="label">Viewing client</span>
            <span className="name">{clientSelector}</span>
          </div>
          <span className="ms" style={{ fontSize: 16 }}>unfold_more</span>
        </div>
      )}

      <div className="search">
        <span className="ms" style={{ fontSize: 18 }}>search</span>
        <input placeholder={persona === 'admin' ? 'Search clients, workers, flags…' : persona === 'worker' ? 'Search my goals, reviews…' : 'Search people, goals, reviews…'} />
        <span style={{ fontSize: 10.5, color: 'var(--fg-disabled)', border: '1px solid currentColor', borderRadius: 4, padding: '1px 5px', opacity: 0.6, fontWeight: 700 }}>⌘K</span>
      </div>
      <div className="ib"><span className="ms">help</span></div>
      <NotificationBell persona={persona} />
    </div>
  );
}

/* ============================================================
   Notification bell + dropdown
   ============================================================ */
function NotificationBell({ persona = 'client' }) {
  const Store = window.PerformanceStore;
  const [open, setOpen] = useStateP(false);
  const [storeVersion, setStoreVersion] = useStateP(0);

  React.useEffect(() => {
    if (!Store) return;
    // Run generators once on mount so today's notifications appear.
    try { Store.runAllNotificationGenerators(); } catch (e) {}
    const off = Store.subscribe(() => setStoreVersion(v => v + 1));

    // Background sync: re-fetch notifications every 30s and whenever the tab
    // regains focus so a user in another session (e.g. a worker requesting
    // a 1:1) sees the notification land without a hard refresh.
    const refresh = () => { try { Store.runAllNotificationGenerators(); } catch (e) {} };
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const intervalId = window.setInterval(refresh, 30000);
    return () => { off(); window.removeEventListener('focus', onFocus); window.clearInterval(intervalId); };
  }, []);

  // Close on outside click
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!Store) {
    return <div className="ib"><span className="ms">notifications</span></div>;
  }

  const recipientRole = persona === 'worker' ? 'worker' : 'client';
  const recipientId = persona === 'worker' ? Store.getCurrentWorkerId() : Store.MANAGER_ID;
  const items = Store.getNotificationsForUser(recipientRole, recipientId).slice(0, 8);
  const unread = Store.getUnreadNotificationCount(recipientRole, recipientId);

  function open_() {
    if (!open) try { Store.runAllNotificationGenerators(); } catch (e) {}
    setOpen(o => !o);
  }

  function handleClick(n) {
    Store.markNotificationRead(n.id);
    if (n.actionContext && n.actionContext.kind === 'manager-review' && n.actionContext.participantId) {
      try { window.sessionStorage.setItem('payo.reviews.openManagerReview', n.actionContext.participantId); } catch (e) {}
    }
    if (n.actionRoute) window.location.hash = n.actionRoute;
    setOpen(false);
  }

  function markAll() {
    Store.markAllNotificationsRead(recipientRole, recipientId);
  }

  function viewAll() {
    window.location.hash = persona === 'worker' ? '/worker/notifications' : '/client/notifications';
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="ib" onClick={open_} style={{ cursor: 'pointer', position: 'relative' }}>
        <span className="ms">notifications</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 999,
            background: 'var(--error-main)', color: '#fff',
            fontSize: 10, fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid #fff', boxSizing: 'content-box',
          }}>{unread > 99 ? '99+' : unread}</span>
        )}
      </div>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 380, maxHeight: 520, overflow: 'auto',
          background: '#fff', border: '1px solid var(--grey-100)', borderRadius: 12,
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)', zIndex: 1200,
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--grey-100)' }} className="row items-center between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)' }}>Notifications</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{unread} unread · {items.length} recent</div>
            </div>
            <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--brand-blue-600)' }}>
              Mark all as read
            </button>
          </div>
          {items.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--fg-secondary)', textAlign: 'center' }}>
              You're all caught up.
            </div>
          )}
          {items.map(n => <NotificationDropdownItem key={n.id} n={n} onClick={handleClick} />)}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--grey-100)', textAlign: 'center' }}>
            <button onClick={viewAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: 'var(--brand-blue-600)' }}>
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const NOTIF_TYPE_ICONS = {
  okr_completed:        'verified',
  okr_due_soon:         'schedule',
  okr_due_today:        'priority_high',
  review_due_today:     'rate_review',
  one_on_one_today:     'event',
  goal_completed:       'flag',
  feedback_received:    'forum',
  self_review_submitted:'assignment_turned_in',
};

function priorityTone(priority) {
  if (priority === 'high')   return { bg: 'var(--error-bg)',   fg: 'var(--error-dark)',   label: 'High' };
  if (priority === 'medium') return { bg: 'var(--warning-bg)', fg: 'var(--warning-dark)', label: 'Med' };
  return { bg: 'var(--grey-50)', fg: 'var(--fg-secondary)', label: 'Low' };
}

function NotificationDropdownItem({ n, onClick }) {
  const tone = priorityTone(n.priority);
  const icon = NOTIF_TYPE_ICONS[n.type] || 'notifications';
  const isUnread = !n.readAt;
  return (
    <div onClick={() => onClick(n)} style={{
      padding: '12px 16px',
      borderBottom: '1px solid var(--grey-50)',
      cursor: 'pointer',
      background: isUnread ? 'var(--brand-blue-100)' : '#fff',
      display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: tone.bg, color: tone.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="ms" style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="row items-center gap-2" style={{ marginBottom: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--grey-800)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: tone.fg, background: tone.bg, padding: '1px 6px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tone.label}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--grey-700)', lineHeight: 1.45 }}>{n.message}</div>
        <div className="row items-center between" style={{ marginTop: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--fg-secondary)' }}>
            {formatNotifDate(n.createdAt)}
          </span>
          {n.actionLabel && (
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-blue-600)' }}>
              {n.actionLabel} →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNotifDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ============================================================
   Shell wrapper
   ============================================================ */
function Shell({ persona = 'client', active, crumb, clientSelector, children }) {
  return (
    <div className={`app ${persona}-shell`}>
      <Sidebar persona={persona} active={active} />
      <div className="content">
        <TopBar persona={persona} crumb={crumb} clientSelector={clientSelector} />
        <div className="page">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   Page header
   ============================================================ */
function PageHead({ eyebrow, title, sub, actions, badge }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-purple-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{eyebrow}</div>}
        <h1 className="h-title">
          {title}
          {badge && <Pill variant={badge.variant} size="lg" icon={badge.icon}>{badge.label}</Pill>}
        </h1>
        {sub && <div className="h-sub">{sub}</div>}
      </div>
      {actions && <div className="h-actions">{actions}</div>}
    </div>
  );
}

/* ============================================================
   Stat card (KPI)
   ============================================================ */
function StatCard({ tone = 'blue', icon, label, value, sub, trend, onClick }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      className={`stat ${tone}${clickable ? ' clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }) : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className="label">{label}</div>
      <div className="value-row">
        <div className="value">{value}</div>
        {trend && <span className={`trend ${trend.dir}`}>
          <span className="ms">{trend.dir === 'up' ? 'trending_up' : trend.dir === 'down' ? 'trending_down' : 'trending_flat'}</span>{trend.text}
        </span>}
      </div>
      {sub && <div className="sub">{sub}</div>}
      {icon && <div className="ico"><span className="ms">{icon}</span></div>}
      {clickable && <div className="stat-chev"><span className="ms">arrow_forward</span></div>}
    </div>
  );
}

/* ============================================================
   Filter bar
   ============================================================ */
function FilterBar({ children, right }) {
  return (
    <div className="filter-bar">
      <span className="lbl">Filters</span>
      {children}
      {right && <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, alignItems: 'center' }}>{right}</span>}
    </div>
  );
}
function Filter({ k, v, icon }) {
  return (
    <button className="filter">
      {icon && <span className="ms">{icon}</span>}
      <span className="k">{k}:</span>
      <span>{v}</span>
      <span className="ms" style={{ fontSize: 14, opacity: 0.6 }}>expand_more</span>
    </button>
  );
}

/* ============================================================
   Callout banner
   ============================================================ */
function Callout({ tone = 'info', icon, title, children, action }) {
  return (
    <div className={`callout ${tone}`}>
      {icon && <span className="ms">{icon}</span>}
      <div className="flex-1">
        {title && <div className="b-title">{title}</div>}
        {children && <div className="b-body">{children}</div>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   Section card
   ============================================================ */
function SectionCard({ title, sub, icon, action, children, padBody = true, style }) {
  return (
    <div className="card" style={style}>
      <div className="card-head">
        <div>
          <div className="title">
            {icon && <span className="ms">{icon}</span>}
            {title}
          </div>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {action}
      </div>
      <div style={padBody ? { padding: '14px 18px 16px' } : undefined}>{children}</div>
    </div>
  );
}

/* ============================================================
   AI flag inline
   ============================================================ */
function AIFlag({ title = 'AI suggestion', children, actions }) {
  return (
    <div className="ai-flag">
      <div className="glyph"><span className="ms">auto_awesome</span></div>
      <div className="b">
        <div className="t"><span className="ms" style={{ fontSize: 14 }}>flag</span>{title}</div>
        <div className="d">{children}</div>
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}

/* ============================================================
   Horizontal Performance sub-nav (replaces the old sidebar group)
   Lives below the topbar at the top of every Performance screen.
   ============================================================ */
const PERF_TABS = {
  client: [
    { id: 'dashboard',    label: 'Dashboard',    route: '/client/dashboard' },
    { id: 'okrs',         label: 'Goals & OKRs', route: '/client/okrs' },
    { id: 'reviews',      label: 'Reviews',      route: '/client/reviews' },
    { id: 'meetings',     label: '1:1 Meetings', route: '/client/meetings' },
  ],
  worker: [
    { id: 'dashboard',   label: 'Dashboard',        route: '/worker/dashboard' },
    { id: 'my-goals',    label: 'My Goals',         route: '/worker/goals' },
    { id: 'my-meetings', label: 'My 1:1 sessions',  route: '/worker/meetings' },
    { id: 'my-reviews',  label: 'Feedback & Reviews',route: '/worker/reviews' },
  ],
};

function PerfTabs({ variant = 'client', active = 'dashboard' }) {
  const tabs = PERF_TABS[variant] || PERF_TABS.client;
  return (
    <div className="perf-tabs">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`perf-tab ${t.id === active ? 'active' : ''}`}
          style={{ cursor: t.route ? 'pointer' : 'default' }}
          onClick={() => { if (t.route) window.location.hash = t.route; }}
        >
          {t.label}
        </div>
      ))}
      <div className="perf-tabs-spacer" />
      <a className="perf-tabs-end">See all<span className="ms">expand_more</span></a>
    </div>
  );
}

/* ============================================================
   Impersonation banner — shown when admin is viewing as a client
   ============================================================ */
function ImpersonationBanner({ clientName, onExit }) {
  return (
    <div className="impersonation-bar">
      <div className="left">
        <span className="ms">shield_person</span>
        <div>
          <div className="t">You're viewing <strong>{clientName}</strong>'s workspace as Payoneer Internal</div>
          <div className="d">Read-only access. All views are logged in the audit trail.</div>
        </div>
      </div>
      <Btn variant="ghost" size="sm" icon="logout" onClick={onExit}>Exit view-as-client</Btn>
    </div>
  );
}

/* ============================================================
   Goals Due Soon — high-attention strip for dashboards
   Highlights OKRs that fall due within ~10 days, with their
   key results inline. Used by client + worker dashboards.
   ============================================================ */
function GoalsDueSoon({ goals = [], variant = 'client' }) {
  if (!goals.length) return null;

  const headerCopy = variant === 'worker'
    ? { title: 'Goals due in the next 10 days', sub: 'These OKRs are landing soon — review progress and unblock the key results.' }
    : { title: 'Team goals due in the next 10 days', sub: 'These OKRs are landing soon across your reports — review progress and unblock the key results.' };

  function urgencyTone(daysLeft) {
    if (daysLeft <= 3) return { bg: 'var(--error-bg)', fg: 'var(--error-dark)', label: daysLeft <= 0 ? 'Due today' : `${daysLeft}d left` };
    if (daysLeft <= 7) return { bg: '#FFE3D9', fg: 'var(--brand-red-600)', label: `${daysLeft}d left` };
    return { bg: 'var(--warning-bg)', fg: 'var(--warning-dark)', label: `${daysLeft}d left` };
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF4EC 0%, #FFFFFF 55%, #FDEDEC 100%)',
      border: '1px solid #F8C7C3',
      borderRadius: 14,
      padding: '16px 18px 18px',
      marginBottom: 16,
      boxShadow: '0 1px 0 rgba(225, 27, 12, 0.04)',
    }}>
      <div className="row items-center gap-3" style={{ marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--error-bg)', color: 'var(--error-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="ms" style={{ fontSize: 22 }}>local_fire_department</span>
        </div>
        <div className="flex-1">
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--error-dark)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Needs attention</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--grey-800)', letterSpacing: '-0.01em' }}>{headerCopy.title}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>{headerCopy.sub}</div>
        </div>
        <Pill variant="overdue" dot>{goals.length} due soon</Pill>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {goals.map(g => {
          const u = urgencyTone(g.daysLeft);
          return (
            <div key={g.id} style={{
              background: '#fff',
              border: '1px solid var(--grey-100)',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) auto',
              gap: 14,
              alignItems: 'center',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 4 }}>{g.title}</div>
                <div className="row items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <Avatar name={g.owner} size="xs" />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--grey-700)' }}>{g.owner}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {g.ownerRole}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: u.bg, color: u.fg,
                    padding: '2px 8px', borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <span className="ms" style={{ fontSize: 13 }}>event</span>
                    Due {g.due} · {u.label}
                  </span>
                  {g.status === 'at-risk'
                    ? <Pill variant="at-risk" dot size="sm">At risk</Pill>
                    : <Pill variant="on-track" dot size="sm">On track</Pill>}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Key results</div>
                <div className="col" style={{ gap: 4 }}>
                  {g.okrs.map((kr, i) => (
                    <div key={i} className="row items-center gap-2" style={{ fontSize: 11.5 }}>
                      <span style={{
                        width: 30, textAlign: 'right',
                        fontWeight: 700, color: kr.tone === 'green' ? 'var(--success-main)' : kr.tone === 'amber' ? 'var(--warning-dark)' : 'var(--error-dark)',
                      }}>{kr.pct}%</span>
                      <div style={{ flex: 1, minWidth: 0, color: 'var(--grey-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kr.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: 140 }}>
                <ProgressBar pct={g.pct} color={g.status === 'at-risk' ? 'amber' : ''} />
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-700)', marginTop: 4, textAlign: 'right' }}>{g.pct}% overall</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Export to window so all screen scripts can use these */
Object.assign(window, {
  Avatar, AvatarStack, Btn, IconBtn, Pill, ProgressBar, TrendChip, Spark, Stars,
  Sidebar, TopBar, Shell, PageHead, StatCard, FilterBar, Filter,
  Callout, SectionCard, AIFlag, PerfTabs, ImpersonationBanner,
  GoalsDueSoon,
  NotificationBell, NotificationDropdownItem, priorityTone, NOTIF_TYPE_ICONS, formatNotifDate,
  avatarColorFor,
});


/* ============================================================================
   FILE: frames/performance-store.jsx
   ============================================================================ */

/* ─────────────────────────────────────────────────────────────────────────────
   API-backed Performance Management store.

   Replaces the prior localStorage-only shim while keeping the same
   sync-getter + subscribe surface that every JSX screen already calls.

   On boot, fetches all data the current user is allowed to see and populates
   an in-memory cache. Sync getters read from the cache; async writes hit the
   API, then re-fetch the relevant slice and emit a `performance-store-change`
   event so subscribed components re-render.
   ───────────────────────────────────────────────────────────────────────────── */

(function () {
  const API_BASE = window.PAYO_API_BASE || 'http://localhost:4000/api';
  const TOKEN_KEY = 'payo.auth.token';

  const DEFAULT_SELF_QUESTIONS = [
    'What were your top achievements during this review period?',
    'Which goals or OKRs did you complete or make meaningful progress on?',
    'Which goals or OKRs were delayed, blocked, or not completed? Why?',
    'What challenges or blockers did you face?',
    'What support did you need from your manager or team?',
    'What feedback did you receive and act on?',
    'What skills did you improve during this period?',
    'What would you like to improve in the next cycle?',
    'What goals or focus areas do you suggest for the next cycle?',
  ];
  const DEFAULT_MANAGER_QUESTIONS = [
    'How well did the worker perform against their assigned goals and OKRs?',
    "What were the worker's most meaningful achievements?",
    'What was the quality and impact of their work?',
    'How effectively did the worker communicate and collaborate?',
    'Did the worker take ownership and follow through on commitments?',
    'Did the worker complete action items discussed in 1:1s?',
    "What are the worker's key strengths?",
    "What are the worker's main areas for improvement?",
    'What should the worker focus on in the next cycle?',
    'What is the overall performance rating?',
    'Final manager summary.',
  ];
  const DEFAULT_FINAL_FIELDS = [
    'Final performance summary', 'Key strengths', 'Development areas',
    'Next cycle focus', 'Final rating', 'Worker acknowledgement comment',
  ];
  const DEFAULT_RATING_OPTIONS = [
    'Exceeds Expectations', 'Meets Expectations',
    'Partially Meets Expectations', 'Needs Improvement',
  ];
  const REVIEW_TYPE_OPTIONS = [
    { value: 'quarterly',   label: 'Quarterly Review' },
    { value: 'half-yearly', label: 'Half-Yearly Review' },
    { value: 'annual',      label: 'Annual Review' },
    { value: 'probation',   label: 'Probation Review' },
    { value: 'project',     label: 'Project Review' },
    { value: 'adhoc',       label: 'Ad hoc Review' },
  ];

  // ─── Cache ─────────────────────────────────────────────────────────────
  const cache = {
    bootstrapped: false,
    bootstrapInFlight: null,
    currentUser: null,
    workers: [],
    goals: [],
    meetings: [],
    feedback: [],
    reviewCycles: [],
    reviewParticipants: [],
    selfReviews: [],
    managerReviews: [],
    notifications: [],
    legacyReviews: [], // for screens that still call createReview/shareReview
  };

  // ─── HTTP ──────────────────────────────────────────────────────────────
  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    let res;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error(`Network error contacting ${API_BASE}: ${e.message}`);
    }
    if (res.status === 401) {
      clearToken();
      cache.currentUser = null;
      emit();
      if (window.location.hash !== '#/login') window.location.hash = '/login';
      throw new Error('Unauthorized');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
    return data;
  }

  function emit() {
    window.dispatchEvent(new CustomEvent('performance-store-change'));
  }
  function subscribe(listener) {
    window.addEventListener('performance-store-change', listener);
    return () => window.removeEventListener('performance-store-change', listener);
  }

  // ─── Adapters: backend → frontend shape ────────────────────────────────

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function adaptWorker(w) {
    if (!w) return null;
    return {
      ...w,
      role: w.title || (w.user?.role) || '',
      managerId: w.managerUserId,
    };
  }

  // Backend uses snake_case enums (on_track); the JSX checks dash-form
  // (on-track / at-risk / not-started). Normalize on read.
  function statusDash(s)   { return s ? String(s).replace(/_/g, '-') : s; }
  function statusUnder(s)  { return s ? String(s).replace(/-/g, '_') : s; }

  function adaptKeyResult(kr) {
    if (!kr) return null;
    return {
      ...kr,
      status: statusDash(kr.status),
      assignedToIds: (kr.assignees || []).map(a => a.workerId),
      current: kr.currentValue,
      target: kr.targetValue,
      unit: kr.metricType,
      dueDate: kr.dueDate ? fmtDate(kr.dueDate) : '',
    };
  }

  function adaptGoal(g) {
    if (!g) return null;
    const assigneeIds = (g.assignees || []).map(a => a.workerId);

    // Owner resolution — Goal.ownerUserId is a User.id, which could be either
    // (a) a worker's userId or (b) the manager's user id. Resolve both and
    // attach name/role so the JSX never has to translate ids → names again.
    const ownerWorker = cache.workers.find(w => w.userId === g.ownerUserId);
    let ownerName = '—';
    let ownerRole = '';
    let ownerType = 'manager';
    if (ownerWorker) {
      ownerName = ownerWorker.name;
      ownerRole = ownerWorker.role || ownerWorker.title || '';
      ownerType = 'worker';
    } else if (cache.currentUser && cache.currentUser.id === g.ownerUserId) {
      ownerName = cache.currentUser.name;
      ownerRole = 'Manager';
      ownerType = 'manager';
    }

    // Contributor names attached for each assignee (so views can render
    // "owner" + "contributors" without doing lookups).
    const contributors = (g.assignees || []).map(a => {
      const w = cache.workers.find(x => x.id === a.workerId);
      return { workerId: a.workerId, name: w?.name || '', role: w?.role || w?.title || '' };
    });

    return {
      ...g,
      status: statusDash(g.status),
      ownerId: g.ownerUserId,
      ownerUserId: g.ownerUserId,
      ownerType,
      ownerName,
      ownerRole,
      contributors,
      assigneeIds,
      collaboratorIds: assigneeIds,
      dueDate: g.dueDate ? fmtDate(g.dueDate) : '',
      startDate: g.startDate ? fmtDate(g.startDate) : '',
      period: g.period || '',
      linkedProject: g.linkedProject || '',
      source: g.source,
      goalType: g.goalType || 'individual',
      keyResults: (g.keyResults || []).map(adaptKeyResult),
    };
  }

  function adaptMeeting(m) {
    if (!m) return null;
    return {
      ...m,
      scheduledAt: m.scheduledAt || '',
      sharedNotes: m.sharedNotes || '',
      managerPrivateNotes: m.managerPrivateNotes ?? '',
      workerPrivateNotes: m.workerPrivateNotes ?? '',
      agenda: Array.isArray(m.agenda) ? m.agenda : [],
      actionItems: Array.isArray(m.actionItems) ? m.actionItems : [],
      linkedGoalIds: [],
      linkedKeyResultIds: [],
    };
  }

  function adaptFeedback(f) {
    if (!f) return null;
    return {
      ...f,
      from: f.givenBy?.name || f.from || '',
      fromRole: f.givenBy?.role === 'manager' ? 'Manager' : f.fromRole || '',
      date: f.createdAt ? fmtDate(f.createdAt) : (f.date || ''),
      type: f.feedbackType || 'recognition',
      text: f.message || '',
    };
  }

  function adaptCycle(c) {
    if (!c) return null;
    return {
      ...c,
      periodStart: c.periodStart ? String(c.periodStart).slice(0, 10) : '',
      periodEnd:   c.periodEnd   ? String(c.periodEnd).slice(0, 10)   : '',
      selfReviewDueDate:    c.selfReviewDueDate    ? String(c.selfReviewDueDate).slice(0, 10)    : '',
      managerReviewDueDate: c.managerReviewDueDate ? String(c.managerReviewDueDate).slice(0, 10) : '',
      finalSharingDate:     c.finalSharingDate     ? String(c.finalSharingDate).slice(0, 10)     : '',
      // Both naming conventions (existing JSX read both)
      includeOKRs: c.includeOkrs,
      questions: {
        selfReview:        c.selfReviewQuestions        || DEFAULT_SELF_QUESTIONS,
        managerReview:     c.managerReviewQuestions     || DEFAULT_MANAGER_QUESTIONS,
        finalSharedReview: c.finalSharedReviewQuestions || DEFAULT_FINAL_FIELDS,
      },
    };
  }

  function adaptParticipant(p) {
    if (!p) return null;
    // Backend uses `selfReviewStatus = 'not_started' | 'draft' | 'submitted'`
    // Frontend code expects 'not-started' | 'draft' | 'submitted' in places.
    // We keep both forms by mirroring.
    const normalize = (v) => v ? String(v).replace(/_/g, '-') : v;
    return {
      ...p,
      selfReviewStatus:    normalize(p.selfReviewStatus),
      managerReviewStatus: normalize(p.managerReviewStatus),
      finalReviewStatus:   normalize(p.finalReviewStatus),
      overallStatus:       normalize(p.overallStatus),
      managerId: p.managerUserId,
    };
  }

  function adaptSelfReview(s) {
    if (!s) return null;
    return {
      ...s,
      participantId: s.reviewParticipantId || s.participantId,
      answers: Array.isArray(s.answers) ? s.answers : [],
    };
  }

  function adaptManagerReview(m) {
    if (!m) return null;
    return {
      ...m,
      participantId: m.reviewParticipantId || m.participantId,
      answers: Array.isArray(m.answers) ? m.answers : [],
    };
  }

  function adaptNotification(n) {
    if (!n) return null;
    // Frontend code uses recipientRole 'client' (manager view); backend uses 'manager' or 'client_admin'.
    const role = (n.recipientRole === 'manager' || n.recipientRole === 'client_admin') ? 'client' : n.recipientRole;
    return { ...n, recipientRole: role };
  }

  // Reverse: convert outbound goal payload to backend shape.
  function toBackendGoalPayload(p) {
    return {
      title: p.title || p.name,
      description: p.description || '',
      ownerUserId: p.ownerUserId || undefined,
      source: p.source || (p.createdByRole === 'worker' ? 'worker_created' : 'employer_assigned'),
      goalType: p.goalType || p.type || 'individual',
      startDate: p.startDate || undefined,
      dueDate: p.dueDate || undefined,
      visibility: p.visibility || p.privacy || 'restricted',
      assigneeWorkerIds: p.assigneeIds || [],
      keyResults: (p.keyResults || p.krs || []).map(kr => ({
        title: kr.title || kr.name,
        description: kr.description || '',
        metricType: kr.metricType || kr.unit || 'count',
        startValue: Number(kr.startValue ?? kr.start ?? kr.current ?? 0),
        currentValue: Number(kr.currentValue ?? kr.current ?? 0),
        targetValue: Number(kr.targetValue ?? kr.target ?? 0),
        progress: kr.progress,
        dueDate: kr.dueDate || undefined,
        assigneeWorkerIds: kr.assignedToIds || p.assigneeIds || [],
      })),
    };
  }

  // ─── Auth ──────────────────────────────────────────────────────────────
  async function login(email, password) {
    const r = await request('POST', '/auth/login', { email, password });
    setToken(r.token);
    cache.currentUser = r.user;
    cache.bootstrapped = false;
    await bootstrap();
    return r.user;
  }
  function logout() {
    clearToken();
    Object.assign(cache, {
      bootstrapped: false,
      bootstrapInFlight: null,
      currentUser: null,
      workers: [],
      goals: [],
      meetings: [],
      feedback: [],
      reviewCycles: [],
      reviewParticipants: [],
      selfReviews: [],
      managerReviews: [],
      notifications: [],
      legacyReviews: [],
    });
    emit();
    window.location.hash = '/login';
  }
  function isAuthenticated() { return !!getToken(); }

  // ─── Bootstrap ─────────────────────────────────────────────────────────
  async function bootstrap() {
    if (cache.bootstrapInFlight) return cache.bootstrapInFlight;
    if (!getToken()) return;
    cache.bootstrapInFlight = (async () => {
      try {
        const me = await request('GET', '/auth/me');
        cache.currentUser = me.user;
        const role = me.user.role;
        if (role === 'worker') {
          await Promise.all([
            refreshWorkers(), refreshMyGoals(), refreshMyMeetings(),
            refreshMyFeedback(), refreshMyCycles(), refreshNotifications(),
            refreshLegacyReviews(),
          ]);
        } else {
          await Promise.all([
            refreshWorkers(), refreshGoals(), refreshMeetings(),
            refreshFeedback(), refreshCycles(), refreshNotifications(),
          ]);
        }
        cache.bootstrapped = true;
        emit();
      } catch (e) {
        console.error('[store] bootstrap failed', e);
      } finally {
        cache.bootstrapInFlight = null;
      }
    })();
    return cache.bootstrapInFlight;
  }

  // ─── Refreshers ────────────────────────────────────────────────────────
  async function refreshWorkers() {
    const r = await request('GET', '/workers');
    cache.workers = (r.workers || []).map(adaptWorker);
    emit();
  }
  async function refreshGoals() {
    const r = await request('GET', '/goals');
    cache.goals = (r.goals || []).map(adaptGoal);
    emit();
  }
  async function refreshMyGoals() {
    const r = await request('GET', '/me/goals');
    cache.goals = (r.goals || []).map(adaptGoal);
    emit();
  }
  async function refreshMeetings() {
    const r = await request('GET', '/one-on-ones');
    cache.meetings = (r.meetings || []).map(adaptMeeting);
    emit();
  }
  async function refreshMyMeetings() {
    const r = await request('GET', '/me/one-on-ones');
    cache.meetings = (r.meetings || []).map(adaptMeeting);
    emit();
  }
  async function refreshFeedback() {
    const r = await request('GET', '/feedback');
    cache.feedback = (r.feedback || []).map(adaptFeedback);
    emit();
  }
  async function refreshMyFeedback() {
    const r = await request('GET', '/me/feedback');
    cache.feedback = (r.feedback || []).map(adaptFeedback);
    emit();
  }
  async function refreshCycles() {
    const r = await request('GET', '/review-cycles');
    cache.reviewCycles = (r.reviewCycles || []).map(adaptCycle);
    cache.reviewParticipants = [];
    cache.selfReviews = [];
    cache.managerReviews = [];
    for (const c of cache.reviewCycles) {
      try {
        const p = await request('GET', `/review-cycles/${c.id}/participants`);
        for (const part of (p.participants || [])) {
          cache.reviewParticipants.push(adaptParticipant(part));
          if (part.selfReview)    cache.selfReviews.push(adaptSelfReview(part.selfReview));
          if (part.managerReview) cache.managerReviews.push(adaptManagerReview(part.managerReview));
        }
      } catch (e) { /* manager may not own all cycles */ }
    }
    emit();
  }
  async function refreshMyCycles() {
    const r = await request('GET', '/me/review-cycles');
    cache.reviewCycles = [];
    cache.reviewParticipants = [];
    cache.selfReviews = [];
    cache.managerReviews = [];
    for (const part of (r.participations || [])) {
      if (part.reviewCycle)   cache.reviewCycles.push(adaptCycle(part.reviewCycle));
      cache.reviewParticipants.push(adaptParticipant(part));
      if (part.selfReview)    cache.selfReviews.push(adaptSelfReview(part.selfReview));
      if (part.managerReview) cache.managerReviews.push(adaptManagerReview(part.managerReview));
    }
    emit();
  }
  async function refreshNotifications() {
    const r = await request('GET', '/notifications');
    cache.notifications = (r.notifications || []).map(adaptNotification);
    emit();
  }

  // ─── Sync getters ──────────────────────────────────────────────────────
  function getCurrentWorkerId() { return cache.currentUser?.workerProfile?.id || null; }
  function setCurrentWorkerId() { /* no-op under JWT auth — use the login screen to switch accounts */ }
  function getCurrentUserId() { return cache.currentUser?.id || null; }
  function getManagerId() {
    if (cache.currentUser?.role === 'manager' || cache.currentUser?.role === 'client_admin') return cache.currentUser.id;
    if (cache.currentUser?.workerProfile?.managerUserId) return cache.currentUser.workerProfile.managerUserId;
    return null;
  }

  function getData() {
    return {
      workers: cache.workers,
      goals: cache.goals,
      meetings: cache.meetings,
      feedback: cache.feedback,
      reviews: cache.legacyReviews,
      reviewCycles: cache.reviewCycles,
      reviewParticipants: cache.reviewParticipants,
      selfReviews: cache.selfReviews,
      managerReviews: cache.managerReviews,
      notifications: cache.notifications,
    };
  }

  function getWorkers() { return cache.workers; }
  function workerById(id) { return cache.workers.find(w => w.id === id) || null; }
  function workerIdFromName(name) {
    const m = cache.workers.find(w => w.name.toLowerCase() === String(name || '').toLowerCase());
    return m ? m.id : null;
  }

  function getGoals() { return cache.goals; }
  function getGoalsForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    if (!id) return [];
    return cache.goals.filter(g =>
      (g.assigneeIds || []).includes(id) ||
      (g.keyResults || []).some(kr => (kr.assignedToIds || []).includes(id))
    );
  }
  function getPeopleGoals() {
    return cache.workers.map(w => ({ worker: w, goals: getGoalsForWorker(w.id) }))
      .filter(g => g.goals.length);
  }
  function workerHasActiveGoals(workerId) {
    return cache.goals.some(g =>
      (g.assigneeIds || []).includes(workerId) && g.status !== 'completed'
    );
  }
  function getSelectableWorkers(participantType, includeWithNoGoals) {
    let list = cache.workers;
    if (participantType === 'employees')   list = list.filter(w => w.workerType === 'employee');
    else if (participantType === 'contractors') list = list.filter(w => w.workerType === 'contractor');
    if (!includeWithNoGoals) list = list.filter(w => workerHasActiveGoals(w.id));
    return list;
  }

  function getMeetingsForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    return cache.meetings.filter(m => m.workerId === id);
  }
  function getFeedbackForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    return cache.feedback.filter(f => f.workerId === id);
  }

  function getReviewCycles() { return cache.reviewCycles; }
  function getActiveReviewCycles() { return cache.reviewCycles.filter(c => c.status === 'active'); }
  function getReviewCycleById(id) { return cache.reviewCycles.find(c => c.id === id) || null; }
  function getReviewParticipants(cycleId) { return cache.reviewParticipants.filter(p => p.reviewCycleId === cycleId); }
  function getReviewParticipantById(id) { return cache.reviewParticipants.find(p => p.id === id) || null; }
  function getReviewParticipantForWorker(cycleId, workerId) {
    return cache.reviewParticipants.find(p => p.reviewCycleId === cycleId && p.workerId === workerId) || null;
  }
  function getReviewCyclesForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    const cycleIds = new Set(cache.reviewParticipants.filter(p => p.workerId === id).map(p => p.reviewCycleId));
    return cache.reviewCycles.filter(c => cycleIds.has(c.id));
  }
  function getSelfReview(participantId) {
    return cache.selfReviews.find(s => s.participantId === participantId) || null;
  }
  function getManagerReview(participantId) {
    return cache.managerReviews.find(m => m.participantId === participantId) || null;
  }

  function getReviewContextForWorker(workerId, cycleId) {
    // Approximate the old method using cached data. The full backend version
    // is at GET /manager/reviews/:participantId — call it lazily if you need
    // the canonical bundle.
    const cycle = getReviewCycleById(cycleId);
    const worker = workerById(workerId);
    const goals = getGoalsForWorker(workerId);
    const keyResults = goals.flatMap(g => (g.keyResults || []).filter(kr => (kr.assignedToIds || []).includes(workerId)));
    const meetings = getMeetingsForWorker(workerId);
    const feedback = getFeedbackForWorker(workerId);
    return { cycle, worker, goals, keyResults, meetings, feedback };
  }

  function getNotifications() { return cache.notifications; }
  function getNotificationsForUser() {
    return cache.notifications.filter(n => !n.archivedAt);
  }
  function getUnreadNotificationCount() {
    return cache.notifications.filter(n => !n.readAt && !n.archivedAt).length;
  }

  // ─── Async writes ──────────────────────────────────────────────────────
  async function createGoal(payload) {
    const r = await request('POST', '/goals', toBackendGoalPayload(payload));
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptGoal(r.goal);
  }
  async function updateGoal(id, patch) {
    const body = toBackendGoalPayload(patch);
    if (patch.status) body.status = patch.status;
    if (patch.progress != null) body.progress = patch.progress;
    const r = await request('PATCH', `/goals/${id}`, body);
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptGoal(r.goal);
  }
  async function assignGoalToWorkers(goalId, workerIds) {
    for (const wId of workerIds) {
      try { await request('POST', `/goals/${goalId}/assignees`, { workerId: wId }); } catch (e) {}
    }
    await refreshGoals();
  }
  async function createKeyResult(goalId, payload) {
    const r = await request('POST', `/goals/${goalId}/key-results`, {
      title: payload.title,
      description: payload.description || '',
      metricType: payload.metricType || payload.unit || 'count',
      startValue: Number(payload.startValue ?? payload.start ?? 0),
      currentValue: Number(payload.currentValue ?? payload.current ?? 0),
      targetValue: Number(payload.targetValue ?? payload.target ?? 0),
      progress: payload.progress,
      dueDate: payload.dueDate || undefined,
      assigneeWorkerIds: payload.assignedToIds || [],
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptKeyResult(r.keyResult);
  }
  async function updateKeyResult(goalIdOrKrId, krIdOrPatch, maybePatch) {
    // Backwards-compatible: old signature was (goalId, krId, patch). New: (krId, patch).
    const krId = maybePatch ? krIdOrPatch : goalIdOrKrId;
    const patch = maybePatch || krIdOrPatch;
    const body = { ...patch };
    if (patch.current != null)  body.currentValue = patch.current;
    if (patch.target  != null)  body.targetValue  = patch.target;
    if (patch.unit)             body.metricType   = patch.unit;
    if (body.status)            body.status       = statusUnder(body.status);
    const r = await request('PATCH', `/key-results/${krId}`, body);
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptKeyResult(r.keyResult);
  }

  async function createMeeting(payload) {
    const r = await request('POST', '/one-on-ones', {
      workerId: payload.workerId,
      title: payload.title || '1:1',
      scheduledAt: payload.scheduledAt || payload.scheduledDate || new Date().toISOString(),
      agenda: payload.agenda || [],
      sharedNotes: payload.sharedNotes || '',
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyMeetings() : refreshMeetings());
    return adaptMeeting(r.meeting);
  }
  async function request1on1(payload = {}) {
    const r = await request('POST', '/me/one-on-ones/request', payload);
    await refreshNotifications();
    return r.notification;
  }

  async function updateMeetingNotes(meetingId, patch) {
    const calls = [];
    if (patch.sharedNotes !== undefined) {
      calls.push(request('PATCH', `/one-on-ones/${meetingId}/shared-notes`, { sharedNotes: patch.sharedNotes }));
    }
    if (patch.managerPrivateNotes !== undefined && cache.currentUser?.role !== 'worker') {
      calls.push(request('PATCH', `/one-on-ones/${meetingId}/manager-private-notes`, { managerPrivateNotes: patch.managerPrivateNotes }));
    }
    if (patch.workerPrivateNotes !== undefined && cache.currentUser?.role === 'worker') {
      calls.push(request('PATCH', `/me/one-on-ones/${meetingId}/worker-private-notes`, { workerPrivateNotes: patch.workerPrivateNotes }));
    }
    await Promise.all(calls);
    await (cache.currentUser?.role === 'worker' ? refreshMyMeetings() : refreshMeetings());
  }

  async function createFeedback(payload) {
    const r = await request('POST', '/feedback', {
      workerId: payload.workerId,
      feedbackType: payload.feedbackType || payload.type || 'recognition',
      title: payload.title || (payload.text || '').slice(0, 60),
      message: payload.message || payload.text || '',
      visibility: payload.visibility || 'shared_with_worker',
      linkedGoalId: payload.linkedGoalId || null,
      linkedKeyResultId: payload.linkedKeyResultId || null,
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyFeedback() : refreshFeedback());
    return adaptFeedback(r.feedback);
  }

  function buildCyclePayload(p) {
    return {
      name: p.name,
      reviewType: p.type || p.reviewType || 'quarterly',
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      purpose: p.purpose || '',
      participantType: p.participantType || 'employees',
      includeWorkersWithNoGoals: !!p.includeWorkersWithNoGoals,
      includeGoals: p.includeGoals !== false,
      includeOkrs: (p.includeOKRs !== false) && (p.includeOkrs !== false),
      includeWorkerCreatedGoals: p.includeWorkerCreatedGoals !== false,
      includeProgressUpdates: p.includeProgressUpdates !== false,
      includeMeetings: p.includeMeetings !== false,
      includeSharedNotes: p.includeSharedNotes !== false,
      includeFeedback: p.includeFeedback !== false,
      includeRating: p.includeRating !== false,
      ratingScale: p.ratingScale || 'simple-4',
      ratingOptions: p.ratingOptions?.length ? p.ratingOptions : DEFAULT_RATING_OPTIONS,
      showRatingToWorker: p.showRatingToWorker !== false,
      showManagerFinalCommentsToWorker: p.showManagerFinalCommentsToWorker !== false,
      selfReviewDueDate: p.selfReviewDueDate || undefined,
      managerReviewDueDate: p.managerReviewDueDate || undefined,
      finalSharingDate: p.finalSharingDate || undefined,
      selfReviewQuestions:        p.questions?.selfReview        || p.selfReviewQuestions        || DEFAULT_SELF_QUESTIONS,
      managerReviewQuestions:     p.questions?.managerReview     || p.managerReviewQuestions     || DEFAULT_MANAGER_QUESTIONS,
      finalSharedReviewQuestions: p.questions?.finalSharedReview || p.finalSharedReviewQuestions || DEFAULT_FINAL_FIELDS,
    };
  }
  async function createReviewCycle(payload) {
    const r = await request('POST', '/review-cycles', buildCyclePayload(payload));
    await refreshCycles();
    return adaptCycle(r.reviewCycle);
  }
  async function saveReviewCycleDraft(payload) {
    // Backend doesn't expose draft-update; create new draft on save.
    return createReviewCycle({ ...payload, status: 'draft' });
  }
  async function launchReviewCycle(idOrPayload) {
    let id = idOrPayload;
    let workerIds;
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      if (!idOrPayload.id) {
        const created = await createReviewCycle(idOrPayload);
        id = created.id;
      } else {
        id = idOrPayload.id;
      }
      workerIds = idOrPayload.workerIds;
    }
    const r = await request('POST', `/review-cycles/${id}/launch`, workerIds ? { workerIds } : {});
    await refreshCycles();
    return adaptCycle(r.reviewCycle);
  }

  async function saveSelfReview(participantId, answers) {
    const r = await request('PATCH', `/me/self-reviews/${participantId}`, { answers });
    await refreshMyCycles();
    return adaptSelfReview(r.selfReview);
  }
  async function submitSelfReview(participantId) {
    const r = await request('POST', `/me/self-reviews/${participantId}/submit`);
    await refreshMyCycles();
    return adaptSelfReview(r.selfReview);
  }
  async function acknowledgeReview(participantId, comment) {
    const r = await request('POST', `/me/reviews/${participantId}/acknowledge`, { comment: comment || '' });
    await refreshMyCycles();
    return adaptParticipant(r.participant);
  }

  async function saveManagerReview(participantId, payload) {
    const r = await request('PATCH', `/manager/reviews/${participantId}`, payload);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }
  async function submitManagerReview(participantId) {
    const r = await request('POST', `/manager/reviews/${participantId}/submit`);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }
  async function shareManagerReview(participantId) {
    const r = await request('POST', `/manager/reviews/${participantId}/share`);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }

  async function markNotificationRead(id) {
    await request('POST', `/notifications/${id}/read`);
    await refreshNotifications();
  }
  async function markAllNotificationsRead() {
    await request('POST', '/notifications/mark-all-read');
    await refreshNotifications();
  }
  async function archiveNotification(id) {
    await request('POST', `/notifications/${id}/archive`);
    await refreshNotifications();
  }

  // ─── Notification "generators" — now server-side; client just re-fetches.
  async function runAllNotificationGenerators() {
    // Best-effort: manager-only endpoint. If it 403s for workers we just refresh.
    if (cache.currentUser?.role !== 'worker') {
      try { await request('POST', '/notifications/run-generators'); } catch (e) {}
    }
    await refreshNotifications();
  }
  const generateDueDateNotifications  = runAllNotificationGenerators;
  const generateReviewNotifications   = runAllNotificationGenerators;
  const generateMeetingNotifications  = runAllNotificationGenerators;

  // ─── One-off "write a review" (now persisted via backend) ──────────────
  async function createReview(payload) {
    const r = await request('POST', '/reviews', {
      workerId: payload.workerId,
      title: payload.title || 'Performance review',
      period: payload.period || '',
      rating: payload.rating != null ? String(payload.rating) : '',
      comments: payload.comments || '',
      visibleToWorker: !!payload.visibleToWorker,
      status: payload.status || (payload.visibleToWorker ? 'shared' : 'submitted'),
    });
    // Refresh both manager and worker review lists.
    await refreshLegacyReviews(payload.workerId);
    return r.review;
  }
  async function shareReview(reviewId) {
    const r = await request('POST', `/reviews/${reviewId}/share`);
    await refreshLegacyReviews(r.review.workerId);
    return r.review;
  }
  function getReviewsForWorker(workerId, includeHidden) {
    const id = workerId || getCurrentWorkerId();
    if (!id) return [];
    // Synchronous read from the cache; the most recent fetch populated it.
    return cache.legacyReviews.filter(r => r.workerId === id && (includeHidden || r.visibleToWorker));
  }
  async function refreshLegacyReviews(workerId) {
    try {
      if (cache.currentUser?.role === 'worker') {
        const r = await request('GET', '/me/reviews-history');
        cache.legacyReviews = (r.reviews || []).map(rv => ({
          ...rv,
          createdAt: rv.createdAt ? fmtDate(rv.createdAt) : '',
        }));
      } else if (workerId) {
        const r = await request('GET', `/workers/${workerId}/reviews?includeHidden=true`);
        // Replace just this worker's slice
        cache.legacyReviews = [
          ...cache.legacyReviews.filter(x => x.workerId !== workerId),
          ...(r.reviews || []).map(rv => ({
            ...rv,
            createdAt: rv.createdAt ? fmtDate(rv.createdAt) : '',
          })),
        ];
      }
      emit();
    } catch (e) {
      console.warn('refreshLegacyReviews failed', e.message);
    }
  }

  // ─── Exports ───────────────────────────────────────────────────────────
  window.PerformanceStore = {
    // constants
    DEFAULT_SELF_QUESTIONS, DEFAULT_MANAGER_QUESTIONS, DEFAULT_FINAL_FIELDS,
    DEFAULT_RATING_OPTIONS, REVIEW_TYPE_OPTIONS,
    get MANAGER_ID() { return getManagerId(); },
    get CURRENT_WORKER_ID() { return getCurrentWorkerId(); },

    // auth + bootstrap
    login, logout, isAuthenticated, bootstrap,
    getCurrentUser: () => cache.currentUser,
    isBootstrapped: () => cache.bootstrapped,

    // identity
    getCurrentWorkerId, setCurrentWorkerId,

    // reads
    getData,
    getWorkers, workerById, workerIdFromName,
    getGoals, getGoalsForWorker, getPeopleGoals,
    getSelectableWorkers, workerHasActiveGoals,
    getMeetingsForWorker, getFeedbackForWorker,
    getReviewCycles, getActiveReviewCycles, getReviewCycleById,
    getReviewParticipants, getReviewParticipantById, getReviewParticipantForWorker,
    getReviewCyclesForWorker, getSelfReview, getManagerReview,
    getReviewContextForWorker,
    getNotifications, getNotificationsForUser, getUnreadNotificationCount,

    // writes (async)
    createGoal, updateGoal, assignGoalToWorkers,
    createKeyResult, updateKeyResult,
    createMeeting, updateMeetingNotes, request1on1,
    createFeedback,
    createReviewCycle, saveReviewCycleDraft, launchReviewCycle,
    saveSelfReview, submitSelfReview, acknowledgeReview,
    saveManagerReview, submitManagerReview, shareManagerReview,
    markNotificationRead, markAllNotificationsRead, archiveNotification,
    runAllNotificationGenerators, generateDueDateNotifications,
    generateReviewNotifications, generateMeetingNotifications,

    // legacy in-memory
    createReview, shareReview, getReviewsForWorker, refreshLegacyReviews,

    // subscribe
    subscribe,

    // manual reload (handy for components after errors)
    refresh: bootstrap,
    refreshAll,
  };

  // Silent re-fetch of every slice the current user is allowed to see.
  // Used by App.useEffect(..., [hash]) so each route change picks up
  // changes another session wrote.
  async function refreshAll() {
    if (!getToken() || !cache.currentUser) return;
    try {
      if (cache.currentUser.role === 'worker') {
        await Promise.all([
          refreshWorkers(), refreshMyGoals(), refreshMyMeetings(),
          refreshMyFeedback(), refreshMyCycles(), refreshNotifications(),
        ]);
      } else {
        await Promise.all([
          refreshWorkers(), refreshGoals(), refreshMeetings(),
          refreshFeedback(), refreshCycles(), refreshNotifications(),
        ]);
      }
    } catch (e) { /* per-slice errors already log */ }
  }
})();


/* ============================================================================
   FILE: frames/login.jsx
   ============================================================================ */

/* Login screen — authenticates against POST /api/auth/login and stores the
   JWT in localStorage. Includes a "switch demo account" pill row so the user
   can flip between the three seeded demo accounts (Priya, Aditi, Rahul). */

const { useState: useStateLogin } = React;

const DEMO_ACCOUNTS = [
  { email: 'priya@demo.com', label: 'Priya Mehta',  sub: 'Manager',    role: 'manager' },
  { email: 'aditi@demo.com', label: 'Aditi Sharma', sub: 'Employee',   role: 'worker' },
  { email: 'rahul@demo.com', label: 'Rahul Mehta',  sub: 'Contractor', role: 'worker' },
];

function LoginScreen() {
  const [email, setEmail] = useStateLogin('priya@demo.com');
  const [password, setPassword] = useStateLogin('password123');
  const [error, setError] = useStateLogin('');
  const [submitting, setSubmitting] = useStateLogin(false);

  async function doLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await window.PerformanceStore.login(email, password);
      const home = user.role === 'worker' ? '/worker/dashboard' : '/client/dashboard';
      window.location.hash = home;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function loginAs(acct) {
    setEmail(acct.email);
    setPassword('password123');
    setError('');
    setSubmitting(true);
    try {
      const user = await window.PerformanceStore.login(acct.email, 'password123');
      const home = user.role === 'worker' ? '/worker/dashboard' : '/client/dashboard';
      window.location.hash = home;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F1EA 0%, #EFEAE0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        padding: '32px 30px 26px',
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Payo WFM
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            Performance Management
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
            Sign in to continue.
          </div>
        </div>

        <form onSubmit={doLogin} className="col gap-3">
          <label className="col" style={{ gap: 5 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</span>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} autoComplete="email" />
          </label>
          <label className="col" style={{ gap: 5 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</span>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} autoComplete="current-password" />
          </label>

          {error && (
            <div style={{
              padding: '10px 12px', background: '#FDEDEC', color: '#9F1308',
              borderRadius: 8, fontSize: 12.5, border: '1px solid #F8C7C3',
            }}>{error}</div>
          )}

          <button type="submit" disabled={submitting}
            style={{
              padding: '11px 14px', borderRadius: 10, border: 'none',
              background: submitting ? '#A0B4D9' : '#0075E1', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: submitting ? 'progress' : 'pointer',
              marginTop: 4,
            }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 24, borderTop: '1px solid #EFEAE0', paddingTop: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Demo accounts
          </div>
          <div className="col gap-2">
            {DEMO_ACCOUNTS.map(acct => (
              <button key={acct.email}
                onClick={() => loginAs(acct)}
                disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid #EFEAE0', background: '#FBFAF7',
                  textAlign: 'left',
                }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{acct.label}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{acct.sub} · {acct.email}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0075E1' }}>Sign in →</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 12 }}>
            All demo accounts use the password <code style={{ background: '#F4F1EA', padding: '1px 5px', borderRadius: 4 }}>password123</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #E5DFD2',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  boxSizing: 'border-box',
};

window.LoginScreen = LoginScreen;


/* ============================================================================
   FILE: frames/notifications.jsx
   ============================================================================ */

/* Full notifications page — used for both /client/notifications and /worker/notifications.
   Tabbed filter (All / Unread / Goals / OKRs / Reviews / 1:1s / Feedback). */

const { useState: useStateNF, useEffect: useEffectNF } = React;

const NOTIF_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'unread',   label: 'Unread' },
  { id: 'goals',    label: 'Goals',    types: ['goal_completed'],                 entityTypes: ['goal'] },
  { id: 'okrs',     label: 'OKRs',     types: ['okr_completed','okr_due_soon','okr_due_today'], entityTypes: ['okr'] },
  { id: 'reviews',  label: 'Reviews',  types: ['review_due_today'],               entityTypes: ['review'] },
  { id: 'meetings', label: '1:1s',     types: ['one_on_one_today'],               entityTypes: ['meeting'] },
  { id: 'feedback', label: 'Feedback', types: ['feedback_received'],              entityTypes: ['feedback'] },
];

function NotificationsPage({ persona = 'client' }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateNF(0);
  const [activeTab, setActiveTab] = useStateNF('all');

  useEffectNF(() => {
    try { Store.runAllNotificationGenerators(); } catch (e) {}
    return Store.subscribe(() => setStoreVersion(v => v + 1));
  }, []);

  const recipientRole = persona === 'worker' ? 'worker' : 'client';
  const recipientId = persona === 'worker' ? Store.getCurrentWorkerId() : Store.MANAGER_ID;
  const all = Store.getNotificationsForUser(recipientRole, recipientId);
  const unreadCount = all.filter(n => !n.readAt).length;

  const filtered = filterByTab(all, activeTab);

  function markAll() { Store.markAllNotificationsRead(recipientRole, recipientId); }
  function onClickItem(n) {
    Store.markNotificationRead(n.id);
    if (n.actionContext && n.actionContext.kind === 'manager-review' && n.actionContext.participantId) {
      try { window.sessionStorage.setItem('payo.reviews.openManagerReview', n.actionContext.participantId); } catch (e) {}
    }
    if (n.actionRoute) window.location.hash = n.actionRoute;
  }
  function onArchive(n) { Store.archiveNotification(n.id); }

  return (
    <Shell persona={persona === 'worker' ? 'worker' : 'client'} active="performance"
      crumb={persona === 'worker'
        ? ['Payo WFM', 'Performance', 'Notifications']
        : ['Acme Holdings', 'Performance', 'Notifications']}>
      <PerfTabs variant={persona === 'worker' ? 'worker' : 'client'} active="dashboard" />

      <PageHead
        eyebrow="Notifications"
        title="All notifications"
        sub={`${all.length} total · ${unreadCount} unread`}
        actions={<>
          <Btn variant="ghost" icon="done_all" onClick={markAll}>Mark all as read</Btn>
        </>}
      />

      <div className="row gap-2 mb-4 items-center" style={{ flexWrap: 'wrap' }}>
        {NOTIF_TABS.map(t => {
          const active = activeTab === t.id;
          const tabCount = t.id === 'all' ? all.length : t.id === 'unread' ? unreadCount : filterByTab(all, t.id).length;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="filter"
              style={{
                background: active ? 'var(--brand-blue-100)' : '#fff',
                borderColor: active ? 'var(--brand-blue-500)' : 'var(--grey-200)',
                color: active ? 'var(--brand-blue-600)' : 'var(--grey-700)',
                fontWeight: 700,
              }}>
              {t.label}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)' }}>{tabCount}</span>
            </button>
          );
        })}
      </div>

      <SectionCard
        title={`${filtered.length} notification${filtered.length === 1 ? '' : 's'}`}
        sub={NOTIF_TABS.find(t => t.id === activeTab)?.label || 'All'}
        icon="notifications"
        padBody={false}
      >
        {filtered.length === 0 && (
          <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            No notifications here.
          </div>
        )}
        {filtered.map(n => <NotificationRow key={n.id} n={n} onClick={() => onClickItem(n)} onArchive={() => onArchive(n)} />)}
      </SectionCard>
    </Shell>
  );
}

function filterByTab(all, tabId) {
  if (tabId === 'all') return all;
  if (tabId === 'unread') return all.filter(n => !n.readAt);
  const tab = NOTIF_TABS.find(t => t.id === tabId);
  if (!tab) return all;
  return all.filter(n => tab.types?.includes(n.type) || tab.entityTypes?.includes(n.entityType));
}

function NotificationRow({ n, onClick, onArchive }) {
  const tone = priorityTone(n.priority);
  const icon = NOTIF_TYPE_ICONS[n.type] || 'notifications';
  const isUnread = !n.readAt;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr) 110px 90px 140px',
      gap: 14, alignItems: 'center',
      padding: '14px 22px', borderTop: '1px solid var(--grey-50)',
      background: isUnread ? 'var(--brand-blue-100)' : '#fff',
      cursor: 'pointer',
    }} onClick={onClick}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: tone.bg, color: tone.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="ms" style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--grey-800)' }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 800, color: tone.fg, background: tone.bg, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em', justifySelf: 'start' }}>{n.priority || 'low'}</span>
      <span style={{ fontSize: 11.5, color: 'var(--fg-secondary)', fontWeight: 700 }}>{formatNotifDate(n.createdAt)}</span>
      <div className="row gap-2" style={{ justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
        {n.actionLabel && (
          <Btn variant={isUnread ? 'primary' : 'outlined'} size="sm" iconTrailing="arrow_forward" onClick={onClick}>
            {n.actionLabel}
          </Btn>
        )}
        <IconBtn icon="archive" title="Archive" onClick={onArchive} />
      </div>
    </div>
  );
}

window.NotificationsPage = NotificationsPage;


/* ============================================================================
   FILE: frames/projects.jsx
   ============================================================================ */

/* Projects module — ProjectStore (localStorage) + Projects page UI */

// ── ProjectStore ──────────────────────────────────────────────────────────────
(function () {
  const KEY = 'payo.projects.v2';
  const SEED = [
    { id: 'p01', name: 'Payroll Migration EU',          status: 'active' },
    { id: 'p02', name: 'Vendor Setup Automation',        status: 'active' },
    { id: 'p03', name: 'Client Onboarding Q3',           status: 'active' },
    { id: 'p04', name: 'Comms Unification',              status: 'active' },
    { id: 'p05', name: 'CS Quality Q3',                  status: 'active' },
    { id: 'p06', name: 'Q3 Review Cycle Ops',            status: 'active' },
    { id: 'p07', name: 'Review Quality rollout',         status: 'active' },
    { id: 'p08', name: 'KYB Automation v2',              status: 'active' },
    { id: 'p09', name: 'Contractor Onboarding Revamp',   status: 'active' },
    { id: 'p10', name: 'CSAT Recovery Program',          status: 'active' },
    { id: 'p11', name: 'Ops Tooling Modernisation',      status: 'active' },
    { id: 'p12', name: 'Q3 Payroll Quality Initiative',  status: 'active' },
  ];

  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) && d.length ? d : null; } catch { return null; }
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

  let projects = load() || SEED;
  const subs = new Set();
  function emit() { subs.forEach(fn => { try { fn(); } catch {} }); }

  window.ProjectStore = {
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    getProjects() { return projects; },
    getProjectNames() { return projects.map(p => p.name); },
    isCompleted(name) { return projects.some(p => p.name === name && p.status === 'completed'); },
    getCompletedAt(name) { const p = projects.find(x => x.name === name); return p ? (p.completedAt || null) : null; },
    markComplete(name) {
      projects = projects.map(p => p.name === name ? { ...p, status: 'completed', completedAt: new Date().toISOString() } : p);
      save(projects); emit();
    },
    reopen(name) {
      projects = projects.map(p => p.name === name ? { ...p, status: 'active', completedAt: null } : p);
      save(projects); emit();
    },
    addProject(name) {
      if (!name.trim() || projects.some(p => p.name === name)) return;
      projects = [...projects, { id: 'p' + Date.now(), name: name.trim(), status: 'active' }];
      save(projects); emit();
    },
  };
})();

// ── WorkerGoalStore ───────────────────────────────────────────────────────────
// Shared store so updates in the worker "My Goals" view are instantly visible
// in the manager "People OKRs" view (and vice-versa).
(function () {
  const KEY = 'payo.workerGoals.v2';
  const SEED = [
    {
      id: 'PO-01', ownerName: 'Aditi Sharma', workerRole: 'Senior Ops', aditiRole: 'owner',
      title: 'Complete 6 customer payroll migrations to v2 platform',
      pct: 90, status: 'on-track', due: 'Sep 30, 2026',
      kr: [
        { t: 'Migrate 6 anchor customers',         pct: 100, current: '6',   target: '6',   unit: 'count',  linkedProject: 'Payroll Migration EU' },
        { t: 'Zero P0 incidents during migration', pct: 100, current: '0',   target: '0',   unit: 'count' },
        { t: 'CSAT > 4.5 post-migration',          pct:  70, current: '4.4', target: '4.5', unit: 'rating' },
      ],
    },
    {
      id: 'PO-09', ownerName: 'Aditi Sharma', workerRole: 'Senior Ops', aditiRole: 'owner',
      title: 'Mentor 2 junior teammates through their first migration',
      pct: 55, status: 'on-track', due: 'Dec 15, 2026',
      kr: [
        { t: 'Pair on at least 4 client kickoffs',        pct: 75, current: '3', target: '4', unit: 'count' },
        { t: 'Document one knowledge transfer per month', pct: 50, current: '3', target: '6', unit: 'count' },
      ],
    },
    {
      id: 'TG-02', ownerName: 'Ops Team', workerRole: 'Team owner', aditiRole: 'contrib',
      title: 'Improve overall payroll quality across EU runs',
      pct: 91, status: 'on-track', due: 'Sep 30, 2026',
      kr: [
        { t: 'Payroll runs without P0 below 1%', pct: 95, current: '0.4',  target: '1',    unit: '%', linkedProject: 'Payroll Migration EU' },
        { t: 'Run accuracy ≥ 99.5%',             pct: 92, current: '99.4', target: '99.5', unit: '%' },
      ],
    },
    {
      id: 'CG-03', ownerName: 'Hannah Mueller', workerRole: 'Head of Compliance', aditiRole: 'stakeholder',
      title: 'Build a global, compliant contractor experience',
      pct: 85, status: 'on-track', due: 'Sep 30, 2026', kr: [],
    },
    {
      id: 'PO-02', ownerName: 'Omar Khan', workerRole: 'Vendor Lead', aditiRole: null,
      title: 'Reduce vendor setup time by 20% (8d → 6.4d)',
      pct: 45, status: 'at-risk', due: 'Oct 15, 2026',
      kr: [
        { t: 'Automate KYB checks for 80% of vendors', pct: 62, current: '50',  target: '80',  unit: 'count', linkedProject: 'Vendor Setup Automation' },
        { t: 'Average setup time under 7d',             pct: 40, current: '7.5', target: '7',   unit: 'days' },
        { t: 'Vendor satisfaction > 4.0',               pct: 25, current: '3.2', target: '4.0', unit: 'rating' },
      ],
    },
    {
      id: 'PO-03', ownerName: 'Lina Chen', workerRole: 'Onboarding Mgr', aditiRole: null,
      title: 'Improve client onboarding quality score to 4.6',
      pct: 58, status: 'on-track', due: 'Oct 30, 2026',
      kr: [
        { t: 'Onboarding NPS up to 60',         pct: 55, current: '52',  target: '60',  unit: 'count', linkedProject: 'Client Onboarding Q3' },
        { t: 'Time-to-first-payroll under 14d', pct: 70, current: '15d', target: '14d', unit: 'days' },
        { t: 'Knowledge base coverage > 90%',   pct: 50, current: '78%', target: '90%', unit: '%' },
      ],
    },
    {
      id: 'PO-04', ownerName: 'Diego Alvarez', workerRole: 'Senior Engineer', aditiRole: null,
      title: 'Refactor payments service to v2 API',
      pct: 82, status: 'on-track', due: 'Nov 15, 2026',
      kr: [
        { t: 'Migrate all 14 endpoints',  pct: 86, current: '12',         target: '14',   unit: 'count', linkedProject: 'Comms Unification' },
        { t: 'Reduce p95 latency by 30%', pct: 92, current: '−27%',       target: '−30%', unit: '%' },
        { t: 'Zero downtime cutover',     pct: 70, current: 'Pending UAT', target: '1',    unit: 'incomplete' },
      ],
    },
    {
      id: 'PO-05', ownerName: 'Karim Idris', workerRole: 'Customer Success', aditiRole: null,
      title: 'Move 80% of CS escalations to self-serve playbooks',
      pct: 22, status: 'at-risk', due: 'Dec 15, 2026',
      kr: [
        { t: 'Publish 25 playbooks',        pct: 36, current: '9',   target: '25',   unit: 'count' },
        { t: 'Self-serve resolution > 60%', pct: 18, current: '38%', target: '60%',  unit: '%' },
        { t: 'Escalations down 30%',        pct: 12, current: '−8%', target: '−30%', unit: '%' },
      ],
    },
  ];

  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) && d.length ? d : null; } catch { return null; }
  }
  function save(g) { try { localStorage.setItem(KEY, JSON.stringify(g)); } catch {} }

  let goals = load() || SEED;
  const subs = new Set();
  function emit() { subs.forEach(fn => { try { fn(); } catch {} }); }

  window.WorkerGoalStore = {
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    getGoals() { return goals; },
    getPeopleOKRs() {
      return goals.filter(g => !g.id.startsWith('TG-') && !g.id.startsWith('CG-'));
    },
    getAditiGoals() {
      return goals.filter(g => g.aditiRole !== null).map(g => ({ ...g, role: g.aditiRole }));
    },
    updateGoal(id, patch) {
      goals = goals.map(g => g.id === id ? { ...g, ...patch } : g);
      save(goals); emit();
    },
    addGoal(payload) {
      const due = payload.dates ? (payload.dates.split('—')[1] || payload.dates).trim() : '';
      const id = 'UG-' + Date.now().toString(36).slice(-5).toUpperCase();
      const newGoal = {
        id,
        ownerName: 'Aditi Sharma',
        workerRole: 'Senior Ops',
        aditiRole: 'owner',
        title: payload.name || 'Untitled Goal',
        pct: 0,
        status: 'on-track',
        due,
        kr: (payload.krs || []).map(k => ({
          t: k.name || '',
          pct: 0,
          current: String(k.start ?? 0),
          target: String(k.target ?? 100),
          unit: k.unit || 'count',
          ...(k.linkedProject ? { linkedProject: k.linkedProject } : {}),
        })),
      };
      goals = [...goals, newGoal];
      save(goals); emit();
      return newGoal;
    },
    reset() { goals = JSON.parse(JSON.stringify(SEED)); save(goals); emit(); },
  };
})();

// ── Rich dummy project metadata ───────────────────────────────────────────────
const PROJECT_META = {
  'Payroll Migration EU': {
    desc: 'Migrate 6 anchor EU customers from legacy payroll system to v2 platform with zero P0 incidents.',
    owner: 'Aditi Sharma', team: ['Priya Nair', 'Ops Team'], due: 'Sep 30, 2026', priority: 'high', pct: 90,
    linkedOKRs: ['PO-01 · Aditi Sharma · 6 migrations to v2', 'TG-02 · Ops Team · Payroll quality EU', 'MG-05 · Priya Nair · 99.5% accuracy'],
  },
  'Vendor Setup Automation': {
    desc: 'Automate KYB checks and reduce vendor onboarding from 8 days to 6.4 days through workflow automation.',
    owner: 'Omar Khan', team: ['Priya Nair'], due: 'Oct 15, 2026', priority: 'high', pct: 45,
    linkedOKRs: ['PO-02 · Omar Khan · Reduce setup time 20%', 'MG-03 · Priya Nair · Vendor network OKR'],
  },
  'Client Onboarding Q3': {
    desc: 'Improve client onboarding quality score to 4.6 by reducing time-to-first-payroll to under 14 days.',
    owner: 'Lina Chen', team: ['Aditi Sharma'], due: 'Oct 30, 2026', priority: 'medium', pct: 58,
    linkedOKRs: ['PO-03 · Lina Chen · Onboarding quality 4.6'],
  },
  'Comms Unification': {
    desc: 'Refactor payments service to v2 API and reduce p95 latency by 30% with zero-downtime cutover.',
    owner: 'Diego Alvarez', team: ['Engineering'], due: 'Nov 15, 2026', priority: 'medium', pct: 82,
    linkedOKRs: ['PO-04 · Diego Alvarez · Payments v2 API refactor'],
  },
  'CS Quality Q3': {
    desc: 'Cut support backlog under 50 and move 80% of CS escalations to self-serve playbooks.',
    owner: 'Lina Chen', team: ['Karim Idris'], due: 'Oct 30, 2026', priority: 'medium', pct: 58,
    linkedOKRs: ['MG-02 · Priya Nair · Review feedback quality'],
  },
  'Q3 Review Cycle Ops': {
    desc: 'Drive 90% completion of self + manager reviews in Q3 2026 across all teams.',
    owner: 'Priya Nair', team: ['Karim Idris', 'Lina Chen'], due: 'Oct 15, 2026', priority: 'high', pct: 68,
    linkedOKRs: ['MG-01 · Priya Nair · Q3 review cycle rollout'],
  },
  'Review Quality rollout': {
    desc: 'Bring vague/bias flags in performance reviews below 5 per cycle.',
    owner: 'Priya Nair', team: ['Mel Johansson'], due: 'Sep 30, 2026', priority: 'low', pct: 78,
    linkedOKRs: ['MG-02 · Priya Nair · Review quality'],
  },
  'KYB Automation v2': {
    desc: 'Second phase of KYB automation — expand coverage to 80% of all new vendor applications.',
    owner: 'Omar Khan', team: [], due: 'Dec 15, 2026', priority: 'low', pct: 22,
    linkedOKRs: [],
  },
  'Contractor Onboarding Revamp': {
    desc: 'Redesign contractor onboarding across 60+ countries to reduce compliance risk and speed up activation.',
    owner: 'Hannah Mueller', team: [], due: 'Nov 30, 2026', priority: 'medium', pct: 35,
    linkedOKRs: [],
  },
  'CSAT Recovery Program': {
    desc: 'Targeted outreach and service recovery for accounts with CSAT below 3.5 in Q2.',
    owner: 'Lina Chen', team: ['Karim Idris'], due: 'Sep 30, 2026', priority: 'high', pct: 50,
    linkedOKRs: [],
  },
  'Ops Tooling Modernisation': {
    desc: 'Replace legacy ops dashboards with unified Payo WFM tooling — reduce manual ops steps by 40%.',
    owner: 'Aditi Sharma', team: ['Ops Team'], due: 'Dec 31, 2026', priority: 'low', pct: 15,
    linkedOKRs: [],
  },
  'Q3 Payroll Quality Initiative': {
    desc: 'Drive payroll run accuracy above 99.5% across all EU corridors with P0 rate below 1%.',
    owner: 'Ops Team', team: ['Aditi Sharma', 'Priya Nair'], due: 'Sep 30, 2026', priority: 'high', pct: 91,
    linkedOKRs: ['TG-02 · Ops Team · Payroll quality EU'],
  },
};

// ── ProjectsPage component ────────────────────────────────────────────────────
const { useState: useStateProj, useEffect: useEffectProj } = React;

const PRIORITY_COLOR = { high: 'var(--error-dark)', medium: 'var(--warning-dark)', low: 'var(--fg-secondary)' };
const PRIORITY_BG    = { high: '#fef2f2', medium: '#fffbeb', low: 'var(--grey-50)' };

function getLinkedKRsForProject(projectName) {
  if (!window.WorkerGoalStore) return [];
  const results = [];
  for (const goal of window.WorkerGoalStore.getGoals()) {
    for (const kr of (goal.kr || [])) {
      if (kr.linkedProject === projectName) {
        results.push(`${goal.id} · ${goal.ownerName} · ${kr.t}`);
      }
    }
  }
  return results;
}

function ProjectsPage({ persona = 'client' }) {
  const [, setVersion] = useStateProj(0);
  const [filter, setFilter] = useStateProj('all');
  const [confirmName, setConfirmName] = useStateProj(null);
  const [toast, setToast] = useStateProj(null);
  const [newProjName, setNewProjName] = useStateProj('');
  const [showAdd, setShowAdd] = useStateProj(false);

  useEffectProj(() => {
    const unsubs = [window.ProjectStore.subscribe(() => setVersion(v => v + 1))];
    if (window.WorkerGoalStore) unsubs.push(window.WorkerGoalStore.subscribe(() => setVersion(v => v + 1)));
    return () => unsubs.forEach(fn => fn());
  }, []);

  const projects = window.ProjectStore.getProjects();
  const activeCount    = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const visible = projects.filter(p =>
    filter === 'all' ? true : filter === 'active' ? p.status === 'active' : p.status === 'completed'
  );

  function doMarkComplete(name) {
    window.ProjectStore.markComplete(name);
    setConfirmName(null);
    const linked = getLinkedKRsForProject(name).length;
    setToast({ name, linked });
    setTimeout(() => setToast(null), 5000);
  }

  function doAddProject() {
    if (!newProjName.trim()) return;
    window.ProjectStore.addProject(newProjName.trim());
    setNewProjName('');
    setShowAdd(false);
  }

  const meta = confirmName ? (PROJECT_META[confirmName] || {}) : null;
  const confirmLinkedKRs = confirmName ? getLinkedKRsForProject(confirmName) : [];

  return (
    <Shell persona={persona} active="projects"
      crumb={[persona === 'worker' ? 'Payo WFM' : 'Acme Holdings', 'Projects']}>

      {/* ── Confirm modal ── */}
      {confirmName && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}>
            <div className="row items-center gap-3 mb-4">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="ms" style={{ fontSize: 24 }}>rocket_launch</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--grey-800)' }}>Mark project as complete?</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', marginTop: 2 }}>All linked OKRs will be auto-completed instantly</div>
              </div>
            </div>

            <div style={{ background: 'var(--grey-50)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)', marginBottom: 4 }}>{confirmName}</div>
              {meta.desc && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', marginBottom: 10 }}>{meta.desc}</div>}
              {confirmLinkedKRs.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    {confirmLinkedKRs.length} key result{confirmLinkedKRs.length > 1 ? 's' : ''} will be auto-completed:
                  </div>
                  {confirmLinkedKRs.map((okr, i) => (
                    <div key={i} className="row items-center gap-2" style={{ fontSize: 12.5, color: 'var(--grey-700)', marginBottom: 5 }}>
                      <span className="ms" style={{ fontSize: 15, color: '#16a34a', flexShrink: 0 }}>flag</span>
                      {okr}
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', fontStyle: 'italic' }}>No OKRs linked — only project status will change.</div>
              )}
            </div>

            <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setConfirmName(null)}>Cancel</Btn>
              <Btn variant="primary" icon="check_circle" onClick={() => doMarkComplete(confirmName)}>Mark complete</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 3000,
          background: '#15803d', color: '#fff',
          borderRadius: 12, padding: '14px 20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', gap: 12, maxWidth: 440,
        }}>
          <span className="ms" style={{ fontSize: 22, flexShrink: 0 }}>check_circle</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{toast.name} marked complete</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              {toast.linked > 0
                ? `${toast.linked} linked OKR${toast.linked > 1 ? 's' : ''} auto-completed in client & worker views`
                : 'No linked OKRs — only project status updated'}
            </div>
          </div>
        </div>
      )}

      <PerfTabs active="dashboard" />

      <PageHead
        eyebrow="Projects"
        title="Projects"
        sub="All active projects. Marking a project complete auto-completes every linked OKR in both manager and worker views."
        actions={<>
          <Btn variant="ghost" icon="flag" onClick={() => window.location.hash = persona === 'worker' ? '/worker/goals' : '/client/okrs'}>Goals & OKRs</Btn>
          <Btn variant="primary" icon="add" onClick={() => setShowAdd(s => !s)}>Add project</Btn>
        </>}
      />

      {showAdd && (
        <div className="mb-4">
          <SectionCard title="Add new project" icon="add_circle">
            <div className="row gap-3 items-center">
              <input
                placeholder="Project name"
                value={newProjName}
                onChange={e => setNewProjName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doAddProject(); if (e.key === 'Escape') { setShowAdd(false); setNewProjName(''); } }}
                style={{ flex: 1, border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                autoFocus
              />
              <Btn variant="primary" onClick={doAddProject}>Add</Btn>
              <Btn variant="ghost" onClick={() => { setShowAdd(false); setNewProjName(''); }}>Cancel</Btn>
            </div>
          </SectionCard>
        </div>
      )}

      <Callout tone="info" icon="link" title="Project → OKR auto-completion">
        When you mark a project complete, all OKRs linked to it are instantly marked <strong>Completed (100%)</strong> in both the manager Goals &amp; OKRs view and the worker My Goals view.
      </Callout>

      {/* Filter tabs */}
      <div className="row gap-2 mt-4 mb-4 items-center">
        {[['all', 'All', projects.length], ['active', 'Active', activeCount], ['completed', 'Completed', completedCount]].map(([id, label, count]) => (
          <button key={id} className="filter" onClick={() => setFilter(id)} style={{
            background: filter === id ? 'var(--brand-blue-100)' : '#fff',
            borderColor: filter === id ? 'var(--brand-blue-500)' : 'var(--grey-200)',
            color: filter === id ? 'var(--brand-blue-600)' : 'var(--grey-700)',
            fontWeight: 700,
          }}>
            {label}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="col gap-3">
        {visible.map(p => {
          const m = PROJECT_META[p.name] || {};
          const dynamicLinkedKRs = getLinkedKRsForProject(p.name);
          const isCompleted = p.status === 'completed';
          const completedDate = p.completedAt
            ? new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null;
          const pct = isCompleted ? 100 : (m.pct || 0);
          const priority = m.priority || 'medium';

          return (
            <div key={p.id} className="card" style={{
              padding: 0, overflow: 'hidden',
              border: isCompleted ? '1.5px solid #bbf7d0' : '1px solid rgba(0,0,0,0.08)',
              background: isCompleted ? '#f0fdf4' : '#fff',
            }}>
              {/* Top row */}
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--grey-50)' }}>
                <div className="row items-start between mb-2">
                  <div className="row items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: isCompleted ? '#dcfce7' : 'var(--brand-blue-50)',
                      color: isCompleted ? '#16a34a' : 'var(--brand-blue-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="ms" style={{ fontSize: 20 }}>{isCompleted ? 'check_circle' : 'rocket_launch'}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-800)', marginBottom: 2 }}>{p.name}</div>
                      {m.desc && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', lineHeight: 1.4 }}>{m.desc}</div>}
                    </div>
                  </div>
                  <div className="row items-center gap-2" style={{ flexShrink: 0, marginLeft: 16 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: PRIORITY_BG[priority], color: PRIORITY_COLOR[priority],
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{priority}</div>
                    <Pill variant={isCompleted ? 'completed' : 'active'} dot>{isCompleted ? 'Completed' : 'Active'}</Pill>
                  </div>
                </div>

                {/* Meta row */}
                <div className="row items-center gap-4 mt-2" style={{ flexWrap: 'wrap' }}>
                  {m.owner && (
                    <div className="row items-center gap-2" style={{ fontSize: 12.5 }}>
                      <Avatar name={m.owner} size="xs" />
                      <span style={{ color: 'var(--grey-700)', fontWeight: 600 }}>{m.owner}</span>
                    </div>
                  )}
                  {m.due && (
                    <div className="row items-center gap-1" style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                      <span className="ms" style={{ fontSize: 14 }}>event</span>
                      Due {m.due}
                    </div>
                  )}
                  {completedDate && (
                    <div className="row items-center gap-1" style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                      <span className="ms" style={{ fontSize: 14 }}>verified</span>
                      Completed {completedDate}
                    </div>
                  )}
                  {dynamicLinkedKRs.length > 0 && (
                    <div className="row items-center gap-1" style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                      <span className="ms" style={{ fontSize: 14 }}>flag</span>
                      {dynamicLinkedKRs.length} linked KR{dynamicLinkedKRs.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress + OKRs + action row */}
              <div style={{ padding: '12px 22px', display: 'grid', gridTemplateColumns: '1fr minmax(0,1.5fr) auto', gap: 24, alignItems: 'center' }}>
                {/* Progress */}
                <div>
                  <div className="row items-center between mb-1">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isCompleted ? '#16a34a' : 'var(--grey-700)' }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={isCompleted ? 'green' : pct >= 70 ? 'green' : pct >= 40 ? '' : 'amber'} />
                </div>

                {/* Linked KRs */}
                <div>
                  {dynamicLinkedKRs.length > 0 ? (
                    <div className="col gap-1">
                      {dynamicLinkedKRs.map((kr, i) => (
                        <div key={i} className="row items-center gap-1" style={{ fontSize: 11.5, color: 'var(--grey-700)' }}>
                          <span className="ms" style={{ fontSize: 13, color: isCompleted ? '#16a34a' : 'var(--brand-blue-400)', flexShrink: 0 }}>flag</span>
                          {kr}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--fg-disabled)', fontStyle: 'italic' }}>No KRs linked to this project</span>
                  )}
                </div>

                {/* Action */}
                <div>
                  {isCompleted ? (
                    <Btn variant="ghost" size="sm" icon="restart_alt" onClick={() => window.ProjectStore.reopen(p.name)}>Reopen</Btn>
                  ) : (
                    <Btn variant="primary" size="sm" icon="check_circle" onClick={() => setConfirmName(p.name)}>Mark complete</Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--fg-secondary)', fontSize: 14 }}>
            No projects in this filter.
          </div>
        )}
      </div>
    </Shell>
  );
}

window.ProjectsPage = ProjectsPage;


/* ============================================================================
   FILE: frames/worker-dashboard.jsx
   ============================================================================ */

/* Frame · Worker Performance Dashboard (simplified)
   Persona: Aditi Sharma (worker). Self-service view only.
   Strips back to the essentials: 4 KPIs, self-review prompt, today's 1:1,
   feedback received, and the "what I can't see" transparency strip. */

function WorkerDashboard() {
  const kpis = [
    { tone: 'green',  icon: 'flag',           label: 'My active goals',     value: '4',  trend: { dir: 'up', text: '+1' }, sub: '2 owner · 1 contributor · 1 stakeholder' },
    { tone: 'blue',   icon: 'event_available',label: 'Upcoming 1:1s',       value: '3',  sub: 'Next: today at 10:00 with Priya' },
    { tone: 'pink',   icon: 'inbox',          label: 'Feedback received',   value: '12', trend: { dir: 'up', text: '+5' }, sub: 'Last 30 days · 9 positive · 3 dev' },
    { tone: 'amber',  icon: 'rate_review',    label: 'Pending self-review', value: '1',  sub: 'Q3 cycle · due Sep 30' },
  ];

  const feedback = [
    { from: 'Priya Nair', role: 'Manager', when: '2h ago', type: 'project',
      text: "Aditi led the Spain cutover flawlessly — zero P0s, customer signed a 3-year renewal the same week. She's ready to take on the next anchor migration as lead." },
    { from: 'Karim Idris', role: 'Peer', when: 'Yesterday', type: 'recognition',
      text: 'Thanks for jumping into the KYB blocker on Friday — you saved Omar a week of waiting. ⭐' },
    { from: 'Marco Diaz', role: 'Client', when: '1w ago', type: 'project',
      text: "Aditi's communication during cutover was the difference between a hard week and a smooth one." },
  ];

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My dashboard']}>

      <PerfTabs variant="worker" active="dashboard" />

      <PageHead
        eyebrow="My performance"
        title="Hi Aditi 👋"
        sub="Your goals, feedback, 1:1s and reviews at a glance. Your self-review for Q3 is due Sep 30."
        actions={<>
          <Btn variant="ghost" icon="add_reaction">Request feedback</Btn>
        </>}
      />

{/* 4 KPIs */}
      <div className="stats-row c-4 mb-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* Self-review prompt + Today's 1:1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #FFFAEB 0%, #FFFFFF 60%)', border: '1px solid #FFE3A5' }}>
          <div style={{ padding: '20px 24px' }}>
            <div className="row items-center gap-3 mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warning-bg)', color: 'var(--warning-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="ms" style={{ fontSize: 22 }}>rate_review</span>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Action needed</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>Your Q3 self-review is due in 4 days</div>
              </div>
              <Pill variant="warning" dot>Due Sep 30</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: 14 }}>
              Reflect on your goals, projects shipped, and growth areas. Your draft auto-saves and you can attach feedback from peers and managers.
            </div>
            <div className="row gap-2">
              <Btn variant="primary" icon="play_arrow" onClick={() => {
                const Store = window.PerformanceStore;
                const workerId = Store.getCurrentWorkerId();
                const participants = Store.getData().reviewParticipants || [];
                const pending = participants.find(p =>
                  p.workerId === workerId && p.selfReviewStatus !== 'submitted'
                );
                if (pending) {
                  try { window.sessionStorage.setItem('payo.workerReviews.openSelf', pending.id); } catch (e) {}
                }
                window.location.hash = '/worker/reviews';
              }}>Continue self-review</Btn>
              <Btn variant="ghost" icon="schedule">Remind me tomorrow</Btn>
            </div>
          </div>
        </div>

        <SectionCard
          title="My next 1:1"
          sub="Today · 10:00 AM"
          icon="event"
          action={<Btn variant="primary" size="sm" icon="edit_note" onClick={() => window.location.hash = '#/worker/meetings'}>Take notes</Btn>}
        >
          <div className="row items-center gap-3 mb-3">
            <Avatar name="Priya Nair" size="lg" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)' }}>Priya Nair</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>Manager · weekly 1:1</div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Shared agenda</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.6 }}>
            <li>Wrap-up of Payroll Migration EU and what went well</li>
            <li>Q4 priorities — which migrations to take on next</li>
            <li>Career growth — Lead Ops path</li>
          </ol>
          <Btn variant="text" size="sm" icon="add" style={{ marginTop: 8 }}>Add an agenda item</Btn>
        </SectionCard>
      </div>

    </Shell>
  );
}

window.WorkerDashboard = WorkerDashboard;


/* ============================================================================
   FILE: frames/client-dashboard.jsx
   ============================================================================ */

/* Frame 1 — Client / Manager Performance Dashboard
   Persona: HR admin / people manager at the client (Acme Holdings)
   KPI cards, Goal Progress, Review Cycle Status, Project Performance
   Signals, Recent Feedback. */

function ClientDashboard() {
  const [, setVersion] = React.useState(0);
  React.useEffect(() => {
    const unsubs = [];
    if (window.ProjectStore) unsubs.push(window.ProjectStore.subscribe(() => setVersion(v => v + 1)));
    if (window.WorkerGoalStore) unsubs.push(window.WorkerGoalStore.subscribe(() => setVersion(v => v + 1)));
    return () => unsubs.forEach(fn => fn());
  }, []);

  // Live data from stores
  const allGoals   = window.WorkerGoalStore ? window.WorkerGoalStore.getGoals()     : [];
  const projects   = window.ProjectStore    ? window.ProjectStore.getProjects()      : [];

  function resolvedStatus(g) {
    if (window.ProjectStore && Array.isArray(g.kr)) {
      if (g.kr.some(k => k.linkedProject && window.ProjectStore.isCompleted(k.linkedProject))) return 'completed';
    }
    return g.status;
  }

  const activeGoals    = allGoals.filter(g => resolvedStatus(g) !== 'completed');
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const doneProjects   = projects.filter(p => p.status === 'completed').length;
  // Manager's own 5 goals + 3 company goals are not in WorkerGoalStore, add them
  const totalActiveOKRs = activeGoals.length + 5 + 3;

  const kpis = [
    { tone: 'blue',   icon: 'flag',            label: 'Active OKRs',     value: String(totalActiveOKRs),
      sub: `3 company · 5 manager · ${activeGoals.length} individual` },
    { tone: 'purple', icon: 'rocket_launch',   label: 'Linked projects', value: String(projects.length),
      sub: `${activeProjects} active · ${doneProjects} done` },
    { tone: 'teal',   icon: 'event_available', label: '1:1s this month', value: '64',
      sub: '8 today · 12 this week' },
  ];

  // Goal progress table: live from WorkerGoalStore (People OKRs = direct reports)
  const peopleOKRs = window.WorkerGoalStore ? window.WorkerGoalStore.getPeopleOKRs() : [];
  const goals = peopleOKRs
    .map(g => ({
      name:    g.title,
      owner:   g.ownerName,
      project: g.kr?.find(k => k.linkedProject)?.linkedProject || '—',
      pct:     resolvedStatus(g) === 'completed' ? 100 : g.pct,
      status:  resolvedStatus(g),
      due:     g.due,
    }))
    .sort((a, b) => new Date(a.due) - new Date(b.due));

  const cycles = [
    { name: 'Q3 Performance Review',     type: 'Quarterly', participants: 120, pct: 68, pending: 'Managers',  due: 'Oct 15, 2026', status: 'active'   },
    { name: 'Payroll Migration Review',  type: 'Project',   participants: 8,   pct: 40, pending: 'Workers',   due: 'May 25, 2026', status: 'overdue'  },
    { name: 'Annual Review 2026',        type: 'Annual',    participants: 250, pct: 0,  pending: 'HR Admin',  due: 'Dec 15, 2026', status: 'draft'    },
    { name: 'Engineering 360°',          type: '360° Feedback', participants: 38, pct: 31, pending: 'Peers', due: 'Apr 07, 2026', status: 'active' },
  ].sort((a, b) => new Date(a.due) - new Date(b.due));


  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Dashboard']}>

      <PerfTabs active="dashboard" />

      <PageHead
        eyebrow="Performance Management"
        title="Performance overview"
        sub="Track goals, project outcomes, reviews, feedback, and compensation signals — all in one place."
        actions={<>
          <Btn variant="outlined" icon="play_circle" onClick={() => window.location.hash = '/client/reviews'}>Start review cycle</Btn>
        </>}
      />

      {/* KPI cards */}
      <div className="stats-row c-3 mb-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <SectionCard
          title="Goal progress overview"
          sub="Active OKRs across the company · top movers this week"
          icon="flag"
          action={<div className="row gap-2">
            <Btn variant="text" size="sm" iconTrailing="arrow_forward" onClick={() => window.location.hash = '/client/okrs'}>All goals</Btn>
          </div>}
          padBody={false}
        >
          <table className="tbl">
            <thead><tr>
              <th>Goal / OKR</th>
              <th>Owner</th>
              <th>Linked Project</th>
              <th style={{ width: 180 }}>Progress</th>
              <th>Status</th>
              <th>Due</th>
            </tr></thead>
            <tbody>
              {goals.map((g, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--grey-700)', fontSize: 13 }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2 }}>Individual OKR</div>
                  </td>
                  <td>{g.owner.includes('Team') || g.owner === 'Engineering' ? (
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.owner}</span>
                  ) : (
                    <div className="worker-cell">
                      <Avatar name={g.owner} size="sm" />
                      <span className="name">{g.owner}</span>
                    </div>
                  )}</td>
                  <td>
                    <span className="link-cell"><span className="ms">link</span>{g.project}</span>
                  </td>
                  <td><ProgressBar pct={g.pct} color={g.status === 'at-risk' ? 'amber' : 'green'} /></td>
                  <td>
                    {g.status === 'on-track'  && <Pill variant="on-track"  dot>On track</Pill>}
                    {g.status === 'at-risk'   && <Pill variant="at-risk"   dot>At risk</Pill>}
                    {g.status === 'completed' && <Pill variant="completed" dot>Completed</Pill>}
                  </td>
                  <td><span style={{ fontSize: 12, fontWeight: 600 }}>{g.due}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

      </div>

      {/* Row: Review Cycle Status (full width) */}
      <div className="mb-4">
        <SectionCard
          title="Review cycle status"
          sub="Cycles currently in flight"
          icon="reviews"
          action={<div className="row gap-2">
            <Btn variant="ghost" size="sm" icon="download">Export CSV</Btn>
            <Btn variant="text" size="sm" iconTrailing="arrow_forward" onClick={() => window.location.hash = '/client/all-cycles'}>All cycles</Btn>
          </div>}
          padBody={false}
        >
          <table className="tbl">
            <thead><tr>
              <th>Review Cycle</th>
              <th>Type</th>
              <th className="num">Participants</th>
              <th style={{ width: 220 }}>Completion</th>
              <th>Pending With</th>
              <th>Due Date</th>
              <th>Status</th>
              <th />
            </tr></thead>
            <tbody>
              {cycles.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--grey-700)', fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2 }}>Cycle #PW-{2024 + i}</div>
                  </td>
                  <td><Pill variant={c.type.includes('360') ? 'contractor' : 'employee'} icon={c.type.includes('360') ? 'hub' : 'event_note'}>{c.type}</Pill></td>
                  <td className="num">{c.participants}</td>
                  <td>{c.status === 'draft'
                    ? <span style={{ fontSize: 12, color: 'var(--fg-disabled)', fontStyle: 'italic' }}>Not started</span>
                    : <div className="col" style={{ gap: 4 }}>
                        <ProgressBar pct={c.pct} color={c.status === 'overdue' ? 'amber' : ''} />
                        <span style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>{Math.round(c.participants * c.pct / 100)} of {c.participants} complete</span>
                      </div>}
                  </td>
                  <td><span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.pending}</span></td>
                  <td><span style={{ fontSize: 12, fontWeight: 600, color: c.status === 'overdue' ? 'var(--error-dark)' : 'var(--grey-700)' }}>{c.due}</span></td>
                  <td>
                    {c.status === 'active'  && <Pill variant="active"  dot>Active</Pill>}
                    {c.status === 'overdue' && <Pill variant="overdue" dot>Overdue</Pill>}
                    {c.status === 'draft'   && <Pill variant="draft">Draft</Pill>}
                  </td>
                  <td className="actions-cell"><Btn variant="ghost" size="sm">{c.status === 'draft' ? 'Configure' : 'View'}</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

    </Shell>
  );
}

window.ClientDashboard = ClientDashboard;

/* ── All Review Cycles (manager view) ─────────────────────────────────────── */
function ClientAllCycles() {
  const Store = window.PerformanceStore;
  const [, setVersion] = React.useState(0);
  React.useEffect(() => Store.subscribe(() => setVersion(v => v + 1)), []);
  React.useEffect(() => { Store.refreshAll && Store.refreshAll(); }, []);

  const cycles = [...Store.getReviewCycles()].sort(
    (a, b) => String(b.periodEnd || b.createdAt || '').localeCompare(String(a.periodEnd || a.createdAt || ''))
  );

  function cycleStats(cycleId) {
    const parts = Store.getReviewParticipants(cycleId);
    const total = parts.length;
    const done = parts.filter(p =>
      p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared'
    ).length;
    const selfDone = parts.filter(p => p.selfReviewStatus === 'submitted').length;
    const pendingManager = parts.filter(p =>
      p.managerReviewStatus === 'not-started' || p.managerReviewStatus === 'not_started' || p.managerReviewStatus === 'draft'
    ).length;
    return { total, done, selfDone, pendingManager, pct: total ? Math.round(done / total * 100) : 0 };
  }

  const statusVariant = s => s === 'active' ? 'active' : s === 'closed' ? 'completed' : s === 'draft' ? 'draft' : 'warning';

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Reviews', 'All cycles']}>
      <PerfTabs active="reviews" />

      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={() => window.location.hash = '/client/dashboard'}>Back to dashboard</Btn>
        <Btn variant="primary" icon="play_circle" onClick={() => window.location.hash = '/client/reviews'}>Start review cycle</Btn>
      </div>

      <PageHead
        eyebrow="Performance Management · Reviews"
        title={`All review cycles · ${cycles.length}`}
        sub="Every review cycle in your organisation, newest first."
      />

      <SectionCard title="Review cycles" sub={`${cycles.length} total`} icon="event_repeat" padBody={false}>
        {cycles.length === 0 && (
          <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
            No review cycles yet.{' '}
            <a href="#/client/reviews" style={{ color: 'var(--primary)' }}>Start one →</a>
          </div>
        )}
        {cycles.map(c => {
          const { total, done, selfDone, pendingManager, pct } = cycleStats(c.id);
          const isOverdue = c.managerReviewDueDate && new Date(c.managerReviewDueDate) < new Date() && c.status === 'active';
          return (
            <div key={c.id} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,2fr) 110px 180px 180px 180px auto',
              gap: 16, alignItems: 'center',
              padding: '14px 22px',
              borderTop: '1px solid var(--grey-50)',
            }}>
              {/* Name + period */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                  {c.periodStart} → {c.periodEnd}
                  {c.purpose && <span style={{ marginLeft: 8, color: 'var(--fg-disabled)' }}>· {c.purpose}</span>}
                </div>
              </div>

              {/* Status */}
              <Pill variant={statusVariant(c.status)} dot>{c.status}</Pill>

              {/* Participants + completion */}
              <div className="col gap-1">
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Manager reviews
                </span>
                {c.status === 'draft'
                  ? <span style={{ fontSize: 12, color: 'var(--fg-disabled)', fontStyle: 'italic' }}>Not started</span>
                  : total > 0
                    ? <>
                        <ProgressBar pct={pct} color={isOverdue ? 'amber' : 'green'} />
                        <span style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>{done}/{total} complete</span>
                      </>
                    : <span style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>No participants</span>}
              </div>

              {/* Self-reviews */}
              <div className="col gap-1">
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Self-reviews
                </span>
                {total > 0
                  ? <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--grey-700)' }}>{selfDone}/{total} submitted</span>
                  : <span style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>—</span>}
              </div>

              {/* Due dates */}
              <div className="col gap-1">
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Manager due
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: isOverdue ? 'var(--error-dark)' : 'var(--grey-700)' }}>
                  {c.managerReviewDueDate || '—'}
                  {isOverdue && <Pill variant="overdue" size="sm" style={{ marginLeft: 6 }}>Overdue</Pill>}
                </span>
              </div>

              {/* Action */}
              <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" icon={c.status === 'draft' ? 'settings' : 'open_in_new'}
                  onClick={() => {
                    try { window.sessionStorage.setItem('payo.reviews.openCycleId', c.id); } catch (e) {}
                    window.location.hash = '/client/reviews';
                  }}>
                  {c.status === 'draft' ? 'Configure' : 'Open'}
                </Btn>
              </div>
            </div>
          );
        })}
      </SectionCard>
    </Shell>
  );
}

window.ClientAllCycles = ClientAllCycles;


/* ============================================================================
   FILE: frames/worker-goals.jsx
   ============================================================================ */

/* Frame · Worker My Goals */

const { useState: useStateWG, useEffect: useEffectWG } = React;

/* ── Update Progress Modal ── */
function UpdateProgressModal({ goal, onCancel, onSave }) {
  const initKrState = () => goal.kr.map(k => {
    const cur = parseFloat(k.current) || 0;
    const tgt = parseFloat(k.target) || 1;
    return {
      newTotal: cur,
      change: 0,
      krStatus: 'no-status',
      state: k.unit === 'incomplete' ? 'incomplete' : null,
      preview: k.unit === 'incomplete' ? 0 : Math.round((cur / (tgt || 1)) * 100),
      linkedProject: k.linkedProject || '',
    };
  });

  const [krState, setKrState] = useStateWG(initKrState);

  function updateKr(i, patch) {
    setKrState(prev => {
      const next = prev.map((s, j) => j === i ? { ...s, ...patch } : s);
      const s = next[i];
      const tgt = parseFloat(goal.kr[i].target) || 1;
      if (patch.newTotal !== undefined) {
        const cur = parseFloat(goal.kr[i].current) || 0;
        next[i] = { ...next[i], change: +(s.newTotal - cur).toFixed(2), preview: Math.min(100, Math.max(0, Math.round((s.newTotal / tgt) * 100))) };
      }
      if (patch.change !== undefined) {
        const cur = parseFloat(goal.kr[i].current) || 0;
        const nt = cur + (parseFloat(patch.change) || 0);
        next[i] = { ...next[i], newTotal: +nt.toFixed(2), preview: Math.min(100, Math.max(0, Math.round((nt / tgt) * 100))) };
      }
      if (patch.state !== undefined) {
        next[i] = { ...next[i], preview: patch.state === 'completed' ? 100 : 0 };
      }
      return next;
    });
  }

  function handleSave() {
    const updatedKr = goal.kr.map((k, i) => {
      const s = krState[i];
      const base = s.linkedProject ? { ...k, linkedProject: s.linkedProject } : { ...k };
      if (k.unit === 'incomplete') {
        return { ...base, current: s.state === 'completed' ? k.target : '0', pct: s.state === 'completed' ? 100 : 0 };
      }
      return { ...base, current: String(s.newTotal), pct: s.preview };
    });
    const avgPct = Math.round(updatedKr.reduce((sum, k) => sum + k.pct, 0) / (updatedKr.length || 1));
    onSave({ kr: updatedKr, pct: avgPct });
  }

  const STATUS_OPTS = [
    { value: 'no-status',  label: 'No Status' },
    { value: 'on-track',   label: 'On Track' },
    { value: 'at-risk',    label: 'At Risk' },
    { value: 'behind',     label: 'Behind' },
    { value: 'completed',  label: 'Completed' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 720,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>
        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '28px 28px 0' }}>

          {/* KR sections */}
          {goal.kr.map((k, i) => {
            const s = krState[i];
            const isIncomplete = k.unit === 'incomplete';
            const tgt = parseFloat(k.target) || 1;
            const cur = parseFloat(k.current) || 0;
            const unitLabel = k.unit === '%' ? '%' : k.unit === 'days' ? ' days' : k.unit === 'rating' ? '' : '';

            return (
              <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--grey-100)' }}>
                {/* KR title */}
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-900)', marginBottom: 14 }}>
                  {k.t}
                </div>

                {isIncomplete ? (
                  /* Boolean / incomplete KR */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>State</div>
                      <div style={{ display: 'flex', border: '1.5px solid var(--grey-200)', borderRadius: 8, overflow: 'hidden' }}>
                        <button
                          onClick={() => updateKr(i, { state: 'incomplete' })}
                          style={{
                            flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: s.state !== 'completed' ? 'var(--grey-200)' : '#fff',
                            color: s.state !== 'completed' ? 'var(--grey-700)' : 'var(--fg-secondary)',
                          }}>Incomplete</button>
                        <button
                          onClick={() => updateKr(i, { state: 'completed' })}
                          style={{
                            flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: s.state === 'completed' ? 'var(--success-main)' : '#fff',
                            color: s.state === 'completed' ? '#fff' : 'var(--fg-secondary)',
                          }}>Completed</button>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-disabled)', marginTop: 6 }}>
                        ( Start: 0 | Target: 1 )
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Status</div>
                      <select value={s.krStatus} onChange={e => updateKr(i, { krStatus: e.target.value })}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                        {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Preview</div>
                      <div style={{ background: 'var(--grey-100)', borderRadius: 8, padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--grey-200)', borderRadius: 4, overflow: 'hidden', marginRight: 10 }}>
                          <div style={{ height: '100%', width: `${s.preview}%`, background: s.preview >= 70 ? 'var(--success-main)' : 'var(--brand-blue-500)', borderRadius: 4, transition: 'width 0.2s' }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-secondary)', minWidth: 32, textAlign: 'right' }}>{s.preview}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                  {/* Numeric KR */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto 1fr', gap: 12, alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>New Total</div>
                      <input
                        type="number"
                        value={s.newTotal}
                        onChange={e => updateKr(i, { newTotal: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                      <div style={{ fontSize: 11.5, color: 'var(--fg-disabled)', marginTop: 5 }}>
                        ( Start: {cur}{unitLabel} | Target: {k.target}{unitLabel} )
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Change (-/+)</div>
                      <input
                        type="number"
                        value={s.change}
                        onChange={e => updateKr(i, { change: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Status</div>
                      <select value={s.krStatus} onChange={e => updateKr(i, { krStatus: e.target.value })}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                        {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Preview</div>
                      <div style={{ background: 'var(--grey-100)', borderRadius: 8, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--grey-200)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.preview}%`, background: s.preview >= 70 ? 'var(--success-main)' : 'var(--brand-blue-500)', borderRadius: 4, transition: 'width 0.2s' }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-secondary)', minWidth: 32, textAlign: 'right' }}>{s.preview}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Linked Project */}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>link</span>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', minWidth: 90 }}>Linked Project</div>
                    <select
                      value={s.linkedProject}
                      onChange={e => updateKr(i, { linkedProject: e.target.value })}
                      style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', background: '#fff', flex: 1 }}>
                      <option value="">No linked project</option>
                      {(window.ProjectStore ? window.ProjectStore.getProjects().map(p => p.name) : []).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  </>
                )}
              </div>
            );
          })}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--grey-100)',
          display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
          background: '#fff',
        }}>
          <button onClick={onCancel}
            style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, background: '#fff', padding: '9px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--grey-700)', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{ border: 'none', borderRadius: 8, background: 'var(--brand-blue-500)', padding: '9px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main WorkerGoals component ── */
function WorkerGoals() {
  const [stepper, setStepper] = useStateWG(null);
  const [detailGoal, setDetailGoal] = useStateWG(null);
  const [stepperFromDetail, setStepperFromDetail] = useStateWG(false);
  const [updateModal, setUpdateModal] = useStateWG(null); // { goalId }

  const [, setGoalVersion] = useStateWG(0);
  useEffectWG(() => {
    const unsubs = [];
    if (window.ProjectStore) unsubs.push(window.ProjectStore.subscribe(() => setGoalVersion(v => v + 1)));
    if (window.WorkerGoalStore) unsubs.push(window.WorkerGoalStore.subscribe(() => setGoalVersion(v => v + 1)));
    return () => unsubs.forEach(fn => fn());
  }, []);

  const goals = window.WorkerGoalStore ? window.WorkerGoalStore.getAditiGoals() : [];

  const activeUpdateGoal = updateModal ? goals.find(g => g.id === updateModal.goalId) : null;

  function handleProgressSave({ kr, pct }) {
    const status = pct >= 70 ? 'on-track' : 'at-risk';
    if (window.WorkerGoalStore) window.WorkerGoalStore.updateGoal(updateModal.goalId, { kr, pct, status });
    setUpdateModal(null);
  }

  function openStepperFromDetail(goal) {
    const initial = {
      name: goal.title,
      isPerf: true,
      privacy: 'restricted',
      krs: (goal.krs || []).map(k => ({
        name: k.text,
        start: parseFloat(k.current) || 0,
        target: parseFloat(k.target) || 100,
        unit: k.unit === 'count' ? 'count' : k.unit === 'rating' ? '%' : k.unit || '%',
      })),
      owner: goal.owner ? goal.owner.name : 'Aditi Sharma',
      contributors: (goal.contributors || []).map(c => c.name),
    };
    setStepperFromDetail(true);
    setStepper({ kind: 'goal', mode: 'edit', initial });
  }

  function resolveGoal(g) {
    if (!window.ProjectStore || !Array.isArray(g.kr) || g.kr.length === 0) return g;
    let changed = false;
    const resolvedKRs = g.kr.map(k => {
      if (k.linkedProject && window.ProjectStore.isCompleted(k.linkedProject)) {
        changed = true;
        return { ...k, pct: 100 };
      }
      return k;
    });
    if (!changed) return g;
    const avgPct = Math.round(resolvedKRs.reduce((sum, k) => sum + k.pct, 0) / resolvedKRs.length);
    const triggeredProject = resolvedKRs.find(k => k.linkedProject && window.ProjectStore.isCompleted(k.linkedProject))?.linkedProject;
    return { ...g, kr: resolvedKRs, pct: avgPct, status: avgPct >= 100 ? 'completed' : avgPct >= 70 ? 'on-track' : 'at-risk', _completedViaProject: triggeredProject };
  }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My Goals']}>

      {/* Update Progress Modal */}
      {activeUpdateGoal && (
        <UpdateProgressModal
          goal={activeUpdateGoal}
          onCancel={() => setUpdateModal(null)}
          onSave={handleProgressSave}
        />
      )}

      {stepper ? (
        <GoalStepper kind={stepper.kind} mode={stepper.mode} role="worker" initial={stepper.initial}
          onCancel={() => { setStepper(null); if (stepperFromDetail) setStepperFromDetail(false); }}
          onCreate={(payload) => {
            if (stepper.mode !== 'edit' && window.WorkerGoalStore && payload) {
              window.WorkerGoalStore.addGoal(payload);
            }
            setStepper(null); setStepperFromDetail(false); setDetailGoal(null);
          }} />
      ) : detailGoal ? (
        <GoalDetail goal={detailGoal} role="worker"
          onBack={() => setDetailGoal(null)}
          onUpdateGoal={() => openStepperFromDetail(detailGoal)} />
      ) : (<>

      <PerfTabs variant="worker" active="my-goals" />

      <PageHead
        eyebrow="My performance"
        title="My Goals"
        sub="Goals you own, contribute to, or are a stakeholder on. Update progress, add key results, and request feedback any time."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="primary" icon="add" onClick={() => setStepper({ kind: 'goal', mode: 'create' })}>Create Goal</Btn>
        </>}
      />

      <div className="stats-row c-4 mb-4">
        <StatCard tone="green"   icon="flag"          label="Active goals"     value="4"    sub="2 owner · 1 contrib · 1 stake" />
        <StatCard tone="blue"    icon="trending_up"   label="Average progress" value="80%"  trend={{ dir: 'up', text: '+12%' }} sub="Last 30 days" />
        <StatCard tone="purple"  icon="check_circle"  label="Key results done" value="7/10" sub="across all my goals" />
        <StatCard tone="amber"   icon="schedule"      label="Need attention"   value="1"    sub="No project link · KR drifting" />
      </div>

      <div className="row gap-2 mb-4 items-center" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>View:</span>
        <button className="filter" style={{ background: '#fff', borderColor: 'var(--brand-blue-300)', color: 'var(--brand-blue-600)' }}>All my goals</button>
        <button className="filter">Owned by me</button>
        <button className="filter">Contributing</button>
        <button className="filter">Stakeholder</button>
        <span className="sep" style={{ background: 'var(--grey-200)', width: 1, height: 18 }} />
        <button className="filter">Q3 2026</button>
      </div>

      <div className="col gap-3">
        {goals.map(raw => { const o = resolveGoal(raw); return (
          <div className="okr-card" key={o.id}>
            <div className="o-head">
              <div className="o-title-block">
                <div className="o-eyebrow row items-center gap-2">
                  <Pill variant={o.role === 'owner' ? 'owner' : o.role === 'contrib' ? 'contrib' : 'stakeholder'}>
                    {o.role === 'owner' ? 'Owner' : o.role === 'contrib' ? 'Contributor' : 'Stakeholder'}
                  </Pill>
                  <span style={{ color: 'var(--fg-disabled)' }}>·</span>
                  <span>{o.id}</span>
                  {o.role !== 'owner' && <><span style={{ color: 'var(--fg-disabled)' }}>·</span><span>{o.role === 'contrib' ? `Owned by ${o.ownerName}` : o.ownerName}</span></>}
                </div>
                <div className="o-title" style={{ fontSize: 15 }}>{o.title}</div>
                <div className="o-meta">
                  <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                  <span className="item"><span className="ms">flag</span><span className="v">{o.kr.length}</span> key results</span>
                  {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                  {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                  {o.status === 'completed' && <Pill variant="completed" dot>Completed</Pill>}
                </div>
              </div>
              <div className="o-actions">
                <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setDetailGoal({
                  title: o.title,
                  description: 'Tracked under ' + (o.kr?.find(k => k.linkedProject)?.linkedProject || 'no linked project') + '. ' + (o.role === 'owner' ? 'You own this goal.' : o.role === 'contrib' ? 'You contribute to this goal.' : 'You are a stakeholder.'),
                  type: 'Performance', typeIcon: 'workspace_premium',
                  privacy: 'Restricted',
                  when: '7/1/2026 — ' + o.due,
                  daysLeft: 188,
                  perfGoal: true,
                  aligned: o.kr?.find(k => k.linkedProject)?.linkedProject || null,
                  progress: o.pct,
                  owner: { name: o.ownerName, role: o.workerRole },
                  contributors: o.role === 'owner' ? [{ name: 'Lina Chen', role: 'Onboarding Mgr' }] : [{ name: 'Aditi Sharma', role: 'Senior Ops' }],
                  krs: o.kr.map((k, i) => ({ id: i+1, owner: o.ownerName, text: k.t, pct: k.pct,
                    current: k.current, target: k.target, unit: k.unit })),
                  attachments: 0,
                })}>View</Btn>
                {o.role === 'owner' && (
                  <Btn variant="outlined" size="sm" icon="trending_up"
                    onClick={() => setUpdateModal({ goalId: o.id })}>
                    Update progress
                  </Btn>
                )}
              </div>
            </div>
            {o.kr.length > 0 && (
              <div className="kr-list">
                {o.kr.map((k, i) => (
                  <div className="kr" key={i}>
                    <div className="num">KR{i+1}</div>
                    <div className="text">{k.t}{k.linkedProject && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: 'var(--brand-blue-600)', background: 'var(--brand-blue-50)', borderRadius: 4, padding: '1px 5px' }}>{k.linkedProject}</span>}</div>
                    <div className="target">{k.current}{k.unit === '%' ? '%' : ''} / {k.target}{k.unit === '%' ? '%' : ''}</div>
                    <ProgressBar pct={k.pct} color={k.pct >= 70 ? 'green' : k.pct >= 40 ? '' : 'amber'} />
                    <span />
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)',
              display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                {o.role === 'owner'
                  ? <>You drive this goal.</>
                  : o.role === 'contrib'
                    ? <>Contributing toward this goal — owned by <strong style={{ color: 'var(--grey-700)' }}>{o.ownerName}</strong>.</>
                    : <>Stakeholder · you receive updates but don't own progress.</>}
              </div>
              <ProgressBar pct={o.pct} big color={o.status === 'at-risk' ? 'amber' : 'green'} />
            </div>
          </div>
        ); })}
      </div>
      </>)}
    </Shell>
  );
}

window.WorkerGoals = WorkerGoals;
window.UpdateProgressModal = UpdateProgressModal;


/* ============================================================================
   FILE: frames/client-okrs.jsx
   ============================================================================ */

/* Frame 2 — OKR Management screen (Client / Manager)
   Three tabs: Company Goals (read-only), My Goals (editable), People OKRs (manage).
   Shows role badges, key results, linked projects, "Link Project" action. */

const { useState: useStateOKR, useRef: useRefOKR, useEffect: useEffectOKR } = React;

function ClientOKRs() {
  const [tab, setTab] = useStateOKR('company');
  const [createOpen, setCreateOpen] = useStateOKR(false);
  const [stepper, setStepper] = useStateOKR(null); // null | 'goal' | 'okr'
  const [peopleFilterCG, setPeopleFilterCG] = useStateOKR(null); // {id, title} of a company goal
  const [detailGoal, setDetailGoal] = useStateOKR(null); // when set, show GoalDetail page
  const createBtnRef = useRefOKR(null);
  const [, setOkrVersion] = useStateOKR(0);
  useEffectOKR(() => {
    const unsubs = [];
    if (window.ProjectStore) unsubs.push(window.ProjectStore.subscribe(() => setOkrVersion(v => v + 1)));
    if (window.WorkerGoalStore) unsubs.push(window.WorkerGoalStore.subscribe(() => setOkrVersion(v => v + 1)));
    return () => unsubs.forEach(fn => fn());
  }, []);

  // Close create dropdown on outside click
  useEffectOKR(() => {
    if (!createOpen) return;
    const handler = (e) => {
      if (createBtnRef.current && !createBtnRef.current.contains(e.target)) setCreateOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [createOpen]);

  // Helper: jump to people tab filtered by company goal
  const viewOKRsForCG = (cg) => {
    setPeopleFilterCG({ id: cg.id, title: cg.title });
    setTab('people');
    setCreateOpen(false);
  };

  /* ---------------- Company Goals (read-only) ---------------- */
  const companyOKRs = [
    {
      id: 'CG-01',
      title: 'Make Acme the #1 payroll platform for remote teams',
      desc: 'Become the de-facto operating system for distributed payroll in 2026 — measured by NPS, market share and platform stickiness.',
      owner: 'Erika Voss', ownerRole: 'CEO',
      pct: 64, status: 'on-track', due: 'Dec 31, 2026', period: 'FY 2026',
      kr: [
        { t: 'Reach 12,000 active employer accounts', pct: 71, target: '8.5k / 12k' },
        { t: 'Lift platform NPS from 38 to 55',       pct: 58, target: '48 / 55' },
        { t: 'Reduce annual churn below 9%',          pct: 62, target: '10.4% / 9%' },
      ],
    },
    {
      id: 'CG-02',
      title: 'Ship the unified Payroll + Performance + Payments suite',
      desc: 'Deliver the integrated platform to GA so customers see one product, not three.',
      owner: 'David Park', ownerRole: 'CPO',
      pct: 48, status: 'at-risk', due: 'Oct 31, 2026', period: 'Q3–Q4 2026',
      kr: [
        { t: 'Performance module GA in 6 markets', pct: 33, target: '2 / 6' },
        { t: 'Single sign-on across all modules',  pct: 80, target: 'In rollout' },
        { t: 'Migrate 100% of legacy clients',     pct: 28, target: '28% / 100%' },
      ],
    },
    {
      id: 'CG-03',
      title: 'Build a global, compliant contractor experience',
      desc: 'Reduce compliance risk and speed up contractor onboarding across 60+ countries.',
      owner: 'Hannah Mueller', ownerRole: 'Head of Compliance',
      pct: 85, status: 'on-track', due: 'Sep 30, 2026', period: 'Q3 2026',
      kr: [
        { t: 'Misclassification risk score below 1.5', pct: 92, target: '1.3 / 1.5' },
        { t: 'Contractor onboarding under 24h',        pct: 84, target: '26h / 24h' },
        { t: 'Compliance false-positives below 8%',       pct: 80, target: '9.2% / 8%' },
      ],
    },
  ];

  /* ---------------- My Goals (editable, manager-owned) ---------------- */
  const [myOKRs, setMyOKRs] = useStateOKR([
    {
      id: 'MG-01',
      role: 'owner',
      title: 'Roll out the Q3 performance review cycle across all teams',
      desc: 'Drive 90% completion of self + manager reviews in Q3 2026.',
      pct: 68, status: 'on-track', due: 'Oct 15, 2026', period: 'Q3 2026',
      linkedProject: 'Q3 Review Cycle Ops', kr: 3, krDone: 2,
      contribs: ['Karim Idris', 'Lina Chen'],
    },
    {
      id: 'MG-02',
      role: 'owner',
      title: 'Cut average review feedback length under quality bar',
      desc: 'Bring vague/bias flags below 5 per cycle.',
      pct: 78, status: 'on-track', due: 'Sep 30, 2026', period: 'Q3 2026',
      linkedProject: 'Review Quality rollout', kr: 4, krDone: 3,
      contribs: ['Mel Johansson'],
    },
    {
      id: 'MG-03',
      role: 'contrib',
      title: 'Reduce vendor setup time across the supplier network',
      desc: "Contributing to Omar's individual OKR by sharing payroll best practices.",
      pct: 45, status: 'at-risk', due: 'Oct 15, 2026', period: 'Q3 2026',
      linkedProject: 'Vendor Setup Automation', kr: 2, krDone: 0,
      contribs: ['Omar Khan'],
    },
    {
      id: 'MG-04',
      role: 'owner',
      title: 'Launch the 1:1 meeting tooling for managers',
      desc: 'Move from ad-hoc 1:1 docs to in-platform tooling with goal/project links.',
      pct: 33, status: 'at-risk', due: 'Nov 30, 2026', period: 'Q4 2026',
      linkedProject: null, kr: 3, krDone: 1,
      contribs: ['Aditi Sharma', 'Karim Idris'],
    },
    {
      id: 'MG-05',
      role: 'stakeholder',
      title: 'Hit 99.5% payroll accuracy across all EU runs',
      desc: 'Stakeholder on the payroll quality OKR — share signals and reviews.',
      pct: 91, status: 'on-track', due: 'Sep 30, 2026', period: 'Q3 2026',
      linkedProject: 'Payroll Migration EU', kr: 5, krDone: 5,
      contribs: ['Ops Team'],
    },
  ]);

  /* ---------------- People OKRs (workers managed by Priya) ---------------- */
  // Live read from WorkerGoalStore so progress updates from worker view appear here instantly.
  const peopleOKRs = window.WorkerGoalStore ? window.WorkerGoalStore.getPeopleOKRs() : [];

  function resolveOKR(o) {
    if (!window.ProjectStore || !Array.isArray(o.kr) || o.kr.length === 0) return o;
    let changed = false;
    const resolvedKRs = o.kr.map(k => {
      if (k.linkedProject && window.ProjectStore.isCompleted(k.linkedProject)) {
        changed = true;
        return { ...k, pct: 100 };
      }
      return k;
    });
    if (!changed) return o;
    const avgPct = Math.round(resolvedKRs.reduce((sum, k) => sum + k.pct, 0) / resolvedKRs.length);
    const triggeredProject = resolvedKRs.find(k => k.linkedProject && window.ProjectStore.isCompleted(k.linkedProject))?.linkedProject;
    return { ...o, kr: resolvedKRs, pct: avgPct, status: avgPct >= 100 ? 'completed' : avgPct >= 70 ? 'on-track' : 'at-risk', _completedViaProject: triggeredProject };
  }

  const tabCounts = { company: companyOKRs.length, my: myOKRs.length, people: peopleOKRs.length };

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Goals & OKRs']}>

      {stepper ? (
        <GoalStepper kind={stepper.kind}
          initial={stepper.initial}
          mode={stepper.mode}
          onCancel={() => setStepper(null)}
          onCreate={(payload) => {
            if (stepper.mode !== 'edit' && payload) {
              const due = payload.dates ? (payload.dates.split('—')[1] || payload.dates).trim() : '';
              const projLink = (payload.krs || []).find(k => k.linkedProject)?.linkedProject || null;
              setMyOKRs(prev => [...prev, {
                id: 'MG-' + Date.now().toString(36).slice(-5).toUpperCase(),
                role: 'owner',
                title: payload.name || 'Untitled Goal',
                desc: '',
                pct: 0, status: 'on-track', due, period: 'Q3 2026',
                linkedProject: projLink,
                kr: (payload.krs || []).length, krDone: 0,
                contribs: payload.contributors || [],
              }]);
              setTab('my');
            }
            setStepper(null);
          }}
        />
      ) : detailGoal ? (
        <GoalDetail goal={detailGoal} role="manager" onBack={() => setDetailGoal(null)} />
      ) : (<>

      <PerfTabs active="okrs" />

      <PageHead
        eyebrow="Performance Management"
        title="Goals & OKRs"
        sub="Create and track company, team, individual and project-linked OKRs."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <div ref={createBtnRef}>
            <Btn variant="primary" icon="add" onClick={() => setStepper({ kind: 'goal', mode: 'create' })}>Create Goal</Btn>
          </div>
        </>}
      />

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>
          <span className="ms lock">lock</span>Company Goals
          <span className="count">{tabCounts.company}</span>
        </div>
        <div className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
          <span className="ms">person</span>My Goals
          <span className="count">{tabCounts.my}</span>
        </div>
        <div className={`tab ${tab === 'people' ? 'active' : ''}`} onClick={() => setTab('people')}>
          <span className="ms">groups</span>People OKRs
          <span className="count">{tabCounts.people}</span>
        </div>
        <div className="tab" style={{ marginLeft: 'auto' }}>
          <span className="ms">view_module</span>
          <span style={{ color: 'var(--fg-disabled)', fontSize: 12, fontWeight: 600 }}>View:</span>
          <span>Cards</span>
        </div>
      </div>

      {/* ============================================================
          TAB · COMPANY GOALS (read-only)
          ============================================================ */}
      {tab === 'company' && (
        <>
          <Callout tone="info" icon="lock"
            title="Read-only — set by company leadership"
            action={<Btn variant="text" size="sm" iconTrailing="arrow_forward">Suggest a goal</Btn>}>
            Company OKRs are managed by Acme's leadership team. You can align your goals to these but cannot edit them directly.
          </Callout>

          <div className="mt-4">
            {companyOKRs.map(o => (
              <div className="okr-card locked" key={o.id}>
                <div className="o-head">
                  <div className="o-title-block">
                    <div className="o-eyebrow">
                      <span className="ms" style={{ fontSize: 13 }}>lock</span>
                      Company · {o.id} · {o.period}
                    </div>
                    <div className="o-title">{o.title}</div>
                    <div className="o-desc">{o.desc}</div>
                    <div className="o-meta">
                      <span className="item"><Avatar name={o.owner} size="xs" /> <span className="v">{o.owner}</span> · {o.ownerRole}</span>
                      <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                      <span className="item"><span className="ms">trending_up</span>{o.kr.length} key results</span>
                      {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                      {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                    </div>
                  </div>
                  <div className="o-actions">
                    <Btn variant="outlined" size="sm" icon="account_tree" onClick={() => viewOKRsForCG(o)}>View linked OKRs</Btn>
                    <Btn variant="ghost" size="sm" icon="edit" onClick={() => setStepper({ kind: 'goal', mode: 'edit', initial: {
                      name: o.title,
                      gtype: 'company',
                      privacy: 'public',
                      isPerf: true,
                      krs: o.kr.map(k => ({ name: k.t, start: 0, target: 100, unit: '%' })),
                      dates: o.due ? (o.period || '7/1/2026 — ' + o.due) : '7/1/2026 — 9/30/2026',
                      owner: o.owner,
                      contributors: [],
                    } })}>Edit Goal</Btn>
                  </div>
                </div>
                <div className="o-prog">
                  <div className="kr-list" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                    {o.kr.map((k, i) => (
                      <div className="kr" key={i}>
                        <div className="num">KR{i+1}</div>
                        <div className="text">{k.t}</div>
                        <div className="target">{k.target}</div>
                        <ProgressBar pct={k.pct} />
                        <span /> {/* spacer */}
                      </div>
                    ))}
                  </div>
                  <div style={{ alignSelf: 'flex-start' }}>
                    <div style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Overall progress</div>
                    <ProgressBar pct={o.pct} big color={o.status === 'at-risk' ? 'amber' : 'green'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================
          TAB · MY GOALS (editable, with role badges)
          ============================================================ */}
      {tab === 'my' && (
        <>
          <Callout tone="purple" icon="person"
            title="My Goals — fully editable">
            Goals where you're an owner, contributor or stakeholder. Edit progress, link projects, or align to company OKRs.
          </Callout>

          <div className="mt-4">
            {myOKRs.map(raw => { const o = resolveOKR(raw); return (
              <div className="okr-card" key={o.id}>
                <div className="o-head">
                  <div className="o-title-block">
                    <div className="o-eyebrow row items-center gap-2">
                      <Pill variant={o.role === 'owner' ? 'owner' : o.role === 'contrib' ? 'contrib' : 'stakeholder'}>
                        {o.role === 'owner' ? 'Owner' : o.role === 'contrib' ? 'Contributor' : 'Stakeholder'}
                      </Pill>
                      <span style={{ color: 'var(--fg-disabled)' }}>·</span>
                      <span>{o.id} · {o.period}</span>
                    </div>
                    <div className="o-title">{o.title}</div>
                    <div className="o-desc">{o.desc}</div>
                    <div className="o-meta">
                      <span className="item">
                        <span className="ms">link</span>
                        {o.linkedProject
                          ? <><span className="v" style={{ color: 'var(--brand-blue-600)' }}>{o.linkedProject}</span></>
                          : <button className="btn btn-text btn-sm" style={{ padding: '2px 6px', fontSize: 11 }}><span className="ms" style={{ fontSize: 12 }}>add</span>Link project</button>}
                      </span>
                      <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                      <span className="item"><span className="ms">flag</span><span className="v">{o.krDone}/{o.kr}</span> KRs done</span>
                      <span className="item"><span className="ms">groups</span><AvatarStack names={o.contribs} size="xs" /></span>
                      {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                      {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                      {o.status === 'completed' && <Pill variant="completed" dot>Completed</Pill>}
                    </div>
                  </div>
                  <div className="o-actions">
                    {o.role === 'owner' && <>
                      <Btn variant="ghost" size="sm" icon="edit">Edit</Btn>
                      <Btn variant="primary" size="sm" icon="trending_up" onClick={() => setDetailGoal({
                        title: o.title,
                        description: o.desc,
                        type: 'Performance',
                        typeIcon: 'workspace_premium',
                        privacy: 'Restricted',
                        when: o.due ? '7/1/2026 — ' + o.due : '7/1/2026 — 9/30/2026',
                        daysLeft: 188,
                        perfGoal: true,
                        aligned: o.linkedProject || null,
                        progress: o.pct,
                        owner: { name: 'Priya Nair', role: 'Manager' },
                        contributors: o.contribs.map(n => ({ name: n, role: 'Contributor' })),
                        krs: Array.from({length: o.kr || 3}, (_, i) => ({
                          id: i+1, owner: o.contribs[0] || 'Priya Nair',
                          text: 'KR ' + (i+1) + ' for ' + o.title,
                          current: Math.round(o.pct * (i+1) / (o.kr || 3)),
                          target: 100, unit: '%', pct: Math.round(o.pct * (i+1) / (o.kr || 3)),
                        })),
                        attachments: 1,
                      })}>Update progress</Btn>
                    </>}
                    {o.role === 'contrib' && <Btn variant="outlined" size="sm" icon="trending_up">Update my contribution</Btn>}
                    {o.role === 'stakeholder' && <Btn variant="ghost" size="sm" icon="visibility">View</Btn>}
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)',
                  display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                    {o.role === 'owner'
                      ? <>You drive this goal {o.linkedProject ? <> · linked to <strong>{o.linkedProject}</strong></> : ''}.</>
                      : o.role === 'contrib'
                        ? <>You're contributing toward this goal — owned by <strong>{o.contribs[0]}</strong>.</>
                        : <>Stakeholder · you receive updates but don't own progress.</>}
                  </div>
                  <ProgressBar pct={o.pct} big color={o.status === 'completed' ? 'green' : o.status === 'at-risk' ? 'amber' : 'green'} />
                </div>
              </div>
            ); })}
          </div>
        </>
      )}

      {/* ============================================================
          TAB · PEOPLE OKRs (manage workers' OKRs)
          ============================================================ */}
      {tab === 'people' && (
        <>
          {peopleFilterCG ? (
            <Callout tone="info" icon="account_tree"
              title={`Filtered by company goal · ${peopleFilterCG.id}`}
              action={<Btn variant="ghost" size="sm" icon="close" onClick={() => setPeopleFilterCG(null)}>Clear filter</Btn>}>
              Showing people OKRs aligned to <strong style={{ color: 'var(--grey-700)' }}>“{peopleFilterCG.title}”</strong>. 3 of 5 OKRs match.
            </Callout>
          ) : (
            <Callout tone="success" icon="groups"
              title="People OKRs — your direct reports & dotted-line workers">
              5 workers. Create, edit, link projects to OKRs.
            </Callout>
          )}

          {peopleFilterCG && (
            <div className="row gap-2 mt-3 mb-3 items-center" style={{ flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active filters:</span>
              <span className="filter-chip-active">
                <span className="k">Aligned to:</span>
                <span>{peopleFilterCG.id} · {peopleFilterCG.title.length > 50 ? peopleFilterCG.title.slice(0, 50) + '…' : peopleFilterCG.title}</span>
                <span className="x" onClick={() => setPeopleFilterCG(null)}><span className="ms">close</span></span>
              </span>
              <Btn variant="text" size="sm" icon="add">Add filter</Btn>
            </div>
          )}

          <div className="mt-4">
            {peopleOKRs.map(raw => { const o = resolveOKR(raw); const projLink = o.kr?.find(k => k.linkedProject)?.linkedProject || null; return (
              <div className="okr-card" key={o.id}>
                <div className="o-head">
                  <div className="o-title-block">
                    <div className="row items-center gap-3 mb-2">
                      <Avatar name={o.ownerName} size="md" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)', lineHeight: 1.2 }}>{o.ownerName}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>{o.workerRole} · {o.id}</div>
                      </div>
                    </div>
                    <div className="o-title">{o.title}</div>
                    <div className="o-meta">
                      <span className="item">
                        <span className="ms">link</span>
                        {projLink
                          ? <span className="v" style={{ color: 'var(--brand-blue-600)' }}>{projLink}</span>
                          : <button className="btn btn-text btn-sm" style={{ padding: '2px 6px', fontSize: 11 }}><span className="ms" style={{ fontSize: 12 }}>add</span>Link a project</button>}
                      </span>
                      <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                      <span className="item"><span className="ms">flag</span><span className="v">{o.kr.length}</span> key results</span>
                      {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                      {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                      {o.status === 'completed' && <Pill variant="completed" dot>Completed</Pill>}
                    </div>
                  </div>
                  <div className="o-actions">
                    <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setDetailGoal({
                      title: o.title,
                      description: projLink ? 'Linked to ' + projLink + '.' : 'No linked project.',
                      type: 'Performance',
                      typeIcon: 'workspace_premium',
                      privacy: 'Restricted',
                      when: '7/1/2026 — ' + o.due,
                      daysLeft: 188,
                      perfGoal: true,
                      aligned: projLink,
                      progress: o.pct,
                      owner: { name: o.ownerName, role: o.workerRole },
                      contributors: [{ name: 'Priya Nair', role: 'Manager' }],
                      krs: o.kr.map((k, i) => ({
                        id: i+1, owner: o.ownerName, text: k.t, pct: k.pct,
                        current: k.current,
                        target: k.target,
                        unit: k.unit || 'count',
                      })),
                      attachments: 1,
                    })}>View</Btn>
                    <Btn variant="ghost" size="sm" icon="forum" onClick={() => window.location.hash = '/client/feedback'}>Give feedback</Btn>
                    <Btn variant="ghost" size="sm" icon="event" onClick={() => window.location.hash = '/client/meetings'}>Schedule 1:1</Btn>
                  </div>
                </div>

                <div className="kr-list">
                  {o.kr.map((k, i) => (
                    <div className="kr" key={i}>
                      <div className="num">KR{i+1}</div>
                      <div className="text">{k.t}{k.linkedProject && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: 'var(--brand-blue-600)', background: 'var(--brand-blue-50)', borderRadius: 4, padding: '1px 5px' }}>{k.linkedProject}</span>}</div>
                      <div className="target">
                        {k.unit === 'incomplete'
                          ? (k.current === k.target ? 'Done' : k.current || 'Pending')
                          : `${k.current} / ${k.target}`}
                      </div>
                      <ProgressBar pct={k.pct} color={k.pct >= 70 ? 'green' : k.pct >= 40 ? '' : 'amber'} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)',
                  display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'center' }}>
                  <div>
                    {projLink ? (
                      <div className="row items-center gap-3" style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                        <span className="ms" style={{ fontSize: 16, color: 'var(--brand-blue-500)' }}>link</span>
                        <span>Linked to <strong style={{ color: 'var(--grey-700)' }}>{projLink}</strong></span>
                      </div>
                    ) : (
                      <div className="row items-center gap-2" style={{ fontSize: 12, color: 'var(--warning-dark)' }}>
                        <span className="ms" style={{ fontSize: 16 }}>warning_amber</span>
                        <span>No project linked — link a project to track progress.</span>
                      </div>
                    )}
                    {o._completedViaProject && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--success-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--success-dark)', fontWeight: 600 }}>
                        <span className="ms" style={{ fontSize: 16 }}>check_circle</span>
                        Auto-completed · <strong>{o._completedViaProject}</strong> was marked complete
                      </div>
                    )}
                  </div>
                  <ProgressBar pct={o.pct} big color={o.status === 'completed' ? 'green' : o.status === 'at-risk' ? 'amber' : 'green'} />
                </div>
              </div>
            ); })}
          </div>

          <div style={{ marginTop: 28 }}>
            <Callout tone="info" icon="rocket_launch"
              action={<Btn variant="primary" size="sm" icon="open_in_new" onClick={() => window.location.hash = '/projects'}>Open Projects</Btn>}>
              <strong>Project → OKR auto-completion is live.</strong> Mark a project as complete in the Projects module and any linked OKRs will automatically update here and in worker views.
            </Callout>
          </div>
        </>
      )}
      </>)}
    </Shell>
  );
}

window.ClientOKRs = ClientOKRs;


/* ============================================================================
   FILE: frames/goal-stepper.jsx
   ============================================================================ */

/* Goal / OKR creation stepper — 5 steps.
   Modeled after the screenshots provided by the user.
   kind: 'goal' | 'okr' — only label/cosmetic differences. */

const { useState: useStateStep } = React;

const LINKED_PROJECTS = [
  'Payroll Migration EU',
  'KYB Automation v2',
  'Contractor Onboarding Revamp',
  'CSAT Recovery Program',
  'Ops Tooling Modernisation',
  'Q3 Payroll Quality Initiative',
];

const STEPS = [
  { id: 'name',  label: 'Name & Type' },
  { id: 'kr',    label: 'Key Results' },
  { id: 'dates', label: 'Goal Dates' },
  { id: 'users', label: 'Users' },
  { id: 'review',label: 'Review' },
];

function GoalStepper({ kind = 'goal', mode = 'create', role = 'manager', initial = {}, onCancel, onCreate }) {
  const [stepIdx, setStepIdx] = useStateStep(0);
  const [name, setName] = useStateStep(initial.name ?? 'Reduce vendor setup time by 20%');
  const [gtype, setGType] = useStateStep(initial.gtype ?? 'individual');
  const [privacy, setPrivacy] = useStateStep(initial.privacy ?? 'restricted');
  const [isPerf, setIsPerf] = useStateStep(initial.isPerf ?? true);
  const [krs, setKrs] = useStateStep(initial.krs ?? [
    { name: 'Average vendor setup time', start: 8, target: 6.4, unit: 'days' },
    { name: 'KYB automation coverage',   start: 0, target: 80,  unit: '%' },
  ]);
  const [krDir, setKrDir] = useStateStep('Increase');
  const [dates, setDates] = useStateStep(initial.dates ?? '7/1/2026 — 9/30/2026');
  const [owner, setOwner] = useStateStep(initial.owner ?? (window.PerformanceStore?.getCurrentUser()?.name || 'Aditi Sharma'));
  const [contributors, setContributors] = useStateStep(initial.contributors ?? ['Aditi Sharma', 'Priya Nair']);

  const step = STEPS[stepIdx].id;
  const isLast = stepIdx === STEPS.length - 1;
  const title = mode === 'edit' ? (kind === 'okr' ? 'Edit OKR' : 'Edit Goal') : (kind === 'okr' ? 'New OKR' : 'New Goal');

  const displayName = name?.trim() ? name.trim() : (kind === 'okr' ? 'Untitled OKR' : 'Untitled Goal');

  return (
    <div className="stepper-takeover">
      <div className="strip" />
      <div className="topbar">
        <div className="brand">
          <div className="icon"><span className="ms">{kind === 'okr' ? 'crisis_alert' : 'gps_fixed'}</span></div>
          <h2>{title}</h2>
        </div>
        <button className="x" onClick={onCancel} title="Close"><span className="ms">close</span></button>
      </div>

      <div className="body">
        {/* Step indicator */}
        <div className="step-progress">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`step ${i < stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`} onClick={() => i < stepIdx && setStepIdx(i)} style={{ cursor: i < stepIdx ? 'pointer' : 'default' }}>
                <div className="dot" />
                <div className="label">{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`line ${i < stepIdx ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step card */}
        <div className="step-card">
          <div className="avatar-icon"><span className="ms">{kind === 'okr' ? 'crisis_alert' : 'gps_fixed'}</span></div>
          {stepIdx > 0 && (
            <button className="trash" title="Delete draft"><span className="ms">delete_outline</span></button>
          )}
          {stepIdx > 0 && <div className="goal-name">{displayName}</div>}

          {/* ============== STEP 1 · Name & Type ============== */}
          {step === 'name' && (
            <>
              <div className="field">
                <div className="lh">
                  <div className="lbl">Name<span className="req">*</span></div>
                  <div className="count">{name.length} / 512 Characters</div>
                </div>
                <input
                  className="inp"
                  placeholder={kind === 'okr' ? 'What outcome do you want to achieve?' : 'What is your goal?'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <div className="help">{kind === 'okr'
                  ? 'A clear, measurable outcome (Objective) that you and your team can rally behind.'
                  : 'What is the overall objective you want to achieve? (Qualitative and aspirational)'}</div>
              </div>

              <div className="field-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="lh"><div className="lbl">Type<span className="req">*</span></div></div>
                  <div className="sel-wrap">
                    <span className="lead-icon"><span className="ms">{
                      gtype === 'individual' ? 'person' :
                      gtype === 'team'       ? 'groups' :
                      gtype === 'project'    ? 'rocket_launch' : 'apartment'
                    }</span></span>
                    <select className="sel with-lead" value={gtype} onChange={e => setGType(e.target.value)}>
                      <option value="individual">Individual</option>
                      <option value="team">Team</option>
                      <option value="project">Project-linked</option>
                      {role !== 'worker' && <option value="company">Company</option>}
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="lh"><div className="lbl">Privacy<span className="req">*</span></div></div>
                  <div className="sel-wrap">
                    <span className="lead-icon"><span className="ms">{
                      privacy === 'public'     ? 'public' :
                      privacy === 'restricted' ? 'lock' : 'visibility_off'
                    }</span></span>
                    <select className="sel with-lead" value={privacy} onChange={e => setPrivacy(e.target.value)}>
                      <option value="public">Public — visible to everyone in the workspace</option>
                      <option value="restricted">Restricted</option>
                      <option value="private">Private — only owner & contributors</option>
                    </select>
                  </div>
                  <div className="help">{
                    privacy === 'public'     ? 'Visible to everyone at Acme Holdings.' :
                    privacy === 'restricted' ? 'Visible to goal participants, their managers, and admins.' :
                    'Visible only to the owner and listed contributors.'
                  }</div>
                </div>
              </div>

              <div className="switch-row">
                <div className={`switch ${isPerf ? 'on' : ''}`} onClick={() => setIsPerf(!isPerf)} />
                <div className="label-block">Is Performance Goal</div>
              </div>
              <div className="help" style={{ paddingLeft: 58, marginTop: 0, marginBottom: 24 }}>
                Marking this as a Performance Goal will allow it to be included in future performance reviews.
              </div>

            </>
          )}

          {/* ============== STEP 2 · Key Results ============== */}
          {step === 'kr' && (
            <>
              {krs.map((kr, i) => (
                <div className="kr-block" key={i}>
                  <div className="drag"><span className="ms">drag_indicator</span></div>
                  <div className="kr-head">
                    <div className="name">Key Result #{i+1}</div>
                    <div className="count">{kr.name.length} / 512 Characters</div>
                  </div>
                  <input
                    className="inp"
                    value={kr.name}
                    onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, name: e.target.value } : k))}
                  />
                  <div className="kr-help">Trackable metric that will indicate goal progress.</div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>
                      Linked Project <span style={{ fontWeight: 400, color: 'var(--fg-disabled)' }}>· optional</span>
                    </div>
                    <div className="sel-wrap">
                      <span className="lead-icon">
                        <span className="ms" style={{ color: kr.linkedProject ? 'var(--brand-blue-500)' : undefined }}>
                          {kr.linkedProject ? 'link' : 'link_off'}
                        </span>
                      </span>
                      <select className="sel with-lead" value={kr.linkedProject || ''} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, linkedProject: e.target.value } : k))}>
                        <option value="">No linked project</option>
                        {(window.ProjectStore ? window.ProjectStore.getProjectNames() : LINKED_PROJECTS).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    {kr.linkedProject && (
                      <div className="help" style={{ color: 'var(--brand-blue-600)', marginTop: 4 }}>
                        <span className="ms" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                        When <strong>{kr.linkedProject}</strong> is marked complete, this key result will be auto-completed.
                      </div>
                    )}
                  </div>
                  <div className="grid-3">
                    <div>
                      <div className="sub">Start</div>
                      <input className="inp" type="number" value={kr.start} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, start: e.target.value } : k))} />
                    </div>
                    <div>
                      <div className="sub">Target</div>
                      <input className="inp" type="number" value={kr.target} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, target: e.target.value } : k))}
                        style={i === 0 ? { borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 3px rgba(0,117,225,0.12)' } : undefined}
                      />
                    </div>
                    <div>
                      <div className="sub">Unit</div>
                      <div className="sel-wrap">
                        <span className="lead-icon"><span className="ms">{kr.unit === '%' ? 'percent' : kr.unit === 'days' ? 'event' : 'tag'}</span></span>
                        <select className="sel with-lead" value={kr.unit} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, unit: e.target.value } : k))}>
                          <option value="%">Percentage</option>
                          <option value="days">Days</option>
                          <option value="count">Count</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="trackline">
                    <div>
                      <strong>Tracking:</strong>{' '}<span style={{ color: 'var(--grey-700)' }}>{krDir}</span>{' '}
                      <span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.name.split(' ').slice(0, 3).join(' ')}</span>{' '}
                      from{' '}<span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.start}{kr.unit === '%' ? '%' : ''}</span>{' '}
                      to{' '}<span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.target}{kr.unit === '%' ? '%' : ''}</span>
                    </div>
                    <div className="tools">
                      <button title="Assign owner"><span className="ms">person</span></button>
                      <button title="Duplicate"><span className="ms">content_copy</span></button>
                      <button className="danger" title="Delete" onClick={() => setKrs(krs.filter((_, j) => j !== i))}><span className="ms">delete</span></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="new-kr-row">
                <div className="line" />
                <button className="new-kr-btn" onClick={() => setKrs([...krs, { name: '', start: 0, target: 100, unit: '%' }])}>
                  <span className="ms" style={{ fontSize: 16 }}>add</span>New Key Result
                </button>
                <div className="line" />
              </div>
            </>
          )}

          {/* ============== STEP 3 · Goal Dates ============== */}
          {step === 'dates' && (
            <>
              <div className="date-q">What are the start and end dates for this goal?</div>
              <div className="date-pick">
                <span className="ms lead">event_available</span>
                <span className="v">{dates}</span>
                <span className="ms caret">arrow_drop_down</span>
              </div>
              <div className="help" style={{ textAlign: 'center', marginTop: 18, color: 'var(--fg-secondary)' }}>
                Aligning with Q3 2026 review cycle (Jul 1 – Sep 30).
              </div>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map(q => (
                  <button key={q} className={`opt-chip ${q === 'Q3 2026' ? 'active' : ''}`} style={{ justifyContent: 'center' }}
                    onClick={() => setDates(q === 'Q3 2026' ? '7/1/2026 — 9/30/2026' : q === 'Q1 2026' ? '1/1/2026 — 3/31/2026' : q === 'Q2 2026' ? '4/1/2026 — 6/30/2026' : '10/1/2026 — 12/31/2026')}>
                    <span className="ms">{q === 'Q3 2026' ? 'check_circle' : 'event'}</span>{q}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ============== STEP 4 · Users ============== */}
          {step === 'users' && (
            <>
              <div className="field">
                <div className="lh"><div className="lbl">Owner</div></div>
                <div className="user-field">
                  <div className="floating-label">Only one owner per goal</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
                    {owner && (
                      <span className="selected" style={{ alignSelf: 'auto' }}>
                        {owner}<span className="x" onClick={() => setOwner('')}>×</span>
                      </span>
                    )}
                    {!owner && (
                      <input
                        autoFocus
                        placeholder="Type a name to assign owner"
                        style={{ flex: 1, minWidth: 200 }}
                        onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { setOwner(e.target.value.trim()); e.target.value = ''; } }}
                        onBlur={e => { if (e.target.value.trim()) setOwner(e.target.value.trim()); }}
                      />
                    )}
                  </div>
                </div>
                <div className="help">Owners are responsible for keeping goals up-to-date and keeping contributors accountable.</div>
              </div>

              <div className="field">
                <div className="lh"><div className="lbl">Contributors</div></div>
                <div className="user-field">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
                    {contributors.map((c, i) => (
                      <span key={i} className="selected" style={{ alignSelf: 'auto' }}>
                        {c}<span className="x" onClick={() => setContributors(contributors.filter((_, j) => j !== i))}>×</span>
                      </span>
                    ))}
                    <input placeholder={contributors.length === 0 ? 'Type names here to select multiple contributors' : ''} style={{ flex: 1, minWidth: 200 }}
                      onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { setContributors([...contributors, e.target.value.trim()]); e.target.value = ''; } }}
                    />
                  </div>
                </div>
                <div className="help">Contributors are users that are actively pursuing and updating the progress of this goal.</div>
              </div>
            </>
          )}

          {/* ============== STEP 5 · Review ============== */}
          {step === 'review' && (
            <div className="review-card">
              <div className="subtype">{
                gtype === 'individual' ? 'Individual Goal' :
                gtype === 'team' ? 'Team Goal' :
                gtype === 'project' ? 'Project-Linked Goal' : 'Company Goal'
              }</div>

              <div className="review-meta-row">
                <div className="item">
                  <span className="ms">{privacy === 'public' ? 'public' : privacy === 'restricted' ? 'lock' : 'visibility_off'}</span>
                  {privacy === 'public' ? 'Public' : privacy === 'restricted' ? 'Restricted' : 'Private'}
                </div>
                <div className="item">
                  <span className="ms">event_available</span>{dates}
                </div>
                {isPerf && (
                  <div className="item" style={{ color: 'var(--brand-purple-600)' }}>
                    <span className="ms" style={{ color: 'var(--brand-purple-500)' }}>workspace_premium</span>Performance Goal
                  </div>
                )}
              </div>

              <div className="review-sec">
                <h4>Key Results</h4>
                {krs.map((kr, i) => (
                  <div className="dotted-row" key={i}>
                    <span className="k">{kr.name || `Key result #${i+1}`}</span>
                    <span className="dots" />
                    <span className="v" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {krDir === 'Increase' ? '↑' : '↓'} to {kr.target}{kr.unit === '%' ? '%' : ` ${kr.unit}`}
                      {kr.linkedProject && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--brand-blue-600)', background: 'var(--brand-blue-50)', border: '1px solid var(--brand-blue-200)', borderRadius: 6, padding: '2px 7px' }}>
                          <span className="ms" style={{ fontSize: 12 }}>link</span>{kr.linkedProject}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="review-sec">
                <h4>Users</h4>
                <div className="dotted-row">
                  <span className="k">Owner</span>
                  <span className="dots" />
                  <span className="v"><Avatar name={owner} size="xs" />{owner}</span>
                </div>
                <div className="dotted-row">
                  <span className="k">Contributors</span>
                  <span className="dots" />
                  <span className="v">{contributors.length ? <><AvatarStack names={contributors} size="xs" /> {contributors.length} contributor{contributors.length > 1 ? 's' : ''}</> : '0 contributors'}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stepper-footer">
          {stepIdx > 0
            ? <Btn variant="ghost" onClick={() => setStepIdx(stepIdx - 1)}><span style={{ padding: '0 8px' }}>Back</span></Btn>
            : <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>}

          <span className="saved"><span className="ms">check_circle</span>Saved Just Now</span>

          <div className="right-actions">
            {isLast ? (
              <>
                {mode === 'edit' ? (
                  <>
                    <button className="btn-draft">Save as draft</button>
                    <Btn variant="primary" onClick={() => onCreate && onCreate({ name, gtype, krs, dates, owner, contributors })}>Save changes</Btn>
                  </>
                ) : (
                  <>
                    <button className="btn-draft">Create in Draft Mode</button>
                    <Btn variant="primary" onClick={() => onCreate && onCreate({ name, gtype, krs, dates, owner, contributors })}>Create {kind === 'okr' ? 'OKR' : 'Goal'}</Btn>
                  </>
                )}
              </>
            ) : (
              <Btn variant="primary" onClick={() => setStepIdx(stepIdx + 1)}>Next</Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.GoalStepper = GoalStepper;


/* ============================================================================
   FILE: frames/goal-detail.jsx
   ============================================================================ */

/* Goal Detail page — matches the reference screenshot.
   Shared component used by both client People OKRs view (when "View" is clicked)
   and worker's My Goals view.

   Layout:
   - Crumb at top ("Goals / Goal title")
   - Header with title, description, status pills, type/privacy/when metadata
   - Two-column body:
     - LEFT (2/3): Goal Progress card + Key Results rows
     - RIGHT (1/3): Tracking chart, Days until due, Attachments, Owner, Contributors */

const { useState: useStateGD } = React;

function GoalDetail({ goal, role = 'manager', onBack, onUpdateGoal }) {
  const [showAddKR, setShowAddKR] = useStateGD(false);
  const [newKR, setNewKR] = useStateGD({ name: '', start: 0, target: 100, unit: '%', assignTo: '' });
  const [updateModal, setUpdateModal] = useStateGD(false);
  const [dotMenu, setDotMenu] = useStateGD(null);

  // Default sample goal if none provided
  const baseGoal = goal || {
    title: 'Build a Scalable Operations Engine to Support 2× Growth with Lower Opex',
    description: 'Drive operational leverage by automating manual workflows and lifting employees-per-Ops-FTE.',
    type: 'Development',
    typeIcon: 'eco',
    privacy: 'Restricted',
    when: '1/1/2026 — 12/31/2026',
    daysLeft: 223,
    perfGoal: true,
    aligned: null,
    tags: [],
    progress: 24,
    owner: { name: 'Ashray Gupta', role: 'Associate Product Manager' },
    contributors: [
      { name: 'Aditi Sharma', role: 'Senior Ops' },
      { name: 'Lina Chen',    role: 'Onboarding Mgr' },
      { name: 'Priya Nair',   role: 'Manager' },
    ],
    krs: [
      { id: 1, current: 92,  target: 300, unit: 'count',     pct: 31, owner: 'Aditi Sharma', text: 'Increase employees managed per Ops FTE from ~133 → 300+ per Ops resource', linkedProject: 'Payroll Migration EU' },
      { id: 2, current: 18,  target: 80,  unit: '%',         pct: 23, owner: 'Lina Chen',    text: 'Automate 80% of payroll workflows (Input → Validation → Processing → Payout)', linkedProject: 'Vendor Setup Automation' },
      { id: 3, current: 14,  target: 90,  unit: '%',         pct: 16, owner: 'Aditi Sharma', text: 'Reduce payroll processing errors by 90%' },
      { id: 4, current: 28,  target: 90,  unit: '%',         pct: 31, owner: 'Priya Nair',   text: 'Enable 90% of customer queries via self-serve + smart channels', linkedProject: 'Client Onboarding Q3' },
      { id: 5, current: null,target: null,unit: 'incomplete',pct: 0,  owner: 'Lina Chen',    text: 'Achieve zero manual intervention across top 5 payroll corridors' },
    ],
    attachments: 2,
  };

  const [krs, setKrsGD] = useStateGD(baseGoal.krs || []);
  const g = { ...baseGoal, krs };

  const isWorker = role === 'worker';
  const canEdit  = !isWorker || g.ownedByMe;

  function saveNewKR() {
    if (!newKR.name.trim()) return;
    const nextId = krs.length ? Math.max(...krs.map(k => k.id || 0)) + 1 : 1;
    setKrsGD([...krs, {
      id: nextId,
      text: newKR.name,
      current: newKR.start,
      target: newKR.target,
      unit: newKR.unit,
      pct: 0,
      owner: newKR.assignTo || baseGoal.owner?.name || 'Unassigned',
    }]);
    setShowAddKR(false);
    setNewKR({ name: '', start: 0, target: 100, unit: '%', assignTo: '' });
  }

  const modalGoal = {
    ...g,
    kr: krs.map(k => ({
      t: k.text,
      current: String(k.current ?? 0),
      target: String(k.target ?? 0),
      unit: k.unit,
      pct: k.pct || 0,
    })),
  };

  return (
    <div className="goal-detail">
      {updateModal && (
        <UpdateProgressModal
          goal={modalGoal}
          onCancel={() => setUpdateModal(false)}
          onSave={({ kr: updatedKr, pct }) => {
            setKrsGD(krs.map((k, i) => updatedKr[i]
              ? { ...k, current: updatedKr[i].current, pct: updatedKr[i].pct }
              : k));
            setUpdateModal(false);
          }}
        />
      )}
      {/* Local crumb bar */}
      <div className="gd-crumbbar">
        <div className="left">
          <button className="back" onClick={onBack}><span className="ms">arrow_back</span></button>
          <span className="crumb-lead">Goals</span>
          <span className="ms" style={{ fontSize: 14, color: 'var(--fg-disabled)' }}>chevron_right</span>
          <span className="crumb-curr">{g.title.length > 70 ? g.title.slice(0, 70) + '…' : g.title}</span>
        </div>
      </div>

      <div className="strip" />

      <div className="gd-body">
        {/* ===== Header ===== */}
        <div className="gd-head">
          <div className="row items-start gap-3" style={{ flexWrap: 'wrap' }}>
            <h1 className="gd-title">
              {g.title}
              {canEdit && <button className="gd-edit-i"><span className="ms">edit</span></button>}
            </h1>
            <div className="row gap-2 items-center" style={{ flexShrink: 0, marginLeft: 'auto' }}>
              <Btn variant="outlined" icon="check_circle">Mark Complete</Btn>
              {g.perfGoal && <Btn variant="outlined" icon="workspace_premium">Unmark as Performance Goal</Btn>}
              <Btn variant="ghost" icon="settings" iconTrailing="expand_more">More Options</Btn>
            </div>
          </div>

          <div className="gd-desc">
            {g.description || <span style={{ color: 'var(--fg-disabled)' }}>Add details about this goal and why it matters…</span>}
            {canEdit && <button className="gd-edit-i" style={{ marginLeft: 6 }}><span className="ms">edit</span></button>}
          </div>

          <div className="gd-tag-row">
            {g.perfGoal && (
              <span className="gd-pill perf">
                <span className="ms">workspace_premium</span>Performance Goal
              </span>
            )}
            <span className="gd-pill">
              <span className="ms">account_tree</span>{g.aligned || 'None'}
            </span>
            <span className="gd-pill">
              <span className="ms">sell</span>{g.tags && g.tags.length ? g.tags.join(', ') : 'None'}
            </span>
          </div>

          <div className="gd-meta">
            <div className="gd-meta-cell">
              <div className="k">Type</div>
              <button className="gd-meta-v">
                <span className="ms" style={{ color: 'var(--success-main)' }}>{g.typeIcon}</span>
                <span>{g.type}</span>
                <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>expand_more</span>
              </button>
            </div>
            <div className="gd-meta-cell">
              <div className="k">Privacy</div>
              <button className="gd-meta-v">
                <span className="ms" style={{ color: 'var(--grey-700)' }}>lock</span>
                <span>{g.privacy}</span>
                <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>expand_more</span>
              </button>
            </div>
            <div className="gd-meta-cell">
              <div className="k">When</div>
              <div className="gd-meta-v" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <span>{g.when}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Body grid ===== */}
        <div className="gd-grid">
          {/* LEFT: Progress + Key Results */}
          <div className="gd-card">
            <div className="gd-progress-head">
              <div className="lbl">Goal Progress</div>
              <div className="row items-center gap-3">
                <ProgressBar pct={g.progress} hidePct big color={g.progress >= 70 ? 'green' : g.progress >= 35 ? '' : 'amber'} />
                <div className="row items-center gap-2" style={{ flexShrink: 0 }}>
                  <ProgressRing pct={g.progress} />
                  <span className="gd-pct">{g.progress}%</span>
                </div>
              </div>
            </div>

            <div className="gd-kr-block">
              <div className="gd-kr-head">Key Results</div>
              {krs.map(kr => (
                <div key={kr.id}>
                  <div className="gd-kr-row">
                    <button className="gd-drag"><span className="ms">drag_indicator</span></button>
                    <Avatar name={kr.owner || '??'} size="sm" />
                    <div className="gd-kr-val">
                      {kr.unit === 'incomplete'
                        ? <span style={{ color: 'var(--fg-disabled)', fontStyle: 'italic' }}>Incomplete</span>
                        : <>{kr.current}{kr.unit === '%' ? '%' : ''} / {kr.target}{kr.unit === '%' ? '%' : ''}</>}
                      <span className="ms refresh">refresh</span>
                    </div>
                    <div className="gd-kr-text">{kr.text}</div>
                    <button className="btn btn-outlined btn-sm" style={{ padding: '4px 14px', borderRadius: 6 }}
                      onClick={() => setUpdateModal(true)}>Update</button>
                    <div style={{ position: 'relative' }}>
                      <button className="gd-kr-more"
                        onClick={() => setDotMenu(dotMenu === kr.id ? null : kr.id)}>
                        <span className="ms">more_vert</span>
                      </button>
                      {dotMenu === kr.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 200,
                          background: '#fff', border: '1px solid var(--grey-200)',
                          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                          minWidth: 140, padding: '4px 0',
                        }}>
                          <button
                            onClick={() => { setDotMenu(null); onUpdateGoal && onUpdateGoal(g, kr); }}
                            style={{ width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--grey-700)', fontWeight: 600 }}>
                            <span className="ms" style={{ fontSize: 17 }}>edit</span>Edit
                          </button>
                          <button
                            onClick={() => { setDotMenu(null); setKrsGD(krs.filter(k => k.id !== kr.id)); }}
                            style={{ width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error-main)', fontWeight: 600 }}>
                            <span className="ms" style={{ fontSize: 17 }}>delete</span>Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {kr.linkedProject && (
                    <div style={{ paddingLeft: 80, paddingBottom: 10, marginTop: -4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11.5, fontWeight: 600, color: 'var(--brand-blue-600)',
                        background: 'var(--brand-blue-50)', border: '1px solid var(--brand-blue-200)',
                        borderRadius: 20, padding: '3px 10px',
                      }}>
                        <span className="ms" style={{ fontSize: 13 }}>link</span>
                        {kr.linkedProject}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {showAddKR ? (
                <div style={{
                  margin: '12px 0 4px', padding: '20px 20px 16px',
                  border: '1.5px solid var(--brand-blue-300)', borderRadius: 10,
                  background: '#F8FBFF',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)', marginBottom: 12 }}>New Key Result</div>

                  <textarea
                    value={newKR.name}
                    onChange={e => setNewKR({ ...newKR, name: e.target.value })}
                    placeholder="What are you measuring?"
                    rows={2}
                    style={{
                      width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8,
                      padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                      background: '#fff',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                    onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                  />
                  <div style={{ fontSize: 12, color: 'var(--fg-disabled)', marginBottom: 14, marginTop: 4 }}>
                    {newKR.name.length} / 512 Characters
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Start</div>
                      <input type="number" value={newKR.start}
                        onChange={e => setNewKR({ ...newKR, start: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Target</div>
                      <input type="number" value={newKR.target}
                        onChange={e => setNewKR({ ...newKR, target: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Unit</div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', fontSize: 15, color: 'var(--fg-secondary)' }} className="ms">
                          {newKR.unit === '%' ? 'percent' : newKR.unit === 'days' ? 'event' : newKR.unit === 'USD' ? 'attach_money' : 'tag'}
                        </span>
                        <select value={newKR.unit} onChange={e => setNewKR({ ...newKR, unit: e.target.value })}
                          style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                          <option value="%">Percentage</option>
                          <option value="days">Days</option>
                          <option value="count">Count</option>
                          <option value="USD">USD</option>
                        </select>
                        <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', fontSize: 18, color: 'var(--fg-disabled)' }} className="ms">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Assign To</div>
                    <input
                      value={newKR.assignTo}
                      onChange={e => setNewKR({ ...newKR, assignTo: e.target.value })}
                      placeholder="Type names here to find users"
                      style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                      onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                    />
                  </div>

                  <div className="row gap-2">
                    <button
                      onClick={saveNewKR}
                      style={{ border: 'none', borderRadius: 8, background: 'var(--brand-blue-500)', padding: '8px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}>
                      Save
                    </button>
                    <button
                      onClick={() => { setShowAddKR(false); setNewKR({ name: '', start: 0, target: 100, unit: '%', assignTo: '' }); }}
                      style={{ border: 'none', borderRadius: 8, background: 'transparent', padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: 'var(--brand-blue-600)', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gd-kr-add">
                  <span>Need to track something else?</span>
                  <a style={{ cursor: 'pointer' }} onClick={() => setShowAddKR(true)}>Add Key Result</a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Tracking + due + attachments + owner + contribs */}
          <div className="col gap-3">
            <div className="gd-card">
              <div className="gd-section-head">Tracking</div>
              <TrackingChart progress={g.progress} />
              <div className="gd-legend">
                <span><span className="dot today" /> Today</span>
                <span><span className="dot start" /> Start Date</span>
                <span><span className="dot due" /> Due Date</span>
              </div>
            </div>

            <div className="gd-card row items-center between" style={{ padding: '18px 22px' }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--success-dark)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{g.daysLeft}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--grey-700)', marginTop: 6 }}>Days until due</div>
              </div>
              <a className="gd-link">Change Due Date</a>
            </div>

            <div className="gd-card">
              <div className="row items-center between" style={{ padding: '14px 20px 12px' }}>
                <div className="row items-center gap-2" style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                  <span className="ms" style={{ color: 'var(--fg-secondary)' }}>attach_file</span>Attachments
                </div>
                <button className="btn btn-outlined btn-sm" style={{ padding: '4px 14px' }}>+ Add Attachments</button>
              </div>
              <div style={{ padding: '0 20px 14px' }}>
                {g.attachments > 0 ? (
                  <div className="col gap-2">
                    <div className="gd-attachment">
                      <span className="ms" style={{ color: 'var(--brand-blue-500)', fontSize: 22 }}>description</span>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="t">Ops scaling playbook · v2.docx</div>
                        <div className="d">Shared 3 days ago · 1.2 MB</div>
                      </div>
                      <span className="ms" style={{ color: 'var(--fg-disabled)' }}>download</span>
                    </div>
                    <div className="gd-attachment">
                      <span className="ms" style={{ color: 'var(--brand-green-600)', fontSize: 22 }}>table_chart</span>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="t">FTE-leverage model · Q1 baseline.xlsx</div>
                        <div className="d">Shared 1 week ago · 410 KB</div>
                      </div>
                      <span className="ms" style={{ color: 'var(--fg-disabled)' }}>download</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--fg-disabled)', fontStyle: 'italic', padding: '8px 0' }}>No attachments yet.</div>
                )}
              </div>
            </div>

            <div className="gd-card">
              <div className="row items-center gap-2" style={{ padding: '14px 20px 10px', fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                Owner <span className="ms" style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>info</span>
              </div>
              <div style={{ padding: '0 20px 14px' }}>
                <div className="row items-center gap-3">
                  <Avatar name={g.owner.name} size="md" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-blue-600)', letterSpacing: '-0.01em' }}>{g.owner.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 1 }}>{g.owner.role}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gd-card">
              <div className="row items-center between" style={{ padding: '14px 20px 10px' }}>
                <div className="row items-center gap-2" style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                  Contributors <span className="ms" style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>info</span>
                </div>
                {canEdit && <button className="btn btn-outlined btn-sm" style={{ padding: '4px 12px' }}>+ Add</button>}
              </div>
              <div style={{ padding: '0 20px 14px' }} className="col gap-2">
                {g.contributors.map((c, i) => (
                  <div key={i} className="row items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-700)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 1 }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Progress ring SVG */
function ProgressRing({ pct = 0, size = 28, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--grey-200)" strokeWidth={stroke} fill="none" strokeDasharray="2 3" />
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--brand-blue-500)" strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" />
    </svg>
  );
}

/* Tracking chart — simple area chart */
function TrackingChart({ progress = 0 }) {
  const W = 320, H = 150, padL = 30, padR = 20, padT = 18, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // X axis: Jan '26 (start), Jul '26 (today), Jan '27 (due)
  const pts = [
    { x: 0,    y: 0 },           // start (Jan)
    { x: 0.42, y: 0 },           // mid-flat
    { x: 0.55, y: 0.18 },        // today (Jul, progress)
    { x: 1,    y: 1 },           // due (target)
  ];

  // Build SVG path: line + filled area
  const linePts = pts.map(p => `${padL + p.x * innerW},${padT + (1 - p.y) * innerH}`).join(' L');
  const linePath = 'M ' + linePts;
  const areaPath = linePath + ` L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`;

  // Today point coords
  const todayX = padL + 0.55 * innerW;
  const todayY = padT + (1 - 0.18) * innerH;
  const startX = padL;
  const dueX   = padL + innerW;

  return (
    <div style={{ padding: '12px 16px 6px', position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Y-axis lines */}
        {[0, 25, 50, 75, 100, 125].map((v, i) => {
          const y = padT + (1 - v/125) * innerH;
          return <g key={v}>
            <text x={padL - 6} y={y + 3} textAnchor="end" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>{v}</text>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="var(--grey-100)" strokeWidth="0.5" />
          </g>;
        })}
        {/* Area fill */}
        <path d={areaPath} fill="rgba(0,117,225,0.10)" />
        {/* Line */}
        <path d={linePath} stroke="var(--brand-blue-500)" strokeWidth="1.5" fill="none" />
        {/* Start marker */}
        <rect x={startX - 4} y={padT - 4} width="8" height="8" fill="var(--grey-700)" />
        <line x1={startX} y1={padT} x2={startX} y2={padT + innerH} stroke="var(--info-main)" strokeWidth="1" />
        {/* Today marker */}
        <circle cx={todayX} cy={todayY} r="4" fill="var(--brand-blue-500)" stroke="#fff" strokeWidth="1.5" />
        <line x1={todayX} y1={padT} x2={todayX} y2={padT + innerH} stroke="var(--info-main)" strokeWidth="1" />
        {/* Due marker */}
        <polygon points={`${dueX-6},${padT-2} ${dueX},${padT+6} ${dueX+6},${padT-2}`} fill="var(--error-main)" />
        <line x1={dueX} y1={padT} x2={dueX} y2={padT + innerH} stroke="var(--error-main)" strokeWidth="1" strokeDasharray="2 2" />
        {/* X labels */}
        <text x={startX} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jan '26</text>
        <text x={padL + 0.55 * innerW} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jul '26</text>
        <text x={dueX} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jan '27</text>
      </svg>
    </div>
  );
}

window.GoalDetail = GoalDetail;


/* ============================================================================
   FILE: frames/worker-reviews.jsx
   ============================================================================ */

/* Frame · Worker Reviews
   Date-wise tiles: each tile shows the reviewer (who gave the review), when,
   review type (manager / peer / client / project / self), summary, rating,
   and links to read the full review. */

const { useState: useStateWR, useEffect: useEffectWR } = React;

function WorkerReviews() {
  const Store = window.PerformanceStore;
  const [active, setActive] = useStateWR(null);
  const [selfReviewParticipantId, setSelfReviewParticipantId] = useStateWR(null);
  const [managerReviewParticipantId, setManagerReviewParticipantId] = useStateWR(null);
  const [, setVersion] = useStateWR(0);

  useEffectWR(() => {
    const pid = window.sessionStorage.getItem('payo.workerReviews.openSelf');
    if (pid) {
      window.sessionStorage.removeItem('payo.workerReviews.openSelf');
      setSelfReviewParticipantId(pid);
    }
    return Store.subscribe(() => setVersion(v => v + 1));
  }, []);

  // Live: active review cycles this worker is a participant in
  const workerId = Store.getCurrentWorkerId();
  const allParticipants = Store.getData().reviewParticipants || [];
  const myParticipations = allParticipants.filter(p => p.workerId === workerId);
  const allCycles = Store.getReviewCycles ? Store.getReviewCycles() : [];
  const activeCycleParticipations = myParticipations.map(p => {
    const cycle = allCycles.find(c => c.id === p.reviewCycleId);
    return cycle ? { participant: p, cycle } : null;
  }).filter(Boolean).filter(({ cycle }) => cycle.status !== 'closed' && cycle.status !== 'draft');

  function openSelfReview(participantId) {
    setSelfReviewParticipantId(participantId);
  }

  if (selfReviewParticipantId) {
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'Self-review']}>
        <PerfTabs variant="worker" active="reviews" />
        <WorkerSelfReview
          participantId={selfReviewParticipantId}
          onBack={() => setSelfReviewParticipantId(null)}
        />
      </Shell>
    );
  }

  if (managerReviewParticipantId) {
    const mr = Store.getManagerReview(managerReviewParticipantId);
    const mrParticipant = (Store.getData().reviewParticipants || []).find(p => p.id === managerReviewParticipantId);
    const mrCycle = mrParticipant ? allCycles.find(c => c.id === mrParticipant.reviewCycleId) : null;
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'Manager review']}>
        <PerfTabs variant="worker" active="reviews" />
        <div className="row items-center mb-4 gap-2">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setManagerReviewParticipantId(null)}>Back to reviews</Btn>
        </div>
        <PageHead
          eyebrow={mrCycle ? `${mrCycle.name} · Manager review` : 'Manager review'}
          title="Your manager's review"
          sub={mrCycle ? `Period ${mrCycle.periodStart} → ${mrCycle.periodEnd}` : ''}
          actions={<Btn variant="ghost" icon="download">Export PDF</Btn>}
        />
        {!mr ? (
          <div className="card" style={{ padding: 24 }}>
            <Callout tone="info" icon="info">
              Your manager's review has been shared but is not available in this session yet. Try refreshing the page.
            </Callout>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
            <div className="col gap-4">
              {(mr.answers || []).length > 0 && (
                <SectionCard title="Review answers" icon="rate_review">
                  <div className="col gap-3">
                    {mr.answers.map((a, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'var(--grey-50)', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{i + 1}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginTop: 2 }}>{a.question}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer provided.</em>}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
              {(mr.strengths || mr.improvementAreas || mr.nextCycleFocus || mr.finalSummary) && (
                <SectionCard title="Summary" icon="summarize">
                  <div className="col gap-3">
                    {mr.strengths && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Key strengths</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.strengths}</div>
                      </div>
                    )}
                    {mr.improvementAreas && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Development areas</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.improvementAreas}</div>
                      </div>
                    )}
                    {mr.nextCycleFocus && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Next cycle focus</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.nextCycleFocus}</div>
                      </div>
                    )}
                    {mr.finalSummary && (
                      <div style={{ background: 'var(--grey-50)', borderLeft: '3px solid var(--brand-blue-500)', borderRadius: 8, padding: '14px 18px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Final summary</div>
                        <div style={{ fontSize: 13.5, color: 'var(--grey-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{mr.finalSummary}</div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
            <div className="col gap-3">
              {mr.rating && (
                <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Overall rating</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--grey-800)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{mr.rating}</div>
                </div>
              )}
              <Callout tone="info" icon="lock">
                Private manager notes are not included in this view.
              </Callout>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  // Reviews grouped by month
  const groups = [
    {
      month: 'September 2026', label: 'Q3 cycle',
      reviews: [
        {
          id: 'r1',
          when: 'Sep 28, 2026',
          author: 'Priya Nair',  authorRole: 'Manager',
          type: 'manager', cycle: 'Q3 Performance Review',
          rating: 4.5, ratingLabel: 'Exceeds expectations',
          summary: 'Strong Q3. Led the Spain cutover with zero P0s, mentored Lina through her first migration, and built the runbook the rest of the team is now using.',
          excerpt: 'Aditi continues to operate above her role. Her work on the Spain migration set a new bar for cutover quality — the renewal that followed (3-year, $1.4M ACV) is directly attributable. She\'s ready to formalize the Lead Ops path; recommend promotion case for Q4.',
          krs: ['6 migrations · 6/6 done', '0 P0s through cutover', 'CSAT 4.4 / 4.5 target'],
        },
        {
          id: 'r2',
          when: 'Sep 22, 2026',
          author: 'Hannah Mueller', authorRole: 'Skip-level',
          type: 'manager', cycle: 'Q3 Skip-level check-in',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Career-track conversation. Aligned on Lead Ops growth path. Aditi is ready, we need to firm up scope and timeline.',
          excerpt: 'Aditi has the technical depth and operational instincts for Lead Ops. The growth area is comfort with ambiguity at the program level — fewer prescriptive playbooks, more leading through influence.',
        },
        {
          id: 'r3',
          when: 'Sep 20, 2026',
          author: 'Lina Chen', authorRole: 'Peer',
          type: 'peer', cycle: 'Q3 360°',
          rating: 5.0, ratingLabel: 'Outstanding',
          summary: 'Pairing on the migration runbook saved me a month. Aditi explains complex workflows in a way that sticks.',
          excerpt: 'When we paired on the rollback flows, Aditi pre-built the diagrams so the doc clicked on the first read. I now use her template for every new client onboarding.',
        },
        {
          id: 'r4',
          when: 'Sep 18, 2026',
          author: 'Marco Diaz', authorRole: 'Client',
          type: 'client', cycle: 'Project completion',
          rating: 5.0, ratingLabel: 'Outstanding',
          summary: 'Communication during cutover was the difference between a hard week and a smooth one.',
          excerpt: '"Aditi kept us informed every step. We never felt out of the loop, and her playbook for the cutover day was the most organized thing I\'ve seen in 12 years of payroll migrations."',
        },
      ],
    },
    {
      month: 'August 2026', label: 'Project reviews',
      reviews: [
        {
          id: 'r5',
          when: 'Aug 14, 2026',
          author: 'Priya Nair', authorRole: 'Manager',
          type: 'project', cycle: 'Italy migration retro',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Solid execution on the Italy cutover. Surfaced runbook gaps proactively — exactly what we needed before Spain.',
          excerpt: 'Aditi flagged 7 doc gaps in the runbook that would have hit us hard in Spain. Owning the fix herself.',
        },
        {
          id: 'r6',
          when: 'Aug 02, 2026',
          author: 'Aditi Sharma', authorRole: 'Self',
          type: 'self', cycle: 'Mid-cycle self-review',
          rating: 3.5, ratingLabel: 'On track',
          summary: 'Migration KR ahead of pace. Mentorship KR slightly behind — need to formalize cadence with Lina.',
          excerpt: 'Strongest stretch I\'ve had in 2 years. Areas to grow: more comfort with stakeholder pushback at the steerco level.',
        },
      ],
    },
    {
      month: 'June 2026', label: 'H1 wrap',
      reviews: [
        {
          id: 'r7',
          when: 'Jun 27, 2026',
          author: 'Priya Nair', authorRole: 'Manager',
          type: 'manager', cycle: 'H1 Performance Review',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Productive H1. Carried the payroll migration narrative end-to-end.',
          excerpt: 'Aditi grew into the senior IC role in H1. Key area for H2: lead at least one program, not just contribute.',
        },
      ],
    },
  ];

  const typeMeta = {
    manager:   { icon: 'badge',          tone: 'employee',   label: 'Manager review' },
    peer:      { icon: 'group',          tone: 'contrib',    label: 'Peer review' },
    client:    { icon: 'apartment',      tone: 'contractor', label: 'Client review' },
    project:   { icon: 'rocket_launch',  tone: 'eligible',   label: 'Project review' },
    self:      { icon: 'person',         tone: 'warning',    label: 'Self-review' },
  };

  // Drill-in: full review read view
  if (active) {
    const meta = typeMeta[active.type];
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Reviews', active.cycle]}>

        <div className="row items-center mb-4 gap-2">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setActive(null)}>Back to reviews</Btn>
        </div>

        <PageHead
          eyebrow={meta.label}
          title={active.cycle}
          sub={`${active.when} · from ${active.author}`}
          actions={<>
            <Btn variant="ghost" icon="download">Export PDF</Btn>
            <Btn variant="ghost" icon="rate_review">Attach to my self-review</Btn>
          </>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
          {/* Left: full review text */}
          <SectionCard
            title="Review"
            sub={`Written by ${active.author} · ${active.authorRole}`}
            icon="rate_review"
          >
            <div className="row items-center gap-3 mb-3">
              <Avatar name={active.author} size="lg" />
              <div className="flex-1">
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>{active.author}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{active.authorRole} · submitted {active.when}</div>
              </div>
              <Pill variant={meta.tone} icon={meta.icon} size="lg">{meta.label}</Pill>
            </div>

            <div style={{ background: 'var(--grey-50)', borderLeft: '3px solid var(--brand-blue-500)',
              borderRadius: 8, padding: '16px 20px', fontSize: 14, color: 'var(--grey-700)', lineHeight: 1.65 }}>
              {active.excerpt}
            </div>

            {active.krs && (
              <div className="mt-4">
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cited key results</div>
                <div className="col gap-2">
                  {active.krs.map((kr, i) => (
                    <div key={i} className="row items-center gap-2" style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                      <span className="ms" style={{ fontSize: 16, color: 'var(--success-main)' }}>check_circle</span>{kr}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Right: rating */}
          <div className="col gap-3">
            <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Rating</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--success-dark)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {active.rating.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--fg-secondary)', fontWeight: 600 }}> / 5</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-700)', marginTop: 8 }}>{active.ratingLabel}</div>
              <Stars value={Math.round(active.rating)} />
            </div>
            <SectionCard title="Reviewer" icon="person">
              <div className="row items-center gap-3 mb-2">
                <Avatar name={active.author} size="md" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)' }}>{active.author}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{active.authorRole}</div>
                </div>
              </div>
              <Btn variant="ghost" size="sm" icon="forum" style={{ width: '100%', justifyContent: 'center' }}>Send a thank-you</Btn>
            </SectionCard>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'Reviews']}>

      <PerfTabs variant="worker" active="my-reviews" />

      <PageHead
        eyebrow="My performance"
        title="Feedback &amp; Reviews"
        sub="Active review cycles and all reviews you've received, organized by month."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
        </>}
      />

      <div className="stats-row c-3 mb-4">
        <StatCard tone="green"  icon="task_alt"    label="Total reviews"   value="12" sub="Across all cycles" />
        <StatCard tone="blue"   icon="star"        label="Average rating"  value="4.3" sub="Last 4 cycles · trending up" />
        <StatCard tone="purple" icon="celebration" label="Outstanding"     value="3"  sub="reviews this year" />
      </div>

      {/* Active review cycles */}
      {activeCycleParticipations.length > 0 && (
        <div className="mb-4">
          <SectionCard title="Active review cycles" sub="Cycles you're participating in" icon="rate_review">
            {activeCycleParticipations.map(({ participant: p, cycle }) => {
              const selfDone = p.selfReviewStatus === 'submitted';
              const managerDone = p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared';
              const selfDue = cycle.selfReviewDueDate;
              const selfDuePast = selfDue && new Date(selfDue) < new Date();
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderTop: '1px solid var(--grey-50)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)' }}>{cycle.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                      {cycle.periodStart} → {cycle.periodEnd}
                      {selfDue && <span style={{ marginLeft: 8 }}>· Self-review due <strong style={{ color: selfDuePast && !selfDone ? 'var(--error-dark)' : 'var(--grey-700)' }}>{selfDue}</strong></span>}
                    </div>
                  </div>
                  <div className="row items-center gap-3">
                    <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Self-review</span>
                      {selfDone
                        ? <Pill variant="completed" dot>Submitted</Pill>
                        : <Pill variant={selfDuePast ? 'overdue' : 'warning'} dot>{selfDuePast ? 'Overdue' : 'Pending'}</Pill>}
                    </div>
                    <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager review</span>
                      {managerDone
                        ? <Pill variant="completed" dot>Complete</Pill>
                        : <Pill variant="draft">Pending</Pill>}
                    </div>
                  </div>
                  {!selfDone && (
                    <Btn variant="primary" size="sm" icon="edit_note" onClick={() => openSelfReview(p.id)}>
                      Fill in self-review
                    </Btn>
                  )}
                  {selfDone && (
                    <Btn variant="ghost" size="sm" icon="visibility" onClick={() => openSelfReview(p.id)}>
                      View self-review
                    </Btn>
                  )}
                  {p.managerReviewStatus === 'shared' && (
                    <Btn variant="ghost" size="sm" icon="badge" onClick={() => setManagerReviewParticipantId(p.id)}>
                      View manager review
                    </Btn>
                  )}
                </div>
              );
            })}
          </SectionCard>
        </div>
      )}

<div className="row gap-2 mb-4 items-center" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Type:</span>
        <button className="filter" style={{ background: '#fff', borderColor: 'var(--brand-blue-300)', color: 'var(--brand-blue-600)' }}>All</button>
        <button className="filter">Manager</button>
        <button className="filter">Peer</button>
        <button className="filter">Client</button>
        <button className="filter">Project</button>
        <button className="filter">Self</button>
      </div>

      {/* Date-wise tiles */}
      {groups.map(g => (
        <div key={g.month} className="mb-4">
          <div className="day-row" style={{ marginTop: 0 }}>
            <span className="label">{g.month}</span>
            <span className="date">{g.label}</span>
            <span className="count">{g.reviews.length} review{g.reviews.length > 1 ? 's' : ''}</span>
            <span className="line" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {g.reviews.map(r => {
              const meta = typeMeta[r.type];
              return (
                <button key={r.id} className="review-tile" onClick={() => setActive(r)}>
                  <div className="row items-start between mb-3">
                    <div className="row items-center gap-3">
                      <Avatar name={r.author} size="md" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>{r.author}</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 1 }}>{r.authorRole}</div>
                      </div>
                    </div>
                    <Pill variant={meta.tone} icon={meta.icon}>{meta.label}</Pill>
                  </div>
                  <div className="row items-center between mb-2">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)' }}>{r.cycle} · {r.when}</span>
                    <Stars value={Math.round(r.rating)} size="sm" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: 12 }}>
                    {r.summary}
                  </div>
                  <div className="row items-center between" style={{ paddingTop: 10, borderTop: '1px solid var(--grey-100)' }}>
                    <div className="row items-center gap-2">
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--success-dark)', fontVariantNumeric: 'tabular-nums' }}>{r.rating.toFixed(1)} / 5</span>
                      <Pill variant={r.rating >= 4.5 ? 'eligible' : r.rating >= 3.5 ? 'on-track' : 'warning'}>{r.ratingLabel}</Pill>
                    </div>
                    <span className="link-cell" style={{ fontSize: 12 }}>Read full review<span className="ms">arrow_forward</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Shell>
  );
}

window.WorkerReviews = WorkerReviews;


/* ============================================================================
   FILE: frames/client-reviews.jsx
   ============================================================================ */

/* Frame · Client Reviews (manager view)
   List of direct reports → pick a worker → see their review history and
   click "Write a review" to open a rich review-writing page. */

const { useState: useStateCR } = React;

function ClientReviews() {
  // view: 'list' | 'worker' | 'write' | 'cycle-stepper' | 'cycle-detail' | 'manager-review' | 'self-review-view'
  const [view, setView] = useStateCR('list');
  const [worker, setWorker] = useStateCR(null);
  const [activeCycleId, setActiveCycleId] = useStateCR(null);
  const [activeParticipantId, setActiveParticipantId] = useStateCR(null);
  const [selfReviewBackView, setSelfReviewBackView] = useStateCR('cycle-detail');
  const [storeVersion, setStoreVersion] = useStateCR(0);

  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  // Fetch legacy reviews for all workers so the list view shows real ratings.
  React.useEffect(() => {
    if (view === 'list') {
      window.PerformanceStore.getWorkers().forEach(w => {
        window.PerformanceStore.refreshLegacyReviews(w.id);
      });
    }
  }, [view]);

  React.useEffect(() => {
    if (window.sessionStorage.getItem('payo.reviews.openStepper') === '1') {
      window.sessionStorage.removeItem('payo.reviews.openStepper');
      setView('cycle-stepper');
    }
    const openMrParticipantId = window.sessionStorage.getItem('payo.reviews.openManagerReview');
    if (openMrParticipantId) {
      window.sessionStorage.removeItem('payo.reviews.openManagerReview');
      const participant = window.PerformanceStore.getReviewParticipantById(openMrParticipantId);
      if (participant) {
        setActiveCycleId(participant.reviewCycleId);
        setActiveParticipantId(openMrParticipantId);
        setView('manager-review');
      }
    }
  }, []);

  const WORKER_COMP = {
    'Aditi Sharma':  { amount: 72000,  currency: 'USD' },
    'Rahul Mehta':   { amount: 85000,  currency: 'USD' },
    'Priya Mehta':   { amount: 110000, currency: 'USD' },
  };

  const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];

  const team = window.PerformanceStore.getWorkers().map(w => {
    const reviews = window.PerformanceStore.getReviewsForWorker(w.id, true);
    const sorted = [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const latest = sorted[0];
    const lastRating = latest ? (Number(latest.rating) || 0) : 0;
    const lastOutcome = lastRating >= 4 ? 'Exceeds' : lastRating >= 2.5 ? 'Meets' : lastRating > 0 ? 'Below' : '—';

    // Find the most relevant active cycle participant for this worker:
    // priority: needs writing > needs sharing > all done
    const workerParts = allParticipants.filter(p => p.workerId === w.id);
    const needsWrite = workerParts.find(p =>
      p.managerReviewStatus === 'not-started' || p.managerReviewStatus === 'not_started' || p.managerReviewStatus === 'draft'
    );
    const needsShare = workerParts.find(p =>
      (p.managerReviewStatus === 'submitted') &&
      p.finalReviewStatus !== 'shared' && p.finalReviewStatus !== 'acknowledged'
    );
    const activePart = needsWrite || needsShare || null;

    return {
      id: w.id,
      name: w.name,
      role: w.role || w.title || '',
      reviewsCount: reviews.length,
      lastReview: latest?.createdAt || '—',
      lastRating,
      lastOutcome,
      pendingFor: needsWrite ? `review` : null,
      needsShare: !!needsShare,
      activeCycleId: activePart?.reviewCycleId || null,
      currentComp: WORKER_COMP[w.name] || null,
    };
  });

  // -- Start review cycle stepper
  if (view === 'cycle-stepper') {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'New review cycle']}>
        <PerfTabs active="reviews" />
        <ReviewCycleStepper
          onCancel={() => setView('list')}
          onSaved={() => setView('list')}
          onLaunched={(cycle) => { setActiveCycleId(cycle.id); setView('cycle-detail'); }}
        />
      </Shell>
    );
  }

  // -- Review cycle detail (participants list)
  if (view === 'cycle-detail' && activeCycleId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Cycle']}>
        <PerfTabs active="reviews" />
        <ReviewCycleDetail
          cycleId={activeCycleId}
          onBack={() => setView('list')}
          onOpenManagerReview={(participantId) => { setActiveParticipantId(participantId); setView('manager-review'); }}
          onViewSelfReview={(participantId) => { setSelfReviewBackView('cycle-detail'); setActiveParticipantId(participantId); setView('self-review-view'); }}
        />
      </Shell>
    );
  }

  // -- Manager review form
  if (view === 'manager-review' && activeParticipantId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Manager review']}>
        <PerfTabs active="reviews" />
        <ManagerReviewForm participantId={activeParticipantId} onBack={() => setView('cycle-detail')} />
      </Shell>
    );
  }

  // -- Read-only viewer for a worker's submitted self-review
  if (view === 'self-review-view' && activeParticipantId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Self-review']}>
        <PerfTabs active="reviews" />
        <ClientSelfReviewViewer
          participantId={activeParticipantId}
          onBack={() => setView(selfReviewBackView)}
          onWriteManagerReview={() => setView('manager-review')}
        />
      </Shell>
    );
  }

  // -- Write a Review page
  if (view === 'write' && worker) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', worker.name, 'Write a review']}>
        <PerfTabs active="reviews" />
        <ReviewEditor worker={worker} onBack={() => setView('worker')} />
      </Shell>
    );
  }

  // -- Worker history page
  if (view === 'worker' && worker) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', worker.name]}>
        <PerfTabs active="reviews" />
        <WorkerReviewHistory
          worker={worker}
          onBack={() => setView('list')}
          onWrite={() => setView('write')}
          onViewSelfReview={(participantId) => { setSelfReviewBackView('worker'); setActiveParticipantId(participantId); setView('self-review-view'); }}
        />
      </Shell>
    );
  }

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Reviews']}>
      <PerfTabs active="reviews" />

      <PageHead
        eyebrow="Performance Management"
        title="Reviews"
        sub="Run formal review cycles for employees and contractors, or write individual reviews."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="primary" icon="play_circle" onClick={() => setView('cycle-stepper')}>Start review cycle</Btn>
        </>}
      />

      {(() => {
        const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];
        const toWrite       = allParticipants.filter(p => p.managerReviewStatus === 'not-started' || p.managerReviewStatus === 'not_started' || p.managerReviewStatus === 'draft').length;
        const selfSubmitted = allParticipants.filter(p => p.selfReviewStatus === 'submitted').length;
        const fb            = (window.PerformanceStore.getData().feedback || []).length;
        const readyToShare  = allParticipants.filter(p => p.managerReviewStatus === 'submitted' && p.finalReviewStatus !== 'shared' && p.finalReviewStatus !== 'acknowledged').length;
        return (
          <div className="stats-row c-4 mb-4">
            <StatCard tone="blue"   icon="reviews"         label="Reviews to write"      value={String(toWrite)}       sub={toWrite ? 'Open the cycle below' : 'Nothing pending'} />
            <StatCard tone="green"  icon="task_alt"        label="Self-reviews submitted" value={String(selfSubmitted)} sub={`Across ${allParticipants.length} participant${allParticipants.length === 1 ? '' : 's'}`} />
            <StatCard tone="purple" icon="inbox"           label="Feedback given"        value={String(fb)}             sub={fb ? 'Across your team' : 'No feedback given yet'} />
            <StatCard tone="amber"  icon="pending_actions" label="Ready to share"        value={String(readyToShare)}   sub={readyToShare ? 'Submitted, not shared' : 'Nothing waiting'} />
          </div>
        );
      })()}

      <ReviewCyclesPanel
        onOpenCycle={(cycleId) => { setActiveCycleId(cycleId); setView('cycle-detail'); }}
        onStartCycle={() => setView('cycle-stepper')}
      />

      <SectionCard
        title="My direct reports"
        sub="Click a worker to view their review history or write a new review"
        icon="groups"
        padBody={false}
      >
        <table className="tbl">
          <thead><tr>
            <th>Worker</th>
            <th className="num">Reviews</th>
            <th>Last review</th>
            <th>Last rating</th>
            <th>Current comp</th>
            <th>Cycle status</th>
            <th />
          </tr></thead>
          <tbody>
            {team.map((t, i) => (
              <tr key={i}>
                <td>
                  <div className="worker-cell">
                    <Avatar name={t.name} size="md" />
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{t.reviewsCount}</td>
                <td>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.lastReview}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>by you</div>
                </td>
                <td>
                  <div className="row items-center gap-2">
                    <Stars value={Math.round(t.lastRating)} size="sm" />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums' }}>{t.lastRating.toFixed(1)}</span>
                    <Pill variant={t.lastOutcome === 'Exceeds' ? 'eligible' : t.lastOutcome === 'Below' ? 'needs-support' : 'on-track'}>{t.lastOutcome}</Pill>
                  </div>
                </td>
                <td>
                  {t.currentComp
                    ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>
                        {t.currentComp.currency} {t.currentComp.amount.toLocaleString()}
                      </span>
                    : <span style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>—</span>}
                </td>
                <td>
                  {t.pendingFor
                    ? <Pill variant="warning" icon="pending_actions">Review pending</Pill>
                    : t.needsShare
                      ? <Pill variant="active" icon="send">Submitted · not shared</Pill>
                      : <Pill variant="completed" dot>Up to date</Pill>}
                </td>
                <td className="actions-cell">
                  <Btn variant="ghost" size="sm" icon="history" onClick={() => { setWorker(t); setView('worker'); }}>History</Btn>
                  {t.pendingFor && (
                    <Btn variant="primary" size="sm" icon="edit"
                      onClick={() => { setWorker(t); setView('write'); }}>Write a review</Btn>
                  )}
                  {t.needsShare && t.activeCycleId && (
                    <Btn variant="outlined" size="sm" icon="open_in_new"
                      onClick={() => { setActiveCycleId(t.activeCycleId); setView('cycle-detail'); }}>
                      Open cycle
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <ReviewCompensationConfig />

    </Shell>
  );
}

/* ---------- Compensation Revision Config (used on 1:1 Meetings page) ---------- */
function CompensationConfigPanel() {
  const STORAGE_KEY = 'payo.comp.config';
  const DEFAULT_CONFIG = [
    { id: 1, minScore: 0, maxScore: 1,    revisionType: 'no_change',    revisionValue: 0,    currency: 'USD', label: 'No revision' },
    { id: 2, minScore: 1, maxScore: 2,    revisionType: 'fixed_amount', revisionValue: 200,  currency: 'USD', label: '+200 USD' },
    { id: 3, minScore: 2, maxScore: 4,    revisionType: 'fixed_amount', revisionValue: 500,  currency: 'USD', label: '+500 USD' },
    { id: 4, minScore: 4, maxScore: null, revisionType: 'fixed_amount', revisionValue: 1000, currency: 'USD', label: '+1000 USD' },
  ];

  function loadConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_CONFIG; }
    catch (e) { return DEFAULT_CONFIG; }
  }

  const [rows, setRows] = useStateCR(loadConfig);
  const [editingId, setEditingId] = useStateCR(null);
  const [draft, setDraft] = useStateCR(null);
  const [saved, setSaved] = useStateCR(false);
  const [collapsed, setCollapsed] = useStateCR(false);
  const nextId = useStateCR(100)[0];

  function startEdit(row) {
    setEditingId(row.id);
    setDraft({ ...row });
  }
  function cancelEdit() { setEditingId(null); setDraft(null); }
  function saveEdit() {
    setRows(prev => prev.map(r => r.id === editingId ? { ...draft } : r));
    setEditingId(null); setDraft(null);
  }
  function deleteRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
    if (editingId === id) { setEditingId(null); setDraft(null); }
  }
  function addRow() {
    const newRow = { id: Date.now(), minScore: 0, maxScore: 1, revisionType: 'percentage', revisionValue: 0, currency: 'USD', label: '' };
    setRows(prev => [...prev, newRow]);
    setEditingId(newRow.id);
    setDraft({ ...newRow });
  }
  function saveConfig() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const TYPE_LABELS = { no_change: 'No change', fixed_amount: 'Fixed amount', percentage: 'Percentage', manual_review: 'Manual review' };

  return (
    <div>
      {/* Section header — same style as Today / Past sessions on meetings page */}
      <div className="day-row">
        <span className="label">Review Compensation</span>
        <span className="date">Score-based revision rules</span>
        <span className="count">{rows.length} range{rows.length !== 1 ? 's' : ''}</span>
        <span className="line" />
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          <Btn variant="ghost" size="sm" icon="add" onClick={addRow}>Add range</Btn>
          <Btn variant={saved ? 'ghost' : 'outlined'} size="sm" icon={saved ? 'check' : 'save'} onClick={saveConfig}>
            {saved ? 'Saved!' : 'Save config'}
          </Btn>
        </div>
      </div>

      <div className="tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Score range</th>
              <th>Revision type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Label</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--fg-secondary)', fontSize: 13, padding: '16px 20px' }}>
                No ranges defined. Click <strong>Add range</strong> above.
              </td></tr>
            )}
            {rows.map(row => {
              const isEditing = editingId === row.id;
              const d = isEditing ? draft : row;
              const scoreLabel = d.maxScore === null ? `${d.minScore}+` : `${d.minScore} – ${d.maxScore}`;
              return (
                <tr key={row.id} style={{ background: isEditing ? 'var(--grey-50)' : 'transparent' }}>
                  <td>
                    {isEditing ? (
                      <div className="row gap-1 items-center">
                        <input type="number" value={d.minScore} min={0} step={0.5}
                          style={{ width: 48, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                          onChange={e => setDraft(p => ({ ...p, minScore: Number(e.target.value) }))} />
                        <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>–</span>
                        <input type="number" value={d.maxScore ?? ''} min={0} step={0.5} placeholder="∞"
                          style={{ width: 48, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                          onChange={e => setDraft(p => ({ ...p, maxScore: e.target.value === '' ? null : Number(e.target.value) }))} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>{scoreLabel}</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select value={d.revisionType} onChange={e => setDraft(p => ({ ...p, revisionType: e.target.value }))}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
                        <option value="no_change">No change</option>
                        <option value="fixed_amount">Fixed amount</option>
                        <option value="percentage">Percentage</option>
                        <option value="manual_review">Manual review</option>
                      </select>
                    ) : (
                      <Pill variant={d.revisionType === 'no_change' ? 'draft' : d.revisionType === 'manual_review' ? 'warning' : 'on-track'} size="sm">
                        {TYPE_LABELS[d.revisionType] || d.revisionType}
                      </Pill>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="number" value={d.revisionValue ?? ''} min={0}
                        disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review'}
                        style={{ width: 80, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12,
                          opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review') ? 0.4 : 1 }}
                        onChange={e => setDraft(p => ({ ...p, revisionValue: Number(e.target.value) }))} />
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                        {d.revisionType === 'no_change' ? '—'
                          : d.revisionType === 'manual_review' ? 'Manual'
                          : d.revisionType === 'percentage' ? `${d.revisionValue}%`
                          : `+${d.revisionValue}`}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select value={d.currency} onChange={e => setDraft(p => ({ ...p, currency: e.target.value }))}
                        disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage'}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: 'inherit', background: '#fff',
                          opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage') ? 0.4 : 1 }}>
                        {['USD','EUR','GBP','INR','SGD'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                        {d.revisionType === 'percentage' || d.revisionType === 'no_change' ? '—' : (d.currency || '—')}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="text" value={d.label} placeholder="e.g. +500 USD"
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                        onChange={e => setDraft(p => ({ ...p, label: e.target.value }))} />
                    ) : (
                      <span style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{d.label || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    {isEditing ? (
                      <>
                        <Btn variant="primary" size="sm" icon="check" onClick={saveEdit}>OK</Btn>
                        <Btn variant="ghost" size="sm" icon="close" onClick={cancelEdit} />
                      </>
                    ) : (
                      <>
                        <Btn variant="ghost" size="sm" icon="edit" onClick={() => startEdit(row)} />
                        <Btn variant="ghost" size="sm" icon="delete" onClick={() => deleteRow(row.id)} style={{ color: 'var(--error-main)' }} />
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Worker review history (manager view) ---------- */
function WorkerReviewHistory({ worker, onBack, onWrite, onViewSelfReview }) {
  const [storeVersion, setStoreVersionWRH] = useStateCR(0);
  const [reviewTab, setReviewTab] = useStateCR('manager');
  const [selectedReview, setSelectedReview] = useStateCR(null);
  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersionWRH(v => v + 1)), []);
  React.useEffect(() => {
    window.PerformanceStore.refreshLegacyReviews(worker.id);
  }, [worker.id]);

  const storedReviews = window.PerformanceStore.getReviewsForWorker(worker.id, true);
  const history = [];

  // Gather self reviews for this worker across all cycles
  const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];
  const selfReviewEntries = allParticipants
    .filter(p => p.workerId === worker.id)
    .map(p => ({
      participant: p,
      cycle: window.PerformanceStore.getReviewCycleById(p.reviewCycleId),
      sr: window.PerformanceStore.getSelfReview(p.id),
    }))
    .filter(e => e.cycle && e.sr)
    .sort((a, b) => new Date(b.sr.submittedAt || b.sr.updatedAt || 0) - new Date(a.sr.submittedAt || a.sr.updatedAt || 0));

  // Read-only review detail view
  if (selectedReview) {
    const r = selectedReview;
    return (
      <>
        <div className="row items-center between mb-4">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setSelectedReview(null)}>Back to {worker.name}'s history</Btn>
          <div className="row gap-2">
            <Pill variant={r.outcome === 'Shared' ? 'eligible' : 'warning'} dot>{r.outcome}</Pill>
          </div>
        </div>
        <PageHead
          eyebrow={`${r.cycle} · Manager review`}
          title={`Review for ${worker.name}`}
          sub={`${worker.role} · ${r.when || '—'} · written by ${r.author}`}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
          <div className="col gap-4">
            <SectionCard title="Performance comments" icon="edit_note">
              <div style={{ fontSize: 13.5, color: 'var(--grey-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {r.summary || <em style={{ color: 'var(--fg-disabled)' }}>No comments recorded.</em>}
              </div>
            </SectionCard>
          </div>
          <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
            <SectionCard title="Overall rating" icon="star">
              <div className="col items-center" style={{ textAlign: 'center', padding: '8px 0' }}>
                <Stars value={Math.round(r.rating)} size="lg" />
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 8 }}>
                  {r.rating.toFixed(1)} / 5
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Review meta" icon="info">
              <div className="col gap-2" style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>event</span>
                  <span>{r.when || '—'}</span>
                </div>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>person</span>
                  <span>Written by {r.author}</span>
                </div>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>layers</span>
                  <span>{r.cycle}</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </>
    );
  }

  const SegToggle = () => (
    <div className="row" style={{ background: 'var(--grey-100)', borderRadius: 8, padding: 3, gap: 2 }}>
      {[{ key: 'manager', label: 'Manager reviews', icon: 'badge' }, { key: 'self', label: 'Self reviews', icon: 'person' }].map(t => (
        <button key={t.key} onClick={() => setReviewTab(t.key)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: reviewTab === t.key ? '#fff' : 'transparent',
          fontWeight: 700, fontSize: 12.5,
          color: reviewTab === t.key ? 'var(--grey-800)' : 'var(--fg-secondary)',
          boxShadow: reviewTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s',
        }}>
          <span className="ms" style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="row items-center mb-4 gap-2">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to team</Btn>
      </div>

      <PageHead
        eyebrow="Review history"
        title={worker.name}
        sub={`${worker.role} · ${history.length} reviews on record · last reviewed ${worker.lastReview}`}
        actions={<>
          <Btn variant="ghost" icon="event">Schedule 1:1</Btn>
          <Btn variant="ghost" icon="forum">Give feedback</Btn>
          <Btn variant="primary" icon="edit" onClick={onWrite}>Write a review</Btn>
        </>}
      />

      <div className="stats-row c-3 mb-4">
        <StatCard tone="blue"   icon="star"        label="Average rating · 12mo" value={worker.lastRating ? worker.lastRating.toFixed(1) : '—'} sub={worker.lastOutcome && worker.lastOutcome !== '—' ? `Last cycle: ${worker.lastOutcome}` : 'No reviews yet'} />
        <StatCard tone="green"  icon="trending_up" label="Trend"                  value="—"     sub="Needs ≥ 2 reviews" />
        <StatCard tone="purple" icon="task_alt"    label="Reviews on record"      value={String(storedReviews.length + history.length)} sub="Including shared cycle reviews" />
      </div>

      <SectionCard
        title={reviewTab === 'manager' ? 'Manager reviews' : 'Self reviews'}
        sub={reviewTab === 'manager' ? 'Across cycles and types' : `${selfReviewEntries.length} self-review${selfReviewEntries.length === 1 ? '' : 's'} across cycles`}
        icon={reviewTab === 'manager' ? 'history' : 'person'}
        action={<SegToggle />}
        padBody={false}
      >
        {reviewTab === 'manager' && (
          <>
            {[...storedReviews.map(r => ({
              id: r.id,
              when: r.createdAt,
              cycle: r.title,
              type: 'Manager',
              author: 'You',
              rating: Number(r.rating) || 0,
              outcome: r.visibleToWorker ? 'Shared' : 'Draft',
              summary: r.comments || 'Review saved without comments yet.',
              storeReview: r,
            })), ...history].map((h, i, arr) => (
              <div key={h.id} style={{ padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--grey-50)' : 'none',
                display: 'grid', gridTemplateColumns: '140px 1fr 200px auto', gap: 18, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)' }}>{h.when}</div>
                  <Pill variant={h.type === 'Project' ? 'contractor' : 'employee'} icon={h.type === 'Project' ? 'rocket_launch' : 'reviews'}>{h.type}</Pill>
                </div>
                <div>
                  <div className="row items-center gap-2 mb-2">
                    <Avatar name={h.author} size="xs" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-700)' }}>{h.author === 'You' ? 'You' : h.author}</span>
                    <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {h.cycle}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.5 }}>{h.summary}</div>
                </div>
                <div className="row items-center gap-2">
                  <Stars value={Math.round(h.rating)} size="sm" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums' }}>{h.rating.toFixed(1)}</span>
                  <Pill variant={h.outcome === 'Exceeds' || h.outcome === 'Shared' ? 'eligible' : h.outcome === 'Draft' ? 'warning' : 'on-track'}>{h.outcome}</Pill>
                </div>
                {h.storeReview && !h.storeReview.visibleToWorker
                  ? <Btn variant="primary" size="sm" icon="visibility" onClick={() => window.PerformanceStore.shareReview(h.id)}>Share</Btn>
                  : <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setSelectedReview(h)}>View</Btn>}
              </div>
            ))}
            {storedReviews.length === 0 && history.length === 0 && (
              <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No manager reviews on record yet.</div>
            )}
          </>
        )}

        {reviewTab === 'self' && (
          <>
            {selfReviewEntries.length === 0 && (
              <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No self-reviews found for this worker.</div>
            )}
            {selfReviewEntries.map(({ participant: p, cycle, sr }, i) => {
              const dateStr = sr.submittedAt
                ? new Date(sr.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (sr.updatedAt ? new Date(sr.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
              const answeredCount = (sr.answers || []).filter(a => a.answer?.trim()).length;
              const totalCount = (sr.answers || []).length;
              const preview = (sr.answers || []).find(a => a.answer?.trim())?.answer || '';
              return (
                <div key={p.id} style={{
                  padding: '16px 20px',
                  borderBottom: i < selfReviewEntries.length - 1 ? '1px solid var(--grey-50)' : 'none',
                  display: 'grid', gridTemplateColumns: '140px 1fr 160px auto', gap: 18, alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{dateStr}</div>
                    <Pill variant="employee" icon="person" size="sm" style={{ marginTop: 4 }}>Self review</Pill>
                  </div>
                  <div>
                    <div className="row items-center gap-2 mb-1">
                      <Avatar name={worker.name} size="xs" />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-700)' }}>{worker.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {cycle.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 4 }}>
                      {answeredCount}/{totalCount} questions answered
                    </div>
                    {preview && (
                      <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {preview}
                      </div>
                    )}
                  </div>
                  <div>
                    {sr.status === 'submitted'
                      ? <Pill variant="completed" dot>Submitted</Pill>
                      : <Pill variant="warning" dot>Draft</Pill>}
                  </div>
                  <Btn variant="ghost" size="sm" icon="visibility"
                    onClick={() => onViewSelfReview && onViewSelfReview(p.id)}>View</Btn>
                </div>
              );
            })}
          </>
        )}
      </SectionCard>
    </>
  );
}

/* ---------- Review editor (Write a review page) ---------- */
function ReviewEditor({ worker, onBack }) {
  const [rating, setRating] = useStateCR(4);
  const [outcome, setOutcome] = useStateCR('exceeds');
  const [comments, setComments] = useStateCR(`${worker.name.split(' ')[0]} had an outstanding quarter. She owned the Spain cutover end-to-end and delivered with zero P0 incidents.`);

  async function saveReview(shareNow = false, status = 'submitted') {
    const review = await window.PerformanceStore.createReview({
      workerId: worker.id,
      title: 'Q3 Performance Review',
      period: 'Q3 2026',
      rating,
      comments,
      status: shareNow ? 'shared' : status,
      visibleToWorker: shareNow,
      linkedGoalIds: window.PerformanceStore.getGoalsForWorker(worker.id).map(g => g.id),
    });
    if (shareNow) await window.PerformanceStore.shareReview(review.id);
    onBack();
  }

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to {worker.name}'s history</Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={() => saveReview(false, 'draft')}>Save draft</Btn>
          <Btn variant="outlined" icon="send" onClick={() => saveReview(false)}>Submit review</Btn>
          <Btn variant="primary" icon="visibility" onClick={() => saveReview(true)}>Submit & share</Btn>
        </div>
      </div>

      <PageHead
        eyebrow="Q3 Performance Review · Manager review"
        title={`Write a review for ${worker.name}`}
        sub={`${worker.role} · cycle due Oct 15, 2026 · auto-saves as you type`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)', gap: 16 }}>
        {/* LEFT: the form */}
        <div className="col gap-4">
          {/* Reviewee panel */}
          <SectionCard title="Reviewing" icon="person">
            <div className="row items-center gap-3">
              <Avatar name={worker.name} size="lg" />
              <div className="flex-1">
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>{worker.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>{worker.role} · {worker.reviewsCount} prior reviews</div>
              </div>
              <div className="col gap-1" style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last review</span>
                <div className="row items-center gap-2">
                  <Stars value={Math.round(worker.lastRating)} size="sm" />
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{worker.lastRating.toFixed(1)} · {worker.lastOutcome}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Question 1: Overall comments */}
          <SectionCard title="1 · Overall performance this cycle" sub="What did they do well? Where did they grow?" icon="edit_note">
            <div className="re-textarea">
              <div className="re-toolbar">
                <button className="tb-btn"><span className="ms">format_bold</span></button>
                <button className="tb-btn"><span className="ms">format_italic</span></button>
                <button className="tb-btn"><span className="ms">format_underlined</span></button>
                <span className="tb-sep" />
                <button className="tb-btn"><span className="ms">format_list_bulleted</span></button>
                <button className="tb-btn"><span className="ms">format_list_numbered</span></button>
                <span className="tb-sep" />
                <button className="tb-btn"><span className="ms">link</span></button>
                <button className="tb-btn"><span className="ms">alternate_email</span></button>
                <span className="tb-right">
                  <button className="tb-btn" style={{ color: 'var(--brand-blue-500)' }}>
                    <span className="ms">spellcheck</span>
                  </button>
                </span>
              </div>
              <div className="re-body" contentEditable suppressContentEditableWarning onInput={(e) => setComments(e.currentTarget.innerText)}>
                {worker.name.split(' ')[0]} had an outstanding quarter. She owned the Spain cutover end-to-end and delivered with zero P0 incidents — a first for our migration program. The runbook she built on the back of the Italy retro is now the team standard.
                <br /><br />
                Growth area: her instinct is to absorb scope rather than delegate. As she moves toward the Lead Ops path, the next step is letting Lina own the playbook and stepping into the orchestration role.
              </div>
              <div className="re-footer">
                <span className="char-count">487 / 4000 characters</span>
                <span className="saved-i"><span className="ms">check_circle</span>Saved Just Now</span>
              </div>
            </div>
          </SectionCard>

          {/* Question 2: Goals & key results assessment */}
          <SectionCard title="2 · Goal & key-result assessment" sub="Pulled in from People Goals — adjust outcomes per KR" icon="flag">
            <div className="col gap-2">
              {[
                { kr: 'Migrate 6 anchor customers', met: 'Achieved', tone: 'eligible' },
                { kr: 'Zero P0 incidents during migration', met: 'Achieved', tone: 'eligible' },
                { kr: 'CSAT > 4.5 post-migration', met: 'Partially met', tone: 'on-track' },
              ].map((r, i) => (
                <div key={i} className="row items-center gap-3" style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 30 }}>KR{i+1}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--grey-700)' }}>{r.kr}</span>
                  <Pill variant={r.tone} dot>{r.met}</Pill>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Question 3: Development feedback */}
          <SectionCard title="3 · Development feedback" sub="What should they focus on next cycle?" icon="trending_up">
            <div className="re-textarea">
              <div className="re-body" contentEditable suppressContentEditableWarning data-placeholder="Be specific. Reference projects, OKRs, or moments.">
                <em style={{ color: 'var(--fg-disabled)' }}>Add development feedback for next cycle…</em>
              </div>
              <div className="re-footer">
                <span className="char-count">0 / 4000 characters</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: rating + meta panel */}
        <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          <SectionCard title="Overall rating" icon="star">
            <div className="col items-center" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="stars lg interactive" style={{ marginBottom: 12, gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className={`ms ${n <= rating ? 'on' : ''}`}
                    onClick={() => setRating(n)} style={{ cursor: 'pointer' }}>star</span>
                ))}
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{rating}.0 / 5</div>
            </div>

            <div className="mt-4">
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Outcome</div>
              <div className="col gap-2">
                {[
                  { v: 'exceeds', label: 'Exceeds expectations', tone: 'eligible' },
                  { v: 'meets',   label: 'Meets expectations',   tone: 'on-track' },
                  { v: 'support', label: 'Needs support',         tone: 'needs-support' },
                ].map(o => (
                  <label key={o.v} className="re-outcome">
                    <input type="radio" name="outcome" checked={outcome === o.v} onChange={() => setOutcome(o.v)} />
                    <span className={`re-radio ${outcome === o.v ? 'on' : ''}`}>
                      {outcome === o.v && <span className="ms">check</span>}
                    </span>
                    <Pill variant={o.tone} dot>{o.label}</Pill>
                  </label>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Context for this review" icon="info">
            <div className="col gap-2" style={{ fontSize: 12.5 }}>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>flag</span>3 active OKRs · avg 78% progress</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>rocket_launch</span>4 projects completed this cycle</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>event</span>11 1:1s in the cycle</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>forum</span>9 pieces of feedback received</div>
            </div>
            <Btn variant="text" size="sm" icon="open_in_new" style={{ marginTop: 10, padding: '4px 0' }}>Open full profile</Btn>
          </SectionCard>

          <Callout tone="info" icon="spellcheck">
            <strong>Review Assistant</strong> will scan your draft for vague language and bias before submission.
          </Callout>
        </div>
      </div>
    </>
  );
}

/* ---------- Review cycles panel (list on main reviews page) ---------- */
function ReviewCyclesPanel({ onOpenCycle, onStartCycle }) {
  const cycles = window.PerformanceStore.getReviewCycles();
  return (
    <SectionCard
      title="Review cycles"
      sub={cycles.length ? `${cycles.length} cycle${cycles.length === 1 ? '' : 's'} on record` : 'No cycles yet — start one to kick off reviews'}
      icon="event_repeat"
      action={<Btn variant="outlined" size="sm" icon="play_circle" onClick={onStartCycle}>Start review cycle</Btn>}
      padBody={false}
      style={{ marginBottom: 16 }}
    >
      {cycles.length === 0 && (
        <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
          No review cycles yet. Click <strong>Start review cycle</strong> above to launch your first one.
        </div>
      )}
      {cycles.map(c => {
        const participants = window.PerformanceStore.getReviewParticipants(c.id);
        const selfSubmitted = participants.filter(p => p.selfReviewStatus === 'submitted').length;
        const managerSubmitted = participants.filter(p => p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared').length;
        const shared = participants.filter(p => p.finalReviewStatus === 'shared' || p.finalReviewStatus === 'acknowledged').length;
        const participantLabel = c.participantType === 'employees' ? 'Employees'
          : c.participantType === 'contractors' ? 'Contractors' : 'Employees + Contractors';
        return (
          <div key={c.id} onClick={() => onOpenCycle(c.id)} style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) 130px 110px minmax(0, 1.2fr) 90px',
            gap: 16, alignItems: 'center',
            padding: '14px 22px', borderTop: '1px solid var(--grey-50)', cursor: 'pointer',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--grey-800)' }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                {c.periodStart} → {c.periodEnd} · purpose: {c.purpose || '—'}
              </div>
            </div>
            <Pill variant={c.status === 'active' ? 'active' : c.status === 'draft' ? 'draft' : 'completed'} dot>{c.status}</Pill>
            <Pill variant={c.participantType === 'contractors' ? 'contractor' : 'employee'} icon="groups" size="sm">{participantLabel}</Pill>
            <div className="row gap-3 items-center" style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 600 }}>
              <span title="Participants"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>group</span>{participants.length}</span>
              <span title="Self-reviews submitted"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>person</span>{selfSubmitted}/{participants.length}</span>
              <span title="Manager reviews submitted"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>badge</span>{managerSubmitted}/{participants.length}</span>
              <span title="Shared with worker"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>visibility</span>{shared}/{participants.length}</span>
            </div>
            <Btn variant="ghost" size="sm" iconTrailing="arrow_forward">Open</Btn>
          </div>
        );
      })}
    </SectionCard>
  );
}

/* ---------- Review cycle detail (participants table) ---------- */
function ReviewCycleDetail({ cycleId, onBack, onOpenManagerReview, onViewSelfReview }) {
  const [storeVersion, setStoreVersion] = useStateCR(0);
  const [compRevisionDone, setCompRevisionDone] = useStateCR({}); // participantId → true
  const [compToast, setCompToast] = useStateCR(null); // { name, label }
  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  function handleReviseComp(p, w) {
    const label = w?.workerType === 'contractor' ? 'Rate Revision' : 'Compensation Revision';
    setCompRevisionDone(prev => ({ ...prev, [p.id]: true }));
    setCompToast({ name: w?.name || 'Worker', label });
    setTimeout(() => setCompToast(null), 4000);
  };

  const cycle = window.PerformanceStore.getReviewCycleById(cycleId);
  if (!cycle) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to reviews</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>Cycle not found.</div>
      </div>
    );
  }
  const participants = window.PerformanceStore.getReviewParticipants(cycleId);
  const typeLabel = window.PerformanceStore.REVIEW_TYPE_OPTIONS.find(o => o.value === cycle.type)?.label || cycle.type;
  const participantLabel = cycle.participantType === 'employees' ? 'Employees'
    : cycle.participantType === 'contractors' ? 'Contractors' : 'Employees + Contractors';

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to reviews</Btn>
        <div className="row gap-2">
          <Pill variant={cycle.status === 'active' ? 'active' : 'draft'} dot>{cycle.status}</Pill>
          <Pill variant="employee" icon="groups">{participantLabel}</Pill>
        </div>
      </div>

      <PageHead
        eyebrow={`${typeLabel} · ${cycle.periodStart} → ${cycle.periodEnd}`}
        title={cycle.name}
        sub={`Self-review due ${cycle.selfReviewDueDate || '—'} · Manager review due ${cycle.managerReviewDueDate || '—'} · Final sharing ${cycle.finalSharingDate || '—'}`}
      />

      {compToast && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, #E8F7EF 0%, #F6FFF9 100%)',
          border: '1px solid var(--brand-green-200)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 16,
        }}>
          <span className="ms" style={{ fontSize: 22, color: 'var(--success-main)' }}>check_circle</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--success-dark)' }}>
              {compToast.label} initiated for {compToast.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>
              The revision has been recorded and is pending approval.
            </div>
          </div>
        </div>
      )}

      <SectionCard
        title="Participants"
        sub={`${participants.length} people in this cycle`}
        icon="checklist"
        padBody={false}
      >
        {participants.length === 0 && (
          <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No participants yet.</div>
        )}
        {participants.length > 0 && (
          <table className="tbl">
            <thead><tr>
              <th>Worker</th>
              <th>Type</th>
              <th>Self-review</th>
              <th>Manager review</th>
              <th>Final review</th>
              <th />
            </tr></thead>
            <tbody>
              {participants.map(p => {
                const w = window.PerformanceStore.workerById(p.workerId);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="worker-cell">
                        <Avatar name={w?.name || ''} size="sm" />
                        <div>
                          <div className="name">{w?.name}</div>
                          <div className="role">{w?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Pill variant={w?.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w?.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                        {w?.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                      </Pill>
                    </td>
                    <td><StatusPill kind="self"    value={p.selfReviewStatus} /></td>
                    <td><StatusPill kind="manager" value={p.managerReviewStatus} /></td>
                    <td><StatusPill kind="final"   value={p.finalReviewStatus} /></td>
                    <td className="actions-cell">
                      {p.selfReviewStatus === 'submitted' && (
                        <Btn
                          variant="ghost"
                          size="sm"
                          icon="visibility"
                          onClick={() => onViewSelfReview && onViewSelfReview(p.id)}
                        >View self-review</Btn>
                      )}
                      <Btn
                        variant={p.selfReviewStatus === 'submitted' && p.managerReviewStatus === 'not-started' ? 'primary'
                          : p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'outlined'
                          : p.managerReviewStatus === 'draft' ? 'outlined'
                          : 'ghost'}
                        size="sm"
                        icon={p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'visibility' : 'edit'}
                        onClick={() => onOpenManagerReview(p.id)}
                      >
                        {p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'View Review'
                          : p.managerReviewStatus === 'draft' ? 'Continue Manager Review'
                          : p.selfReviewStatus === 'submitted' ? 'Start Manager Review'
                          : 'Write Manager Review'}
                      </Btn>
                      {(p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared') && (
                        compRevisionDone[p.id]
                          ? <Btn variant="ghost" size="sm" icon="check_circle" style={{ color: 'var(--success-main)', cursor: 'default' }}>
                              {w?.workerType === 'contractor' ? 'Rate Revision Started' : 'Comp Revision Started'}
                            </Btn>
                          : <Btn variant="outlined" size="sm" icon="payments"
                              onClick={() => handleReviseComp(p, w)}>
                              {w?.workerType === 'contractor' ? 'Revise Rate' : 'Revise Compensation'}
                            </Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>
    </>
  );
}

function StatusPill({ kind, value }) {
  if (kind === 'self') {
    if (value === 'submitted') return <Pill variant="completed" dot>Self Review Submitted</Pill>;
    if (value === 'draft')     return <Pill variant="warning"   dot>Self Review · Draft</Pill>;
    return <Pill variant="draft">Self Review · Not started</Pill>;
  }
  if (kind === 'manager') {
    if (value === 'submitted') return <Pill variant="completed" dot>Manager Review Submitted</Pill>;
    if (value === 'shared')    return <Pill variant="completed" icon="visibility">Shared</Pill>;
    if (value === 'draft')     return <Pill variant="warning"   dot>Manager Review · Draft</Pill>;
    return <Pill variant="draft">Manager Review · Not started</Pill>;
  }
  if (kind === 'final') {
    if (value === 'shared')        return <Pill variant="completed" icon="visibility">Shared</Pill>;
    if (value === 'acknowledged')  return <Pill variant="eligible" icon="check">Acknowledged</Pill>;
    return <Pill variant="draft">Not shared</Pill>;
  }
  return null;
}

/* ---------- Read-only viewer for a worker's submitted self-review ---------- */
function ClientSelfReviewViewer({ participantId, onBack, onWriteManagerReview }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateCR(0);
  React.useEffect(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const self = participant ? Store.getSelfReview(participantId) : null;
  const submitted = self?.status === 'submitted';

  if (!participant || !cycle || !self) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>Self-review not found.</div>
      </div>
    );
  }

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div className="row gap-2">
          {submitted
            ? <Pill variant="completed" dot>Submitted{self.submittedAt ? ` · ${new Date(self.submittedAt).toLocaleDateString()}` : ''}</Pill>
            : <Pill variant="warning" dot>Draft · not yet submitted</Pill>}
          <Btn variant="primary" icon="edit" onClick={onWriteManagerReview}>Write manager review</Btn>
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Self-review`}
        title={`${worker?.name || 'Worker'}'s self-review`}
        sub={`${worker?.role || ''} · ${worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'} · period ${cycle.periodStart} → ${cycle.periodEnd}`}
      />

      {!submitted && (
        <Callout tone="warning" icon="schedule">
          This worker has saved a draft but hasn't submitted yet. You're viewing their in-progress answers.
        </Callout>
      )}

      <div className="col gap-3" style={{ marginTop: 16 }}>
        {self.answers.length === 0 && (
          <div className="card" style={{ padding: 18, fontSize: 13, color: 'var(--fg-secondary)' }}>
            No answers recorded yet.
          </div>
        )}
        {self.answers.map((a, i) => (
          <SectionCard key={i} title={`${i + 1} · ${a.question}`} icon="person">
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer provided.</em>}
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}

/* ── Review Compensation Config ─────────────────────────────────────────── */
const COMP_CONFIG_KEY = 'payo.compensationRules.v2';

const COMP_DEFAULTS = [
  { id: 1, minScore: 0, maxScore: 1,    revisionType: 'no_change',  revisionValue: 0,  currency: 'USD', label: 'No hike' },
  { id: 2, minScore: 1, maxScore: 2,    revisionType: 'percentage', revisionValue: 5,  currency: 'USD', label: '+5% hike' },
  { id: 3, minScore: 2, maxScore: 4,    revisionType: 'percentage', revisionValue: 10, currency: 'USD', label: '+10% hike' },
  { id: 4, minScore: 4, maxScore: null, revisionType: 'percentage', revisionValue: 15, currency: 'USD', label: '+15% hike' },
];

function loadCompConfig() {
  try { return JSON.parse(localStorage.getItem(COMP_CONFIG_KEY)) || COMP_DEFAULTS; }
  catch (e) { return COMP_DEFAULTS; }
}
function saveCompConfig(rows) {
  try { localStorage.setItem(COMP_CONFIG_KEY, JSON.stringify(rows)); } catch (e) {}
}

function validateRanges(rows) {
  const errors = {};
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.maxScore !== null && r.minScore >= r.maxScore) {
      errors[r.id] = 'Min must be less than max';
    }
    if ((r.revisionType === 'fixed_amount' || r.revisionType === 'percentage') && !r.revisionValue && r.revisionValue !== 0) {
      errors[r.id] = 'Value required';
    }
    // overlap check
    for (let j = 0; j < rows.length; j++) {
      if (i === j) continue;
      const s = rows[j];
      const aMax = r.maxScore === null ? Infinity : r.maxScore;
      const bMax = s.maxScore === null ? Infinity : s.maxScore;
      if (r.minScore < bMax && aMax > s.minScore) {
        errors[r.id] = errors[r.id] || 'Overlaps with another range';
      }
    }
  }
  const openEnded = rows.filter(r => r.maxScore === null);
  if (openEnded.length > 1) {
    openEnded.forEach(r => { errors[r.id] = 'Only one open-ended range allowed'; });
  }
  return errors;
}

function ReviewCompensationConfig() {
  const [rows, setRows] = useStateCR(loadCompConfig);
  const [editId, setEditId] = useStateCR(null);
  const [draft, setDraft] = useStateCR({});
  const [saved, setSaved] = useStateCR(false);
  const [errors, setErrors] = useStateCR({});

  const TYPE_LABELS = {
    no_change: 'No change',
    fixed_amount: 'Fixed amount',
    percentage: 'Percentage',
    manual_review: 'Manual review',
  };

  function startEdit(row) {
    setEditId(row.id);
    setDraft({ ...row });
    setErrors({});
  }

  function cancelEdit() {
    setEditId(null);
    setDraft({});
  }

  function commitEdit() {
    const updated = rows.map(r => r.id === editId ? { ...draft } : r);
    const errs = validateRanges(updated);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setRows(updated);
    setEditId(null);
    setDraft({});
    setErrors({});
  }

  function addRow() {
    const newRow = { id: Date.now(), minScore: 0, maxScore: 1, revisionType: 'percentage', revisionValue: 0, currency: 'USD', label: '' };
    setRows(prev => [...prev, newRow]);
    setEditId(newRow.id);
    setDraft({ ...newRow });
    setErrors({});
  }

  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
    if (editId === id) { setEditId(null); setDraft({}); }
    setErrors({});
  }

  function resetToDefault() {
    setRows(COMP_DEFAULTS);
    setEditId(null);
    setDraft({});
    setErrors({});
    setSaved(false);
  }

  function handleSave() {
    const errs = validateRanges(rows);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveCompConfig(rows);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inCell = (style) => ({
    border: '1.5px solid var(--grey-200)', borderRadius: 6,
    padding: '4px 8px', fontSize: 12.5, fontFamily: 'inherit',
    background: '#fff', ...style,
  });

  return (
    <div className="card" style={{ marginTop: 16 }}>
      {/* Header */}
      <div className="card-head">
        <div>
          <div className="title">
            <span className="ms">payments</span>
            Review Compensation Config
          </div>
          <div className="sub">Map review star ratings to a % hike on existing compensation. Percentage is applied to each worker's current base salary.</div>
        </div>
        <div className="row gap-2">
          <Btn variant="ghost" size="sm" icon="restart_alt" onClick={resetToDefault}>Reset</Btn>
          <Btn variant="ghost" size="sm" icon="add" onClick={addRow}>Add range</Btn>
          <Btn variant={saved ? 'ghost' : 'primary'} size="sm" icon={saved ? 'check' : 'save'} onClick={handleSave}>
            {saved ? 'Saved!' : 'Save config'}
          </Btn>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Star range</th>
              <th>Revision type</th>
              <th>% Hike / Amount</th>
              <th>Currency</th>
              <th>Label</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px 18px', color: 'var(--fg-secondary)', fontSize: 13 }}>
                  No ranges defined. Click <strong>Add range</strong> above.
                </td>
              </tr>
            )}
            {rows.map(row => {
              const isEditing = editId === row.id;
              const d = isEditing ? draft : row;
              const scoreLabel = d.maxScore === null ? `${d.minScore}+` : `${d.minScore} – ${d.maxScore}`;
              const rowError = errors[row.id];

              return (
                <React.Fragment key={row.id}>
                  <tr style={{ background: isEditing ? 'var(--grey-50)' : rowError ? '#FFF3F3' : 'transparent' }}>
                    {/* Star range */}
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="number" value={d.minScore} min={0} step={0.5}
                            style={inCell({ width: 52 })}
                            onChange={e => setDraft(p => ({ ...p, minScore: Number(e.target.value) }))} />
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>–</span>
                          <input type="number" value={d.maxScore ?? ''} min={0} step={0.5} placeholder="∞"
                            style={inCell({ width: 52 })}
                            onChange={e => setDraft(p => ({ ...p, maxScore: e.target.value === '' ? null : Number(e.target.value) }))} />
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>stars</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>
                          {scoreLabel} ★
                        </span>
                      )}
                    </td>

                    {/* Revision type */}
                    <td>
                      {isEditing ? (
                        <select value={d.revisionType}
                          style={inCell({})}
                          onChange={e => setDraft(p => ({ ...p, revisionType: e.target.value }))}>
                          <option value="no_change">No change</option>
                          <option value="fixed_amount">Fixed amount</option>
                          <option value="percentage">Percentage</option>
                          <option value="manual_review">Manual review</option>
                        </select>
                      ) : (
                        <Pill variant={d.revisionType === 'no_change' ? 'draft' : d.revisionType === 'manual_review' ? 'warning' : 'on-track'} size="sm">
                          {TYPE_LABELS[d.revisionType] || d.revisionType}
                        </Pill>
                      )}
                    </td>

                    {/* Amount */}
                    <td>
                      {isEditing ? (
                        <input type="number" value={d.revisionValue ?? ''}
                          disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review'}
                          style={inCell({ width: 80, opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review') ? 0.4 : 1 })}
                          onChange={e => setDraft(p => ({ ...p, revisionValue: e.target.value === '' ? null : Number(e.target.value) }))} />
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                          {d.revisionType === 'no_change' ? '—'
                            : d.revisionType === 'manual_review' ? 'Manual'
                            : d.revisionType === 'percentage'
                              ? <span style={{ fontWeight: 700, color: 'var(--success-dark, #1a8a50)' }}>+{d.revisionValue}%</span>
                            : `+${d.revisionValue}`}
                        </span>
                      )}
                    </td>

                    {/* Currency */}
                    <td>
                      {isEditing ? (
                        <select value={d.currency || 'USD'}
                          disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage'}
                          style={inCell({ opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage') ? 0.4 : 1 })}
                          onChange={e => setDraft(p => ({ ...p, currency: e.target.value }))}>
                          {['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                          {d.revisionType === 'percentage' || d.revisionType === 'no_change' ? '—' : (d.currency || 'USD')}
                        </span>
                      )}
                    </td>

                    {/* Label */}
                    <td>
                      {isEditing ? (
                        <input type="text" value={d.label || ''} placeholder="e.g. +500 USD"
                          style={inCell({ width: 130 })}
                          onChange={e => setDraft(p => ({ ...p, label: e.target.value }))} />
                      ) : (
                        <span style={{ fontSize: 12.5, color: 'var(--grey-600)' }}>
                          {d.label || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="actions-cell">
                      {isEditing ? (
                        <>
                          <Btn variant="primary" size="sm" icon="check" onClick={commitEdit}>OK</Btn>
                          <Btn variant="ghost" size="sm" icon="close" onClick={cancelEdit} />
                        </>
                      ) : (
                        <>
                          <Btn variant="ghost" size="sm" icon="edit" onClick={() => startEdit(row)} />
                          <Btn variant="ghost" size="sm" icon="delete" onClick={() => removeRow(row.id)}
                            style={{ color: 'var(--error-main)' }} />
                        </>
                      )}
                    </td>
                  </tr>
                  {rowError && (
                    <tr style={{ background: '#FFF3F3' }}>
                      <td colSpan={6} style={{ padding: '4px 18px 8px', fontSize: 12, color: 'var(--error-main)', fontWeight: 600 }}>
                        ⚠ {rowError}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Example hike preview using dummy worker data */}
      {rows.some(r => r.revisionType === 'percentage' && r.revisionValue > 0) && (() => {
        const WORKER_COMP = [
          { name: 'Aditi Sharma', amount: 72000 },
          { name: 'Rahul Mehta',  amount: 85000 },
        ];
        const percentageRows = rows.filter(r => r.revisionType === 'percentage' && r.revisionValue > 0);
        return (
          <div style={{
            margin: '0 18px 16px',
            padding: '12px 16px',
            background: 'var(--grey-50)',
            borderRadius: 10,
            border: '1px solid var(--grey-100)',
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Example hike preview · based on current team compensation
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {WORKER_COMP.map(w =>
                percentageRows.map(r => {
                  const hikeAmount = Math.round(w.amount * r.revisionValue / 100);
                  return (
                    <div key={`${w.name}-${r.id}`} style={{
                      background: '#fff', border: '1px solid var(--grey-200)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 12.5,
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--grey-800)' }}>{w.name}</span>
                      <span style={{ color: 'var(--fg-secondary)', margin: '0 6px' }}>·</span>
                      <span style={{ color: 'var(--fg-secondary)' }}>{r.label || `+${r.revisionValue}%`}</span>
                      <span style={{ color: 'var(--fg-secondary)', margin: '0 6px' }}>→</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-dark, #1a8a50)' }}>
                        +USD {hikeAmount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

window.ReviewCompensationConfig = ReviewCompensationConfig;
window.ClientReviews = ClientReviews;
window.CompensationConfigPanel = CompensationConfigPanel;


/* ============================================================================
   FILE: frames/worker-self-review.jsx
   ============================================================================ */

/* Worker Self-Review form
   Loads the selfReview record for a participantId, shows auto-pulled context
   (goals, KRs, shared 1:1 notes, feedback) and the cycle's self-review questions.
   Allows Save Draft and Submit. Never shows manager private notes. */

const { useState: useStateWSR, useEffect: useEffectWSR, useMemo: useMemoWSR } = React;

function WorkerSelfReview({ participantId, onBack }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateWSR(0);
  useEffectWSR(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const selfReview = participant ? Store.getSelfReview(participantId) : null;
  const context = useMemoWSR(
    () => (participant && cycle) ? Store.getReviewContextForWorker(participant.workerId, participant.reviewCycleId) : null,
    [participantId, storeVersion]
  );

  const questions = cycle?.questions?.selfReview || Store.DEFAULT_SELF_QUESTIONS;
  const [answers, setAnswers] = useStateWSR(() => questions.map((q, i) => ({ question: q, answer: selfReview?.answers?.[i]?.answer || '' })));

  // Keep answers in sync if questions/cycle change
  useEffectWSR(() => {
    setAnswers(questions.map((q, i) => ({ question: q, answer: selfReview?.answers?.[i]?.answer || '' })));
  }, [participantId, questions.length]);

  if (!participant || !cycle || !selfReview) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>This self-review is no longer available.</div>
      </div>
    );
  }

  const submitted = selfReview.status === 'submitted' || participant.selfReviewStatus === 'submitted';

  function updateAnswer(i, value) {
    setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, answer: value } : a));
  }

  function saveDraft() {
    Store.saveSelfReview(participantId, answers);
  }

  async function submit() {
    await Store.saveSelfReview(participantId, answers);
    await Store.submitSelfReview(participantId);
    onBack && onBack();
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to my reviews</Btn>
        <div className="row gap-2">
          {!submitted && <>
            <Btn variant="ghost" icon="schedule" onClick={saveDraft}>Save draft</Btn>
            <Btn variant="primary" icon="send" onClick={submit}>Submit self-review</Btn>
          </>}
          {submitted && <Pill variant="completed" dot>Submitted</Pill>}
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Self-review`}
        title={`Your self-review`}
        sub={`Period ${cycle.periodStart} → ${cycle.periodEnd} · due ${cycle.selfReviewDueDate || 'TBD'} · auto-saves as you type`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="col gap-4">
          {questions.map((q, i) => (
            <SectionCard key={i} title={`${i + 1} · ${q}`} icon="edit_note">
              <textarea
                className="rc-input"
                rows={5}
                disabled={submitted}
                value={answers[i]?.answer || ''}
                placeholder="Reflect honestly. Reference goals, KRs, projects, and 1:1s where helpful."
                onChange={e => updateAnswer(i, e.target.value)}
                onBlur={saveDraft}
              />
            </SectionCard>
          ))}
        </div>

        <div className="col gap-3" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
          {context && <SelfReviewContext context={context} worker={worker} cycle={cycle} />}
          <Callout tone="info" icon="info">
            <strong>Your private notes from 1:1s stay private.</strong> Only shared 1:1 notes appear in this context panel. Manager private notes are never shown to you.
          </Callout>
        </div>
      </div>
    </div>
  );
}

function SelfReviewContext({ context, worker, cycle }) {
  return (
    <>
      <SectionCard title="My goals & OKRs" icon="flag" sub={`Auto-pulled from People Goals · ${context.goals.length} goal${context.goals.length === 1 ? '' : 's'}`}>
        <div className="col gap-2">
          {context.goals.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)' }}>No active goals in this period.</div>}
          {context.goals.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-800)' }}>{g.title}</div>
              <div className="row items-center gap-2" style={{ marginTop: 4 }}>
                <Pill variant={g.status === 'on-track' ? 'on-track' : g.status === 'at-risk' ? 'at-risk' : 'completed'} size="sm" dot>{g.status}</Pill>
                <span style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 700 }}>{g.progress}%</span>
                {g.dueDate && <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· due {g.dueDate}</span>}
              </div>
              {cycle.includeOKRs && (g.keyResults || []).length > 0 && (
                <div className="col gap-1" style={{ marginTop: 6 }}>
                  {g.keyResults.map(kr => (
                    <div key={kr.id} className="row items-center gap-2" style={{ fontSize: 11.5, color: 'var(--grey-700)' }}>
                      <span style={{ width: 38, fontWeight: 700, color: kr.progress >= 70 ? 'var(--success-main)' : kr.progress >= 40 ? 'var(--warning-dark)' : 'var(--error-dark)' }}>{kr.progress}%</span>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kr.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {cycle.includeSharedNotes && context.meetings.length > 0 && (
        <SectionCard title="Shared 1:1 notes" icon="event" sub={`${context.meetings.length} meeting${context.meetings.length === 1 ? '' : 's'} in this period`}>
          <div className="col gap-2">
            {context.meetings.slice(0, 4).map(m => (
              <div key={m.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)' }}>{m.scheduledAt}</div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 4, lineHeight: 1.5 }}>
                  {m.sharedNotes || <em style={{ color: 'var(--fg-disabled)' }}>No shared notes recorded.</em>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {cycle.includeFeedback && context.feedback.length > 0 && (
        <SectionCard title="Feedback received" icon="forum" sub={`${context.feedback.length} item${context.feedback.length === 1 ? '' : 's'} in this period`}>
          <div className="col gap-2">
            {context.feedback.map(f => (
              <div key={f.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <div className="row items-center gap-2" style={{ marginBottom: 4 }}>
                  <Avatar name={f.from} size="xs" />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{f.from}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {f.fromRole} · {f.date}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.45 }}>{f.text}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

window.WorkerSelfReview = WorkerSelfReview;


/* ============================================================================
   FILE: frames/manager-review-form.jsx
   ============================================================================ */

/* Manager Review form
   Loads the managerReview for a participantId, shows the worker's context AND
   their submitted self-review answers (if any), lets the manager fill manager
   questions + strengths/improvement/next/summary + rating + private notes,
   and submit or share with worker. Private notes never go to the worker. */

const { useState: useStateMRF, useEffect: useEffectMRF, useMemo: useMemoMRF, useRef: useRefMRF } = React;

function ManagerReviewForm({ participantId, onBack }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateMRF(0);
  const [saving, setSaving] = useStateMRF(false);
  const participantIdRef = useRefMRF(participantId);
  participantIdRef.current = participantId;
  useEffectMRF(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const mr = participant ? Store.getManagerReview(participantId) : null;
  const self = participant ? Store.getSelfReview(participantId) : null;
  const context = useMemoMRF(
    () => (participant && cycle) ? Store.getReviewContextForWorker(participant.workerId, participant.reviewCycleId) : null,
    [participantId, storeVersion]
  );

  const questions = cycle?.questions?.managerReview || Store.DEFAULT_MANAGER_QUESTIONS;
  const ratingOpts = cycle?.ratingOptions || Store.DEFAULT_RATING_OPTIONS;

  const [answers, setAnswers] = useStateMRF(() => questions.map((q, i) => ({ question: q, answer: mr?.answers?.[i]?.answer || '' })));
  const [rating, setRating] = useStateMRF(mr?.rating || '');
  const [strengths, setStrengths] = useStateMRF(mr?.strengths || '');
  const [improvementAreas, setImprovementAreas] = useStateMRF(mr?.improvementAreas || '');
  const [nextCycleFocus, setNextCycleFocus] = useStateMRF(mr?.nextCycleFocus || '');
  const [finalSummary, setFinalSummary] = useStateMRF(mr?.finalSummary || '');
  const [privateManagerNotes, setPrivateManagerNotes] = useStateMRF(mr?.privateManagerNotes || '');

  useEffectMRF(() => {
    setAnswers(questions.map((q, i) => ({ question: q, answer: mr?.answers?.[i]?.answer || '' })));
    setRating(mr?.rating || '');
    setStrengths(mr?.strengths || '');
    setImprovementAreas(mr?.improvementAreas || '');
    setNextCycleFocus(mr?.nextCycleFocus || '');
    setFinalSummary(mr?.finalSummary || '');
    setPrivateManagerNotes(mr?.privateManagerNotes || '');
  }, [participantId, questions.length]);

  // Auto-initialize the manager review via upsert if it hasn't been created yet
  useEffectMRF(() => {
    if (participant && cycle && !mr) {
      Store.saveManagerReview(participantId, {});
    }
  }, [participantId]);

  if (!participant || !cycle) {
    if (saving) return (
      <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="ms" style={{ fontSize: 20, color: 'var(--brand-blue-500)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <span style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>Saving review…</span>
      </div>
    );
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>
          This manager review is no longer available.
        </div>
      </div>
    );
  }

  const shared = mr?.status === 'shared' || participant.finalReviewStatus === 'shared';

  function persistPayload() {
    return { answers, rating, strengths, improvementAreas, nextCycleFocus, finalSummary, privateManagerNotes };
  }

  async function saveDraft() {
    if (saving) return;
    setSaving(true);
    try { await Store.saveManagerReview(participantId, persistPayload()); }
    catch (e) { alert('Save draft failed: ' + e.message); }
    finally { setSaving(false); }
  }

  function submit() {
    if (saving) return;
    setSaving(true);
    const payload = persistPayload();
    const pid = participantId;
    onBack && onBack();
    Store.saveManagerReview(pid, payload)
      .then(() => Store.submitManagerReview(pid))
      .catch(e => console.error('submit failed:', e.message));
  }

  function shareWithWorker() {
    if (saving) return;
    setSaving(true);
    const payload = persistPayload();
    const pid = participantId;
    onBack && onBack();
    Store.saveManagerReview(pid, payload)
      .then(() => Store.submitManagerReview(pid))
      .then(() => Store.shareManagerReview(pid))
      .catch(e => console.error('share failed:', e.message));
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div className="row gap-2">
          {shared
            ? <Pill variant="completed" dot>Shared with worker</Pill>
            : <>
                <Btn variant="ghost" icon="schedule" onClick={saveDraft}>Save draft</Btn>
                <Btn variant="outlined" icon="send" onClick={submit}>Submit review</Btn>
                <Btn variant="primary" icon="visibility" onClick={shareWithWorker}>Share with {worker?.name?.split(' ')[0] || 'worker'}</Btn>
              </>}
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Manager review`}
        title={`Write a review for ${worker?.name || 'worker'}`}
        sub={`${worker?.role || ''} · ${worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'} · period ${cycle.periodStart} → ${cycle.periodEnd}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        {/* LEFT — manager questions + summary fields */}
        <div className="col gap-4">
          {self && (self.status === 'submitted' || self.status === 'draft') && (
            <div style={{
              background: self.status === 'submitted'
                ? 'linear-gradient(135deg, #E8F7EF 0%, #FFFFFF 65%)'
                : 'linear-gradient(135deg, #FFF7E6 0%, #FFFFFF 65%)',
              border: `1px solid ${self.status === 'submitted' ? 'var(--brand-green-200)' : '#FFE3A5'}`,
              borderRadius: 14,
              padding: '14px 18px 18px',
              boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
            }}>
              <div className="row items-center gap-3" style={{ marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: self.status === 'submitted' ? 'var(--success-bg)' : 'var(--warning-bg)',
                  color: self.status === 'submitted' ? 'var(--success-dark)' : 'var(--warning-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="ms" style={{ fontSize: 22 }}>assignment_turned_in</span>
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Self review · context for your manager review</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-800)', marginTop: 2 }}>
                    {worker?.name || 'Worker'}’s self-review for {cycle.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                    {self.submittedAt
                      ? `Submitted ${new Date(self.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Not yet submitted'} · {worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                  </div>
                </div>
                {self.status === 'submitted'
                  ? <Pill variant="completed" dot>Self Review Submitted</Pill>
                  : <Pill variant="warning"   dot>Draft · not yet submitted</Pill>}
              </div>

              <div className="col gap-2">
                {self.answers.length === 0 && (
                  <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
                    {self.status === 'submitted' ? 'Worker submitted but left all answers blank.' : 'Worker hasn’t answered any questions yet.'}
                  </div>
                )}
                {self.answers.map((a, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#fff', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginTop: 2 }}>{a.question}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer.</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!self && (
            <Callout tone="warning" icon="info">
              No self-review record found for this participant. You can still write the manager review below.
            </Callout>
          )}

          {questions.map((q, i) => (
            <SectionCard key={i} title={`${i + 1} · ${q}`} icon="edit_note">
              <textarea
                className="rc-input"
                rows={4}
                disabled={shared}
                value={answers[i]?.answer || ''}
                placeholder="Reference specific projects, OKRs, or moments."
                onChange={e => setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, answer: e.target.value } : a))}
                onBlur={saveDraft}
              />
            </SectionCard>
          ))}

          <SectionCard title="Final summary fields" icon="summarize" sub="Used in the final shared review">
            <div className="col gap-3">
              <FieldArea label="Key strengths"    value={strengths}        onChange={setStrengths}        disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Development areas" value={improvementAreas} onChange={setImprovementAreas} disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Next cycle focus"  value={nextCycleFocus}   onChange={setNextCycleFocus}   disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Final performance summary" rows={5} value={finalSummary} onChange={setFinalSummary} disabled={shared} onBlur={saveDraft} />
            </div>
          </SectionCard>

          <SectionCard title="Private manager notes" icon="lock" sub="Never shared with the worker — only visible to managers and admins.">
            <textarea
              className="rc-input"
              rows={4}
              disabled={shared}
              value={privateManagerNotes}
              placeholder="Calibration thoughts, comp signals, promotion case — your eyes only."
              onChange={e => setPrivateManagerNotes(e.target.value)}
              onBlur={saveDraft}
              style={{ background: '#FFFAEB', borderColor: '#FFE3A5' }}
            />
          </SectionCard>
        </div>

        {/* RIGHT — rating + context */}
        <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          {cycle.includeRating && (
            <SectionCard title="Overall rating" icon="star">
              <div className="col gap-2">
                {ratingOpts.map((opt, idx) => {
                  const starValue = ratingOpts.length - idx;
                  return (
                    <label key={opt} className="row items-center gap-2" style={{
                      padding: '10px 12px', border: `1.5px solid ${rating === opt ? 'var(--brand-blue-500)' : 'var(--grey-100)'}`,
                      background: rating === opt ? 'var(--brand-blue-100)' : '#fff',
                      borderRadius: 8, cursor: shared ? 'default' : 'pointer',
                    }}>
                      <input type="radio" name="rating" checked={rating === opt} onChange={() => { setRating(opt); }}
                        disabled={shared}
                        onBlur={saveDraft} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', flex: 1 }}>{opt}</span>
                      <Stars value={starValue} max={ratingOpts.length} size="sm" />
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {context && <ManagerReviewContext context={context} cycle={cycle} />}

          <Callout tone="warning" icon="lock">
            <strong>Private notes</strong> stay with managers. The worker sees only summary fields and the rating you choose (per cycle visibility settings).
          </Callout>
        </div>
      </div>
    </div>
  );
}

function FieldArea({ label, value, onChange, rows = 3, disabled, onBlur }) {
  return (
    <label className="col" style={{ gap: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <textarea className="rc-input" rows={rows} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)} onBlur={onBlur} />
    </label>
  );
}

function ManagerReviewContext({ context, cycle }) {
  return (
    <>
      <SectionCard title="Worker context" icon="flag" sub={`${context.goals.length} goals · ${context.keyResults.length} KRs`}>
        <div className="col gap-2">
          {context.goals.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)' }}>No goals visible to this worker in the period.</div>}
          {context.goals.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-800)' }}>{g.title}</div>
              <div className="row items-center gap-2" style={{ marginTop: 4 }}>
                <Pill variant={g.status === 'on-track' ? 'on-track' : g.status === 'at-risk' ? 'at-risk' : 'completed'} size="sm" dot>{g.status}</Pill>
                <span style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 700 }}>{g.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {cycle.includeFeedback && context.feedback.length > 0 && (
        <SectionCard title="Feedback in period" icon="forum">
          <div className="col gap-2">
            {context.feedback.slice(0, 5).map(f => (
              <div key={f.id} style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8, fontSize: 12, color: 'var(--grey-700)' }}>
                <strong>{f.from}</strong> · <span style={{ color: 'var(--fg-secondary)' }}>{f.date}</span><br />{f.text}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

window.ManagerReviewForm = ManagerReviewForm;


/* ============================================================================
   FILE: frames/review-cycle-stepper.jsx
   ============================================================================ */

/* Review Cycle Stepper — 5-step flow for creating/launching a review cycle.
   Persists to PerformanceStore. Used inside ClientReviews. */

const { useState: useStateRC, useMemo: useMemoRC } = React;

const RC_STEPS = [
  { id: 'details',    label: 'Review details' },
  { id: 'people',     label: 'Select people' },
  { id: 'questions',  label: 'Questions & inputs' },
  { id: 'rating',     label: 'Rating & deadlines' },
  { id: 'review',     label: 'Review & launch' },
];

const PARTICIPANT_TYPE_OPTIONS = [
  { value: 'employees',                 label: 'Employees',                icon: 'badge',     desc: 'Run this cycle for full-time employees only.' },
  { value: 'contractors',               label: 'Contractors',              icon: 'engineering', desc: 'Run this cycle for contractors only — same engine, contractor badge.' },
  { value: 'employees_and_contractors', label: 'Employees and contractors', icon: 'groups',    desc: 'Mixed cycle — both populations get the same self/manager flow.' },
];

function ReviewCycleStepper({ initial = {}, onCancel, onSaved, onLaunched }) {
  const Store = window.PerformanceStore;
  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inFortyFiveDays = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [stepIdx, setStepIdx] = useStateRC(0);
  const [cycle, setCycle] = useStateRC(() => ({
    id: initial.id || null,
    name: initial.name || 'Q3 2026 Performance Review',
    type: initial.type || 'quarterly',
    periodStart: initial.periodStart || '2026-07-01',
    periodEnd: initial.periodEnd || '2026-09-30',
    purpose: initial.purpose || '',
    participantType: initial.participantType || 'employees',
    workerIds: initial.workerIds || [],
    reviewerMode: initial.reviewerMode || 'direct-manager',
    reviewerIds: initial.reviewerIds || [Store.MANAGER_ID],
    includeWorkersWithNoGoals: initial.includeWorkersWithNoGoals ?? true,
    includeGoals: initial.includeGoals !== false,
    includeOKRs: initial.includeOKRs !== false,
    includeWorkerCreatedGoals: initial.includeWorkerCreatedGoals !== false,
    includeProgressUpdates: initial.includeProgressUpdates !== false,
    includeMeetings: initial.includeMeetings !== false,
    includeSharedNotes: initial.includeSharedNotes !== false,
    includeFeedback: initial.includeFeedback !== false,
    includeRating: initial.includeRating !== false,
    ratingScale: initial.ratingScale || 'simple-4',
    ratingOptions: initial.ratingOptions || Store.DEFAULT_RATING_OPTIONS,
    showRatingToWorker: initial.showRatingToWorker !== false,
    showManagerFinalCommentsToWorker: initial.showManagerFinalCommentsToWorker !== false,
    showManagerPrivateNotesToWorker: false,
    selfReviewDueDate: initial.selfReviewDueDate || inThirtyDays,
    managerReviewDueDate: initial.managerReviewDueDate || inFortyFiveDays,
    finalSharingDate: initial.finalSharingDate || inFortyFiveDays,
    questions: {
      selfReview: initial.questions?.selfReview || [...Store.DEFAULT_SELF_QUESTIONS],
      managerReview: initial.questions?.managerReview || [...Store.DEFAULT_MANAGER_QUESTIONS],
      finalSharedReview: initial.questions?.finalSharedReview || [...Store.DEFAULT_FINAL_FIELDS],
    },
  }));

  const selectableWorkers = useMemoRC(() => Store.getSelectableWorkers(cycle.participantType, cycle.includeWorkersWithNoGoals), [cycle.participantType, cycle.includeWorkersWithNoGoals]);

  function patch(p) { setCycle(prev => ({ ...prev, ...p })); }
  function patchQuestions(group, list) { setCycle(prev => ({ ...prev, questions: { ...prev.questions, [group]: list } })); }

  function toggleWorker(workerId) {
    setCycle(prev => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter(id => id !== workerId)
        : [...prev.workerIds, workerId],
    }));
  }

  function selectAllVisible() {
    setCycle(prev => ({ ...prev, workerIds: selectableWorkers.map(w => w.id) }));
  }
  function clearSelection() {
    setCycle(prev => ({ ...prev, workerIds: [] }));
  }

  const step = RC_STEPS[stepIdx].id;
  const isLast = stepIdx === RC_STEPS.length - 1;
  const canNext = stepIdx === 1 ? cycle.workerIds.length > 0 : true;

  async function handleSaveDraft() {
    try {
      const saved = await Store.saveReviewCycleDraft(cycle);
      onSaved && onSaved(saved);
    } catch (e) {
      console.error(e);
      alert(`Could not save draft: ${e.message}`);
    }
  }

  async function handleLaunch() {
    try {
      const launched = await Store.launchReviewCycle(cycle);
      onLaunched && onLaunched(launched);
    } catch (e) {
      console.error(e);
      alert(`Could not launch review cycle: ${e.message}`);
    }
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onCancel}>Back to reviews</Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={handleSaveDraft}>Save as draft</Btn>
          {isLast && <Btn variant="primary" icon="play_circle" onClick={handleLaunch}>Launch review cycle</Btn>}
        </div>
      </div>

      <PageHead
        eyebrow="Performance Management · New review cycle"
        title="Start a new review cycle"
        sub={`Step ${stepIdx + 1} of ${RC_STEPS.length} · ${RC_STEPS[stepIdx].label}`}
      />

      {/* Step indicator */}
      <div className="row items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {RC_STEPS.map((s, i) => {
          const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'todo';
          const colors = state === 'done'
            ? { bg: 'var(--success-bg)', fg: 'var(--success-dark)', border: 'var(--brand-green-200)' }
            : state === 'active'
              ? { bg: 'var(--brand-blue-100)', fg: 'var(--brand-blue-600)', border: 'var(--brand-blue-300)' }
              : { bg: '#fff', fg: 'var(--fg-secondary)', border: 'var(--grey-100)' };
          return (
            <div key={s.id} className="row items-center gap-2" style={{
              padding: '6px 12px', borderRadius: 999, border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.fg, fontSize: 12, fontWeight: 700,
              cursor: i < stepIdx ? 'pointer' : 'default',
            }} onClick={() => { if (i < stepIdx) setStepIdx(i); }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: state === 'done' ? 'var(--success-main)' : state === 'active' ? 'var(--brand-blue-500)' : 'var(--grey-100)',
                color: state === 'todo' ? 'var(--fg-secondary)' : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>{state === 'done' ? '✓' : i + 1}</span>
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Step body */}
      {step === 'details'   && <StepDetails   cycle={cycle} patch={patch} />}
      {step === 'people'    && <StepPeople    cycle={cycle} patch={patch} toggleWorker={toggleWorker}
                                              selectableWorkers={selectableWorkers}
                                              selectAllVisible={selectAllVisible} clearSelection={clearSelection} />}
      {step === 'questions' && <StepQuestions cycle={cycle} patch={patch} patchQuestions={patchQuestions} />}
      {step === 'rating'    && <StepRating    cycle={cycle} patch={patch} />}
      {step === 'review'    && <StepReviewSummary cycle={cycle} selectableWorkers={selectableWorkers} />}

      <div className="row items-center between" style={{ marginTop: 16 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={() => stepIdx === 0 ? onCancel() : setStepIdx(stepIdx - 1)}>
          {stepIdx === 0 ? 'Cancel' : 'Back'}
        </Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={handleSaveDraft}>Save draft</Btn>
          {!isLast
            ? <Btn variant="primary" iconTrailing="arrow_forward" onClick={() => canNext && setStepIdx(stepIdx + 1)}>{canNext ? 'Next' : 'Pick at least 1 person'}</Btn>
            : <Btn variant="primary" icon="play_circle" onClick={handleLaunch}>Launch review cycle</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 1: Review details ---------- */
function StepDetails({ cycle, patch }) {
  const opts = window.PerformanceStore.REVIEW_TYPE_OPTIONS;
  return (
    <SectionCard title="Review details" sub="Name the cycle and define the period it covers." icon="event_note">
      <div className="col gap-3">
        <RcField label="Review cycle name" required>
          <input type="text" value={cycle.name} onChange={e => patch({ name: e.target.value })} className="rc-input" />
        </RcField>

        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <RcField label="Review type">
              <select className="rc-input" value={cycle.type} onChange={e => patch({ type: e.target.value })}>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Period start">
              <input type="date" className="rc-input" value={cycle.periodStart} onChange={e => patch({ periodStart: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Period end">
              <input type="date" className="rc-input" value={cycle.periodEnd} onChange={e => patch({ periodEnd: e.target.value })} />
            </RcField>
          </div>
        </div>

        <RcField label="Purpose of review" hint="Optional. What outcome do you want from this cycle?">
          <textarea className="rc-input" rows={3} value={cycle.purpose}
            onChange={e => patch({ purpose: e.target.value })}
            placeholder="e.g. Q3 quarterly check-in across Ops and Onboarding teams." />
        </RcField>
      </div>
    </SectionCard>
  );
}

/* ---------- Step 2: Select people ---------- */
function StepPeople({ cycle, patch, toggleWorker, selectableWorkers, selectAllVisible, clearSelection }) {
  return (
    <div className="col gap-4">
      <SectionCard title="Who do you want to include in this review cycle?" icon="groups">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          {PARTICIPANT_TYPE_OPTIONS.map(opt => {
            const active = cycle.participantType === opt.value;
            return (
              <label key={opt.value} style={{
                flex: '1 1 220px', cursor: 'pointer',
                border: `2px solid ${active ? 'var(--brand-blue-500)' : 'var(--grey-100)'}`,
                background: active ? 'var(--brand-blue-100)' : '#fff',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <input type="radio" name="participantType" checked={active} onChange={() => patch({ participantType: opt.value, workerIds: [] })}
                  style={{ marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="row items-center gap-2" style={{ marginBottom: 2 }}>
                    <span className="ms" style={{ color: active ? 'var(--brand-blue-600)' : 'var(--fg-secondary)' }}>{opt.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--grey-800)' }}>{opt.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="row items-center gap-3" style={{ marginTop: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--grey-700)', fontWeight: 700 }}>Include people who do not currently have assigned goals or OKRs?</span>
          <div className="row gap-2">
            {['no','yes'].map(v => {
              const active = (v === 'yes') === cycle.includeWorkersWithNoGoals;
              return (
                <button key={v} onClick={() => patch({ includeWorkersWithNoGoals: v === 'yes', workerIds: [] })}
                  className="filter" style={{
                    background: active ? 'var(--brand-blue-100)' : '#fff',
                    borderColor: active ? 'var(--brand-blue-500)' : 'var(--grey-200)',
                    color: active ? 'var(--brand-blue-600)' : 'var(--grey-700)',
                  }}>{v === 'yes' ? 'Yes (default)' : 'No · only people with goals'}</button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Select people · ${cycle.workerIds.length} selected`}
        sub={`${selectableWorkers.length} eligible based on filters above`}
        icon="checklist"
        action={
          <div className="row gap-2">
            <Btn variant="ghost" size="sm" icon="select_all" onClick={selectAllVisible}>Select all</Btn>
            <Btn variant="ghost" size="sm" icon="clear" onClick={clearSelection}>Clear</Btn>
          </div>
        }
        padBody={false}
      >
        <div style={{ padding: '4px 0' }}>
          {selectableWorkers.length === 0 && (
            <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
              No people match these filters. Try toggling "Include people with no goals".
            </div>
          )}
          {selectableWorkers.map(w => {
            const selected = cycle.workerIds.includes(w.id);
            const goalsCount = window.PerformanceStore.getGoalsForWorker(w.id).length;
            return (
              <label key={w.id} style={{
                display: 'grid', gridTemplateColumns: '24px minmax(0, 2fr) 110px minmax(0, 1fr) 90px',
                gap: 14, alignItems: 'center',
                padding: '12px 22px', borderTop: '1px solid var(--grey-50)', cursor: 'pointer',
                background: selected ? 'var(--brand-blue-100)' : 'transparent',
              }}>
                <input type="checkbox" checked={selected} onChange={() => toggleWorker(w.id)} />
                <div className="row items-center gap-3">
                  <Avatar name={w.name} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--grey-800)' }}>{w.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{w.role}</div>
                  </div>
                </div>
                <Pill variant={w.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                  {w.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                </Pill>
                <div style={{ fontSize: 12, color: 'var(--grey-700)' }}>
                  Reviewer: <strong>{w.managerId === window.PerformanceStore.MANAGER_ID ? 'Priya Nair' : w.managerId}</strong>
                </div>
                <div style={{ fontSize: 12, color: goalsCount ? 'var(--grey-700)' : 'var(--fg-disabled)', fontWeight: 600 }}>
                  {goalsCount} active goal{goalsCount === 1 ? '' : 's'}
                </div>
              </label>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

/* ---------- Step 3: Questions & inputs ---------- */
function StepQuestions({ cycle, patch, patchQuestions }) {
  return (
    <div className="col gap-4">
      <SectionCard title="What context should reviewers see?" icon="data_object">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          {[
            { key: 'includeGoals',              label: 'Assigned goals' },
            { key: 'includeOKRs',               label: 'OKRs / Key results' },
            { key: 'includeWorkerCreatedGoals', label: 'Worker-created goals' },
            { key: 'includeProgressUpdates',    label: 'Goal progress updates' },
            { key: 'includeMeetings',           label: '1:1 meetings' },
            { key: 'includeSharedNotes',        label: 'Shared 1:1 notes' },
            { key: 'includeFeedback',           label: 'Feedback received' },
          ].map(item => (
            <ToggleChip key={item.key} active={!!cycle[item.key]} onChange={(v) => patch({ [item.key]: v })}>
              {item.label}
            </ToggleChip>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Self-review questions"
        sub={`${cycle.questions.selfReview.length} questions · workers see these`}
        icon="person"
      >
        <QuestionList
          questions={cycle.questions.selfReview}
          onChange={(next) => patchQuestions('selfReview', next)}
          placeholder="Add a self-review question…"
        />
      </SectionCard>

      <SectionCard
        title="Manager-review questions"
        sub={`${cycle.questions.managerReview.length} questions · managers see these when writing the review`}
        icon="badge"
      >
        <QuestionList
          questions={cycle.questions.managerReview}
          onChange={(next) => patchQuestions('managerReview', next)}
          placeholder="Add a manager-review question…"
        />
      </SectionCard>
    </div>
  );
}

/* ---------- Step 4: Rating, Visibility & Deadlines ---------- */
function StepRating({ cycle, patch }) {
  return (
    <div className="col gap-4">
      <SectionCard title="Rating" icon="star">
        <div className="row items-center gap-3" style={{ marginBottom: 12 }}>
          <ToggleChip active={cycle.includeRating} onChange={(v) => patch({ includeRating: v })}>Include rating</ToggleChip>
        </div>
        {cycle.includeRating && (
          <div className="col gap-2">
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating scale</div>
            {cycle.ratingOptions.map((opt, i) => (
              <div key={i} className="row items-center gap-2" style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <span style={{ width: 26, fontWeight: 800, color: 'var(--fg-secondary)' }}>{i + 1}</span>
                <input type="text" className="rc-input" value={opt}
                  style={{ flex: 1 }}
                  onChange={e => {
                    const next = cycle.ratingOptions.slice();
                    next[i] = e.target.value;
                    patch({ ratingOptions: next });
                  }} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Visibility to worker" icon="visibility" sub="Manager private notes are never visible to workers or contractors.">
        <div className="col gap-2">
          <ToggleRow label="Show final rating to worker"           checked={cycle.showRatingToWorker}               onChange={(v) => patch({ showRatingToWorker: v })} />
          <ToggleRow label="Show final manager comments to worker" checked={cycle.showManagerFinalCommentsToWorker} onChange={(v) => patch({ showManagerFinalCommentsToWorker: v })} />
          <ToggleRow label="Show manager private notes to worker"  checked={false}                                  disabled lockText="Always hidden" />
        </div>
      </SectionCard>

      <SectionCard title="Deadlines" icon="calendar_month">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Self-review due">
              <input type="date" className="rc-input" value={cycle.selfReviewDueDate} onChange={e => patch({ selfReviewDueDate: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Manager-review due">
              <input type="date" className="rc-input" value={cycle.managerReviewDueDate} onChange={e => patch({ managerReviewDueDate: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Final sharing date">
              <input type="date" className="rc-input" value={cycle.finalSharingDate} onChange={e => patch({ finalSharingDate: e.target.value })} />
            </RcField>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ---------- Step 5: Review & launch summary ---------- */
function StepReviewSummary({ cycle, selectableWorkers }) {
  const selectedPeople = selectableWorkers.filter(w => cycle.workerIds.includes(w.id));
  const typeLabel = window.PerformanceStore.REVIEW_TYPE_OPTIONS.find(o => o.value === cycle.type)?.label || cycle.type;
  const participantLabel = PARTICIPANT_TYPE_OPTIONS.find(o => o.value === cycle.participantType)?.label || cycle.participantType;
  const includedDataLabels = [
    cycle.includeGoals && 'Assigned goals',
    cycle.includeOKRs && 'OKRs / Key results',
    cycle.includeWorkerCreatedGoals && 'Worker-created goals',
    cycle.includeProgressUpdates && 'Progress updates',
    cycle.includeMeetings && '1:1 meetings',
    cycle.includeSharedNotes && 'Shared 1:1 notes',
    cycle.includeFeedback && 'Feedback received',
  ].filter(Boolean);

  return (
    <div className="col gap-4">
      <SectionCard title={cycle.name} sub={`${typeLabel} · ${cycle.periodStart} → ${cycle.periodEnd}`} icon="event_note">
        {cycle.purpose && <div style={{ fontSize: 13, color: 'var(--grey-700)', marginBottom: 14, lineHeight: 1.5 }}>{cycle.purpose}</div>}
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <Pill variant="employee" icon="group">{participantLabel}</Pill>
          <Pill variant="contrib"  icon="checklist">{selectedPeople.length} participants</Pill>
          <Pill variant={cycle.includeRating ? 'eligible' : 'draft'} icon="star">{cycle.includeRating ? 'Rating ON' : 'Rating OFF'}</Pill>
          <Pill variant="warning" icon="schedule">Self-review due {cycle.selfReviewDueDate || '—'}</Pill>
          <Pill variant="warning" icon="schedule">Manager review due {cycle.managerReviewDueDate || '—'}</Pill>
        </div>
      </SectionCard>

      <SectionCard title="Selected people" sub={`${selectedPeople.length} people will get a self-review task and a manager-review task on launch.`} icon="groups" padBody={false}>
        {selectedPeople.length === 0
          ? <div style={{ padding: 20, fontSize: 13, color: 'var(--fg-secondary)' }}>No one selected — go back to step 2.</div>
          : selectedPeople.map(w => (
              <div key={w.id} className="row items-center gap-3" style={{ padding: '10px 22px', borderTop: '1px solid var(--grey-50)' }}>
                <Avatar name={w.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{w.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{w.role}</div>
                </div>
                <Pill variant={w.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                  {w.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                </Pill>
              </div>
            ))}
      </SectionCard>

      <SectionCard title="Included data & questions" icon="quiz">
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          {includedDataLabels.map(l => <Pill key={l} variant="contrib" icon="check">{l}</Pill>)}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>
          {cycle.questions.selfReview.length} self-review questions · {cycle.questions.managerReview.length} manager-review questions · {cycle.ratingOptions.length}-point rating scale
        </div>
      </SectionCard>

      <Callout tone="info" icon="lock">
        <strong>Manager private notes</strong> are never visible to workers or contractors, regardless of visibility settings.
      </Callout>
    </div>
  );
}

/* ---------- Tiny helpers ---------- */
function RcField({ label, required, hint, children }) {
  return (
    <label className="col" style={{ gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--error-dark)' }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{hint}</span>}
    </label>
  );
}

function ToggleChip({ active, onChange, children }) {
  return (
    <button onClick={() => onChange(!active)} className="filter" style={{
      background: active ? 'var(--brand-blue-100)' : '#fff',
      borderColor: active ? 'var(--brand-blue-500)' : 'var(--grey-200)',
      color: active ? 'var(--brand-blue-600)' : 'var(--grey-700)',
      fontWeight: 700, fontSize: 12.5,
    }}>
      <span className="ms" style={{ fontSize: 14, marginRight: 4 }}>{active ? 'check_circle' : 'radio_button_unchecked'}</span>
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange, disabled, lockText }) {
  return (
    <div className="row items-center between" style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8, opacity: disabled ? 0.85 : 1 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-700)' }}>{label}</span>
      <div className="row items-center gap-2">
        {disabled
          ? <Pill variant="overdue" icon="lock">{lockText || 'Locked'}</Pill>
          : (
            <button onClick={() => onChange(!checked)} style={{
              border: 'none', cursor: 'pointer',
              width: 44, height: 24, borderRadius: 999,
              background: checked ? 'var(--brand-blue-500)' : 'var(--grey-100)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: checked ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.12s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </button>
          )}
      </div>
    </div>
  );
}

function QuestionList({ questions, onChange, placeholder }) {
  const [draft, setDraft] = useStateRC('');
  function addQ() {
    if (!draft.trim()) return;
    onChange([...questions, draft.trim()]);
    setDraft('');
  }
  function removeQ(idx) {
    onChange(questions.filter((_, i) => i !== idx));
  }
  function editQ(idx, val) {
    onChange(questions.map((q, i) => i === idx ? val : q));
  }
  return (
    <div className="col gap-2">
      {questions.map((q, i) => (
        <div key={i} className="row items-start gap-2" style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
          <span style={{ width: 24, fontWeight: 800, color: 'var(--fg-secondary)', flexShrink: 0, paddingTop: 6 }}>{i + 1}</span>
          <textarea className="rc-input" rows={2} style={{ flex: 1 }} value={q} onChange={e => editQ(i, e.target.value)} />
          <IconBtn icon="delete_outline" title="Remove" onClick={() => removeQ(i)} />
        </div>
      ))}
      <div className="row items-center gap-2" style={{ marginTop: 6 }}>
        <input type="text" className="rc-input" style={{ flex: 1 }} value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addQ(); } }} />
        <Btn variant="outlined" size="sm" icon="add" onClick={addQ}>Add</Btn>
      </div>
    </div>
  );
}

window.ReviewCycleStepper = ReviewCycleStepper;


/* ============================================================================
   FILE: frames/all-review-cycles.jsx
   ============================================================================ */

/* Worker → Reviews → "View all" history page.
   Shows every review cycle the worker has participated in, newest first,
   with the same status pills and actions as the dashboard panel. */

const { useState: useStateARC, useEffect: useEffectARC } = React;

function AllReviewCyclesPage() {
  const Store = window.PerformanceStore;
  const [, setVersion] = useStateARC(0);
  useEffectARC(() => Store.subscribe(() => setVersion(v => v + 1)), []);
  useEffectARC(() => { Store.refreshAll && Store.refreshAll(); }, []);

  const currentWorkerId = Store.getCurrentWorkerId();
  const cycles = Store.getReviewCyclesForWorker(currentWorkerId);
  cycles.sort((a, b) => String(b.periodEnd || b.createdAt || '').localeCompare(String(a.periodEnd || a.createdAt || '')));

  function go(hash) { window.location.hash = hash; }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'All cycles']}>

      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={() => go('/worker/reviews')}>Back to Feedback &amp; Reviews</Btn>
      </div>

      <PageHead
        eyebrow="My performance · Review cycles"
        title={`All review cycles · ${cycles.length}`}
        sub="Every cycle you've participated in, newest first."
      />

      <SectionCard
        title="Review cycles"
        sub={`${cycles.length} total`}
        icon="event_repeat"
        padBody={false}
      >
        {cycles.length === 0 && (
          <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
            No review cycles yet.
          </div>
        )}
        {cycles.map(c => {
          const p = Store.getReviewParticipantForWorker(c.id, currentWorkerId);
          const selfStatus = p?.selfReviewStatus || 'not-started';
          const finalShared = p?.finalReviewStatus === 'shared' || p?.finalReviewStatus === 'acknowledged';
          const acknowledged = p?.finalReviewStatus === 'acknowledged';
          return (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 130px 160px 220px',
              gap: 16, alignItems: 'center',
              padding: '14px 22px', borderTop: '1px solid var(--grey-50)',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>{c.periodStart} → {c.periodEnd}</div>
              </div>
              <Pill variant={c.status === 'active' ? 'active' : c.status === 'closed' ? 'completed' : 'draft'} dot>{c.status}</Pill>
              <div className="col gap-1">
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Self-review</span>
                {selfStatus === 'submitted'   && <Pill variant="completed" dot>Submitted</Pill>}
                {selfStatus === 'draft'       && <Pill variant="warning"   dot>Draft</Pill>}
                {selfStatus === 'not-started' && <Pill variant="draft">Not started</Pill>}
              </div>
              <div className="row gap-2" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {finalShared && p && (
                  <Btn variant={acknowledged ? 'ghost' : 'primary'} size="sm" icon={acknowledged ? 'check' : 'visibility'}
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openShared', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>
                    {acknowledged ? 'View shared review' : 'View & acknowledge'}
                  </Btn>
                )}
                {selfStatus === 'submitted' && p && (
                  <Btn variant="ghost" size="sm" icon="visibility"
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openSelf', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>View my self-review</Btn>
                )}
                {!finalShared && selfStatus !== 'submitted' && p && (
                  <Btn variant="primary" size="sm" icon={selfStatus === 'draft' ? 'edit' : 'play_arrow'}
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openSelf', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>
                    {selfStatus === 'draft' ? 'Continue self-review' : 'Start self-review'}
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </SectionCard>
    </Shell>
  );
}

window.AllReviewCyclesPage = AllReviewCyclesPage;


/* ============================================================================
   FILE: frames/worker-meetings.jsx
   ============================================================================ */

/* Frame · Worker 1:1 Sessions
   Personal list of 1:1s. Worker can prep agenda, view shared notes after the
   meeting, and check action items. Private notes from the manager are hidden. */

const { useState: useStateWM, useRef: useRefWM } = React;

function WorkerMeetings() {
  const [openNotes, setOpenNotes] = useStateWM(null);
  const [showRequest, setShowRequest] = useStateWM(false);
  const [reqMessage, setReqMessage] = useStateWM('');
  const [reqTime, setReqTime] = useStateWM('');
  const [reqSending, setReqSending] = useStateWM(false);
  const [reqSent, setReqSent] = useStateWM(false);

  async function sendRequest() {
    if (!reqMessage.trim()) return;
    setReqSending(true);
    try {
      await window.PerformanceStore.request1on1({ message: reqMessage.trim(), proposedTime: reqTime.trim() || undefined });
      setReqSent(true);
      setReqMessage('');
      setReqTime('');
      setTimeout(() => { setReqSent(false); setShowRequest(false); }, 2500);
    } catch (e) {
      alert('Could not send request: ' + e.message);
    } finally {
      setReqSending(false);
    }
  }

  const today = {
    when: 'Today · Wed Mar 26', time: '10:00 AM', dur: '30 min',
    with: 'Priya Nair', role: 'Manager · weekly 1:1', live: true,
    agenda: [
      'Wrap-up of Payroll Migration EU and what went well',
      'Q4 priorities — which migrations to take on next',
      'Career growth — Lead Ops path',
    ],
  };

  const upcoming = [
    { when: 'Thu Mar 27', time: '11:00 AM', with: 'Hannah Mueller', role: 'Skip-level', agenda: 'Career goals & compliance OKR alignment' },
    { when: 'Fri Mar 28', time: '9:30 AM',  with: 'Lina Chen',      role: 'Peer mentor', agenda: 'Onboarding playbook pairing' },
    { when: 'Wed Apr 2',  time: '10:00 AM', with: 'Priya Nair',     role: 'Weekly 1:1',  agenda: 'Goal check-in + Q4 priorities' },
  ];

  const past = [
    {
      when: 'Mar 17 · 10:00 AM', with: 'Priya Nair', role: 'Weekly 1:1',
      summary: 'Set Q3 goals — 6 migrations + mentor Lina. Owe runbook link by Friday.',
      actionItems: [
        { text: 'Pair on cutover-day playbook with Lina', done: true },
        { text: 'File JIRA tickets for the runbook gaps', done: true },
        { text: 'Review draft career-ladder doc Priya sends', done: false },
      ],
      linked: [{ kind: 'okr', label: 'Complete 6 migrations' }],
    },
    {
      when: 'Mar 10 · 10:00 AM', with: 'Priya Nair', role: 'Weekly 1:1',
      summary: 'Discussed Italy cutover retro. Aditi flagged onboarding doc gaps that need to be fixed before Spain.',
      actionItems: [
        { text: 'Document Italy cutover lessons in shared runbook', done: true },
      ],
      linked: [{ kind: 'project', label: 'Payroll Migration EU' }],
    },
    {
      when: 'Mar 03 · 10:00 AM', with: 'Hannah Mueller', role: 'Skip-level',
      summary: 'Career goal alignment — Aditi wants to formalize Lead Ops path.',
      actionItems: [],
      linked: [],
    },
  ];

  // Worker variant of the notes editor — only shared notes visible.
  if (openNotes) {
    return (
      <Shell persona="worker" active="performance" crumb={['Payo WFM', 'Performance', 'My 1:1 sessions', `Notes — ${openNotes.with}`]}>
        <WorkerNotesView meeting={openNotes} onBack={() => setOpenNotes(null)} />
      </Shell>
    );
  }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My 1:1 sessions']}>

      <PerfTabs variant="worker" active="my-meetings" />

      <PageHead
        eyebrow="My performance"
        title="My 1:1 sessions"
        sub="Your check-ins with managers, peers and mentors. Prep agenda items before, read shared notes and action items after."
        actions={<>
          <Btn variant="ghost" icon="add" onClick={() => { setShowRequest(r => !r); setReqSent(false); }}>Request a 1:1</Btn>
        </>}
      />

      {showRequest && (
        <div className="card mb-4" style={{ borderColor: 'var(--brand-blue-200)', background: 'var(--brand-blue-50, #f0f6ff)' }}>
          <div style={{ padding: '18px 22px' }}>
            {reqSent ? (
              <div className="row items-center gap-3" style={{ fontSize: 14, fontWeight: 600, color: 'var(--success-dark)' }}>
                <span className="ms" style={{ fontSize: 22 }}>check_circle</span>
                Request sent! Your manager will be notified.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 12 }}>
                  Request a 1:1 with your manager
                </div>
                <div className="col gap-3">
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', display: 'block', marginBottom: 4 }}>
                      What do you want to discuss? <span style={{ color: 'var(--error-main)' }}>*</span>
                    </label>
                    <textarea
                      value={reqMessage}
                      onChange={e => setReqMessage(e.target.value)}
                      placeholder="e.g. I'd like to discuss my Q4 goals and get some guidance on the Lead Ops path…"
                      rows={3}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: '1.5px solid var(--grey-200)', borderRadius: 8,
                        padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
                        resize: 'vertical', outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', display: 'block', marginBottom: 4 }}>
                      Proposed time (optional)
                    </label>
                    <input
                      type="text"
                      value={reqTime}
                      onChange={e => setReqTime(e.target.value)}
                      placeholder="e.g. This week, Friday afternoon"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: '1.5px solid var(--grey-200)', borderRadius: 8,
                        padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </div>
                  <div className="row gap-2">
                    <Btn variant="primary" icon="send" onClick={sendRequest} disabled={reqSending || !reqMessage.trim()}>
                      {reqSending ? 'Sending…' : 'Send request'}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setShowRequest(false)}>Cancel</Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="stats-row c-3 mb-4">
        <StatCard tone="blue"  icon="event_available" label="Upcoming"            value="4" sub="Next: today at 10:00 AM" />
        <StatCard tone="green" icon="task_alt"        label="Action items"        value="2 / 4" sub="Open / completed this month" />
        <StatCard tone="purple"icon="schedule"        label="Sessions this year"  value="38" sub="34 with manager · 4 skip-level" />
      </div>

      {/* Live now card */}
      <div className="card mb-4" style={{ borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 4px var(--brand-blue-100)' }}>
        <div style={{ padding: '20px 24px' }}>
          <div className="row items-center gap-3 mb-3">
            <Avatar name={today.with} size="lg" />
            <div className="flex-1">
              <div className="row items-center gap-2 mb-1">
                <Pill variant="active" dot>Live now</Pill>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {today.when} · {today.time}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>1:1 with {today.with}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>{today.role}</div>
            </div>
            <Btn variant="primary" icon="edit_note" onClick={() => setOpenNotes({
              when: today.when + ' · ' + today.time, with: today.with, role: today.role, live: true,
              agenda: today.agenda,
              summary: '',
              actionItems: [],
              linked: [{ kind: 'okr', label: 'Complete 6 migrations · 90%' }, { kind: 'project', label: 'Payroll Migration EU · Done' }],
            })}>Take notes</Btn>
          </div>

          <div style={{ background: 'var(--brand-blue-50)', borderRadius: 10, padding: '14px 16px' }}>
            <div className="row items-center between mb-2">
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-blue-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shared agenda</div>
              <Btn variant="text" size="sm" icon="add">Add item</Btn>
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.7 }}>
              {today.agenda.map((a, i) => <li key={i}>{a}</li>)}
            </ol>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <SectionCard
        title="Upcoming sessions"
        sub="Add to your shared agenda anytime"
        icon="event"
        padBody={false}
      >
        <div>
          {upcoming.map((m, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--grey-50)' : 'none',
              display: 'grid', gridTemplateColumns: '160px 240px 1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.when}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', fontWeight: 600, marginTop: 2 }}>{m.time}</div>
              </div>
              <div className="worker-cell">
                <Avatar name={m.with} size="sm" />
                <div>
                  <div className="name">{m.with}</div>
                  <div className="role">{m.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{m.agenda}</div>
              <Btn variant="ghost" size="sm" icon="add">Add agenda</Btn>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Past sessions with shared notes */}
      <div className="mt-4">
        <SectionCard
          title="Past sessions"
          sub="Shared notes and action items from previous 1:1s — manager private notes aren't visible to you"
          icon="history"
          padBody={false}
        >
          {past.map((p, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: i < past.length - 1 ? '1px solid var(--grey-50)' : 'none',
              display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.when}</div>
                <div className="row items-center gap-2 mt-2">
                  <Avatar name={p.with} size="xs" />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--grey-700)' }}>{p.with}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 3 }}>{p.role}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: p.actionItems.length || p.linked.length ? 12 : 0 }}>{p.summary}</div>
                {p.linked.length > 0 && (
                  <div className="row gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                    {p.linked.map((l, j) => (
                      <Pill key={j} variant={l.kind === 'okr' ? 'contrib' : l.kind === 'project' ? 'contractor' : 'review-due'}
                        icon={l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}>{l.label}</Pill>
                    ))}
                  </div>
                )}
                {p.actionItems.length > 0 && (
                  <div className="col gap-2 mt-2">
                    {p.actionItems.map((a, j) => (
                      <div key={j} className="row items-center gap-2" style={{ fontSize: 12.5, color: a.done ? 'var(--fg-disabled)' : 'var(--grey-700)',
                        textDecoration: a.done ? 'line-through' : 'none' }}>
                        <span className="ms" style={{ fontSize: 16, color: a.done ? 'var(--success-main)' : 'var(--grey-300)' }}>
                          {a.done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {a.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Btn variant="ghost" size="sm" icon="open_in_new" onClick={() => setOpenNotes(p)}>Open notes</Btn>
            </div>
          ))}
        </SectionCard>
      </div>

      <Callout tone="info" icon="visibility_off" style={{ marginTop: 16 }}>
        Manager <strong>private notes</strong> are not visible to you. You see the shared notes, shared agenda, and action items you both agreed to.
      </Callout>
    </Shell>
  );
}

/* Worker-only notes view: read-only shared notes + action items.
   Mirrors the manager's MeetingNotesEditor layout but hides the private panel. */
function WorkerNotesView({ meeting, onBack }) {
  const [privateDirty, setPrivateDirtyWN] = React.useState(false);

  return (
    <div className="notes-takeover">
      <div className="topbar">
        <div className="lead">
          <button className="back" onClick={onBack}><span className="ms">arrow_back</span></button>
          <h2><Avatar name={meeting.with} size="md" />1:1 with {meeting.with}</h2>
        </div>
        <div className="actions">
          <Btn variant="ghost" icon="rate_review">Attach to self-review</Btn>
          <Btn variant="primary" icon="check">Done</Btn>
        </div>
      </div>

      <div className="notes-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 32, alignItems: 'flex-start' }}>
          <div className="notes-rail">
            <div className="notes-event">
              <div className="when">{meeting.when} {meeting.live && <Pill variant="active" dot>Live now</Pill>}</div>

              {meeting.linked?.length > 0 && (
                <div className="linked-strip">
                  {meeting.linked.map((l, i) => (
                    <span key={i} className="linked-chip">
                      <span className="ms">{l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}</span>{l.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Shared notes (read-only worker view) */}
              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">groups</span>Shared Notes
                    <span className="meta"><span className="ms">visibility</span>You & your manager</span>
                  </div>
                  <div className="saved">Live · synced<span className="ind" /></div>
                </div>
                <div className="editor-body" style={{ minHeight: 90 }}>
                  {meeting.summary || (
                    <em style={{ color: 'var(--fg-secondary)' }}>Shared notes will appear here once your manager starts writing.</em>
                  )}
                </div>

                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div className="action-section">
                    <div className="h">Action Items</div>
                    {meeting.actionItems.map((a, i) => (
                      <div key={i} className={`action-row ${a.done ? 'done' : ''}`}>
                        <div className={`check-sq ${a.done ? 'done' : ''}`}>
                          {a.done && <span className="ms">check</span>}
                        </div>
                        <span className="text">{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My private notes — only visible to the worker */}
              <div className="notes-card" style={{ borderLeftColor: 'var(--brand-blue-500)' }}>
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">person</span>My private notes
                    <span className="meta"><span className="ms">visibility_off</span>Only visible to me</span>
                  </div>
                  <div className="saved">
                    {privateDirty
                      ? <><span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span><span className="ind unsaved" /></>
                      : <>Saved<span className="ind" /></>}
                  </div>
                </div>
                <EditorToolbar />
                <div
                  className="editor-body"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  data-placeholder="Your private notes — only you can see these…"
                  style={{ minHeight: 100, outline: 'none' }}
                  onInput={() => setPrivateDirtyWN(true)}
                  onBlur={() => setPrivateDirtyWN(false)}
                >
                  Want to ask Priya about the Lead Ops promotion track and whether I can shadow her on the next QBR.
                </div>
              </div>
            </div>

            {/* Privacy callout */}
            <div className="notes-event past">
              <div className="when" style={{ color: 'var(--fg-disabled)' }}>
                <span className="ms" style={{ fontSize: 16 }}>visibility_off</span>
                Your manager's private notes are not visible to you.
              </div>
            </div>
          </div>

          <div className="notes-side" style={{ position: 'sticky', top: 0 }}>
            <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
              <div className="h" style={{ marginTop: 0 }}>Linked</div>
              {meeting.linked?.length > 0 ? (
                <div className="col gap-2">
                  {meeting.linked.map((l, i) => (
                    <Pill key={i} variant={l.kind === 'okr' ? 'contrib' : l.kind === 'project' ? 'contractor' : 'review-due'}
                      icon={l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}>{l.label}</Pill>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>None yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WorkerMeetings = WorkerMeetings;


/* ============================================================================
   FILE: frames/client-meetings.jsx
   ============================================================================ */

/* Frame 3 — 1:1 Meetings (Client / Manager)
   Day-wise layout: Today, Tomorrow, This Week, Past Sessions.
   Each meeting card: worker, time, linked OKR/project, agenda, notes, action items. */

const { useState: useState11, useEffect: useEffect11 } = React;

// Resolved at runtime — defined in client-reviews.jsx which loads first
const CompensationConfigPanel = () => {
  const Panel = window.CompensationConfigPanel;
  return Panel ? React.createElement(Panel) : null;
};

function ClientMeetings() {
  const [openCard, setOpenCard] = useState11('m-now'); // which card has full notes expanded
  const [notesOpen, setNotesOpen] = useState11(null); // a meeting object when editor is open
  const [scheduleModal, setScheduleModal] = useState11(null); // null | { mode, meeting }
  const [storeVersion, setStoreVersion] = useState11(0);

  useEffect11(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  const today = [];

  function meetingTimeParts(scheduledAt = '') {
    const match = String(scheduledAt).match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    return {
      time: match?.[1] || '9:30',
      ap: (match?.[2] || 'AM').toUpperCase(),
    };
  }

  const storeMeetings = window.PerformanceStore.getData().meetings.map(m => {
    const worker = window.PerformanceStore.workerById(m.workerId);
    const linkedGoals = (m.linkedGoalIds || []).map(id => window.PerformanceStore.getGoals().find(g => g.id === id)).filter(Boolean);
    const timeParts = meetingTimeParts(m.scheduledAt);
    return {
      id: m.id,
      storeMeeting: m,
      status: m.status === 'live' ? 'now' : m.status,
      time: timeParts.time,
      dur: '30 min',
      ap: timeParts.ap,
      worker: worker?.name || 'Worker',
      role: worker?.role || '',
      links: linkedGoals.map(goal => ({ kind: 'okr', label: goal.title })),
      agenda: m.agenda,
      prevNotes: m.sharedNotes,
      actionItems: (m.actionItems || []).filter(a => a.shared !== false),
    };
  });
  const visibleToday = storeMeetings.length ? storeMeetings : today;

  const tomorrow = [];
  const thisWeek = [];
  const past = [];

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', '1:1 Meetings']}>

      {notesOpen ? (
        <MeetingNotesEditor
          meetingId={notesOpen.storeMeeting?.id || notesOpen.id}
          worker={notesOpen.worker}
          role={notesOpen.role}
          initialSharedNotes={notesOpen.storeMeeting?.sharedNotes || notesOpen.prevNotes || ''}
          initialPrivateNotes={notesOpen.storeMeeting?.managerPrivateNotes || ''}
          initialActions={notesOpen.storeMeeting?.actionItems || notesOpen.actionItems}
          linked={notesOpen.links?.map(l => ({
            icon: l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews',
            label: l.label,
          })) || []}
          onBack={() => setNotesOpen(null)}
        />
      ) : (<>

      {scheduleModal && (
        <ScheduleMeetingModal
          mode={scheduleModal.mode}
          meeting={scheduleModal.meeting}
          onCancel={() => setScheduleModal(null)}
          onSave={async (payload) => {
            try {
              if (scheduleModal.mode === 'edit' && scheduleModal.meeting?.storeMeeting) {
                await window.PerformanceStore.updateMeetingNotes(scheduleModal.meeting.storeMeeting.id, payload);
              } else {
                await window.PerformanceStore.createMeeting(payload);
              }
              setScheduleModal(null);
            } catch (e) {
              console.error('schedule meeting failed', e);
              alert(`Could not save meeting: ${e.message}`);
            }
          }}
        />
      )}

      <PerfTabs active="meetings" />

      <PageHead
        eyebrow="Performance Management"
        title="1:1 Meetings"
        sub="Run check-ins with your direct reports. Link notes to goals, projects, feedback, or reviews — convert action items into real follow-ups."
        actions={<>
          <Btn variant="primary" icon="add" onClick={() => setScheduleModal({ mode: 'create' })}>Schedule 1:1</Btn>
        </>}
      />

      {/* Top mini stats — derived from the store, not hardcoded */}
      {(() => {
        const allMeetings = window.PerformanceStore.getData().meetings || [];
        const allActions = allMeetings.flatMap(m => m.actionItems || []);
        const closed = allActions.filter(a => a.done).length;
        const total = allActions.length;
        return (
          <div className="stats-row c-3 mb-4">
            <StatCard tone="blue"   icon="event_available" label="1:1s today"           value={String(visibleToday.length)} sub={visibleToday.length ? 'Scheduled or live' : 'No 1:1s today'} />
            <StatCard tone="purple" icon="calendar_month"  label="This week"            value={String(allMeetings.length)}  sub={allMeetings.length ? 'Total scheduled' : 'Nothing scheduled'} />
            <StatCard tone="green"  icon="task_alt"        label="Action items closed"  value={total ? `${closed} / ${total}` : '0'} sub={total ? 'Across all meetings' : 'No items yet'} />
          </div>
        );
      })()}

      {/* Two-column: day-wise meeting list (left) + meeting detail (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Left — day-wise meetings */}
        <div>
          {/* Day · Today */}
          <div className="day-row" style={{ marginTop: 0 }}>
            <span className="label">Today</span>
            <span className="date">Wed, Mar 26 · 2026</span>
            <span className="count">{visibleToday.length} meetings</span>
            <span className="line" />
          </div>
          {visibleToday.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} onEdit={() => setScheduleModal({ mode: 'edit', meeting: m })} />)}

          {/* Day · Tomorrow */}
          <div className="day-row">
            <span className="label">Tomorrow</span>
            <span className="date">Thu, Mar 27</span>
            <span className="count">{tomorrow.length} meetings</span>
            <span className="line" />
          </div>
          {tomorrow.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} onEdit={() => setScheduleModal({ mode: 'create' })} />)}

          {/* Day · This week */}
          <div className="day-row">
            <span className="label">Rest of this week</span>
            <span className="date">Mar 27–29</span>
            <span className="count">{thisWeek.length} meetings</span>
            <span className="line" />
          </div>
          <div className="tbl-card">
            <table className="tbl">
              <thead><tr><th>When</th><th>Worker</th><th>Agenda</th><th /></tr></thead>
              <tbody>
                {thisWeek.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.day} · {m.date}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-secondary)', fontWeight: 600, marginTop: 2 }}>{m.time} {m.ap}</div>
                    </td>
                    <td>
                      <div className="worker-cell">
                        <Avatar name={m.worker} size="sm" />
                        <div>
                          <div className="name">{m.worker}</div>
                          <div className="role">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{m.agenda}</span></td>
                    <td className="actions-cell">
                      <Btn variant="ghost" size="sm" icon="edit" onClick={() => setScheduleModal({ mode: 'create' })}>Edit</Btn>
                      <Btn variant="ghost" size="sm" icon="edit_note" onClick={() => setNotesOpen(m)}>Add notes</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Past sessions */}
          <div className="day-row">
            <span className="label">Past sessions</span>
            <span className="date">Last 30 days</span>
            <span className="count">42 meetings</span>
            <span className="line" />
          </div>
          <div className="tbl-card">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Worker</th><th>Topic</th><th>Notes summary</th><th /></tr></thead>
              <tbody>
                {past.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-700)' }}>{p.when}</span></td>
                    <td>
                      <div className="worker-cell"><Avatar name={p.worker} size="sm" /><span className="name">{p.worker}</span></div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.topic}</span>
                      {p.flag === 'follow-up' && <Pill variant="warning" style={{ marginLeft: 8 }} icon="schedule">Follow-up</Pill>}
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{p.notesLine}</span></td>
                    <td className="actions-cell"><Btn variant="ghost" size="sm" icon="open_in_new">Open</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — upcoming meets */}
        <UpcomingMeetings todayList={visibleToday} tomorrowList={tomorrow} weekList={thisWeek} onOpenNotes={setNotesOpen} />
      </div>
      </>)}
    </Shell>
  );
}

/* ----- Schedule / edit meeting modal ----- */
function ScheduleMeetingModal({ mode = 'create', meeting, onCancel, onSave }) {
  const workers = window.PerformanceStore.getWorkers();
  // Default to the first real worker in the org (cuid), not a hardcoded legacy id.
  const initialWorkerId = meeting?.storeMeeting?.workerId || workers[0]?.id || '';
  const today = new Date().toISOString().slice(0, 10);
  const [workerId, setWorkerId] = useState11(initialWorkerId);
  const [date, setDate] = useState11(meeting?.storeMeeting?.scheduledDate || today);
  const [time, setTime] = useState11(meeting?.time || '10:00');
  const [ampm, setAmpm] = useState11(meeting?.ap || 'AM');
  const [agendaText, setAgendaText] = useState11((meeting?.storeMeeting?.agenda || meeting?.agenda || ['Goal check-in']).join('\n'));
  const [linkedGoalId, setLinkedGoalId] = useState11(meeting?.storeMeeting?.linkedGoalIds?.[0] || '');
  const selectedWorker = workers.find(w => w.id === workerId) || workers[0];
  const workerGoals = workerId ? window.PerformanceStore.getGoalsForWorker(workerId) : [];

  function toIsoDateTime(d, t, ap) {
    // Convert "10:00 AM" / "2:30 PM" → 24h then build an ISO string.
    const m = String(t || '').match(/^(\d{1,2}):(\d{2})/);
    if (!m) return new Date(`${d}T09:00:00`).toISOString();
    let hh = Number(m[1]);
    const mm = m[2];
    if (ap === 'PM' && hh < 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return new Date(`${d}T${String(hh).padStart(2,'0')}:${mm}:00`).toISOString();
  }

  function save() {
    if (!workerId) { alert('Pick a worker'); return; }
    const agenda = agendaText.split('\n').map(item => item.trim()).filter(Boolean);
    onSave({
      workerId,
      title: `1:1 with ${selectedWorker?.name || 'Worker'}`,
      scheduledDate: date,
      scheduledAt: toIsoDateTime(date, time, ampm),
      status: meeting?.storeMeeting?.status || 'scheduled',
      agenda,
      linkedGoalIds: linkedGoalId ? [linkedGoalId] : [],
      linkedKeyResultIds: [],
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620,
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--grey-800)' }}>{mode === 'edit' ? 'Edit 1:1' : 'Schedule 1:1'}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 3 }}>Select worker, date, time, linked goal, and agenda.</div>
          </div>
          <IconBtn icon="close" title="Close" onClick={onCancel} />
        </div>

        <div style={{ padding: 22, display: 'grid', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Worker</div>
            <select value={workerId} onChange={e => { setWorkerId(e.target.value); setLinkedGoalId(''); }}
              style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} · {w.role}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Time</div>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Period</div>
              <select value={ampm} onChange={e => setAmpm(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Linked goal</div>
            <select value={linkedGoalId} onChange={e => setLinkedGoalId(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
              <option value="">No linked goal</option>
              {workerGoals.map(goal => <option key={goal.id} value={goal.id}>{goal.title} · {goal.progress}%</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Agenda</div>
            <textarea value={agendaText} onChange={e => setAgendaText(e.target.value)}
              placeholder="One agenda item per line"
              style={{ width: '100%', minHeight: 110, border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" icon={mode === 'edit' ? 'save' : 'event'} onClick={save}>{mode === 'edit' ? 'Save changes' : 'Schedule'}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ----- Meeting card (left rail) ----- */
function MeetingCard({ m, selected, onSelect, onAddNotes, onEdit }) {
  return (
    <div className={`meeting ${m.status === 'now' ? 'now' : m.status === 'past' ? 'past' : 'upcoming'}`}
      style={selected ? { borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 3px var(--brand-blue-100)' } : undefined}
      onClick={onSelect}
    >
      <div className="when">
        <div className="time">{m.time}</div>
        <div className="ap">{m.ap}</div>
        <div className="dur">{m.dur}</div>
      </div>
      <div className="b">
        <div className="top">
          <div className="who">
            <Avatar name={m.worker} size="md" />
            <div>
              <div className="name">{m.worker}</div>
              <div className="role">{m.role}</div>
            </div>
          </div>
          <div className="actions">
            {m.status === 'now' && <Pill variant="active" dot>Live now</Pill>}
            {m.flag?.kind === 'at-risk' && <Pill variant="at-risk" dot>{m.flag.text}</Pill>}
            {m.flag?.kind === 'warning' && <Pill variant="warning" icon="flag">{m.flag.text}</Pill>}
            <Btn variant="ghost" size="sm" icon="edit" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }}>Edit</Btn>
            <Btn variant={m.status === 'now' ? 'primary' : 'outlined'} size="sm" icon="edit_note" onClick={(e) => { e.stopPropagation(); onAddNotes && onAddNotes(); }}>
              {m.status === 'now' ? 'Take notes' : 'Add notes'}
            </Btn>
          </div>
        </div>
        <div className="agenda">
          <strong style={{ color: 'var(--grey-700)', fontWeight: 700 }}>Agenda · </strong>
          {Array.isArray(m.agenda) ? m.agenda.slice(0, 2).join(' · ') : m.agenda}
        </div>
      </div>
    </div>
  );
}

/* ----- Upcoming meets (right panel) — capped at 5 ----- */
function UpcomingMeetings({ todayList, tomorrowList, weekList, onOpenNotes }) {
  const MAX = 5;
  const all = [
    ...todayList
      .filter(m => m.status !== 'now' && m.status !== 'past')
      .map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: 'Today', subLabel: 'Wed, Mar 26', time: m.time, ap: m.ap, raw: m })),
    ...tomorrowList.map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: 'Tomorrow', subLabel: 'Thu, Mar 27', time: m.time, ap: m.ap, raw: m })),
    ...weekList.map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: m.day, subLabel: m.date, time: m.time, ap: m.ap, raw: m })),
  ];
  const items = all.slice(0, MAX);
  const more = Math.max(0, all.length - items.length);

  function agendaLine(a) {
    if (!a) return '';
    return Array.isArray(a) ? a[0] : a;
  }

  return (
    <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
      <div className="card-head" style={{ paddingBottom: 10 }}>
        <div>
          <div className="title row items-center gap-2">
            <span className="ms" style={{ color: 'var(--brand-blue-500)' }}>event_upcoming</span>
            Upcoming meets
          </div>
          <div className="sub">Next {items.length} of {all.length} scheduled</div>
        </div>
      </div>

      <div>
        {items.map((m, idx) => (
          <div
            key={m.id}
            onClick={() => onOpenNotes && onOpenNotes(m.raw)}
            style={{
              display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center',
              padding: '12px 18px',
              borderTop: '1px solid var(--grey-50)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '6px 4px',
              background: 'var(--brand-blue-100)',
              borderRadius: 8,
              color: 'var(--brand-blue-600)',
              lineHeight: 1.05,
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.dateLabel}</div>
              <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{m.time}</div>
              <div style={{ fontSize: 9.5, fontWeight: 800 }}>{m.ap}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row items-center gap-2" style={{ marginBottom: 2 }}>
                <Avatar name={m.worker} size="xs" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.worker}</span>
              </div>
              <div style={{
                fontSize: 11.5, color: 'var(--grey-700)', lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {agendaLine(m.agenda)}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: '22px 18px', fontSize: 12.5, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            No upcoming meetings.
          </div>
        )}
        {more > 0 && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--grey-50)', fontSize: 11.5, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            +{more} more in the schedule below
          </div>
        )}
      </div>
    </div>
  );
}

window.ClientMeetings = ClientMeetings;


/* ============================================================================
   FILE: frames/meeting-notes.jsx
   ============================================================================ */

/* 1:1 Meeting notes editor — rich takeover modeled on the screenshot.
   Two cards per meeting timeline entry: Shared Notes (yellow accent) +
   Private Notes (red accent), each with a formatting toolbar and an Action
   Items section. Prior meetings show as additional events on the rail. */

const { useState: useStateNE } = React;

function MeetingNotesEditor({ worker = 'Aditi Sharma', role = 'Senior Ops · weekly', linked = [], onBack }) {
  const [sharedDirty,  setSharedDirty]  = useStateNE(false);
  const [privateDirty, setPrivateDirty] = useStateNE(false);
  const [actions, setActions] = useStateNE([
    { id: 'a1', text: 'Share v2 migration runbook with Aditi',         done: true,  owner: 'P' },
    { id: 'a2', text: 'Confirm Aditi shadows Lina on Spain kickoff',   done: true,  owner: 'P' },
    { id: 'a3', text: 'Draft career-ladder doc for Lead Ops by Apr 5', done: false, owner: 'P', due: 'Apr 5' },
  ]);

  const toggle = id => setActions(actions.map(a => a.id === id ? { ...a, done: !a.done } : a));

  /* ===== Past meeting (read-only style) ===== */
  const past = {
    when: 'Mar 17 · 11:00 AM',
    sharedNote: 'Set Q3 goals: 6 migrations, mentor Lina, and one knowledge-share talk. Aditi noted runbook gaps from the Italy cutover.',
    privateNote: 'Watch for over-commitment — Aditi tends to absorb scope. Encourage her to delegate the cutover-day playbook to Lina.',
    actions: [
      { id: 'p1', text: 'Pair on cutover-day playbook with Lina', done: true,  owner: 'A' },
      { id: 'p2', text: 'File JIRA tickets for the runbook gaps', done: true,  owner: 'A' },
    ],
  };

  return (
    <div className="notes-takeover">
      {/* Topbar */}
      <div className="topbar">
        <div className="lead">
          <button className="back" onClick={onBack} title="Back"><span className="ms">arrow_back</span></button>
          <h2>
            <Avatar name={worker} size="md" />
            1:1 with {worker}
          </h2>
        </div>
        <div className="actions">
          <Btn variant="ghost" icon="summarize">Summary</Btn>
          <Btn variant="ghost" icon="rate_review">Send to review</Btn>
          <Btn variant="ghost" icon="forum">Convert to feedback</Btn>
          <Btn variant="primary" icon="check">Done</Btn>
        </div>
      </div>

      {/* Body */}
      <div className="notes-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 32, alignItems: 'flex-start' }}>
          {/* Timeline + cards */}
          <div className="notes-rail">

            {/* ====== Today's meeting ====== */}
            <div className="notes-event" id="evt-today">
              <div className="when">Mar 26 <span className="sep">·</span> 10:00 AM <Pill variant="active" dot>Live now</Pill></div>

              {linked.length > 0 && (
                <div className="linked-strip">
                  {linked.map((l, i) => (
                    <span key={i} className="linked-chip">
                      <span className="ms">{l.icon}</span>{l.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Shared notes card */}
              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">groups</span>Shared Notes
                  </div>
                  <div className="saved">
                    {sharedDirty
                      ? <><span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span><span className="ind unsaved" /></>
                      : <>Saved at 10:23 AM<span className="ind" /></>}
                    <button className="help-i" title="Formatting help"><span className="ms">help</span></button>
                  </div>
                </div>
                <EditorToolbar />
                <div
                  className="editor-body"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  data-placeholder="Start writing shared notes…"
                  style={{ outline: 'none' }}
                  onInput={() => setSharedDirty(true)}
                  onBlur={() => setSharedDirty(false)}
                >
                  <div>Migration wrapped clean — Aditi led the Spain cutover with zero P0s. Customer signed a 3-year renewal the same week.</div>
                  <div style={{ marginTop: 8 }}>Q4 priorities discussed: pick up Brazil + take Lina as a shadow. Aditi wants to formalize her Lead Ops path.</div>
                  <div className="ai-prompt">
                    <span className="ms" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4, color: 'var(--brand-blue-500)' }}>lightbulb</span>
                    Suggestion: link this note to her OKR <strong>"Complete 6 migrations"</strong> — it's 90% done.
                  </div>
                </div>

                {/* Action items inline */}
                <div className="action-section">
                  <div className="h">Action Items</div>
                  {actions.map(a => (
                    <div key={a.id} className={`action-row ${a.done ? 'done' : ''}`}>
                      <div className={`check-sq ${a.done ? 'done' : ''}`} onClick={() => toggle(a.id)}>
                        {a.done && <span className="ms">check</span>}
                      </div>
                      <span className="text">{a.text}</span>
                      {a.due && <span className="due-chip"><span className="ms">event</span>{a.due}</span>}
                      <span className="owner-chip">{a.owner}</span>
                      <span className="row-x" title="Remove"><span className="ms" style={{ fontSize: 16 }}>close</span></span>
                    </div>
                  ))}
                  <div className="add-row"><span className="ms">add</span>Add action item</div>
                </div>
              </div>

              {/* Private notes card */}
              <div className="notes-card private">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">lock</span>Private Notes
                    <span className="meta"><span className="ms">visibility</span>Only visible to you</span>
                  </div>
                  <div className="saved">
                    {privateDirty
                      ? <><span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span><span className="ind unsaved" /></>
                      : <>Saved<span className="ind" /></>}
                  </div>
                </div>
                <EditorToolbar />
                <div
                  className="editor-body"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  data-placeholder="Private thoughts — only you can see these…"
                  style={{ outline: 'none' }}
                  onInput={() => setPrivateDirty(true)}
                  onBlur={() => setPrivateDirty(false)}
                >
                  Consider Aditi for a promotion case in Q4 — she's outpacing the Lead Ops ladder. Sync with Hannah before raising it.
                </div>
              </div>
            </div>

            {/* ====== Previous meeting (read-only) ====== */}
            <div className="notes-event past" id="evt-prev">
              <div className="when">{past.when}</div>

              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead"><span className="ms">groups</span>Shared Notes</div>
                  <div className="saved">Read-only · 9 days ago<span className="ind" /></div>
                </div>
                <div className="editor-body" style={{ minHeight: 60 }}>{past.sharedNote}</div>
                <div className="action-section">
                  <div className="h">Action Items</div>
                  {past.actions.map(a => (
                    <div key={a.id} className={`action-row ${a.done ? 'done' : ''}`}>
                      <div className={`check-sq ${a.done ? 'done' : ''}`}>
                        {a.done && <span className="ms">check</span>}
                      </div>
                      <span className="text">{a.text}</span>
                      <span className="owner-chip">{a.owner}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="notes-card private">
                <div className="nc-head">
                  <div className="lead"><span className="ms">lock</span>Private Notes
                    <span className="meta"><span className="ms">visibility</span>Only visible to you</span>
                  </div>
                  <div className="saved">Read-only<span className="ind" /></div>
                </div>
                <div className="editor-body" style={{ minHeight: 60 }}>{past.privateNote}</div>
              </div>
            </div>

            {/* New meeting placeholder */}
            <div className="notes-event past">
              <div className="when" style={{ color: 'var(--fg-disabled)' }}>
                <span className="ms" style={{ fontSize: 16 }}>history</span>
                Older sessions (3 more) — scroll up to load
              </div>
            </div>
          </div>

          {/* Right side: quick jump + linked context */}
          <div className="notes-side" style={{ position: 'sticky', top: 0 }}>
            <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
              <div className="h" style={{ marginTop: 0 }}>Sessions</div>
              <div className="item active"><span className="dot" />Today · 10:00 AM<span className="meta">Live</span></div>
              <div className="item"><span className="dot" />Mar 17<span className="meta">9d ago</span></div>
              <div className="item"><span className="dot" />Mar 10<span className="meta">16d ago</span></div>
              <div className="item"><span className="dot" />Mar 03<span className="meta">23d ago</span></div>
              <div className="item"><span className="dot" />Feb 24<span className="meta">30d ago</span></div>
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="h" style={{ marginTop: 0 }}>Linked</div>
              <div className="col gap-2">
                <Pill variant="contrib" icon="flag">Complete 6 migrations · 90%</Pill>
                <Pill variant="contractor" icon="rocket_launch">Payroll Migration EU · Done</Pill>
              </div>
              <Btn variant="text" size="sm" icon="add" style={{ marginTop: 8, padding: '4px 8px' }}>Link goal / project</Btn>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)', fontSize: 11.5, color: 'var(--fg-secondary)', fontWeight: 600, lineHeight: 1.5 }}>
                <span className="ms" style={{ fontSize: 14, color: 'var(--brand-blue-500)', verticalAlign: '-2px', marginRight: 4 }}>summarize</span>
                Action items will be summarized into your follow-up list when you mark the meeting done.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable formatting toolbar matching the screenshot */
function EditorToolbar() {
  return (
    <div className="editor-toolbar">
      <button className="tb-btn" title="Toggle check"><span className="ms">check_circle</span></button>
      <button className="tb-btn" title="Insert action item"><span className="ms">check_box</span></button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Heading 1">H<span className="h-num">1</span></button>
      <button className="tb-btn" title="Heading 2">H<span className="h-num">2</span></button>
      <span className="tb-sep" />
      <button className="tb-btn active" style={{ fontWeight: 800 }} title="Bold">B</button>
      <button className="tb-btn" style={{ fontStyle: 'italic', fontWeight: 700 }} title="Italic">I</button>
      <button className="tb-btn" style={{ textDecoration: 'underline', fontWeight: 700 }} title="Underline">U</button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Numbered list"><span className="ms">format_list_numbered</span></button>
      <button className="tb-btn" title="Bulleted list"><span className="ms">format_list_bulleted</span></button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Link"><span className="ms">link</span></button>
      <button className="tb-btn" title="Mention"><span className="ms">alternate_email</span></button>
      <span className="tb-right">
        <button className="tb-btn" title="Smart assist" style={{ color: 'var(--brand-blue-500)' }}><span className="ms">lightbulb</span></button>
      </span>
    </div>
  );
}

window.MeetingNotesEditor = MeetingNotesEditor;
