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
