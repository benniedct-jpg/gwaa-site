import Link from 'next/link';

// 홈 상단 참여형 콘텐츠 진입 배너 — 댕댕이 강원 여행 유형 테스트(/play)
export default function PlayBanner() {
  return (
    <Link href="/play" className="play-banner" aria-label="댕댕이 강원 여행 유형 테스트 하러 가기">
      <div className="play-banner-text">
        <p>GWAA PLAY · 1분 테스트</p>
        <h2>우리 아이는 어떤 강원 여행자일까?</h2>
        <p>질문 6개로 알아보는 댕댕이 여행 유형 8가지</p>
      </div>
      <span className="play-banner-emoji" aria-hidden="true">🏄⛺🌅🍃</span>
      <span className="play-banner-cta">테스트 하러 가기 →</span>
    </Link>
  );
}
