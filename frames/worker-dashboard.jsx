/* Frame · Worker Performance Dashboard (simplified)
   Persona: Aditi Sharma (worker). Self-service view only.
   Strips back to the essentials: 4 KPIs, self-review prompt, today's 1:1,
   feedback received, and the "what I can't see" transparency strip. */

function WorkerDashboard() {
  const kpis = [
    { tone: 'green',  icon: 'flag',           label: 'My active goals',     value: '4',  trend: { dir: 'up', text: '+1' }, sub: '2 owner · 1 contributor · 1 stakeholder' },
    { tone: 'blue',   icon: 'event_available',label: 'Upcoming 1:1s',       value: '3',  sub: 'Next: today at 10:00 with Priya' },
    { tone: 'pink',   icon: 'inbox',          label: 'Feedback received',   value: '12', trend: { dir: 'up', text: '+5' }, sub: 'Last 30 days · 9 positive · 3 dev' },
    { tone: 'amber',  icon: 'rate_review',    label: 'Pending self-review', value: '1',  sub: 'Q3 cycle · due Sep 30' },
  ];

  const feedback = [
    { from: 'Priya Nair', role: 'Manager', when: '2h ago', type: 'project',
      text: "Aditi led the Spain cutover flawlessly — zero P0s, customer signed a 3-year renewal the same week. She's ready to take on the next anchor migration as lead." },
    { from: 'Karim Idris', role: 'Peer', when: 'Yesterday', type: 'recognition',
      text: 'Thanks for jumping into the KYB blocker on Friday — you saved Omar a week of waiting. ⭐' },
    { from: 'Marco Diaz', role: 'Client', when: '1w ago', type: 'project',
      text: "Aditi's communication during cutover was the difference between a hard week and a smooth one." },
  ];

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'My dashboard']}>

      <PerfTabs variant="worker" active="dashboard" />

      <PageHead
        eyebrow="My performance"
        title="Hi Aditi 👋"
        sub="Your goals, feedback, 1:1s and reviews at a glance. Your self-review for Q3 is due Sep 30."
        actions={<>
          <Btn variant="ghost" icon="add_reaction">Request feedback</Btn>
          <Btn variant="primary" icon="rate_review">Start self-review</Btn>
        </>}
      />

      <div className="mb-4">
        <Callout tone="success" icon="verified_user"
          title="This is your private workspace"
          action={<Btn variant="text" size="sm" iconTrailing="open_in_new">What I can see</Btn>}>
          You only see your own goals, feedback, reviews and 1:1s. Compensation insights for other workers and manager private notes are not visible to you.
        </Callout>
      </div>

      {/* 4 KPIs */}
      <div className="stats-row c-4 mb-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* Self-review prompt + Today's 1:1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #FFFAEB 0%, #FFFFFF 60%)', border: '1px solid #FFE3A5' }}>
          <div style={{ padding: '20px 24px' }}>
            <div className="row items-center gap-3 mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warning-bg)', color: 'var(--warning-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="ms" style={{ fontSize: 22 }}>rate_review</span>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Action needed</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em' }}>Your Q3 self-review is due in 4 days</div>
              </div>
              <Pill variant="warning" dot>Due Sep 30</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.5, marginBottom: 14 }}>
              Reflect on your goals, projects shipped, and growth areas. Your draft auto-saves and you can attach feedback from peers and managers.
            </div>
            <div className="row gap-2">
              <Btn variant="primary" icon="play_arrow">Continue self-review</Btn>
              <Btn variant="ghost" icon="schedule">Remind me tomorrow</Btn>
            </div>
          </div>
        </div>

        <SectionCard
          title="My next 1:1"
          sub="Today · 10:00 AM"
          icon="event"
          action={<Btn variant="primary" size="sm" icon="edit_note">Take notes</Btn>}
        >
          <div className="row items-center gap-3 mb-3">
            <Avatar name="Priya Nair" size="lg" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--grey-700)' }}>Priya Nair</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>Manager · weekly 1:1</div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Shared agenda</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--grey-700)', lineHeight: 1.6 }}>
            <li>Wrap-up of Payroll Migration EU and what went well</li>
            <li>Q4 priorities — which migrations to take on next</li>
            <li>Career growth — Lead Ops path</li>
          </ol>
          <Btn variant="text" size="sm" icon="add" style={{ marginTop: 8 }}>Add an agenda item</Btn>
        </SectionCard>
      </div>

      {/* Recent feedback received */}
      <SectionCard
        title="Feedback I've received"
        sub="Latest from managers, peers and clients"
        icon="inbox"
        action={<Btn variant="text" size="sm" iconTrailing="arrow_forward">View all</Btn>}
      >
        <div className="col gap-3">
          {feedback.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px',
              background: f.type === 'recognition' ? 'var(--success-bg)' : '#F4FAFE',
              borderRadius: 10, border: '1px solid ' + (f.type === 'recognition' ? 'var(--brand-green-200)' : 'var(--brand-blue-200)') }}>
              <Avatar name={f.from} size="md" />
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="row items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)' }}>{f.from}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>· {f.role}</span>
                  <Pill variant={f.type === 'project' ? 'contractor' : f.type === 'recognition' ? 'eligible' : 'employee'}
                    icon={f.type === 'project' ? 'rocket_launch' : f.type === 'recognition' ? 'celebration' : 'forum'}>
                    {f.type === 'project' ? 'Project feedback' : f.type === 'recognition' ? 'Recognition' : 'Goal feedback'}
                  </Pill>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>{f.when}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--grey-700)', lineHeight: 1.55 }}>{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Transparency strip */}
      <div className="card mt-4" style={{ background: 'var(--grey-50)', borderStyle: 'dashed' }}>
        <div style={{ padding: '14px 20px' }}>
          <div className="row items-center gap-3 mb-2">
            <span className="ms" style={{ fontSize: 22, color: 'var(--fg-disabled)' }}>visibility_off</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--grey-700)' }}>Things I can't see in this view</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)' }}>Designed to keep things fair and private.</div>
            </div>
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap', paddingLeft: 34 }}>
            <Pill variant="draft" icon="lock">Other workers' OKRs</Pill>
            <Pill variant="draft" icon="lock">Manager private notes</Pill>
            <Pill variant="draft" icon="lock">Compensation insights for others</Pill>
          </div>
        </div>
      </div>
    </Shell>
  );
}

window.WorkerDashboard = WorkerDashboard;
