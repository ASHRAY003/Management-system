/* Frame 4 — Internal Admin Performance Dashboard (simplified)
   Payoneer internal Performance Ops. Purpose: list clients, pick one,
   view that client's workspace as a logged read-only impersonation.
   No AI bias / contractor risk / interventions / pending reviews surfaces. */

const { useState: useStateAdmin } = React;

function AdminDashboard() {
  const [impersonate, setImpersonate] = useStateAdmin(null); // { name, view }

  // ----- summary KPIs -----
  const kpis = [
    { tone: 'purple', icon: 'apartment',     label: 'Active clients',           value: '47',    trend: { dir: 'up', text: '+3' },  sub: 'Using Performance module' },
    { tone: 'blue',   icon: 'flag',          label: 'Goals across all clients', value: '1,284', trend: { dir: 'up', text: '+186' },sub: '942 individual · 218 team · 124 company' },
    { tone: 'green',  icon: 'task_alt',      label: 'Goals on track',           value: '71%',   trend: { dir: 'up', text: '+5%' }, sub: '912 of 1,284 healthy' },
    { tone: 'teal',   icon: 'rocket_launch', label: 'Linked projects',          value: '418',   trend: { dir: 'up', text: '+42' }, sub: 'Across all client workspaces' },
  ];

  // ----- clients (Performance-enabled accounts) -----
  const clients = [
    { name: 'Acme Holdings',       plan: 'Enterprise', workers: 142, goals: 42,  onTrack: 76, projects: 31, since: 'Jan 2024' },
    { name: 'Brightline Energy',   plan: 'Enterprise', workers: 89,  goals: 28,  onTrack: 64, projects: 18, since: 'May 2024' },
    { name: 'Nimbus Studios',      plan: 'Growth',     workers: 54,  goals: 21,  onTrack: 42, projects: 12, since: 'Aug 2025' },
    { name: 'Pacific Foods',       plan: 'Enterprise', workers: 211, goals: 58,  onTrack: 81, projects: 47, since: 'Nov 2023' },
    { name: 'Vela Robotics',       plan: 'Growth',     workers: 36,  goals: 14,  onTrack: 28, projects: 9,  since: 'Feb 2026' },
    { name: 'Linden & Park',       plan: 'Enterprise', workers: 124, goals: 36,  onTrack: 79, projects: 22, since: 'Apr 2024' },
    { name: 'Tessera Logistics',   plan: 'Enterprise', workers: 184, goals: 51,  onTrack: 68, projects: 38, since: 'Jul 2024' },
    { name: 'Northwind Outdoors',  plan: 'Growth',     workers: 41,  goals: 16,  onTrack: 55, projects: 7,  since: 'Oct 2025' },
  ];

  // ----- a cross-client goals overview (read-only sample) -----
  const goals = [
    { client: 'Acme Holdings',     scope: 'Company',    title: 'Make Acme the #1 payroll platform for remote teams',   owner: 'Erika Voss',     pct: 64, due: 'Dec 31, 2026' },
    { client: 'Pacific Foods',     scope: 'Company',    title: 'Achieve 99.9% on-time pallet delivery by Q4',          owner: 'Alex Roy',       pct: 81, due: 'Dec 15, 2026' },
    { client: 'Brightline Energy', scope: 'Team',       title: 'Reduce battery production line defects under 1.5%',    owner: 'Mira Khanna',    pct: 58, due: 'Sep 30, 2026' },
    { client: 'Acme Holdings',     scope: 'Team',       title: 'Ship the unified Payroll + Performance suite',         owner: 'David Park',     pct: 48, due: 'Oct 31, 2026' },
    { client: 'Nimbus Studios',    scope: 'Individual', title: 'Onboard 25 new content creators to v2 portal',         owner: 'Theo Park',      pct: 35, due: 'Nov 30, 2026' },
    { client: 'Pacific Foods',     scope: 'Team',       title: 'Cut customer onboarding from 21d to 14d',              owner: 'Yusuf Ahmadi',   pct: 72, due: 'Oct 30, 2026' },
    { client: 'Vela Robotics',     scope: 'Company',    title: 'Reach $10M ARR with the new robotics arm SKU',         owner: 'Maya Iyer',      pct: 28, due: 'Dec 31, 2026' },
    { client: 'Linden & Park',     scope: 'Individual', title: 'Open 4 new regional offices in EMEA',                  owner: 'Sofia Beltran',  pct: 67, due: 'Q4 2026' },
  ];

  // ----- IMPERSONATION MODE -----
  // When admin clicks a client, render that client's actual dashboard inside an
  // impersonation banner. We reuse the existing ClientDashboard component.
  if (impersonate) {
    const ClientView =
      impersonate.view === 'okrs'     ? ClientOKRs :
      impersonate.view === 'meetings' ? ClientMeetings :
      ClientDashboard;

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ImpersonationBanner
          clientName={impersonate.name}
          onExit={() => setImpersonate(null)}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <ClientView />
        </div>
      </div>
    );
  }

  // ----- NORMAL ADMIN VIEW -----
  return (
    <Shell persona="admin" active="admin-overview"
      crumb={['Payoneer Internal', 'Performance', 'Overview']}>

      <PageHead
        eyebrow="Internal Admin · Performance"
        title="Performance overview"
        sub="Browse client accounts using Performance, see goals across the network, and click any client to view their workspace as them."
        actions={<>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="ghost" icon="public">All clients view</Btn>
        </>}
      />

      <div className="mb-4">
        <Callout tone="purple" icon="shield_person"
          title="Internal Performance Ops view"
          action={<Btn variant="ghost" size="sm" icon="open_in_new">Audit log</Btn>}>
          You can browse aggregate metrics across all clients on Performance, and open any client's workspace to view what their HR admin sees. All access is logged.
        </Callout>
      </div>

      {/* 4 simple KPIs */}
      <div className="stats-row c-4 mb-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {/* Clients picker */}
      <div className="mb-4">
        <SectionCard
          title="Clients using Performance"
          sub="Click any client to view their workspace as Payoneer Internal"
          icon="apartment"
          action={<div className="row gap-2">
            <Btn variant="ghost" size="sm" icon="filter_list">Filter</Btn>
            <Btn variant="ghost" size="sm" icon="sort">Sort: workforce size</Btn>
          </div>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {clients.map((c, i) => (
              <button
                key={i}
                className="client-card"
                onClick={() => setImpersonate({ name: c.name, view: 'dashboard' })}
              >
                <div className="row items-center gap-3 mb-3">
                  <Avatar name={c.name} size="md" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--grey-700)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2 }}>{c.plan} · since {c.since}</div>
                  </div>
                  <span className="ms" style={{ color: 'var(--fg-disabled)', fontSize: 18 }}>arrow_forward</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <ClientStat label="Workers"     value={c.workers} />
                  <ClientStat label="Goals"       value={c.goals} />
                  <ClientStat label="Projects"    value={c.projects} />
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--grey-100)' }}>
                  <div className="row items-center between mb-2">
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>On-track</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: c.onTrack >= 70 ? 'var(--success-dark)' : c.onTrack >= 50 ? 'var(--warning-dark)' : 'var(--error-dark)', fontVariantNumeric: 'tabular-nums' }}>{c.onTrack}%</span>
                  </div>
                  <ProgressBar pct={c.onTrack} hidePct color={c.onTrack >= 70 ? 'green' : c.onTrack >= 50 ? 'amber' : 'red'} />
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* All goals — cross-client view */}
      <SectionCard
        title="Goals across all clients"
        sub="Aggregate read-only view · 1,284 goals total · showing top movers"
        icon="flag"
        action={<div className="row gap-2">
          <Btn variant="ghost" size="sm" icon="filter_list">Filter</Btn>
          <Btn variant="text" size="sm" iconTrailing="arrow_forward">See all</Btn>
        </div>}
        padBody={false}
      >
        <table className="tbl">
          <thead><tr>
            <th>Client</th>
            <th>Scope</th>
            <th>Goal</th>
            <th>Owner</th>
            <th style={{ width: 220 }}>Progress</th>
            <th>Due</th>
            <th />
          </tr></thead>
          <tbody>
            {goals.map((g, i) => (
              <tr key={i}>
                <td>
                  <div className="row items-center gap-2">
                    <Avatar name={g.client} size="xs" />
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{g.client}</span>
                  </div>
                </td>
                <td><Pill variant={g.scope === 'Company' ? 'contractor' : g.scope === 'Team' ? 'contrib' : 'employee'}>{g.scope}</Pill></td>
                <td><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-700)' }}>{g.title}</span></td>
                <td>
                  <div className="worker-cell">
                    <Avatar name={g.owner} size="sm" />
                    <span className="name">{g.owner}</span>
                  </div>
                </td>
                <td><ProgressBar pct={g.pct} color={g.pct >= 70 ? 'green' : g.pct >= 40 ? '' : 'amber'} /></td>
                <td><span style={{ fontSize: 12, fontWeight: 600 }}>{g.due}</span></td>
                <td className="actions-cell">
                  <Btn variant="ghost" size="sm" icon="open_in_new" onClick={() => setImpersonate({ name: g.client, view: 'okrs' })}>Open in client view</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </Shell>
  );
}

function ClientStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--grey-700)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 2 }}>{value}</div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
