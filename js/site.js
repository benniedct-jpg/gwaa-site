/* ============================================================
   GWAA — 공통 Nav / Footer 인젝션 + 드롭다운
   사용법: 각 HTML <body> 안에 <div id="site-nav"></div> 와
          <div id="site-footer"></div> 를 넣고 이 파일을 로드
   ============================================================ */

const NAV_MENU = [
  {
    label: 'ABOUT',
    href: 'about.html',
    children: [
      { label: '협회 소개', href: 'about.html#intro' },
      { label: '설립 목적 & 비전', href: 'about.html#vision' },
      { label: '주요 활동', href: 'about.html#activities' },
      { label: '협회 연혁', href: 'about.html#history' },
    ]
  },
  {
    label: 'EDUCATION',
    href: 'education.html',
    children: [
      { label: '독스포츠 — 어질리티', href: 'education.html#dogsports' },
      { label: '오비디언스 교육', href: 'education.html#obedience' },
      { label: '반려동물행동지도사 (국가자격증)', href: 'education.html#license' },
      { label: '반려동물 에티켓 교육', href: 'education.html#etiquette' },
      { label: '교육 신청', href: 'education.html#apply' },
    ]
  },
  {
    label: 'EVENTS',
    href: 'events.html',
    children: [
      { label: '진행 중인 이벤트', href: 'events.html#current' },
      { label: '사전 예약', href: 'events.html#reserve' },
      { label: '지난 행사 아카이브', href: 'events.html#archive' },
    ]
  },
  {
    label: 'MATESHIP',
    href: 'mateship.html',
    children: [
      { label: '멤버십 소개', href: 'mateship.html#intro' },
      { label: '전체 혜택', href: 'mateship.html#benefits' },
      { label: '제휴업체 목록', href: 'mateship.html#partners' },
      { label: '가입 방법', href: 'mateship.html#join' },
      { label: 'FAQ', href: 'mateship.html#faq' },
    ]
  },
  {
    label: 'PEOPLE',
    href: 'people.html',
    children: [
      { label: '운영진 소개', href: 'people.html#team' },
      { label: '회원 활동 스토리', href: 'people.html#stories' },
      { label: '룩북', href: 'people.html#lookbook' },
    ]
  },
  {
    label: 'CONTACT',
    href: 'contact.html',
    children: [
      { label: '오시는 길', href: 'contact.html#map' },
      { label: '문의 폼', href: 'contact.html#form' },
    ]
  },
];

/* ── NAV HTML 생성 ── */
function buildNav() {
  const path = location.pathname.split('/').pop() || 'index.html';

  const items = NAV_MENU.map(item => {
    const isActive = path === item.href || path.startsWith(item.href.replace('.html',''));
    const dropHtml = item.children.map(c =>
      `<a class="dd-item" href="${c.href}">${c.label}</a>`
    ).join('');

    return `
      <div class="nav-item${isActive ? ' active' : ''}">
        <a class="nav-link${isActive ? ' active' : ''}" href="${item.href}">${item.label}
          <svg class="nav-arrow" width="8" height="5" viewBox="0 0 8 5"><path d="M1 1l3 3 3-3" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
        </a>
        <div class="nav-dropdown">
          ${dropHtml}
        </div>
      </div>`;
  }).join('');

  return `
<nav class="site-nav" id="mainNav" role="navigation" aria-label="메인 내비게이션">
  <a href="index.html" class="nav-logo" aria-label="GWAA 홈">
    <div class="nav-logo-bar"></div>
    <div>
      <div class="nav-logo-text">GWAA</div>
      <div class="nav-logo-sub">강원도반려동물협회</div>
    </div>
  </a>

  <div class="nav-links" id="navLinks">${items}</div>

  <a href="mateship.html#join" class="nav-cta">메이트쉽 가입 →</a>

  <button class="nav-mobile-btn" id="mobileMenuBtn" aria-label="메뉴 열기" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<!-- 모바일 드로어 -->
<div class="nav-drawer" id="navDrawer" aria-hidden="true">
  <div class="drawer-inner">
    ${NAV_MENU.map(item => `
      <div class="drawer-section">
        <a class="drawer-parent" href="${item.href}">${item.label}</a>
        <div class="drawer-children">
          ${item.children.map(c => `<a class="drawer-child" href="${c.href}">${c.label}</a>`).join('')}
        </div>
      </div>`).join('')}
    <a href="mateship.html#join" class="btn-main" style="margin-top:20px; justify-content:center;">메이트쉽 가입 →</a>
  </div>
</div>
<div class="nav-backdrop" id="navBackdrop"></div>`;
}

/* ── FOOTER HTML ── */
function buildFooter() {
  return `
<footer class="site-footer" role="contentinfo">
  <div>
    <div class="sf-logo">
      <div class="sf-logo-bar"></div>
      <div class="sf-logo-text">GWAA · 사단법인 강원도반려동물협회</div>
    </div>
    <div class="sf-info">
      대표 이지영 &nbsp;·&nbsp; 강원도 원주시 천매봉길 20-9<br>
      033-813-0333 &nbsp;·&nbsp; ganimal1@naver.com<br>
      Copyright © 2026 사단법인 강원도반려동물협회 All rights reserved.
    </div>
  </div>
  <div class="sf-right">
    <div class="sf-links">
      <a href="policy.html">이용약관</a>
      <a href="privacy.html">개인정보처리방침</a>
      <a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener">카카오채널</a>
    </div>
    <div class="sf-sns">
      <a class="sf-sns-btn" href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener" title="카카오채널">K</a>
      <a class="sf-sns-btn" href="#" title="인스타그램">I</a>
      <a class="sf-sns-btn" href="#" title="네이버 블로그">N</a>
    </div>
  </div>
</footer>

<!-- 카카오 플로팅 버튼 -->
<a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener"
   class="kakao-float" aria-label="카카오채널 문의하기">
  <svg viewBox="0 0 24 24" fill="#000000">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.618 1.574 4.917 3.963 6.294L5 21l4.576-2.452A11.2 11.2 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
  </svg>
</a>`;
}

/* ── NAV CSS ── */
function injectNavCSS() {
  const s = document.createElement('style');
  s.textContent = `
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
  background: rgba(8,8,8,0.94); backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  transition: background 0.3s;
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.nav-logo-bar { width: 3px; height: 24px; background: var(--green,#4ade80); border-radius: 2px; }
.nav-logo-text { font-family: 'Space Mono', monospace; font-size: 12px; color: #fff; letter-spacing: 0.08em; }
.nav-logo-sub  { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; }

.nav-links { display: flex; align-items: center; gap: 2px; }

.nav-item { position: relative; }
.nav-link {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; letter-spacing: 0.08em; color: rgba(255,255,255,0.5);
  text-decoration: none; padding: 8px 12px; border-radius: 5px;
  font-weight: 500; transition: color 0.2s, background 0.2s; white-space: nowrap;
}
.nav-link:hover, .nav-item:hover .nav-link { color: #fff; background: rgba(255,255,255,0.05); }
.nav-link.active { color: var(--green,#4ade80); }
.nav-arrow { flex-shrink: 0; color: rgba(255,255,255,0.3); transition: transform 0.2s; }
.nav-item:hover .nav-arrow { transform: rotate(180deg); color: rgba(255,255,255,0.6); }

/* ── 드롭다운 ── */
.nav-dropdown {
  position: absolute; top: calc(100% + 6px); left: 50%;
  transform: translateX(-50%) translateY(-4px);
  min-width: 220px; background: #141414;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
  padding: 6px; opacity: 0; pointer-events: none;
  transition: opacity 0.18s, transform 0.18s;
  box-shadow: 0 16px 40px rgba(0,0,0,0.6);
}
.nav-item:hover .nav-dropdown {
  opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0);
}
.dd-item {
  display: block; padding: 9px 14px; font-size: 12px; color: rgba(255,255,255,0.55);
  text-decoration: none; border-radius: 6px; letter-spacing: 0.03em; line-height: 1.4;
  transition: background 0.15s, color 0.15s;
}
.dd-item:hover { background: rgba(74,222,128,0.1); color: #fff; }

.nav-cta {
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  padding: 8px 18px; background: var(--green,#4ade80); color: #080808;
  border-radius: 22px; cursor: pointer; text-decoration: none;
  transition: transform 0.15s, opacity 0.15s; white-space: nowrap;
}
.nav-cta:hover { transform: scale(1.03); opacity: 0.9; }

/* ── 모바일 ── */
.nav-mobile-btn {
  display: none; flex-direction: column; gap: 5px;
  cursor: pointer; padding: 6px; background: none; border: none;
}
.nav-mobile-btn span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 1px; transition: all 0.3s; }
.nav-mobile-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-mobile-btn.open span:nth-child(2) { opacity: 0; }
.nav-mobile-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-drawer {
  position: fixed; top: 64px; right: 0; bottom: 0; width: min(320px, 88vw);
  background: #0f0f0f; border-left: 1px solid rgba(255,255,255,0.07);
  transform: translateX(100%); transition: transform 0.3s ease; z-index: 190;
  overflow-y: auto;
}
.nav-drawer.open { transform: none; }
.nav-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 180;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.nav-backdrop.open { opacity: 1; pointer-events: auto; }

.drawer-inner { padding: 24px 20px; display: flex; flex-direction: column; gap: 4px; }
.drawer-section { border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px; margin-bottom: 4px; }
.drawer-parent {
  display: block; font-family: 'Space Mono', monospace; font-size: 11px;
  letter-spacing: 0.1em; color: rgba(255,255,255,0.4); text-decoration: none;
  padding: 10px 4px 4px; transition: color 0.2s;
}
.drawer-parent:hover { color: var(--green,#4ade80); }
.drawer-children { display: flex; flex-direction: column; }
.drawer-child {
  display: block; font-size: 13px; color: rgba(255,255,255,0.65);
  text-decoration: none; padding: 9px 8px; border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.drawer-child:hover { background: rgba(74,222,128,0.08); color: #fff; }

@media (max-width: 900px) {
  .nav-links, .nav-cta { display: none !important; }
  .nav-mobile-btn { display: flex; }
  .site-nav { padding: 0 20px; }
}
  `;
  document.head.appendChild(s);
}

/* ── SCROLL FADE-IN ── */
function initFadeIn() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.transitionDelay = (i % 5 * 0.08) + 's';
    io.observe(el);
  });
}

/* ── NAV SCROLL EFFECT ── */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 60
      ? 'rgba(8,8,8,0.98)'
      : 'rgba(8,8,8,0.94)';
  }, { passive: true });
}

/* ── MOBILE DRAWER ── */
function initMobileDrawer() {
  const btn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('navDrawer');
  const backdrop = document.getElementById('navBackdrop');
  if (!btn || !drawer) return;

  function toggle(open) {
    btn.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));
  backdrop.addEventListener('click', () => toggle(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  injectNavCSS();

  const navEl = document.getElementById('site-nav');
  if (navEl) navEl.outerHTML = buildNav();

  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.outerHTML = buildFooter();

  initNavScroll();
  initMobileDrawer();
  initFadeIn();
});
