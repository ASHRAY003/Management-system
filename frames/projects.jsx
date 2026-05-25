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
