/* Frame · Worker 1:1 Sessions
   Personal list of 1:1s. Worker can prep agenda, view shared notes after the
   meeting, and check action items. Private notes from the manager are hidden. */

const { useState: useStateWM } = React;

function WorkerMeetings() {
  const [openNotes, setOpenNotes] = useStateWM(null);
  const [storeVersion, setStoreVersion] = useStateWM(0);

  React.useEffect(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  const upcoming = [];

  const storeSessions = window.PerformanceStore.getMeetingsForWorker(window.PerformanceStore.CURRENT_WORKER_ID).map(m => {
    let whenStr = 'Scheduled', timeStr = '';
    if (m.scheduledAt) {
      const d = new Date(m.scheduledAt);
      whenStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return {
    id: m.id,
    when: whenStr,
    time: timeStr,
    with: 'Priya Mehta',
    role: 'Manager · 1:1',
    live: m.status === 'live',
    agenda: m.agenda,
    summary: m.sharedNotes,
    workerPrivateNotes: m.workerPrivateNotes,
    actionItems: (m.actionItems || []).filter(a => a.shared !== false),
    linked: (m.linkedGoalIds || []).map(id => {
      const goal = window.PerformanceStore.getGoals().find(g => g.id === id);
      return { kind: 'okr', label: goal ? `${goal.title} · ${goal.progress}%` : 'Linked goal' };
    }),
  }; });
  const liveSession = storeSessions.find(m => m.live) || null;
  const pastSessions = storeSessions.filter(m => !m.live);

  // Worker variant of the notes editor — only shared notes visible.
  if (openNotes) {
    return (
      <Shell persona="worker" active="performance" crumb={['Payo WFM', 'Performance', 'My 1:1 sessions', `Notes — ${openNotes.with}`]}>
        <WorkerNotesView meeting={openNotes} onBack={() => setOpenNotes(null)} />
      </Shell>
    );
  }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My 1:1 sessions']}>

      <PerfTabs variant="worker" active="my-meetings" />

      <PageHead
        eyebrow="My performance"
        title="My 1:1 sessions"
        sub="Your check-ins with managers, peers and mentors. Prep agenda items before, read shared notes and action items after."
        actions={<>
          <Btn variant="primary" icon="add" onClick={async () => {
            const reason = window.prompt('Reason for the 1:1 (optional)');
            if (reason === null) return; // user cancelled
            try {
              await window.PerformanceStore.request1on1({ reason: reason || '' });
              alert('Request sent. Your manager has been notified.');
            } catch (e) {
              alert(`Could not send request: ${e.message}`);
            }
          }}>Request a 1:1</Btn>
        </>}
      />

      <div className="stats-row c-3 mb-4">
        <StatCard tone="blue"   icon="event_available" label="Upcoming"            value={String(upcoming.length)}        sub={upcoming.length ? 'Scheduled' : 'No 1:1s scheduled'} />
        <StatCard tone="green"  icon="task_alt"        label="Action items"        value={String(pastSessions.reduce((s, p) => s + (p.actionItems?.length || 0), 0))} sub="Across past sessions" />
        <StatCard tone="purple" icon="schedule"        label="Sessions this year"  value={String(storeSessions.length)}   sub="Total with your manager" />
      </div>

      {/* Live now card */}
      {liveSession && (
        <div className="card mb-4" style={{ borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 4px var(--brand-blue-100)' }}>
          <div style={{ padding: '20px 24px' }}>
            <div className="row items-center gap-3 mb-3">
              <Avatar name={liveSession.with} size="lg" />
              <div className="flex-1">
                <div className="row items-center gap-2 mb-1">
                  <Pill variant="active" dot>Live now</Pill>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {liveSession.when} · {liveSession.time}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>1:1 with {liveSession.with}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>{liveSession.role}</div>
              </div>
              <Btn variant="primary" icon="edit_note" onClick={() => setOpenNotes({
                ...liveSession,
                when: liveSession.when + (liveSession.time ? ' · ' + liveSession.time : ''),
              })}>Take notes</Btn>
            </div>

            <div style={{ background: 'var(--brand-blue-50)', borderRadius: 10, padding: '14px 16px' }}>
              <div className="row items-center between mb-2">
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-blue-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shared agenda</div>
                <Btn variant="text" size="sm" icon="add">Add item</Btn>
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.7 }}>
                {(liveSession.agenda || []).map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <SectionCard
        title="Upcoming sessions"
        sub="Add to your shared agenda anytime"
        icon="event"
        padBody={false}
      >
        <div>
          {upcoming.map((m, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--grey-50)' : 'none',
              display: 'grid', gridTemplateColumns: '160px 240px 1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.when}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', fontWeight: 600, marginTop: 2 }}>{m.time}</div>
              </div>
              <div className="worker-cell">
                <Avatar name={m.with} size="sm" />
                <div>
                  <div className="name">{m.with}</div>
                  <div className="role">{m.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{m.agenda}</div>
              <Btn variant="ghost" size="sm" icon="add">Add agenda</Btn>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Past sessions with shared notes */}
      <div className="mt-4">
        <SectionCard
          title="Past sessions"
          sub="Shared notes and action items from previous 1:1s — manager private notes aren't visible to you"
          icon="history"
          padBody={false}
        >
          {pastSessions.map((p, i) => (
            <div key={p.id || i} style={{ padding: '16px 20px', borderBottom: i < pastSessions.length - 1 ? '1px solid var(--grey-50)' : 'none',
              display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.when}</div>
                <div className="row items-center gap-2 mt-2">
                  <Avatar name={p.with} size="xs" />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--grey-700)' }}>{p.with}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 3 }}>{p.role}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: p.actionItems.length || p.linked.length ? 12 : 0 }}>{p.summary}</div>
                {p.linked.length > 0 && (
                  <div className="row gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                    {p.linked.map((l, j) => (
                      <Pill key={j} variant={l.kind === 'okr' ? 'contrib' : l.kind === 'project' ? 'contractor' : 'review-due'}
                        icon={l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}>{l.label}</Pill>
                    ))}
                  </div>
                )}
                {p.actionItems.length > 0 && (
                  <div className="col gap-2 mt-2">
                    {p.actionItems.map((a, j) => (
                      <div key={j} className="row items-center gap-2" style={{ fontSize: 12.5, color: a.done ? 'var(--fg-disabled)' : 'var(--grey-700)',
                        textDecoration: a.done ? 'line-through' : 'none' }}>
                        <span className="ms" style={{ fontSize: 16, color: a.done ? 'var(--success-main)' : 'var(--grey-300)' }}>
                          {a.done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {a.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Btn variant="ghost" size="sm" icon="open_in_new" onClick={() => setOpenNotes(p)}>Open notes</Btn>
            </div>
          ))}
        </SectionCard>
      </div>

      <Callout tone="info" icon="visibility_off" style={{ marginTop: 16 }}>
        Manager <strong>private notes</strong> are not visible to you. You see the shared notes, shared agenda, and shared action items you both agreed to.
      </Callout>
    </Shell>
  );
}

/* Worker-only notes view: read-only shared notes + action items.
   Mirrors the manager's MeetingNotesEditor layout but hides the private panel. */
function WorkerNotesView({ meeting, onBack }) {
  const [privateDirty, setPrivateDirtyWN] = React.useState(false);
  const [workerPrivateNotes, setWorkerPrivateNotes] = React.useState(meeting.workerPrivateNotes || 'Want to ask Priya about the Lead Ops promotion track and whether I can shadow her on the next QBR.');

  return (
    <div className="notes-takeover">
      <div className="topbar">
        <div className="lead">
          <button className="back" onClick={onBack}><span className="ms">arrow_back</span></button>
          <h2><Avatar name={meeting.with} size="md" />1:1 with {meeting.with}</h2>
        </div>
        <div className="actions">
          <Btn variant="ghost" icon="rate_review">Attach to self-review</Btn>
          <Btn variant="primary" icon="check">Done</Btn>
        </div>
      </div>

      <div className="notes-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 32, alignItems: 'flex-start' }}>
          <div className="notes-rail">
            <div className="notes-event">
              <div className="when">{meeting.when} {meeting.live && <Pill variant="active" dot>Live now</Pill>}</div>

              {meeting.linked?.length > 0 && (
                <div className="linked-strip">
                  {meeting.linked.map((l, i) => (
                    <span key={i} className="linked-chip">
                      <span className="ms">{l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}</span>{l.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Shared notes (read-only worker view) */}
              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">groups</span>Shared Notes
                    <span className="meta"><span className="ms">visibility</span>You & your manager</span>
                  </div>
                  <div className="saved">Live · synced<span className="ind" /></div>
                </div>
                <div className="editor-body" style={{ minHeight: 90 }}>
                  {/* Manager private notes are intentionally excluded from worker view. */}
                  {meeting.summary || (
                    <em style={{ color: 'var(--fg-secondary)' }}>Shared notes will appear here once your manager starts writing.</em>
                  )}
                </div>

                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div className="action-section">
                    <div className="h">Action Items</div>
                    {meeting.actionItems.map((a, i) => (
                      <div key={i} className={`action-row ${a.done ? 'done' : ''}`}>
                        <div className={`check-sq ${a.done ? 'done' : ''}`}>
                          {a.done && <span className="ms">check</span>}
                        </div>
                        <span className="text">{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My private notes — only visible to the worker */}
              <div className="notes-card" style={{ borderLeftColor: 'var(--brand-blue-500)' }}>
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">person</span>My private notes
                    <span className="meta"><span className="ms">visibility_off</span>Only visible to me</span>
                  </div>
                  <div className="saved">
                    {privateDirty
                      ? <><span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span><span className="ind unsaved" /></>
                      : <>Saved<span className="ind" /></>}
                  </div>
                </div>
                <EditorToolbar />
                <div
                  className="editor-body"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  data-placeholder="Your private notes — only you can see these…"
                  style={{ minHeight: 100, outline: 'none' }}
                  onInput={(e) => { setWorkerPrivateNotes(e.currentTarget.innerText); setPrivateDirtyWN(true); }}
                  onBlur={() => {
                    if (meeting.id) window.PerformanceStore.updateMeetingNotes(meeting.id, { workerPrivateNotes });
                    setPrivateDirtyWN(false);
                  }}
                >
                  {workerPrivateNotes}
                </div>
              </div>
            </div>

            {/* Privacy callout */}
            <div className="notes-event past">
              <div className="when" style={{ color: 'var(--fg-disabled)' }}>
                <span className="ms" style={{ fontSize: 16 }}>visibility_off</span>
                Your manager's private notes are not visible to you.
              </div>
            </div>
          </div>

          <div className="notes-side" style={{ position: 'sticky', top: 0 }}>
            <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
              <div className="h" style={{ marginTop: 0 }}>Linked</div>
              {meeting.linked?.length > 0 ? (
                <div className="col gap-2">
                  {meeting.linked.map((l, i) => (
                    <Pill key={i} variant={l.kind === 'okr' ? 'contrib' : l.kind === 'project' ? 'contractor' : 'review-due'}
                      icon={l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews'}>{l.label}</Pill>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: 'var(--fg-disabled)' }}>None yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WorkerMeetings = WorkerMeetings;
