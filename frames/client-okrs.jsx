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
  const myOKRs = [
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
  ];

  /* ---------------- People OKRs (workers managed by Priya) ---------------- */
  const peopleOKRs = [
    {
      id: 'PO-01', worker: 'Aditi Sharma', role: 'Senior Ops',
      title: 'Complete 6 customer payroll migrations to v2 platform',
      pct: 90, status: 'on-track', due: 'Sep 30, 2026',
      linkedProject: 'Payroll Migration EU',
      kr: [
        { t: 'Migrate 6 anchor customers', pct: 100, target: '6 / 6' },
        { t: 'Zero P0 incidents during migration', pct: 100, target: '0 / 0' },
        { t: 'CSAT > 4.5 post-migration', pct: 70, target: '4.4 / 4.5' },
      ],
    },
    {
      id: 'PO-02', worker: 'Omar Khan', role: 'Vendor Lead',
      title: 'Reduce vendor setup time by 20% (8d → 6.4d)',
      pct: 45, status: 'at-risk', due: 'Oct 15, 2026',
      linkedProject: 'Vendor Setup Automation',
      kr: [
        { t: 'Automate KYB checks for 80% of vendors', pct: 62, target: '50 / 80' },
        { t: 'Average setup time under 7d',            pct: 40, target: '7.5d' },
        { t: 'Vendor satisfaction > 4.0',              pct: 25, target: '3.2' },
      ],
    },
    {
      id: 'PO-03', worker: 'Lina Chen', role: 'Onboarding Mgr',
      title: 'Improve client onboarding quality score to 4.6',
      pct: 58, status: 'on-track', due: 'Oct 30, 2026',
      linkedProject: 'Client Onboarding Q3',
      kr: [
        { t: 'Onboarding NPS up to 60',         pct: 55, target: '52 / 60' },
        { t: 'Time-to-first-payroll under 14d', pct: 70, target: '15d / 14d' },
        { t: 'Knowledge base coverage > 90%',   pct: 50, target: '78%' },
      ],
    },
    {
      id: 'PO-04', worker: 'Diego Alvarez', role: 'Senior Engineer',
      title: 'Refactor payments service to v2 API',
      pct: 82, status: 'on-track', due: 'Nov 15, 2026',
      linkedProject: 'Comms Unification',
      kr: [
        { t: 'Migrate all 14 endpoints', pct: 86, target: '12 / 14' },
        { t: 'Reduce p95 latency by 30%', pct: 92, target: '−27% / −30%' },
        { t: 'Zero downtime cutover',    pct: 70, target: 'Pending UAT' },
      ],
    },
    {
      id: 'PO-05', worker: 'Karim Idris', role: 'Customer Success',
      title: 'Move 80% of CS escalations to self-serve playbooks',
      pct: 22, status: 'at-risk', due: 'Dec 15, 2026',
      linkedProject: null,
      kr: [
        { t: 'Publish 25 playbooks',      pct: 36, target: '9 / 25' },
        { t: 'Self-serve resolution > 60%', pct: 18, target: '38%' },
        { t: 'Escalations down 30%',      pct: 12, target: '−8%' },
      ],
    },
  ];

  const tabCounts = { company: companyOKRs.length, my: myOKRs.length, people: peopleOKRs.length };

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Goals & OKRs']}>

      {stepper ? (
        <GoalStepper kind={stepper.kind}
          initial={stepper.initial}
          mode={stepper.mode}
          onCancel={() => setStepper(null)}
          onCreate={() => setStepper(null)}
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
          <Btn variant="ghost" icon="link">Link project</Btn>
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
                      opts: { alignment: false, description: true, tags: true },
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
            {myOKRs.map(o => (
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
                  <ProgressBar pct={o.pct} big color={o.status === 'at-risk' ? 'amber' : 'green'} />
                </div>
              </div>
            ))}
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
            {peopleOKRs.map(o => (
              <div className="okr-card" key={o.id}>
                <div className="o-head">
                  <div className="o-title-block">
                    <div className="row items-center gap-3 mb-2">
                      <Avatar name={o.worker} size="md" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)', lineHeight: 1.2 }}>{o.worker}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>{o.role} · {o.id}</div>
                      </div>
                    </div>
                    <div className="o-title">{o.title}</div>
                    <div className="o-meta">
                      <span className="item">
                        <span className="ms">link</span>
                        {o.linkedProject
                          ? <span className="v" style={{ color: 'var(--brand-blue-600)' }}>{o.linkedProject}</span>
                          : <button className="btn btn-text btn-sm" style={{ padding: '2px 6px', fontSize: 11 }}><span className="ms" style={{ fontSize: 12 }}>add</span>Link a project</button>}
                      </span>
                      <span className="item"><span className="ms">event</span>Due <span className="v">{o.due}</span></span>
                      <span className="item"><span className="ms">flag</span><span className="v">{o.kr.length}</span> key results</span>
                      {o.status === 'on-track' && <Pill variant="on-track" dot>On track</Pill>}
                      {o.status === 'at-risk'  && <Pill variant="at-risk"  dot>At risk</Pill>}
                    </div>
                  </div>
                  <div className="o-actions">
                    <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setDetailGoal({
                      title: o.title,
                      description: o.linkedProject ? 'Linked to ' + o.linkedProject + '.' : 'No linked project.',
                      type: 'Performance',
                      typeIcon: 'workspace_premium',
                      privacy: 'Restricted',
                      when: '7/1/2026 — ' + o.due,
                      daysLeft: 188,
                      perfGoal: true,
                      aligned: o.linkedProject || null,
                      progress: o.pct,
                      owner: { name: o.worker, role: o.role },
                      contributors: [{ name: 'Priya Nair', role: 'Manager' }],
                      krs: o.kr.map((k, i) => ({
                        id: i+1, owner: o.worker, text: k.t, pct: k.pct,
                        current: k.target.split('/')[0]?.trim(),
                        target:  k.target.split('/')[1]?.trim() || k.target,
                        unit: k.target.includes('%') ? '%' : 'count',
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
                      <div className="text">{k.t}</div>
                      <div className="target">{k.target}</div>
                      <ProgressBar pct={k.pct} color={k.pct >= 70 ? 'green' : k.pct >= 40 ? '' : 'amber'} />
                      <Btn variant="ghost" size="sm" style={{ padding: '4px 8px' }} icon="edit">Edit</Btn>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)',
                  display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'center' }}>
                  {o.linkedProject ? (
                    <div className="row items-center gap-3" style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
                      <span className="ms" style={{ fontSize: 16, color: 'var(--brand-blue-500)' }}>link</span>
                      <span>Linked to <strong style={{ color: 'var(--grey-700)' }}>{o.linkedProject}</strong></span>
                    </div>
                  ) : (
                    <div className="row items-center gap-2" style={{ fontSize: 12, color: 'var(--warning-dark)' }}>
                      <span className="ms" style={{ fontSize: 16 }}>warning_amber</span>
                      <span>No project linked — link a project to track progress.</span>
                    </div>
                  )}
                  <ProgressBar pct={o.pct} big color={o.status === 'at-risk' ? 'amber' : 'green'} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom modal: project-completed prompt (demonstrates the interaction state) */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-purple-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>↘ Interaction state · "Project just completed"</div>
            <div className="modal-demo" style={{ height: 250, background: 'var(--grey-50)', borderRadius: 12, border: '1px dashed var(--grey-200)' }}>
              <div className="modal-overlay" />
              <div className="modal">
                <h3>
                  <div className="glyph"><span className="ms">rocket_launch</span></div>
                  Project completed
                </h3>
                <div className="body">
                  <strong style={{ color: 'var(--grey-700)' }}>Payroll Migration EU</strong> just completed. It's linked to 2 OKRs.
                  Update OKR progress?
                  <div className="pill-row">
                    <Pill variant="completed" dot>Project complete</Pill>
                    <Pill variant="contractor" icon="flag">Aditi's OKR · 6 migrations</Pill>
                    <Pill variant="contractor" icon="flag">Ops Team · Payroll quality</Pill>
                  </div>
                </div>
                <div className="footer">
                  <Btn variant="ghost" size="sm">Skip for now</Btn>
                  <Btn variant="outlined" size="sm" icon="trending_up">Update OKR progress</Btn>
                  <Btn variant="primary" size="sm" icon="rate_review">Trigger reviews</Btn>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </>)}
    </Shell>
  );
}

window.ClientOKRs = ClientOKRs;
