/* Frame 3 — 1:1 Meetings (Client / Manager)
   Day-wise layout: Today, Tomorrow, This Week, Past Sessions.
   Each meeting card: worker, time, linked OKR/project, agenda, notes, action items. */

const { useState: useState11 } = React;

function ClientMeetings() {
  const [openCard, setOpenCard] = useState11('m-now'); // which card has full notes expanded
  const [notesOpen, setNotesOpen] = useState11(null); // a meeting object when editor is open

  const today = [
    {
      id: 'm-now', status: 'now', time: '10:00', dur: '30 min', ap: 'AM',
      worker: 'Aditi Sharma', role: 'Senior Ops',
      links: [
        { kind: 'okr', label: 'Complete 6 migrations' },
        { kind: 'project', label: 'Payroll Migration EU' },
      ],
      agenda: [
        'Wrap-up of Payroll Migration EU and what went well',
        'Q4 priorities — which migrations to take on next',
        'Career growth conversation: path to Lead Ops',
      ],
      prevNotes: 'Discussed onboarding the Spain client. Aditi wants more visibility into the migration playbook gaps. Owe her: link to the new runbook.',
      actionItems: [
        { done: true,  text: 'Share v2 migration runbook',        owner: 'Priya' },
        { done: true,  text: 'Confirm Aditi shadows Lina on a kickoff', owner: 'Priya' },
        { done: false, text: 'Draft career-ladder doc for Lead Ops',    owner: 'Priya' },
      ],
    },
    {
      id: 'm-2', status: 'upcoming', time: '2:00', dur: '30 min', ap: 'PM',
      worker: 'Omar Khan', role: 'Vendor Lead',
      links: [{ kind: 'okr', label: 'Reduce vendor setup time' }],
      agenda: [
        'Vendor automation KR — why we slipped to 45%',
        'Unblock the KYB review API integration',
      ],
      flag: { kind: 'at-risk', text: 'OKR at risk · 45%' },
    },
    {
      id: 'm-3', status: 'upcoming', time: '4:30', dur: '20 min', ap: 'PM',
      worker: 'Diego Alvarez', role: 'Senior Engineer',
      links: [
        { kind: 'project', label: 'Comms Unification' },
        { kind: 'review', label: 'Q3 self-review draft' },
      ],
      agenda: ['Review of Q3 self-review draft', 'Calibration for Q3 cycle'],
    },
  ];

  const tomorrow = [
    {
      id: 'm-4', status: 'upcoming', time: '9:30', dur: '30 min', ap: 'AM',
      worker: 'Lina Chen', role: 'Onboarding Mgr',
      links: [
        { kind: 'project', label: 'Client Onboarding Q3' },
        { kind: 'okr', label: 'Onboarding quality 4.6' },
      ],
      agenda: ['Self-review submission unblockers', 'Q3 onboarding NPS dip'],
    },
    {
      id: 'm-5', status: 'upcoming', time: '3:00', dur: '45 min', ap: 'PM',
      worker: 'Karim Idris', role: 'Customer Success',
      links: [{ kind: 'okr', label: 'CS self-serve playbooks' }],
      agenda: ['Self-serve playbook progress', 'PIP touchpoint — month 1 check-in'],
      flag: { kind: 'warning', text: 'PIP check-in' },
    },
  ];

  const thisWeek = [
    { id: 'tw-1', day: 'Thu', date: 'Mar 27',  time: '11:00', ap: 'AM', worker: 'Hannah Mueller', role: 'Compliance', agenda: 'Career goal alignment', links: [{ kind: 'okr', label: 'Compliance OKR alignment' }] },
    { id: 'tw-2', day: 'Thu', date: 'Mar 27',  time: '3:30',  ap: 'PM', worker: 'Diego Alvarez',  role: 'Senior Engineer', agenda: 'Mid-cycle calibration', links: [{ kind: 'review', label: 'Mid-cycle review' }] },
    { id: 'tw-3', day: 'Fri', date: 'Mar 28',  time: '10:30', ap: 'AM', worker: 'Aditi Sharma',   role: 'Senior Ops', agenda: 'Project handoff retro', links: [{ kind: 'project', label: 'Payroll Migration EU retro' }] },
  ];

  const past = [
    { id: 'p-1', when: 'Mar 17, 2026', worker: 'Aditi Sharma',  topic: 'Q3 goals kickoff',     notesLine: 'Set goals: 6 migrations, mentor Lina. Action items: 2 / 2 complete.' },
    { id: 'p-2', when: 'Mar 15, 2026', worker: 'Omar Khan',     topic: 'Vendor OKR check-in',  notesLine: 'Vendor automation blocked on KYB API. Escalation to platform team logged.', flag: 'follow-up' },
    { id: 'p-3', when: 'Mar 12, 2026', worker: 'Lina Chen',     topic: 'Onboarding feedback',  notesLine: 'Onboarding doc gaps surfaced. Next: pair with content lead.' },
  ];

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', '1:1 Meetings']}>

      {notesOpen ? (
        <MeetingNotesEditor
          worker={notesOpen.worker}
          role={notesOpen.role}
          linked={notesOpen.links?.map(l => ({
            icon: l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews',
            label: l.label,
          })) || []}
          onBack={() => setNotesOpen(null)}
        />
      ) : (<>

      <PerfTabs active="meetings" />

      <PageHead
        eyebrow="Performance Management"
        title="1:1 Meetings"
        sub="Run check-ins with your direct reports. Link notes to goals, projects, feedback, or reviews — convert action items into real follow-ups."
        actions={<>
          <Btn variant="ghost" icon="bookmark">Templates</Btn>
          <Btn variant="ghost" icon="event_repeat">Recurring</Btn>
          <Btn variant="primary" icon="add">Schedule 1:1</Btn>
        </>}
      />

      {/* Top mini stats */}
      <div className="stats-row c-4 mb-4">
        <StatCard tone="blue"   icon="event_available" label="1:1s today"          value="3"  sub="2 upcoming · 1 live now" />
        <StatCard tone="purple" icon="calendar_month"  label="This week"            value="11" sub="Across 5 direct reports" />
        <StatCard tone="amber"  icon="schedule"        label="Notes pending sync"   value="4"  sub="Draft → goal / project" />
        <StatCard tone="green"  icon="task_alt"        label="Action items closed"  value="18" sub="this month · 87% on-time" />
      </div>

      {/* Two-column: day-wise meeting list (left) + meeting detail (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Left — day-wise meetings */}
        <div>
          {/* Day · Today */}
          <div className="day-row" style={{ marginTop: 0 }}>
            <span className="label">Today</span>
            <span className="date">Wed, Mar 26 · 2026</span>
            <span className="count">{today.length} meetings</span>
            <span className="line" />
          </div>
          {today.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} />)}

          {/* Day · Tomorrow */}
          <div className="day-row">
            <span className="label">Tomorrow</span>
            <span className="date">Thu, Mar 27</span>
            <span className="count">{tomorrow.length} meetings</span>
            <span className="line" />
          </div>
          {tomorrow.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} />)}

          {/* Day · This week */}
          <div className="day-row">
            <span className="label">Rest of this week</span>
            <span className="date">Mar 27–29</span>
            <span className="count">{thisWeek.length} meetings</span>
            <span className="line" />
          </div>
          <div className="tbl-card">
            <table className="tbl">
              <thead><tr><th>When</th><th>Worker</th><th>Agenda</th><th /></tr></thead>
              <tbody>
                {thisWeek.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--grey-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.day} · {m.date}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-secondary)', fontWeight: 600, marginTop: 2 }}>{m.time} {m.ap}</div>
                    </td>
                    <td>
                      <div className="worker-cell">
                        <Avatar name={m.worker} size="sm" />
                        <div>
                          <div className="name">{m.worker}</div>
                          <div className="role">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: 'var(--grey-700)' }}>{m.agenda}</span></td>
                    <td className="actions-cell"><Btn variant="ghost" size="sm" icon="edit_note" onClick={() => setNotesOpen(m)}>Add notes</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Past sessions */}
          <div className="day-row">
            <span className="label">Past sessions</span>
            <span className="date">Last 30 days</span>
            <span className="count">42 meetings</span>
            <span className="line" />
          </div>
          <div className="tbl-card">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Worker</th><th>Topic</th><th>Notes summary</th><th /></tr></thead>
              <tbody>
                {past.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-700)' }}>{p.when}</span></td>
                    <td>
                      <div className="worker-cell"><Avatar name={p.worker} size="sm" /><span className="name">{p.worker}</span></div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.topic}</span>
                      {p.flag === 'follow-up' && <Pill variant="warning" style={{ marginLeft: 8 }} icon="schedule">Follow-up</Pill>}
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{p.notesLine}</span></td>
                    <td className="actions-cell"><Btn variant="ghost" size="sm" icon="open_in_new">Open</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — detail panel for selected meeting */}
        <MeetingDetail meeting={today[0]} onOpenNotes={() => setNotesOpen(today[0])} />
      </div>
      </>)}
    </Shell>
  );
}

/* ----- Meeting card (left rail) ----- */
function MeetingCard({ m, selected, onSelect, onAddNotes }) {
  return (
    <div className={`meeting ${m.status === 'now' ? 'now' : m.status === 'past' ? 'past' : 'upcoming'}`}
      style={selected ? { borderColor: 'var(--brand-blue-500)', boxShadow: '0 0 0 3px var(--brand-blue-100)' } : undefined}
      onClick={onSelect}
    >
      <div className="when">
        <div className="time">{m.time}</div>
        <div className="ap">{m.ap}</div>
        <div className="dur">{m.dur}</div>
      </div>
      <div className="b">
        <div className="top">
          <div className="who">
            <Avatar name={m.worker} size="md" />
            <div>
              <div className="name">{m.worker}</div>
              <div className="role">{m.role}</div>
            </div>
          </div>
          <div className="actions">
            {m.status === 'now' && <Pill variant="active" dot>Live now</Pill>}
            {m.flag?.kind === 'at-risk' && <Pill variant="at-risk" dot>{m.flag.text}</Pill>}
            {m.flag?.kind === 'warning' && <Pill variant="warning" icon="flag">{m.flag.text}</Pill>}
            <Btn variant={m.status === 'now' ? 'primary' : 'outlined'} size="sm" icon="edit_note" onClick={(e) => { e.stopPropagation(); onAddNotes && onAddNotes(); }}>
              {m.status === 'now' ? 'Take notes' : 'Add notes'}
            </Btn>
          </div>
        </div>
        <div className="agenda">
          <strong style={{ color: 'var(--grey-700)', fontWeight: 700 }}>Agenda · </strong>
          {Array.isArray(m.agenda) ? m.agenda.slice(0, 2).join(' · ') : m.agenda}
        </div>
      </div>
    </div>
  );
}

/* ----- Meeting detail (right panel) ----- */
function MeetingDetail({ meeting, onOpenNotes }) {
  return (
    <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
      <div className="card-head">
        <div>
          <div className="title row items-center gap-2">
            <span className="ms" style={{ color: 'var(--brand-blue-500)' }}>event</span>
            1:1 with {meeting.worker}
          </div>
          <div className="sub">Wed Mar 26 · 10:00 AM · live now</div>
        </div>
        <Btn variant="primary" size="sm" icon="edit_note" onClick={onOpenNotes}>Take notes</Btn>
      </div>

      <div style={{ padding: '14px 18px 4px' }}>
        <Callout tone="purple" icon="auto_awesome">
          <strong>AI prep summary</strong> · Aditi's OKR is 90% complete — strong project quarter. Last 1:1 you owed her a runbook link. Consider acknowledging the migration win and aligning Q4 priorities.
        </Callout>
      </div>

      {/* Linked context */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Linked to</div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <Pill variant="contrib" icon="flag">Complete 6 migrations · 90%</Pill>
          <Pill variant="contractor" icon="rocket_launch">Payroll Migration EU · Done</Pill>
          <Btn variant="text" size="sm" icon="add">Link more</Btn>
        </div>
      </div>

      {/* Agenda */}
      <div style={{ padding: '18px 18px 0' }}>
        <div className="row items-center between mb-2">
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agenda · shared</div>
          <Btn variant="text" size="sm" icon="add">Add item</Btn>
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.7 }}>
          {meeting.agenda.map((a, i) => <li key={i}>{a}</li>)}
        </ol>
      </div>

      {/* Notes panel */}
      <div style={{ padding: '18px 18px 0' }}>
        <div className="row items-center between mb-2">
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shared notes</div>
          <span className="row gap-2 items-center" style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>
            <span className="ms" style={{ fontSize: 13 }}>visibility</span>Visible to {meeting.worker.split(' ')[0]}
          </span>
        </div>
        <div style={{ background: 'var(--grey-50)', border: '1px solid var(--grey-100)', borderRadius: 8,
          padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--grey-700)', minHeight: 70 }}>
          <em style={{ color: 'var(--fg-secondary)' }}>
            Started writing… "Migration wrapped clean — Aditi led the cutover with zero P0s. She's ready to mentor Lina on the next Spain rollout."
          </em>
        </div>
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        <div className="row items-center between mb-2">
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Private notes · only you</div>
        </div>
        <div style={{ background: '#FFFAEB', border: '1px solid #FFE3A5', borderRadius: 8,
          padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--grey-700)', minHeight: 44 }}>
          <em style={{ color: 'var(--warning-dark)' }}>Consider Aditi for a promotion case in Q4 — she's outpacing the Lead Ops ladder.</em>
        </div>
      </div>

      {/* Action items */}
      <div style={{ padding: '18px 18px 0' }}>
        <div className="row items-center between mb-2">
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action items</div>
          <Btn variant="text" size="sm" icon="add">Add</Btn>
        </div>
        <div className="col gap-2">
          {meeting.actionItems.map((a, i) => (
            <div key={i} className="row items-center gap-3" style={{ padding: '8px 10px', background: a.done ? 'var(--success-bg)' : '#fff',
              border: '1px solid ' + (a.done ? 'var(--brand-green-200)' : 'var(--grey-100)'), borderRadius: 8 }}>
              <span className="ms" style={{ fontSize: 18, color: a.done ? 'var(--success-main)' : 'var(--grey-300)' }}>
                {a.done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div className="flex-1" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--grey-700)',
                textDecoration: a.done ? 'line-through' : 'none', opacity: a.done ? 0.7 : 1 }}>
                {a.text}
              </div>
              <Avatar name={a.owner} size="xs" />
            </div>
          ))}
        </div>
      </div>

      {/* Convert to feedback */}
      <div style={{ padding: '16px 18px 18px', marginTop: 16, borderTop: '1px solid var(--grey-100)' }}>
        <div className="row gap-2">
          <Btn variant="purple" size="sm" icon="forum">Convert note to feedback</Btn>
          <Btn variant="ghost"  size="sm" icon="reviews">Send to review</Btn>
        </div>
      </div>
    </div>
  );
}

window.ClientMeetings = ClientMeetings;
