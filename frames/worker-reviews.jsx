/* Frame · Worker Reviews
   Date-wise tiles: each tile shows the reviewer (who gave the review), when,
   review type (manager / peer / client / project / self), summary, rating,
   and links to read the full review. */

const { useState: useStateWR, useEffect: useEffectWR } = React;

function WorkerReviews() {
  const Store = window.PerformanceStore;
  const [active, setActive] = useStateWR(null);
  const [selfReviewParticipantId, setSelfReviewParticipantId] = useStateWR(null);
  const [managerReviewParticipantId, setManagerReviewParticipantId] = useStateWR(null);
  const [, setVersion] = useStateWR(0);

  useEffectWR(() => {
    const pid = window.sessionStorage.getItem('payo.workerReviews.openSelf');
    if (pid) {
      window.sessionStorage.removeItem('payo.workerReviews.openSelf');
      setSelfReviewParticipantId(pid);
    }
    return Store.subscribe(() => setVersion(v => v + 1));
  }, []);

  // Live: active review cycles this worker is a participant in
  const workerId = Store.getCurrentWorkerId();
  const allParticipants = Store.getData().reviewParticipants || [];
  const myParticipations = allParticipants.filter(p => p.workerId === workerId);
  const allCycles = Store.getReviewCycles ? Store.getReviewCycles() : [];
  const activeCycleParticipations = myParticipations.map(p => {
    const cycle = allCycles.find(c => c.id === p.reviewCycleId);
    return cycle ? { participant: p, cycle } : null;
  }).filter(Boolean).filter(({ cycle }) => cycle.status !== 'closed' && cycle.status !== 'draft');

  function openSelfReview(participantId) {
    setSelfReviewParticipantId(participantId);
  }

  if (selfReviewParticipantId) {
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'Self-review']}>
        <PerfTabs variant="worker" active="reviews" />
        <WorkerSelfReview
          participantId={selfReviewParticipantId}
          onBack={() => setSelfReviewParticipantId(null)}
        />
      </Shell>
    );
  }

  if (managerReviewParticipantId) {
    const mr = Store.getManagerReview(managerReviewParticipantId);
    const mrParticipant = (Store.getData().reviewParticipants || []).find(p => p.id === managerReviewParticipantId);
    const mrCycle = mrParticipant ? allCycles.find(c => c.id === mrParticipant.reviewCycleId) : null;
    return (
      <Shell persona="worker" active="performance"
        crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'Manager review']}>
        <PerfTabs variant="worker" active="reviews" />
        <div className="row items-center mb-4 gap-2">
          <Btn variant="ghost" icon="arrow_back" onClick={() => setManagerReviewParticipantId(null)}>Back to reviews</Btn>
        </div>
        <PageHead
          eyebrow={mrCycle ? `${mrCycle.name} · Manager review` : 'Manager review'}
          title="Your manager's review"
          sub={mrCycle ? `Period ${mrCycle.periodStart} → ${mrCycle.periodEnd}` : ''}
          actions={<Btn variant="ghost" icon="download">Export PDF</Btn>}
        />
        {!mr ? (
          <div className="card" style={{ padding: 24 }}>
            <Callout tone="info" icon="info">
              Your manager's review has been shared but is not available in this session yet. Try refreshing the page.
            </Callout>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
            <div className="col gap-4">
              {(mr.answers || []).length > 0 && (
                <SectionCard title="Review answers" icon="rate_review">
                  <div className="col gap-3">
                    {mr.answers.map((a, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'var(--grey-50)', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{i + 1}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginTop: 2 }}>{a.question}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer provided.</em>}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
              {(mr.strengths || mr.improvementAreas || mr.nextCycleFocus || mr.finalSummary) && (
                <SectionCard title="Summary" icon="summarize">
                  <div className="col gap-3">
                    {mr.strengths && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Key strengths</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.strengths}</div>
                      </div>
                    )}
                    {mr.improvementAreas && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Development areas</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.improvementAreas}</div>
                      </div>
                    )}
                    {mr.nextCycleFocus && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Next cycle focus</div>
                        <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{mr.nextCycleFocus}</div>
                      </div>
                    )}
                    {mr.finalSummary && (
                      <div style={{ background: 'var(--grey-50)', borderLeft: '3px solid var(--brand-blue-500)', borderRadius: 8, padding: '14px 18px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Final summary</div>
                        <div style={{ fontSize: 13.5, color: 'var(--grey-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{mr.finalSummary}</div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
            <div className="col gap-3">
              {mr.rating && (
                <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Overall rating</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--grey-800)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{mr.rating}</div>
                </div>
              )}
              <Callout tone="info" icon="lock">
                Private manager notes are not included in this view.
              </Callout>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  // Reviews grouped by month
  const groups = [
    {
      month: 'September 2026', label: 'Q3 cycle',
      reviews: [
        {
          id: 'r1',
          when: 'Sep 28, 2026',
          author: 'Priya Nair',  authorRole: 'Manager',
          type: 'manager', cycle: 'Q3 Performance Review',
          rating: 4.5, ratingLabel: 'Exceeds expectations',
          summary: 'Strong Q3. Led the Spain cutover with zero P0s, mentored Lina through her first migration, and built the runbook the rest of the team is now using.',
          excerpt: 'Aditi continues to operate above her role. Her work on the Spain migration set a new bar for cutover quality — the renewal that followed (3-year, $1.4M ACV) is directly attributable. She\'s ready to formalize the Lead Ops path; recommend promotion case for Q4.',
          krs: ['6 migrations · 6/6 done', '0 P0s through cutover', 'CSAT 4.4 / 4.5 target'],
        },
        {
          id: 'r2',
          when: 'Sep 22, 2026',
          author: 'Hannah Mueller', authorRole: 'Skip-level',
          type: 'manager', cycle: 'Q3 Skip-level check-in',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Career-track conversation. Aligned on Lead Ops growth path. Aditi is ready, we need to firm up scope and timeline.',
          excerpt: 'Aditi has the technical depth and operational instincts for Lead Ops. The growth area is comfort with ambiguity at the program level — fewer prescriptive playbooks, more leading through influence.',
        },
        {
          id: 'r3',
          when: 'Sep 20, 2026',
          author: 'Lina Chen', authorRole: 'Peer',
          type: 'peer', cycle: 'Q3 360°',
          rating: 5.0, ratingLabel: 'Outstanding',
          summary: 'Pairing on the migration runbook saved me a month. Aditi explains complex workflows in a way that sticks.',
          excerpt: 'When we paired on the rollback flows, Aditi pre-built the diagrams so the doc clicked on the first read. I now use her template for every new client onboarding.',
        },
        {
          id: 'r4',
          when: 'Sep 18, 2026',
          author: 'Marco Diaz', authorRole: 'Client',
          type: 'client', cycle: 'Project completion',
          rating: 5.0, ratingLabel: 'Outstanding',
          summary: 'Communication during cutover was the difference between a hard week and a smooth one.',
          excerpt: '"Aditi kept us informed every step. We never felt out of the loop, and her playbook for the cutover day was the most organized thing I\'ve seen in 12 years of payroll migrations."',
        },
      ],
    },
    {
      month: 'August 2026', label: 'Project reviews',
      reviews: [
        {
          id: 'r5',
          when: 'Aug 14, 2026',
          author: 'Priya Nair', authorRole: 'Manager',
          type: 'project', cycle: 'Italy migration retro',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Solid execution on the Italy cutover. Surfaced runbook gaps proactively — exactly what we needed before Spain.',
          excerpt: 'Aditi flagged 7 doc gaps in the runbook that would have hit us hard in Spain. Owning the fix herself.',
        },
        {
          id: 'r6',
          when: 'Aug 02, 2026',
          author: 'Aditi Sharma', authorRole: 'Self',
          type: 'self', cycle: 'Mid-cycle self-review',
          rating: 3.5, ratingLabel: 'On track',
          summary: 'Migration KR ahead of pace. Mentorship KR slightly behind — need to formalize cadence with Lina.',
          excerpt: 'Strongest stretch I\'ve had in 2 years. Areas to grow: more comfort with stakeholder pushback at the steerco level.',
        },
      ],
    },
    {
      month: 'June 2026', label: 'H1 wrap',
      reviews: [
        {
          id: 'r7',
          when: 'Jun 27, 2026',
          author: 'Priya Nair', authorRole: 'Manager',
          type: 'manager', cycle: 'H1 Performance Review',
          rating: 4.0, ratingLabel: 'Meets+ expectations',
          summary: 'Productive H1. Carried the payroll migration narrative end-to-end.',
          excerpt: 'Aditi grew into the senior IC role in H1. Key area for H2: lead at least one program, not just contribute.',
        },
      ],
    },
  ];

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
        title="Feedback &amp; Reviews"
        sub="Active review cycles and all reviews you've received, organized by month."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
        </>}
      />

      <div className="stats-row c-3 mb-4">
        <StatCard tone="green"  icon="task_alt"    label="Total reviews"   value="12" sub="Across all cycles" />
        <StatCard tone="blue"   icon="star"        label="Average rating"  value="4.3" sub="Last 4 cycles · trending up" />
        <StatCard tone="purple" icon="celebration" label="Outstanding"     value="3"  sub="reviews this year" />
      </div>

      {/* Active review cycles */}
      {activeCycleParticipations.length > 0 && (
        <div className="mb-4">
          <SectionCard title="Active review cycles" sub="Cycles you're participating in" icon="rate_review">
            {activeCycleParticipations.map(({ participant: p, cycle }) => {
              const selfDone = p.selfReviewStatus === 'submitted';
              const managerDone = p.managerReviewStatus === 'submitted' || p.managerReviewStatus === 'shared';
              const selfDue = cycle.selfReviewDueDate;
              const selfDuePast = selfDue && new Date(selfDue) < new Date();
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderTop: '1px solid var(--grey-50)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-800)' }}>{cycle.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                      {cycle.periodStart} → {cycle.periodEnd}
                      {selfDue && <span style={{ marginLeft: 8 }}>· Self-review due <strong style={{ color: selfDuePast && !selfDone ? 'var(--error-dark)' : 'var(--grey-700)' }}>{selfDue}</strong></span>}
                    </div>
                  </div>
                  <div className="row items-center gap-3">
                    <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Self-review</span>
                      {selfDone
                        ? <Pill variant="completed" dot>Submitted</Pill>
                        : <Pill variant={selfDuePast ? 'overdue' : 'warning'} dot>{selfDuePast ? 'Overdue' : 'Pending'}</Pill>}
                    </div>
                    <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager review</span>
                      {managerDone
                        ? <Pill variant="completed" dot>Complete</Pill>
                        : <Pill variant="draft">Pending</Pill>}
                    </div>
                  </div>
                  {!selfDone && (
                    <Btn variant="primary" size="sm" icon="edit_note" onClick={() => openSelfReview(p.id)}>
                      Fill in self-review
                    </Btn>
                  )}
                  {selfDone && (
                    <Btn variant="ghost" size="sm" icon="visibility" onClick={() => openSelfReview(p.id)}>
                      View self-review
                    </Btn>
                  )}
                  {p.managerReviewStatus === 'shared' && (
                    <Btn variant="ghost" size="sm" icon="badge" onClick={() => setManagerReviewParticipantId(p.id)}>
                      View manager review
                    </Btn>
                  )}
                </div>
              );
            })}
          </SectionCard>
        </div>
      )}

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

window.WorkerReviews = WorkerReviews;
