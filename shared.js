/* shared.js — GWAA 공통 스크립트 */

/* ── NAV HTML 삽입 ── */
const NAV_HTML = `
<nav class="nav" id="mainNav">
  <a href="/index.html" class="nav-logo">
    <div class="nav-logo-bar"></div>
    <div>
      <div class="nav-logo-text">GWAA</div>
      <div class="nav-logo-sub">강원도반려동물협회</div>
    </div>
  </a>
  <div class="nav-links">
    <div class="nav-item">
      <a href="/about.html">ABOUT</a>
    </div>
    <div class="nav-item">
      <a href="/education.html">EDUCATION <span class="nav-arrow">▾</span></a>
      <div class="nav-dropdown">
        <a href="/education.html#dogsports"><span class="dd-dot" style="background:#4ade80"></span>독스포츠 교육</a>
        <a href="/education.html#obedience"><span class="dd-dot" style="background:#38bdf8"></span>오비디언스 교육</a>
        <a href="/education.html#etiquette"><span class="dd-dot" style="background:#f59e0b"></span>반려동물 에티켓</a>
        <div class="nav-dropdown-divider"></div>
        <a href="/education.html#apply"><span class="dd-dot" style="background:#c084fc"></span>교육 신청</a>
      </div>
    </div>
    <div class="nav-item">
      <a href="/events.html">EVENTS <span class="nav-arrow">▾</span></a>
      <div class="nav-dropdown">
        <a href="/events.html#ongoing"><span class="dd-dot" style="background:#4ade80"></span>진행 중인 이벤트</a>
        <a href="/events.html#archive"><span class="dd-dot" style="background:#888"></span>지난 행사 아카이브</a>
      </div>
    </div>
    <div class="nav-item">
      <a href="/mateship.html">MATESHIP <span class="nav-arrow">▾</span></a>
      <div class="nav-dropdown">
        <a href="/mateship.html#benefits"><span class="dd-dot" style="background:#4ade80"></span>멤버십 혜택</a>
        <a href="/mateship.html#partners"><span class="dd-dot" style="background:#38bdf8"></span>제휴업체 목록</a>
        <a href="/mateship.html#join"><span class="dd-dot" style="background:#f59e0b"></span>가입 방법</a>
        <div class="nav-dropdown-divider"></div>
        <a href="/mateship.html#faq"><span class="dd-dot" style="background:#c084fc"></span>자주 묻는 질문</a>
      </div>
    </div>
    <div class="nav-item">
      <a href="/people.html">PEOPLE</a>
    </div>
    <div class="nav-item">
      <a href="/contact.html">CONTACT</a>
    </div>
  </div>
  <a href="/mateship.html#join" class="nav-cta">메이트쉽 가입 →</a>
  <div class="nav-mobile-btn" id="mobileMenuBtn">
    <span></span><span></span><span></span>
  </div>
</nav>

<div class="nav-mobile-drawer" id="mobileDrawer">
  <div class="nmd-item">
    <a href="/about.html">ABOUT</a>
  </div>
  <div class="nmd-item">
    <a href="/education.html" onclick="toggleMobileSub(this)">EDUCATION <span>▾</span></a>
    <div class="nmd-sub">
      <a href="/education.html#dogsports">독스포츠 교육</a>
      <a href="/education.html#obedience">오비디언스 교육</a>
      <a href="/education.html#etiquette">반려동물 에티켓</a>
      <a href="/education.html#apply">교육 신청</a>
    </div>
  </div>
  <div class="nmd-item">
    <a href="/events.html" onclick="toggleMobileSub(this)">EVENTS <span>▾</span></a>
    <div class="nmd-sub">
      <a href="/events.html#ongoing">진행 중인 이벤트</a>
      <a href="/events.html#archive">지난 행사 아카이브</a>
    </div>
  </div>
  <div class="nmd-item">
    <a href="/mateship.html" onclick="toggleMobileSub(this)">MATESHIP <span>▾</span></a>
    <div class="nmd-sub">
      <a href="/mateship.html#benefits">멤버십 혜택</a>
      <a href="/mateship.html#partners">제휴업체 목록</a>
      <a href="/mateship.html#join">가입 방법</a>
      <a href="/mateship.html#faq">자주 묻는 질문</a>
    </div>
  </div>
  <div class="nmd-item">
    <a href="/people.html">PEOPLE</a>
  </div>
  <div class="nmd-item">
    <a href="/contact.html">CONTACT</a>
  </div>
  <a href="/mateship.html#join" class="nmd-cta">메이트쉽 가입하기 →</a>
</div>
`;

/* ── FOOTER HTML ── */
const FOOTER_HTML = `
<footer class="footer">
  <div>
    <div class="footer-logo">
      <div class="footer-logo-bar"></div>
      GWAA · 사단법인 강원도반려동물협회
    </div>
    <div class="footer-info">
      대표 이지영 &nbsp;·&nbsp; 강원도 원주시 천매봉길 20-9<br>
      033-813-0333 &nbsp;·&nbsp; ganimal1@naver.com<br>
      Copyright © 2026 사단법인 강원도반려동물협회 All rights reserved.
    </div>
  </div>
  <div class="footer-right">
    <div class="footer-links">
      <a href="/policy.html">이용약관</a>
      <a href="/privacy.html">개인정보처리방침</a>
      <a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener">카카오채널</a>
    </div>
    <div class="footer-sns">
      <a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener" class="sns-btn" title="카카오채널">K</a>
      <a href="#" class="sns-btn" title="인스타그램">I</a>
      <a href="#" class="sns-btn" title="네이버블로그">N</a>
    </div>
  </div>
</footer>

<a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener"
   class="kakao-float" aria-label="카카오채널 문의하기">
  <svg viewBox="0 0 24 24" fill="#000000">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.618 1.574 4.917 3.963 6.294L5 21l4.576-2.452A11.2 11.2 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
  </svg>
</a>
`;

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {

  /* Nav + Footer 삽입 */
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

  /* 현재 페이지 active 표시 */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item > a, .nmd-item > a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(path) && path !== 'index.html') a.classList.add('active');
  });

  /* 모바일 메뉴 토글 */
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    const drawer = document.getElementById('mobileDrawer');
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* 모바일 서브메뉴 닫기 (링크 클릭 시) */
  document.querySelectorAll('.nmd-sub a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('mobileDrawer').classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* 스크롤 시 nav 배경 강화 */
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.style.background = window.scrollY > 60
      ? 'rgba(8,8,8,0.98)'
      : 'rgba(8,8,8,0.94)';
  }, { passive: true });

  /* Fade-in 애니메이션 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fi').forEach(el => io.observe(el));
});

/* 모바일 서브메뉴 토글 함수 */
function toggleMobileSub(el) {
  const sub = el.nextElementSibling;
  if (sub && sub.classList.contains('nmd-sub')) {
    el.preventDefault && el.preventDefault();
    sub.classList.toggle('open');
  }
}
