interface EyebrowProps {
  text: string;
  dark?: boolean;
}

export default function Eyebrow({ text, dark = false }: EyebrowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 24, height: 2, background: '#16a34a', borderRadius: 1, flexShrink: 0 }} />
      <span style={{
        fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
        fontSize: 10,
        letterSpacing: '0.14em',
        color: dark ? 'rgba(255,255,255,0.4)' : '#6b7280',
      }}>
        {text}
      </span>
    </div>
  );
}
