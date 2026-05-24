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
