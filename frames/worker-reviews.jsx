/* Frame · Worker Reviews
   Date-wise tiles: each tile shows the reviewer (who gave the review), when,
   review type (manager / peer / client / project / self), summary, rating,
   and links to read the full review. */

const { useState: useStateWR } = React;

function WorkerReviews() {
  const [active, setActive] = useStateWR(null);
  // cycleView: null | { kind: 'self-review' | 'shared', participantId }
  const [cycleView, setCycleView] = useStateWR(null);
  const [storeVersion, setStoreVersion] = useStateWR(0);

  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  // Deep-links from the All-cycles page set these session keys.
  React.useEffect(() => {
    try {
      const sShared = window.sessionStorage.getItem('payo.workerReviews.openShared');
      if (sShared) { window.sessionStorage.removeItem('payo.workerReviews.openShared'); setCycleView({ kind: 'shared', participantId: sShared }); return; }
      const sSelf = window.sessionStorage.getItem('payo.workerReviews.openSelf');
      if (sSelf)   { window.sessionStorage.removeItem('payo.workerReviews.openSelf');   setCycleView({ kind: 'view-self', participantId: sSelf });   return; }
    } catch (e) {}
  }, []);

  const currentWorkerId = window.PerformanceStore.getCurrentWorkerId();
  const currentWorker = window.PerformanceStore.workerById(currentWorkerId);

  // -- Drill-in: self-review form (edit or read-only post-submit)
  if (cycleView?.kind === 'self-review' || cycleView?.kind === 'view-self') {
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Reviews', 'Self-review']}>
        <WorkerSelfReview participantId={cycleView.participantId} onBack={() => setCycleView(null)} />
      </Shell>
    );
  }

  // -- Drill-in: view shared final review
  if (cycleView?.kind === 'shared') {
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Reviews', 'Shared review']}>
        <SharedReviewView participantId={cycleView.participantId} onBack={() => setCycleView(null)} />
      </Shell>
    );
  }

  const sharedStoreReviews = window.PerformanceStore.getReviewsForWorker(currentWorkerId)
    .map(r => ({
      id: r.id,
      when: r.createdAt,
      author: 'Priya Nair',
      authorRole: 'Manager',
      type: 'manager',
      cycle: r.title,
      rating: Number(r.rating) || 0,
      ratingLabel: Number(r.rating) >= 4.5 ? 'Exceeds expectations' : 'Manager rating',
      summary: r.comments,
      excerpt: r.comments,
      krs: [],
    }));

  // Reviews grouped by month — only the ones actually shared with this worker.
  const groups = sharedStoreReviews.length ? [{
    month: 'Shared by manager',
    label: 'Visible reviews only',
    reviews: sharedStoreReviews,
  }] : [];

  const typeMeta = {
    manager:   { icon: 'badge',          tone: 'employee',   label: 'Manager review' },
    peer:      { icon: 'group',          tone: 'contrib',    label: 'Peer review' },
    client:    { icon: 'apartment',      tone: 'contractor', label: 'Client review' },
    project:   { icon: 'rocket_launch',  tone: 'eligible',   label: 'Project review' },
    self:      { icon: 'person',         tone: 'warning',    label: 'Self-review' },
  };

  // Drill-in: full review read view
  if (active) {
    const meta = typeMeta[active.type];
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Reviews', active.cycle]}>

        <div className="row items-center mb-4 gap-2">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setActive(null)}>Back to reviews</Btn>
        </div>

        <PageHead
          eyebrow={meta.label}
          title={active.cycle}
          sub={`${active.when} · from ${active.author}`}
          actions={<>
            <Btn variant="ghost" icon="download">Export PDF</Btn>
            <Btn variant="ghost" icon="rate_review">Attach to my self-review</Btn>
          </>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
          {/* Left: full review text */}
          <SectionCard
            title="Review"
            sub={`Written by ${active.author} · ${active.authorRole}`}
            icon="rate_review"
          >
            <div className="row items-center gap-3 mb-3">
              <Avatar name={active.author} size="lg" />
              <div className="flex-1">
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-700)' }}>{active.author}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{active.authorRole} · submitted {active.when}</div>
              </div>
              <Pill variant={meta.tone} icon={meta.icon} size="lg">{meta.label}</Pill>
            </div>

            <div style={{ background: 'var(--grey-50)', borderLeft: '3px solid var(--brand-blue-500)',
              borderRadius: 8, padding: '16px 20px', fontSize: 14, color: 'var(--grey-700)', lineHeight: 1.65 }}>
              {active.excerpt}
            </div>

            {active.krs && (
              <div className="mt-4">
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cited key results</div>
                <div className="col gap-2">
                  {active.krs.map((kr, i) => (
                    <div key={i} className="row items-center gap-2" style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                      <span className="ms" style={{ fontSize: 16, color: 'var(--success-main)' }}>check_circle</span>{kr}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Right: rating */}
          <div className="col gap-3">
            <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Rating</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--success-dark)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {active.rating.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--fg-secondary)', fontWeight: 600 }}> / 5</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-700)', marginTop: 8 }}>{active.ratingLabel}</div>
              <Stars value={Math.round(active.rating)} />
            </div>
            <SectionCard title="Reviewer" icon="person">
              <div className="row items-center gap-3 mb-2">
                <Avatar name={active.author} size="md" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)' }}>{active.author}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{active.authorRole}</div>
                </div>
              </div>
              <Btn variant="ghost" size="sm" icon="forum" style={{ width: '100%', justifyContent: 'center' }}>Send a thank-you</Btn>
            </SectionCard>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'Reviews']}>

      <PerfTabs variant="worker" active="my-reviews" />

      <PageHead
        eyebrow="My performance"
        title={`Feedback & Reviews · viewing as ${currentWorker?.name || 'Worker'}`}
        sub="All the feedback and reviews you've received, organized by month. Click any tile to read the full text and rating."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
        </>}
      />

      <MyReviewCyclesPanel
        currentWorkerId={currentWorkerId}
        onStartSelfReview={(participantId) => setCycleView({ kind: 'self-review', participantId })}
        onViewSelfReview={(participantId) => setCycleView({ kind: 'view-self', participantId })}
        onViewShared={(participantId) => setCycleView({ kind: 'shared', participantId })}
      />

      {(() => {
        const allShared = window.PerformanceStore.getReviewsForWorker(currentWorkerId);
        const ratings = allShared.map(r => Number(r.rating)).filter(n => !isNaN(n) && n > 0);
        const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
        const outstanding = allShared.filter(r => String(r.rating || '').toLowerCase().includes('exceed')).length;
        const myCycles = window.PerformanceStore.getReviewCyclesForWorker(currentWorkerId);
        const nextCycle = myCycles.filter(c => c.status === 'active').sort((a,b) => String(a.selfReviewDueDate||a.periodEnd||'').localeCompare(String(b.selfReviewDueDate||b.periodEnd||'')))[0];
        return (
          <div className="stats-row c-4 mb-4">
            <StatCard tone="green"  icon="task_alt"    label="Total reviews"  value={String(allShared.length)} sub={allShared.length ? 'Shared with you' : 'No reviews yet'} />
            <StatCard tone="blue"   icon="star"        label="Average rating" value={String(avg)}              sub={ratings.length ? `Across ${ratings.length} review${ratings.length === 1 ? '' : 's'}` : 'No ratings yet'} />
            <StatCard tone="purple" icon="celebration" label="Outstanding"    value={String(outstanding)}       sub={outstanding ? '"Exceeds expectations" reviews' : 'None yet'} />
            <StatCard tone="amber"  icon="event"       label="Next review"    value={nextCycle ? (nextCycle.selfReviewDueDate || 'Soon') : '—'} sub={nextCycle ? nextCycle.name : 'No active cycle'} />
          </div>
        );
      })()}

      <div className="row gap-2 mb-4 items-center" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Type:</span>
        <button className="filter" style={{ background: '#fff', borderColor: 'var(--brand-blue-300)', color: 'var(--brand-blue-600)' }}>All</button>
        <button className="filter">Manager</button>
        <button className="filter">Peer</button>
        <button className="filter">Client</button>
        <button className="filter">Project</button>
        <button className="filter">Self</button>
      </div>

      {/* Date-wise tiles */}
      {groups.map(g => (
        <div key={g.month} className="mb-4">
          <div className="day-row" style={{ marginTop: 0 }}>
            <span className="label">{g.month}</span>
            <span className="date">{g.label}</span>
            <span className="count">{g.reviews.length} review{g.reviews.length > 1 ? 's' : ''}</span>
            <span className="line" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {g.reviews.map(r => {
              const meta = typeMeta[r.type];
              return (
                <button key={r.id} className="review-tile" onClick={() => setActive(r)}>
                  <div className="row items-start between mb-3">
                    <div className="row items-center gap-3">
                      <Avatar name={r.author} size="md" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>{r.author}</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 1 }}>{r.authorRole}</div>
                      </div>
                    </div>
                    <Pill variant={meta.tone} icon={meta.icon}>{meta.label}</Pill>
                  </div>
                  <div className="row items-center between mb-2">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)' }}>{r.cycle} · {r.when}</span>
                    <Stars value={Math.round(r.rating)} size="sm" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: 12 }}>
                    {r.summary}
                  </div>
                  <div className="row items-center between" style={{ paddingTop: 10, borderTop: '1px solid var(--grey-100)' }}>
                    <div className="row items-center gap-2">
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--success-dark)', fontVariantNumeric: 'tabular-nums' }}>{r.rating.toFixed(1)} / 5</span>
                      <Pill variant={r.rating >= 4.5 ? 'eligible' : r.rating >= 3.5 ? 'on-track' : 'warning'}>{r.ratingLabel}</Pill>
                    </div>
                    <span className="link-cell" style={{ fontSize: 12 }}>Read full review<span className="ms">arrow_forward</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Shell>
  );
}

/* ---------- My review cycles panel ---------- */
function MyReviewCyclesPanel({ currentWorkerId, onStartSelfReview, onViewShared, onViewSelfReview }) {
  const MAX = 2;
  const cyclesAll = window.PerformanceStore.getReviewCyclesForWorker(currentWorkerId);
  // Most recent first (by periodEnd then by createdAt fallback)
  cyclesAll.sort((a, b) => String(b.periodEnd || b.createdAt || '').localeCompare(String(a.periodEnd || a.createdAt || '')));
  const cycles = cyclesAll.slice(0, MAX);
  const hidden = cyclesAll.length - cycles.length;

  if (cyclesAll.length === 0) {
    return (
      <SectionCard
        title="My review cycles"
        sub="No active review cycles right now."
        icon="event_repeat"
        style={{ marginBottom: 16 }}
      >
        <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
          When your manager launches a cycle that includes you, it will appear here with a Start self-review action.
        </div>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="My review cycles"
      sub={`Showing the ${cycles.length} most recent · ${cyclesAll.length} total`}
      icon="event_repeat"
      padBody={false}
      style={{ marginBottom: 16 }}
      action={
        cyclesAll.length > MAX
          ? <Btn variant="ghost" size="sm" iconTrailing="arrow_forward" onClick={() => window.location.hash = '/worker/reviews/all'}>View all ({cyclesAll.length})</Btn>
          : null
      }
    >
      {cycles.map(c => {
        const p = window.PerformanceStore.getReviewParticipantForWorker(c.id, currentWorkerId);
        const sr = p ? window.PerformanceStore.getSelfReview(p.id) : null;
        const selfStatus = sr?.status || p?.selfReviewStatus || 'not-started';
        const finalShared = p?.finalReviewStatus === 'shared' || p?.finalReviewStatus === 'acknowledged';
        const acknowledged = p?.finalReviewStatus === 'acknowledged';
        return (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 130px 140px 240px',
            gap: 16, alignItems: 'center',
            padding: '14px 22px', borderTop: '1px solid var(--grey-50)',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)' }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>{c.periodStart} → {c.periodEnd} · self-review due {c.selfReviewDueDate || '—'}</div>
            </div>
            <Pill variant={c.status === 'active' ? 'active' : 'draft'} dot>{c.status}</Pill>
            <div className="col gap-1">
              <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Self-review</span>
              {selfStatus === 'submitted'   && <Pill variant="completed" dot>Submitted</Pill>}
              {selfStatus === 'draft'       && <Pill variant="warning"   dot>Draft</Pill>}
              {selfStatus === 'not-started' && <Pill variant="draft">Not started</Pill>}
            </div>
            <div className="row gap-2" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {!finalShared && selfStatus !== 'submitted' && p && (
                <Btn variant="primary" size="sm" icon={selfStatus === 'draft' ? 'edit' : 'play_arrow'} onClick={() => onStartSelfReview(p.id)}>
                  {selfStatus === 'draft' ? 'Continue self-review' : 'Start self-review'}
                </Btn>
              )}
              {selfStatus === 'submitted' && p && (
                <Btn variant="ghost" size="sm" icon="visibility" onClick={() => onViewSelfReview(p.id)}>View my self-review</Btn>
              )}
              {finalShared && p && (
                <Btn variant={acknowledged ? 'ghost' : 'primary'} size="sm" icon={acknowledged ? 'check' : 'visibility'} onClick={() => onViewShared(p.id)}>
                  {acknowledged ? 'View shared review' : 'View & acknowledge'}
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}

/* ---------- Shared final review view (worker side) ---------- */
function SharedReviewView({ participantId, onBack }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateWR(0);
  React.useEffect(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const mr = participant ? Store.getManagerReview(participantId) : null;
  const visible = mr?.visibleToWorker || mr?.status === 'shared';
  const [ackComment, setAckComment] = useStateWR(participant?.acknowledgementComment || '');
  const acknowledged = participant?.finalReviewStatus === 'acknowledged';

  if (!participant || !cycle || !mr || !visible) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>
          This review hasn't been shared with you yet.
        </div>
      </div>
    );
  }

  function ackAndBack() {
    Store.acknowledgeReview(participantId, ackComment);
    onBack && onBack();
  }

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to my reviews</Btn>
        {acknowledged
          ? <Pill variant="eligible" icon="check">Acknowledged</Pill>
          : <Btn variant="primary" icon="check" onClick={ackAndBack}>Acknowledge review</Btn>}
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Shared by your manager`}
        title="Your final review"
        sub={`Period ${cycle.periodStart} → ${cycle.periodEnd} · for ${worker?.name}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="col gap-4">
          <SectionCard title="Final performance summary" icon="summarize">
            <div style={{ fontSize: 13.5, color: 'var(--grey-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {mr.finalSummary || <em style={{ color: 'var(--fg-disabled)' }}>No final summary provided.</em>}
            </div>
          </SectionCard>
          <SectionCard title="Key strengths" icon="star">
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {mr.strengths || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}
            </div>
          </SectionCard>
          <SectionCard title="Development areas" icon="trending_up">
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {mr.improvementAreas || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}
            </div>
          </SectionCard>
          <SectionCard title="Next cycle focus" icon="flag">
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {mr.nextCycleFocus || <em style={{ color: 'var(--fg-disabled)' }}>—</em>}
            </div>
          </SectionCard>

          {!acknowledged && (
            <SectionCard title="Your acknowledgement" sub="Optional comment to your manager" icon="check_circle">
              <textarea className="rc-input" rows={4} value={ackComment} onChange={e => setAckComment(e.target.value)}
                placeholder="Thanks for the feedback. Aligned on the next cycle focus." />
              <div className="row gap-2" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
                <Btn variant="primary" icon="check" onClick={ackAndBack}>Acknowledge review</Btn>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          {cycle.showRatingToWorker && mr.rating && (
            <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Overall rating</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success-dark)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{mr.rating}</div>
            </div>
          )}
          <Callout tone="info" icon="lock">
            <strong>Manager private notes are not visible to you.</strong> What you see here is the final shared review only.
          </Callout>
        </div>
      </div>
    </>
  );
}

window.WorkerReviews = WorkerReviews;
