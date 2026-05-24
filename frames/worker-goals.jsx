/* Frame · Worker My Goals */

const { useState: useStateWG, useEffect: useEffectWG } = React;

const UPDATE_LINKED_PROJECTS = [
  'Payroll Migration EU',
  'KYB Automation v2',
  'Contractor Onboarding Revamp',
  'CSAT Recovery Program',
  'Ops Tooling Modernisation',
  'Q3 Payroll Quality Initiative',
];

/* ── Update Progress Modal ── */
function UpdateProgressModal({ goal, onCancel, onSave }) {
  const [description, setDescription] = useStateWG('');
  const [goalStatus, setGoalStatus] = useStateWG('no-status');
  const [postToPage, setPostToPage] = useStateWG(true);

  const initKrState = () => goal.kr.map(k => {
    const cur = parseFloat(k.current) || 0;
    const rawTarget = parseFloat(k.target);
    const tgt = Number.isFinite(rawTarget) ? rawTarget : 1;
    return {
      newTotal: cur,
      change: 0,
      krStatus: 'no-status',
      linkedProject: k.linkedProject || '',
      state: k.unit === 'incomplete' ? 'incomplete' : null,
      preview: k.unit === 'incomplete' ? 0 : (tgt === 0 ? (Number(k.pct) || 0) : Math.round((cur / (tgt || 1)) * 100)),
    };
  });

  const [krState, setKrState] = useStateWG(initKrState);

  function updateKr(i, patch) {
    setKrState(prev => {
      const next = prev.map((s, j) => j === i ? { ...s, ...patch } : s);
      const s = next[i];
      const rawTarget = parseFloat(goal.kr[i].target);
      const tgt = Number.isFinite(rawTarget) ? rawTarget : 1;
      if (patch.newTotal !== undefined) {
        const cur = parseFloat(goal.kr[i].current) || 0;
        const preview = tgt === 0 ? Number(goal.kr[i].pct) || 0 : Math.min(100, Math.max(0, Math.round((s.newTotal / tgt) * 100)));
        next[i] = { ...next[i], change: +(s.newTotal - cur).toFixed(2), preview };
      }
      if (patch.change !== undefined) {
        const cur = parseFloat(goal.kr[i].current) || 0;
        const nt = cur + (parseFloat(patch.change) || 0);
        const preview = tgt === 0 ? Number(goal.kr[i].pct) || 0 : Math.min(100, Math.max(0, Math.round((nt / tgt) * 100)));
        next[i] = { ...next[i], newTotal: +nt.toFixed(2), preview };
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
        return { ...k, linkedProject: s.linkedProject, current: s.state === 'completed' ? k.target : '0', pct: s.state === 'completed' ? 100 : 0 };
      }
      if (Number(parseFloat(k.target)) === 0) {
        return { ...k, linkedProject: s.linkedProject, current: String(s.newTotal), pct: Number(k.pct) || s.preview };
      }
      return { ...k, linkedProject: s.linkedProject, current: String(s.newTotal), pct: s.preview };
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

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 }}>Linked project</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '7px 10px', background: '#fff' }}>
                    <span className="ms" style={{ fontSize: 16, color: s.linkedProject ? 'var(--brand-blue-500)' : 'var(--fg-disabled)' }}>
                      {s.linkedProject ? 'link' : 'link_off'}
                    </span>
                    <select value={s.linkedProject} onChange={e => updateKr(i, { linkedProject: e.target.value })}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', color: 'var(--grey-700)' }}>
                      <option value="">No linked project</option>
                      {UPDATE_LINKED_PROJECTS.map(project => <option key={project} value={project}>{project}</option>)}
                    </select>
                  </div>
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
  const currentWorkerId = window.PerformanceStore.CURRENT_WORKER_ID;

  function workerGoalRows() {
    // Worker My Goals reads from the same goal assignment data.
    const me = window.PerformanceStore.getCurrentUser?.();
    return window.PerformanceStore.getGoalsForWorker(currentWorkerId).map(goal => {
      const assignedKr = (goal.keyResults || []).filter(kr => (kr.assignedToIds || []).includes(currentWorkerId));
      // "Owner" on the worker view = is the current user the goal's owner?
      const isOwner = me && goal.ownerUserId === me.id;
      const isContributor = !isOwner && ((goal.collaboratorIds || []).includes(currentWorkerId) || assignedKr.length > 0);
      return {
        id: goal.id,
        role: isOwner ? 'owner' : isContributor ? 'contrib' : 'stakeholder',
        source: goal.source,
        title: goal.title,
        pct: goal.progress,
        status: goal.status,
        due: goal.dueDate,
        linkedProject: goal.linkedProject,
        ownerName: goal.ownerName || '—',
        ownerRole: goal.ownerRole || '',
        ownerHint: goal.source === 'worker_created' ? 'Created by me'
                 : goal.ownerType === 'manager' ? `Assigned by ${goal.ownerName}`
                 : undefined,
        kr: (goal.keyResults || []).map(kr => ({
          id: kr.id,
          t: kr.title,
          pct: kr.progress,
          current: String(kr.current),
          target: String(kr.target),
          unit: kr.unit,
          linkedProject: kr.linkedProject || '',
        })),
      };
    });
  }

  const [stepper, setStepper] = useStateWG(null);
  const [detailGoal, setDetailGoal] = useStateWG(null);
  const [stepperFromDetail, setStepperFromDetail] = useStateWG(false);
  const [updateModal, setUpdateModal] = useStateWG(null); // { goalId }

  const [goals, setGoals] = useStateWG([]);

  useEffectWG(() => {
    const refresh = () => setGoals(workerGoalRows());
    refresh();
    return window.PerformanceStore.subscribe(refresh);
  }, []);

  const activeUpdateGoal = updateModal ? goals.find(g => g.id === updateModal.goalId) : null;

  async function handleProgressSave({ kr, pct }) {
    try {
      await Promise.all(kr.map(nextKr =>
        window.PerformanceStore.updateKeyResult(updateModal.goalId, nextKr.id, {
          current: Number(nextKr.current),
          progress: nextKr.pct,
        })
      ));
      // Cache was already refreshed inside updateKeyResult; re-derive view rows.
      setGoals(workerGoalRows());
      setUpdateModal(null);
    } catch (e) {
      console.error('handleProgressSave failed', e);
      alert(`Could not save progress: ${e.message}`);
    }
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
          onCreate={async (payload) => {
            try {
              await window.PerformanceStore.createGoal(payload);
              setGoals(workerGoalRows());
              setStepper(null);
              setStepperFromDetail(false);
              setDetailGoal(null);
            } catch (e) {
              console.error('createGoal failed', e);
              alert(`Could not create goal: ${e.message}`);
            }
          }} />
      ) : detailGoal ? (
        <GoalDetail goal={detailGoal} role="worker"
          onBack={() => setDetailGoal(null)}
          onProgressSave={async (updatedKr) => {
            try {
              await Promise.all(updatedKr.map(nextKr =>
                window.PerformanceStore.updateKeyResult(detailGoal.storeGoalId, nextKr.id, {
                  current: Number(nextKr.current),
                  progress: nextKr.pct,
                })
              ));
              setGoals(workerGoalRows());
            } catch (e) {
              console.error('onProgressSave failed', e);
              alert(`Could not save progress: ${e.message}`);
            }
          }}
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

      {(() => {
        const allKrs = goals.flatMap(g => g.kr || []);
        const krDone = allKrs.filter(kr => kr.pct >= 100).length;
        const avg = allKrs.length ? Math.round(allKrs.reduce((s, kr) => s + (kr.pct || 0), 0) / allKrs.length) : 0;
        const atRisk = goals.filter(g => g.status === 'at-risk' || g.status === 'at_risk' || g.status === 'blocked').length;
        const owner = goals.filter(g => g.role === 'owner').length;
        const contrib = goals.filter(g => g.role === 'contrib').length;
        const stake = goals.filter(g => g.role === 'stakeholder').length;
        return (
          <div className="stats-row c-4 mb-4">
            <StatCard tone="green"   icon="flag"          label="Active goals"     value={String(goals.length)}     sub={goals.length ? `${owner} owner · ${contrib} contrib · ${stake} stake` : 'No goals assigned'} />
            <StatCard tone="blue"    icon="trending_up"   label="Average progress" value={allKrs.length ? `${avg}%` : '—'} sub={allKrs.length ? `Across ${allKrs.length} key result${allKrs.length === 1 ? '' : 's'}` : 'No KRs yet'} />
            <StatCard tone="purple"  icon="check_circle"  label="Key results done" value={allKrs.length ? `${krDone}/${allKrs.length}` : '0'} sub={allKrs.length ? 'across all my goals' : 'Nothing to track yet'} />
            <StatCard tone="amber"   icon="schedule"      label="Need attention"   value={String(atRisk)} sub={atRisk ? 'At-risk or blocked' : 'Everything on track'} />
          </div>
        );
      })()}

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
                  {o.source === 'self-created' && <><span style={{ color: 'var(--fg-disabled)' }}>·</span><Pill variant="contrib" icon="person">Created by Me</Pill></>}
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
                  storeGoalId: o.id,
                  krs: o.kr.map((k) => ({ id: k.id, owner: o.ownerName, text: k.t, pct: k.pct,
                    current: k.current, target: k.target, unit: k.unit, linkedProject: k.linkedProject })),
                  attachments: 0,
                })}>View</Btn>
                {(o.role === 'owner' || o.role === 'contrib') && (
                  <Btn variant="outlined" size="sm" icon="trending_up"
                    onClick={() => setUpdateModal({ goalId: o.id })}>
                    {o.role === 'owner' ? 'Update progress' : 'Update my contribution'}
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
              <ProgressBar pct={o.pct} big color={o.status === 'at-risk' || o.pct < 40 ? 'amber' : o.pct >= 70 ? 'green' : ''} />
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
