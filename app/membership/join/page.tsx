import JoinClient from './JoinClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'GWAA 멤버십 가입 · 연회비 | 강원도반려동물협회',
  description: '전국 반려 제휴처 할인, 협회 행사 할인, 디지털 회원증까지. GWAA 멤버십으로 반려생활의 혜택을 누리세요.',
};

export default function MembershipJoinPage() {
  return <JoinClient />;
}
