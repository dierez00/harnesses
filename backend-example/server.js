import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';

const PORT = process.env.PORT || 3000;
const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE = 'CONTACTO';

let channel;

async function connectRabbit() {
  const conn = await amqp.connect(AMQP_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  console.log(`[AMQP] Connected. Queue asserted: ${QUEUE}`);
  return ch;
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.post('/contact', async (req, res) => {
  try {
    const { queue, source, timestamp, data } = req.body || {};
    if (!data || !data.name || !data.email || !data.message) {
      return res.status(400).json({ ok: false, error: 'name, email y message son requeridos' });
    }
    const payload = {
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone || null,
      message: data.message
    };
    const props = {
      persistent: true,
      contentType: 'application/json',
      headers: { source: source || 'web', website: 'harnesses-r-us' },
      timestamp: timestamp ? Date.parse(timestamp) : Date.now()
    };
    await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), props);
    res.json({ ok: true, queued: QUEUE });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  try {
    channel = await connectRabbit();
    console.log(`[HTTP] Listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('[AMQP] Failed to connect:', err);
  }
});
