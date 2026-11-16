'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@vercel/analytics';
import { QUESTIONS, TYPES, getType, resolveType, type Letter, type TravelType } from '@/lib/play/travelTypes';

const GREEN = '#12A79D';
const DISPLAY = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const SITE = 'https://gwaa.or.kr';

type Stage = 'intro' | 'quiz' | 'result';

export default function TravelTypeQuiz({ sharedCode }: { sharedCode?: string }) {
  const shared = getType(sharedCode);
  const [stage, setStage] = useState<Stage>(shared ? 'result' : 'intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Letter[]>([]);
  const [result, setResult] = useState<TravelType | null>(shared);
  const [isMine, setIsMine] = useState(false); // 공유 링크로 들어온 결과인지, 직접 테스트한 결과인지
  const [copied, setCopied] = useState(false);

  const start = () => {
    setAnswers([]); setStep(0); setStage('quiz'); setCopied(false);
    track('play_start');
  };

  const answer = (letter: Letter) => {
    const next = [...answers, letter];
    if (step + 1 < QUESTIONS.length) {
      setAnswers(next); setStep(step + 1);
      return;
    }
    const code = resolveType(next);
    setAnswers(next); setResult(TYPES[code]); setIsMine(true); setStage('result');
    track('play_complete', { type: code });
    // 결과 주소를 공유 가능한 형태로 맞춤 (뒤로가기 기록은 늘리지 않음)
    window.history.replaceState(null, '', `/play?r=${code}`);
  };

  const share = async () => {
    if (!result) return;
    const url = `${SITE}/play?r=${result.code}`;
    const text = `우리 아이는 ${result.emoji} ${result.name}! 댕댕이 강원 여행 유형 테스트`;
    track('play_share', { type: result.code });
    try {
      if (navigator.share) {
        await navigator.share({ title: '댕댕이 강원 여행 유형 테스트', text, url });
        return;
      }
    } catch {
      return; // 사용자가 공유창을 닫은 경우
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* 클립보드 권한 없음 — 무시 */ }
  };

  return (
    <section className="play-wrap">
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div key="intro" className="play-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <p className="play-eyebrow">GWAA PLAY · 1분 테스트</p>
            <h1 className="play-title">우리 아이는<br />어떤 강원 여행자일까?</h1>
            <p className="play-lead">
              질문 6개로 알아보는 댕댕이 여행 유형.
              <br />결과에 맞는 강원도 여행 스타일까지 알려드려요.
            </p>
            <div className="play-emoji-row" aria-hidden="true">
              {Object.values(TYPES).map((t) => <span key={t.code}>{t.emoji}</span>)}
            </div>
            <button type="button" className="play-btn play-btn-primary" onClick={start}>테스트 시작하기</button>
            <p className="play-note">총 8가지 유형 · 개인정보를 수집하지 않아요</p>
          </motion.div>
        )}

        {stage === 'quiz' && (
          <motion.div key={`q${step}`} className="play-card" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <div className="play-progress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="진행도">
              <div style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
            <p className="play-step" style={{ fontFamily: DISPLAY }}>Q{step + 1} <span>/ {QUESTIONS.length}</span></p>
            <h2 className="play-question">{QUESTIONS[step].text}</h2>
            <div className="play-options">
              {QUESTIONS[step].options.map((o) => (
                <button key={o.letter} type="button" className="play-option" onClick={() => answer(o.letter)}>
                  {o.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" className="play-back" onClick={() => { setAnswers(answers.slice(0, -1)); setStep(step - 1); }}>
                ← 이전 질문
              </button>
            )}
          </motion.div>
        )}

        {stage === 'result' && result && (
          <motion.div key={`r${result.code}`} className="play-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="play-eyebrow">{isMine ? '우리 아이의 여행 유형은' : '친구네 댕댕이의 여행 유형'}</p>
            <div className="play-result-emoji" aria-hidden="true">{result.emoji}</div>
            <h1 className="play-title" style={{ marginBottom: 6 }}>{result.name}</h1>
            <p className="play-tagline">“{result.tagline}”</p>
            <p className="play-lead" style={{ textAlign: 'left' }}>{result.desc}</p>

            <div className="play-box">
              <p className="play-box-label">어울리는 강원 여행</p>
              <p className="play-box-main">{result.course}</p>
              <ul>
                {result.tips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>

            <div className="play-match">
              <span>찰떡궁합 친구</span>
              <strong>{TYPES[result.match].emoji} {TYPES[result.match].name}</strong>
            </div>

            {isMine ? (
              <>
                <button type="button" className="play-btn play-btn-primary" onClick={share}>
                  {copied ? '링크를 복사했어요 ✓' : '결과 공유하기'}
                </button>
                <Link href={result.cta.href} className="play-btn play-btn-outline" onClick={() => track('play_cta', { type: result.code })}>
                  {result.cta.label} →
                </Link>
                <button type="button" className="play-back" onClick={start}>다시 테스트하기</button>
              </>
            ) : (
              <>
                <button type="button" className="play-btn play-btn-primary" onClick={start}>우리 아이도 테스트하기</button>
                <Link href={result.cta.href} className="play-btn play-btn-outline">{result.cta.label} →</Link>
              </>
            )}

            <p className="play-note">
              GWAA 메이트쉽 회원은 제휴 숙소·카페와 행사 참가비 혜택을 받을 수 있어요.{' '}
              <Link href="/mateship" style={{ color: GREEN, fontWeight: 700 }}>혜택 보기</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
