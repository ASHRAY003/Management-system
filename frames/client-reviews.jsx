/* Frame · Client Reviews (manager view)
   List of direct reports → pick a worker → see their review history and
   click "Write a review" to open a rich review-writing page. */

const { useState: useStateCR } = React;

function ClientReviews() {
  // view: 'list' | 'worker' | 'write' | 'cycle-stepper' | 'cycle-detail' | 'manager-review' | 'self-review-view'
  const [view, setView] = useStateCR('list');
  const [worker, setWorker] = useStateCR(null);
  const [activeCycleId, setActiveCycleId] = useStateCR(null);
  const [activeParticipantId, setActiveParticipantId] = useStateCR(null);
  const [selfReviewBackView, setSelfReviewBackView] = useStateCR('cycle-detail');
  const [storeVersion, setStoreVersion] = useStateCR(0);

  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  // Fetch legacy reviews for all workers so the list view shows real ratings.
  React.useEffect(() => {
    if (view === 'list') {
      window.PerformanceStore.getWorkers().forEach(w => {
        window.PerformanceStore.refreshLegacyReviews(w.id);
      });
    }
  }, [view]);

  React.useEffect(() => {
    if (window.sessionStorage.getItem('payo.reviews.openStepper') === '1') {
      window.sessionStorage.removeItem('payo.reviews.openStepper');
      setView('cycle-stepper');
    }
    const openMrParticipantId = window.sessionStorage.getItem('payo.reviews.openManagerReview');
    if (openMrParticipantId) {
      window.sessionStorage.removeItem('payo.reviews.openManagerReview');
      const participant = window.PerformanceStore.getReviewParticipantById(openMrParticipantId);
      if (participant) {
        setActiveCycleId(participant.reviewCycleId);
        setActiveParticipantId(openMrParticipantId);
        setView('manager-review');
      }
    }
  }, []);

  const WORKER_COMP = {
    'Aditi Sharma':  { amount: 72000,  currency: 'USD' },
    'Rahul Mehta':   { amount: 85000,  currency: 'USD' },
    'Priya Mehta':   { amount: 110000, currency: 'USD' },
  };

  const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];

  const team = window.PerformanceStore.getWorkers().map(w => {
    const reviews = window.PerformanceStore.getReviewsForWorker(w.id, true);
    const sorted = [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const latest = sorted[0];
    const lastRating = latest ? (Number(latest.rating) || 0) : 0;
    const lastOutcome = lastRating >= 4 ? 'Exceeds' : lastRating >= 2.5 ? 'Meets' : lastRating > 0 ? 'Below' : '—';

    // Find the most relevant active cycle participant for this worker:
    // priority: needs writing > needs sharing > all done
    const workerParts = allParticipants.filter(p => p.workerId === w.id);
    const needsWrite = workerParts.find(p =>
      p.managerReviewStatus === 'not-started' || p.managerReviewStatus === 'not_started' || p.managerReviewStatus === 'draft'
    );
    const needsShare = workerParts.find(p =>
      (p.managerReviewStatus === 'submitted') &&
      p.finalReviewStatus !== 'shared' && p.finalReviewStatus !== 'acknowledged'
    );
    const activePart = needsWrite || needsShare || null;

    return {
      id: w.id,
      name: w.name,
      role: w.role || w.title || '',
      reviewsCount: reviews.length,
      lastReview: latest?.createdAt || '—',
      lastRating,
      lastOutcome,
      pendingFor: needsWrite ? `review` : null,
      needsShare: !!needsShare,
      activeCycleId: activePart?.reviewCycleId || null,
      currentComp: WORKER_COMP[w.name] || null,
    };
  });

  // -- Start review cycle stepper
  if (view === 'cycle-stepper') {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'New review cycle']}>
        <PerfTabs active="reviews" />
        <ReviewCycleStepper
          onCancel={() => setView('list')}
          onSaved={() => setView('list')}
          onLaunched={(cycle) => { setActiveCycleId(cycle.id); setView('cycle-detail'); }}
        />
      </Shell>
    );
  }

  // -- Review cycle detail (participants list)
  if (view === 'cycle-detail' && activeCycleId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Cycle']}>
        <PerfTabs active="reviews" />
        <ReviewCycleDetail
          cycleId={activeCycleId}
          onBack={() => setView('list')}
          onOpenManagerReview={(participantId) => { setActiveParticipantId(participantId); setView('manager-review'); }}
          onViewSelfReview={(participantId) => { setSelfReviewBackView('cycle-detail'); setActiveParticipantId(participantId); setView('self-review-view'); }}
        />
      </Shell>
    );
  }

  // -- Manager review form
  if (view === 'manager-review' && activeParticipantId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Manager review']}>
        <PerfTabs active="reviews" />
        <ManagerReviewForm participantId={activeParticipantId} onBack={() => setView('cycle-detail')} />
      </Shell>
    );
  }

  // -- Read-only viewer for a worker's submitted self-review
  if (view === 'self-review-view' && activeParticipantId) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', 'Self-review']}>
        <PerfTabs active="reviews" />
        <ClientSelfReviewViewer
          participantId={activeParticipantId}
          onBack={() => setView(selfReviewBackView)}
          onWriteManagerReview={() => setView('manager-review')}
        />
      </Shell>
    );
  }

  // -- Write a Review page
  if (view === 'write' && worker) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', worker.name, 'Write a review']}>
        <PerfTabs active="reviews" />
        <ReviewEditor worker={worker} onBack={() => setView('worker')} />
      </Shell>
    );
  }

  // -- Worker history page
  if (view === 'worker' && worker) {
    return (
      <Shell persona="client" active="performance"
        crumb={['Acme Holdings', 'Performance', 'Reviews', worker.name]}>
        <PerfTabs active="reviews" />
        <WorkerReviewHistory
          worker={worker}
          onBack={() => setView('list')}
          onWrite={() => setView('write')}
          onViewSelfReview={(participantId) => { setSelfReviewBackView('worker'); setActiveParticipantId(participantId); setView('self-review-view'); }}
        />
      </Shell>
    );
  }

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', 'Reviews']}>
      <PerfTabs active="reviews" />

      <PageHead
        eyebrow="Performance Management"
        title="Reviews"
        sub="Run formal review cycles for employees and contractors, or write individual reviews."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="primary" icon="play_circle" onClick={() => setView('cycle-stepper')}>Start review cycle</Btn>
        </>}
      />

      {(() => {
        const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];
        const toWrite       = allParticipants.filter(p => p.managerReviewStatus === 'not-started' || p.managerReviewStatus === 'not_started' || p.managerReviewStatus === 'draft').length;
        const selfSubmitted = allParticipants.filter(p => p.selfReviewStatus === 'submitted').length;
        const fb            = (window.PerformanceStore.getData().feedback || []).length;
        const readyToShare  = allParticipants.filter(p => p.managerReviewStatus === 'submitted' && p.finalReviewStatus !== 'shared' && p.finalReviewStatus !== 'acknowledged').length;
        return (
          <div className="stats-row c-4 mb-4">
            <StatCard tone="blue"   icon="reviews"         label="Reviews to write"      value={String(toWrite)}       sub={toWrite ? 'Open the cycle below' : 'Nothing pending'} />
            <StatCard tone="green"  icon="task_alt"        label="Self-reviews submitted" value={String(selfSubmitted)} sub={`Across ${allParticipants.length} participant${allParticipants.length === 1 ? '' : 's'}`} />
            <StatCard tone="purple" icon="inbox"           label="Feedback given"        value={String(fb)}             sub={fb ? 'Across your team' : 'No feedback given yet'} />
            <StatCard tone="amber"  icon="pending_actions" label="Ready to share"        value={String(readyToShare)}   sub={readyToShare ? 'Submitted, not shared' : 'Nothing waiting'} />
          </div>
        );
      })()}

      <ReviewCyclesPanel
        onOpenCycle={(cycleId) => { setActiveCycleId(cycleId); setView('cycle-detail'); }}
        onStartCycle={() => setView('cycle-stepper')}
      />

      <SectionCard
        title="My direct reports"
        sub="Click a worker to view their review history or write a new review"
        icon="groups"
        padBody={false}
      >
        <table className="tbl">
          <thead><tr>
            <th>Worker</th>
            <th className="num">Reviews</th>
            <th>Last review</th>
            <th>Last rating</th>
            <th>Current comp</th>
            <th>Cycle status</th>
            <th />
          </tr></thead>
          <tbody>
            {team.map((t, i) => (
              <tr key={i}>
                <td>
                  <div className="worker-cell">
                    <Avatar name={t.name} size="md" />
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{t.reviewsCount}</td>
                <td>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.lastReview}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>by you</div>
                </td>
                <td>
                  <div className="row items-center gap-2">
                    <Stars value={Math.round(t.lastRating)} size="sm" />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums' }}>{t.lastRating.toFixed(1)}</span>
                    <Pill variant={t.lastOutcome === 'Exceeds' ? 'eligible' : t.lastOutcome === 'Below' ? 'needs-support' : 'on-track'}>{t.lastOutcome}</Pill>
                  </div>
                </td>
                <td>
                  {t.currentComp
                    ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>
                        {t.currentComp.currency} {t.currentComp.amount.toLocaleString()}
                      </span>
                    : <span style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>—</span>}
                </td>
                <td>
                  {t.pendingFor
                    ? <Pill variant="warning" icon="pending_actions">Review pending</Pill>
                    : t.needsShare
                      ? <Pill variant="active" icon="send">Submitted · not shared</Pill>
                      : <Pill variant="completed" dot>Up to date</Pill>}
                </td>
                <td className="actions-cell">
                  <Btn variant="ghost" size="sm" icon="history" onClick={() => { setWorker(t); setView('worker'); }}>History</Btn>
                  {t.pendingFor && (
                    <Btn variant="primary" size="sm" icon="edit"
                      onClick={() => { setWorker(t); setView('write'); }}>Write a review</Btn>
                  )}
                  {t.needsShare && t.activeCycleId && (
                    <Btn variant="outlined" size="sm" icon="open_in_new"
                      onClick={() => { setActiveCycleId(t.activeCycleId); setView('cycle-detail'); }}>
                      Open cycle
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <ReviewCompensationConfig />

    </Shell>
  );
}

/* ---------- Compensation Revision Config (used on 1:1 Meetings page) ---------- */
function CompensationConfigPanel() {
  const STORAGE_KEY = 'payo.comp.config';
  const DEFAULT_CONFIG = [
    { id: 1, minScore: 0, maxScore: 1,    revisionType: 'no_change',    revisionValue: 0,    currency: 'USD', label: 'No revision' },
    { id: 2, minScore: 1, maxScore: 2,    revisionType: 'fixed_amount', revisionValue: 200,  currency: 'USD', label: '+200 USD' },
    { id: 3, minScore: 2, maxScore: 4,    revisionType: 'fixed_amount', revisionValue: 500,  currency: 'USD', label: '+500 USD' },
    { id: 4, minScore: 4, maxScore: null, revisionType: 'fixed_amount', revisionValue: 1000, currency: 'USD', label: '+1000 USD' },
  ];

  function loadConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_CONFIG; }
    catch (e) { return DEFAULT_CONFIG; }
  }

  const [rows, setRows] = useStateCR(loadConfig);
  const [editingId, setEditingId] = useStateCR(null);
  const [draft, setDraft] = useStateCR(null);
  const [saved, setSaved] = useStateCR(false);
  const [collapsed, setCollapsed] = useStateCR(false);
  const nextId = useStateCR(100)[0];

  function startEdit(row) {
    setEditingId(row.id);
    setDraft({ ...row });
  }
  function cancelEdit() { setEditingId(null); setDraft(null); }
  function saveEdit() {
    setRows(prev => prev.map(r => r.id === editingId ? { ...draft } : r));
    setEditingId(null); setDraft(null);
  }
  function deleteRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
    if (editingId === id) { setEditingId(null); setDraft(null); }
  }
  function addRow() {
    const newRow = { id: Date.now(), minScore: 0, maxScore: 1, revisionType: 'percentage', revisionValue: 0, currency: 'USD', label: '' };
    setRows(prev => [...prev, newRow]);
    setEditingId(newRow.id);
    setDraft({ ...newRow });
  }
  function saveConfig() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const TYPE_LABELS = { no_change: 'No change', fixed_amount: 'Fixed amount', percentage: 'Percentage', manual_review: 'Manual review' };

  return (
    <div>
      {/* Section header — same style as Today / Past sessions on meetings page */}
      <div className="day-row">
        <span className="label">Review Compensation</span>
        <span className="date">Score-based revision rules</span>
        <span className="count">{rows.length} range{rows.length !== 1 ? 's' : ''}</span>
        <span className="line" />
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          <Btn variant="ghost" size="sm" icon="add" onClick={addRow}>Add range</Btn>
          <Btn variant={saved ? 'ghost' : 'outlined'} size="sm" icon={saved ? 'check' : 'save'} onClick={saveConfig}>
            {saved ? 'Saved!' : 'Save config'}
          </Btn>
        </div>
      </div>

      <div className="tbl-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Score range</th>
              <th>Revision type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Label</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--fg-secondary)', fontSize: 13, padding: '16px 20px' }}>
                No ranges defined. Click <strong>Add range</strong> above.
              </td></tr>
            )}
            {rows.map(row => {
              const isEditing = editingId === row.id;
              const d = isEditing ? draft : row;
              const scoreLabel = d.maxScore === null ? `${d.minScore}+` : `${d.minScore} – ${d.maxScore}`;
              return (
                <tr key={row.id} style={{ background: isEditing ? 'var(--grey-50)' : 'transparent' }}>
                  <td>
                    {isEditing ? (
                      <div className="row gap-1 items-center">
                        <input type="number" value={d.minScore} min={0} step={0.5}
                          style={{ width: 48, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                          onChange={e => setDraft(p => ({ ...p, minScore: Number(e.target.value) }))} />
                        <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>–</span>
                        <input type="number" value={d.maxScore ?? ''} min={0} step={0.5} placeholder="∞"
                          style={{ width: 48, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                          onChange={e => setDraft(p => ({ ...p, maxScore: e.target.value === '' ? null : Number(e.target.value) }))} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>{scoreLabel}</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select value={d.revisionType} onChange={e => setDraft(p => ({ ...p, revisionType: e.target.value }))}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
                        <option value="no_change">No change</option>
                        <option value="fixed_amount">Fixed amount</option>
                        <option value="percentage">Percentage</option>
                        <option value="manual_review">Manual review</option>
                      </select>
                    ) : (
                      <Pill variant={d.revisionType === 'no_change' ? 'draft' : d.revisionType === 'manual_review' ? 'warning' : 'on-track'} size="sm">
                        {TYPE_LABELS[d.revisionType] || d.revisionType}
                      </Pill>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="number" value={d.revisionValue ?? ''} min={0}
                        disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review'}
                        style={{ width: 80, border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12,
                          opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review') ? 0.4 : 1 }}
                        onChange={e => setDraft(p => ({ ...p, revisionValue: Number(e.target.value) }))} />
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                        {d.revisionType === 'no_change' ? '—'
                          : d.revisionType === 'manual_review' ? 'Manual'
                          : d.revisionType === 'percentage' ? `${d.revisionValue}%`
                          : `+${d.revisionValue}`}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select value={d.currency} onChange={e => setDraft(p => ({ ...p, currency: e.target.value }))}
                        disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage'}
                        style={{ border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: 'inherit', background: '#fff',
                          opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage') ? 0.4 : 1 }}>
                        {['USD','EUR','GBP','INR','SGD'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                        {d.revisionType === 'percentage' || d.revisionType === 'no_change' ? '—' : (d.currency || '—')}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="text" value={d.label} placeholder="e.g. +500 USD"
                        style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                        onChange={e => setDraft(p => ({ ...p, label: e.target.value }))} />
                    ) : (
                      <span style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{d.label || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    {isEditing ? (
                      <>
                        <Btn variant="primary" size="sm" icon="check" onClick={saveEdit}>OK</Btn>
                        <Btn variant="ghost" size="sm" icon="close" onClick={cancelEdit} />
                      </>
                    ) : (
                      <>
                        <Btn variant="ghost" size="sm" icon="edit" onClick={() => startEdit(row)} />
                        <Btn variant="ghost" size="sm" icon="delete" onClick={() => deleteRow(row.id)} style={{ color: 'var(--error-main)' }} />
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Worker review history (manager view) ---------- */
function WorkerReviewHistory({ worker, onBack, onWrite, onViewSelfReview }) {
  const [storeVersion, setStoreVersionWRH] = useStateCR(0);
  const [reviewTab, setReviewTab] = useStateCR('manager');
  const [selectedReview, setSelectedReview] = useStateCR(null);
  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersionWRH(v => v + 1)), []);
  React.useEffect(() => {
    window.PerformanceStore.refreshLegacyReviews(worker.id);
  }, [worker.id]);

  const storedReviews = window.PerformanceStore.getReviewsForWorker(worker.id, true);
  const history = [];

  // Gather self reviews for this worker across all cycles
  const allParticipants = window.PerformanceStore.getData().reviewParticipants || [];
  const selfReviewEntries = allParticipants
    .filter(p => p.workerId === worker.id)
    .map(p => ({
      participant: p,
      cycle: window.PerformanceStore.getReviewCycleById(p.reviewCycleId),
      sr: window.PerformanceStore.getSelfReview(p.id),
    }))
    .filter(e => e.cycle && e.sr)
    .sort((a, b) => new Date(b.sr.submittedAt || b.sr.updatedAt || 0) - new Date(a.sr.submittedAt || a.sr.updatedAt || 0));

  // Read-only review detail view
  if (selectedReview) {
    const r = selectedReview;
    return (
      <>
        <div className="row items-center between mb-4">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setSelectedReview(null)}>Back to {worker.name}'s history</Btn>
          <div className="row gap-2">
            <Pill variant={r.outcome === 'Shared' ? 'eligible' : 'warning'} dot>{r.outcome}</Pill>
          </div>
        </div>
        <PageHead
          eyebrow={`${r.cycle} · Manager review`}
          title={`Review for ${worker.name}`}
          sub={`${worker.role} · ${r.when || '—'} · written by ${r.author}`}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
          <div className="col gap-4">
            <SectionCard title="Performance comments" icon="edit_note">
              <div style={{ fontSize: 13.5, color: 'var(--grey-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {r.summary || <em style={{ color: 'var(--fg-disabled)' }}>No comments recorded.</em>}
              </div>
            </SectionCard>
          </div>
          <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
            <SectionCard title="Overall rating" icon="star">
              <div className="col items-center" style={{ textAlign: 'center', padding: '8px 0' }}>
                <Stars value={Math.round(r.rating)} size="lg" />
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 8 }}>
                  {r.rating.toFixed(1)} / 5
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Review meta" icon="info">
              <div className="col gap-2" style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>event</span>
                  <span>{r.when || '—'}</span>
                </div>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>person</span>
                  <span>Written by {r.author}</span>
                </div>
                <div className="row items-center gap-2">
                  <span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>layers</span>
                  <span>{r.cycle}</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </>
    );
  }

  const SegToggle = () => (
    <div className="row" style={{ background: 'var(--grey-100)', borderRadius: 8, padding: 3, gap: 2 }}>
      {[{ key: 'manager', label: 'Manager reviews', icon: 'badge' }, { key: 'self', label: 'Self reviews', icon: 'person' }].map(t => (
        <button key={t.key} onClick={() => setReviewTab(t.key)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: reviewTab === t.key ? '#fff' : 'transparent',
          fontWeight: 700, fontSize: 12.5,
          color: reviewTab === t.key ? 'var(--grey-800)' : 'var(--fg-secondary)',
          boxShadow: reviewTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s',
        }}>
          <span className="ms" style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="row items-center mb-4 gap-2">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to team</Btn>
      </div>

      <PageHead
        eyebrow="Review history"
        title={worker.name}
        sub={`${worker.role} · ${history.length} reviews on record · last reviewed ${worker.lastReview}`}
        actions={<>
          <Btn variant="ghost" icon="event">Schedule 1:1</Btn>
          <Btn variant="ghost" icon="forum">Give feedback</Btn>
          <Btn variant="primary" icon="edit" onClick={onWrite}>Write a review</Btn>
        </>}
      />

      <div className="stats-row c-3 mb-4">
        <StatCard tone="blue"   icon="star"        label="Average rating · 12mo" value={worker.lastRating ? worker.lastRating.toFixed(1) : '—'} sub={worker.lastOutcome && worker.lastOutcome !== '—' ? `Last cycle: ${worker.lastOutcome}` : 'No reviews yet'} />
        <StatCard tone="green"  icon="trending_up" label="Trend"                  value="—"     sub="Needs ≥ 2 reviews" />
        <StatCard tone="purple" icon="task_alt"    label="Reviews on record"      value={String(storedReviews.length + history.length)} sub="Including shared cycle reviews" />
      </div>

      <SectionCard
        title={reviewTab === 'manager' ? 'Manager reviews' : 'Self reviews'}
        sub={reviewTab === 'manager' ? 'Across cycles and types' : `${selfReviewEntries.length} self-review${selfReviewEntries.length === 1 ? '' : 's'} across cycles`}
        icon={reviewTab === 'manager' ? 'history' : 'person'}
        action={<SegToggle />}
        padBody={false}
      >
        {reviewTab === 'manager' && (
          <>
            {[...storedReviews.map(r => ({
              id: r.id,
              when: r.createdAt,
              cycle: r.title,
              type: 'Manager',
              author: 'You',
              rating: Number(r.rating) || 0,
              outcome: r.visibleToWorker ? 'Shared' : 'Draft',
              summary: r.comments || 'Review saved without comments yet.',
              storeReview: r,
            })), ...history].map((h, i, arr) => (
              <div key={h.id} style={{ padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--grey-50)' : 'none',
                display: 'grid', gridTemplateColumns: '140px 1fr 200px auto', gap: 18, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)' }}>{h.when}</div>
                  <Pill variant={h.type === 'Project' ? 'contractor' : 'employee'} icon={h.type === 'Project' ? 'rocket_launch' : 'reviews'}>{h.type}</Pill>
                </div>
                <div>
                  <div className="row items-center gap-2 mb-2">
                    <Avatar name={h.author} size="xs" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-700)' }}>{h.author === 'You' ? 'You' : h.author}</span>
                    <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {h.cycle}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.5 }}>{h.summary}</div>
                </div>
                <div className="row items-center gap-2">
                  <Stars value={Math.round(h.rating)} size="sm" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums' }}>{h.rating.toFixed(1)}</span>
                  <Pill variant={h.outcome === 'Exceeds' || h.outcome === 'Shared' ? 'eligible' : h.outcome === 'Draft' ? 'warning' : 'on-track'}>{h.outcome}</Pill>
                </div>
                {h.storeReview && !h.storeReview.visibleToWorker
                  ? <Btn variant="primary" size="sm" icon="visibility" onClick={() => window.PerformanceStore.shareReview(h.id)}>Share</Btn>
                  : <Btn variant="ghost" size="sm" icon="visibility" onClick={() => setSelectedReview(h)}>View</Btn>}
              </div>
            ))}
            {storedReviews.length === 0 && history.length === 0 && (
              <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No manager reviews on record yet.</div>
            )}
          </>
        )}

        {reviewTab === 'self' && (
          <>
            {selfReviewEntries.length === 0 && (
              <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No self-reviews found for this worker.</div>
            )}
            {selfReviewEntries.map(({ participant: p, cycle, sr }, i) => {
              const dateStr = sr.submittedAt
                ? new Date(sr.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (sr.updatedAt ? new Date(sr.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
              const answeredCount = (sr.answers || []).filter(a => a.answer?.trim()).length;
              const totalCount = (sr.answers || []).length;
              const preview = (sr.answers || []).find(a => a.answer?.trim())?.answer || '';
              return (
                <div key={p.id} style={{
                  padding: '16px 20px',
                  borderBottom: i < selfReviewEntries.length - 1 ? '1px solid var(--grey-50)' : 'none',
                  display: 'grid', gridTemplateColumns: '140px 1fr 160px auto', gap: 18, alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{dateStr}</div>
                    <Pill variant="employee" icon="person" size="sm" style={{ marginTop: 4 }}>Self review</Pill>
                  </div>
                  <div>
                    <div className="row items-center gap-2 mb-1">
                      <Avatar name={worker.name} size="xs" />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-700)' }}>{worker.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {cycle.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 4 }}>
                      {answeredCount}/{totalCount} questions answered
                    </div>
                    {preview && (
                      <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {preview}
                      </div>
                    )}
                  </div>
                  <div>
                    {sr.status === 'submitted'
                      ? <Pill variant="completed" dot>Submitted</Pill>
                      : <Pill variant="warning" dot>Draft</Pill>}
                  </div>
                  <Btn variant="ghost" size="sm" icon="visibility"
                    onClick={() => onViewSelfReview && onViewSelfReview(p.id)}>View</Btn>
                </div>
              );
            })}
          </>
        )}
      </SectionCard>
    </>
  );
}

/* ---------- Review editor (Write a review page) ---------- */
function ReviewEditor({ worker, onBack }) {
  const [rating, setRating] = useStateCR(4);
  const [outcome, setOutcome] = useStateCR('exceeds');
  const [comments, setComments] = useStateCR(`${worker.name.split(' ')[0]} had an outstanding quarter. She owned the Spain cutover end-to-end and delivered with zero P0 incidents.`);

  async function saveReview(shareNow = false, status = 'submitted') {
    const review = await window.PerformanceStore.createReview({
      workerId: worker.id,
      title: 'Q3 Performance Review',
      period: 'Q3 2026',
      rating,
      comments,
      status: shareNow ? 'shared' : status,
      visibleToWorker: shareNow,
      linkedGoalIds: window.PerformanceStore.getGoalsForWorker(worker.id).map(g => g.id),
    });
    if (shareNow) await window.PerformanceStore.shareReview(review.id);
    onBack();
  }

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to {worker.name}'s history</Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={() => saveReview(false, 'draft')}>Save draft</Btn>
          <Btn variant="outlined" icon="send" onClick={() => saveReview(false)}>Submit review</Btn>
          <Btn variant="primary" icon="visibility" onClick={() => saveReview(true)}>Submit & share</Btn>
        </div>
      </div>

      <PageHead
        eyebrow="Q3 Performance Review · Manager review"
        title={`Write a review for ${worker.name}`}
        sub={`${worker.role} · cycle due Oct 15, 2026 · auto-saves as you type`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)', gap: 16 }}>
        {/* LEFT: the form */}
        <div className="col gap-4">
          {/* Reviewee panel */}
          <SectionCard title="Reviewing" icon="person">
            <div className="row items-center gap-3">
              <Avatar name={worker.name} size="lg" />
              <div className="flex-1">
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>{worker.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>{worker.role} · {worker.reviewsCount} prior reviews</div>
              </div>
              <div className="col gap-1" style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last review</span>
                <div className="row items-center gap-2">
                  <Stars value={Math.round(worker.lastRating)} size="sm" />
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{worker.lastRating.toFixed(1)} · {worker.lastOutcome}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Question 1: Overall comments */}
          <SectionCard title="1 · Overall performance this cycle" sub="What did they do well? Where did they grow?" icon="edit_note">
            <div className="re-textarea">
              <div className="re-toolbar">
                <button className="tb-btn"><span className="ms">format_bold</span></button>
                <button className="tb-btn"><span className="ms">format_italic</span></button>
                <button className="tb-btn"><span className="ms">format_underlined</span></button>
                <span className="tb-sep" />
                <button className="tb-btn"><span className="ms">format_list_bulleted</span></button>
                <button className="tb-btn"><span className="ms">format_list_numbered</span></button>
                <span className="tb-sep" />
                <button className="tb-btn"><span className="ms">link</span></button>
                <button className="tb-btn"><span className="ms">alternate_email</span></button>
                <span className="tb-right">
                  <button className="tb-btn" style={{ color: 'var(--brand-blue-500)' }}>
                    <span className="ms">spellcheck</span>
                  </button>
                </span>
              </div>
              <div className="re-body" contentEditable suppressContentEditableWarning onInput={(e) => setComments(e.currentTarget.innerText)}>
                {worker.name.split(' ')[0]} had an outstanding quarter. She owned the Spain cutover end-to-end and delivered with zero P0 incidents — a first for our migration program. The runbook she built on the back of the Italy retro is now the team standard.
                <br /><br />
                Growth area: her instinct is to absorb scope rather than delegate. As she moves toward the Lead Ops path, the next step is letting Lina own the playbook and stepping into the orchestration role.
              </div>
              <div className="re-footer">
                <span className="char-count">487 / 4000 characters</span>
                <span className="saved-i"><span className="ms">check_circle</span>Saved Just Now</span>
              </div>
            </div>
          </SectionCard>

          {/* Question 2: Goals & key results assessment */}
          <SectionCard title="2 · Goal & key-result assessment" sub="Pulled in from People Goals — adjust outcomes per KR" icon="flag">
            <div className="col gap-2">
              {[
                { kr: 'Migrate 6 anchor customers', met: 'Achieved', tone: 'eligible' },
                { kr: 'Zero P0 incidents during migration', met: 'Achieved', tone: 'eligible' },
                { kr: 'CSAT > 4.5 post-migration', met: 'Partially met', tone: 'on-track' },
              ].map((r, i) => (
                <div key={i} className="row items-center gap-3" style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 30 }}>KR{i+1}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--grey-700)' }}>{r.kr}</span>
                  <Pill variant={r.tone} dot>{r.met}</Pill>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Question 3: Development feedback */}
          <SectionCard title="3 · Development feedback" sub="What should they focus on next cycle?" icon="trending_up">
            <div className="re-textarea">
              <div className="re-body" contentEditable suppressContentEditableWarning data-placeholder="Be specific. Reference projects, OKRs, or moments.">
                <em style={{ color: 'var(--fg-disabled)' }}>Add development feedback for next cycle…</em>
              </div>
              <div className="re-footer">
                <span className="char-count">0 / 4000 characters</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: rating + meta panel */}
        <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          <SectionCard title="Overall rating" icon="star">
            <div className="col items-center" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="stars lg interactive" style={{ marginBottom: 12, gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} className={`ms ${n <= rating ? 'on' : ''}`}
                    onClick={() => setRating(n)} style={{ cursor: 'pointer' }}>star</span>
                ))}
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{rating}.0 / 5</div>
            </div>

            <div className="mt-4">
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Outcome</div>
              <div className="col gap-2">
                {[
                  { v: 'exceeds', label: 'Exceeds expectations', tone: 'eligible' },
                  { v: 'meets',   label: 'Meets expectations',   tone: 'on-track' },
                  { v: 'support', label: 'Needs support',         tone: 'needs-support' },
                ].map(o => (
                  <label key={o.v} className="re-outcome">
                    <input type="radio" name="outcome" checked={outcome === o.v} onChange={() => setOutcome(o.v)} />
                    <span className={`re-radio ${outcome === o.v ? 'on' : ''}`}>
                      {outcome === o.v && <span className="ms">check</span>}
                    </span>
                    <Pill variant={o.tone} dot>{o.label}</Pill>
                  </label>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Context for this review" icon="info">
            <div className="col gap-2" style={{ fontSize: 12.5 }}>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>flag</span>3 active OKRs · avg 78% progress</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>rocket_launch</span>4 projects completed this cycle</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>event</span>11 1:1s in the cycle</div>
              <div className="row items-center gap-2"><span className="ms" style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>forum</span>9 pieces of feedback received</div>
            </div>
            <Btn variant="text" size="sm" icon="open_in_new" style={{ marginTop: 10, padding: '4px 0' }}>Open full profile</Btn>
          </SectionCard>

          <Callout tone="info" icon="spellcheck">
            <strong>Review Assistant</strong> will scan your draft for vague language and bias before submission.
          </Callout>
        </div>
      </div>
    </>
  );
}

/* ---------- Review cycles panel (list on main reviews page) ---------- */
function ReviewCyclesPanel({ onOpenCycle, onStartCycle }) {
  const cycles = window.PerformanceStore.getReviewCycles();
  return (
    <SectionCard
      title="Review cycles"
      sub={cycles.length ? `${cycles.length} cycle${cycles.length === 1 ? '' : 's'} on record` : 'No cycles yet — start one to kick off reviews'}
      icon="event_repeat"
      action={<Btn variant="outlined" size="sm" icon="play_circle" onClick={onStartCycle}>Start review cycle</Btn>}
      padBody={false}
      style={{ marginBottom: 16 }}
    >
      {cycles.length === 0 && (
        <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
          No review cycles yet. Click <strong>Start review cycle</strong> above to launch your first one.
        </div>
      )}
      {cycles.map(c => {
        const participants = window.PerformanceStore.getReviewParticipants(c.id);
        const selfSubmitted = participants.filter(p => p.selfReviewStatus === 'submitted').length;
        const managerSubmitted = participants.filter(p => p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared').length;
        const shared = participants.filter(p => p.finalReviewStatus === 'shared' || p.finalReviewStatus === 'acknowledged').length;
        const participantLabel = c.participantType === 'employees' ? 'Employees'
          : c.participantType === 'contractors' ? 'Contractors' : 'Employees + Contractors';
        return (
          <div key={c.id} onClick={() => onOpenCycle(c.id)} style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) 130px 110px minmax(0, 1.2fr) 90px',
            gap: 16, alignItems: 'center',
            padding: '14px 22px', borderTop: '1px solid var(--grey-50)', cursor: 'pointer',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--grey-800)' }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                {c.periodStart} → {c.periodEnd} · purpose: {c.purpose || '—'}
              </div>
            </div>
            <Pill variant={c.status === 'active' ? 'active' : c.status === 'draft' ? 'draft' : 'completed'} dot>{c.status}</Pill>
            <Pill variant={c.participantType === 'contractors' ? 'contractor' : 'employee'} icon="groups" size="sm">{participantLabel}</Pill>
            <div className="row gap-3 items-center" style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 600 }}>
              <span title="Participants"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>group</span>{participants.length}</span>
              <span title="Self-reviews submitted"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>person</span>{selfSubmitted}/{participants.length}</span>
              <span title="Manager reviews submitted"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>badge</span>{managerSubmitted}/{participants.length}</span>
              <span title="Shared with worker"><span className="ms" style={{ fontSize: 14, marginRight: 2, verticalAlign: -2 }}>visibility</span>{shared}/{participants.length}</span>
            </div>
            <Btn variant="ghost" size="sm" iconTrailing="arrow_forward">Open</Btn>
          </div>
        );
      })}
    </SectionCard>
  );
}

/* ---------- Review cycle detail (participants table) ---------- */
function ReviewCycleDetail({ cycleId, onBack, onOpenManagerReview, onViewSelfReview }) {
  const [storeVersion, setStoreVersion] = useStateCR(0);
  const [compRevisionDone, setCompRevisionDone] = useStateCR({}); // participantId → true
  const [compToast, setCompToast] = useStateCR(null); // { name, label }
  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  function handleReviseComp(p, w) {
    const label = w?.workerType === 'contractor' ? 'Rate Revision' : 'Compensation Revision';
    setCompRevisionDone(prev => ({ ...prev, [p.id]: true }));
    setCompToast({ name: w?.name || 'Worker', label });
    setTimeout(() => setCompToast(null), 4000);
  };

  const cycle = window.PerformanceStore.getReviewCycleById(cycleId);
  if (!cycle) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to reviews</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>Cycle not found.</div>
      </div>
    );
  }
  const participants = window.PerformanceStore.getReviewParticipants(cycleId);
  const typeLabel = window.PerformanceStore.REVIEW_TYPE_OPTIONS.find(o => o.value === cycle.type)?.label || cycle.type;
  const participantLabel = cycle.participantType === 'employees' ? 'Employees'
    : cycle.participantType === 'contractors' ? 'Contractors' : 'Employees + Contractors';

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to reviews</Btn>
        <div className="row gap-2">
          <Pill variant={cycle.status === 'active' ? 'active' : 'draft'} dot>{cycle.status}</Pill>
          <Pill variant="employee" icon="groups">{participantLabel}</Pill>
        </div>
      </div>

      <PageHead
        eyebrow={`${typeLabel} · ${cycle.periodStart} → ${cycle.periodEnd}`}
        title={cycle.name}
        sub={`Self-review due ${cycle.selfReviewDueDate || '—'} · Manager review due ${cycle.managerReviewDueDate || '—'} · Final sharing ${cycle.finalSharingDate || '—'}`}
      />

      {compToast && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, #E8F7EF 0%, #F6FFF9 100%)',
          border: '1px solid var(--brand-green-200)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 16,
        }}>
          <span className="ms" style={{ fontSize: 22, color: 'var(--success-main)' }}>check_circle</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--success-dark)' }}>
              {compToast.label} initiated for {compToast.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>
              The revision has been recorded and is pending approval.
            </div>
          </div>
        </div>
      )}

      <SectionCard
        title="Participants"
        sub={`${participants.length} people in this cycle`}
        icon="checklist"
        padBody={false}
      >
        {participants.length === 0 && (
          <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>No participants yet.</div>
        )}
        {participants.length > 0 && (
          <table className="tbl">
            <thead><tr>
              <th>Worker</th>
              <th>Type</th>
              <th>Self-review</th>
              <th>Manager review</th>
              <th>Final review</th>
              <th />
            </tr></thead>
            <tbody>
              {participants.map(p => {
                const w = window.PerformanceStore.workerById(p.workerId);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="worker-cell">
                        <Avatar name={w?.name || ''} size="sm" />
                        <div>
                          <div className="name">{w?.name}</div>
                          <div className="role">{w?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Pill variant={w?.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w?.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                        {w?.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                      </Pill>
                    </td>
                    <td><StatusPill kind="self"    value={p.selfReviewStatus} /></td>
                    <td><StatusPill kind="manager" value={p.managerReviewStatus} /></td>
                    <td><StatusPill kind="final"   value={p.finalReviewStatus} /></td>
                    <td className="actions-cell">
                      {p.selfReviewStatus === 'submitted' && (
                        <Btn
                          variant="ghost"
                          size="sm"
                          icon="visibility"
                          onClick={() => onViewSelfReview && onViewSelfReview(p.id)}
                        >View self-review</Btn>
                      )}
                      <Btn
                        variant={p.selfReviewStatus === 'submitted' && p.managerReviewStatus === 'not-started' ? 'primary'
                          : p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'outlined'
                          : p.managerReviewStatus === 'draft' ? 'outlined'
                          : 'ghost'}
                        size="sm"
                        icon={p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'visibility' : 'edit'}
                        onClick={() => onOpenManagerReview(p.id)}
                      >
                        {p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared' ? 'View Review'
                          : p.managerReviewStatus === 'draft' ? 'Continue Manager Review'
                          : p.selfReviewStatus === 'submitted' ? 'Start Manager Review'
                          : 'Write Manager Review'}
                      </Btn>
                      {(p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared') && (
                        compRevisionDone[p.id]
                          ? <Btn variant="ghost" size="sm" icon="check_circle" style={{ color: 'var(--success-main)', cursor: 'default' }}>
                              {w?.workerType === 'contractor' ? 'Rate Revision Started' : 'Comp Revision Started'}
                            </Btn>
                          : <Btn variant="outlined" size="sm" icon="payments"
                              onClick={() => handleReviseComp(p, w)}>
                              {w?.workerType === 'contractor' ? 'Revise Rate' : 'Revise Compensation'}
                            </Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>
    </>
  );
}

function StatusPill({ kind, value }) {
  if (kind === 'self') {
    if (value === 'submitted') return <Pill variant="completed" dot>Self Review Submitted</Pill>;
    if (value === 'draft')     return <Pill variant="warning"   dot>Self Review · Draft</Pill>;
    return <Pill variant="draft">Self Review · Not started</Pill>;
  }
  if (kind === 'manager') {
    if (value === 'submitted') return <Pill variant="completed" dot>Manager Review Submitted</Pill>;
    if (value === 'shared')    return <Pill variant="completed" icon="visibility">Shared</Pill>;
    if (value === 'draft')     return <Pill variant="warning"   dot>Manager Review · Draft</Pill>;
    return <Pill variant="draft">Manager Review · Not started</Pill>;
  }
  if (kind === 'final') {
    if (value === 'shared')        return <Pill variant="completed" icon="visibility">Shared</Pill>;
    if (value === 'acknowledged')  return <Pill variant="eligible" icon="check">Acknowledged</Pill>;
    return <Pill variant="draft">Not shared</Pill>;
  }
  return null;
}

/* ---------- Read-only viewer for a worker's submitted self-review ---------- */
function ClientSelfReviewViewer({ participantId, onBack, onWriteManagerReview }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateCR(0);
  React.useEffect(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const self = participant ? Store.getSelfReview(participantId) : null;
  const submitted = self?.status === 'submitted';

  if (!participant || !cycle || !self) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>Self-review not found.</div>
      </div>
    );
  }

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div className="row gap-2">
          {submitted
            ? <Pill variant="completed" dot>Submitted{self.submittedAt ? ` · ${new Date(self.submittedAt).toLocaleDateString()}` : ''}</Pill>
            : <Pill variant="warning" dot>Draft · not yet submitted</Pill>}
          <Btn variant="primary" icon="edit" onClick={onWriteManagerReview}>Write manager review</Btn>
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Self-review`}
        title={`${worker?.name || 'Worker'}'s self-review`}
        sub={`${worker?.role || ''} · ${worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'} · period ${cycle.periodStart} → ${cycle.periodEnd}`}
      />

      {!submitted && (
        <Callout tone="warning" icon="schedule">
          This worker has saved a draft but hasn't submitted yet. You're viewing their in-progress answers.
        </Callout>
      )}

      <div className="col gap-3" style={{ marginTop: 16 }}>
        {self.answers.length === 0 && (
          <div className="card" style={{ padding: 18, fontSize: 13, color: 'var(--fg-secondary)' }}>
            No answers recorded yet.
          </div>
        )}
        {self.answers.map((a, i) => (
          <SectionCard key={i} title={`${i + 1} · ${a.question}`} icon="person">
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer provided.</em>}
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}

/* ── Review Compensation Config ─────────────────────────────────────────── */
const COMP_CONFIG_KEY = 'payo.compensationRules.v2';

const COMP_DEFAULTS = [
  { id: 1, minScore: 0, maxScore: 1,    revisionType: 'no_change',  revisionValue: 0,  currency: 'USD', label: 'No hike' },
  { id: 2, minScore: 1, maxScore: 2,    revisionType: 'percentage', revisionValue: 5,  currency: 'USD', label: '+5% hike' },
  { id: 3, minScore: 2, maxScore: 4,    revisionType: 'percentage', revisionValue: 10, currency: 'USD', label: '+10% hike' },
  { id: 4, minScore: 4, maxScore: null, revisionType: 'percentage', revisionValue: 15, currency: 'USD', label: '+15% hike' },
];

function loadCompConfig() {
  try { return JSON.parse(localStorage.getItem(COMP_CONFIG_KEY)) || COMP_DEFAULTS; }
  catch (e) { return COMP_DEFAULTS; }
}
function saveCompConfig(rows) {
  try { localStorage.setItem(COMP_CONFIG_KEY, JSON.stringify(rows)); } catch (e) {}
}

function validateRanges(rows) {
  const errors = {};
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.maxScore !== null && r.minScore >= r.maxScore) {
      errors[r.id] = 'Min must be less than max';
    }
    if ((r.revisionType === 'fixed_amount' || r.revisionType === 'percentage') && !r.revisionValue && r.revisionValue !== 0) {
      errors[r.id] = 'Value required';
    }
    // overlap check
    for (let j = 0; j < rows.length; j++) {
      if (i === j) continue;
      const s = rows[j];
      const aMax = r.maxScore === null ? Infinity : r.maxScore;
      const bMax = s.maxScore === null ? Infinity : s.maxScore;
      if (r.minScore < bMax && aMax > s.minScore) {
        errors[r.id] = errors[r.id] || 'Overlaps with another range';
      }
    }
  }
  const openEnded = rows.filter(r => r.maxScore === null);
  if (openEnded.length > 1) {
    openEnded.forEach(r => { errors[r.id] = 'Only one open-ended range allowed'; });
  }
  return errors;
}

function ReviewCompensationConfig() {
  const [rows, setRows] = useStateCR(loadCompConfig);
  const [editId, setEditId] = useStateCR(null);
  const [draft, setDraft] = useStateCR({});
  const [saved, setSaved] = useStateCR(false);
  const [errors, setErrors] = useStateCR({});

  const TYPE_LABELS = {
    no_change: 'No change',
    fixed_amount: 'Fixed amount',
    percentage: 'Percentage',
    manual_review: 'Manual review',
  };

  function startEdit(row) {
    setEditId(row.id);
    setDraft({ ...row });
    setErrors({});
  }

  function cancelEdit() {
    setEditId(null);
    setDraft({});
  }

  function commitEdit() {
    const updated = rows.map(r => r.id === editId ? { ...draft } : r);
    const errs = validateRanges(updated);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setRows(updated);
    setEditId(null);
    setDraft({});
    setErrors({});
  }

  function addRow() {
    const newRow = { id: Date.now(), minScore: 0, maxScore: 1, revisionType: 'percentage', revisionValue: 0, currency: 'USD', label: '' };
    setRows(prev => [...prev, newRow]);
    setEditId(newRow.id);
    setDraft({ ...newRow });
    setErrors({});
  }

  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
    if (editId === id) { setEditId(null); setDraft({}); }
    setErrors({});
  }

  function resetToDefault() {
    setRows(COMP_DEFAULTS);
    setEditId(null);
    setDraft({});
    setErrors({});
    setSaved(false);
  }

  function handleSave() {
    const errs = validateRanges(rows);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    saveCompConfig(rows);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inCell = (style) => ({
    border: '1.5px solid var(--grey-200)', borderRadius: 6,
    padding: '4px 8px', fontSize: 12.5, fontFamily: 'inherit',
    background: '#fff', ...style,
  });

  return (
    <div className="card" style={{ marginTop: 16 }}>
      {/* Header */}
      <div className="card-head">
        <div>
          <div className="title">
            <span className="ms">payments</span>
            Review Compensation Config
          </div>
          <div className="sub">Map review star ratings to a % hike on existing compensation. Percentage is applied to each worker's current base salary.</div>
        </div>
        <div className="row gap-2">
          <Btn variant="ghost" size="sm" icon="restart_alt" onClick={resetToDefault}>Reset</Btn>
          <Btn variant="ghost" size="sm" icon="add" onClick={addRow}>Add range</Btn>
          <Btn variant={saved ? 'ghost' : 'primary'} size="sm" icon={saved ? 'check' : 'save'} onClick={handleSave}>
            {saved ? 'Saved!' : 'Save config'}
          </Btn>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Star range</th>
              <th>Revision type</th>
              <th>% Hike / Amount</th>
              <th>Currency</th>
              <th>Label</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px 18px', color: 'var(--fg-secondary)', fontSize: 13 }}>
                  No ranges defined. Click <strong>Add range</strong> above.
                </td>
              </tr>
            )}
            {rows.map(row => {
              const isEditing = editId === row.id;
              const d = isEditing ? draft : row;
              const scoreLabel = d.maxScore === null ? `${d.minScore}+` : `${d.minScore} – ${d.maxScore}`;
              const rowError = errors[row.id];

              return (
                <React.Fragment key={row.id}>
                  <tr style={{ background: isEditing ? 'var(--grey-50)' : rowError ? '#FFF3F3' : 'transparent' }}>
                    {/* Star range */}
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="number" value={d.minScore} min={0} step={0.5}
                            style={inCell({ width: 52 })}
                            onChange={e => setDraft(p => ({ ...p, minScore: Number(e.target.value) }))} />
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>–</span>
                          <input type="number" value={d.maxScore ?? ''} min={0} step={0.5} placeholder="∞"
                            style={inCell({ width: 52 })}
                            onChange={e => setDraft(p => ({ ...p, maxScore: e.target.value === '' ? null : Number(e.target.value) }))} />
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>stars</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--grey-800)', fontVariantNumeric: 'tabular-nums' }}>
                          {scoreLabel} ★
                        </span>
                      )}
                    </td>

                    {/* Revision type */}
                    <td>
                      {isEditing ? (
                        <select value={d.revisionType}
                          style={inCell({})}
                          onChange={e => setDraft(p => ({ ...p, revisionType: e.target.value }))}>
                          <option value="no_change">No change</option>
                          <option value="fixed_amount">Fixed amount</option>
                          <option value="percentage">Percentage</option>
                          <option value="manual_review">Manual review</option>
                        </select>
                      ) : (
                        <Pill variant={d.revisionType === 'no_change' ? 'draft' : d.revisionType === 'manual_review' ? 'warning' : 'on-track'} size="sm">
                          {TYPE_LABELS[d.revisionType] || d.revisionType}
                        </Pill>
                      )}
                    </td>

                    {/* Amount */}
                    <td>
                      {isEditing ? (
                        <input type="number" value={d.revisionValue ?? ''}
                          disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review'}
                          style={inCell({ width: 80, opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review') ? 0.4 : 1 })}
                          onChange={e => setDraft(p => ({ ...p, revisionValue: e.target.value === '' ? null : Number(e.target.value) }))} />
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                          {d.revisionType === 'no_change' ? '—'
                            : d.revisionType === 'manual_review' ? 'Manual'
                            : d.revisionType === 'percentage'
                              ? <span style={{ fontWeight: 700, color: 'var(--success-dark, #1a8a50)' }}>+{d.revisionValue}%</span>
                            : `+${d.revisionValue}`}
                        </span>
                      )}
                    </td>

                    {/* Currency */}
                    <td>
                      {isEditing ? (
                        <select value={d.currency || 'USD'}
                          disabled={d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage'}
                          style={inCell({ opacity: (d.revisionType === 'no_change' || d.revisionType === 'manual_review' || d.revisionType === 'percentage') ? 0.4 : 1 })}
                          onChange={e => setDraft(p => ({ ...p, currency: e.target.value }))}>
                          {['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                          {d.revisionType === 'percentage' || d.revisionType === 'no_change' ? '—' : (d.currency || 'USD')}
                        </span>
                      )}
                    </td>

                    {/* Label */}
                    <td>
                      {isEditing ? (
                        <input type="text" value={d.label || ''} placeholder="e.g. +500 USD"
                          style={inCell({ width: 130 })}
                          onChange={e => setDraft(p => ({ ...p, label: e.target.value }))} />
                      ) : (
                        <span style={{ fontSize: 12.5, color: 'var(--grey-600)' }}>
                          {d.label || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="actions-cell">
                      {isEditing ? (
                        <>
                          <Btn variant="primary" size="sm" icon="check" onClick={commitEdit}>OK</Btn>
                          <Btn variant="ghost" size="sm" icon="close" onClick={cancelEdit} />
                        </>
                      ) : (
                        <>
                          <Btn variant="ghost" size="sm" icon="edit" onClick={() => startEdit(row)} />
                          <Btn variant="ghost" size="sm" icon="delete" onClick={() => removeRow(row.id)}
                            style={{ color: 'var(--error-main)' }} />
                        </>
                      )}
                    </td>
                  </tr>
                  {rowError && (
                    <tr style={{ background: '#FFF3F3' }}>
                      <td colSpan={6} style={{ padding: '4px 18px 8px', fontSize: 12, color: 'var(--error-main)', fontWeight: 600 }}>
                        ⚠ {rowError}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Example hike preview using dummy worker data */}
      {rows.some(r => r.revisionType === 'percentage' && r.revisionValue > 0) && (() => {
        const WORKER_COMP = [
          { name: 'Aditi Sharma', amount: 72000 },
          { name: 'Rahul Mehta',  amount: 85000 },
        ];
        const percentageRows = rows.filter(r => r.revisionType === 'percentage' && r.revisionValue > 0);
        return (
          <div style={{
            margin: '0 18px 16px',
            padding: '12px 16px',
            background: 'var(--grey-50)',
            borderRadius: 10,
            border: '1px solid var(--grey-100)',
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Example hike preview · based on current team compensation
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {WORKER_COMP.map(w =>
                percentageRows.map(r => {
                  const hikeAmount = Math.round(w.amount * r.revisionValue / 100);
                  return (
                    <div key={`${w.name}-${r.id}`} style={{
                      background: '#fff', border: '1px solid var(--grey-200)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 12.5,
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--grey-800)' }}>{w.name}</span>
                      <span style={{ color: 'var(--fg-secondary)', margin: '0 6px' }}>·</span>
                      <span style={{ color: 'var(--fg-secondary)' }}>{r.label || `+${r.revisionValue}%`}</span>
                      <span style={{ color: 'var(--fg-secondary)', margin: '0 6px' }}>→</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-dark, #1a8a50)' }}>
                        +USD {hikeAmount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

window.ReviewCompensationConfig = ReviewCompensationConfig;
window.ClientReviews = ClientReviews;
window.CompensationConfigPanel = CompensationConfigPanel;
