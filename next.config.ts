import type { NextConfig } from "next";

// 모든 응답에 붙는 기본 보안 헤더
const securityHeaders = [
  // HTTPS 강제 (2년)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // 브라우저의 MIME 추측 차단
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // 다른 사이트가 이 사이트를 iframe 으로 감싸 클릭을 가로채는 공격(클릭재킹) 차단
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  // 외부로 나갈 때 전체 URL(입장권·회원증 토큰 포함)이 Referer 로 새지 않게
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 사용하지 않는 브라우저 권한 차단 (결제 SDK 용 payment 는 허용)
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), payment=(self)' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // 토큰이 URL 에 들어가는 페이지·관리자·테스트 페이지는 검색 노출 금지
      {
        source: '/:section(admin|t|m|pg-test)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      { source: '/pg-test', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
