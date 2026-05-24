/* Frame 3 — 1:1 Meetings (Client / Manager)
   Day-wise layout: Today, Tomorrow, This Week, Past Sessions.
   Each meeting card: worker, time, linked OKR/project, agenda, notes, action items. */

const { useState: useState11, useEffect: useEffect11 } = React;

// Resolved at runtime — defined in client-reviews.jsx which loads first
const CompensationConfigPanel = () => {
  const Panel = window.CompensationConfigPanel;
  return Panel ? React.createElement(Panel) : null;
};

function ClientMeetings() {
  const [openCard, setOpenCard] = useState11('m-now'); // which card has full notes expanded
  const [notesOpen, setNotesOpen] = useState11(null); // a meeting object when editor is open
  const [scheduleModal, setScheduleModal] = useState11(null); // null | { mode, meeting }
  const [storeVersion, setStoreVersion] = useState11(0);

  useEffect11(() => window.PerformanceStore.subscribe(() => setStoreVersion(v => v + 1)), []);

  const today = [];

  function meetingTimeParts(scheduledAt = '') {
    const match = String(scheduledAt).match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    return {
      time: match?.[1] || '9:30',
      ap: (match?.[2] || 'AM').toUpperCase(),
    };
  }

  const storeMeetings = window.PerformanceStore.getData().meetings.map(m => {
    const worker = window.PerformanceStore.workerById(m.workerId);
    const linkedGoals = (m.linkedGoalIds || []).map(id => window.PerformanceStore.getGoals().find(g => g.id === id)).filter(Boolean);
    const timeParts = meetingTimeParts(m.scheduledAt);
    return {
      id: m.id,
      storeMeeting: m,
      status: m.status === 'live' ? 'now' : m.status,
      time: timeParts.time,
      dur: '30 min',
      ap: timeParts.ap,
      worker: worker?.name || 'Worker',
      role: worker?.role || '',
      links: linkedGoals.map(goal => ({ kind: 'okr', label: goal.title })),
      agenda: m.agenda,
      prevNotes: m.sharedNotes,
      actionItems: (m.actionItems || []).filter(a => a.shared !== false),
    };
  });
  const visibleToday = storeMeetings.length ? storeMeetings : today;

  const tomorrow = [];
  const thisWeek = [];
  const past = [];

  return (
    <Shell persona="client" active="performance"
      crumb={['Acme Holdings', 'Performance', '1:1 Meetings']}>

      {notesOpen ? (
        <MeetingNotesEditor
          meetingId={notesOpen.storeMeeting?.id || notesOpen.id}
          worker={notesOpen.worker}
          role={notesOpen.role}
          initialSharedNotes={notesOpen.storeMeeting?.sharedNotes || notesOpen.prevNotes || ''}
          initialPrivateNotes={notesOpen.storeMeeting?.managerPrivateNotes || ''}
          initialActions={notesOpen.storeMeeting?.actionItems || notesOpen.actionItems}
          linked={notesOpen.links?.map(l => ({
            icon: l.kind === 'okr' ? 'flag' : l.kind === 'project' ? 'rocket_launch' : 'reviews',
            label: l.label,
          })) || []}
          onBack={() => setNotesOpen(null)}
        />
      ) : (<>

      {scheduleModal && (
        <ScheduleMeetingModal
          mode={scheduleModal.mode}
          meeting={scheduleModal.meeting}
          onCancel={() => setScheduleModal(null)}
          onSave={async (payload) => {
            try {
              if (scheduleModal.mode === 'edit' && scheduleModal.meeting?.storeMeeting) {
                await window.PerformanceStore.updateMeetingNotes(scheduleModal.meeting.storeMeeting.id, payload);
              } else {
                await window.PerformanceStore.createMeeting(payload);
              }
              setScheduleModal(null);
            } catch (e) {
              console.error('schedule meeting failed', e);
              alert(`Could not save meeting: ${e.message}`);
            }
          }}
        />
      )}

      <PerfTabs active="meetings" />

      <PageHead
        eyebrow="Performance Management"
        title="1:1 Meetings"
        sub="Run check-ins with your direct reports. Link notes to goals, projects, feedback, or reviews — convert action items into real follow-ups."
        actions={<>
          <Btn variant="primary" icon="add" onClick={() => setScheduleModal({ mode: 'create' })}>Schedule 1:1</Btn>
        </>}
      />

      {/* Top mini stats — derived from the store, not hardcoded */}
      {(() => {
        const allMeetings = window.PerformanceStore.getData().meetings || [];
        const allActions = allMeetings.flatMap(m => m.actionItems || []);
        const closed = allActions.filter(a => a.done).length;
        const total = allActions.length;
        return (
          <div className="stats-row c-3 mb-4">
            <StatCard tone="blue"   icon="event_available" label="1:1s today"           value={String(visibleToday.length)} sub={visibleToday.length ? 'Scheduled or live' : 'No 1:1s today'} />
            <StatCard tone="purple" icon="calendar_month"  label="This week"            value={String(allMeetings.length)}  sub={allMeetings.length ? 'Total scheduled' : 'Nothing scheduled'} />
            <StatCard tone="green"  icon="task_alt"        label="Action items closed"  value={total ? `${closed} / ${total}` : '0'} sub={total ? 'Across all meetings' : 'No items yet'} />
          </div>
        );
      })()}

      {/* Two-column: day-wise meeting list (left) + meeting detail (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Left — day-wise meetings */}
        <div>
          {/* Day · Today */}
          <div className="day-row" style={{ marginTop: 0 }}>
            <span className="label">Today</span>
            <span className="date">Wed, Mar 26 · 2026</span>
            <span className="count">{visibleToday.length} meetings</span>
            <span className="line" />
          </div>
          {visibleToday.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} onEdit={() => setScheduleModal({ mode: 'edit', meeting: m })} />)}

          {/* Day · Tomorrow */}
          <div className="day-row">
            <span className="label">Tomorrow</span>
            <span className="date">Thu, Mar 27</span>
            <span className="count">{tomorrow.length} meetings</span>
            <span className="line" />
          </div>
          {tomorrow.map(m => <MeetingCard key={m.id} m={m} selected={openCard === m.id} onSelect={() => setOpenCard(m.id)} onAddNotes={() => setNotesOpen(m)} onEdit={() => setScheduleModal({ mode: 'create' })} />)}

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
                    <td className="actions-cell">
                      <Btn variant="ghost" size="sm" icon="edit" onClick={() => setScheduleModal({ mode: 'create' })}>Edit</Btn>
                      <Btn variant="ghost" size="sm" icon="edit_note" onClick={() => setNotesOpen(m)}>Add notes</Btn>
                    </td>
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

        {/* Right — upcoming meets */}
        <UpcomingMeetings todayList={visibleToday} tomorrowList={tomorrow} weekList={thisWeek} onOpenNotes={setNotesOpen} />
      </div>
      </>)}
    </Shell>
  );
}

/* ----- Schedule / edit meeting modal ----- */
function ScheduleMeetingModal({ mode = 'create', meeting, onCancel, onSave }) {
  const workers = window.PerformanceStore.getWorkers();
  // Default to the first real worker in the org (cuid), not a hardcoded legacy id.
  const initialWorkerId = meeting?.storeMeeting?.workerId || workers[0]?.id || '';
  const today = new Date().toISOString().slice(0, 10);
  const [workerId, setWorkerId] = useState11(initialWorkerId);
  const [date, setDate] = useState11(meeting?.storeMeeting?.scheduledDate || today);
  const [time, setTime] = useState11(meeting?.time || '10:00');
  const [ampm, setAmpm] = useState11(meeting?.ap || 'AM');
  const [agendaText, setAgendaText] = useState11((meeting?.storeMeeting?.agenda || meeting?.agenda || ['Goal check-in']).join('\n'));
  const [linkedGoalId, setLinkedGoalId] = useState11(meeting?.storeMeeting?.linkedGoalIds?.[0] || '');
  const selectedWorker = workers.find(w => w.id === workerId) || workers[0];
  const workerGoals = workerId ? window.PerformanceStore.getGoalsForWorker(workerId) : [];

  function toIsoDateTime(d, t, ap) {
    // Convert "10:00 AM" / "2:30 PM" → 24h then build an ISO string.
    const m = String(t || '').match(/^(\d{1,2}):(\d{2})/);
    if (!m) return new Date(`${d}T09:00:00`).toISOString();
    let hh = Number(m[1]);
    const mm = m[2];
    if (ap === 'PM' && hh < 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return new Date(`${d}T${String(hh).padStart(2,'0')}:${mm}:00`).toISOString();
  }

  function save() {
    if (!workerId) { alert('Pick a worker'); return; }
    const agenda = agendaText.split('\n').map(item => item.trim()).filter(Boolean);
    onSave({
      workerId,
      title: `1:1 with ${selectedWorker?.name || 'Worker'}`,
      scheduledDate: date,
      scheduledAt: toIsoDateTime(date, time, ampm),
      status: meeting?.storeMeeting?.status || 'scheduled',
      agenda,
      linkedGoalIds: linkedGoalId ? [linkedGoalId] : [],
      linkedKeyResultIds: [],
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620,
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--grey-800)' }}>{mode === 'edit' ? 'Edit 1:1' : 'Schedule 1:1'}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 3 }}>Select worker, date, time, linked goal, and agenda.</div>
          </div>
          <IconBtn icon="close" title="Close" onClick={onCancel} />
        </div>

        <div style={{ padding: 22, display: 'grid', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Worker</div>
            <select value={workerId} onChange={e => { setWorkerId(e.target.value); setLinkedGoalId(''); }}
              style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} · {w.role}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Time</div>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Period</div>
              <select value={ampm} onChange={e => setAmpm(e.target.value)}
                style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Linked goal</div>
            <select value={linkedGoalId} onChange={e => setLinkedGoalId(e.target.value)}
              style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
              <option value="">No linked goal</option>
              {workerGoals.map(goal => <option key={goal.id} value={goal.id}>{goal.title} · {goal.progress}%</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg-secondary)', marginBottom: 6 }}>Agenda</div>
            <textarea value={agendaText} onChange={e => setAgendaText(e.target.value)}
              placeholder="One agenda item per line"
              style={{ width: '100%', minHeight: 110, border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" icon={mode === 'edit' ? 'save' : 'event'} onClick={save}>{mode === 'edit' ? 'Save changes' : 'Schedule'}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ----- Meeting card (left rail) ----- */
function MeetingCard({ m, selected, onSelect, onAddNotes, onEdit }) {
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
            <Btn variant="ghost" size="sm" icon="edit" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }}>Edit</Btn>
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

/* ----- Upcoming meets (right panel) — capped at 5 ----- */
function UpcomingMeetings({ todayList, tomorrowList, weekList, onOpenNotes }) {
  const MAX = 5;
  const all = [
    ...todayList
      .filter(m => m.status !== 'now' && m.status !== 'past')
      .map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: 'Today', subLabel: 'Wed, Mar 26', time: m.time, ap: m.ap, raw: m })),
    ...tomorrowList.map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: 'Tomorrow', subLabel: 'Thu, Mar 27', time: m.time, ap: m.ap, raw: m })),
    ...weekList.map(m => ({ id: m.id, worker: m.worker, agenda: m.agenda, dateLabel: m.day, subLabel: m.date, time: m.time, ap: m.ap, raw: m })),
  ];
  const items = all.slice(0, MAX);
  const more = Math.max(0, all.length - items.length);

  function agendaLine(a) {
    if (!a) return '';
    return Array.isArray(a) ? a[0] : a;
  }

  return (
    <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
      <div className="card-head" style={{ paddingBottom: 10 }}>
        <div>
          <div className="title row items-center gap-2">
            <span className="ms" style={{ color: 'var(--brand-blue-500)' }}>event_upcoming</span>
            Upcoming meets
          </div>
          <div className="sub">Next {items.length} of {all.length} scheduled</div>
        </div>
      </div>

      <div>
        {items.map((m, idx) => (
          <div
            key={m.id}
            onClick={() => onOpenNotes && onOpenNotes(m.raw)}
            style={{
              display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center',
              padding: '12px 18px',
              borderTop: '1px solid var(--grey-50)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '6px 4px',
              background: 'var(--brand-blue-100)',
              borderRadius: 8,
              color: 'var(--brand-blue-600)',
              lineHeight: 1.05,
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.dateLabel}</div>
              <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{m.time}</div>
              <div style={{ fontSize: 9.5, fontWeight: 800 }}>{m.ap}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row items-center gap-2" style={{ marginBottom: 2 }}>
                <Avatar name={m.worker} size="xs" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.worker}</span>
              </div>
              <div style={{
                fontSize: 11.5, color: 'var(--grey-700)', lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {agendaLine(m.agenda)}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: '22px 18px', fontSize: 12.5, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            No upcoming meetings.
          </div>
        )}
        {more > 0 && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--grey-50)', fontSize: 11.5, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            +{more} more in the schedule below
          </div>
        )}
      </div>
    </div>
  );
}

window.ClientMeetings = ClientMeetings;
