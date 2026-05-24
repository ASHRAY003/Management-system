/* Worker → Reviews → "View all" history page.
   Shows every review cycle the worker has participated in, newest first,
   with the same status pills and actions as the dashboard panel. */

const { useState: useStateARC, useEffect: useEffectARC } = React;

function AllReviewCyclesPage() {
  const Store = window.PerformanceStore;
  const [, setVersion] = useStateARC(0);
  useEffectARC(() => Store.subscribe(() => setVersion(v => v + 1)), []);
  useEffectARC(() => { Store.refreshAll && Store.refreshAll(); }, []);

  const currentWorkerId = Store.getCurrentWorkerId();
  const cycles = Store.getReviewCyclesForWorker(currentWorkerId);
  cycles.sort((a, b) => String(b.periodEnd || b.createdAt || '').localeCompare(String(a.periodEnd || a.createdAt || '')));

  function go(hash) { window.location.hash = hash; }

  return (
    <Shell persona="worker" active="performance"
      crumb={['Payo WFM', 'Performance', 'Feedback & Reviews', 'All cycles']}>

      <div className="row items-center between mb-4">
        <Btn variant="ghost" icon="arrow_back" onClick={() => go('/worker/reviews')}>Back to Feedback &amp; Reviews</Btn>
      </div>

      <PageHead
        eyebrow="My performance · Review cycles"
        title={`All review cycles · ${cycles.length}`}
        sub="Every cycle you've participated in, newest first."
      />

      <SectionCard
        title="Review cycles"
        sub={`${cycles.length} total`}
        icon="event_repeat"
        padBody={false}
      >
        {cycles.length === 0 && (
          <div style={{ padding: '20px 22px', fontSize: 13, color: 'var(--fg-secondary)' }}>
            No review cycles yet.
          </div>
        )}
        {cycles.map(c => {
          const p = Store.getReviewParticipantForWorker(c.id, currentWorkerId);
          const selfStatus = p?.selfReviewStatus || 'not-started';
          const finalShared = p?.finalReviewStatus === 'shared' || p?.finalReviewStatus === 'acknowledged';
          const acknowledged = p?.finalReviewStatus === 'acknowledged';
          return (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 130px 160px 220px',
              gap: 16, alignItems: 'center',
              padding: '14px 22px', borderTop: '1px solid var(--grey-50)',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)' }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-secondary)', marginTop: 2 }}>{c.periodStart} → {c.periodEnd}</div>
              </div>
              <Pill variant={c.status === 'active' ? 'active' : c.status === 'closed' ? 'completed' : 'draft'} dot>{c.status}</Pill>
              <div className="col gap-1">
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Self-review</span>
                {selfStatus === 'submitted'   && <Pill variant="completed" dot>Submitted</Pill>}
                {selfStatus === 'draft'       && <Pill variant="warning"   dot>Draft</Pill>}
                {selfStatus === 'not-started' && <Pill variant="draft">Not started</Pill>}
              </div>
              <div className="row gap-2" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {finalShared && p && (
                  <Btn variant={acknowledged ? 'ghost' : 'primary'} size="sm" icon={acknowledged ? 'check' : 'visibility'}
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openShared', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>
                    {acknowledged ? 'View shared review' : 'View & acknowledge'}
                  </Btn>
                )}
                {selfStatus === 'submitted' && p && (
                  <Btn variant="ghost" size="sm" icon="visibility"
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openSelf', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>View my self-review</Btn>
                )}
                {!finalShared && selfStatus !== 'submitted' && p && (
                  <Btn variant="primary" size="sm" icon={selfStatus === 'draft' ? 'edit' : 'play_arrow'}
                    onClick={() => {
                      try { window.sessionStorage.setItem('payo.workerReviews.openSelf', p.id); } catch (e) {}
                      go('/worker/reviews');
                    }}>
                    {selfStatus === 'draft' ? 'Continue self-review' : 'Start self-review'}
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </SectionCard>
    </Shell>
  );
}

window.AllReviewCyclesPage = AllReviewCyclesPage;
