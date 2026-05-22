/* Frame 1 — Client / Manager Performance Dashboard
   Persona: HR admin / people manager at the client (Acme Holdings)
   Per the brief: 6 KPI cards, Goal Progress, Review Cycle Status, Project Performance
   Signals, Compensation Signals, AI Review Assistant panel, Recent Feedback. */

function ClientDashboard() {
  const kpis = [
    { tone: 'blue',    icon: 'flag',           label: 'Active OKRs',          value: '42', trend: { dir: 'up',   text: '+6' }, sub: '11 company · 14 team · 17 individual' },
    { tone: 'green',   icon: 'task_alt',       label: 'OKRs on track',        value: '76%', trend: { dir: 'up', text: '+4%' }, sub: '32 of 42 · target 80%' },
    { tone: 'amber',   icon: 'pending_actions',label: 'Pending reviews',      value: '18', trend: { dir: 'down', text: '−3' },  sub: '4 overdue · 14 in progress' },
    { tone: 'purple',  icon: 'rocket_launch',  label: 'Linked projects',      value: '31', trend: { dir: 'up',   text: '+8' },  sub: '18 active · 9 done · 4 at-risk' },
    { tone: 'teal',    icon: 'event_available',label: '1:1s this month',      value: '64', trend: { dir: 'flat', text: '0' },   sub: '8 today · 12 this week' },
    { tone: 'pink',    icon: 'paid',           label: 'Compensation signals', value: '7',  trend: { dir: 'up',   text: '+2' },   sub: '4 eligible · 3 monitor' },
  ];

  const goals = [
    { name: 'Improve payroll migration quality',     owner: 'Ops Team',      project: 'Payroll Migration EU',     pct: 70, status: 'on-track', due: 'Sep 30, 2026', okrType: 'company' },
    { name: 'Reduce vendor setup time by 20%',       owner: 'Omar Khan',     project: 'Vendor Setup Automation',  pct: 45, status: 'at-risk',  due: 'Oct 15, 2026', okrType: 'individual' },
    { name: 'Complete onboarding projects on time',  owner: 'Aditi Sharma',  project: 'Client Onboarding Q3',     pct: 90, status: 'on-track', due: 'Sep 20, 2026', okrType: 'individual' },
    { name: 'Launch the unified comms platform',     owner: 'Engineering',   project: 'Comms Unification',        pct: 32, status: 'at-risk',  due: 'Dec 15, 2026', okrType: 'team' },
    { name: 'Cut support backlog under 50',          owner: 'Lina Chen',     project: 'CS Quality Q3',            pct: 58, status: 'on-track', due: 'Oct 30, 2026', okrType: 'individual' },
  ];

  const cycles = [
    { name: 'Q3 Performance Review',     type: 'Quarterly', participants: 120, pct: 68, pending: 'Managers',  due: 'Oct 15, 2026', status: 'active'   },
    { name: 'Payroll Migration Review',  type: 'Project',   participants: 8,   pct: 40, pending: 'Workers',   due: 'May 25, 2026', status: 'overdue'  },
    { name: 'Annual Review 2026',        type: 'Annual',    participants: 250, pct: 0,  pending: 'HR Admin',  due: 'Dec 15, 2026', status: 'draft'    },
    { name: 'Engineering 360°',          type: '360° Feedback', participants: 38, pct: 31, pending: 'Peers', due: 'Apr 07, 2026', status: 'active' },
  ];

  const projectSignals = [
    { project: 'Payroll Migration EU',     worker: 'Aditi Sharma', okr: 'Complete 5 migrations',          status: 'Completed',  trigger: 'Manager review due',  triggerVariant: 'review-due' },
    { project: 'Vendor Setup Automation',  worker: 'Omar Khan',    okr: 'Reduce setup time by 20%',       status: 'In Progress',trigger: 'No review yet',       triggerVariant: 'draft' },
    { project: 'Client Onboarding Q3',     worker: 'Lina Chen',    okr: 'Improve onboarding quality',     status: 'Completed',  trigger: 'Self-review pending', triggerVariant: 'warning' },
    { project: 'Comms Unification',        worker: 'Diego Alvarez',okr: 'Launch unified platform v1',     status: 'In Progress',trigger: 'Milestone review',    triggerVariant: 'progress' },
  ];

  const comp = [
    { worker: 'Aditi Sharma', role: 'Senior Ops',      okrPct: 90, outcome: 'Exceeds expectations', projects: '6/6', signal: 'eligible',      signalLabel: 'Eligible for review' },
    { worker: 'Omar Khan',    role: 'Vendor Lead',     okrPct: 72, outcome: 'Meets expectations',   projects: '4/5', signal: 'monitor',       signalLabel: 'Monitor' },
    { worker: 'Lina Chen',    role: 'Onboarding Mgr',  okrPct: 45, outcome: 'Needs support',        projects: '2/5', signal: 'needs-support', signalLabel: 'Not recommended yet' },
    { worker: 'Diego Alvarez',role: 'Senior Engineer', okrPct: 82, outcome: 'Exceeds expectations', projects: '5/5', signal: 'eligible',      signalLabel: 'Eligible for review' },
  ];

  const feed = [
    { who: 'Priya Nair', icon: 'rate_review', when: '2h ago', text: <><strong>Aditi Sharma</strong> received project feedback for <strong>Payroll Migration EU</strong></>, tag: 'Project' },
    { who: 'Karim Idris', icon: 'flag', when: '4h ago',         text: <><strong>Omar Khan</strong> received goal feedback for <strong>Vendor Setup Automation</strong></>, tag: 'Goal' },
    { who: 'Lina Chen',   icon: 'how_to_reg', when: 'yesterday', text: <><strong>Lina Chen</strong> completed self-review for <strong>Client Onboarding Q3</strong></>, tag: 'Self-review' },
    { who: 'Hannah Mueller', icon: 'celebration', when: '2d ago',  text: <><strong>Hannah Mueller</strong> recognized <strong>Diego Alvarez</strong> for shipping the API refactor</>, tag: 'Recognition' },
  ];

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Dashboard']}>

      <PerfTabs active="dashboard" />

      <PageHead
        eyebrow="Performance Management"
        title="Performance overview"
        sub="Track goals, project outcomes, reviews, feedback, and compensation signals — all in one place."
        actions={<>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="ghost" icon="forum">Give feedback</Btn>
          <Btn variant="outlined" icon="play_circle">Start review cycle</Btn>
          <Btn variant="primary" icon="add">Create goal</Btn>
        </>}
      />

      <FilterBar right={<button className="filter"><span className="ms">tune</span>More filters</button>}>
        <Filter icon="event"     k="Period"      v="Q3 2026" />
        <Filter icon="groups"    k="Team"        v="All teams" />
        <Filter icon="badge"     k="Worker type" v="Employees & Contractors" />
        <Filter icon="rocket_launch" k="Project" v="All projects" />
        <span className="sep" />
        <Filter icon="bookmark"  k="View"        v="My dashboard" />
      </FilterBar>

      {/* 6 KPI cards */}
      <div className="stats-row c-6 mb-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* Row: Goal Progress (2/3) + AI Review Assistant (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <SectionCard
          title="Goal progress overview"
          sub="Active OKRs across the company · top movers this week"
          icon="flag"
          action={<div className="row gap-2">
            <Btn variant="ghost" size="sm" icon="filter_list">Filter</Btn>
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

        {/* AI Review Assistant compact panel */}
        <SectionCard
          title="AI Review Assistant"
          sub="Bias, evidence & quality signals"
          icon="auto_awesome"
          action={<Btn variant="text" size="sm" iconTrailing="arrow_forward">Open</Btn>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="row items-center gap-3" style={{ padding: '10px 12px', background: 'var(--error-bg)', borderRadius: 9 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--error-dark)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>5</div>
              <div style={{ fontSize: 11.5, color: 'var(--error-dark)', fontWeight: 600, lineHeight: 1.2 }}>Open bias<br />flags</div>
            </div>
            <div className="row items-center gap-3" style={{ padding: '10px 12px', background: 'var(--warning-bg)', borderRadius: 9 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning-dark)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>8</div>
              <div style={{ fontSize: 11.5, color: 'var(--warning-dark)', fontWeight: 600, lineHeight: 1.2 }}>Missing<br />evidence</div>
            </div>
            <div className="row items-center gap-3" style={{ padding: '10px 12px', background: 'var(--success-bg)', borderRadius: 9 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success-dark)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>21</div>
              <div style={{ fontSize: 11.5, color: 'var(--success-dark)', fontWeight: 600, lineHeight: 1.2 }}>Resolved<br />suggestions</div>
            </div>
            <div className="row items-center gap-3" style={{ padding: '10px 12px', background: 'var(--brand-purple-100)', borderRadius: 9 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-purple-600)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>3</div>
              <div style={{ fontSize: 11.5, color: 'var(--brand-purple-700)', fontWeight: 600, lineHeight: 1.2 }}>Contractor<br />risk checks</div>
            </div>
          </div>

          <AIFlag
            title="Suggestion · Omar Khan's review"
            actions={<>
              <Btn variant="purple" size="sm" icon="edit">Suggest rewrite</Btn>
              <Btn variant="ghost"  size="sm">Dismiss</Btn>
            </>}
          >
            Feedback for <strong>Omar Khan</strong> may be too vague. Add project evidence or a measurable outcome before submitting.
          </AIFlag>
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

      {/* Row: Project Performance Signals (2/3) + Recent Feedback (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <SectionCard
          title="Project performance signals"
          sub="Project completions flowing into reviews and OKR progress"
          icon="rocket_launch"
          action={<Btn variant="text" size="sm" iconTrailing="arrow_forward">All projects</Btn>}
          padBody={false}
        >
          <table className="tbl">
            <thead><tr>
              <th>Project</th><th>Worker</th><th>Linked OKR</th><th>Status</th><th>Review trigger</th>
            </tr></thead>
            <tbody>
              {projectSignals.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--grey-700)', fontSize: 13 }}>{p.project}</div>
                  </td>
                  <td>
                    <div className="worker-cell">
                      <Avatar name={p.worker} size="sm" />
                      <span className="name">{p.worker}</span>
                    </div>
                  </td>
                  <td><span className="link-cell"><span className="ms">flag</span>{p.okr}</span></td>
                  <td>
                    {p.status === 'Completed'  && <Pill variant="completed" dot>Completed</Pill>}
                    {p.status === 'In Progress'&& <Pill variant="progress" dot>In progress</Pill>}
                  </td>
                  <td>
                    <Pill variant={p.triggerVariant} icon={p.trigger.includes('No review') ? 'remove' : 'arrow_right_alt'}>
                      {p.trigger}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard
          title="Recent feedback"
          sub="Across goals, projects, and peers"
          icon="forum"
          action={<Btn variant="text" size="sm" iconTrailing="arrow_forward">View feed</Btn>}
          padBody={false}
        >
          <div>
            {feed.map((f, i) => (
              <div className="feed-item" key={i}>
                <Avatar name={f.who} size="sm" />
                <div className="b">
                  <div className="t">{f.text}</div>
                  <div className="meta">
                    <span className="ms" style={{ fontSize: 13 }}>{f.icon}</span>
                    <span>{f.tag} · {f.when}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Compensation Signals (full width) */}
      <SectionCard
        title="Compensation revision signals"
        sub="Performance evidence for compensation review — final decisions remain with authorized admins"
        icon="paid"
        action={<div className="row gap-2">
          <Btn variant="ghost" size="sm" icon="file_download">Export to Comp Revision</Btn>
          <Btn variant="text"  size="sm" iconTrailing="arrow_forward">All eligible workers</Btn>
        </div>}
        padBody={false}
      >
        <div style={{ padding: '12px 18px 0' }}>
          <Callout tone="gradient" icon="info">
            <span style={{ fontWeight: 700, color: 'var(--grey-700)' }}>Decision support — not automatic approval.</span>{' '}
            <span style={{ color: 'var(--fg-secondary)' }}>These signals combine OKR achievement, review outcomes, and project completion to surface workers for compensation review. Raises are not approved automatically.</span>
          </Callout>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>Worker</th>
            <th style={{ width: 200 }}>OKR Achievement</th>
            <th>Review Outcome</th>
            <th>Projects Completed</th>
            <th>Signal</th>
            <th className="actions-cell">Action</th>
          </tr></thead>
          <tbody>
            {comp.map((c, i) => (
              <tr key={i}>
                <td>
                  <div className="worker-cell">
                    <Avatar name={c.worker} size="md" />
                    <div>
                      <div className="name">{c.worker}</div>
                      <div className="role">{c.role}</div>
                    </div>
                  </div>
                </td>
                <td><ProgressBar pct={c.okrPct} color={c.okrPct >= 80 ? 'green' : c.okrPct >= 60 ? '' : 'amber'} /></td>
                <td>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color:
                    c.outcome === 'Exceeds expectations' ? 'var(--success-dark)' :
                    c.outcome === 'Needs support' ? 'var(--error-dark)' : 'var(--grey-700)' }}>
                    {c.outcome}
                  </span>
                </td>
                <td><span style={{ fontSize: 12.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{c.projects}</span></td>
                <td><Pill variant={c.signal} dot>{c.signalLabel}</Pill></td>
                <td className="actions-cell">
                  <Btn variant="ghost" size="sm">Open profile</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

    </Shell>
  );
}

window.ClientDashboard = ClientDashboard;
