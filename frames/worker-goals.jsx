/* Frame · Worker My Goals */

const { useState: useStateWG, useEffect: useEffectWG } = React;

/* ── Update Progress Modal ── */
function UpdateProgressModal({ goal, onCancel, onSave }) {
  const [description, setDescription] = useStateWG('');
  const [goalStatus, setGoalStatus] = useStateWG('no-status');
  const [postToPage, setPostToPage] = useStateWG(true);

  const initKrState = () => goal.kr.map(k => {
    const cur = parseFloat(k.current) || 0;
    const tgt = parseFloat(k.target) || 1;
    return {
      newTotal: cur,
      change: 0,
      krStatus: 'no-status',
      state: k.unit === 'incomplete' ? 'incomplete' : null,
      preview: k.unit === 'incomplete' ? 0 : Math.round((cur / (tgt || 1)) * 100),
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
      if (k.unit === 'incomplete') {
        return { ...k, current: s.state === 'completed' ? k.target : '0', pct: s.state === 'completed' ? 100 : 0 };
      }
      return { ...k, current: String(s.newTotal), pct: s.preview };
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

          {/* Description + Status row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>
                Describe the progress you have made on this goal
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%', minHeight: 56, border: '1.5px solid var(--grey-200)',
                  borderRadius: 8, padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  color: 'var(--grey-900)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
              />
            </div>
            <div style={{ flexShrink: 0, paddingTop: 22 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: '1.5px solid var(--grey-200)', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, cursor: 'pointer',
                whiteSpace: 'nowrap', color: 'var(--fg-secondary)', background: '#fff',
              }}>
                <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>autorenew</span>
                <select value={goalStatus} onChange={e => setGoalStatus(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                  {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visibility</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--grey-700)', cursor: 'pointer' }}>
              <input type="checkbox" checked={postToPage} onChange={e => setPostToPage(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: 'var(--brand-blue-500)', cursor: 'pointer' }} />
              Post to this page only
            </label>
          </div>

          <div style={{ borderTop: '1px solid var(--grey-100)', marginBottom: 0 }} />

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
                  /* Numeric KR */
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
                )}
              </div>
            );
          })}

          {/* Add image / GIF */}
          <div style={{ padding: '18px 0 8px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 10 }}>
              Add image or GIF <span style={{ fontWeight: 400 }}>(Optional)</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, background: '#fff', padding: '8px 12px', cursor: 'pointer', color: 'var(--fg-secondary)', display: 'flex', alignItems: 'center' }}>
                <span className="ms" style={{ fontSize: 22 }}>image</span>
              </button>
              <button style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, background: '#fff', padding: '8px 12px', cursor: 'pointer', color: 'var(--fg-secondary)', display: 'flex', alignItems: 'center' }}>
                <span className="ms" style={{ fontSize: 22 }}>upload</span>
              </button>
            </div>
          </div>
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

  const [goals, setGoals] = useStateWG([
    {
      id: 'PO-01', role: 'owner',
      title: 'Complete 6 customer payroll migrations to v2 platform',
      pct: 90, status: 'on-track', due: 'Sep 30, 2026',
      linkedProject: 'Payroll Migration EU',
      ownerName: 'Aditi Sharma', ownerRole: 'Senior Ops',
      kr: [
        { t: 'Migrate 6 anchor customers',         pct: 100, current: '6',   target: '6',   unit: 'count' },
        { t: 'Zero P0 incidents during migration', pct: 100, current: '0',   target: '0',   unit: 'count' },
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
        { t: 'Payroll runs without P0 below 1%', pct: 95, current: '0.4',  target: '1',    unit: '%' },
        { t: 'Run accuracy ≥ 99.5%',             pct: 92, current: '99.4', target: '99.5', unit: '%' },
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
  ]);

  const activeUpdateGoal = updateModal ? goals.find(g => g.id === updateModal.goalId) : null;

  function handleProgressSave({ kr, pct }) {
    setGoals(prev => prev.map(g =>
      g.id === updateModal.goalId ? { ...g, kr, pct, status: pct >= 70 ? 'on-track' : 'at-risk' } : g
    ));
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
        <GoalStepper kind={stepper.kind} mode={stepper.mode} initial={stepper.initial}
          onCancel={() => { setStepper(null); if (stepperFromDetail) setStepperFromDetail(false); }}
          onCreate={() => { setStepper(null); setStepperFromDetail(false); setDetailGoal(null); }} />
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
                    <div className="text">{k.t}</div>
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
        ))}
      </div>
      </>)}
    </Shell>
  );
}

window.WorkerGoals = WorkerGoals;
window.UpdateProgressModal = UpdateProgressModal;
