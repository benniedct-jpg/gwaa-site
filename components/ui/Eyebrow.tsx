interface EyebrowProps {
  text: string;
  dark?: boolean;
}

export default function Eyebrow({ text, dark = false }: EyebrowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 24, height: 2, background: '#16a34a', borderRadius: 1, flexShrink: 0 }} />
      <span style={{
        fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
        fontSize: 12,
        letterSpacing: '0.06em',
        color: dark ? 'rgba(255,255,255,0.55)' : '#4b5563',
      }}>
        {text}
      </span>
    </div>
  );
}
