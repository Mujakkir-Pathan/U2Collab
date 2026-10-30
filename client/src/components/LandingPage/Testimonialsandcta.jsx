import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import mainImg from "/footerImg.png";
const testimonials = [
    {
        stars: 5,
        quote:
            '"U2Collab killed our Slack, Figma, and Google Docs setup. Everything just works."',
        name: "Maya Chen",
        role: "Design lead, Velocity",
        avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
        stars: 5,
        quote:
            '"We shipped a feature in half the time. No more context switching between tools."',
        name: "James Rivera",
        role: "CTO, Momentum Labs",
        avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
        stars: 5,
        quote:
            '"The whiteboard is so smooth. It feels like drawing on paper, but everyone sees it live."',
        name: "Sarah Okonkwo",
        role: "Product manager, Spark",
        avatar: "https://i.pravatar.cc/150?img=32",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
};

function Stars({ count }) {
    return (
        <div className="flex gap-0.5 mb-4">
            {Array.from({ length: count }).map((_, i) => (
                <svg
                    key={i}
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsAndCTA() {
    const testimonialsRef = useRef(null);
    const ctaRef = useRef(null);
    const testimonialsInView = useInView(testimonialsRef, {
        once: true,
        margin: "-80px",
    });
    const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

    return (
        <div
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
            className="bg-black text-white"
        >
            {/* ── Testimonials ── */}
            <section
                ref={testimonialsRef}
                className="bg-[#6b6b5f] px-4 sm:px-8 py-16 sm:py-24"
            >
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-10 sm:mb-14"
                        initial="hidden"
                        animate={testimonialsInView ? "visible" : "hidden"}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3">
                            Real teams trust us
                        </h2>
                        <p className="text-white/60 text-sm sm:text-base">
                            What people are saying
                        </p>
                    </motion.div>

                    {/* Cards */}
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        initial="hidden"
                        animate={testimonialsInView ? "visible" : "hidden"}
                        variants={containerVariants}
                    >
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                variants={cardVariants}
                                className="bg-[#5a5a4e] rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <Stars count={t.stars} />
                                    <p className="text-white/90 text-sm leading-relaxed mb-6">
                                        {t.quote}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-white text-sm font-semibold leading-tight">
                                            {t.name}
                                        </p>
                                        <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section ref={ctaRef} className="relative bg-black overflow-hidden">
                {/* Text block */}
                <motion.div
                    className="relative z-10 text-center px-4 pt-16 sm:pt-24 pb-10 sm:pb-14"
                    initial="hidden"
                    animate={ctaInView ? "visible" : "hidden"}
                    variants={containerVariants}
                >
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4 max-w-md mx-auto"
                    >
                        Ready to work better together?
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="text-white/60 text-sm sm:text-base mb-7 max-w-sm mx-auto"
                    >
                        Join teams that have ditched the tool sprawl. Start collaborating in
                        minutes.
                    </motion.p>
                    <motion.div
                        variants={fadeUp}
                        className="flex items-center justify-center gap-3"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                        >
                            Start free
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-transparent border border-white/30 hover:border-white/60 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                        >
                            Watch demo
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Full-width hero image */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden"
                >
                    <img
                        src={mainImg}
                        alt="Team collaborating"
                        className="w-full h-full object-cover object-top"
                    />
                </motion.div>
            </section>
        </div>
    );
}