import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import mainImg from "/mainImg.png"

// ── Floating presence avatars ───────────────────────────────────────────────
const AVATARS = [
    { name: "Aria K.", color: "#2563EB", initials: "AK", x: "18%", y: "22%", delay: 0.6 },
    { name: "Tom S.", color: "#10B981", initials: "TS", x: "74%", y: "15%", delay: 0.75 },
    { name: "Priya M.", color: "#F59E0B", initials: "PM", x: "82%", y: "58%", delay: 0.9 },
    { name: "Luis R.", color: "#8B5CF6", initials: "LR", x: "10%", y: "65%", delay: 1.0 },
];

const STATS = [
    { value: "50k+", label: "Teams" },
    { value: "2M+", label: "Docs created" },
    { value: "99.9%", label: "Uptime" },
    { value: "<50ms", label: "Sync latency" },
];

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingDot({ delay }) {
    return (
        <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
        />
    );
}

// ── Live cursor ───────────────────────────────────────────────────────────────
function LiveCursor({ color, name, x, y, delay }) {
    return (
        <motion.div
            className="absolute pointer-events-none z-20"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4, ease: "backOut" }}
        >
            <motion.div
                animate={{ x: [0, 8, -4, 6, 0], y: [0, -6, 4, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
            >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M0 0L0 16L4.5 12L7 18L9 17L6.5 11L11 11L0 0Z" fill={color} stroke="white" strokeWidth="1" />
                </svg>
                <motion.div
                    className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white whitespace-nowrap shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    {name}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// ── Floating UI card ──────────────────────────────────────────────────────────
function FloatingCard({ children, className, delay = 0, floatY = 8 }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                animate={{ y: [0, -floatY, 0] }}
                transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// ── Animated word reveal ──────────────────────────────────────────────────────
function AnimatedHeading({ text }) {
    return (
        <span>
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.22em]"
                    initial={{ opacity: 0, y: 32, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

// ════════════════════════════════════════════════════════════
// ── FLOATING BACKGROUND COMPONENTS ──────────────────────────
// ════════════════════════════════════════════════════════════

const BG_CURSORS = [
    { color: "#2563EB", x: "5%", y: "12%", dur: 14, delay: 0, size: 14, opacity: 0.18 },
    { color: "#10B981", x: "88%", y: "8%", dur: 18, delay: 2, size: 12, opacity: 0.15 },
    { color: "#F59E0B", x: "92%", y: "72%", dur: 12, delay: 1, size: 16, opacity: 0.18 },
    { color: "#8B5CF6", x: "3%", y: "80%", dur: 16, delay: 3, size: 13, opacity: 0.15 },
    { color: "#2563EB", x: "50%", y: "5%", dur: 20, delay: 0.5, size: 10, opacity: 0.10 },
    { color: "#EF4444", x: "75%", y: "88%", dur: 15, delay: 4, size: 11, opacity: 0.12 },
];

function CRDTGraph({ style }) {
    const nodes = [
        { cx: 30, cy: 30 }, { cx: 90, cy: 15 }, { cx: 140, cy: 50 },
        { cx: 60, cy: 80 }, { cx: 120, cy: 90 },
    ];
    const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 3]];
    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
            <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg width="170" height="110" viewBox="0 0 170 110">
                    {edges.map(([a, b], i) => (
                        <motion.line key={i}
                            x1={nodes[a].cx} y1={nodes[a].cy} x2={nodes[b].cx} y2={nodes[b].cy}
                            stroke="#2563EB" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
                        />
                    ))}
                    {nodes.map((n, i) => (
                        <motion.circle key={i} cx={n.cx} cy={n.cy} r="5"
                            fill={colors[i]} fillOpacity="0.35" stroke={colors[i]} strokeOpacity="0.5" strokeWidth="1"
                            animate={{ r: [5, 6.5, 5] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                        />
                    ))}
                </svg>
                <p style={{ fontSize: "9px", color: "#2563EB", opacity: 0.4, textAlign: "center", fontFamily: "monospace", marginTop: "-4px", letterSpacing: "0.08em" }}>
                    CRDT · Yjs
                </p>
            </motion.div>
        </motion.div>
    );
}

function CodeChip({ code, color, style, delay, dur }) {
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}>
                <div style={{
                    background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
                    border: `1px solid ${color}30`, borderLeft: `2.5px solid ${color}`,
                    borderRadius: "8px", padding: "6px 10px", fontFamily: "monospace",
                    fontSize: "9.5px", color: "#374151", whiteSpace: "pre",
                    boxShadow: `0 4px 16px ${color}10`, lineHeight: 1.6,
                }}>
                    {code}
                </div>
            </motion.div>
        </motion.div>
    );
}

function WsPulse({ style, color, delay }) {
    return (
        <motion.div className="absolute pointer-events-none"
            style={{ ...style, width: 48, height: 48 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
            {[0, 0.6, 1.2].map((d, i) => (
                <motion.div key={i} style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: `1.5px solid ${color}`, opacity: 0,
                }}
                    animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: d, ease: "easeOut" }}
                />
            ))}
            <div style={{ position: "absolute", inset: "40%", borderRadius: "50%", backgroundColor: color, opacity: 0.6 }} />
            <p style={{ position: "absolute", top: "56px", left: "50%", transform: "translateX(-50%)", fontSize: "8px", color, opacity: 0.5, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                ws://sync
            </p>
        </motion.div>
    );
}

function StickyNote({ text, color, style, delay, dur }) {
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0, rotate: -6 }} animate={{ opacity: 1, rotate: -3 }} transition={{ delay, duration: 0.5 }}>
            <motion.div
                animate={{ y: [0, -7, 0], rotate: [-3, 0, -3] }}
                transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
            >
                <div style={{
                    width: "82px", padding: "8px", background: color,
                    borderRadius: "4px", boxShadow: "2px 4px 12px rgba(0,0,0,0.10)",
                    fontSize: "9px", color: "#1f2937", lineHeight: 1.5, fontFamily: "sans-serif",
                }}>
                    {text}
                </div>
            </motion.div>
        </motion.div>
    );
}

function DocFragment({ style, delay, dur }) {
    const lines = [70, 90, 55, 80, 40];
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
            <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}>
                <div style={{
                    width: "88px", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)",
                    border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: "#2563EB", opacity: 0.7 }} />
                        <div style={{ height: 4, flex: 1, background: "#e5e7eb", borderRadius: 2 }} />
                    </div>
                    {lines.map((w, i) => (
                        <div key={i} style={{
                            height: 3, width: `${w}%`,
                            background: i === 1 ? "#2563EB30" : "#e5e7eb",
                            borderRadius: 2, marginBottom: 4,
                        }} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Composed FloatingBackground ───────────────────────────────────────────────
function FloatingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* dot grid */}
            <div style={{
                position: "absolute", inset: 0, opacity: 0.45,
                backgroundImage: "radial-gradient(circle, #2563EB18 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }} />

            {/* soft colour glows */}
            <div style={{ position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)", width: 700, height: 340, background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: 0, right: "-100px", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: "30%", left: "-80px", width: 320, height: 320, background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />

            {/* drifting mini cursors */}
            {BG_CURSORS.map((c, i) => (
                <motion.div key={i}
                    style={{ position: "absolute", left: c.x, top: c.y, opacity: c.opacity }}
                    animate={{ y: [0, -18, 8, -10, 0], x: [0, 6, -4, 8, 0] }}
                    transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
                >
                    <svg width={c.size} height={c.size * 1.2} viewBox="0 0 18 20" fill="none">
                        <path d="M0 0L0 16L4.5 12L7 18L9 17L6.5 11L11 11L0 0Z" fill={c.color} />
                    </svg>
                </motion.div>
            ))}

            {/* CRDT node graphs */}
            <CRDTGraph style={{ left: "1%", top: "28%", opacity: 0.7 }} />
            <CRDTGraph style={{ right: "1%", top: "55%", opacity: 0.5, transform: "scaleX(-1)" }} />

            {/* Code chips */}
            <CodeChip code={`doc.getText('body')\n  .insert(0, 'Hello')`} color="#2563EB" style={{ left: "2%", top: "8%" }} delay={0.6} dur={11} />
            <CodeChip code={`socket.emit(\n  'sync', delta)`} color="#10B981" style={{ right: "2%", top: "18%" }} delay={0.9} dur={13} />
            <CodeChip code={`Y.applyUpdate(\n  doc, update)`} color="#8B5CF6" style={{ right: "2%", bottom: "22%" }} delay={1.2} dur={10} />
            <CodeChip code={`merge(opA, opB)\n// conflict-free`} color="#F59E0B" style={{ left: "2%", bottom: "18%" }} delay={1.5} dur={14} />

            {/* WebSocket pulses */}
            <WsPulse style={{ left: "45%", top: "6%" }} color="#2563EB" delay={0.5} />
            <WsPulse style={{ left: "15%", bottom: "12%" }} color="#10B981" delay={1.2} />
            <WsPulse style={{ right: "8%", top: "42%" }} color="#8B5CF6" delay={2.0} />

            {/* Sticky notes */}
            <StickyNote text="✏️ Aria editing intro..." color="#FEF9C3" style={{ left: "38%", top: "3%" }} delay={1.0} dur={12} />
            <StickyNote text="💬 Review by EOD" color="#D1FAE5" style={{ right: "14%", bottom: "8%" }} delay={1.4} dur={9} />
            <StickyNote text="🎨 Whiteboard idea" color="#EDE9FE" style={{ left: "8%", top: "52%" }} delay={1.8} dur={11} />

            {/* Doc fragments */}
            <DocFragment style={{ right: "6%", top: "6%" }} delay={0.7} dur={10} />
            <DocFragment style={{ left: "42%", bottom: "5%" }} delay={1.1} dur={13} />
        </div>
    );
}

// ── Main HeroSection ──────────────────────────────────────────────────────────
export default function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative bg-[#F2F2F2] overflow-hidden">

            {/* ── ANIMATED CONCEPT BACKGROUND ── */}
            <FloatingBackground />

            {/* ── TEXT BLOCK ── */}
            <motion.div
                style={{ y: textY, opacity: textOpacity }}
                className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-14 text-center"
            >
                <h1 className="text-[52px] sm:text-[68px] font-black leading-[1.05] tracking-tight text-gray-900 mb-6">
                    <AnimatedHeading text="Work together in" />
                    <br />
                    <span className="relative">
                        <AnimatedHeading text="real time," />
                        <motion.svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 10"
                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}>
                            <motion.path d="M0 6 Q75 1 150 6 Q225 11 300 6"
                                stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ delay: 0.9, duration: 0.7 }} />
                        </motion.svg>
                    </span>{" "}
                    <motion.span className="text-blue-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <AnimatedHeading text="no delays" />
                    </motion.span>
                </h1>

                <motion.p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}>
                    U2Collab brings your team into one shared space. Edit documents, sketch ideas, and chat instantly with everyone on the same page.
                </motion.p>

                <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.45 }}>
                    <motion.a href="#"
                        whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(37,99,235,0.35)" }} whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] rounded-xl shadow-md shadow-blue-200 transition-colors no-underline">
                        Start free
                        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </motion.a>
                    <motion.a href="#"
                        whileHover={{ scale: 1.03, backgroundColor: "#fff" }} whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white border border-gray-200 text-gray-800 font-semibold text-[15px] rounded-xl transition-colors no-underline shadow-sm">
                        <motion.div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center" whileHover={{ scale: 1.15 }}>
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0L10 6L0 12V0Z" /></svg>
                        </motion.div>
                        Watch demo
                    </motion.a>
                </motion.div>

                <motion.div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
                    <div className="flex -space-x-2">
                        {AVATARS.map((a) => (
                            <div key={a.initials} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: a.color }}>
                                {a.initials}
                            </div>
                        ))}
                    </div>
                    <p className="text-[13px] text-gray-500">
                        <span className="font-semibold text-gray-800">2,400+</span> teams collaborating right now
                    </p>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ))}
                        <span className="text-[12px] text-gray-500 ml-1">4.9/5</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── HERO IMAGE + OVERLAY CARDS ── */}
            <div className="relative max-w-6xl mx-auto px-4 pb-0">
                <motion.div
                    className="relative rounded-t-2xl overflow-hidden shadow-2xl shadow-gray-400/20"
                    style={{ y: imageY, scale: imageScale }}
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <img src={mainImg} alt="Team collaborating" className="w-full object-cover" style={{ height: "520px" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent" />

                    {AVATARS.map((a) => <LiveCursor key={a.initials} {...a} />)}

                    {/* Editor card */}
                    <FloatingCard className="absolute top-6 left-6 w-64 z-30" delay={1.1} floatY={6}>
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg shadow-gray-300/30 p-3.5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live editor</span>
                            </div>
                            <p className="text-[13px] text-gray-800 font-medium leading-snug">"Q2 roadmap synced across 8 members instantly"</p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <TypingDot delay={0} /><TypingDot delay={0.15} /><TypingDot delay={0.3} />
                                <span className="text-[10px] text-gray-400 ml-1">3 editing now</span>
                            </div>
                        </div>
                    </FloatingCard>

                    {/* Sync card */}
                    <FloatingCard className="absolute top-6 right-6 w-52 z-30" delay={1.25} floatY={7}>
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sync speed</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">● Live</span>
                            </div>
                            <div className="text-[28px] font-black text-gray-900 leading-none">
                                47<span className="text-[14px] font-medium text-gray-400">ms</span>
                            </div>
                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: ["40%", "85%", "55%", "90%", "60%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                                />
                            </div>
                        </div>
                    </FloatingCard>

                    {/* Whiteboard card */}
                    <FloatingCard className="absolute bottom-8 left-6 w-56 z-30" delay={1.4} floatY={5}>
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                                    </svg>
                                </div>
                                <span className="text-[12px] font-semibold text-gray-700">Whiteboard</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F2F2F2"].map((c, i) => (
                                    <motion.div key={i} className="h-7 rounded-lg border border-gray-100" style={{ backgroundColor: c }}
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.07 }} />
                                ))}
                            </div>
                            <p className="text-[10.5px] text-gray-400 mt-2">4 sticky notes added</p>
                        </div>
                    </FloatingCard>

                    {/* Members active card */}
                    <FloatingCard className="absolute bottom-8 right-6 w-52 z-30" delay={1.5} floatY={6}>
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Online now</p>
                            <div className="flex flex-col gap-1.5">
                                {AVATARS.map((a, i) => (
                                    <motion.div key={a.initials} className="flex items-center gap-2"
                                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 + i * 0.08 }}>
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ backgroundColor: a.color }}>{a.initials}</div>
                                        <span className="text-[12px] text-gray-700 font-medium">{a.name}</span>
                                        <motion.div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                                            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </FloatingCard>
                </motion.div>
            </div>

            {/* ── STATS ROW ── */}
            {/* <motion.div className="relative z-10 max-w-4xl mx-auto px-4 py-10"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.5 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATS.map((s, i) => (
                        <motion.div key={s.label}
                            className="text-center bg-white rounded-xl border border-gray-100 py-4 shadow-sm"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + i * 0.08 }}
                            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
                            <p className="text-[24px] font-black text-gray-900">{s.value}</p>
                            <p className="text-[12px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div> */}
        </section>
    );
}