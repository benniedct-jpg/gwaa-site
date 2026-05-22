'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";
const SYS  = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue','Apple SD Gothic Neo','Noto Sans KR',sans-serif";

const CHANNELS = [
  {
    icon: '💬',
    label: 'KAKAO',
    value: '@강원도반려동물협회',
    desc: '가장 빠른 응답 · 24시간 접수',
    href: 'https://pf.kakao.com/_wipZX',
    external: true,
    accent: '#FEE500',
    textColor: '#111',
  },
  {
    icon: '📞',
    label: 'PHONE',
    value: '033-813-0333',
    desc: '평일 09:00 ~ 18:00',
    href: 'tel:033-813-0333',
    external: false,
    accent: '#16a34a',
    textColor: '#fff',
  },
  {
    icon: '✉️',
    label: 'EMAIL',
    value: 'ganimal1@naver.com',
    desc: '1~2 영업일 내 답변',
    href: 'mailto:ganimal1@naver.com',
    external: false,
    accent: '#2563eb',
    textColor: '#fff',
  },
  {
    icon: '📍',
    label: 'ADDRESS',
    value: '강원특별자치도 원주시',
    desc: '천매봉길 20-9',
    href: 'https://map.naver.com/v5/search/강원도반려동물협회+원주',
    external: true,
    accent: '#f97316',
    textColor: '#fff',
  },
];

const INQUIRY_TYPES = ['메이트쉽 가입', '교육 프로그램', '행사 문의', '제휴 문의', '기타'];

type FormState = { name: string; phone: string; email: string; type: string; message: string };
const EMPTY: FormState = { name: '', phone: '', email: '', type: '', message: '' };

export default function ContactContent() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [k]: e.target.value }));
      if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
    };

  const validate = () => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = '이름을 입력해 주세요';
    if (!form.message.trim()) errs.message = '문의 내용을 입력해 주세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await fetch('/api/data/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          course: form.type,
          message: form.message,
          created_at: new Date().toISOString(),
        }),
      });
    } catch {}
    setForm(EMPTY);
    setSubmitting(false);
    setSent(true);
    setTimeout(() => setSent(false), 6000);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#374151',
    marginBottom: 6, fontFamily: MONO, letterSpacing: '0.05em',
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 16 };
  const errorStyle: React.CSSProperties = {
    fontSize: 11, color: '#ef4444', marginTop: 4, fontFamily: SYS,
  };

  return (
    <>
      {/* ── Main 2-column (stacks on mobile) ── */}
      <section style={{ padding: `${isMobile ? '48px' : '88px'} ${px}`, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 40 : 48,
            alignItems: 'start',
          }}
        >
          {/* ── Left — channels ── */}
          <div>
            <motion.div variants={fadeUp}>
              <Eyebrow text="CONTACT" />
              <h2 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: isMobile ? 'clamp(32px,9vw,48px)' : 'clamp(28px,4vw,52px)',
                color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10,
              }}>
                함께 시작해볼까요
              </h2>
              <p style={{ fontSize: isMobile ? 14 : 15, color: '#6b7280', lineHeight: 1.85, marginBottom: 28 }}>
                메이트쉽 가입, 교육 신청, 행사 문의 등 무엇이든 편하게 연락해 주세요.
              </p>
            </motion.div>

            {/* Channel cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHANNELS.map((ch, i) => (
                <motion.a
                  key={ch.label}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  variants={fadeUp}
                  custom={i * 0.06}
                  whileHover={{ x: 4, boxShadow: '0 8px 28px rgba(0,0,0,0.09)', borderColor: '#16a34a' }}
                  whileTap={{ scale: 0.985 }}
                  style={{
                    background: '#fafafa', border: '1.5px solid #ececec', borderRadius: 14,
                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                    textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: ch.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {ch.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.12em', marginBottom: 2 }}>
                      {ch.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ch.value}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ch.desc}</div>
                  </div>
                  <span style={{ fontSize: 14, color: '#c4c9d0', flexShrink: 0 }}>›</span>
                </motion.a>
              ))}
            </div>

            {/* Kakao CTA */}
            <motion.a
              href="https://pf.kakao.com/_wipZX"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              custom={0.28}
              whileHover={{ scale: 1.025, boxShadow: '0 12px 36px rgba(0,0,0,0.18)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0a0a0a', borderRadius: 16, padding: isMobile ? '18px 20px' : '20px 24px',
                textDecoration: 'none', gap: 12, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: '#4ade80', letterSpacing: '0.14em', marginBottom: 5 }}>
                  FASTEST RESPONSE
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 20 : 22, color: '#fff', letterSpacing: '0.02em' }}>
                  카카오채널로 빠르게 문의하기
                </div>
              </div>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
                background: '#FEE500',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: '#0a0a0a',
              }}>→</div>
            </motion.a>
          </div>

          {/* ── Right — form ── */}
          <motion.div
            variants={fadeUp}
            custom={0.1}
            style={{
              background: '#f9fafb',
              border: '1.5px solid #e5e7eb',
              borderRadius: 20,
              padding: isMobile ? '24px 20px' : '32px 36px',
              position: isMobile ? 'static' : 'sticky',
              top: 88,
            }}
          >
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>
              문의하기
            </h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
              내용을 남겨주시면 1~2 영업일 내 답변 드립니다.
            </p>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.93, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    textAlign: 'center', padding: '52px 24px',
                    background: '#f0fdf4', borderRadius: 14,
                    border: '1.5px solid rgba(22,163,74,0.2)',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px', fontSize: 24,
                    }}
                  >
                    ✓
                  </motion.div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: '#111', marginBottom: 8, letterSpacing: '0.02em' }}>
                    문의가 접수되었습니다
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                    빠른 시일 내에 답변 드리겠습니다.<br />
                    급하신 경우 카카오채널을 이용해 주세요.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 1 }}>
                  {/* Name + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>이름 *</label>
                      <Input
                        value={form.name}
                        onChange={set('name')}
                        placeholder="홍길동"
                        required
                        style={errors.name ? { borderColor: '#ef4444' } : {}}
                      />
                      {errors.name && <p style={errorStyle}>{errors.name}</p>}
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>연락처</label>
                      <Input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" type="tel" />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>이메일</label>
                    <Input value={form.email} onChange={set('email')} placeholder="example@email.com" type="email" />
                  </div>

                  {/* Type */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>문의 유형</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={form.type}
                        onChange={set('type')}
                        style={{
                          width: '100%', padding: '11px 40px 11px 16px',
                          border: '1.5px solid #e5e7eb', borderRadius: 10,
                          fontSize: 14, color: form.type ? '#111' : '#9ca3af',
                          outline: 'none', boxSizing: 'border-box' as const,
                          fontFamily: SYS, background: '#fff', cursor: 'pointer',
                          appearance: 'none', WebkitAppearance: 'none',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <option value="">유형 선택</option>
                        {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: '#9ca3af' }}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>문의 내용 *</label>
                    <Textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="문의하실 내용을 자유롭게 작성해 주세요."
                      required
                      style={{ minHeight: 120, ...(errors.message ? { borderColor: '#ef4444' } : {}) }}
                    />
                    {errors.message && <p style={errorStyle}>{errors.message}</p>}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02, boxShadow: '0 6px 24px rgba(22,163,74,0.4)' } : undefined}
                    whileTap={!submitting ? { scale: 0.97 } : undefined}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 12,
                      background: submitting ? '#9ca3af' : '#16a34a',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                      border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.04em', fontFamily: SYS,
                      boxShadow: submitting ? 'none' : '0 2px 14px rgba(22,163,74,0.3)',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {submitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ display: 'inline-block', fontSize: 14 }}
                        >
                          ⟳
                        </motion.span>
                        전송 중...
                      </>
                    ) : '문의 보내기 →'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Location ── */}
      <section style={{ padding: `${isMobile ? '48px' : '64px'} ${px}`, background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <Eyebrow text="LOCATION" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 'clamp(24px,7vw,36px)' : 'clamp(24px,3.5vw,40px)', color: '#111', letterSpacing: '0.02em' }}>
              오시는 길
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: isMobile ? '20px 20px' : '28px 36px' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? 20 : 24,
              marginBottom: 24,
            }}>
              {[
                { label: '주소',     value: '강원특별자치도 원주시 천매봉길 20-9' },
                { label: '대표전화', value: '033-813-0333' },
                { label: '이메일',   value: 'ganimal1@naver.com' },
                { label: '업무시간', value: '평일 09:00 ~ 18:00' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: '#16a34a', marginBottom: 6, fontWeight: 700 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#111', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 20px' }} />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href="/mateship"
                style={{
                  display: 'inline-flex', padding: '10px 20px', borderRadius: 9999,
                  background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', boxShadow: '0 2px 10px rgba(22,163,74,0.25)',
                }}
              >
                메이트쉽 가입하기 →
              </Link>
              <Link
                href="/education"
                style={{
                  display: 'inline-flex', padding: '10px 20px', borderRadius: 9999,
                  border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                교육 프로그램 보기
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
