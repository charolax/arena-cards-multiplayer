# Arena Cards multiplayer server

Node.js service for PeerJS signaling (WebSocket/WebRTC setup) and a shared room directory.

- Build: `npm install`
- Start: `npm start`
- Health: `/api/health`
- Open rooms: `/api/rooms`

Open rooms expire after 45 seconds without heartbeat. The directory is in-memory, so restarting the service clears room listings. WebRTC traffic is peer-to-peer; some networks may need a TURN relay.
