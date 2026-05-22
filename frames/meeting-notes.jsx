/* 1:1 Meeting notes editor — rich takeover modeled on the screenshot.
   Two cards per meeting timeline entry: Shared Notes (yellow accent) +
   Private Notes (red accent), each with a formatting toolbar and an Action
   Items section. Prior meetings show as additional events on the rail. */

const { useState: useStateNE } = React;

function MeetingNotesEditor({ worker = 'Aditi Sharma', role = 'Senior Ops · weekly', linked = [], onBack }) {
  const [actions, setActions] = useStateNE([
    { id: 'a1', text: 'Share v2 migration runbook with Aditi',         done: true,  owner: 'P' },
    { id: 'a2', text: 'Confirm Aditi shadows Lina on Spain kickoff',   done: true,  owner: 'P' },
    { id: 'a3', text: 'Draft career-ladder doc for Lead Ops by Apr 5', done: false, owner: 'P', due: 'Apr 5' },
  ]);

  const toggle = id => setActions(actions.map(a => a.id === id ? { ...a, done: !a.done } : a));

  /* ===== Past meeting (read-only style) ===== */
  const past = {
    when: 'Mar 17 · 11:00 AM',
    sharedNote: 'Set Q3 goals: 6 migrations, mentor Lina, and one knowledge-share talk. Aditi noted runbook gaps from the Italy cutover.',
    privateNote: 'Watch for over-commitment — Aditi tends to absorb scope. Encourage her to delegate the cutover-day playbook to Lina.',
    actions: [
      { id: 'p1', text: 'Pair on cutover-day playbook with Lina', done: true,  owner: 'A' },
      { id: 'p2', text: 'File JIRA tickets for the runbook gaps', done: true,  owner: 'A' },
    ],
  };

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
          <Btn variant="ghost" icon="auto_awesome">AI summary</Btn>
          <Btn variant="ghost" icon="rate_review">Send to review</Btn>
          <Btn variant="ghost" icon="forum">Convert to feedback</Btn>
          <Btn variant="primary" icon="check">Done</Btn>
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
                    Saved at 10:23 AM
                    <span className="ind" />
                    <button className="help-i" title="Formatting help"><span className="ms">help</span></button>
                  </div>
                </div>
                <EditorToolbar />
                <div className="editor-body" data-placeholder="Start writing shared notes…">
                  <div>Migration wrapped clean — Aditi led the Spain cutover with zero P0s. Customer signed a 3-year renewal the same week.</div>
                  <div style={{ marginTop: 8 }}>Q4 priorities discussed: pick up Brazil + take Lina as a shadow. Aditi wants to formalize her Lead Ops path.</div>
                  <div className="ai-prompt">
                    <span className="ms" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4, color: 'var(--brand-purple-500)' }}>auto_awesome</span>
                    AI suggests linking this note to her OKR <strong>"Complete 6 migrations"</strong> — it's 90% done.
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
                    <span style={{ color: 'var(--warning-dark)', fontWeight: 600 }}>Editing…</span>
                    <span className="ind unsaved" />
                  </div>
                </div>
                <EditorToolbar />
                <div className="editor-body" data-placeholder="Private thoughts — only you can see these…">
                  Consider Aditi for a promotion case in Q4 — she's outpacing the Lead Ops ladder. Sync with Hannah before raising it.
                </div>
              </div>
            </div>

            {/* ====== Previous meeting (read-only) ====== */}
            <div className="notes-event past" id="evt-prev">
              <div className="when">{past.when}</div>

              <div className="notes-card">
                <div className="nc-head">
                  <div className="lead"><span className="ms">groups</span>Shared Notes</div>
                  <div className="saved">Read-only · 9 days ago<span className="ind" /></div>
                </div>
                <div className="editor-body" style={{ minHeight: 60 }}>{past.sharedNote}</div>
                <div className="action-section">
                  <div className="h">Action Items</div>
                  {past.actions.map(a => (
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

            {/* New meeting placeholder */}
            <div className="notes-event past">
              <div className="when" style={{ color: 'var(--fg-disabled)' }}>
                <span className="ms" style={{ fontSize: 16 }}>history</span>
                Older sessions (3 more) — scroll up to load
              </div>
            </div>
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
                <span className="ms" style={{ fontSize: 14, color: 'var(--brand-purple-500)', verticalAlign: '-2px', marginRight: 4 }}>auto_awesome</span>
                AI will summarize action items into your follow-up list when you mark the meeting done.
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
        <button className="tb-btn" title="AI assist" style={{ color: 'var(--brand-purple-500)' }}><span className="ms">auto_awesome</span></button>
      </span>
    </div>
  );
}

window.MeetingNotesEditor = MeetingNotesEditor;
