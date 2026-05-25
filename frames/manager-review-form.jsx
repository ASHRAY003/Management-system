/* Manager Review form
   Loads the managerReview for a participantId, shows the worker's context AND
   their submitted self-review answers (if any), lets the manager fill manager
   questions + strengths/improvement/next/summary + rating + private notes,
   and submit or share with worker. Private notes never go to the worker. */

const { useState: useStateMRF, useEffect: useEffectMRF, useMemo: useMemoMRF, useRef: useRefMRF } = React;

function ManagerReviewForm({ participantId, onBack }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateMRF(0);
  const [saving, setSaving] = useStateMRF(false);
  const participantIdRef = useRefMRF(participantId);
  participantIdRef.current = participantId;
  useEffectMRF(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const mr = participant ? Store.getManagerReview(participantId) : null;
  const self = participant ? Store.getSelfReview(participantId) : null;
  const context = useMemoMRF(
    () => (participant && cycle) ? Store.getReviewContextForWorker(participant.workerId, participant.reviewCycleId) : null,
    [participantId, storeVersion]
  );

  const questions = cycle?.questions?.managerReview || Store.DEFAULT_MANAGER_QUESTIONS;
  const ratingOpts = cycle?.ratingOptions || Store.DEFAULT_RATING_OPTIONS;

  const [answers, setAnswers] = useStateMRF(() => questions.map((q, i) => ({ question: q, answer: mr?.answers?.[i]?.answer || '' })));
  const [rating, setRating] = useStateMRF(mr?.rating || '');
  const [strengths, setStrengths] = useStateMRF(mr?.strengths || '');
  const [improvementAreas, setImprovementAreas] = useStateMRF(mr?.improvementAreas || '');
  const [nextCycleFocus, setNextCycleFocus] = useStateMRF(mr?.nextCycleFocus || '');
  const [finalSummary, setFinalSummary] = useStateMRF(mr?.finalSummary || '');
  const [privateManagerNotes, setPrivateManagerNotes] = useStateMRF(mr?.privateManagerNotes || '');

  useEffectMRF(() => {
    setAnswers(questions.map((q, i) => ({ question: q, answer: mr?.answers?.[i]?.answer || '' })));
    setRating(mr?.rating || '');
    setStrengths(mr?.strengths || '');
    setImprovementAreas(mr?.improvementAreas || '');
    setNextCycleFocus(mr?.nextCycleFocus || '');
    setFinalSummary(mr?.finalSummary || '');
    setPrivateManagerNotes(mr?.privateManagerNotes || '');
  }, [participantId, questions.length]);

  // Auto-initialize the manager review via upsert if it hasn't been created yet
  useEffectMRF(() => {
    if (participant && cycle && !mr) {
      Store.saveManagerReview(participantId, {});
    }
  }, [participantId]);

  if (!participant || !cycle) {
    if (saving) return (
      <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="ms" style={{ fontSize: 20, color: 'var(--brand-blue-500)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        <span style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>Saving review…</span>
      </div>
    );
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>
          This manager review is no longer available.
        </div>
      </div>
    );
  }

  const shared = mr?.status === 'shared' || participant.finalReviewStatus === 'shared';

  function persistPayload() {
    return { answers, rating, strengths, improvementAreas, nextCycleFocus, finalSummary, privateManagerNotes };
  }

  async function saveDraft() {
    if (saving) return;
    setSaving(true);
    try { await Store.saveManagerReview(participantId, persistPayload()); }
    catch (e) { alert('Save draft failed: ' + e.message); }
    finally { setSaving(false); }
  }

  function submit() {
    if (saving) return;
    setSaving(true);
    const payload = persistPayload();
    const pid = participantId;
    onBack && onBack();
    Store.saveManagerReview(pid, payload)
      .then(() => Store.submitManagerReview(pid))
      .catch(e => console.error('submit failed:', e.message));
  }

  function shareWithWorker() {
    if (saving) return;
    setSaving(true);
    const payload = persistPayload();
    const pid = participantId;
    onBack && onBack();
    Store.saveManagerReview(pid, payload)
      .then(() => Store.submitManagerReview(pid))
      .then(() => Store.shareManagerReview(pid))
      .catch(e => console.error('share failed:', e.message));
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to cycle</Btn>
        <div className="row gap-2">
          {shared
            ? <Pill variant="completed" dot>Shared with worker</Pill>
            : <>
                <Btn variant="ghost" icon="schedule" onClick={saveDraft}>Save draft</Btn>
                <Btn variant="outlined" icon="send" onClick={submit}>Submit review</Btn>
                <Btn variant="primary" icon="visibility" onClick={shareWithWorker}>Share with {worker?.name?.split(' ')[0] || 'worker'}</Btn>
              </>}
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Manager review`}
        title={`Write a review for ${worker?.name || 'worker'}`}
        sub={`${worker?.role || ''} · ${worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'} · period ${cycle.periodStart} → ${cycle.periodEnd}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        {/* LEFT — manager questions + summary fields */}
        <div className="col gap-4">
          {self && (self.status === 'submitted' || self.status === 'draft') && (
            <div style={{
              background: self.status === 'submitted'
                ? 'linear-gradient(135deg, #E8F7EF 0%, #FFFFFF 65%)'
                : 'linear-gradient(135deg, #FFF7E6 0%, #FFFFFF 65%)',
              border: `1px solid ${self.status === 'submitted' ? 'var(--brand-green-200)' : '#FFE3A5'}`,
              borderRadius: 14,
              padding: '14px 18px 18px',
              boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
            }}>
              <div className="row items-center gap-3" style={{ marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: self.status === 'submitted' ? 'var(--success-bg)' : 'var(--warning-bg)',
                  color: self.status === 'submitted' ? 'var(--success-dark)' : 'var(--warning-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="ms" style={{ fontSize: 22 }}>assignment_turned_in</span>
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Self review · context for your manager review</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--grey-800)', marginTop: 2 }}>
                    {worker?.name || 'Worker'}’s self-review for {cycle.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>
                    {self.submittedAt
                      ? `Submitted ${new Date(self.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Not yet submitted'} · {worker?.workerType === 'contractor' ? 'Contractor' : 'Employee'}
                  </div>
                </div>
                {self.status === 'submitted'
                  ? <Pill variant="completed" dot>Self Review Submitted</Pill>
                  : <Pill variant="warning"   dot>Draft · not yet submitted</Pill>}
              </div>

              <div className="col gap-2">
                {self.answers.length === 0 && (
                  <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
                    {self.status === 'submitted' ? 'Worker submitted but left all answers blank.' : 'Worker hasn’t answered any questions yet.'}
                  </div>
                )}
                {self.answers.map((a, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#fff', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginTop: 2 }}>{a.question}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {a.answer || <em style={{ color: 'var(--fg-disabled)' }}>No answer.</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!self && (
            <Callout tone="warning" icon="info">
              No self-review record found for this participant. You can still write the manager review below.
            </Callout>
          )}

          {questions.map((q, i) => (
            <SectionCard key={i} title={`${i + 1} · ${q}`} icon="edit_note">
              <textarea
                className="rc-input"
                rows={4}
                disabled={shared}
                value={answers[i]?.answer || ''}
                placeholder="Reference specific projects, OKRs, or moments."
                onChange={e => setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, answer: e.target.value } : a))}
                onBlur={saveDraft}
              />
            </SectionCard>
          ))}

          <SectionCard title="Final summary fields" icon="summarize" sub="Used in the final shared review">
            <div className="col gap-3">
              <FieldArea label="Key strengths"    value={strengths}        onChange={setStrengths}        disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Development areas" value={improvementAreas} onChange={setImprovementAreas} disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Next cycle focus"  value={nextCycleFocus}   onChange={setNextCycleFocus}   disabled={shared} onBlur={saveDraft} />
              <FieldArea label="Final performance summary" rows={5} value={finalSummary} onChange={setFinalSummary} disabled={shared} onBlur={saveDraft} />
            </div>
          </SectionCard>

          <SectionCard title="Private manager notes" icon="lock" sub="Never shared with the worker — only visible to managers and admins.">
            <textarea
              className="rc-input"
              rows={4}
              disabled={shared}
              value={privateManagerNotes}
              placeholder="Calibration thoughts, comp signals, promotion case — your eyes only."
              onChange={e => setPrivateManagerNotes(e.target.value)}
              onBlur={saveDraft}
              style={{ background: '#FFFAEB', borderColor: '#FFE3A5' }}
            />
          </SectionCard>
        </div>

        {/* RIGHT — rating + context */}
        <div className="col gap-3" style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
          {cycle.includeRating && (
            <SectionCard title="Overall rating" icon="star">
              <div className="col gap-2">
                {ratingOpts.map((opt, idx) => {
                  const starValue = ratingOpts.length - idx;
                  return (
                    <label key={opt} className="row items-center gap-2" style={{
                      padding: '10px 12px', border: `1.5px solid ${rating === opt ? 'var(--brand-blue-500)' : 'var(--grey-100)'}`,
                      background: rating === opt ? 'var(--brand-blue-100)' : '#fff',
                      borderRadius: 8, cursor: shared ? 'default' : 'pointer',
                    }}>
                      <input type="radio" name="rating" checked={rating === opt} onChange={() => { setRating(opt); }}
                        disabled={shared}
                        onBlur={saveDraft} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', flex: 1 }}>{opt}</span>
                      <Stars value={starValue} max={ratingOpts.length} size="sm" />
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {context && <ManagerReviewContext context={context} cycle={cycle} />}

          <Callout tone="warning" icon="lock">
            <strong>Private notes</strong> stay with managers. The worker sees only summary fields and the rating you choose (per cycle visibility settings).
          </Callout>
        </div>
      </div>
    </div>
  );
}

function FieldArea({ label, value, onChange, rows = 3, disabled, onBlur }) {
  return (
    <label className="col" style={{ gap: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <textarea className="rc-input" rows={rows} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)} onBlur={onBlur} />
    </label>
  );
}

function ManagerReviewContext({ context, cycle }) {
  return (
    <>
      <SectionCard title="Worker context" icon="flag" sub={`${context.goals.length} goals · ${context.keyResults.length} KRs`}>
        <div className="col gap-2">
          {context.goals.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)' }}>No goals visible to this worker in the period.</div>}
          {context.goals.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-800)' }}>{g.title}</div>
              <div className="row items-center gap-2" style={{ marginTop: 4 }}>
                <Pill variant={g.status === 'on-track' ? 'on-track' : g.status === 'at-risk' ? 'at-risk' : 'completed'} size="sm" dot>{g.status}</Pill>
                <span style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 700 }}>{g.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {cycle.includeFeedback && context.feedback.length > 0 && (
        <SectionCard title="Feedback in period" icon="forum">
          <div className="col gap-2">
            {context.feedback.slice(0, 5).map(f => (
              <div key={f.id} style={{ padding: '8px 10px', border: '1px solid var(--grey-100)', borderRadius: 8, fontSize: 12, color: 'var(--grey-700)' }}>
                <strong>{f.from}</strong> · <span style={{ color: 'var(--fg-secondary)' }}>{f.date}</span><br />{f.text}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

window.ManagerReviewForm = ManagerReviewForm;
