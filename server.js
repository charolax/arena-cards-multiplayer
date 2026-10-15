'use strict';
const express = require('express');
const cors = require('cors');
const http = require('http');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT || 9000);
const ROOM_TTL_MS = 45_000;
const rooms = new Map();

app.disable('x-powered-by');
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '16kb' }));

function cleanRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) if (now - room.lastSeen > ROOM_TTL_MS) rooms.delete(id);
}
setInterval(cleanRooms, 10_000).unref();

app.get('/', (_req, res) => res.json({ service: 'Arena Cards multiplayer', status: 'ok', endpoints: ['/api/health', '/api/rooms'] }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'arena-cards', rooms: rooms.size }));
app.get('/api/rooms', (_req, res) => {
  cleanRooms();
  res.set('Cache-Control', 'no-store');
  res.json([...rooms.values()].filter(r => !r.occupied).map(r => ({ id: r.id, owner: r.owner, occupied: r.occupied, createdAt: r.createdAt })));
});
app.post('/api/rooms', (req, res) => {
  cleanRooms();
  const id = String(req.body && req.body.id || '');
  const owner = String(req.body && req.body.owner || 'Игрок').trim().slice(0, 20) || 'Игрок';
  if (!/^arena-room-[a-z0-9]+$/i.test(id)) return res.status(400).json({ error: 'invalid_room_id' });
  if (rooms.has(id)) return res.status(409).json({ error: 'room_already_exists' });
  rooms.set(id, { id, owner, occupied: false, createdAt: Date.now(), lastSeen: Date.now() });
  res.status(201).json({ ok: true, id, owner });
});
app.post('/api/rooms/:id/heartbeat', (req, res) => {
  cleanRooms();
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: 'room_not_found' });
  room.lastSeen = Date.now();
  res.json({ ok: true });
});
app.post('/api/rooms/:id/occupy', (req, res) => {
  cleanRooms();
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: 'room_not_found' });
  room.occupied = true;
  room.lastSeen = Date.now();
  res.json({ ok: true });
});
app.delete('/api/rooms/:id', (req, res) => { rooms.delete(req.params.id); res.status(204).end(); });

const peerServer = ExpressPeerServer(server, { path: '/', allow_discovery: true, proxied: true, alive_timeout: 60_000, expire_timeout: 10_000 });
app.use('/peerjs', peerServer);
server.listen(PORT, '0.0.0.0', () => console.log(`Arena Cards server listening on port ${PORT}`));
