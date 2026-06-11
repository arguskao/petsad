import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { pets } from '../../src/data/pets';
import { createPetApiPayload, findPetById } from '../../src/lib/pets';
const app = new Hono().basePath('/api');
app.get('/', (c) => c.json({
    name: 'PawsHome API',
    version: '1.0.0',
    endpoints: [
        'GET /api/pets',
        'GET /api/pets/:id',
        'POST /api/adoptions',
        'POST /api/favorites',
    ],
}));
app.get('/pets', (c) => {
    const payload = createPetApiPayload(pets, {
        type: c.req.query('type'),
        age: c.req.query('age'),
        size: c.req.query('size'),
        area: c.req.query('area'),
    });
    return c.json(payload);
});
app.get('/pets/:id', (c) => {
    const pet = findPetById(c.req.param('id'));
    if (!pet) {
        return c.json({ error: 'Pet not found' }, 404);
    }
    return c.json({ pet });
});
app.post('/adoptions', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    return c.json({
        ok: false,
        message: '領養申請 API 尚未接上資料庫，這是正式路由的預留入口。',
        received: body,
    }, 501);
});
app.post('/favorites', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    return c.json({
        ok: false,
        message: '收藏 API 尚未接上會員資料，這是正式路由的預留入口。',
        received: body,
    }, 501);
});
export const onRequest = handle(app);
