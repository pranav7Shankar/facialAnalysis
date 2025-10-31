import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        const { username, password } = req.body || {};
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        // Get user from database
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('role', 'HR')
            .single();
        
        if (userError || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password using bcrypt
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set cookie
        const cookie = `hr_auth=1; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}`;
        res.setHeader('Set-Cookie', cookie);
        
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('Login error:', e);
        return res.status(400).json({ error: 'Invalid request' });
    }
}


