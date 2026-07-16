export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const termParam = Array.isArray(req.query?.term) ? req.query.term[0] : req.query?.term;
    const limitParam = Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit;

    const term = String(termParam || 'music').trim().toLowerCase() || 'music';
    const parsedLimit = Number.parseInt(String(limitParam || '200'), 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 200;

    const upstreamUrl =
        'https://itunes.apple.com/search?term=' +
        encodeURIComponent(term) +
        '&entity=song&limit=' +
        encodeURIComponent(String(limit));

    try {
        const upstreamResponse = await fetch(upstreamUrl, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!upstreamResponse.ok) {
            res.status(upstreamResponse.status).json({
                error: `iTunes upstream responded HTTP ${upstreamResponse.status}`,
            });
            return;
        }

        const payload = await upstreamResponse.json();
        res.status(200).json(payload);
    } catch (error) {
        res.status(502).json({
            error: `Failed to reach iTunes upstream: ${String(error)}`,
        });
    }
}
