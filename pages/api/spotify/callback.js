import querystring from 'querystring';

async function exchangeCodeForToken(code, redirectUri) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        },
        body: querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
        })
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(data.error_description || 'Token exchange failed');
    return data;
}

export default async function handler(req, res) {
    const { code, state } = req.query;
    const cookies = req.headers.cookie || '';
    const expectedState = (cookies.match(/spotify_auth_state=([^;]+)/) || [])[1];
    if (!state || state !== expectedState) {
        return res.status(400).send('State mismatch');
    }
    try {
        const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
        const tokenData = await exchangeCodeForToken(code, redirectUri);
        const cookieParts = [
            `spotify_access_token=${tokenData.access_token}; HttpOnly; Path=/; SameSite=Lax`,
            tokenData.refresh_token ? `spotify_refresh_token=${tokenData.refresh_token}; HttpOnly; Path=/; SameSite=Lax` : '',
            'spotify_auth_state=; Max-Age=0; Path=/;'
        ].filter(Boolean);
        res.setHeader('Set-Cookie', cookieParts);
        res.redirect('/');
    } catch (e) {
        res.status(500).send('Spotify authorization failed');
    }
}


