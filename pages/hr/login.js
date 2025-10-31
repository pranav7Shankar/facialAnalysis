import { useState } from 'react';

export default function HRLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/hr/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Invalid credentials');
                setLoading(false);
                return;
            }
            // Redirect on success
            window.location.href = '/hr';
        } catch (e) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow">
                <h1 className="text-xl font-bold mb-4">HR Login</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                    placeholder="Password"
                    required
                />
                {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
                <button disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}


