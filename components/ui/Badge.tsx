import { TagColor } from '@/types';

const styles: Record<TagColor, { bg: string; color: string; border?: string }> = {
  green:    { bg: '#dcfce7', color: '#166534', border: '1px solid rgba(22,163,74,0.15)' },
  blue:     { bg: '#dbeafe', color: '#1e40af', border: '1px solid rgba(37,99,235,0.15)' },
  amber:    { bg: '#fef9c3', color: '#854d0e', border: '1px solid rgba(217,119,6,0.15)' },
  gray:     { bg: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' },
  dark:     { bg: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' },
  live:     { bg: '#16a34a', color: '#fff' },
  soon:     { bg: '#2563eb', color: '#fff' },
  upcoming: { bg: '#f97316', color: '#fff' },
  ended:    { bg: '#9ca3af', color: '#fff' },
};

const labels: Record<TagColor, string> = {
  green: '', blue: '', amber: '', gray: '', dark: '',
  live: 'LIVE', soon: 'SOON', upcoming: 'UPCOMING', ended: 'ENDED',
};

interface BadgeProps {
  variant?: TagColor;
  children?: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'gray', children, className }: BadgeProps) {
  const s = styles[variant];
  const isLive = variant === 'live';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: '4px 10px',
        borderRadius: 9999,
        background: s.bg,
        color: s.color,
        border: s.border,
        backdropFilter: variant === 'dark' ? 'blur(8px)' : undefined,
        fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
      }}
    >
      {isLive && (
        <span style={{ position: 'relative', width: 6, height: 6, display: 'inline-block', flexShrink: 0 }}>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#fff', animation: 'badge-ping 1.4s ease-in-out infinite',
            opacity: 0.6,
          }} />
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#fff',
          }} />
          <style>{`
            @keyframes badge-ping {
              0%,100% { transform: scale(1); opacity: 0.6; }
              50%      { transform: scale(2.2); opacity: 0; }
            }
          `}</style>
        </span>
      )}
      {children ?? labels[variant]}
    </span>
  );
}
