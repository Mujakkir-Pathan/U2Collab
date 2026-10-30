import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
const MotionLink = motion(Link);

const NAV_LINKS = [
  { label: "Features", hasDropdown: true },
  { label: "Pricing", hasDropdown: false },
  { label: "Blog", hasDropdown: false },
  { label: "Resources", hasDropdown: true },
];
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

const MEGA_MENU = {
  Features: {
    sections: [
      {
        title: "Product",
        items: [
          {
            icon: <PenIcon />,
            label: "Editor",
            desc: "Real-time collaborative text editing with instant sync",
          },
          {
            icon: <BoardIcon />,
            label: "Whiteboard",
            desc: "Infinite canvas for sketches, shapes, and sticky notes",
          },
          {
            icon: <ChatIcon />,
            label: "Chat",
            desc: "Team messaging integrated directly into your workspace",
          },
          {
            icon: <PresenceIcon />,
            label: "Presence",
            desc: "See who's online, their cursors, and typing in real time",
          },
        ],
      },
      {
        title: "Company",
        items: [
          {
            icon: <AboutIcon />,
            label: "About",
            desc: "The story behind U2Collab and our mission",
          },
          {
            icon: <ContactIcon />,
            label: "Contact",
            desc: "Reach out to our team for support or inquiries",
          },
          {
            icon: <ChangelogIcon />,
            label: "Changelog",
            desc: "Latest updates and improvements to the platform",
          },
          {
            icon: <SecurityIcon />,
            label: "Security",
            desc: "How we protect your data and privacy",
          },
        ],
      },
      {
        title: "Legal",
        items: [
          {
            icon: <TermsIcon />,
            label: "Terms",
            desc: "Our terms of service and user agreement",
          },
          {
            icon: <PrivacyIcon />,
            label: "Privacy",
            desc: "How we handle and protect your information",
          },
          {
            icon: <StatusIcon />,
            label: "Status",
            desc: "Check system uptime and service status",
          },
          {
            icon: <DocsIcon />,
            label: "Docs",
            desc: "API documentation and developer guides",
          },
        ],
      },
      {
        title: "More",
        items: [
          { label: "API", desc: "" },
          { label: "Developers", desc: "" },
          { label: "Enterprise", desc: "" },
          { label: "Support", desc: "" },
          { label: "Status", desc: "" },
        ],
      },
    ],
  },
  Resources: {
    sections: [
      {
        title: "Learn",
        items: [
          { icon: <DocsIcon />, label: "Documentation", desc: "Full API & SDK reference" },
          { icon: <ChangelogIcon />, label: "Guides", desc: "Step-by-step tutorials" },
          { icon: <ChatIcon />, label: "Community", desc: "Join our developer forum" },
          { icon: <PenIcon />, label: "Blog", desc: "Tips, updates and deep dives" },
        ],
      },
      {
        title: "Tools",
        items: [
          { icon: <BoardIcon />, label: "Figma Plugin", desc: "Design with U2Collab components" },
          { icon: <SecurityIcon />, label: "CLI", desc: "Command-line tooling for devs" },
          { icon: <StatusIcon />, label: "Changelog", desc: "What shipped recently" },
          { icon: <PresenceIcon />, label: "Roadmap", desc: "What we're building next" },
        ],
      },
    ],
  },
};

// ── SVG icons ──────────────────────────────────────────────────────────────
function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function PresenceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function AboutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
function ContactIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function ChangelogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function SecurityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function TermsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function PrivacyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
  );
}
function StatusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function DocsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}
function U2CollabLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        // background: `linear-gradient(135deg, ${THEMES.light.accent}, ${THEMES.light.accentHover})`,
        background: THEMES.light.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
          <rect x="1" y="1" width="4" height="4" rx="1" />
          <rect x="7" y="1" width="4" height="4" rx="1" />
          <rect x="1" y="7" width="4" height="4" rx="1" />
          <rect x="7" y="7" width="4" height="4" rx="1" />
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 750, color: THEMES.light.text, letterSpacing: '-.01em' }}>
        U2Collab
      </span>
    </div>
  );
}

// ── Mega Menu Dropdown ──────────────────────────────────────────────────────
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -6, scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.2, ease: "easeOut" },
  }),
};

function MegaMenu({ menu }) {
  const { sections } = menu;
  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
      style={{ width: sections.length >= 4 ? "780px" : "520px" }}
    >
      {/* arrow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-sm" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden">
        <div
          className="grid gap-0 p-5"
          style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}
        >
          {sections.map((section, si) => (
            <div
              key={section.title}
              className={si < sections.length - 1 ? "pr-5 mr-5 border-r border-gray-100" : ""}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item, ii) => (
                  <motion.a
                    key={item.label}
                    href="#"
                    custom={si * section.items.length + ii}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="group flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-150 no-underline"
                  >
                    {item.icon && (
                      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors duration-150">
                        {item.icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 leading-tight group-hover:text-blue-600 transition-colors duration-150">
                        {item.label}
                      </p>
                      {item.desc && (
                        <p className="text-[11.5px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* footer bar */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            New: <span className="font-medium text-gray-600">AI-powered suggestions in Editor</span>
          </p>
          <a href="#" className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
            What's new →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mobile Menu ─────────────────────────────────────────────────────────────
function MobileMenu({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-gray-100 bg-white"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href="#"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.05 }}
                className="text-[15px] font-medium text-gray-700 hover:text-blue-600 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors no-underline"
              >
                {link.label}
              </motion.a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <MotionLink to="/login" className="text-center py-2.5 text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors no-underline">
                Sign in
              </MotionLink>
              <MotionLink to="/login" className="text-center py-2.5 text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors no-underline">
                Start free
              </MotionLink>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = (label) => {
    clearTimeout(timeoutRef.current);
    if (MEGA_MENU[label]) setActiveMenu(label);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 120);
  };

  const keepOpen = () => clearTimeout(timeoutRef.current);

  return (
    <div className="w-full">
      {/* Announcement bar */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-blue-600 py-2 text-center"
      >
        <p className="text-[12.5px] font-medium text-white">
          🎉 U2Collab 2.0 is here — CRDT-powered editor now in beta.{" "}
          <a href="#" className="underline underline-offset-2 hover:text-blue-100 transition-colors">
            Read more →
          </a>
        </p>
      </motion.div> */}

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm shadow-gray-100/80"
          : "bg-white border-b border-gray-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <U2CollabLogo />
            </motion.div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  className="relative"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 + i * 0.06 }}
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={closeMenu}
                >
                  <button
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors duration-150 ${activeMenu === link.label
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronIcon open={activeMenu === link.label} />}
                  </button>

                  {/* Active underline */}
                  {activeMenu === link.label && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full"
                    />
                  )}

                  {/* Dropdown */}
                  {link.hasDropdown && (
                    <div onMouseEnter={keepOpen} onMouseLeave={closeMenu}>
                      <AnimatePresence>
                        {activeMenu === link.label && MEGA_MENU[link.label] && (
                          <MegaMenu menu={MEGA_MENU[link.label]} />
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Desktop CTA */}
            <motion.div
              className="hidden md:flex items-center gap-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              {/* Live presence indicator */}
              <div className="flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[11px] font-medium text-emerald-700">2.4k online</span>
              </div>

              <MotionLink
                to="/login"
                whileHover={{ backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 text-[13.5px] font-medium text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors no-underline"
              >
                Sign in
              </MotionLink>
              <MotionLink
                to="/login"

                whileHover={{ scale: 1.02, backgroundColor: "#1d4ed8" }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 text-[13.5px] font-semibold text-white bg-blue-600 rounded-lg transition-colors no-underline shadow-sm shadow-blue-200"
              >
                Start free →
              </MotionLink>
            </motion.div>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.93 }}
            >
              <motion.span
                className="block w-5 h-0.5 bg-gray-700 rounded-full"
                animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-5 h-0.5 bg-gray-700 rounded-full"
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="block w-5 h-0.5 bg-gray-700 rounded-full"
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <MobileMenu open={mobileOpen} />
      </motion.nav>
    </div>
  );
}