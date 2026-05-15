"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Position {
  left: number;
  width: number;
  opacity: number;
}

interface NavItem {
  label: string;
  href: string;
}

interface SlideTabsNavProps {
  items: NavItem[];
  pathname?: string;
}

export const SlideTabsNav = ({ items, pathname = "" }: SlideTabsNavProps) => {
  const [position, setPosition] = useState<Position>({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      className="relative flex w-fit items-center gap-0"
    >
      {items.map((item) => (
        <Tab
          key={item.label}
          setPosition={setPosition}
          href={item.href}
          isActive={pathname.startsWith(item.href)}
        >
          {item.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  href: string;
  isActive: boolean;
}

const Tab = ({ children, setPosition, href, isActive }: TabProps) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ left: ref.current.offsetLeft, width, opacity: 1 });
      }}
      className="relative z-10 block cursor-pointer"
    >
      <Link
        href={href}
        className="flex items-center rounded-full transition-colors duration-150"
        style={{
          padding: '10px 40px',
          fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          color: isActive ? "#16a34a" : "#374151",
        }}
      >
        {children}
      </Link>
    </li>
  );
};

interface CursorProps {
  position: Position;
}

const Cursor = ({ position }: CursorProps) => {
  return (
    <motion.li
      animate={{ ...position }}
      className="absolute z-0 rounded-full bg-[#f3f4f6]"
      style={{ top: "50%", transform: "translateY(-50%)", height: 30, pointerEvents: "none" }}
    />
  );
};
