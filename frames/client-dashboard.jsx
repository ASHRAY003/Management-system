/* Frame 1 — Client / Manager Performance Dashboard
   Persona: HR admin / people manager at the client (Acme Holdings)
   KPI cards, Goal Progress, Review Cycle Status, Project Performance
   Signals, Recent Feedback. */

function ClientDashboard() {
  // Live counts derived from the store
  const Store = window.PerformanceStore;
  const allGoals = Store.getGoals();
  const allMeetings = Store.getData().meetings;
  const allCycles = Store.getReviewCycles();

  const kpis = [
    { tone: 'blue',    icon: 'flag',           label: 'Active OKRs',     value: String(allGoals.length),    sub: `${allGoals.filter(g => g.status === 'on_track' || g.status === 'on-track').length} on track · ${allGoals.filter(g => g.status === 'at_risk' || g.status === 'at-risk').length} at risk`, route: '/client/okrs' },
    { tone: 'purple',  icon: 'rocket_launch',  label: 'Linked projects', value: String(new Set(allGoals.map(g => g.linkedProject).filter(Boolean)).size), sub: 'Projects referenced by goals', route: '/projects' },
    { tone: 'teal',    icon: 'event_available',label: '1:1s this month', value: String(allMeetings.length),  sub: `${allMeetings.filter(m => m.status === 'scheduled' || m.status === 'live').length} scheduled`, route: '/client/meetings' },
  ];

  const attentionGoals = [];
  const goals = allGoals.map(g => ({
    name: g.title,
    owner: (g.assigneeIds || []).map(id => Store.workerById(id)?.name).filter(Boolean).join(', ') || '—',
    project: g.linkedProject || '',
    pct: g.progress || 0,
    status: (g.status || '').replace('_', '-'),
    due: g.dueDate || '',
    okrType: g.type || 'individual',
  }));

  const cycles = allCycles.map(c => ({
    name: c.name,
    type: c.reviewType ? c.reviewType[0].toUpperCase() + c.reviewType.slice(1) : 'Quarterly',
    participants: (Store.getReviewParticipants(c.id) || []).length,
    pct: 0,
    pending: 'Workers',
    due: c.managerReviewDueDate || c.periodEnd || '',
    status: c.status,
  }));

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Dashboard']}>

      <PerfTabs active="dashboard" />

      <PageHead
        eyebrow="Performance Management"
        title="Performance overview"
        sub="Track goals, project outcomes, reviews, feedback, and compensation signals — all in one place."
        actions={<>
          <Btn variant="ghost" icon="forum" onClick={() => window.location.hash = '/client/reviews'}>Give feedback</Btn>
          <Btn variant="outlined" icon="play_circle" onClick={() => {
            window.sessionStorage.setItem('payo.reviews.openStepper', '1');
            window.location.hash = '/client/reviews';
          }}>Start review cycle</Btn>
          <Btn variant="primary" icon="add">Create goal</Btn>
        </>}
      />

      {/* KPI cards — clickable, route to relevant section */}
      <div className="stats-row c-3 mb-4">
        {kpis.map((k, i) => (
          <StatCard
            key={i}
            {...k}
            onClick={() => { if (k.route) window.location.hash = k.route; }}
          />
        ))}
      </div>

      {/* Needs attention — goals due in the next 10 days */}
      <GoalsDueSoon goals={attentionGoals} variant="client" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <SectionCard
          title="Goal progress overview"
          sub="Active OKRs across the company · top movers this week"
          icon="flag"
          action={<div className="row gap-2">
            <Btn variant="text"  size="sm" iconTrailing="arrow_forward">All goals</Btn>
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
                    <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2, textTransform: 'capitalize' }}>{g.okrType} OKR</div>
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
                  <td>{g.status === 'on-track'
                    ? <Pill variant="on-track" dot>On track</Pill>
                    : <Pill variant="at-risk"  dot>At risk</Pill>}</td>
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
            <Btn variant="text" size="sm" iconTrailing="arrow_forward">All cycles</Btn>
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
