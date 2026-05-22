/**
 * 룩북 아이템에 이미지 URL을 추가하는 업데이트 스크립트
 * 실행: node scripts/update-lookbook.mjs
 */

const BASE = 'https://gwaa-next.vercel.app/api/data';

const LABEL_TO_IMAGE = {
  '캠핑': 'https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=800&q=80',
  '트레킹': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  '문화축제': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  '교육': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
  '봉사활동': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
};

// GET existing lookbook items
const res = await fetch(`${BASE}/lookbook_items`);
const items = await res.json();

console.log(`Found ${items.length} lookbook items`);

for (const item of items) {
  const label = item.label || '';
  // Match partial label (e.g., '캠핑 · 아웃도어' → '캠핑')
  const key = Object.keys(LABEL_TO_IMAGE).find(k => label.includes(k));
  if (!key) {
    console.log(`No image mapping for label: "${label}" (id: ${item.id}), skipping`);
    continue;
  }
  const imageData = LABEL_TO_IMAGE[key];
  const updated = { ...item, imageData };
  const putRes = await fetch(`${BASE}/lookbook_items`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
  const result = await putRes.json();
  if (putRes.ok) {
    console.log(`✓ Updated "${label}" (id: ${item.id}) → ${imageData.slice(0, 60)}...`);
  } else {
    console.error(`✗ Failed "${label}" (id: ${item.id}):`, result);
  }
}

console.log('\nDone! Lookbook images updated.');
