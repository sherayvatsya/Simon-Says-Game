# SimonX – Ultimate Memory Challenge

SimonX is a portfolio-worthy, production-ready full-stack memory sequencing game. Built with premium dark gaming theme aesthetics, the application includes multiple single-player game modes, an adaptive AI speed adjustment system, and real-time multiplayer duels.

---

## ⚡ Quick Start

### 1. Run the Backend Server
```bash
cd server
npm install
npm run dev
```
*Note: Connects to a local MongoDB instance by default (`mongodb://127.0.0.1:27017/simonx`). In-memory fallbacks are automatically initialized for missing Redis, Nodemailer, and Cloudinary keys.*

### 2. Run the Frontend Client
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion (premium glow animations)
- **State**: Zustand (Auth, Game Engine, and WebSockets stores)
- **Data Caching**: TanStack Query (Axios client)
- **Audio**: Howler.js (with a Web Audio API synth oscillator offline fallback)
- **PWA**: Custom Service Worker pre-caching for offline play support

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas via Mongoose ODM
- **Real-time Duels**: Socket.io (matching queues, input streams, and score check daggers)
- **Security**: Helmet headers, CORS filters, API Rate Limiting, and JWT tokens validation
