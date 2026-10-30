import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contex/AuthContext'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Icons ─────────────────────────────────────────────────────── */
const Icon = {
    Grid: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    Users: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
    Search: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
    File: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>),
    Share: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>),
    Plus: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
    Link: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>),
    Send: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>),
    Logout: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
    Crown: () => (<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v2H2zM4 18l4-10 4 5 4-8 4 13H4z" /></svg>),
    Clock: () => (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
    X: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    Sparkle: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" /></svg>),
    Dots: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>),
    Monitor: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>),
    Phone: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>),
    Globe: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>),
}

/* ─── CSS ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #191919;
    --bg-sidebar: #1f1f1f;
    --bg-card:    #272727;
    --bg-hover:   #2c2c2c;
    --bg-active:  #303030;
    --bg-compose: #202020;
    --border:     rgba(255,255,255,0.065);
    --border-md:  rgba(255,255,255,0.1);
    --border-hi:  rgba(255,255,255,0.16);
    --text-1:     #efefef;
    --text-2:     #999;
    --text-3:     #555;
    --accent:     #6366f1;
    --accent-dim: rgba(99,102,241,0.12);
    --green:      #34d399;
    --amber:      #fbbf24;
    --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 22px; --r-pill: 100px;
  }

  .d-wrap {
    display: flex; flex-direction: column; height: 100vh; overflow: hidden;
    background: var(--bg);
    font-family: 'Geist', -apple-system, sans-serif;
    color: var(--text-1);
    background-image:
      radial-gradient(ellipse 60% 40% at 70% 15%, rgba(99,102,241,0.055) 0%, transparent 60%),
      radial-gradient(ellipse 40% 50% at 85% 80%, rgba(139,92,246,0.04) 0%, transparent 55%);
  }

  /* noise grain */
  .d-wrap::after {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.6;
  }

  /* ── Topbar ── */
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.1rem; height: 50px; flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    position: relative; z-index: 10;
  }
  .topbar-left { display: flex; align-items: center; gap: 0.55rem; }
  .logo { font-size: 1rem; font-weight: 700; letter-spacing: -0.025em; color: var(--text-1); }
  .beta-tag {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    border: 1px solid var(--border-md); border-radius: 5px;
    padding: 0.08rem 0.38rem; color: var(--text-3);
  }
  .topbar-right { display: flex; align-items: center; gap: 0.35rem; }
  .tb-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: var(--r-sm);
    background: transparent; border: none; color: var(--text-2);
    cursor: pointer; transition: all 0.13s;
  }
  .tb-btn:hover { background: var(--bg-hover); color: var(--text-1); }
  .user-avatar {
    width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid var(--border-md); cursor: pointer;
  }
  .user-avatar-fallback {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.62rem; font-weight: 700; color: #fff; cursor: pointer;
    border: 1.5px solid var(--border-md);
  }

  /* ── Layout ── */
  .d-body { display: flex; flex: 1; overflow: hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width: 255px; flex-shrink: 0;
    background: var(--bg-sidebar); border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 0.7rem 0.6rem 0.7rem; overflow: hidden;
    position: relative; z-index: 5;
  }

  .tab-bar {
    display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
    background: var(--bg-card); border-radius: var(--r-md); padding: 3px;
  }
  .tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
    padding: 0.38rem 0; border-radius: 9px; border: none; cursor: pointer;
    font-size: 0.76rem; font-weight: 500; font-family: 'Geist', sans-serif;
    color: var(--text-2); background: transparent; transition: all 0.15s;
  }
  .tab.on { background: var(--bg-active); color: var(--text-1); }
  .tab:hover:not(.on) { color: var(--text-1); }

  .sb-search {
    display: flex; align-items: center; gap: 0.45rem;
    background: rgba(0,0,0,0.2); border: 1px solid var(--border);
    border-radius: var(--r-md); padding: 0.45rem 0.7rem;
    margin-bottom: 0.85rem; transition: border-color 0.15s;
  }
  .sb-search:focus-within { border-color: var(--border-md); }
  .sb-search input {
    background: transparent; border: none; outline: none;
    color: var(--text-1); font-size: 0.8rem; font-family: 'Geist', sans-serif; width: 100%;
  }
  .sb-search input::placeholder { color: var(--text-3); }

  .sb-label {
    font-size: 0.68rem; font-weight: 500; letter-spacing: 0.05em;
    color: var(--text-3); padding: 0 0.3rem; margin-bottom: 0.35rem;
  }

  .room-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
  .room-scroll::-webkit-scrollbar { width: 0; }

  .room-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.48rem 0.45rem; border-radius: var(--r-sm);
    cursor: pointer; transition: background 0.12s; user-select: none;
  }
  .room-row:hover { background: var(--bg-hover); }
  .room-row.sel { background: var(--bg-active); }

  .r-thumb {
    width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
    background: var(--bg-card); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: #818cf8;
    font-family: 'Geist', sans-serif;
  }
  .r-info { flex: 1; min-width: 0; }
  .r-name {
    font-size: 0.81rem; font-weight: 500; color: var(--text-1);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
  }
  .r-sub { display: flex; align-items: center; gap: 0.45rem; margin-top: 0.12rem; }
  .r-meta { display: flex; align-items: center; gap: 0.2rem; font-size: 0.68rem; color: var(--text-3); }
  .r-owner { color: var(--amber); }
  .r-recent { color: var(--green); }

  .sb-foot {
    padding-top: 0.6rem; border-top: 1px solid var(--border); margin-top: 0.5rem;
  }
  .new-btn {
    display: flex; align-items: center; gap: 0.45rem;
    width: 100%; padding: 0.45rem 0.55rem; border-radius: var(--r-sm);
    background: transparent; border: none; color: var(--text-2);
    font-size: 0.8rem; font-weight: 500; font-family: 'Geist', sans-serif;
    cursor: pointer; transition: all 0.13s; text-align: left;
  }
  .new-btn:hover { background: var(--bg-hover); color: var(--text-1); }

  /* ── Main ── */
  .main {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    display: flex; flex-direction: column;
    position: relative;
  }
  .main::-webkit-scrollbar { width: 0; }

  /* Announce */
  .announce {
    display: flex; align-items: center; gap: 0.7rem;
    margin: 0.9rem 1.4rem 0 auto; width: fit-content;
    background: var(--bg-card); border: 1px solid var(--border-md);
    border-radius: var(--r-pill); padding: 0.37rem 0.55rem 0.37rem 0.85rem;
  }
  .ann-text {
    font-size: 0.78rem; color: var(--text-1);
    text-decoration: underline; text-underline-offset: 2px; cursor: pointer; white-space: nowrap;
  }
  .ann-close {
    background: transparent; border: none; color: var(--text-3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%; transition: all 0.13s;
  }
  .ann-close:hover { background: var(--bg-hover); color: var(--text-1); }

  /* Hero */
  .hero { padding: 2.5rem 3rem 1.2rem; }
  .hero-title {
    font-size: clamp(2.6rem, 5.5vw, 4.2rem); font-weight: 700;
    letter-spacing: -0.04em; line-height: 1.02; color: var(--text-1); margin-bottom: 1.3rem;
  }

  /* Chips */
  .chips { display: flex; gap: 0.45rem; overflow-x: auto; padding-bottom: 2px; margin-bottom: 1.4rem; }
  .chips::-webkit-scrollbar { height: 0; }
  .chip {
    flex-shrink: 0; background: rgba(255,255,255,0.055); border: 1px solid var(--border);
    border-radius: var(--r-pill); padding: 0.38rem 0.85rem;
    font-size: 0.76rem; color: var(--text-2); cursor: pointer; transition: all 0.14s;
    white-space: nowrap;
  }
  .chip:hover { background: rgba(255,255,255,0.1); color: var(--text-1); border-color: var(--border-md); }

  /* Compose */
  .compose {
    margin: 0 3rem 0.9rem;
    background: var(--bg-compose); border: 1px solid var(--border-md);
    border-radius: var(--r-xl); padding: 1rem 1.1rem 0.75rem;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.25);
    transition: border-color 0.2s;
  }
  .compose:focus-within { border-color: var(--border-hi); }
  .compose-ta {
    width: 100%; background: transparent; border: none; outline: none;
    color: var(--text-1); font-size: 0.9rem; resize: none;
    font-family: 'Geist', sans-serif; line-height: 1.55; min-height: 85px; display: block;
  }
  .compose-ta::placeholder { color: var(--text-3); }
  .compose-bar {
    display: flex; align-items: center; justify-content: space-between; margin-top: 0.55rem;
  }
  .compose-l { display: flex; align-items: center; gap: 0.3rem; }
  .compose-r { display: flex; align-items: center; gap: 0.45rem; }

  .c-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%;
    background: transparent; border: none; color: var(--text-3); cursor: pointer; transition: all 0.13s;
  }
  .c-icon-btn:hover { background: var(--bg-hover); color: var(--text-1); }

  .type-seg {
    display: flex; gap: 0.15rem;
    background: var(--bg-card); border-radius: var(--r-pill); padding: 3px;
  }
  .type-seg-btn {
    display: flex; align-items: center; gap: 0.32rem;
    padding: 0.3rem 0.7rem; border-radius: var(--r-pill); border: none;
    font-size: 0.75rem; font-weight: 500; font-family: 'Geist', sans-serif;
    color: var(--text-2); background: transparent; cursor: pointer; transition: all 0.14s;
  }
  .type-seg-btn.on { background: var(--bg-active); color: var(--text-1); }
  .type-seg-btn:hover:not(.on) { color: var(--text-1); }

  .model-badge {
    display: flex; align-items: center; gap: 0.35rem;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--r-pill); padding: 0.28rem 0.65rem;
    font-size: 0.73rem; color: var(--text-2); cursor: pointer; transition: all 0.13s;
  }
  .model-badge:hover { border-color: var(--border-md); color: var(--text-1); }
  .model-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

  .send {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    background: var(--text-1); color: #111;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.13s;
  }
  .send:hover { opacity: 0.85; transform: scale(1.07); }

  /* Join row */
  .join-wrap { display: flex; gap: 0.5rem; margin: 0 3rem 0.75rem; }
  .join-in {
    flex: 1; background: rgba(0,0,0,0.18); border: 1px solid var(--border);
    border-radius: var(--r-md); padding: 0.52rem 0.85rem;
    color: var(--text-1); font-size: 0.81rem; font-family: 'Geist', sans-serif; outline: none;
    transition: border-color 0.15s;
  }
  .join-in:focus { border-color: var(--border-md); }
  .join-in::placeholder { color: var(--text-3); }
  .join-btn {
    display: flex; align-items: center; gap: 0.38rem;
    padding: 0.52rem 1rem; border-radius: var(--r-md);
    background: var(--bg-card); border: 1px solid var(--border-md);
    color: var(--text-2); font-size: 0.79rem; font-weight: 500;
    font-family: 'Geist', sans-serif; cursor: pointer; transition: all 0.13s; white-space: nowrap;
  }
  .join-btn:hover { background: var(--bg-hover); color: var(--text-1); }

  /* Design.md */
  .design-bar { display: flex; justify-content: center; padding: 0 3rem 1.5rem; }
  .design-pill {
    display: flex; align-items: center; gap: 0.5rem;
    background: var(--bg-card); border: 1px solid var(--border-md);
    border-radius: var(--r-pill); padding: 0.48rem 1.1rem;
    font-size: 0.8rem; color: var(--text-2); cursor: pointer; transition: all 0.14s;
  }
  .design-pill:hover { border-color: var(--border-hi); color: var(--text-1); }

  /* Footer actions */
  .main-foot {
    margin-top: auto; display: flex; justify-content: flex-end;
    padding: 0 1.4rem 0.9rem;
  }
  .sign-out {
    display: flex; align-items: center; gap: 0.35rem;
    background: transparent; border: none; color: var(--text-3);
    font-size: 0.74rem; font-family: 'Geist', sans-serif; cursor: pointer; transition: color 0.13s;
  }
  .sign-out:hover { color: var(--text-2); }

  /* Corner */
  .corner {
    position: fixed; bottom: 0.85rem; right: 0.85rem;
    width: 26px; height: 26px; border-radius: 6px;
    background: var(--bg-card); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-3); cursor: pointer; z-index: 100;
    transition: all 0.13s;
  }
  .corner:hover { background: var(--bg-hover); color: var(--text-2); }
`

/* ─── Helpers ─────────────────────────────────────────────────── */
const getInitials = n => (n || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Mar 14, 2026'

const PROMPTS = [
    'A real-time collab whiteboard for design teams',
    'A kanban board with live presence indicators',
    'A mood-board room with drag-and-drop media',
    'A shared doc editor with inline commenting',
    'A brainstorm space with sticky notes & voting',
]

/* ─── JoinByLink ─────────────────────────────────────────────── */
const JoinByLink = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const join = async () => {
        let c = code.trim(); if (!c) return
        if (c.includes('/')) { const p = c.split('/'); c = p[p.length - 1] }
        const { data } = await api.post(`/rooms/join/${c}`)
        navigate(`/room/${data.roomId}`)
    }
    return (
        <div className="join-wrap">
            <input className="join-in" value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && join()}
                placeholder="Paste invite link or code to join a room…" />
            <button className="join-btn" onClick={join}><Icon.Link /> Join room</button>
        </div>
    )
}

/* ─── Dashboard ─────────────────────────────────────────────── */
const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [rooms, setRooms] = useState([])
    const [newName, setNewName] = useState('')
    const [tab, setTab] = useState('my')
    const [q, setQ] = useState('')
    const [announce, setAnnounce] = useState(true)
    const taRef = useRef(null)

    useEffect(() => { api.get('/rooms').then(r => setRooms(r.data)) }, [])

    const createRoom = async () => {
        if (!newName.trim()) return
        const { data } = await api.post('/rooms', { name: newName })
        setRooms(p => [data, ...p]); setNewName('')
        navigate(`/room/${data._id}`)
    }

    const myRooms = rooms.filter(r => r.isOwner)
    const joinedRooms = rooms.filter(r => !r.isOwner)
    const recent = [...rooms].filter(r => r.lastVisited)
        .sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited)).slice(0, 3)

    const list = (tab === 'my' ? [...myRooms, ...joinedRooms] : joinedRooms)
        .filter(r => r.name.toLowerCase().includes(q.toLowerCase()))

    return (
        <>
            <style>{css}</style>
            <div className="d-wrap">

                {/* Topbar */}
                <div className="topbar">
                    <Link to="/" className="topbar-left">
                        <span className="logo">U2Collab</span>
                    </Link>
                    <div className="topbar-right">
                        <button className="tb-btn" onClick={logout} title="Sign out"><Icon.Logout /></button>
                        {user?.avatar
                            ? <img src={user.avatar} className="user-avatar" alt={user.name} />
                            : <div className="user-avatar-fallback">{getInitials(user?.name)}</div>}
                    </div>
                </div>

                <div className="d-body">

                    {/* ── Sidebar ── */}
                    <div className="sidebar">
                        <div className="tab-bar">
                            <button className={`tab ${tab === 'my' ? 'on' : ''}`} onClick={() => setTab('my')}>
                                <Icon.Grid /> My rooms
                            </button>
                            <button className={`tab ${tab === 'shared' ? 'on' : ''}`} onClick={() => setTab('shared')}>
                                <Icon.Users /> Shared
                            </button>
                        </div>

                        <div className="sb-search">
                            <span style={{ color: 'var(--text-3)', flexShrink: 0 }}><Icon.Search /></span>
                            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search rooms" />
                        </div>

                        {/* Recent */}
                        {recent.length > 0 && tab === 'my' && (
                            <>
                                <p className="sb-label">Recently visited</p>
                                <div className="room-scroll" style={{ maxHeight: 115, marginBottom: '0.75rem' }}>
                                    {recent.map(r => (
                                        <motion.div key={`rc-${r._id}`} className="room-row"
                                            onClick={() => navigate(`/room/${r._id}`)}
                                            whileHover={{ x: 1.5 }} transition={{ duration: 0.1 }}>
                                            <div className="r-thumb">{getInitials(r.name)}</div>
                                            <div className="r-info">
                                                <div className="r-name">{r.name}</div>
                                                <div className="r-sub"><span className="r-meta r-recent"><Icon.Clock /> Recent</span></div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        <p className="sb-label">{tab === 'my' ? 'All rooms' : 'Shared with me'}</p>
                        <div className="room-scroll">
                            <AnimatePresence>
                                {list.length === 0 && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ fontSize: '0.76rem', color: 'var(--text-3)', padding: '0.75rem 0.3rem' }}>
                                        No rooms found.
                                    </motion.p>
                                )}
                                {list.map((r, i) => (
                                    <motion.div key={r._id} className="room-row"
                                        onClick={() => navigate(`/room/${r._id}`)}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.035, duration: 0.22 }}
                                        whileHover={{ x: 1.5 }}>
                                        <div className="r-thumb">{getInitials(r.name)}</div>
                                        <div className="r-info">
                                            <div className="r-name">{r.name}</div>
                                            <div className="r-sub">
                                                <span className="r-meta"><Icon.File /> {fmtDate(r.createdAt)}</span>
                                                {r.isOwner
                                                    ? <span className="r-meta r-owner"><Icon.Crown /> Owner</span>
                                                    : <span className="r-meta"><Icon.Share /> Shared</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="sb-foot">
                            <button className="new-btn" onClick={() => taRef.current?.focus()}>
                                <Icon.Plus /> New room
                            </button>
                        </div>
                    </div>

                    {/* ── Main ── */}
                    <div className="main">

                        {/* Announce */}
                        <AnimatePresence>
                            {announce && (
                                <motion.div className="announce"
                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.22 }}>
                                    <span className="ann-text">What's new in U2Collab </span>
                                    <button className="ann-close" onClick={() => setAnnounce(false)}><Icon.X /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hero */}
                        <motion.div className="hero"
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>
                            <h1 className="hero-title">
                                Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ' back'}..
                            </h1>

                            {/* Prompt chips */}
                            <div className="chips">
                                {PROMPTS.map((p, i) => (
                                    <motion.button key={i} className="chip"
                                        onClick={() => { setNewName(p); taRef.current?.focus() }}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.12 + i * 0.055, duration: 0.26 }}>
                                        {p}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Compose / Create room */}
                            {/* <div className="compose">
                                <textarea ref={taRef} className="compose-ta"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); createRoom() } }}
                                    placeholder="What shall we build together?"
                                    rows={3} />
                                <div className="compose-bar">
                                    <div className="compose-l">
                                        <button className="c-icon-btn" title="Attach"><Icon.Plus /></button>
                                        <div className="type-seg">
                                            {[
                                                { label: 'App', icon: <Icon.Phone /> },
                                                { label: 'Web', icon: <Icon.Globe /> },
                                            ].map(({ label, icon }) => (
                                                <button key={label}
                                                    className={`type-seg-btn ${activeType === label ? 'on' : ''}`}
                                                    onClick={() => setActiveType(label)}>
                                                    {icon} {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="compose-r">
                                        <div className="model-badge">
                                            <span className="model-dot" />
                                            <span>3 Flash</span>
                                        </div>
                                        <button className="c-icon-btn"><Icon.Dots /></button>
                                        <motion.button className="send" onClick={createRoom}
                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                                            title="Create room (Enter)">
                                            <Icon.Send />
                                        </motion.button>
                                    </div>
                                </div>
                                </div> */}
                        </motion.div>
                        <div className="join-wrap">
                            <input
                                ref={taRef}
                                className="join-in"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        createRoom();
                                    }
                                }}
                                placeholder="Add a name and create a new room…"
                            />

                            <button
                                className="join-btn"
                                onClick={createRoom}
                            >
                                <Icon.Plus /> Create Room
                            </button>
                        </div>

                        {/* Join by link */}
                        <JoinByLink />

                        {/* Design.md */}
                        <div className="design-bar">
                            <button className="design-pill">
                                <Icon.Sparkle /> Start with a DESIGN.md ▾
                            </button>
                        </div>

                        <div className="main-foot">
                            <button className="sign-out" onClick={logout}><Icon.Logout /> Sign out</button>
                        </div>
                    </div>
                </div>

                {/* Corner */}
                <div className="corner"><Icon.Monitor /></div>
            </div>
        </>
    )
}

export default Dashboard