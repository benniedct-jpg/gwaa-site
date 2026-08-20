"use client";

import { motion } from "framer-motion";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
}

function HandWrittenTitle({
  title = "Hand Written",
  subtitle = "Optional subtitle",
}: HandWrittenTitleProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number] },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-16">
      <div className="absolute inset-0">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          initial="hidden"
          animate="visible"
          className="w-full h-full"
        >
          <title>GWAA</title>
          <motion.path
            d="M 950 60
               C 1250 200, 1050 320, 600 350
               C 250 350, 150 320, 150 200
               C 150 80, 350 50, 600 50
               C 850 50, 950 120, 950 120"
            fill="none"
            strokeWidth="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            className="text-[#16a34a] opacity-60"
          />
        </motion.svg>
      </div>
      <div className="relative text-center z-10 flex flex-col items-center justify-center">
        <motion.h2
          className="tracking-tight flex items-center gap-2"
          style={{
            fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
            fontSize: "clamp(40px, 7vw, 72px)",
            color: "#111",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            style={{ fontSize: 16, color: "#6b7280", marginTop: 12, lineHeight: 1.6 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export { HandWrittenTitle };
