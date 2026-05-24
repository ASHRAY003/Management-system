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
    { id: 'projects',   icon: 'work',          label: 'Projects' },
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
  const user = {
    client: { name: 'Priya Nair', email: 'priya@acme-holdings.com' },
    admin:  { name: 'Mel Johansson', email: 'm.johansson@payoneer.com' },
    worker: { name: 'Aditi Sharma', email: 'aditi.s@acme-holdings.com' },
  }[persona];

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
      <div className="ib"><span className="ms">notifications</span><span className="dot" /></div>
    </div>
  );
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
function StatCard({ tone = 'blue', icon, label, value, sub, trend }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="label">{label}</div>
      <div className="value-row">
        <div className="value">{value}</div>
        {trend && <span className={`trend ${trend.dir}`}>
          <span className="ms">{trend.dir === 'up' ? 'trending_up' : trend.dir === 'down' ? 'trending_down' : 'trending_flat'}</span>{trend.text}
        </span>}
      </div>
      {sub && <div className="sub">{sub}</div>}
      {icon && <div className="ico"><span className="ms">{icon}</span></div>}
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
    { id: 'dashboard',    label: 'Dashboard',              route: '/client/dashboard' },
    { id: 'okrs',         label: 'Goals & OKRs',           route: '/client/okrs' },
    { id: 'reviews',      label: 'Reviews',                route: '/client/reviews' },
    { id: 'meetings',     label: '1:1 Meetings',           route: '/client/meetings' },
  ],
  worker: [
    { id: 'dashboard',   label: 'Dashboard',        route: '/worker/dashboard' },
    { id: 'my-goals',    label: 'My Goals',         route: '/worker/goals' },
    { id: 'my-meetings', label: 'My 1:1 sessions',  route: '/worker/meetings' },
    { id: 'my-reviews',  label: 'Feedback received',route: '/worker/reviews' },
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

/* Export to window so all screen scripts can use these */
Object.assign(window, {
  Avatar, AvatarStack, Btn, IconBtn, Pill, ProgressBar, TrendChip, Spark, Stars,
  Sidebar, TopBar, Shell, PageHead, StatCard, FilterBar, Filter,
  Callout, SectionCard, AIFlag, PerfTabs, ImpersonationBanner,
  avatarColorFor,
});
