/* Worker Self-Review form
   Loads the selfReview record for a participantId, shows auto-pulled context
   (goals, KRs, shared 1:1 notes, feedback) and the cycle's self-review questions.
   Allows Save Draft and Submit. Never shows manager private notes. */

const { useState: useStateWSR, useEffect: useEffectWSR, useMemo: useMemoWSR } = React;

function WorkerSelfReview({ participantId, onBack }) {
  const Store = window.PerformanceStore;
  const [storeVersion, setStoreVersion] = useStateWSR(0);
  useEffectWSR(() => Store.subscribe(() => setStoreVersion(v => v + 1)), []);

  const participant = Store.getReviewParticipantById(participantId);
  const cycle = participant ? Store.getReviewCycleById(participant.reviewCycleId) : null;
  const worker = participant ? Store.workerById(participant.workerId) : null;
  const selfReview = participant ? Store.getSelfReview(participantId) : null;
  const context = useMemoWSR(
    () => (participant && cycle) ? Store.getReviewContextForWorker(participant.workerId, participant.reviewCycleId) : null,
    [participantId, storeVersion]
  );

  const questions = cycle?.questions?.selfReview || Store.DEFAULT_SELF_QUESTIONS;
  const [answers, setAnswers] = useStateWSR(() => questions.map((q, i) => ({ question: q, answer: selfReview?.answers?.[i]?.answer || '' })));

  // Keep answers in sync if questions/cycle change
  useEffectWSR(() => {
    setAnswers(questions.map((q, i) => ({ question: q, answer: selfReview?.answers?.[i]?.answer || '' })));
  }, [participantId, questions.length]);

  if (!participant || !cycle || !selfReview) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back</Btn>
        <div style={{ marginTop: 16, fontSize: 14, color: 'var(--fg-secondary)' }}>This self-review is no longer available.</div>
      </div>
    );
  }

  const submitted = selfReview.status === 'submitted' || participant.selfReviewStatus === 'submitted';

  function updateAnswer(i, value) {
    setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, answer: value } : a));
  }

  function saveDraft() {
    Store.saveSelfReview(participantId, answers);
  }

  async function submit() {
    await Store.saveSelfReview(participantId, answers);
    await Store.submitSelfReview(participantId);
    onBack && onBack();
  }

  return (
    <div>
      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={onBack}>Back to my reviews</Btn>
        <div className="row gap-2">
          {!submitted && <>
            <Btn variant="ghost" icon="schedule" onClick={saveDraft}>Save draft</Btn>
            <Btn variant="primary" icon="send" onClick={submit}>Submit self-review</Btn>
          </>}
          {submitted && <Pill variant="completed" dot>Submitted</Pill>}
        </div>
      </div>

      <PageHead
        eyebrow={`${cycle.name} · Self-review`}
        title={`Your self-review`}
        sub={`Period ${cycle.periodStart} → ${cycle.periodEnd} · due ${cycle.selfReviewDueDate || 'TBD'} · auto-saves as you type`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="col gap-4">
          {questions.map((q, i) => (
            <SectionCard key={i} title={`${i + 1} · ${q}`} icon="edit_note">
              <textarea
                className="rc-input"
                rows={5}
                disabled={submitted}
                value={answers[i]?.answer || ''}
                placeholder="Reflect honestly. Reference goals, KRs, projects, and 1:1s where helpful."
                onChange={e => updateAnswer(i, e.target.value)}
                onBlur={saveDraft}
              />
            </SectionCard>
          ))}
        </div>

        <div className="col gap-3" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
          {context && <SelfReviewContext context={context} worker={worker} cycle={cycle} />}
          <Callout tone="info" icon="info">
            <strong>Your private notes from 1:1s stay private.</strong> Only shared 1:1 notes appear in this context panel. Manager private notes are never shown to you.
          </Callout>
        </div>
      </div>
    </div>
  );
}

function SelfReviewContext({ context, worker, cycle }) {
  return (
    <>
      <SectionCard title="My goals & OKRs" icon="flag" sub={`Auto-pulled from People Goals · ${context.goals.length} goal${context.goals.length === 1 ? '' : 's'}`}>
        <div className="col gap-2">
          {context.goals.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-secondary)' }}>No active goals in this period.</div>}
          {context.goals.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--grey-800)' }}>{g.title}</div>
              <div className="row items-center gap-2" style={{ marginTop: 4 }}>
                <Pill variant={g.status === 'on-track' ? 'on-track' : g.status === 'at-risk' ? 'at-risk' : 'completed'} size="sm" dot>{g.status}</Pill>
                <span style={{ fontSize: 11.5, color: 'var(--grey-700)', fontWeight: 700 }}>{g.progress}%</span>
                {g.dueDate && <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· due {g.dueDate}</span>}
              </div>
              {cycle.includeOKRs && (g.keyResults || []).length > 0 && (
                <div className="col gap-1" style={{ marginTop: 6 }}>
                  {g.keyResults.map(kr => (
                    <div key={kr.id} className="row items-center gap-2" style={{ fontSize: 11.5, color: 'var(--grey-700)' }}>
                      <span style={{ width: 38, fontWeight: 700, color: kr.progress >= 70 ? 'var(--success-main)' : kr.progress >= 40 ? 'var(--warning-dark)' : 'var(--error-dark)' }}>{kr.progress}%</span>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kr.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {cycle.includeSharedNotes && context.meetings.length > 0 && (
        <SectionCard title="Shared 1:1 notes" icon="event" sub={`${context.meetings.length} meeting${context.meetings.length === 1 ? '' : 's'} in this period`}>
          <div className="col gap-2">
            {context.meetings.slice(0, 4).map(m => (
              <div key={m.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)' }}>{m.scheduledAt}</div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-700)', marginTop: 4, lineHeight: 1.5 }}>
                  {m.sharedNotes || <em style={{ color: 'var(--fg-disabled)' }}>No shared notes recorded.</em>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {cycle.includeFeedback && context.feedback.length > 0 && (
        <SectionCard title="Feedback received" icon="forum" sub={`${context.feedback.length} item${context.feedback.length === 1 ? '' : 's'} in this period`}>
          <div className="col gap-2">
            {context.feedback.map(f => (
              <div key={f.id} style={{ padding: '10px 12px', border: '1px solid var(--grey-100)', borderRadius: 8 }}>
                <div className="row items-center gap-2" style={{ marginBottom: 4 }}>
                  <Avatar name={f.from} size="xs" />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{f.from}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {f.fromRole} · {f.date}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.45 }}>{f.text}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

window.WorkerSelfReview = WorkerSelfReview;
