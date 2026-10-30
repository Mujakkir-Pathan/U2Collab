import { useState } from "react";
import { motion } from "framer-motion";

const links = {
    Product: ["Features", "Pricing", "Blog", "Changelog", "Company"],
    About: ["Contact", "Support", "Careers", "Legal", "Privacy"],
    Terms: ["Security", "Status", "Docs", "API", "Integrations"],
};
const THEMES = {
    dark: {
        bg: '#0D0D0F',
        surface: '#131316',
        surfaceHover: '#1A1A1F',
        border: '#222228',
        borderStr: '#2E2E38',
        text: '#F0F0F4',
        textMuted: '#7C7C8A',
        textFaint: '#3A3A44',
        accent: '#7C6AF7',
        blue: '#4F46E5',
        accentFaint: 'rgba(124,106,247,0.12)',
        accentGlow: 'rgba(124,106,247,0.25)',
        glass: 'rgba(19,19,22,0.92)',
        shadow: '0 8px 32px rgba(0,0,0,0.6)',
        shadowSm: '0 2px 8px rgba(0,0,0,0.35)',
        codeBlock: '#0A0A0C',
        quote: 'rgba(124,106,247,0.2)',
        selection: 'rgba(124,106,247,0.25)',
    },
    light: {
        bg: '#F5F5F7',
        surface: '#FFFFFF',
        surfaceHover: '#F9F9FB',
        border: '#E5E5EA',
        borderStr: '#D1D1D8',
        text: '#18181B',
        textMuted: '#6B6B78',
        textFaint: '#C0C0CC',
        accent: '#6355E8',
        accentFaint: 'rgba(99,85,232,0.08)',
        accentGlow: 'rgba(99,85,232,0.18)',
        glass: 'rgba(255,255,255,0.94)',
        shadow: '0 8px 32px rgba(0,0,0,0.09)',
        shadowSm: '0 2px 8px rgba(0,0,0,0.06)',
        codeBlock: '#F0F0F5',
        quote: 'rgba(99,85,232,0.08)',
        selection: 'rgba(99,85,232,0.18)',
    },
}
const socialIcons = {
    Facebook: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    Instagram: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" strokeWidth="0" />
        </svg>
    ),
    X: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    LinkedIn: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    YouTube: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
    ),
};

export default function Footer() {
    const [email, setEmail] = useState("");

    return (
        <footer
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
            className="bg-white text-zinc-800"
        >
            {/* Main footer card */}
            <div className="max-w-full mx-auto px-4 sm:px-8 py-8">
                <div className="border border-zinc-200 rounded-2xl px-6 sm:px-10 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">

                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 6,
                                // background: `linear-gradient(135deg, ${THEMES.light.accent}, ${THEMES.light.accentHover})`,
                                background: THEMES.light.accent,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 12 12" fill="white">
                                    <rect x="1" y="1" width="4" height="4" rx="1" />
                                    <rect x="7" y="1" width="4" height="4" rx="1" />
                                    <rect x="1" y="7" width="4" height="4" rx="1" />
                                    <rect x="7" y="7" width="4" height="4" rx="1" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 24, fontWeight: 600, color: THEMES.light.text, letterSpacing: '-.01em' }}>
                                U2Collab
                            </span>
                        </div>

                        {/* Link columns */}
                        {Object.entries(links).map(([category, items]) => (
                            <div key={category}>
                                <p className="text-sm font-semibold text-zinc-900 mb-3">{category}</p>
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Newsletter */}
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-sm font-semibold text-zinc-900 mb-1">Updates</p>
                            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
                                Get the latest on new features, improvements, and what we're building next.
                            </p>

                            {/* Input + button */}
                            <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden mb-3">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 text-sm px-2 py-2 outline-none text-zinc-700 placeholder-zinc-400 bg-white"
                                />
                                <motion.button
                                    whileHover={{ backgroundColor: "#18181b" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-zinc-900 text-white text-xs font-semibold px-2 py-2.5  whitespace-nowrap transition-colors"
                                >
                                    Subscribe
                                </motion.button>
                            </div>

                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                                By subscribing you agree to our Privacy Policy and consent to receive updates.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">

                    {/* Left: copyright + legal links */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center sm:justify-start">
                        <span>© 2025 U2Collab. All rights reserved.</span>
                        {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((label) => (
                            <a
                                key={label}
                                href="#"
                                className="underline underline-offset-2 hover:text-zinc-800 transition-colors"
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* Right: social icons */}
                    <div className="flex items-center gap-3">
                        {Object.entries(socialIcons).map(([name, icon]) => (
                            <motion.a
                                key={name}
                                href="#"
                                aria-label={name}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                {icon}
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}