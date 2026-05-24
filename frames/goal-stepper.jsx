/* Goal / OKR creation stepper — 5 steps.
   Modeled after the screenshots provided by the user.
   kind: 'goal' | 'okr' — only label/cosmetic differences. */

const { useState: useStateStep } = React;

const LINKED_PROJECTS = [];

// Pulled fresh on each render so newly-added workers show up immediately.
function currentWorkers() {
  return window.PerformanceStore?.getWorkers?.() || [];
}

function workerIdForStepperName(name) {
  return window.PerformanceStore?.workerIdFromName?.(name) ||
    currentWorkers().find(w => w.name === name)?.id ||
    null;
}

// Owner is stored on the Goal as User.id, not Worker.id — go through
// Worker.userId so a manager picking a worker as the owner still works.
function ownerUserIdForStepperName(name) {
  const w = currentWorkers().find(x => x.name === name);
  return w?.userId || null;
}

function parseStepperDates(dates) {
  const parts = String(dates || '').split('—').map(p => p.trim());
  const dueDate = parts[1] || parts[0] || '';
  let period = 'Custom';
  if (/7\/1\/2026/.test(dates) && /9\/30\/2026/.test(dates)) period = 'Q3 2026';
  if (/10\/1\/2026/.test(dates) && /12\/31\/2026/.test(dates)) period = 'Q4 2026';
  if (/1\/1\/2026/.test(dates) && /3\/31\/2026/.test(dates)) period = 'Q1 2026';
  if (/4\/1\/2026/.test(dates) && /6\/30\/2026/.test(dates)) period = 'Q2 2026';
  return { dueDate, period };
}

const STEPS = [
  { id: 'name',  label: 'Name & Type' },
  { id: 'kr',    label: 'Key Results' },
  { id: 'dates', label: 'Goal Dates' },
  { id: 'users', label: 'Users' },
  { id: 'review',label: 'Review' },
];

function GoalStepper({ kind = 'goal', mode = 'create', initial = {}, onCancel, onCreate }) {
  const [stepIdx, setStepIdx] = useStateStep(0);
  // If a worker is creating, default the contributors list to their own name
  // and the owner field to their name — they can't pick anyone else anyway.
  const meBoot = window.PerformanceStore?.getCurrentUser?.();
  const isWorkerCreator = meBoot?.role === 'worker';
  const [name, setName] = useStateStep(initial.name ?? '');
  const [gtype, setGType] = useStateStep(initial.gtype ?? 'individual');
  const [privacy, setPrivacy] = useStateStep(initial.privacy ?? 'restricted');
  const [isPerf, setIsPerf] = useStateStep(initial.isPerf ?? true);
  const [krs, setKrs] = useStateStep(initial.krs ?? []);
  const [krDir, setKrDir] = useStateStep('Increase');
  const [dates, setDates] = useStateStep(initial.dates ?? '');
  const [contributors, setContributors] = useStateStep(initial.contributors ?? (isWorkerCreator ? [meBoot.name] : []));
  // Owner is derived from the first contributor so the chip is never empty.
  // Picking somebody changes who's responsible; toggling everyone off clears it.
  const owner = (initial.owner) || contributors[0] || '';
  const [opts, setOpts] = useStateStep(initial.opts ?? { alignment: true, description: false, tags: true });
  const [linkedProject, setLinkedProject] = useStateStep(initial.linkedProject ?? '');

  const step = STEPS[stepIdx].id;
  const isLast = stepIdx === STEPS.length - 1;
  const title = mode === 'edit' ? (kind === 'okr' ? 'Edit OKR' : 'Edit Goal') : (kind === 'okr' ? 'New OKR' : 'New Goal');

  const displayName = name?.trim() ? name.trim() : (kind === 'okr' ? 'Untitled OKR' : 'Untitled Goal');
  const me = window.PerformanceStore?.getCurrentUser?.();
  const selfTag = me ? `Self (${me.name})` : '__self__';
  const selectedSelf = contributors.includes(selfTag);
  const selectedWorkerIds = contributors
    .filter(c => c !== selfTag)
    .map(workerIdForStepperName)
    .filter(Boolean);

  function toggleContributor(workerName) {
    setContributors(prev => prev.includes(workerName)
      ? prev.filter(c => c !== workerName)
      : [...prev, workerName]);
  }

  function toggleKrAssignee(index, workerId) {
    setKrs(prev => prev.map((kr, i) => {
      if (i !== index) return kr;
      const assignedToIds = kr.assignedToIds || selectedWorkerIds;
      return {
        ...kr,
        assignedToIds: assignedToIds.includes(workerId)
          ? assignedToIds.filter(id => id !== workerId)
          : [...assignedToIds, workerId],
      };
    }));
  }

  function buildPayload(status = 'not-started') {
    const { dueDate, period } = parseStepperDates(dates);
    const assigneeIds = selectedWorkerIds;
    const ownerWorkerId = workerIdForStepperName(owner);
    // Owner-resolution rules:
    //  - Worker creator → owner is always the worker's own user id.
    //  - Manager picked "Self" chip → owner is the manager's user id.
    //  - Manager picked a worker as owner → owner is that worker's user id (via Worker.userId).
    //  - Fallback → the manager.
    const isWorker = me?.role === 'worker';
    // owner = contributors[0] (the chip the user sees). Decide ownerUserId by
    // whether that first pick is "Self ..." or a worker name.
    const ownerIsSelf = owner === selfTag;
    const ownerUserFromPick = ownerUserIdForStepperName(owner);
    const ownerId = isWorker
      ? me.id
      : (ownerIsSelf
          ? (me?.id || window.PerformanceStore?.MANAGER_ID)
          : (ownerUserFromPick || me?.id || window.PerformanceStore?.MANAGER_ID));
    const keyResults = krs.map(kr => ({
      title: kr.name,
      current: Number(kr.start) || 0,
      target: Number(kr.target) || 100,
      unit: kr.unit || '%',
      progress: 0,
      status: 'not-started',
      assignedToIds: kr.assignedToIds?.length ? kr.assignedToIds : assigneeIds,
      linkedProject: kr.linkedProject || linkedProject,
    }));
    return {
      title: displayName,
      name: displayName,
      type: gtype,
      privacy,
      visibility: privacy,
      dates,
      dueDate,
      period,
      owner,
      // ownerUserId is what the backend stores; the store's toBackendGoalPayload
      // reads p.ownerUserId. Pass our resolved ownerId there.
      ownerUserId: ownerId,
      ownerId,
      ownerType: isWorker ? 'worker' : 'manager',
      contributors,
      assigneeIds,
      collaboratorIds: assigneeIds,
      keyResults,
      krs: keyResults,
      linkedProject,
      status,
      progress: 0,
      isPerformanceGoal: isPerf,
      createdBy: ownerId,
      createdByRole: isWorker ? 'worker' : 'employer',
      source: isWorker ? 'worker_created' : 'employer_assigned',
    };
  }

  return (
    <div className="stepper-takeover">
      <div className="strip" />
      <div className="topbar">
        <div className="brand">
          <div className="icon"><span className="ms">{kind === 'okr' ? 'crisis_alert' : 'gps_fixed'}</span></div>
          <h2>{title}</h2>
        </div>
        <button className="x" onClick={onCancel} title="Close"><span className="ms">close</span></button>
      </div>

      <div className="body">
        {/* Step indicator */}
        <div className="step-progress">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`step ${i < stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`} onClick={() => i < stepIdx && setStepIdx(i)} style={{ cursor: i < stepIdx ? 'pointer' : 'default' }}>
                <div className="dot" />
                <div className="label">{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`line ${i < stepIdx ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step card */}
        <div className="step-card">
          <div className="avatar-icon"><span className="ms">{kind === 'okr' ? 'crisis_alert' : 'gps_fixed'}</span></div>
          {stepIdx > 0 && (
            <button className="trash" title="Delete draft"><span className="ms">delete_outline</span></button>
          )}
          {stepIdx > 0 && <div className="goal-name">{displayName}</div>}

          {/* ============== STEP 1 · Name & Type ============== */}
          {step === 'name' && (
            <>
              <div className="field">
                <div className="lh">
                  <div className="lbl">Name<span className="req">*</span></div>
                  <div className="count">{name.length} / 512 Characters</div>
                </div>
                <input
                  className="inp"
                  placeholder={kind === 'okr' ? 'What outcome do you want to achieve?' : 'What is your goal?'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <div className="help">{kind === 'okr'
                  ? 'A clear, measurable outcome (Objective) that you and your team can rally behind.'
                  : 'What is the overall objective you want to achieve? (Qualitative and aspirational)'}</div>
              </div>

              <div className="field-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="lh"><div className="lbl">Type<span className="req">*</span></div></div>
                  <div className="sel-wrap">
                    <span className="lead-icon"><span className="ms">{
                      gtype === 'individual' ? 'person' :
                      gtype === 'team'       ? 'groups' :
                      gtype === 'project'    ? 'rocket_launch' : 'apartment'
                    }</span></span>
                    <select className="sel with-lead" value={gtype} onChange={e => setGType(e.target.value)}>
                      <option value="individual">Individual</option>
                      <option value="team">Team</option>
                      <option value="project">Project-linked</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="lh"><div className="lbl">Privacy<span className="req">*</span></div></div>
                  <div className="sel-wrap">
                    <span className="lead-icon"><span className="ms">{
                      privacy === 'public'     ? 'public' :
                      privacy === 'restricted' ? 'lock' : 'visibility_off'
                    }</span></span>
                    <select className="sel with-lead" value={privacy} onChange={e => setPrivacy(e.target.value)}>
                      <option value="public">Public — visible to everyone in the workspace</option>
                      <option value="restricted">Restricted</option>
                      <option value="private">Private — only owner & contributors</option>
                    </select>
                  </div>
                  <div className="help">{
                    privacy === 'public'     ? 'Visible to everyone at Acme Holdings.' :
                    privacy === 'restricted' ? 'Visible to goal participants, their managers, and admins.' :
                    'Visible only to the owner and listed contributors.'
                  }</div>
                </div>
              </div>

              <div className="switch-row">
                <div className={`switch ${isPerf ? 'on' : ''}`} onClick={() => setIsPerf(!isPerf)} />
                <div className="label-block">Is Performance Goal</div>
              </div>
              <div className="help" style={{ paddingLeft: 58, marginTop: 0, marginBottom: 24 }}>
                Marking this as a Performance Goal will allow it to be included in future performance reviews.
              </div>

              <div className="more-options">
                <div className="h">More Options</div>
                <div className="chips">
                  <button className={`opt-chip ${opts.alignment ? 'active' : ''}`} onClick={() => setOpts({ ...opts, alignment: !opts.alignment })}>
                    <span className="ms">account_tree</span>Alignment{opts.alignment && <span className="ms" style={{ fontSize: 14 }}>check</span>}
                  </button>
                  <button className={`opt-chip ${opts.description ? 'active' : ''}`} onClick={() => setOpts({ ...opts, description: !opts.description })}>
                    <span className="ms">add_circle</span>Description{opts.description && <span className="ms" style={{ fontSize: 14 }}>check</span>}
                  </button>
                  <button className={`opt-chip ${opts.tags ? 'active' : ''}`} onClick={() => setOpts({ ...opts, tags: !opts.tags })}>
                    <span className="ms">sell</span>Tags{opts.tags && <span className="ms" style={{ fontSize: 14 }}>check</span>}
                  </button>
                </div>
                {opts.alignment && (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--brand-blue-50)', border: '1px solid var(--brand-blue-200)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-blue-600)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aligned to company goal</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--grey-700)', fontWeight: 600 }}>
                      <span className="ms" style={{ color: 'var(--brand-blue-500)', fontSize: 16 }}>account_tree</span>
                      CG-01 · Make Acme the #1 payroll platform for remote teams
                    </div>
                  </div>
                )}
                {opts.tags && (
                  <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Pill variant="contractor">vendor-ops</Pill>
                    <Pill variant="employee">q3-2026</Pill>
                    <Pill variant="contrib">automation</Pill>
                    <button className="opt-chip" style={{ padding: '4px 10px', fontSize: 12 }}>
                      <span className="ms" style={{ fontSize: 14 }}>add</span>Add tag
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============== STEP 2 · Key Results ============== */}
          {step === 'kr' && (
            <>
              {krs.map((kr, i) => (
                <div className="kr-block" key={i}>
                  <div className="drag"><span className="ms">drag_indicator</span></div>
                  <div className="kr-head">
                    <div className="name">Key Result #{i+1}</div>
                    <div className="count">{kr.name.length} / 512 Characters</div>
                  </div>
                  <input
                    className="inp"
                    value={kr.name}
                    onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, name: e.target.value } : k))}
                  />
                  <div className="kr-help">Trackable metric that will indicate goal progress.</div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <div className="sel-wrap">
                      <span className="lead-icon">
                        <span className="ms" style={{ color: kr.linkedProject ? 'var(--brand-blue-500)' : undefined }}>
                          {kr.linkedProject ? 'link' : 'link_off'}
                        </span>
                      </span>
                      <select className="sel with-lead" value={kr.linkedProject || ''} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, linkedProject: e.target.value } : k))}>
                        <option value="">No linked project</option>
                        {LINKED_PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {kr.linkedProject && (
                      <div className="help" style={{ color: 'var(--brand-blue-600)', marginTop: 4 }}>
                        <span className="ms" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                        Progress tracked from <strong>{kr.linkedProject}</strong>.
                      </div>
                    )}
                  </div>
                  <div className="grid-3">
                    <div>
                      <div className="sub">Start</div>
                      <input className="inp" type="number" value={kr.start} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, start: e.target.value } : k))} />
                    </div>
                    <div>
                      <div className="sub">Target</div>
                      <input className="inp" type="number" value={kr.target} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, target: e.target.value } : k))}
                        style={i === 0 ? { borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 3px rgba(0,117,225,0.12)' } : undefined}
                      />
                    </div>
                    <div>
                      <div className="sub">Unit</div>
                      <div className="sel-wrap">
                        <span className="lead-icon"><span className="ms">{kr.unit === '%' ? 'percent' : kr.unit === 'days' ? 'event' : 'tag'}</span></span>
                        <select className="sel with-lead" value={kr.unit} onChange={e => setKrs(krs.map((k, j) => j === i ? { ...k, unit: e.target.value } : k))}>
                          <option value="%">Percentage</option>
                          <option value="days">Days</option>
                          <option value="count">Count</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="trackline">
                    <div>
                      <strong>Tracking:</strong>{' '}<span style={{ color: 'var(--grey-700)' }}>{krDir}</span>{' '}
                      <span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.name.split(' ').slice(0, 3).join(' ')}</span>{' '}
                      from{' '}<span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.start}{kr.unit === '%' ? '%' : ''}</span>{' '}
                      to{' '}<span style={{ color: 'var(--brand-blue-500)', fontWeight: 700 }}>{kr.target}{kr.unit === '%' ? '%' : ''}</span>
                    </div>
                    <div className="tools">
                      <button title="Assign owner"><span className="ms">person</span></button>
                      <button title="Duplicate"><span className="ms">content_copy</span></button>
                      <button className="danger" title="Delete" onClick={() => setKrs(krs.filter((_, j) => j !== i))}><span className="ms">delete</span></button>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned to</span>
                    {currentWorkers().map(w => {
                      const assigned = (kr.assignedToIds || selectedWorkerIds).includes(w.id);
                      return (
                        <button key={w.id} className={`opt-chip ${assigned ? 'active' : ''}`} style={{ padding: '4px 9px', fontSize: 12 }}
                          onClick={() => toggleKrAssignee(i, w.id)}>
                          <span className="ms" style={{ fontSize: 14 }}>{assigned ? 'check' : 'person_add'}</span>{w.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="new-kr-row">
                <div className="line" />
                <button className="new-kr-btn" onClick={() => setKrs([...krs, { name: '', start: 0, target: 100, unit: '%' }])}>
                  <span className="ms" style={{ fontSize: 16 }}>add</span>New Key Result
                </button>
                <div className="line" />
              </div>
            </>
          )}

          {/* ============== STEP 3 · Goal Dates ============== */}
          {step === 'dates' && (
            <>
              <div className="date-q">What are the start and end dates for this goal?</div>
              <div className="date-pick">
                <span className="ms lead">event_available</span>
                <span className="v">{dates}</span>
                <span className="ms caret">arrow_drop_down</span>
              </div>
              <div className="help" style={{ textAlign: 'center', marginTop: 18, color: 'var(--fg-secondary)' }}>
                Aligning with Q3 2026 review cycle (Jul 1 – Sep 30).
              </div>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map(q => (
                  <button key={q} className={`opt-chip ${q === 'Q3 2026' ? 'active' : ''}`} style={{ justifyContent: 'center' }}
                    onClick={() => setDates(q === 'Q3 2026' ? '7/1/2026 — 9/30/2026' : q === 'Q1 2026' ? '1/1/2026 — 3/31/2026' : q === 'Q2 2026' ? '4/1/2026 — 6/30/2026' : '10/1/2026 — 12/31/2026')}>
                    <span className="ms">{q === 'Q3 2026' ? 'check_circle' : 'event'}</span>{q}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ============== STEP 4 · Users ============== */}
          {step === 'users' && (
            <>
              <div className="field">
                <div className="lh"><div className="lbl">Owner</div></div>
                <div className="user-field">
                  <div className="floating-label">Only one owner per goal</div>
                  <div>
                    <span className="selected">{owner}<span className="x">×</span></span>
                  </div>
                </div>
                <div className="help">Owners are responsible for keeping goals up-to-date and keeping contributors accountable.</div>
              </div>

              <div className="field">
                <div className="lh"><div className="lbl">Assignees / Collaborators</div></div>
                <div className="user-field">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
                    {contributors.map((c, i) => (
                      <span key={i} className="selected" style={{ alignSelf: 'auto' }}>
                        {c}<span className="x" onClick={() => setContributors(contributors.filter((_, j) => j !== i))}>×</span>
                      </span>
                    ))}
                    <input placeholder={contributors.length === 0 ? 'Type names here to select multiple assignees' : ''} style={{ flex: 1, minWidth: 200 }} />
                  </div>
                </div>
                <div className="help">Assignees and collaborators are workers actively pursuing and updating this goal.</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const me = window.PerformanceStore.getCurrentUser?.();
                    if (!me) return null;
                    // Workers can only assign themselves to their own goals.
                    if (me.role === 'worker') {
                      const myName = me.name;
                      const picked = contributors.includes(myName);
                      return (
                        <button className={`opt-chip ${picked ? 'active' : ''}`}
                          onClick={() => toggleContributor(myName)}
                          style={{ background: picked ? 'var(--success-bg)' : undefined, color: picked ? 'var(--success-dark)' : undefined, fontWeight: 700 }}>
                          <span className="ms">{picked ? 'check_circle' : 'person'}</span>Me · {me.name}
                        </button>
                      );
                    }
                    // Managers / admins get a Self chip plus every worker.
                    const selfName = `Self (${me.name})`;
                    const selfPicked = contributors.includes(selfName);
                    return (
                      <>
                        <button className={`opt-chip ${selfPicked ? 'active' : ''}`} onClick={() => toggleContributor(selfName)} style={{ background: selfPicked ? 'var(--success-bg)' : undefined, color: selfPicked ? 'var(--success-dark)' : undefined, fontWeight: 700 }}>
                          <span className="ms">{selfPicked ? 'check_circle' : 'person'}</span>Self · {me.name}
                        </button>
                        {currentWorkers().map(w => (
                          <button key={w.id} className={`opt-chip ${contributors.includes(w.name) ? 'active' : ''}`} onClick={() => toggleContributor(w.name)}>
                            <span className="ms">{contributors.includes(w.name) ? 'check_circle' : 'person_add'}</span>{w.name}
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="field" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--grey-100)' }}>
                <div className="lh"><div className="lbl" style={{ fontSize: 14 }}>Stakeholders <span style={{ fontSize: 12, color: 'var(--fg-secondary)', fontWeight: 500 }}>· optional · receive updates</span></div></div>
                <div className="user-field">
                  <input placeholder="Add stakeholders who should see progress but won't update it" />
                </div>
              </div>
            </>
          )}

          {/* ============== STEP 5 · Review ============== */}
          {step === 'review' && (
            <div className="review-card">
              <div className="subtype">{
                gtype === 'individual' ? 'Individual Goal' :
                gtype === 'team' ? 'Team Goal' :
                gtype === 'project' ? 'Project-Linked Goal' : 'Company Goal'
              } · {opts.alignment ? 'Aligned to CG-01' : 'Not Aligned'}</div>

              <div className="review-meta-row">
                <div className="item">
                  <span className="ms">{privacy === 'public' ? 'public' : privacy === 'restricted' ? 'lock' : 'visibility_off'}</span>
                  {privacy === 'public' ? 'Public' : privacy === 'restricted' ? 'Restricted' : 'Private'}
                </div>
                <div className="item">
                  <span className="ms">event_available</span>{dates}
                </div>
                {isPerf && (
                  <div className="item" style={{ color: 'var(--brand-purple-600)' }}>
                    <span className="ms" style={{ color: 'var(--brand-purple-500)' }}>workspace_premium</span>Performance Goal
                  </div>
                )}
              </div>

              <div className="review-sec">
                <h4>Key Results</h4>
                {krs.map((kr, i) => (
                  <div className="dotted-row" key={i}>
                    <span className="k">{kr.name || `Key result #${i+1}`}</span>
                    <span className="dots" />
                    <span className="v">{krDir === 'Increase' ? '↑' : '↓'} to {kr.target}{kr.unit === '%' ? '%' : ` ${kr.unit}`}</span>
                  </div>
                ))}
              </div>

              <div className="review-sec">
                <h4>Users</h4>
                <div className="dotted-row">
                  <span className="k">Owner</span>
                  <span className="dots" />
                  <span className="v"><Avatar name={owner} size="xs" />{owner}</span>
                </div>
                <div className="dotted-row">
                  <span className="k">Assignees / Collaborators</span>
                  <span className="dots" />
                  <span className="v">{contributors.length ? <><AvatarStack names={contributors} size="xs" /> {contributors.length} contributor{contributors.length > 1 ? 's' : ''}</> : '0 contributors'}</span>
                </div>
              </div>

              {opts.alignment && (
                <div className="review-sec">
                  <h4>Alignment</h4>
                  <div className="dotted-row">
                    <span className="k">Aligned to</span>
                    <span className="dots" />
                    <span className="v"><span className="ms" style={{ fontSize: 16, color: 'var(--brand-blue-500)' }}>account_tree</span>CG-01 · Acme #1 payroll platform</span>
                  </div>
                </div>
              )}

              {opts.tags && (
                <div className="review-sec">
                  <h4>Tags</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Pill variant="contractor">vendor-ops</Pill>
                    <Pill variant="employee">q3-2026</Pill>
                    <Pill variant="contrib">automation</Pill>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stepper-footer">
          {stepIdx > 0
            ? <Btn variant="ghost" onClick={() => setStepIdx(stepIdx - 1)}><span style={{ padding: '0 8px' }}>Back</span></Btn>
            : <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>}

          <span className="saved"><span className="ms">check_circle</span>Saved Just Now</span>

          <div className="right-actions">
            {isLast ? (
              <>
                {mode === 'edit' ? (
                  <>
                    <button className="btn-draft" onClick={() => onCreate && onCreate(buildPayload('not-started'))}>Save as draft</button>
                    <Btn variant="primary" onClick={() => onCreate && onCreate(buildPayload('not-started'))}>Save changes</Btn>
                  </>
                ) : (
                  <>
                    <button className="btn-draft" onClick={() => onCreate && onCreate(buildPayload('not-started'))}>Create in Draft Mode</button>
                    <Btn variant="primary" onClick={() => onCreate && onCreate(buildPayload('not-started'))}>Create {kind === 'okr' ? 'OKR' : 'Goal'}</Btn>
                  </>
                )}
              </>
            ) : (
              <Btn variant="primary" onClick={() => setStepIdx(stepIdx + 1)}>Next</Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.GoalStepper = GoalStepper;
