/* Frame · Client Reviews (manager view)
   List of direct reports → pick a worker → see their review history and
   click "Write a review" to open a rich review-writing page. */

const { useState: useStateCR } = React;

function ClientReviews() {
  const [view, setView] = useStateCR('list'); // 'list' | 'worker' | 'write'
  const [worker, setWorker] = useStateCR(null);

  const team = [
    {
      name: 'Aditi Sharma', role: 'Senior Ops',
      reviewsCount: 4, lastReview: 'Sep 28, 2026', lastRating: 4.5, lastOutcome: 'Exceeds',
      pendingFor: null,
    },
    {
      name: 'Omar Khan', role: 'Vendor Lead',
      reviewsCount: 3, lastReview: 'Sep 14, 2026', lastRating: 3.5, lastOutcome: 'Meets',
      pendingFor: 'Q3 Manager review',
    },
    {
      name: 'Lina Chen', role: 'Onboarding Mgr',
      reviewsCount: 3, lastReview: 'Aug 30, 2026', lastRating: 4.0, lastOutcome: 'Meets+',
      pendingFor: 'Q3 Manager review',
    },
    {
      name: 'Diego Alvarez', role: 'Senior Engineer',
      reviewsCount: 5, lastReview: 'Sep 12, 2026', lastRating: 4.5, lastOutcome: 'Exceeds',
      pendingFor: null,
    },
    {
      name: 'Karim Idris', role: 'Customer Success',
      reviewsCount: 2, lastReview: 'Aug 22, 2026', lastRating: 2.5, lastOutcome: 'Below',
      pendingFor: 'Q3 PIP check-in',
    },
    {
      name: 'Hannah Mueller', role: 'Compliance Sr.',
      reviewsCount: 4, lastReview: 'Sep 20, 2026', lastRating: 4.0, lastOutcome: 'Meets+',
      pendingFor: null,
    },
  ];

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
        <WorkerReviewHistory worker={worker} onBack={() => setView('list')} onWrite={() => setView('write')} />
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
        sub="Pick a worker to view their review history or write a new review. Active cycle: Q3 Performance Review · due Oct 15."
        actions={<>
          <Btn variant="ghost" icon="filter_list">Filters</Btn>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="outlined" icon="play_circle">Start review cycle</Btn>
        </>}
      />

      <div className="stats-row c-4 mb-4">
        <StatCard tone="blue"   icon="reviews"         label="Reviews to write"      value="3"  sub="Q3 cycle · due Oct 15" />
        <StatCard tone="green"  icon="task_alt"        label="Submitted this cycle"  value="5"  sub="of 8 direct reports" />
        <StatCard tone="purple" icon="inbox"           label="Received from team"    value="12" sub="Self + peer + 360°" />
        <StatCard tone="amber"  icon="pending_actions" label="Awaiting calibration"  value="2"  sub="Karim & Omar" />
      </div>

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
                  {t.pendingFor
                    ? <Pill variant="warning" icon="pending_actions">{t.pendingFor} pending</Pill>
                    : <Pill variant="completed" dot>Up to date</Pill>}
                </td>
                <td className="actions-cell">
                  <Btn variant="ghost" size="sm" icon="history" onClick={() => { setWorker(t); setView('worker'); }}>History</Btn>
                  <Btn variant={t.pendingFor ? 'primary' : 'outlined'} size="sm" icon="edit"
                    onClick={() => { setWorker(t); setView('write'); }}>Write a review</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </Shell>
  );
}

/* ---------- Worker review history (manager view) ---------- */
function WorkerReviewHistory({ worker, onBack, onWrite }) {
  const history = [
    { id: 'h1', when: 'Sep 28, 2026', cycle: 'Q3 Performance Review',  type: 'Manager', author: 'You',           rating: 4.5, outcome: 'Exceeds',
      summary: 'Strong Q3. Led the Spain cutover with zero P0s, mentored Lina through her first migration.' },
    { id: 'h2', when: 'Sep 22, 2026', cycle: 'Q3 Skip-level',          type: 'Manager', author: 'Hannah Mueller', rating: 4.0, outcome: 'Meets+',
      summary: 'Career-track conversation. Aligned on Lead Ops growth path.' },
    { id: 'h3', when: 'Aug 14, 2026', cycle: 'Italy migration retro',  type: 'Project', author: 'You',           rating: 4.0, outcome: 'Meets+',
      summary: 'Solid execution on the Italy cutover. Surfaced runbook gaps proactively.' },
    { id: 'h4', when: 'Jun 27, 2026', cycle: 'H1 Performance Review',  type: 'Manager', author: 'You',           rating: 4.0, outcome: 'Meets+',
      summary: 'Productive H1. Carried the payroll migration narrative end-to-end.' },
  ];

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
        <StatCard tone="blue"  icon="star"      label="Average rating · 12mo" value={worker.lastRating.toFixed(1)} sub={`Last cycle: ${worker.lastOutcome}`} />
        <StatCard tone="green" icon="trending_up" label="Trend"               value="↑ 0.5" sub="vs. previous 2 cycles" />
        <StatCard tone="purple"icon="task_alt"  label="Reviews written by you" value="3" sub={`Across ${history.filter(h => h.author === 'You').length} cycles`} />
      </div>

      <SectionCard
        title="All reviews"
        sub="Across cycles and types"
        icon="history"
        padBody={false}
      >
        {history.map((h, i) => (
          <div key={h.id} style={{ padding: '16px 20px', borderBottom: i < history.length - 1 ? '1px solid var(--grey-50)' : 'none',
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
              <Pill variant={h.outcome === 'Exceeds' ? 'eligible' : 'on-track'}>{h.outcome}</Pill>
            </div>
            <Btn variant="ghost" size="sm" icon="open_in_new">Open</Btn>
          </div>
        ))}
      </SectionCard>
    </>
  );
}

/* ---------- Review editor (Write a review page) ---------- */
function ReviewEditor({ worker, onBack }) {
  const [rating, setRating] = useStateCR(4);
  const [outcome, setOutcome] = useStateCR('exceeds');

  return (
    <>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to {worker.name}'s history</Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule">Save draft</Btn>
          <Btn variant="primary" icon="send">Submit review</Btn>
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
              <div className="re-body" contentEditable suppressContentEditableWarning>
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
          <SectionCard title="2 · Goal & key-result assessment" sub="Pulled in from People OKRs — adjust outcomes per KR" icon="flag">
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

window.ClientReviews = ClientReviews;
