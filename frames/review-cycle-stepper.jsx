/* Review Cycle Stepper — 5-step flow for creating/launching a review cycle.
   Persists to PerformanceStore. Used inside ClientReviews. */

const { useState: useStateRC, useMemo: useMemoRC } = React;

const RC_STEPS = [
  { id: 'details',    label: 'Review details' },
  { id: 'people',     label: 'Select people' },
  { id: 'questions',  label: 'Questions & inputs' },
  { id: 'rating',     label: 'Rating & deadlines' },
  { id: 'review',     label: 'Review & launch' },
];

const PARTICIPANT_TYPE_OPTIONS = [
  { value: 'employees',                 label: 'Employees',                icon: 'badge',     desc: 'Run this cycle for full-time employees only.' },
  { value: 'contractors',               label: 'Contractors',              icon: 'engineering', desc: 'Run this cycle for contractors only — same engine, contractor badge.' },
  { value: 'employees_and_contractors', label: 'Employees and contractors', icon: 'groups',    desc: 'Mixed cycle — both populations get the same self/manager flow.' },
];

function ReviewCycleStepper({ initial = {}, onCancel, onSaved, onLaunched }) {
  const Store = window.PerformanceStore;
  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const inFortyFiveDays = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [stepIdx, setStepIdx] = useStateRC(0);
  const [cycle, setCycle] = useStateRC(() => ({
    id: initial.id || null,
    name: initial.name || 'Q3 2026 Performance Review',
    type: initial.type || 'quarterly',
    periodStart: initial.periodStart || '2026-07-01',
    periodEnd: initial.periodEnd || '2026-09-30',
    purpose: initial.purpose || '',
    participantType: initial.participantType || 'employees',
    workerIds: initial.workerIds || [],
    reviewerMode: initial.reviewerMode || 'direct-manager',
    reviewerIds: initial.reviewerIds || [Store.MANAGER_ID],
    includeWorkersWithNoGoals: initial.includeWorkersWithNoGoals ?? true,
    includeGoals: initial.includeGoals !== false,
    includeOKRs: initial.includeOKRs !== false,
    includeWorkerCreatedGoals: initial.includeWorkerCreatedGoals !== false,
    includeProgressUpdates: initial.includeProgressUpdates !== false,
    includeMeetings: initial.includeMeetings !== false,
    includeSharedNotes: initial.includeSharedNotes !== false,
    includeFeedback: initial.includeFeedback !== false,
    includeRating: initial.includeRating !== false,
    ratingScale: initial.ratingScale || 'simple-4',
    ratingOptions: initial.ratingOptions || Store.DEFAULT_RATING_OPTIONS,
    showRatingToWorker: initial.showRatingToWorker !== false,
    showManagerFinalCommentsToWorker: initial.showManagerFinalCommentsToWorker !== false,
    showManagerPrivateNotesToWorker: false,
    selfReviewDueDate: initial.selfReviewDueDate || inThirtyDays,
    managerReviewDueDate: initial.managerReviewDueDate || inFortyFiveDays,
    finalSharingDate: initial.finalSharingDate || inFortyFiveDays,
    questions: {
      selfReview: initial.questions?.selfReview || [...Store.DEFAULT_SELF_QUESTIONS],
      managerReview: initial.questions?.managerReview || [...Store.DEFAULT_MANAGER_QUESTIONS],
      finalSharedReview: initial.questions?.finalSharedReview || [...Store.DEFAULT_FINAL_FIELDS],
    },
  }));

  const selectableWorkers = useMemoRC(() => Store.getSelectableWorkers(cycle.participantType, cycle.includeWorkersWithNoGoals), [cycle.participantType, cycle.includeWorkersWithNoGoals]);

  function patch(p) { setCycle(prev => ({ ...prev, ...p })); }
  function patchQuestions(group, list) { setCycle(prev => ({ ...prev, questions: { ...prev.questions, [group]: list } })); }

  function toggleWorker(workerId) {
    setCycle(prev => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter(id => id !== workerId)
        : [...prev.workerIds, workerId],
    }));
  }

  function selectAllVisible() {
    setCycle(prev => ({ ...prev, workerIds: selectableWorkers.map(w => w.id) }));
  }
  function clearSelection() {
    setCycle(prev => ({ ...prev, workerIds: [] }));
  }

  const step = RC_STEPS[stepIdx].id;
  const isLast = stepIdx === RC_STEPS.length - 1;
  const canNext = stepIdx === 1 ? cycle.workerIds.length > 0 : true;

  async function handleSaveDraft() {
    try {
      const saved = await Store.saveReviewCycleDraft(cycle);
      onSaved && onSaved(saved);
    } catch (e) {
      console.error(e);
      alert(`Could not save draft: ${e.message}`);
    }
  }

  async function handleLaunch() {
    try {
      const launched = await Store.launchReviewCycle(cycle);
      onLaunched && onLaunched(launched);
    } catch (e) {
      console.error(e);
      alert(`Could not launch review cycle: ${e.message}`);
    }
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onCancel}>Back to reviews</Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={handleSaveDraft}>Save as draft</Btn>
          {isLast && <Btn variant="primary" icon="play_circle" onClick={handleLaunch}>Launch review cycle</Btn>}
        </div>
      </div>

      <PageHead
        eyebrow="Performance Management · New review cycle"
        title="Start a new review cycle"
        sub={`Step ${stepIdx + 1} of ${RC_STEPS.length} · ${RC_STEPS[stepIdx].label}`}
      />

      {/* Step indicator */}
      <div className="row items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {RC_STEPS.map((s, i) => {
          const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'todo';
          const colors = state === 'done'
            ? { bg: 'var(--success-bg)', fg: 'var(--success-dark)', border: 'var(--brand-green-200)' }
            : state === 'active'
              ? { bg: 'var(--brand-blue-100)', fg: 'var(--brand-blue-600)', border: 'var(--brand-blue-300)' }
              : { bg: '#fff', fg: 'var(--fg-secondary)', border: 'var(--grey-100)' };
          return (
            <div key={s.id} className="row items-center gap-2" style={{
              padding: '6px 12px', borderRadius: 999, border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.fg, fontSize: 12, fontWeight: 700,
              cursor: i < stepIdx ? 'pointer' : 'default',
            }} onClick={() => { if (i < stepIdx) setStepIdx(i); }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: state === 'done' ? 'var(--success-main)' : state === 'active' ? 'var(--brand-blue-500)' : 'var(--grey-100)',
                color: state === 'todo' ? 'var(--fg-secondary)' : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>{state === 'done' ? '✓' : i + 1}</span>
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Step body */}
      {step === 'details'   && <StepDetails   cycle={cycle} patch={patch} />}
      {step === 'people'    && <StepPeople    cycle={cycle} patch={patch} toggleWorker={toggleWorker}
                                              selectableWorkers={selectableWorkers}
                                              selectAllVisible={selectAllVisible} clearSelection={clearSelection} />}
      {step === 'questions' && <StepQuestions cycle={cycle} patch={patch} patchQuestions={patchQuestions} />}
      {step === 'rating'    && <StepRating    cycle={cycle} patch={patch} />}
      {step === 'review'    && <StepReviewSummary cycle={cycle} selectableWorkers={selectableWorkers} />}

      <div className="row items-center between" style={{ marginTop: 16 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={() => stepIdx === 0 ? onCancel() : setStepIdx(stepIdx - 1)}>
          {stepIdx === 0 ? 'Cancel' : 'Back'}
        </Btn>
        <div className="row gap-2">
          <Btn variant="ghost" icon="schedule" onClick={handleSaveDraft}>Save draft</Btn>
          {!isLast
            ? <Btn variant="primary" iconTrailing="arrow_forward" onClick={() => canNext && setStepIdx(stepIdx + 1)}>{canNext ? 'Next' : 'Pick at least 1 person'}</Btn>
            : <Btn variant="primary" icon="play_circle" onClick={handleLaunch}>Launch review cycle</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 1: Review details ---------- */
function StepDetails({ cycle, patch }) {
  const opts = window.PerformanceStore.REVIEW_TYPE_OPTIONS;
  return (
    <SectionCard title="Review details" sub="Name the cycle and define the period it covers." icon="event_note">
      <div className="col gap-3">
        <RcField label="Review cycle name" required>
          <input type="text" value={cycle.name} onChange={e => patch({ name: e.target.value })} className="rc-input" />
        </RcField>

        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <RcField label="Review type">
              <select className="rc-input" value={cycle.type} onChange={e => patch({ type: e.target.value })}>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Period start">
              <input type="date" className="rc-input" value={cycle.periodStart} onChange={e => patch({ periodStart: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Period end">
              <input type="date" className="rc-input" value={cycle.periodEnd} onChange={e => patch({ periodEnd: e.target.value })} />
            </RcField>
          </div>
        </div>

        <RcField label="Purpose of review" hint="Optional. What outcome do you want from this cycle?">
          <textarea className="rc-input" rows={3} value={cycle.purpose}
            onChange={e => patch({ purpose: e.target.value })}
            placeholder="e.g. Q3 quarterly check-in across Ops and Onboarding teams." />
        </RcField>
      </div>
    </SectionCard>
  );
}

/* ---------- Step 2: Select people ---------- */
function StepPeople({ cycle, patch, toggleWorker, selectableWorkers, selectAllVisible, clearSelection }) {
  return (
    <div className="col gap-4">
      <SectionCard title="Who do you want to include in this review cycle?" icon="groups">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          {PARTICIPANT_TYPE_OPTIONS.map(opt => {
            const active = cycle.participantType === opt.value;
            return (
              <label key={opt.value} style={{
                flex: '1 1 220px', cursor: 'pointer',
                border: `2px solid ${active ? 'var(--brand-blue-500)' : 'var(--grey-100)'}`,
                background: active ? 'var(--brand-blue-100)' : '#fff',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <input type="radio" name="participantType" checked={active} onChange={() => patch({ participantType: opt.value, workerIds: [] })}
                  style={{ marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="row items-center gap-2" style={{ marginBottom: 2 }}>
                    <span className="ms" style={{ color: active ? 'var(--brand-blue-600)' : 'var(--fg-secondary)' }}>{opt.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--grey-800)' }}>{opt.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="row items-center gap-3" style={{ marginTop: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--grey-700)', fontWeight: 700 }}>Include people who do not currently have assigned goals or OKRs?</span>
          <div className="row gap-2">
            {['no','yes'].map(v => {
              const active = (v === 'yes') === cycle.includeWorkersWithNoGoals;
              return (
                <button key={v} onClick={() => patch({ includeWorkersWithNoGoals: v === 'yes', workerIds: [] })}
                  className="filter" style={{
                    background: active ? 'var(--brand-blue-100)' : '#fff',
                    borderColor: active ? 'var(--brand-blue-500)' : 'var(--grey-200)',
                    color: active ? 'var(--brand-blue-600)' : 'var(--grey-700)',
                  }}>{v === 'yes' ? 'Yes (default)' : 'No · only people with goals'}</button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Select people · ${cycle.workerIds.length} selected`}
        sub={`${selectableWorkers.length} eligible based on filters above`}
        icon="checklist"
        action={
          <div className="row gap-2">
            <Btn variant="ghost" size="sm" icon="select_all" onClick={selectAllVisible}>Select all</Btn>
            <Btn variant="ghost" size="sm" icon="clear" onClick={clearSelection}>Clear</Btn>
          </div>
        }
        padBody={false}
      >
        <div style={{ padding: '4px 0' }}>
          {selectableWorkers.length === 0 && (
            <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
              No people match these filters. Try toggling "Include people with no goals".
            </div>
          )}
          {selectableWorkers.map(w => {
            const selected = cycle.workerIds.includes(w.id);
            const goalsCount = window.PerformanceStore.getGoalsForWorker(w.id).length;
            return (
              <label key={w.id} style={{
                display: 'grid', gridTemplateColumns: '24px minmax(0, 2fr) 110px minmax(0, 1fr) 90px',
                gap: 14, alignItems: 'center',
                padding: '12px 22px', borderTop: '1px solid var(--grey-50)', cursor: 'pointer',
                background: selected ? 'var(--brand-blue-100)' : 'transparent',
              }}>
                <input type="checkbox" checked={selected} onChange={() => toggleWorker(w.id)} />
                <div className="row items-center gap-3">
                  <Avatar name={w.name} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--grey-800)' }}>{w.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{w.role}</div>
                  </div>
                </div>
                <Pill variant={w.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                  {w.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                </Pill>
                <div style={{ fontSize: 12, color: 'var(--grey-700)' }}>
                  Reviewer: <strong>{w.managerId === window.PerformanceStore.MANAGER_ID ? 'Priya Nair' : w.managerId}</strong>
                </div>
                <div style={{ fontSize: 12, color: goalsCount ? 'var(--grey-700)' : 'var(--fg-disabled)', fontWeight: 600 }}>
                  {goalsCount} active goal{goalsCount === 1 ? '' : 's'}
                </div>
              </label>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

/* ---------- Step 3: Questions & inputs ---------- */
function StepQuestions({ cycle, patch, patchQuestions }) {
  return (
    <div className="col gap-4">
      <SectionCard title="What context should reviewers see?" icon="data_object">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          {[
            { key: 'includeGoals',              label: 'Assigned goals' },
            { key: 'includeOKRs',               label: 'OKRs / Key results' },
            { key: 'includeWorkerCreatedGoals', label: 'Worker-created goals' },
            { key: 'includeProgressUpdates',    label: 'Goal progress updates' },
            { key: 'includeMeetings',           label: '1:1 meetings' },
            { key: 'includeSharedNotes',        label: 'Shared 1:1 notes' },
            { key: 'includeFeedback',           label: 'Feedback received' },
          ].map(item => (
            <ToggleChip key={item.key} active={!!cycle[item.key]} onChange={(v) => patch({ [item.key]: v })}>
              {item.label}
            </ToggleChip>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Self-review questions"
        sub={`${cycle.questions.selfReview.length} questions · workers see these`}
        icon="person"
      >
        <QuestionList
          questions={cycle.questions.selfReview}
          onChange={(next) => patchQuestions('selfReview', next)}
          placeholder="Add a self-review question…"
        />
      </SectionCard>

      <SectionCard
        title="Manager-review questions"
        sub={`${cycle.questions.managerReview.length} questions · managers see these when writing the review`}
        icon="badge"
      >
        <QuestionList
          questions={cycle.questions.managerReview}
          onChange={(next) => patchQuestions('managerReview', next)}
          placeholder="Add a manager-review question…"
        />
      </SectionCard>
    </div>
  );
}

/* ---------- Step 4: Rating, Visibility & Deadlines ---------- */
function StepRating({ cycle, patch }) {
  return (
    <div className="col gap-4">
      <SectionCard title="Rating" icon="star">
        <div className="row items-center gap-3" style={{ marginBottom: 12 }}>
          <ToggleChip active={cycle.includeRating} onChange={(v) => patch({ includeRating: v })}>Include rating</ToggleChip>
        </div>
        {cycle.includeRating && (
          <div className="col gap-2">
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating scale</div>
            {cycle.ratingOptions.map((opt, i) => (
              <div key={i} className="row items-center gap-2" style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <span style={{ width: 26, fontWeight: 800, color: 'var(--fg-secondary)' }}>{i + 1}</span>
                <input type="text" className="rc-input" value={opt}
                  style={{ flex: 1 }}
                  onChange={e => {
                    const next = cycle.ratingOptions.slice();
                    next[i] = e.target.value;
                    patch({ ratingOptions: next });
                  }} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Visibility to worker" icon="visibility" sub="Manager private notes are never visible to workers or contractors.">
        <div className="col gap-2">
          <ToggleRow label="Show final rating to worker"           checked={cycle.showRatingToWorker}               onChange={(v) => patch({ showRatingToWorker: v })} />
          <ToggleRow label="Show final manager comments to worker" checked={cycle.showManagerFinalCommentsToWorker} onChange={(v) => patch({ showManagerFinalCommentsToWorker: v })} />
          <ToggleRow label="Show manager private notes to worker"  checked={false}                                  disabled lockText="Always hidden" />
        </div>
      </SectionCard>

      <SectionCard title="Deadlines" icon="calendar_month">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Self-review due">
              <input type="date" className="rc-input" value={cycle.selfReviewDueDate} onChange={e => patch({ selfReviewDueDate: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Manager-review due">
              <input type="date" className="rc-input" value={cycle.managerReviewDueDate} onChange={e => patch({ managerReviewDueDate: e.target.value })} />
            </RcField>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <RcField label="Final sharing date">
              <input type="date" className="rc-input" value={cycle.finalSharingDate} onChange={e => patch({ finalSharingDate: e.target.value })} />
            </RcField>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ---------- Step 5: Review & launch summary ---------- */
function StepReviewSummary({ cycle, selectableWorkers }) {
  const selectedPeople = selectableWorkers.filter(w => cycle.workerIds.includes(w.id));
  const typeLabel = window.PerformanceStore.REVIEW_TYPE_OPTIONS.find(o => o.value === cycle.type)?.label || cycle.type;
  const participantLabel = PARTICIPANT_TYPE_OPTIONS.find(o => o.value === cycle.participantType)?.label || cycle.participantType;
  const includedDataLabels = [
    cycle.includeGoals && 'Assigned goals',
    cycle.includeOKRs && 'OKRs / Key results',
    cycle.includeWorkerCreatedGoals && 'Worker-created goals',
    cycle.includeProgressUpdates && 'Progress updates',
    cycle.includeMeetings && '1:1 meetings',
    cycle.includeSharedNotes && 'Shared 1:1 notes',
    cycle.includeFeedback && 'Feedback received',
  ].filter(Boolean);

  return (
    <div className="col gap-4">
      <SectionCard title={cycle.name} sub={`${typeLabel} · ${cycle.periodStart} → ${cycle.periodEnd}`} icon="event_note">
        {cycle.purpose && <div style={{ fontSize: 13, color: 'var(--grey-700)', marginBottom: 14, lineHeight: 1.5 }}>{cycle.purpose}</div>}
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <Pill variant="employee" icon="group">{participantLabel}</Pill>
          <Pill variant="contrib"  icon="checklist">{selectedPeople.length} participants</Pill>
          <Pill variant={cycle.includeRating ? 'eligible' : 'draft'} icon="star">{cycle.includeRating ? 'Rating ON' : 'Rating OFF'}</Pill>
          <Pill variant="warning" icon="schedule">Self-review due {cycle.selfReviewDueDate || '—'}</Pill>
          <Pill variant="warning" icon="schedule">Manager review due {cycle.managerReviewDueDate || '—'}</Pill>
        </div>
      </SectionCard>

      <SectionCard title="Selected people" sub={`${selectedPeople.length} people will get a self-review task and a manager-review task on launch.`} icon="groups" padBody={false}>
        {selectedPeople.length === 0
          ? <div style={{ padding: 20, fontSize: 13, color: 'var(--fg-secondary)' }}>No one selected — go back to step 2.</div>
          : selectedPeople.map(w => (
              <div key={w.id} className="row items-center gap-3" style={{ padding: '10px 22px', borderTop: '1px solid var(--grey-50)' }}>
                <Avatar name={w.name} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{w.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{w.role}</div>
                </div>
                <Pill variant={w.workerType === 'contractor' ? 'contractor' : 'employee'} icon={w.workerType === 'contractor' ? 'engineering' : 'badge'} size="sm">
                  {w.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                </Pill>
              </div>
            ))}
      </SectionCard>

      <SectionCard title="Included data & questions" icon="quiz">
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          {includedDataLabels.map(l => <Pill key={l} variant="contrib" icon="check">{l}</Pill>)}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>
          {cycle.questions.selfReview.length} self-review questions · {cycle.questions.managerReview.length} manager-review questions · {cycle.ratingOptions.length}-point rating scale
        </div>
      </SectionCard>

      <Callout tone="info" icon="lock">
        <strong>Manager private notes</strong> are never visible to workers or contractors, regardless of visibility settings.
      </Callout>
    </div>
  );
}

/* ---------- Tiny helpers ---------- */
function RcField({ label, required, hint, children }) {
  return (
    <label className="col" style={{ gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--error-dark)' }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>{hint}</span>}
    </label>
  );
}

function ToggleChip({ active, onChange, children }) {
  return (
    <button onClick={() => onChange(!active)} className="filter" style={{
      background: active ? 'var(--brand-blue-100)' : '#fff',
      borderColor: active ? 'var(--brand-blue-500)' : 'var(--grey-200)',
      color: active ? 'var(--brand-blue-600)' : 'var(--grey-700)',
      fontWeight: 700, fontSize: 12.5,
    }}>
      <span className="ms" style={{ fontSize: 14, marginRight: 4 }}>{active ? 'check_circle' : 'radio_button_unchecked'}</span>
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange, disabled, lockText }) {
  return (
    <div className="row items-center between" style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8, opacity: disabled ? 0.85 : 1 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-700)' }}>{label}</span>
      <div className="row items-center gap-2">
        {disabled
          ? <Pill variant="overdue" icon="lock">{lockText || 'Locked'}</Pill>
          : (
            <button onClick={() => onChange(!checked)} style={{
              border: 'none', cursor: 'pointer',
              width: 44, height: 24, borderRadius: 999,
              background: checked ? 'var(--brand-blue-500)' : 'var(--grey-100)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: checked ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.12s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </button>
          )}
      </div>
    </div>
  );
}

function QuestionList({ questions, onChange, placeholder }) {
  const [draft, setDraft] = useStateRC('');
  function addQ() {
    if (!draft.trim()) return;
    onChange([...questions, draft.trim()]);
    setDraft('');
  }
  function removeQ(idx) {
    onChange(questions.filter((_, i) => i !== idx));
  }
  function editQ(idx, val) {
    onChange(questions.map((q, i) => i === idx ? val : q));
  }
  return (
    <div className="col gap-2">
      {questions.map((q, i) => (
        <div key={i} className="row items-start gap-2" style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
          <span style={{ width: 24, fontWeight: 800, color: 'var(--fg-secondary)', flexShrink: 0, paddingTop: 6 }}>{i + 1}</span>
          <textarea className="rc-input" rows={2} style={{ flex: 1 }} value={q} onChange={e => editQ(i, e.target.value)} />
          <IconBtn icon="delete_outline" title="Remove" onClick={() => removeQ(i)} />
        </div>
      ))}
      <div className="row items-center gap-2" style={{ marginTop: 6 }}>
        <input type="text" className="rc-input" style={{ flex: 1 }} value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addQ(); } }} />
        <Btn variant="outlined" size="sm" icon="add" onClick={addQ}>Add</Btn>
      </div>
    </div>
  );
}

window.ReviewCycleStepper = ReviewCycleStepper;
