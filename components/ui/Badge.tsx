import { TagColor } from '@/types';

const styles: Record<TagColor, { bg: string; color: string }> = {
  green:    { bg: '#dcfce7', color: '#166534' },
  blue:     { bg: '#dbeafe', color: '#1e40af' },
  amber:    { bg: '#fef9c3', color: '#854d0e' },
  gray:     { bg: '#f3f4f6', color: '#6b7280' },
  dark:     { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' },
  live:     { bg: '#16a34a', color: '#fff' },
  soon:     { bg: '#2563eb', color: '#fff' },
  upcoming: { bg: '#d97706', color: '#fff' },
  ended:    { bg: '#6b7280', color: '#fff' },
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
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.07em',
        padding: '4px 10px',
        borderRadius: 9999,
        background: s.bg,
        color: s.color,
      }}
    >
      {children ?? labels[variant]}
    </span>
  );
}
