/* ─────────────────────────────────────────────────────────────────────────────
   API-backed Performance Management store.

   Replaces the prior localStorage-only shim while keeping the same
   sync-getter + subscribe surface that every JSX screen already calls.

   On boot, fetches all data the current user is allowed to see and populates
   an in-memory cache. Sync getters read from the cache; async writes hit the
   API, then re-fetch the relevant slice and emit a `performance-store-change`
   event so subscribed components re-render.
   ───────────────────────────────────────────────────────────────────────────── */

(function () {
  const API_BASE = window.PAYO_API_BASE || 'http://localhost:4000/api';
  const TOKEN_KEY = 'payo.auth.token';

  const DEFAULT_SELF_QUESTIONS = [
    'What were your top achievements during this review period?',
    'Which goals or OKRs did you complete or make meaningful progress on?',
    'Which goals or OKRs were delayed, blocked, or not completed? Why?',
    'What challenges or blockers did you face?',
    'What support did you need from your manager or team?',
    'What feedback did you receive and act on?',
    'What skills did you improve during this period?',
    'What would you like to improve in the next cycle?',
    'What goals or focus areas do you suggest for the next cycle?',
  ];
  const DEFAULT_MANAGER_QUESTIONS = [
    'How well did the worker perform against their assigned goals and OKRs?',
    "What were the worker's most meaningful achievements?",
    'What was the quality and impact of their work?',
    'How effectively did the worker communicate and collaborate?',
    'Did the worker take ownership and follow through on commitments?',
    'Did the worker complete action items discussed in 1:1s?',
    "What are the worker's key strengths?",
    "What are the worker's main areas for improvement?",
    'What should the worker focus on in the next cycle?',
    'What is the overall performance rating?',
    'Final manager summary.',
  ];
  const DEFAULT_FINAL_FIELDS = [
    'Final performance summary', 'Key strengths', 'Development areas',
    'Next cycle focus', 'Final rating', 'Worker acknowledgement comment',
  ];
  const DEFAULT_RATING_OPTIONS = [
    'Exceeds Expectations', 'Meets Expectations',
    'Partially Meets Expectations', 'Needs Improvement',
  ];
  const REVIEW_TYPE_OPTIONS = [
    { value: 'quarterly',   label: 'Quarterly Review' },
    { value: 'half-yearly', label: 'Half-Yearly Review' },
    { value: 'annual',      label: 'Annual Review' },
    { value: 'probation',   label: 'Probation Review' },
    { value: 'project',     label: 'Project Review' },
    { value: 'adhoc',       label: 'Ad hoc Review' },
  ];

  // ─── Cache ─────────────────────────────────────────────────────────────
  const cache = {
    bootstrapped: false,
    bootstrapInFlight: null,
    currentUser: null,
    workers: [],
    goals: [],
    meetings: [],
    feedback: [],
    reviewCycles: [],
    reviewParticipants: [],
    selfReviews: [],
    managerReviews: [],
    notifications: [],
    legacyReviews: [], // for screens that still call createReview/shareReview
  };

  // ─── HTTP ──────────────────────────────────────────────────────────────
  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    let res;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error(`Network error contacting ${API_BASE}: ${e.message}`);
    }
    if (res.status === 401) {
      clearToken();
      cache.currentUser = null;
      emit();
      if (window.location.hash !== '#/login') window.location.hash = '/login';
      throw new Error('Unauthorized');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
    return data;
  }

  function emit() {
    window.dispatchEvent(new CustomEvent('performance-store-change'));
  }
  function subscribe(listener) {
    window.addEventListener('performance-store-change', listener);
    return () => window.removeEventListener('performance-store-change', listener);
  }

  // ─── Adapters: backend → frontend shape ────────────────────────────────

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function adaptWorker(w) {
    if (!w) return null;
    return {
      ...w,
      role: w.title || (w.user?.role) || '',
      managerId: w.managerUserId,
    };
  }

  // Backend uses snake_case enums (on_track); the JSX checks dash-form
  // (on-track / at-risk / not-started). Normalize on read.
  function statusDash(s)   { return s ? String(s).replace(/_/g, '-') : s; }
  function statusUnder(s)  { return s ? String(s).replace(/-/g, '_') : s; }

  function adaptKeyResult(kr) {
    if (!kr) return null;
    return {
      ...kr,
      status: statusDash(kr.status),
      assignedToIds: (kr.assignees || []).map(a => a.workerId),
      current: kr.currentValue,
      target: kr.targetValue,
      unit: kr.metricType,
      dueDate: kr.dueDate ? fmtDate(kr.dueDate) : '',
    };
  }

  function adaptGoal(g) {
    if (!g) return null;
    const assigneeIds = (g.assignees || []).map(a => a.workerId);

    // Owner resolution — Goal.ownerUserId is a User.id, which could be either
    // (a) a worker's userId or (b) the manager's user id. Resolve both and
    // attach name/role so the JSX never has to translate ids → names again.
    const ownerWorker = cache.workers.find(w => w.userId === g.ownerUserId);
    let ownerName = '—';
    let ownerRole = '';
    let ownerType = 'manager';
    if (ownerWorker) {
      ownerName = ownerWorker.name;
      ownerRole = ownerWorker.role || ownerWorker.title || '';
      ownerType = 'worker';
    } else if (cache.currentUser && cache.currentUser.id === g.ownerUserId) {
      ownerName = cache.currentUser.name;
      ownerRole = 'Manager';
      ownerType = 'manager';
    }

    // Contributor names attached for each assignee (so views can render
    // "owner" + "contributors" without doing lookups).
    const contributors = (g.assignees || []).map(a => {
      const w = cache.workers.find(x => x.id === a.workerId);
      return { workerId: a.workerId, name: w?.name || '', role: w?.role || w?.title || '' };
    });

    return {
      ...g,
      status: statusDash(g.status),
      ownerId: g.ownerUserId,
      ownerUserId: g.ownerUserId,
      ownerType,
      ownerName,
      ownerRole,
      contributors,
      assigneeIds,
      collaboratorIds: assigneeIds,
      dueDate: g.dueDate ? fmtDate(g.dueDate) : '',
      startDate: g.startDate ? fmtDate(g.startDate) : '',
      period: g.period || '',
      linkedProject: g.linkedProject || '',
      source: g.source,
      goalType: g.goalType || 'individual',
      keyResults: (g.keyResults || []).map(adaptKeyResult),
    };
  }

  function adaptMeeting(m) {
    if (!m) return null;
    return {
      ...m,
      scheduledAt: m.scheduledAt || '',
      sharedNotes: m.sharedNotes || '',
      managerPrivateNotes: m.managerPrivateNotes ?? '',
      workerPrivateNotes: m.workerPrivateNotes ?? '',
      agenda: Array.isArray(m.agenda) ? m.agenda : [],
      actionItems: Array.isArray(m.actionItems) ? m.actionItems : [],
      linkedGoalIds: [],
      linkedKeyResultIds: [],
    };
  }

  function adaptFeedback(f) {
    if (!f) return null;
    return {
      ...f,
      from: f.givenBy?.name || f.from || '',
      fromRole: f.givenBy?.role === 'manager' ? 'Manager' : f.fromRole || '',
      date: f.createdAt ? fmtDate(f.createdAt) : (f.date || ''),
      type: f.feedbackType || 'recognition',
      text: f.message || '',
    };
  }

  function adaptCycle(c) {
    if (!c) return null;
    return {
      ...c,
      periodStart: c.periodStart ? String(c.periodStart).slice(0, 10) : '',
      periodEnd:   c.periodEnd   ? String(c.periodEnd).slice(0, 10)   : '',
      selfReviewDueDate:    c.selfReviewDueDate    ? String(c.selfReviewDueDate).slice(0, 10)    : '',
      managerReviewDueDate: c.managerReviewDueDate ? String(c.managerReviewDueDate).slice(0, 10) : '',
      finalSharingDate:     c.finalSharingDate     ? String(c.finalSharingDate).slice(0, 10)     : '',
      // Both naming conventions (existing JSX read both)
      includeOKRs: c.includeOkrs,
      questions: {
        selfReview:        c.selfReviewQuestions        || DEFAULT_SELF_QUESTIONS,
        managerReview:     c.managerReviewQuestions     || DEFAULT_MANAGER_QUESTIONS,
        finalSharedReview: c.finalSharedReviewQuestions || DEFAULT_FINAL_FIELDS,
      },
    };
  }

  function adaptParticipant(p) {
    if (!p) return null;
    // Backend uses `selfReviewStatus = 'not_started' | 'draft' | 'submitted'`
    // Frontend code expects 'not-started' | 'draft' | 'submitted' in places.
    // We keep both forms by mirroring.
    const normalize = (v) => v ? String(v).replace(/_/g, '-') : v;
    return {
      ...p,
      selfReviewStatus:    normalize(p.selfReviewStatus),
      managerReviewStatus: normalize(p.managerReviewStatus),
      finalReviewStatus:   normalize(p.finalReviewStatus),
      overallStatus:       normalize(p.overallStatus),
      managerId: p.managerUserId,
    };
  }

  function adaptSelfReview(s) {
    if (!s) return null;
    return {
      ...s,
      participantId: s.reviewParticipantId || s.participantId,
      answers: Array.isArray(s.answers) ? s.answers : [],
    };
  }

  function adaptManagerReview(m) {
    if (!m) return null;
    return {
      ...m,
      participantId: m.reviewParticipantId || m.participantId,
      answers: Array.isArray(m.answers) ? m.answers : [],
    };
  }

  function adaptNotification(n) {
    if (!n) return null;
    // Frontend code uses recipientRole 'client' (manager view); backend uses 'manager' or 'client_admin'.
    const role = (n.recipientRole === 'manager' || n.recipientRole === 'client_admin') ? 'client' : n.recipientRole;
    return { ...n, recipientRole: role };
  }

  // Reverse: convert outbound goal payload to backend shape.
  function toBackendGoalPayload(p) {
    return {
      title: p.title || p.name,
      description: p.description || '',
      ownerUserId: p.ownerUserId || undefined,
      source: p.source || (p.createdByRole === 'worker' ? 'worker_created' : 'employer_assigned'),
      goalType: p.goalType || p.type || 'individual',
      startDate: p.startDate || undefined,
      dueDate: p.dueDate || undefined,
      visibility: p.visibility || p.privacy || 'restricted',
      assigneeWorkerIds: p.assigneeIds || [],
      keyResults: (p.keyResults || p.krs || []).map(kr => ({
        title: kr.title || kr.name,
        description: kr.description || '',
        metricType: kr.metricType || kr.unit || 'count',
        startValue: Number(kr.startValue ?? kr.start ?? kr.current ?? 0),
        currentValue: Number(kr.currentValue ?? kr.current ?? 0),
        targetValue: Number(kr.targetValue ?? kr.target ?? 0),
        progress: kr.progress,
        dueDate: kr.dueDate || undefined,
        assigneeWorkerIds: kr.assignedToIds || p.assigneeIds || [],
      })),
    };
  }

  // ─── Auth ──────────────────────────────────────────────────────────────
  async function login(email, password) {
    const r = await request('POST', '/auth/login', { email, password });
    setToken(r.token);
    cache.currentUser = r.user;
    cache.bootstrapped = false;
    await bootstrap();
    return r.user;
  }
  function logout() {
    clearToken();
    Object.assign(cache, {
      bootstrapped: false,
      bootstrapInFlight: null,
      currentUser: null,
      workers: [],
      goals: [],
      meetings: [],
      feedback: [],
      reviewCycles: [],
      reviewParticipants: [],
      selfReviews: [],
      managerReviews: [],
      notifications: [],
      legacyReviews: [],
    });
    emit();
    window.location.hash = '/login';
  }
  function isAuthenticated() { return !!getToken(); }

  // ─── Bootstrap ─────────────────────────────────────────────────────────
  async function bootstrap() {
    if (cache.bootstrapInFlight) return cache.bootstrapInFlight;
    if (!getToken()) return;
    cache.bootstrapInFlight = (async () => {
      try {
        const me = await request('GET', '/auth/me');
        cache.currentUser = me.user;
        const role = me.user.role;
        if (role === 'worker') {
          await Promise.all([
            refreshWorkers(), refreshMyGoals(), refreshMyMeetings(),
            refreshMyFeedback(), refreshMyCycles(), refreshNotifications(),
            refreshLegacyReviews(),
          ]);
        } else {
          await Promise.all([
            refreshWorkers(), refreshGoals(), refreshMeetings(),
            refreshFeedback(), refreshCycles(), refreshNotifications(),
          ]);
        }
        cache.bootstrapped = true;
        emit();
      } catch (e) {
        console.error('[store] bootstrap failed', e);
      } finally {
        cache.bootstrapInFlight = null;
      }
    })();
    return cache.bootstrapInFlight;
  }

  // ─── Refreshers ────────────────────────────────────────────────────────
  async function refreshWorkers() {
    const r = await request('GET', '/workers');
    cache.workers = (r.workers || []).map(adaptWorker);
    emit();
  }
  async function refreshGoals() {
    const r = await request('GET', '/goals');
    cache.goals = (r.goals || []).map(adaptGoal);
    emit();
  }
  async function refreshMyGoals() {
    const r = await request('GET', '/me/goals');
    cache.goals = (r.goals || []).map(adaptGoal);
    emit();
  }
  async function refreshMeetings() {
    const r = await request('GET', '/one-on-ones');
    cache.meetings = (r.meetings || []).map(adaptMeeting);
    emit();
  }
  async function refreshMyMeetings() {
    const r = await request('GET', '/me/one-on-ones');
    cache.meetings = (r.meetings || []).map(adaptMeeting);
    emit();
  }
  async function refreshFeedback() {
    const r = await request('GET', '/feedback');
    cache.feedback = (r.feedback || []).map(adaptFeedback);
    emit();
  }
  async function refreshMyFeedback() {
    const r = await request('GET', '/me/feedback');
    cache.feedback = (r.feedback || []).map(adaptFeedback);
    emit();
  }
  async function refreshCycles() {
    const r = await request('GET', '/review-cycles');
    cache.reviewCycles = (r.reviewCycles || []).map(adaptCycle);
    cache.reviewParticipants = [];
    cache.selfReviews = [];
    cache.managerReviews = [];
    for (const c of cache.reviewCycles) {
      try {
        const p = await request('GET', `/review-cycles/${c.id}/participants`);
        for (const part of (p.participants || [])) {
          cache.reviewParticipants.push(adaptParticipant(part));
          if (part.selfReview)    cache.selfReviews.push(adaptSelfReview(part.selfReview));
          if (part.managerReview) cache.managerReviews.push(adaptManagerReview(part.managerReview));
        }
      } catch (e) { /* manager may not own all cycles */ }
    }
    emit();
  }
  async function refreshMyCycles() {
    const r = await request('GET', '/me/review-cycles');
    cache.reviewCycles = [];
    cache.reviewParticipants = [];
    cache.selfReviews = [];
    cache.managerReviews = [];
    for (const part of (r.participations || [])) {
      if (part.reviewCycle)   cache.reviewCycles.push(adaptCycle(part.reviewCycle));
      cache.reviewParticipants.push(adaptParticipant(part));
      if (part.selfReview)    cache.selfReviews.push(adaptSelfReview(part.selfReview));
      if (part.managerReview) cache.managerReviews.push(adaptManagerReview(part.managerReview));
    }
    emit();
  }
  async function refreshNotifications() {
    const r = await request('GET', '/notifications');
    cache.notifications = (r.notifications || []).map(adaptNotification);
    emit();
  }

  // ─── Sync getters ──────────────────────────────────────────────────────
  function getCurrentWorkerId() { return cache.currentUser?.workerProfile?.id || null; }
  function setCurrentWorkerId() { /* no-op under JWT auth — use the login screen to switch accounts */ }
  function getCurrentUserId() { return cache.currentUser?.id || null; }
  function getManagerId() {
    if (cache.currentUser?.role === 'manager' || cache.currentUser?.role === 'client_admin') return cache.currentUser.id;
    if (cache.currentUser?.workerProfile?.managerUserId) return cache.currentUser.workerProfile.managerUserId;
    return null;
  }

  function getData() {
    return {
      workers: cache.workers,
      goals: cache.goals,
      meetings: cache.meetings,
      feedback: cache.feedback,
      reviews: cache.legacyReviews,
      reviewCycles: cache.reviewCycles,
      reviewParticipants: cache.reviewParticipants,
      selfReviews: cache.selfReviews,
      managerReviews: cache.managerReviews,
      notifications: cache.notifications,
    };
  }

  function getWorkers() { return cache.workers; }
  function workerById(id) { return cache.workers.find(w => w.id === id) || null; }
  function workerIdFromName(name) {
    const m = cache.workers.find(w => w.name.toLowerCase() === String(name || '').toLowerCase());
    return m ? m.id : null;
  }

  function getGoals() { return cache.goals; }
  function getGoalsForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    if (!id) return [];
    return cache.goals.filter(g =>
      (g.assigneeIds || []).includes(id) ||
      (g.keyResults || []).some(kr => (kr.assignedToIds || []).includes(id))
    );
  }
  function getPeopleGoals() {
    return cache.workers.map(w => ({ worker: w, goals: getGoalsForWorker(w.id) }))
      .filter(g => g.goals.length);
  }
  function workerHasActiveGoals(workerId) {
    return cache.goals.some(g =>
      (g.assigneeIds || []).includes(workerId) && g.status !== 'completed'
    );
  }
  function getSelectableWorkers(participantType, includeWithNoGoals) {
    let list = cache.workers;
    if (participantType === 'employees')   list = list.filter(w => w.workerType === 'employee');
    else if (participantType === 'contractors') list = list.filter(w => w.workerType === 'contractor');
    if (!includeWithNoGoals) list = list.filter(w => workerHasActiveGoals(w.id));
    return list;
  }

  function getMeetingsForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    return cache.meetings.filter(m => m.workerId === id);
  }
  function getFeedbackForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    return cache.feedback.filter(f => f.workerId === id);
  }

  function getReviewCycles() { return cache.reviewCycles; }
  function getActiveReviewCycles() { return cache.reviewCycles.filter(c => c.status === 'active'); }
  function getReviewCycleById(id) { return cache.reviewCycles.find(c => c.id === id) || null; }
  function getReviewParticipants(cycleId) { return cache.reviewParticipants.filter(p => p.reviewCycleId === cycleId); }
  function getReviewParticipantById(id) { return cache.reviewParticipants.find(p => p.id === id) || null; }
  function getReviewParticipantForWorker(cycleId, workerId) {
    return cache.reviewParticipants.find(p => p.reviewCycleId === cycleId && p.workerId === workerId) || null;
  }
  function getReviewCyclesForWorker(workerId) {
    const id = workerId || getCurrentWorkerId();
    const cycleIds = new Set(cache.reviewParticipants.filter(p => p.workerId === id).map(p => p.reviewCycleId));
    return cache.reviewCycles.filter(c => cycleIds.has(c.id));
  }
  function getSelfReview(participantId) {
    return cache.selfReviews.find(s => s.participantId === participantId) || null;
  }
  function getManagerReview(participantId) {
    return cache.managerReviews.find(m => m.participantId === participantId) || null;
  }

  function getReviewContextForWorker(workerId, cycleId) {
    // Approximate the old method using cached data. The full backend version
    // is at GET /manager/reviews/:participantId — call it lazily if you need
    // the canonical bundle.
    const cycle = getReviewCycleById(cycleId);
    const worker = workerById(workerId);
    const goals = getGoalsForWorker(workerId);
    const keyResults = goals.flatMap(g => (g.keyResults || []).filter(kr => (kr.assignedToIds || []).includes(workerId)));
    const meetings = getMeetingsForWorker(workerId);
    const feedback = getFeedbackForWorker(workerId);
    return { cycle, worker, goals, keyResults, meetings, feedback };
  }

  function getNotifications() { return cache.notifications; }
  function getNotificationsForUser() {
    return cache.notifications.filter(n => !n.archivedAt);
  }
  function getUnreadNotificationCount() {
    return cache.notifications.filter(n => !n.readAt && !n.archivedAt).length;
  }

  // ─── Async writes ──────────────────────────────────────────────────────
  async function createGoal(payload) {
    const r = await request('POST', '/goals', toBackendGoalPayload(payload));
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptGoal(r.goal);
  }
  async function updateGoal(id, patch) {
    const body = toBackendGoalPayload(patch);
    if (patch.status) body.status = patch.status;
    if (patch.progress != null) body.progress = patch.progress;
    const r = await request('PATCH', `/goals/${id}`, body);
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptGoal(r.goal);
  }
  async function assignGoalToWorkers(goalId, workerIds) {
    for (const wId of workerIds) {
      try { await request('POST', `/goals/${goalId}/assignees`, { workerId: wId }); } catch (e) {}
    }
    await refreshGoals();
  }
  async function createKeyResult(goalId, payload) {
    const r = await request('POST', `/goals/${goalId}/key-results`, {
      title: payload.title,
      description: payload.description || '',
      metricType: payload.metricType || payload.unit || 'count',
      startValue: Number(payload.startValue ?? payload.start ?? 0),
      currentValue: Number(payload.currentValue ?? payload.current ?? 0),
      targetValue: Number(payload.targetValue ?? payload.target ?? 0),
      progress: payload.progress,
      dueDate: payload.dueDate || undefined,
      assigneeWorkerIds: payload.assignedToIds || [],
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptKeyResult(r.keyResult);
  }
  async function updateKeyResult(goalIdOrKrId, krIdOrPatch, maybePatch) {
    // Backwards-compatible: old signature was (goalId, krId, patch). New: (krId, patch).
    const krId = maybePatch ? krIdOrPatch : goalIdOrKrId;
    const patch = maybePatch || krIdOrPatch;
    const body = { ...patch };
    if (patch.current != null)  body.currentValue = patch.current;
    if (patch.target  != null)  body.targetValue  = patch.target;
    if (patch.unit)             body.metricType   = patch.unit;
    if (body.status)            body.status       = statusUnder(body.status);
    const r = await request('PATCH', `/key-results/${krId}`, body);
    await (cache.currentUser?.role === 'worker' ? refreshMyGoals() : refreshGoals());
    return adaptKeyResult(r.keyResult);
  }

  async function createMeeting(payload) {
    const r = await request('POST', '/one-on-ones', {
      workerId: payload.workerId,
      title: payload.title || '1:1',
      scheduledAt: payload.scheduledAt || payload.scheduledDate || new Date().toISOString(),
      agenda: payload.agenda || [],
      sharedNotes: payload.sharedNotes || '',
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyMeetings() : refreshMeetings());
    return adaptMeeting(r.meeting);
  }
  async function request1on1(payload = {}) {
    const r = await request('POST', '/me/one-on-ones/request', payload);
    await refreshNotifications();
    return r.notification;
  }

  async function updateMeetingNotes(meetingId, patch) {
    const calls = [];
    if (patch.sharedNotes !== undefined) {
      calls.push(request('PATCH', `/one-on-ones/${meetingId}/shared-notes`, { sharedNotes: patch.sharedNotes }));
    }
    if (patch.managerPrivateNotes !== undefined && cache.currentUser?.role !== 'worker') {
      calls.push(request('PATCH', `/one-on-ones/${meetingId}/manager-private-notes`, { managerPrivateNotes: patch.managerPrivateNotes }));
    }
    if (patch.workerPrivateNotes !== undefined && cache.currentUser?.role === 'worker') {
      calls.push(request('PATCH', `/me/one-on-ones/${meetingId}/worker-private-notes`, { workerPrivateNotes: patch.workerPrivateNotes }));
    }
    await Promise.all(calls);
    await (cache.currentUser?.role === 'worker' ? refreshMyMeetings() : refreshMeetings());
  }

  async function createFeedback(payload) {
    const r = await request('POST', '/feedback', {
      workerId: payload.workerId,
      feedbackType: payload.feedbackType || payload.type || 'recognition',
      title: payload.title || (payload.text || '').slice(0, 60),
      message: payload.message || payload.text || '',
      visibility: payload.visibility || 'shared_with_worker',
      linkedGoalId: payload.linkedGoalId || null,
      linkedKeyResultId: payload.linkedKeyResultId || null,
    });
    await (cache.currentUser?.role === 'worker' ? refreshMyFeedback() : refreshFeedback());
    return adaptFeedback(r.feedback);
  }

  function buildCyclePayload(p) {
    return {
      name: p.name,
      reviewType: p.type || p.reviewType || 'quarterly',
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      purpose: p.purpose || '',
      participantType: p.participantType || 'employees',
      includeWorkersWithNoGoals: !!p.includeWorkersWithNoGoals,
      includeGoals: p.includeGoals !== false,
      includeOkrs: (p.includeOKRs !== false) && (p.includeOkrs !== false),
      includeWorkerCreatedGoals: p.includeWorkerCreatedGoals !== false,
      includeProgressUpdates: p.includeProgressUpdates !== false,
      includeMeetings: p.includeMeetings !== false,
      includeSharedNotes: p.includeSharedNotes !== false,
      includeFeedback: p.includeFeedback !== false,
      includeRating: p.includeRating !== false,
      ratingScale: p.ratingScale || 'simple-4',
      ratingOptions: p.ratingOptions?.length ? p.ratingOptions : DEFAULT_RATING_OPTIONS,
      showRatingToWorker: p.showRatingToWorker !== false,
      showManagerFinalCommentsToWorker: p.showManagerFinalCommentsToWorker !== false,
      selfReviewDueDate: p.selfReviewDueDate || undefined,
      managerReviewDueDate: p.managerReviewDueDate || undefined,
      finalSharingDate: p.finalSharingDate || undefined,
      selfReviewQuestions:        p.questions?.selfReview        || p.selfReviewQuestions        || DEFAULT_SELF_QUESTIONS,
      managerReviewQuestions:     p.questions?.managerReview     || p.managerReviewQuestions     || DEFAULT_MANAGER_QUESTIONS,
      finalSharedReviewQuestions: p.questions?.finalSharedReview || p.finalSharedReviewQuestions || DEFAULT_FINAL_FIELDS,
    };
  }
  async function createReviewCycle(payload) {
    const r = await request('POST', '/review-cycles', buildCyclePayload(payload));
    await refreshCycles();
    return adaptCycle(r.reviewCycle);
  }
  async function saveReviewCycleDraft(payload) {
    // Backend doesn't expose draft-update; create new draft on save.
    return createReviewCycle({ ...payload, status: 'draft' });
  }
  async function launchReviewCycle(idOrPayload) {
    let id = idOrPayload;
    let workerIds;
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      if (!idOrPayload.id) {
        const created = await createReviewCycle(idOrPayload);
        id = created.id;
      } else {
        id = idOrPayload.id;
      }
      workerIds = idOrPayload.workerIds;
    }
    const r = await request('POST', `/review-cycles/${id}/launch`, workerIds ? { workerIds } : {});
    await refreshCycles();
    return adaptCycle(r.reviewCycle);
  }

  async function saveSelfReview(participantId, answers) {
    const r = await request('PATCH', `/me/self-reviews/${participantId}`, { answers });
    await refreshMyCycles();
    return adaptSelfReview(r.selfReview);
  }
  async function submitSelfReview(participantId) {
    const r = await request('POST', `/me/self-reviews/${participantId}/submit`);
    await refreshMyCycles();
    return adaptSelfReview(r.selfReview);
  }
  async function acknowledgeReview(participantId, comment) {
    const r = await request('POST', `/me/reviews/${participantId}/acknowledge`, { comment: comment || '' });
    await refreshMyCycles();
    return adaptParticipant(r.participant);
  }

  async function saveManagerReview(participantId, payload) {
    const r = await request('PATCH', `/manager/reviews/${participantId}`, payload);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }
  async function submitManagerReview(participantId) {
    const r = await request('POST', `/manager/reviews/${participantId}/submit`);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }
  async function shareManagerReview(participantId) {
    const r = await request('POST', `/manager/reviews/${participantId}/share`);
    await refreshCycles();
    return adaptManagerReview(r.managerReview);
  }

  async function markNotificationRead(id) {
    await request('POST', `/notifications/${id}/read`);
    await refreshNotifications();
  }
  async function markAllNotificationsRead() {
    await request('POST', '/notifications/mark-all-read');
    await refreshNotifications();
  }
  async function archiveNotification(id) {
    await request('POST', `/notifications/${id}/archive`);
    await refreshNotifications();
  }

  // ─── Notification "generators" — now server-side; client just re-fetches.
  async function runAllNotificationGenerators() {
    // Best-effort: manager-only endpoint. If it 403s for workers we just refresh.
    if (cache.currentUser?.role !== 'worker') {
      try { await request('POST', '/notifications/run-generators'); } catch (e) {}
    }
    await refreshNotifications();
  }
  const generateDueDateNotifications  = runAllNotificationGenerators;
  const generateReviewNotifications   = runAllNotificationGenerators;
  const generateMeetingNotifications  = runAllNotificationGenerators;

  // ─── One-off "write a review" (now persisted via backend) ──────────────
  async function createReview(payload) {
    const r = await request('POST', '/reviews', {
      workerId: payload.workerId,
      title: payload.title || 'Performance review',
      period: payload.period || '',
      rating: payload.rating != null ? String(payload.rating) : '',
      comments: payload.comments || '',
      visibleToWorker: !!payload.visibleToWorker,
      status: payload.status || (payload.visibleToWorker ? 'shared' : 'submitted'),
    });
    // Refresh both manager and worker review lists.
    await refreshLegacyReviews(payload.workerId);
    return r.review;
  }
  async function shareReview(reviewId) {
    const r = await request('POST', `/reviews/${reviewId}/share`);
    await refreshLegacyReviews(r.review.workerId);
    return r.review;
  }
  function getReviewsForWorker(workerId, includeHidden) {
    const id = workerId || getCurrentWorkerId();
    if (!id) return [];
    // Synchronous read from the cache; the most recent fetch populated it.
    return cache.legacyReviews.filter(r => r.workerId === id && (includeHidden || r.visibleToWorker));
  }
  async function refreshLegacyReviews(workerId) {
    try {
      if (cache.currentUser?.role === 'worker') {
        const r = await request('GET', '/me/reviews-history');
        cache.legacyReviews = (r.reviews || []).map(rv => ({
          ...rv,
          createdAt: rv.createdAt ? fmtDate(rv.createdAt) : '',
        }));
      } else if (workerId) {
        const r = await request('GET', `/workers/${workerId}/reviews?includeHidden=true`);
        // Replace just this worker's slice
        cache.legacyReviews = [
          ...cache.legacyReviews.filter(x => x.workerId !== workerId),
          ...(r.reviews || []).map(rv => ({
            ...rv,
            createdAt: rv.createdAt ? fmtDate(rv.createdAt) : '',
          })),
        ];
      }
      emit();
    } catch (e) {
      console.warn('refreshLegacyReviews failed', e.message);
    }
  }

  // ─── Exports ───────────────────────────────────────────────────────────
  window.PerformanceStore = {
    // constants
    DEFAULT_SELF_QUESTIONS, DEFAULT_MANAGER_QUESTIONS, DEFAULT_FINAL_FIELDS,
    DEFAULT_RATING_OPTIONS, REVIEW_TYPE_OPTIONS,
    get MANAGER_ID() { return getManagerId(); },
    get CURRENT_WORKER_ID() { return getCurrentWorkerId(); },

    // auth + bootstrap
    login, logout, isAuthenticated, bootstrap,
    getCurrentUser: () => cache.currentUser,
    isBootstrapped: () => cache.bootstrapped,

    // identity
    getCurrentWorkerId, setCurrentWorkerId,

    // reads
    getData,
    getWorkers, workerById, workerIdFromName,
    getGoals, getGoalsForWorker, getPeopleGoals,
    getSelectableWorkers, workerHasActiveGoals,
    getMeetingsForWorker, getFeedbackForWorker,
    getReviewCycles, getActiveReviewCycles, getReviewCycleById,
    getReviewParticipants, getReviewParticipantById, getReviewParticipantForWorker,
    getReviewCyclesForWorker, getSelfReview, getManagerReview,
    getReviewContextForWorker,
    getNotifications, getNotificationsForUser, getUnreadNotificationCount,

    // writes (async)
    createGoal, updateGoal, assignGoalToWorkers,
    createKeyResult, updateKeyResult,
    createMeeting, updateMeetingNotes, request1on1,
    createFeedback,
    createReviewCycle, saveReviewCycleDraft, launchReviewCycle,
    saveSelfReview, submitSelfReview, acknowledgeReview,
    saveManagerReview, submitManagerReview, shareManagerReview,
    markNotificationRead, markAllNotificationsRead, archiveNotification,
    runAllNotificationGenerators, generateDueDateNotifications,
    generateReviewNotifications, generateMeetingNotifications,

    // legacy in-memory
    createReview, shareReview, getReviewsForWorker, refreshLegacyReviews,

    // subscribe
    subscribe,

    // manual reload (handy for components after errors)
    refresh: bootstrap,
    refreshAll,
  };

  // Silent re-fetch of every slice the current user is allowed to see.
  // Used by App.useEffect(..., [hash]) so each route change picks up
  // changes another session wrote.
  async function refreshAll() {
    if (!getToken() || !cache.currentUser) return;
    try {
      if (cache.currentUser.role === 'worker') {
        await Promise.all([
          refreshWorkers(), refreshMyGoals(), refreshMyMeetings(),
          refreshMyFeedback(), refreshMyCycles(), refreshNotifications(),
        ]);
      } else {
        await Promise.all([
          refreshWorkers(), refreshGoals(), refreshMeetings(),
          refreshFeedback(), refreshCycles(), refreshNotifications(),
        ]);
      }
    } catch (e) { /* per-slice errors already log */ }
  }
})();
