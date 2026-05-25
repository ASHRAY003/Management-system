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
