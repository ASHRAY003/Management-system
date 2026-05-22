/* Goal Detail page — matches the reference screenshot.
   Shared component used by both client People OKRs view (when "View" is clicked)
   and worker's My Goals view.

   Layout:
   - Crumb at top ("Goals / Goal title")
   - Header with title, description, status pills, type/privacy/when metadata
   - Two-column body:
     - LEFT (2/3): Goal Progress card + Key Results rows
     - RIGHT (1/3): Tracking chart, Days until due, Attachments, Owner, Contributors */

const { useState: useStateGD } = React;

function GoalDetail({ goal, role = 'manager', onBack, onUpdateGoal }) {
  const [showAddKR, setShowAddKR] = useStateGD(false);
  const [newKR, setNewKR] = useStateGD({ name: '', start: 0, target: 100, unit: '%', assignTo: '' });
  // Default sample goal if none provided
  const g = goal || {
    title: 'Build a Scalable Operations Engine to Support 2× Growth with Lower Opex',
    description: 'Drive operational leverage by automating manual workflows and lifting employees-per-Ops-FTE.',
    type: 'Development',
    typeIcon: 'eco',
    privacy: 'Restricted',
    when: '1/1/2026 — 12/31/2026',
    daysLeft: 223,
    perfGoal: true,
    aligned: null,
    tags: [],
    progress: 24,
    owner: { name: 'Ashray Gupta', role: 'Associate Product Manager' },
    contributors: [
      { name: 'Aditi Sharma', role: 'Senior Ops' },
      { name: 'Lina Chen',    role: 'Onboarding Mgr' },
      { name: 'Priya Nair',   role: 'Manager' },
    ],
    krs: [
      { id: 1, current: 92,  target: 300, unit: 'count',     pct: 31, owner: 'Aditi Sharma', text: 'Increase employees managed per Ops FTE from ~133 → 300+ per Ops resource' },
      { id: 2, current: 18,  target: 80,  unit: '%',         pct: 23, owner: 'Lina Chen',    text: 'Automate 80% of payroll workflows (Input → Validation → Processing → Payout)' },
      { id: 3, current: 14,  target: 90,  unit: '%',         pct: 16, owner: 'Aditi Sharma', text: 'Reduce payroll processing errors by 90%' },
      { id: 4, current: 28,  target: 90,  unit: '%',         pct: 31, owner: 'Priya Nair',   text: 'Enable 90% of customer queries via self-serve + AI channels' },
      { id: 5, current: null,target: null,unit: 'incomplete',pct: 0,  owner: 'Lina Chen',    text: 'Achieve zero manual intervention across top 5 payroll corridors' },
    ],
    attachments: 2,
  };

  const isWorker = role === 'worker';
  const canEdit  = !isWorker || g.ownedByMe; // worker can edit if they own it

  return (
    <div className="goal-detail">
      {/* Local crumb bar */}
      <div className="gd-crumbbar">
        <div className="left">
          <button className="back" onClick={onBack}><span className="ms">arrow_back</span></button>
          <span className="crumb-lead">Goals</span>
          <span className="ms" style={{ fontSize: 14, color: 'var(--fg-disabled)' }}>chevron_right</span>
          <span className="crumb-curr">{g.title.length > 70 ? g.title.slice(0, 70) + '…' : g.title}</span>
        </div>
      </div>

      <div className="strip" />

      <div className="gd-body">
        {/* ===== Header ===== */}
        <div className="gd-head">
          <div className="row items-start gap-3" style={{ flexWrap: 'wrap' }}>
            <h1 className="gd-title">
              {g.title}
              {canEdit && <button className="gd-edit-i"><span className="ms">edit</span></button>}
            </h1>
            <div className="row gap-2 items-center" style={{ flexShrink: 0, marginLeft: 'auto' }}>
              <Btn variant="outlined" icon="check_circle">Mark Complete</Btn>
              {g.perfGoal && <Btn variant="outlined" icon="workspace_premium">Unmark as Performance Goal</Btn>}
              <Btn variant="ghost" icon="settings" iconTrailing="expand_more">More Options</Btn>
            </div>
          </div>

          <div className="gd-desc">
            {g.description || <span style={{ color: 'var(--fg-disabled)' }}>Add details about this goal and why it matters…</span>}
            {canEdit && <button className="gd-edit-i" style={{ marginLeft: 6 }}><span className="ms">edit</span></button>}
          </div>

          <div className="gd-tag-row">
            {g.perfGoal && (
              <span className="gd-pill perf">
                <span className="ms">workspace_premium</span>Performance Goal
              </span>
            )}
            <span className="gd-pill">
              <span className="ms">account_tree</span>{g.aligned || 'None'}
            </span>
            <span className="gd-pill">
              <span className="ms">sell</span>{g.tags && g.tags.length ? g.tags.join(', ') : 'None'}
            </span>
          </div>

          <div className="gd-meta">
            <div className="gd-meta-cell">
              <div className="k">Type</div>
              <button className="gd-meta-v">
                <span className="ms" style={{ color: 'var(--success-main)' }}>{g.typeIcon}</span>
                <span>{g.type}</span>
                <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>expand_more</span>
              </button>
            </div>
            <div className="gd-meta-cell">
              <div className="k">Privacy</div>
              <button className="gd-meta-v">
                <span className="ms" style={{ color: 'var(--grey-700)' }}>lock</span>
                <span>{g.privacy}</span>
                <span className="ms" style={{ fontSize: 16, color: 'var(--fg-disabled)' }}>expand_more</span>
              </button>
            </div>
            <div className="gd-meta-cell">
              <div className="k">When</div>
              <div className="gd-meta-v" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <span>{g.when}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Body grid ===== */}
        <div className="gd-grid">
          {/* LEFT: Progress + Key Results */}
          <div className="gd-card">
            <div className="gd-progress-head">
              <div className="lbl">Goal Progress</div>
              <div className="row items-center gap-3">
                <ProgressBar pct={g.progress} hidePct big color={g.progress >= 70 ? 'green' : g.progress >= 35 ? '' : 'amber'} />
                <div className="row items-center gap-2" style={{ flexShrink: 0 }}>
                  <ProgressRing pct={g.progress} />
                  <span className="gd-pct">{g.progress}%</span>
                </div>
              </div>
            </div>

            <div className="gd-kr-block">
              <div className="gd-kr-head">Key Results</div>
              {g.krs.map(kr => (
                <div key={kr.id}>
                  <div className="gd-kr-row">
                    <button className="gd-drag"><span className="ms">drag_indicator</span></button>
                    <Avatar name={kr.owner || '??'} size="sm" />
                    <div className="gd-kr-val">
                      {kr.unit === 'incomplete'
                        ? <span style={{ color: 'var(--fg-disabled)', fontStyle: 'italic' }}>Incomplete</span>
                        : <>{kr.current}{kr.unit === '%' ? '%' : ''} / {kr.target}{kr.unit === '%' ? '%' : ''}</>}
                      <span className="ms refresh">refresh</span>
                    </div>
                    <div className="gd-kr-text">{kr.text}</div>
                    <button className="btn btn-outlined btn-sm" style={{ padding: '4px 14px', borderRadius: 6 }}
                      onClick={() => onUpdateGoal && onUpdateGoal(g, kr)}>Update</button>
                    <button className="gd-kr-more"><span className="ms">more_vert</span></button>
                  </div>
                  {kr.linkedProject && (
                    <div style={{ paddingLeft: 80, paddingBottom: 10, marginTop: -4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11.5, fontWeight: 600, color: 'var(--brand-blue-600)',
                        background: 'var(--brand-blue-50)', border: '1px solid var(--brand-blue-200)',
                        borderRadius: 20, padding: '3px 10px',
                      }}>
                        <span className="ms" style={{ fontSize: 13 }}>link</span>
                        {kr.linkedProject}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {showAddKR ? (
                <div style={{
                  margin: '12px 0 4px', padding: '20px 20px 16px',
                  border: '1.5px solid var(--brand-blue-300)', borderRadius: 10,
                  background: '#F8FBFF',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)', marginBottom: 12 }}>New Key Result</div>

                  <textarea
                    value={newKR.name}
                    onChange={e => setNewKR({ ...newKR, name: e.target.value })}
                    placeholder="What are you measuring?"
                    rows={2}
                    style={{
                      width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8,
                      padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                      background: '#fff',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                    onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                  />
                  <div style={{ fontSize: 12, color: 'var(--fg-disabled)', marginBottom: 14, marginTop: 4 }}>
                    {newKR.name.length} / 512 Characters
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Start</div>
                      <input type="number" value={newKR.start}
                        onChange={e => setNewKR({ ...newKR, start: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Target</div>
                      <input type="number" value={newKR.target}
                        onChange={e => setNewKR({ ...newKR, target: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                        onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Unit</div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', fontSize: 15, color: 'var(--fg-secondary)' }} className="ms">
                          {newKR.unit === '%' ? 'percent' : newKR.unit === 'days' ? 'event' : newKR.unit === 'USD' ? 'attach_money' : 'tag'}
                        </span>
                        <select value={newKR.unit} onChange={e => setNewKR({ ...newKR, unit: e.target.value })}
                          style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none' }}>
                          <option value="%">Percentage</option>
                          <option value="days">Days</option>
                          <option value="count">Count</option>
                          <option value="USD">USD</option>
                        </select>
                        <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', fontSize: 18, color: 'var(--fg-disabled)' }} className="ms">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-700)', marginBottom: 5 }}>Assign To</div>
                    <input
                      value={newKR.assignTo}
                      onChange={e => setNewKR({ ...newKR, assignTo: e.target.value })}
                      placeholder="Type names here to find users"
                      style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--brand-blue-400)'}
                      onBlur={e => e.target.style.borderColor = 'var(--grey-200)'}
                    />
                  </div>

                  <div className="row gap-2">
                    <button
                      onClick={() => { setShowAddKR(false); setNewKR({ name: '', start: 0, target: 100, unit: '%', assignTo: '' }); }}
                      style={{ border: 'none', borderRadius: 8, background: 'var(--brand-blue-500)', padding: '8px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}>
                      Save
                    </button>
                    <button
                      onClick={() => { setShowAddKR(false); setNewKR({ name: '', start: 0, target: 100, unit: '%', assignTo: '' }); }}
                      style={{ border: 'none', borderRadius: 8, background: 'transparent', padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: 'var(--brand-blue-600)', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gd-kr-add">
                  <span>Need to track something else?</span>
                  <a style={{ cursor: 'pointer' }} onClick={() => setShowAddKR(true)}>Add Key Result</a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Tracking + due + attachments + owner + contribs */}
          <div className="col gap-3">
            <div className="gd-card">
              <div className="gd-section-head">Tracking</div>
              <TrackingChart progress={g.progress} />
              <div className="gd-legend">
                <span><span className="dot today" /> Today</span>
                <span><span className="dot start" /> Start Date</span>
                <span><span className="dot due" /> Due Date</span>
              </div>
            </div>

            <div className="gd-card row items-center between" style={{ padding: '18px 22px' }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--success-dark)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{g.daysLeft}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--grey-700)', marginTop: 6 }}>Days until due</div>
              </div>
              <a className="gd-link">Change Due Date</a>
            </div>

            <div className="gd-card">
              <div className="row items-center between" style={{ padding: '14px 20px 12px' }}>
                <div className="row items-center gap-2" style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                  <span className="ms" style={{ color: 'var(--fg-secondary)' }}>attach_file</span>Attachments
                </div>
                <button className="btn btn-outlined btn-sm" style={{ padding: '4px 14px' }}>+ Add Attachments</button>
              </div>
              <div style={{ padding: '0 20px 14px' }}>
                {g.attachments > 0 ? (
                  <div className="col gap-2">
                    <div className="gd-attachment">
                      <span className="ms" style={{ color: 'var(--brand-blue-500)', fontSize: 22 }}>description</span>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="t">Ops scaling playbook · v2.docx</div>
                        <div className="d">Shared 3 days ago · 1.2 MB</div>
                      </div>
                      <span className="ms" style={{ color: 'var(--fg-disabled)' }}>download</span>
                    </div>
                    <div className="gd-attachment">
                      <span className="ms" style={{ color: 'var(--brand-green-600)', fontSize: 22 }}>table_chart</span>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="t">FTE-leverage model · Q1 baseline.xlsx</div>
                        <div className="d">Shared 1 week ago · 410 KB</div>
                      </div>
                      <span className="ms" style={{ color: 'var(--fg-disabled)' }}>download</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--fg-disabled)', fontStyle: 'italic', padding: '8px 0' }}>No attachments yet.</div>
                )}
              </div>
            </div>

            <div className="gd-card">
              <div className="row items-center gap-2" style={{ padding: '14px 20px 10px', fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                Owner <span className="ms" style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>info</span>
              </div>
              <div style={{ padding: '0 20px 14px' }}>
                <div className="row items-center gap-3">
                  <Avatar name={g.owner.name} size="md" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-blue-600)', letterSpacing: '-0.01em' }}>{g.owner.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 1 }}>{g.owner.role}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gd-card">
              <div className="row items-center between" style={{ padding: '14px 20px 10px' }}>
                <div className="row items-center gap-2" style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>
                  Contributors <span className="ms" style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>info</span>
                </div>
                {canEdit && <button className="btn btn-outlined btn-sm" style={{ padding: '4px 12px' }}>+ Add</button>}
              </div>
              <div style={{ padding: '0 20px 14px' }} className="col gap-2">
                {g.contributors.map((c, i) => (
                  <div key={i} className="row items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-700)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 1 }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Progress ring SVG */
function ProgressRing({ pct = 0, size = 28, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--grey-200)" strokeWidth={stroke} fill="none" strokeDasharray="2 3" />
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--brand-blue-500)" strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" />
    </svg>
  );
}

/* Tracking chart — simple area chart */
function TrackingChart({ progress = 0 }) {
  const W = 320, H = 150, padL = 30, padR = 20, padT = 18, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // X axis: Jan '26 (start), Jul '26 (today), Jan '27 (due)
  const pts = [
    { x: 0,    y: 0 },           // start (Jan)
    { x: 0.42, y: 0 },           // mid-flat
    { x: 0.55, y: 0.18 },        // today (Jul, progress)
    { x: 1,    y: 1 },           // due (target)
  ];

  // Build SVG path: line + filled area
  const linePts = pts.map(p => `${padL + p.x * innerW},${padT + (1 - p.y) * innerH}`).join(' L');
  const linePath = 'M ' + linePts;
  const areaPath = linePath + ` L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`;

  // Today point coords
  const todayX = padL + 0.55 * innerW;
  const todayY = padT + (1 - 0.18) * innerH;
  const startX = padL;
  const dueX   = padL + innerW;

  return (
    <div style={{ padding: '12px 16px 6px', position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Y-axis lines */}
        {[0, 25, 50, 75, 100, 125].map((v, i) => {
          const y = padT + (1 - v/125) * innerH;
          return <g key={v}>
            <text x={padL - 6} y={y + 3} textAnchor="end" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>{v}</text>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="var(--grey-100)" strokeWidth="0.5" />
          </g>;
        })}
        {/* Area fill */}
        <path d={areaPath} fill="rgba(0,117,225,0.10)" />
        {/* Line */}
        <path d={linePath} stroke="var(--brand-blue-500)" strokeWidth="1.5" fill="none" />
        {/* Start marker */}
        <rect x={startX - 4} y={padT - 4} width="8" height="8" fill="var(--grey-700)" />
        <line x1={startX} y1={padT} x2={startX} y2={padT + innerH} stroke="var(--info-main)" strokeWidth="1" />
        {/* Today marker */}
        <circle cx={todayX} cy={todayY} r="4" fill="var(--brand-blue-500)" stroke="#fff" strokeWidth="1.5" />
        <line x1={todayX} y1={padT} x2={todayX} y2={padT + innerH} stroke="var(--info-main)" strokeWidth="1" />
        {/* Due marker */}
        <polygon points={`${dueX-6},${padT-2} ${dueX},${padT+6} ${dueX+6},${padT-2}`} fill="var(--error-main)" />
        <line x1={dueX} y1={padT} x2={dueX} y2={padT + innerH} stroke="var(--error-main)" strokeWidth="1" strokeDasharray="2 2" />
        {/* X labels */}
        <text x={startX} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jan '26</text>
        <text x={padL + 0.55 * innerW} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jul '26</text>
        <text x={dueX} y={H - 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--fg-secondary)' }}>Jan '27</text>
      </svg>
    </div>
  );
}

window.GoalDetail = GoalDetail;
