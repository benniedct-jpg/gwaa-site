'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { staggerContainer, fadeUp } from '@/lib/animations';

const CHANNELS = [
  {
    icon: '💬',
    label: 'KAKAO CHANNEL',
    value: '@강원도반려동물협회',
    desc: '가장 빠른 응답 · 24시간 접수',
    href: 'https://pf.kakao.com/_wipZX',
    external: true,
  },
  {
    icon: '📞',
    label: 'PHONE',
    value: '033-813-0333',
    desc: '평일 09:00 ~ 18:00',
    href: 'tel:033-813-0333',
    external: false,
  },
  {
    icon: '✉️',
    label: 'EMAIL',
    value: 'ganimal1@naver.com',
    desc: '1~2 영업일 내 답변',
    href: 'mailto:ganimal1@naver.com',
    external: false,
  },
  {
    icon: '📍',
    label: 'ADDRESS',
    value: '강원특별자치도 원주시',
    desc: '천매봉길 20-9',
    href: '#',
    external: false,
  },
];

const INQUIRY_TYPES = ['메이트쉽 가입', '교육 프로그램', '행사 문의', '제휴 문의', '기타'];

type FormState = { name: string; phone: string; email: string; type: string; message: string };
const EMPTY: FormState = { name: '', phone: '', email: '', type: '', message: '' };

export default function ContactContent() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const prev = JSON.parse(localStorage.getItem('gwaa_inquiries') || '[]');
      localStorage.setItem('gwaa_inquiries', JSON.stringify([...prev, { ...form, at: new Date().toISOString() }]));
      setForm(EMPTY);
      setSubmitting(false);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    }, 800);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
    fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", letterSpacing: '0.05em',
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 16 };

  return (
    <>
      {/* Main: 2-column — channels + form */}
      <section style={{ padding: '88px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}
        >
          {/* Left — channels */}
          <div>
            <motion.div variants={fadeUp}>
              <Eyebrow text="CONTACT" />
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10 }}>
                함께 시작해볼까요
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 32 }}>
                메이트쉽 가입, 교육 신청, 행사 문의 등 무엇이든 편하게 연락해 주세요.
                카카오채널이 가장 빠른 응답 방법입니다.
              </p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHANNELS.map((ch, i) => (
                <motion.a
                  key={ch.label}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  variants={fadeUp}
                  custom={i * 0.07}
                  whileHover={{ x: 6, borderColor: '#16a34a', boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}
                  style={{
                    background: '#f8fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {ch.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#9ca3af', letterSpacing: '0.1em', marginBottom: 3 }}>{ch.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{ch.value}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{ch.desc}</div>
                  </div>
                  <span style={{ fontSize: 16, color: '#d1d5db', flexShrink: 0 }}>→</span>
                </motion.a>
              ))}
            </div>

            {/* Kakao CTA */}
            <motion.a
              href="https://pf.kakao.com/_wipZX"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              custom={0.32}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0a0a0a', borderRadius: 16, padding: '20px 24px',
                textDecoration: 'none', gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#4ade80', letterSpacing: '0.12em', marginBottom: 6 }}>FASTEST RESPONSE</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: '#fff', letterSpacing: '0.02em' }}>카카오채널로 빠르게 문의하기</div>
              </div>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
                background: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#0a0a0a',
              }}>→</div>
            </motion.a>
          </div>

          {/* Right — contact form */}
          <motion.div
            variants={fadeUp}
            custom={0.1}
            style={{
              background: '#f8fafb', border: '1.5px solid #e5e7eb',
              borderRadius: 20, padding: '32px 36px',
              position: 'sticky', top: 88,
            }}
          >
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>문의하기</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>내용을 남겨주시면 1~2 영업일 내 답변 드립니다.</p>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center', padding: '48px 24px',
                    background: '#f0fdf4', borderRadius: 14,
                    border: '1px solid rgba(22,163,74,0.2)',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: '#16a34a', marginBottom: 6 }}>문의가 접수되었습니다</div>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>빠른 시일 내에 답변 드리겠습니다.</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>이름 *</label>
                      <Input value={form.name} onChange={set('name')} placeholder="홍길동" required />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>연락처</label>
                      <Input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" type="tel" />
                    </div>
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>이메일</label>
                    <Input value={form.email} onChange={set('email')} placeholder="example@email.com" type="email" />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>문의 유형</label>
                    <select
                      value={form.type}
                      onChange={set('type')}
                      style={{
                        width: '100%', padding: '11px 16px',
                        border: '1.5px solid #e5e7eb', borderRadius: 10,
                        fontSize: 14, color: form.type ? '#111' : '#9ca3af',
                        outline: 'none', boxSizing: 'border-box' as const,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                        background: '#fff', cursor: 'pointer',
                      }}
                    >
                      <option value="">유형 선택</option>
                      {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>문의 내용 *</label>
                    <Textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="문의하실 내용을 자유롭게 작성해 주세요."
                      required
                      style={{ minHeight: 130 }}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '13px 20px', borderRadius: 9999,
                      background: submitting ? '#9ca3af' : '#16a34a',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                      border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                      boxShadow: '0 2px 12px rgba(22,163,74,0.3)',
                      transition: 'background 0.2s',
                    }}
                  >
                    {submitting ? '전송 중...' : '문의 보내기 →'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>

      {/* Location Info */}
      <section style={{ padding: '64px 60px', background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ maxWidth: 760, margin: '0 auto' }}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <Eyebrow text="LOCATION" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(24px,3.5vw,40px)', color: '#111', letterSpacing: '0.02em' }}>오시는 길</h2>
          </motion.div>
          <motion.div
            variants={fadeUp}
            style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '32px 36px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {[
                { label: '주소',     value: '강원특별자치도 원주시 천매봉길 20-9' },
                { label: '대표전화', value: '033-813-0333' },
                { label: '이메일',   value: 'ganimal1@naver.com' },
                { label: '업무시간', value: '평일 09:00 ~ 18:00' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, letterSpacing: '0.1em', color: '#16a34a', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.5 }}>{value}</div>
                </div>
              ))}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/mateship" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>메이트쉽 가입하기 →</Link>
              <Link href="/education" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 9999, border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>교육 프로그램 보기</Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
