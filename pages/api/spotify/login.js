export default async function handler(req, res) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const scope = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing'
    ].join(' ');

    const state = Math.random().toString(36).slice(2);
    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('scope', scope);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);

    res.setHeader('Set-Cookie', `spotify_auth_state=${state}; HttpOnly; Path=/; SameSite=Lax`);
    res.redirect(url.toString());
}


