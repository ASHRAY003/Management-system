/* Login screen — authenticates against POST /api/auth/login and stores the
   JWT in localStorage. Includes a "switch demo account" pill row so the user
   can flip between the three seeded demo accounts (Priya, Aditi, Rahul). */

const { useState: useStateLogin } = React;

const DEMO_ACCOUNTS = [
  { email: 'priya@demo.com', label: 'Priya Mehta',  sub: 'Manager',    role: 'manager' },
  { email: 'aditi@demo.com', label: 'Aditi Sharma', sub: 'Employee',   role: 'worker' },
  { email: 'rahul@demo.com', label: 'Rahul Mehta',  sub: 'Contractor', role: 'worker' },
];

function LoginScreen() {
  const [email, setEmail] = useStateLogin('priya@demo.com');
  const [password, setPassword] = useStateLogin('password123');
  const [error, setError] = useStateLogin('');
  const [submitting, setSubmitting] = useStateLogin(false);

  async function doLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await window.PerformanceStore.login(email, password);
      const home = user.role === 'worker' ? '/worker/dashboard' : '/client/dashboard';
      window.location.hash = home;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function loginAs(acct) {
    setEmail(acct.email);
    setPassword('password123');
    setError('');
    setSubmitting(true);
    try {
      const user = await window.PerformanceStore.login(acct.email, 'password123');
      const home = user.role === 'worker' ? '/worker/dashboard' : '/client/dashboard';
      window.location.hash = home;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F1EA 0%, #EFEAE0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        padding: '32px 30px 26px',
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Payo WFM
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            Performance Management
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
            Sign in to continue.
          </div>
        </div>

        <form onSubmit={doLogin} className="col gap-3">
          <label className="col" style={{ gap: 5 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</span>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} autoComplete="email" />
          </label>
          <label className="col" style={{ gap: 5 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</span>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} autoComplete="current-password" />
          </label>

          {error && (
            <div style={{
              padding: '10px 12px', background: '#FDEDEC', color: '#9F1308',
              borderRadius: 8, fontSize: 12.5, border: '1px solid #F8C7C3',
            }}>{error}</div>
          )}

          <button type="submit" disabled={submitting}
            style={{
              padding: '11px 14px', borderRadius: 10, border: 'none',
              background: submitting ? '#A0B4D9' : '#0075E1', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: submitting ? 'progress' : 'pointer',
              marginTop: 4,
            }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 24, borderTop: '1px solid #EFEAE0', paddingTop: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Demo accounts
          </div>
          <div className="col gap-2">
            {DEMO_ACCOUNTS.map(acct => (
              <button key={acct.email}
                onClick={() => loginAs(acct)}
                disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid #EFEAE0', background: '#FBFAF7',
                  textAlign: 'left',
                }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{acct.label}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{acct.sub} · {acct.email}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0075E1' }}>Sign in →</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 12 }}>
            All demo accounts use the password <code style={{ background: '#F4F1EA', padding: '1px 5px', borderRadius: 4 }}>password123</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #E5DFD2',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  boxSizing: 'border-box',
};

window.LoginScreen = LoginScreen;
