import { subscriptions } from './subscriptionsStore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }

        const exists = subscriptions.find((s) => s.endpoint === subscription.endpoint);
        if (!exists) {
            subscriptions.push(subscription);
        }

        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save subscription' });
    }
}


