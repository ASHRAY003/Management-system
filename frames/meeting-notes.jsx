/* 1:1 Meeting notes editor — rich takeover modeled on the screenshot.
   Two cards per meeting timeline entry: Shared Notes (yellow accent) +
   Private Notes (red accent), each with a formatting toolbar and an Action
   Items section. Prior meetings show as additional events on the rail. */

const { useState: useStateNE } = React;

function MeetingNotesEditor({ meetingId, worker = '', role = '', linked = [], initialSharedNotes = '', initialPrivateNotes = '', initialActions = null, onBack }) {
  const [sharedDirty,  setSharedDirty]  = useStateNE(false);
  const [privateDirty, setPrivateDirty] = useStateNE(false);
  const [sharedNotes, setSharedNotes] = useStateNE(initialSharedNotes || '');
  const [managerPrivateNotes, setManagerPrivateNotes] = useStateNE(initialPrivateNotes || '');
  const [actions, setActions] = useStateNE(initialActions || []);

  const persistNotes = (patch) => {
    if (!meetingId) return;
    window.PerformanceStore.updateMeetingNotes(meetingId, patch);
  };
  const toggle = id => {
    const nextActions = actions.map(a => a.id === id ? { ...a, done: !a.done, shared: true } : { ...a, shared: true });
    setActions(nextActions);
    persistNotes({ actionItems: nextActions });
  };
  const saveAndClose = () => {
    persistNotes({
      sharedNotes,
      managerPrivateNotes,
      actionItems: actions.map(a => ({ ...a, shared: true })),
    });
    onBack && onBack();
  };

  /* ===== Past meeting (empty by default) ===== */
  const past = null;

  return (
    <div className="notes-takeover">
      {/* Topbar */}
      <div className="topbar">
        <div className="lead">
          <button className="back" onClick={onBack} title="Back"><span className="ms">arrow_back</span></button>
          <h2>
            <Avatar name={worker} size="md" />
            1:1 with {worker}
          </h2>
        </div>
        <div className="actions">
          <Btn variant="ghost" icon="summarize">Summary</Btn>
          <Btn variant="ghost" icon="rate_review">Send to review</Btn>
          <Btn variant="ghost" icon="forum">Convert to feedback</Btn>
          <Btn variant="primary" icon="check" onClick={saveAndClose}>Done</Btn>
        </div>
      </div>

      {/* Body */}
      <div className="notes-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: 32, alignItems: 'flex-start' }}>
          {/* Timeline + cards */}
          <div className="notes-rail">

            {/* ====== Today's meeting ====== */}
            <div className="notes-event" id="evt-today">
              <div className="when">Mar 26 <span className="sep">·</span> 10:00 AM <Pill variant="active" dot>Live now</Pill></div>

              {linked.length > 0 && (
                <div className="linked-strip">
                  {linked.map((l, i) => (
                    <span key={i} className="linked-chip">
                      <span className="ms">{l.icon}</span>{l.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Shared notes card */}
              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">groups</span>Shared Notes
                  </div>
                  <div className="saved">
                    {sharedDirty
                      ? <><span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span><span className="ind unsaved" /></>
                      : <>Saved at 10:23 AM<span className="ind" /></>}
                    <button className="help-i" title="Formatting help"><span className="ms">help</span></button>
                  </div>
                </div>
                <EditorToolbar />
                <div
                  className="editor-body"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  data-placeholder="Start writing shared notes…"
                  style={{ outline: 'none' }}
                  onInput={(e) => { setSharedNotes(e.currentTarget.innerText); setSharedDirty(true); }}
                  onBlur={(e) => {
                    const latestSharedNotes = e.currentTarget.innerText;
                    setSharedNotes(latestSharedNotes);
                    // Shared notes are persisted for both manager and worker views.
                    persistNotes({ sharedNotes: latestSharedNotes, actionItems: actions.map(a => ({ ...a, shared: true })) });
                    setSharedDirty(false);
                  }}
                >
                  <div>{sharedNotes}</div>
                  <div className="ai-prompt">
                    <span className="ms" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4, color: 'var(--brand-blue-500)' }}>lightbulb</span>
                    Suggestion: link this note to her OKR <strong>"Complete 6 migrations"</strong> — it's 90% done.
                  </div>
                </div>

                {/* Action items inline */}
                <div className="action-section">
                  <div className="h">Action Items</div>
                  {actions.map(a => (
                    <div key={a.id} className={`action-row ${a.done ? 'done' : ''}`}>
                      <div className={`check-sq ${a.done ? 'done' : ''}`} onClick={() => toggle(a.id)}>
                        {a.done && <span className="ms">check</span>}
                      </div>
                      <span className="text">{a.text}</span>
                      {a.due && <span className="due-chip"><span className="ms">event</span>{a.due}</span>}
                      <span className="owner-chip">{a.owner}</span>
                      <span className="row-x" title="Remove"><span className="ms" style={{ fontSize: 16 }}>close</span></span>
                    </div>
                  ))}
                  <div className="add-row"><span className="ms">add</span>Add action item</div>
                </div>
              </div>

              {/* Private notes card */}
              <div className="notes-card private">
                <div className="nc-head">
                  <div className="lead">
                    <span className="ms">lock</span>Private Notes
                    <span className="meta"><span className="ms">visibility</span>Only visible to you</span>
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
                  data-placeholder="Private thoughts — only you can see these…"
                  style={{ outline: 'none' }}
                  onInput={(e) => { setManagerPrivateNotes(e.currentTarget.innerText); setPrivateDirty(true); }}
                  onBlur={(e) => {
                    const latestManagerPrivateNotes = e.currentTarget.innerText;
                    setManagerPrivateNotes(latestManagerPrivateNotes);
                    // Manager private notes are intentionally excluded from worker view.
                    persistNotes({ managerPrivateNotes: latestManagerPrivateNotes });
                    setPrivateDirty(false);
                  }}
                >
                  {managerPrivateNotes}
                </div>
              </div>
            </div>

            {past && (
              <div className="notes-event past" id="evt-prev">
                <div className="when">{past.when}</div>
                <div className="notes-card">
                  <div className="nc-head">
                    <div className="lead"><span className="ms">groups</span>Shared Notes</div>
                    <div className="saved">Read-only<span className="ind" /></div>
                  </div>
                  <div className="editor-body" style={{ minHeight: 60 }}>{past.sharedNote}</div>
                  <div className="action-section">
                    <div className="h">Action Items</div>
                    {(past.actions || []).map(a => (
                      <div key={a.id} className={`action-row ${a.done ? 'done' : ''}`}>
                        <div className={`check-sq ${a.done ? 'done' : ''}`}>
                          {a.done && <span className="ms">check</span>}
                        </div>
                        <span className="text">{a.text}</span>
                        <span className="owner-chip">{a.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="notes-card private">
                  <div className="nc-head">
                    <div className="lead"><span className="ms">lock</span>Private Notes
                      <span className="meta"><span className="ms">visibility</span>Only visible to you</span>
                    </div>
                    <div className="saved">Read-only<span className="ind" /></div>
                  </div>
                  <div className="editor-body" style={{ minHeight: 60 }}>{past.privateNote}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: quick jump + linked context */}
          <div className="notes-side" style={{ position: 'sticky', top: 0 }}>
            <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
              <div className="h" style={{ marginTop: 0 }}>Sessions</div>
              <div className="item active"><span className="dot" />Today · 10:00 AM<span className="meta">Live</span></div>
              <div className="item"><span className="dot" />Mar 17<span className="meta">9d ago</span></div>
              <div className="item"><span className="dot" />Mar 10<span className="meta">16d ago</span></div>
              <div className="item"><span className="dot" />Mar 03<span className="meta">23d ago</span></div>
              <div className="item"><span className="dot" />Feb 24<span className="meta">30d ago</span></div>
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="h" style={{ marginTop: 0 }}>Linked</div>
              <div className="col gap-2">
                <Pill variant="contrib" icon="flag">Complete 6 migrations · 90%</Pill>
                <Pill variant="contractor" icon="rocket_launch">Payroll Migration EU · Done</Pill>
              </div>
              <Btn variant="text" size="sm" icon="add" style={{ marginTop: 8, padding: '4px 8px' }}>Link goal / project</Btn>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--grey-100)', fontSize: 11.5, color: 'var(--fg-secondary)', fontWeight: 600, lineHeight: 1.5 }}>
                <span className="ms" style={{ fontSize: 14, color: 'var(--brand-blue-500)', verticalAlign: '-2px', marginRight: 4 }}>summarize</span>
                Action items will be summarized into your follow-up list when you mark the meeting done.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable formatting toolbar matching the screenshot */
function EditorToolbar() {
  return (
    <div className="editor-toolbar">
      <button className="tb-btn" title="Toggle check"><span className="ms">check_circle</span></button>
      <button className="tb-btn" title="Insert action item"><span className="ms">check_box</span></button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Heading 1">H<span className="h-num">1</span></button>
      <button className="tb-btn" title="Heading 2">H<span className="h-num">2</span></button>
      <span className="tb-sep" />
      <button className="tb-btn active" style={{ fontWeight: 800 }} title="Bold">B</button>
      <button className="tb-btn" style={{ fontStyle: 'italic', fontWeight: 700 }} title="Italic">I</button>
      <button className="tb-btn" style={{ textDecoration: 'underline', fontWeight: 700 }} title="Underline">U</button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Numbered list"><span className="ms">format_list_numbered</span></button>
      <button className="tb-btn" title="Bulleted list"><span className="ms">format_list_bulleted</span></button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Link"><span className="ms">link</span></button>
      <button className="tb-btn" title="Mention"><span className="ms">alternate_email</span></button>
      <span className="tb-right">
        <button className="tb-btn" title="Smart assist" style={{ color: 'var(--brand-blue-500)' }}><span className="ms">lightbulb</span></button>
      </span>
    </div>
  );
}

window.MeetingNotesEditor = MeetingNotesEditor;
