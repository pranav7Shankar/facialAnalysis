async function refreshAccessToken(refreshToken) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh token');
    return data;
}

function parseCookies(cookieHeader) {
    const out = {};
    (cookieHeader || '').split(';').forEach(p => {
        const [k, v] = p.split('=');
        if (k && v) out[k.trim()] = decodeURIComponent(v.trim());
    });
    return out;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const cookies = parseCookies(req.headers.cookie || '');
    let accessToken = cookies['spotify_access_token'];
    const refreshToken = cookies['spotify_refresh_token'];
    if (!accessToken && !refreshToken) return res.status(401).json({ error: 'Not authorized with Spotify' });

    const { playlistId } = req.body || {};
    if (!playlistId) return res.status(400).json({ error: 'Missing playlistId' });

    // Try to play; refresh token on 401
    async function play(token) {
        const playRes = await fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}` })
        });
        if (playRes.status === 204) return { ok: true };
        const body = await playRes.text();
        return { ok: playRes.ok, status: playRes.status, body };
    }

    try {
        let result = await play(accessToken);
        if (result.status === 401 && refreshToken) {
            const refreshed = await refreshAccessToken(refreshToken);
            if (refreshed.access_token) {
                accessToken = refreshed.access_token;
                res.setHeader('Set-Cookie', `spotify_access_token=${accessToken}; HttpOnly; Path=/; SameSite=Lax`);
                result = await play(accessToken);
            }
        }

        if (result.ok) return res.status(200).json({ success: true });
        if (result.status === 404) return res.status(404).json({ error: 'No active Spotify device. Open Spotify on a device first.' });
        if (result.status === 403) return res.status(403).json({ error: 'Spotify Premium required to start playback.' });
        if (result.status === 401) return res.status(401).json({ error: 'Re-authentication required.' });
        return res.status(500).json({ error: 'Failed to start playback', details: result.body });
    } catch (e) {
        return res.status(500).json({ error: 'Playback error' });
    }
}


