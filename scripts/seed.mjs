// Reads defaults from the compiled Next.js server bundle isn't easy,
// so we replicate the key defaults inline and POST to the live API.

const BASE = 'https://gwaa-next.vercel.app/api/data';

async function seed(table, rows) {
  // Skip if table already has data
  const check = await fetch(`${BASE}/${table}`);
  const existing = await check.json();
  if (Array.isArray(existing) && existing.length > 0) {
    console.log(`skip ${table} (already has ${existing.length} rows)`);
    return;
  }
  let ok = 0, fail = 0;
  for (const row of rows) {
    const res = await fetch(`${BASE}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    if (res.ok) ok++;
    else { fail++; console.error(`  ✗ ${table}`, await res.text()); }
  }
  console.log(`✓ ${table}: ${ok} inserted, ${fail} failed`);
}

// ── activity_cards ─────────────────────────────────────
await seed('activity_cards', [
  { order: 1, tag: 'EDUCATION', tagColor: 'green', icon: '🎓', title: '반려동물 교육', desc: '독스포츠(어질리티), 오비디언스 교육부터 반려동물행동지도사 국가자격증 취득까지. 전문 트레이너와 체계적인 커리큘럼.', link: '/education', linkText: '교육 신청하기 →' },
  { order: 2, tag: 'EVENTS',    tagColor: 'blue',  icon: '🎪', title: '반려동물 행사',  desc: '강원도 전역에서 펼쳐지는 반려동물 문화축제, 트레킹, 캠핑, 사진공모전. 2021년부터 4만명이 함께했습니다.', link: '/events', linkText: '행사 보기 →' },
  { order: 3, tag: 'MATESHIP',  tagColor: 'amber', icon: '🤝', title: '메이트쉽 멤버십', desc: '호텔, 카페, 캠핑, 사료·용품 할인과 행사 우선 참여까지. 메이트쉽 회원은 연간 40만원 이상 절약합니다.', link: '/mateship', linkText: '혜택 보기 →' },
]);

// ── event_cards ─────────────────────────────────────────
await seed('event_cards', [
  { order: 1, title: '2026 반려동물 숲치유 in 양평', date: '2026.04.04 — 2026.11.07', loc: '숲치유 · 양평', desc: '반려동물과 함께하는 자연 속 힐링 프로그램. 전문 숲치유사와 함께 진행됩니다.', content: '', status: 'live', link: '', benefit: '⭐ 메이트쉽 회원 우선 예약', ctaText: '사전 예약하기 →' },
  { order: 2, title: '2026 반려동물 캠핑 프로그램', date: '2026.05.01 — 2026.09.30', loc: '캠핑 · 강원도', desc: '강원도 야외 캠핑장에서 반려동물과 함께하는 1박 2일 캠핑. 메이트쉽 회원 우선 신청.', content: '', status: 'soon', link: '', benefit: '⭐ 회원 30% 할인', ctaText: '사전 신청하기 →' },
  { order: 3, title: '반려동물 동반 요가 클래스', date: '2026.03.01 — 2026.12.31', loc: '요가 · 원주', desc: '반려견과 함께 즐기는 요가 클래스. 매월 정기 운영. 메이트쉽 회원 무료.', content: '', status: 'live', link: '', benefit: '⭐ 회원 무료 이용', ctaText: '신청하기 →' },
]);

// ── archive_events ──────────────────────────────────────
await seed('archive_events', [
  { order: 1, feat: true,  year: 2025, title: 'Mission Dog Trekking — 고성', loc: '고성', ppl: '300+', date: '2025.10.18(토) 13:00 ~ 18:00', place: '강원특별자치도 고성군 현내면 일대', part: '자체 기획·제작·운영', desc: '강원도 고성에서 사람과 반려견이 함께 자연을 걷고 교감하는 트레킹 이벤트.' },
  { order: 2, feat: false, year: 2025, title: '가평군 반려동물 문화행사', loc: '가평', ppl: '5,000', date: '2025.06.07(토) 10:00 ~ 17:00', place: '경기도 가평군 자라섬 중도 일원', part: '자체 기획·제작·운영', desc: '반려동물과 함께하는 야외 문화축제. 5,000여 명의 반려인이 참가했습니다.' },
  { order: 3, feat: false, year: 2024, title: '제2회 원주시 반려동물문화행사', loc: '원주', ppl: '5,000', date: '2024.10.19(토)', place: '강원특별자치도 원주시 중앙공원', part: '자체 기획·제작·운영', desc: '원주시 반려인들을 위한 반려동물 문화행사 2회. 5,000여 명이 참가했습니다.' },
  { order: 4, feat: true,  year: 2024, title: '제2회 강릉시반려동물문화축제', loc: '강릉', ppl: '3,500', date: '2024.09.28(토)', place: '강원특별자치도 강릉시 경포호 일원', part: '자체 기획·제작·운영', desc: '강릉 경포호 일대에서 열린 반려동물 문화축제. 3,500명이 참가했습니다.' },
  { order: 5, feat: false, year: 2024, title: '삼척해안 반려견 트레킹 & 페스타', loc: '삼척', ppl: '2,000', date: '2024 (2회 진행)', place: '강원특별자치도 삼척시 해안일대', part: '자체 기획·제작·운영', desc: '삼척 해안을 따라 반려견과 함께 걷는 트레킹 행사. 총 2,000여 명이 참가했습니다.' },
  { order: 6, feat: false, year: 2024, title: '원주시 반려견 이동식 운동장', loc: '원주', ppl: '2,190', date: '2024 (7회 진행)', place: '강원특별자치도 원주시 일원', part: '자체 기획·제작·운영', desc: '원주시와 협력하여 운영한 반려견 이동식 운동장. 7회에 걸쳐 진행되었습니다.' },
  { order: 7, feat: false, year: 2023, title: '제1회 강릉시반려동물문화축제', loc: '강릉', ppl: '3,000', date: '2023.09.23(토)', place: '강원특별자치도 강릉시 경포호 일원', part: '자체 기획·제작·운영', desc: '강릉시와 함께한 첫 번째 반려동물 문화축제. 3,000여 명의 반려인이 참가했습니다.' },
  { order: 8, feat: false, year: 2022, title: '전국댕댕자랑 사진공모전', loc: '원주', ppl: '1,340', date: '2022', place: '강원특별자치도 원주시 (온·오프라인)', part: '자체 기획·제작·운영', desc: '전국 반려인을 대상으로 진행한 반려동물 사진공모전. 1,340명이 참여했습니다.' },
  { order: 9, feat: false, year: 2021, title: '제1회 강원도반려동물문화축제', loc: '원주', ppl: '1,500', date: '2021 — 협회 창립', place: '강원특별자치도 원주시', part: '자체 기획·제작·운영', desc: '협회 창립과 함께 열린 제1회 반려동물문화축제. 1,500명이 참가했습니다.' },
]);

// ── lookbook_items ──────────────────────────────────────
await seed('lookbook_items', [
  { order: 1, label: '캠핑 · 아웃도어', link: '/travel',    isMain: true,  imageData: 'https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=800&q=80' },
  { order: 2, label: '트레킹',          link: '/travel',    isMain: false, imageData: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80' },
  { order: 3, label: '문화축제',        link: '/travel',    isMain: false, imageData: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80' },
  { order: 4, label: '교육',            link: '/education', isMain: false, imageData: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80' },
  { order: 5, label: '봉사활동',        link: '/about',     isMain: false, imageData: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80' },
]);

// ── mateship_partners ───────────────────────────────────
await seed('mateship_partners', [
  { order: 1, name: '세인트존스호텔',         region: '강릉', type: '호텔',     discount: '인터넷 최저가 이하', icon: '🏨',  gradient: 'linear-gradient(135deg,#dbeafe 0%,#93c5fd 100%)', link: '#' },
  { order: 2, name: '피닉스파크 리조트',      region: '평창', type: '리조트',   discount: '회원 할인',          icon: '⛷️', gradient: 'linear-gradient(135deg,#cffafe 0%,#67e8f9 100%)', link: '#' },
  { order: 3, name: '퍼피파크 애견카페',      region: '원주', type: '카페',     discount: '30% 할인',           icon: '☕', gradient: 'linear-gradient(135deg,#fef3c7 0%,#fcd34d 100%)', link: '#' },
  { order: 4, name: '죽도해변 반려견 캠핑장', region: '양양', type: '캠핑',     discount: '30% 할인',           icon: '🏕️', gradient: 'linear-gradient(135deg,#dcfce7 0%,#86efac 100%)', link: '#' },
  { order: 5, name: '반려동물 테마파크',      region: '홍천', type: '공원',     discount: '회원 할인',          icon: '🌳', gradient: 'linear-gradient(135deg,#d1fae5 0%,#6ee7b7 100%)', link: '#' },
  { order: 6, name: '내린천 반려견 래프팅',   region: '인제', type: '액티비티', discount: '회원 할인',          icon: '🚣', gradient: 'linear-gradient(135deg,#dbeafe 0%,#7dd3fc 100%)', link: '#' },
]);

// ── gallery_items ───────────────────────────────────────
await seed('gallery_items', [
  { order: 1, caption: '2025 Mission Dog Trekking — 고성', active: true },
  { order: 2, caption: '가평군 반려동물 문화행사', active: true },
  { order: 3, caption: '강원도 반려동물 캠핑 페스티벌', active: true },
  { order: 4, caption: '어질리티 챔피언십 대회', active: true },
  { order: 5, caption: '반려견 트레킹 & 해변 페스타', active: true },
]);

// ── travel_places (50 places) ───────────────────────────
await seed('travel_places', [
  { order:1,  region:'춘천', type:'체험', typeLabel:'테마파크',  name:'강아지숲', icon:'🌲', address:'춘천시 남산면 충효로 437', feature:'국내 최대 반려견 테마파크 · 리드줄 해제 운동장', desc:'3만 평 자연 숲 속 반려견 테마파크. 대·소형견 분리 운동장, 노즈워크 산책로, 어질리티 체험, 반려견 수영장 완비.', petInfo:'🐾 5차 예방접종 완료견 · 3개월 이상 · 맹견 입장 불가 · 리드줄 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', map_url:'https://map.naver.com/v5/search/강아지숲+춘천', hours:'10:00–18:00 (월요일·설·추석 당일 휴무)', price:'성인 17,000원 / 청소년 15,000원 / 어린이 12,000원 / 반려견 8,000원' },
  { order:2,  region:'춘천', type:'체험', typeLabel:'레일바이크', name:'경강레일바이크 (강촌레일파크)', icon:'🚂', address:'춘천시 남산면 강촌로 1-1', feature:'반려견 전용 펫바이크 운영 · 북한강 철교 코스', desc:'경강역 폐역에서 출발해 북한강 철교를 건너는 코스. 반려견 전용 탑승석 펫바이크 별도 운영.', petInfo:'🐾 펫바이크: 반려견 합산 10kg 이하 · 목줄 착용', isPartner:false, imageData:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80', map_url:'https://map.naver.com/v5/search/경강레일바이크+강촌', hours:'09:00–17:40 (연중무휴)', price:'일반 2인승 20,000원 / 4인승 30,000원' },
  { order:3,  region:'춘천', type:'체험', typeLabel:'카누·카약', name:'춘천 물레길 카누', icon:'🛶', address:'춘천시 스포츠타운길223번길 95 (의암호)', feature:'반려견과 카누 동승 · 의암호 수상 투어', desc:'의암호 위에서 반려견과 함께 즐기는 카누 체험.', petInfo:'🐾 중형견 이하 동반 가능 · 구명조끼 착용 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', map_url:'https://map.naver.com/v5/search/춘천물레길+의암호', hours:'10:00–19:00 (계절별 상이)', price:'2인 30,000원' },
  { order:4,  region:'춘천', type:'공원', typeLabel:'산책',      name:'공지천 반려견 산책로', icon:'🌿', address:'춘천시 근화동 공지천 일대', feature:'넓은 강변 · 무료 개방', desc:'춘천 시내 한가운데 위치한 공지천변 산책로. 소형견부터 대형견까지 자유롭게 산책할 수 있는 강변 공원.', petInfo:'🐾 목줄 착용 필수 · 배변봉투 지참', isPartner:false, imageData:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', map_url:'https://map.naver.com/v5/search/공지천유원지+춘천', hours:'24시간 개방', price:'무료' },
  { order:5,  region:'춘천', type:'관광', typeLabel:'케이블카',  name:'삼악산 호수 케이블카', icon:'🚡', address:'춘천시 서면 박사로 473', feature:'소양강 호수 위 케이블카 · 반려동물 전용 캐빈', desc:'소양강 호수 수면 위를 가로지르는 케이블카. 반려동물 전용 캐빈 별도 운영.', petInfo:'🐾 소형 반려동물 · 케이지 또는 이동가방 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80', map_url:'https://map.naver.com/v5/search/삼악산호수케이블카+춘천', hours:'09:00–18:00 (연중무휴)', price:'왕복 성인 14,000원 / 소인 11,000원' },
  { order:6,  region:'강릉', type:'호텔', typeLabel:'호텔',      name:'세인트존스호텔', icon:'🏨', address:'강릉시 강문동 34-2', feature:'5성급 · 메이트쉽 파트너 최저가 보장 · 체중 제한 없음', desc:'경포 해변 바로 앞 5성급 호텔. 반려견 전용 객실 운영. 체중 제한 없이 최대 2마리 동반 가능.', petInfo:'🐾 전 견종 체중 제한 없음 · 최대 2마리', isPartner:true, imageData:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', map_url:'https://map.naver.com/v5/search/세인트존스호텔+강릉', hours:'체크인 15:00 / 체크아웃 11:00', price:'펫 객실 350,000원~' },
  { order:7,  region:'강릉', type:'카페', typeLabel:'애견카페',  name:'체크이스트 카페', icon:'☕', address:'강릉시 강변복길 153', feature:'사천해변 근처 감성 인테리어 · 반려견 전용 간식', desc:'사천해변 근처 골목에 자리한 감성 애견동반 카페.', petInfo:'🐾 전 견종 · 목줄 착용 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80', map_url:'https://map.naver.com/v5/search/체크이스트카페+강릉', hours:'10:00–20:00 (연중무휴)', price:'음료 6,000원–12,000원' },
  { order:8,  region:'강릉', type:'카페', typeLabel:'카페',      name:'카페콥스', icon:'☕', address:'강릉시 초당순두부길 54', feature:'초당동 감성 카페 · 넓은 마당', desc:'강릉 초당동 인기 카페. 넓은 야외 마당에서 반려견과 함께 여유롭게 커피를 즐길 수 있음.', petInfo:'🐾 전 견종 · 야외 공간 자유 동반 · 목줄 착용', isPartner:false, imageData:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80', map_url:'https://map.naver.com/v5/search/카페콥스+강릉', hours:'11:00–20:00 (화요일 휴무)', price:'음료 6,000원–10,000원' },
  { order:9,  region:'강릉', type:'식당', typeLabel:'레스토랑',  name:'그릴웍스', icon:'🍖', address:'강릉시 사천면 한과마을길 553', feature:'전 견종 실내 동반 · 텍사스 바베큐', desc:'강릉 사천에 위치한 정통 텍사스 바베큐 레스토랑. 실내·야외 테라스 모두 소·중·대형견 동반 가능.', petInfo:'🐾 소·중·대형견 실내외 동반 · 맹견 제외', isPartner:false, imageData:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', map_url:'https://map.naver.com/v5/search/그릴웍스+강릉', hours:'11:30–21:00 (월요일 휴무)', price:'메뉴당 18,000원–35,000원' },
  { order:10, region:'강릉', type:'공원', typeLabel:'해변',      name:'경포해변', icon:'🌊', address:'강릉시 경포로 365', feature:'반려견 동반 허용 해변 · 드넓은 백사장', desc:'강릉 대표 해수욕장. 비성수기(10월~5월) 반려견 동반 가능. 넓은 백사장에서 자유롭게 산책 가능.', petInfo:'🐾 비성수기 동반 가능 · 목줄 착용 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', map_url:'https://map.naver.com/v5/search/경포해변+강릉', hours:'24시간 개방', price:'무료' },
  { order:11, region:'속초', type:'관광', typeLabel:'케이블카',  name:'설악산 권금성 케이블카', icon:'🚡', address:'속초시 설악산로 1091', feature:'설악산 국립공원 · 반려동물 탑승 가능', desc:'설악산 권금성까지 올라가는 케이블카. 소형 반려동물 이동가방 또는 켄넬 이용 시 탑승 가능.', petInfo:'🐾 소형 반려동물 · 이동가방·켄넬 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', map_url:'https://map.naver.com/v5/search/설악산케이블카+속초', hours:'08:30–17:00 (계절별 상이)', price:'왕복 성인 15,000원 / 소인 10,500원' },
  { order:12, region:'속초', type:'카페', typeLabel:'루프탑카페', name:'테라로사 속초점', icon:'☕', address:'속초시 관광로 151', feature:'설악산 조망 루프탑 · 반려견 동반 가능', desc:'설악산을 바라보며 스페셜티 커피를 즐길 수 있는 넓은 카페. 야외 테라스 반려견 동반 가능.', petInfo:'🐾 야외 테라스 전 견종 동반 · 목줄 착용', isPartner:false, imageData:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', map_url:'https://map.naver.com/v5/search/테라로사+속초', hours:'09:00–21:00 (연중무휴)', price:'음료 6,500원–14,000원' },
  { order:13, region:'속초', type:'공원', typeLabel:'해변',      name:'속초해수욕장', icon:'🌊', address:'속초시 해오름로 216', feature:'설악산 조망 해변 · 반려견 동반 허용', desc:'설악산을 배경으로 펼쳐지는 속초 대표 해변. 비성수기 반려견 동반 가능. 해안가 산책로 완비.', petInfo:'🐾 비성수기 동반 가능 · 목줄 착용 필수 · 배변봉투 지참', isPartner:false, imageData:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', map_url:'https://map.naver.com/v5/search/속초해수욕장', hours:'24시간 개방', price:'무료' },
  { order:14, region:'양양', type:'캠핑', typeLabel:'글램핑',    name:'죽도해변 글램핑', icon:'🏕️', address:'양양군 현북면 죽도해변길', feature:'반려견 동반 가능 · 해변 바로 앞 · 메이트쉽 파트너', desc:'동해 바다 바로 앞에 위치한 프리미엄 글램핑장. 반려견과 함께 해변에서 캠핑을 즐길 수 있음.', petInfo:'🐾 전 견종 동반 가능 · 목줄 착용 필수', isPartner:true, imageData:'https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=600&q=80', map_url:'https://map.naver.com/v5/search/죽도해변+양양', hours:'체크인 15:00 / 체크아웃 11:00', price:'글램핑 1박 180,000원~' },
  { order:15, region:'양양', type:'공원', typeLabel:'해변',      name:'낙산해수욕장', icon:'🌊', address:'양양군 강현면 낙산리 일원', feature:'반려견 동반 가능 · 낙산사 인근', desc:'낙산사 바로 아래 위치한 깨끗한 해수욕장. 비성수기 반려견 동반 가능.', petInfo:'🐾 비성수기 동반 · 목줄 착용 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', map_url:'https://map.naver.com/v5/search/낙산해수욕장', hours:'24시간 개방', price:'무료' },
  { order:16, region:'평창', type:'호텔', typeLabel:'리조트',    name:'피닉스파크 리조트', icon:'🏔️', address:'평창군 봉평면 태기로 174', feature:'사계절 리조트 · 반려견 동반 객실 운영', desc:'강원도 대표 사계절 리조트. 반려견 동반 가능 객실 별도 운영. 넓은 야외 공간 산책 가능.', petInfo:'🐾 10kg 이하 반려견 · 사전 예약 필수', isPartner:true, imageData:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', map_url:'https://map.naver.com/v5/search/피닉스파크+평창', hours:'체크인 15:00 / 체크아웃 11:00', price:'펫 객실 200,000원~' },
  { order:17, region:'평창', type:'체험', typeLabel:'목장',      name:'대관령 하늘목장', icon:'🐄', address:'평창군 대관령면 꽃밭양지길 458-23', feature:'반려견 동반 가능 · 양떼 체험', desc:'대관령 해발 1,100m에 위치한 목장. 반려견 동반 가능 구역에서 탁 트인 초원과 함께 산책 가능.', petInfo:'🐾 목줄 착용 필수 · 가축 접촉 금지', isPartner:false, imageData:'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=600&q=80', map_url:'https://map.naver.com/v5/search/하늘목장+평창', hours:'09:00–18:00 (연중무휴)', price:'성인 11,000원 / 소인 9,000원 / 반려견 3,000원' },
  { order:18, region:'홍천', type:'체험', typeLabel:'반려견파크', name:'홍천 반려동물 테마파크', icon:'🌳', address:'홍천군 홍천읍 일원', feature:'메이트쉽 파트너 · 다양한 어질리티 시설', desc:'홍천에 위치한 반려동물 전용 테마파크. 어질리티 시설, 수영장, 산책로 완비. 메이트쉽 회원 할인.', petInfo:'🐾 모든 반려견 · 예방접종 필수', isPartner:true, imageData:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', map_url:'https://map.naver.com/v5/search/반려동물테마파크+홍천', hours:'10:00–18:00 (화요일 휴무)', price:'성인 12,000원 / 반려견 8,000원' },
  { order:19, region:'인제', type:'체험', typeLabel:'래프팅',    name:'내린천 반려견 래프팅', icon:'🚣', address:'인제군 기린면 내린천 일원', feature:'반려견 동반 래프팅 · 메이트쉽 파트너', desc:'강원도 대표 래프팅 명소 내린천에서 반려견과 함께 즐기는 래프팅. 메이트쉽 회원 할인.', petInfo:'🐾 구명조끼 착용 필수 · 운영사 사전 확인', isPartner:true, imageData:'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600&q=80', map_url:'https://map.naver.com/v5/search/내린천+래프팅+인제', hours:'09:00–17:00 (4월~10월)', price:'1인 35,000원~' },
  { order:20, region:'원주', type:'카페', typeLabel:'애견카페',  name:'퍼피파크 애견카페', icon:'☕', address:'원주시 일원', feature:'메이트쉽 파트너 · 30% 할인', desc:'원주 시내 대형 애견 카페. 실내외 놀이 공간 완비. 메이트쉽 회원 30% 할인.', petInfo:'🐾 예방접종 완료견 · 맹견 제외', isPartner:true, imageData:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80', map_url:'https://map.naver.com/v5/search/퍼피파크+원주', hours:'10:00–20:00 (연중무휴)', price:'입장료 10,000원 (메이트쉽 7,000원)' },
  { order:21, region:'원주', type:'공원', typeLabel:'공원',      name:'치악산 국립공원 산책로', icon:'🌲', address:'원주시 소초면 치악산로 262', feature:'치악산 둘레길 · 반려견 동반 가능', desc:'치악산 국립공원 지정 탐방로 외 둘레길에서 반려견 동반 가능. 계절별 단풍과 설경이 아름다움.', petInfo:'🐾 지정 탐방로 외 동반 · 목줄 착용 필수', isPartner:false, imageData:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', map_url:'https://map.naver.com/v5/search/치악산+국립공원', hours:'일출~일몰', price:'무료 (주차비 별도)' },
]);

console.log('\n✅ 시드 완료');
