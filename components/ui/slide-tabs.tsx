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
      style={{ height: 64 }}
    >
      {items.map((item) => (
        <Tab
          key={item.label}
          setPosition={setPosition}
          href={item.href}
          isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
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
      style={{ height: 64, display: 'flex', alignItems: 'center' }}
    >
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: 64,
          fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          color: isActive ? "#16a34a" : "#374151",
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        {children}
        {/* Active 언더라인 */}
        {isActive && (
          <span style={{
            position: 'absolute',
            bottom: 0,
            left: 16,
            right: 16,
            height: 2,
            background: '#16a34a',
            borderRadius: '2px 2px 0 0',
          }} />
        )}
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
      className="absolute z-0"
      style={{
        bottom: 0,
        height: 2,
        background: '#16a34a',
        borderRadius: '2px 2px 0 0',
        pointerEvents: "none",
        opacity: position.opacity,
      }}
    />
  );
};
