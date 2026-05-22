/* Frame · Worker My Goals
   Replaces the old "My OKRs" surface. Worker's personal goals view, with the
   same row layout as the client's People OKRs, plus a View action that opens
   the GoalDetail page. */

const { useState: useStateWG } = React;

function WorkerGoals() {
  const [stepper, setStepper] = useStateWG(null);
  const [detailGoal, setDetailGoal] = useStateWG(null);

  const goals = [
    {
      id: 'PO-01', role: 'owner',
      title: 'Complete 6 customer payroll migrations to v2 platform',
      pct: 90, status: 'on-track', due: 'Sep 30, 2026',
      linkedProject: 'Payroll Migration EU',
      ownerName: 'Aditi Sharma', ownerRole: 'Senior Ops',
      kr: [
        { t: 'Migrate 6 anchor customers',         pct: 100, current: '6', target: '6', unit: 'count' },
        { t: 'Zero P0 incidents during migration', pct: 100, current: '0', target: '0', unit: 'count' },
        { t: 'CSAT > 4.5 post-migration',          pct: 70,  current: '4.4', target: '4.5', unit: 'rating' },
      ],
    },
    {
      id: 'PO-09', role: 'owner',
      title: 'Mentor 2 junior teammates through their first migration',
      pct: 55, status: 'on-track', due: 'Dec 15, 2026',
      linkedProject: null,
      ownerName: 'Aditi Sharma', ownerRole: 'Senior Ops',
      kr: [
        { t: 'Pair on at least 4 client kickoffs',        pct: 75, current: '3', target: '4', unit: 'count' },
        { t: 'Document one knowledge transfer per month', pct: 50, current: '3', target: '6', unit: 'count' },
      ],
    },
    {
      id: 'TG-02', role: 'contrib',
      title: 'Improve overall payroll quality across EU runs',
      pct: 91, status: 'on-track', due: 'Sep 30, 2026',
      linkedProject: 'Payroll Migration EU',
      ownerName: 'Ops Team', ownerRole: 'Team owner',
      ownerHint: 'Owned by Ops Team',
      kr: [
        { t: 'Payroll runs without P0 below 1%',  pct: 95, current: '0.4', target: '1', unit: '%' },
        { t: 'Run accuracy ≥ 99.5%',              pct: 92, current: '99.4', target: '99.5', unit: '%' },
      ],
    },
    {
      id: 'CG-03', role: 'stakeholder',
      title: 'Build a global, compliant contractor experience',
      pct: 85, status: 'on-track', due: 'Sep 30, 2026',
      linkedProject: null,
      ownerName: 'Hannah Mueller', ownerRole: 'Head of Compliance',
      ownerHint: 'Company OKR · Hannah Mueller',
      kr: [],
    },
  ];

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My Goals']}>

      {stepper ? (
        <GoalStepper kind={stepper.kind} mode={stepper.mode} initial={stepper.initial}
          onCancel={() => setStepper(null)} onCreate={() => setStepper(null)} />
      ) : detailGoal ? (
        <GoalDetail goal={detailGoal} role="worker" onBack={() => setDetailGoal(null)} />
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
        <StatCard tone="green"   icon="flag"          label="Active goals"         value="4"   sub="2 owner · 1 contrib · 1 stake" />
        <StatCard tone="blue"    icon="trending_up"   label="Average progress"     value="80%" trend={{ dir: 'up', text: '+12%' }} sub="Last 30 days" />
        <StatCard tone="purple"  icon="check_circle"  label="Key results done"     value="7/10" sub="across all my goals" />
        <StatCard tone="amber"   icon="schedule"      label="Need attention"       value="1"   sub="No project link · KR drifting" />
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
        {goals.map(o => (
          <div className="okr-card" key={o.id}>
            <div className="o-head">
              <div className="o-title-block">
                <div className="o-eyebrow row items-center gap-2">
                  <Pill variant={o.role === 'owner' ? 'owner' : o.role === 'contrib' ? 'contrib' : 'stakeholder'}>
                    {o.role === 'owner' ? 'Owner' : o.role === 'contrib' ? 'Contributor' : 'Stakeholder'}
                  </Pill>
                  <span style={{ color: 'var(--fg-disabled)' }}>·</span>
                  <span>{o.id}</span>
                  {o.ownerHint && <><span style={{ color: 'var(--fg-disabled)' }}>·</span><span>{o.ownerHint}</span></>}
                </div>
                <div className="o-title" style={{ fontSize: 15 }}>{o.title}</div>
                <div className="o-meta">
                  {o.linkedProject ? (
                    <span className="item">
                      <span className="ms">link</span>
                      <span className="v" style={{ color: 'var(--brand-blue-600)' }}>{o.linkedProject}</span>
                    </span>
                  ) : (
                    <span className="item" style={{ color: 'var(--fg-disabled)' }}>
                      <span className="ms">link_off</span>No project linked
                    </span>
                  )}
                  <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                  <span className="item"><span className="ms">flag</span><span className="v">{o.kr.length}</span> key results</span>
                  {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                  {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                </div>
              </div>
              <div className="o-actions">
                <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setDetailGoal({
                  title: o.title,
                  description: 'Tracked under ' + (o.linkedProject || 'no linked project') + '. ' + (o.role === 'owner' ? 'You own this goal.' : o.role === 'contrib' ? 'You contribute to this goal.' : 'You are a stakeholder.'),
                  type: 'Performance', typeIcon: 'workspace_premium',
                  privacy: 'Restricted',
                  when: '7/1/2026 — ' + o.due,
                  daysLeft: 188,
                  perfGoal: true,
                  aligned: o.linkedProject,
                  progress: o.pct,
                  owner: { name: o.ownerName, role: o.ownerRole },
                  contributors: o.role === 'owner' ? [{ name: 'Lina Chen', role: 'Onboarding Mgr' }] : [{ name: 'Aditi Sharma', role: 'Senior Ops' }],
                  krs: o.kr.map((k, i) => ({ id: i+1, owner: o.ownerName, text: k.t, pct: k.pct,
                    current: k.current, target: k.target, unit: k.unit })),
                  attachments: 0,
                })}>View</Btn>
                {o.role === 'owner' && <Btn variant="outlined" size="sm" icon="trending_up">Update progress</Btn>}
              </div>
            </div>
            {o.kr.length > 0 && (
              <div className="kr-list">
                {o.kr.map((k, i) => (
                  <div className="kr" key={i}>
                    <div className="num">KR{i+1}</div>
                    <div className="text">{k.t}</div>
                    <div className="target">{k.current}{k.unit === '%' ? '%' : ''} / {k.target}{k.unit === '%' ? '%' : ''}</div>
                    <ProgressBar pct={k.pct} color={k.pct >= 70 ? 'green' : k.pct >= 40 ? '' : 'amber'} />
                    {o.role === 'owner'
                      ? <Btn variant="ghost" size="sm" style={{ padding: '4px 8px' }} icon="edit">Edit</Btn>
                      : <span />}
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)',
              display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                {o.role === 'owner'
                  ? <>You drive this goal{o.linkedProject ? <> · auto-syncing progress from <strong style={{ color: 'var(--grey-700)' }}>{o.linkedProject}</strong></> : null}.</>
                  : o.role === 'contrib'
                    ? <>Contributing toward this goal — owned by <strong style={{ color: 'var(--grey-700)' }}>{o.ownerName}</strong>.</>
                    : <>Stakeholder · you receive updates but don't own progress.</>}
              </div>
              <ProgressBar pct={o.pct} big color={o.status === 'at-risk' ? 'amber' : 'green'} />
            </div>
          </div>
        ))}
      </div>
      </>)}
    </Shell>
  );
}

window.WorkerGoals = WorkerGoals;
