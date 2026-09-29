// 행사 후기 갤러리 공용 유틸 — 중복 제거 + 랜덤 믹싱
//
// ▸ DUP_ALIAS: md5가 완전히 동일한 "한 행사 안에서 반복된" 사진의
//   중복 경로 → 대표(canonical) 경로. 표시 단계에서 대표로 통일해
//   같은 사진이 후기에 두세 번 보이는 문제를 없앤다. (파일은 대표만 남김)
//   ※ 서로 다른 행사끼리 공유하는 사진은 각 행사 맥락이라 통일하지 않는다.
export const DUP_ALIAS: Record<string, string> = {
  '/images/events/gapyeong-2025/45.webp': '/images/events/gapyeong-2025/34.webp',
  '/images/events/gapyeong-2025/46.webp': '/images/events/gapyeong-2025/35.webp',
  '/images/events/gapyeong-2025/69.webp': '/images/events/gapyeong-2025/35.webp',
  '/images/events/gapyeong-2025/66.webp': '/images/events/gapyeong-2025/55.webp',
  '/images/events/gapyeong-2025/67.webp': '/images/events/gapyeong-2025/56.webp',
  '/images/events/gapyeong-2025/68.webp': '/images/events/gapyeong-2025/57.webp',
};

// 경로 배열을 대표 경로로 통일하고, 같은 사진은 한 번만 남긴다.
export function dedupeImages(paths: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    if (!p) continue;
    const canon = DUP_ALIAS[p] ?? p;
    if (seen.has(canon)) continue;
    seen.add(canon);
    out.push(canon);
  }
  return out;
}

// 결정적(시드) 셔플 — 매번 같은 "랜덤" 순서라 서버/클라이언트 하이드레이션이 어긋나지 않는다.
// 비슷한 컷이 뭉치지 않도록 전체 풀을 섞는 용도.
export function seededShuffle<T>(arr: T[], seed = 20260929): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
