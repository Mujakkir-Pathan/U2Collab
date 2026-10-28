# U2Collab — Real-Time Collaborative Workspace

A full-stack MERN application that enables real-time collaboration with a shared document editor, infinite whiteboard, and team chat — all in one workspace.

🔗 **Live Demo:** [u2-collab.vercel.app](https://u2-collab.vercel.app)
🐙 **GitHub:** [github.com/Mujakkir-Pathan/U2Collab](https://github.com/Mujakkir-Pathan/U2Collab)

---

## 📌 What is U2Collab?

U2Collab is a real-time collaborative platform where teams can work together simultaneously on documents, whiteboards, and chat — without any page refresh or sync delay. Built to simulate tools like Notion + Miro combined.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 Authentication | Google & GitHub OAuth via Passport.js with HttpOnly JWT cookies |
| 📝 Collaborative Editor | Real-time document editing using Yjs CRDT + Tiptap |
| 🎨 Infinite Whiteboard | Drag, draw, and annotate using Konva.js canvas |
| 💬 Real-time Chat | Room-based team chat powered by Socket.io |
| 🚪 Room Management | Create and join collaborative rooms with unique IDs |
| 🔒 Secure Sessions | HttpOnly JWT cookies, no localStorage token exposure |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) — UI framework
- **Tiptap** — Rich text collaborative editor
- **Yjs** — CRDT-based real-time sync engine
- **Konva.js** — Infinite whiteboard canvas
- **Socket.io-client** — Real-time communication

### Backend
- **Node.js + Express.js** — REST API & WebSocket server
- **MongoDB Atlas** — Cloud database
- **Passport.js** — Google & GitHub OAuth strategies
- **Socket.io** — Real-time bidirectional communication
- **JWT** — Stateless authentication via HttpOnly cookies

---

## 🏗️ Architecture

```
Client (React/Vite)
      │
      ├── REST API calls ──────────────► Express Server (Node.js)
      │                                        │
      └── WebSocket (Socket.io) ──────────────►│
                                               ├── MongoDB Atlas (data)
                                               ├── Passport.js (OAuth)
                                               └── Yjs (CRDT sync)
```

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_URL=https://your-server-url
VITE_SOCKET_URL=https://your-server-url
```

> ⚠️ Vite env vars must be present at **build time** — they are baked into the bundle during `vite build`.

### Server (`server/.env`)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CLIENT_URL=http://localhost:5173   # origin of the CLIENT
PORT=5000                          # optional, default 5000
NODE_ENV=development               # dev => cookies work over plain HTTP
```

> A ready-to-copy template lives at `server/.env.example` (and
> `client/.env.example` for the Vite vars).

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google & GitHub OAuth credentials

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Mujakkir-Pathan/U2Collab.git
cd U2Collab

# 2. Setup server
cd server
cp .env.example .env        # Fill in your env variables
npm install
npm run dev                 # Runs on http://localhost:5000

# 3. Setup client (new terminal)
cd client
cp .env.example .env        # Fill in VITE_API_URL and VITE_SOCKET_URL
npm install
npm run dev                 # Runs on http://localhost:5173
```

---

## 🐳 Running with Docker

```bash
# Build and run server
docker build -t u2collab-server ./server
docker run --env-file ./server/.env -p 5000:5000 u2collab-server

# Build and run client (VITE vars must be passed at BUILD time)
docker build \
  --build-arg VITE_API_URL=http://localhost:5000 \
  --build-arg VITE_SOCKET_URL=http://localhost:5000 \
  -t u2collab-client ./client
docker run -p 5173:80 u2collab-client
```

---

## 📁 Project Structure

```
U2Collab/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   └── socket.js        # Socket.io client setup
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                  # Node.js + Express backend
│   ├── routes/              # API routes
│   ├── models/              # MongoDB schemas
│   ├── config/              # Passport strategies
│   ├── socket/              # Socket.io handlers
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🌐 Deployment

Production runs on **AWS EKS** with GitOps — see **[Deploy.md](Deploy.md)** for
the full walkthrough (`scripts/deploy.sh` shortcuts it).

| Layer | Platform |
|-------|----------|
| CI/CD | GitHub Actions (`.github/workflows/`) |
| Deploy | ArgoCD (GitOps: merge to `main` → sync) |
| Cluster | AWS EKS + Envoy Gateway (Gateway API) |
| Database | MongoDB Atlas |
| Images | DockerHub (`charanbavaji/u2collab-client`, `charanbavaji/u2collab-server`) |
| Local dev | `make up` (docker compose) |

---

## 👨‍💻 Author

**Charan Bavaji**
- GitHub: [github.com/Charan-bavaji](https://github.com/Charan-bavaji)
- LinkedIn: [linkedin.com/in/charan-bavaji](https://linkedin.com/in/charan-bavaji)


test
