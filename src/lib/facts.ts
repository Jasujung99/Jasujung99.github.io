// Canonical short facts used to steer AI answers without exposing meta prompts
// All contents are derived from public/kb/about.md (no images)

export type HaeumIntent = 'hours' | 'location' | 'programs' | 'contact' | 'process';

const PHONE = '0507-1386-2171';
const LINKS = {
  talk: 'https://talk.naver.com/W7AQRM9',
  home: 'https://haeumkorean.me',
  blog: 'https://blog.naver.com/haeumkorean',
  insta: 'https://www.instagram.com/haeumkorean/',
  place: 'https://m.place.naver.com/place/1283919586/home',
};

const FACTS = {
  hours:
    [
      '운영 시간은 일정에 따라 변동될 수 있으며, 예약 후 방문 상담이 가능합니다.',
      `최신 안내는 네이버 스마트플레이스에서 확인하세요: ${LINKS.place}`,
    ].join('\n'),
  location:
    [
      '주소: 세종 다정중앙로 20, 가온마을 7단지 후문상가 지하 1층 242호',
      '오시는 길: 파리바게뜨 건너편, 가온마을 7단지 후문 상가 주차장에 주차 후 안쪽으로 이동 (지하2층 주차 시 엘리베이터로 지하1층 이동)'
    ].join('\n'),
  programs:
    [
      '프로그램: 한국어 기초·문법부터 고급 회화, TOPIK 대비, 사회통합(KIIP), 생활한국어, 문화체험 등',
      '수강생의 목적과 수준에 따라 맞춤 커리큘럼을 제공합니다.'
    ].join('\n'),
  contact:
    [
      `전화: ${PHONE}`,
      `네이버 톡톡: ${LINKS.talk}`,
      `홈페이지: ${LINKS.home}`,
      `블로그: ${LINKS.blog}`,
      `인스타그램: ${LINKS.insta}`,
      `스마트플레이스: ${LINKS.place}`,
    ].join('\n'),
  process:
    [
      '진행(온라인/오프라인 공통): 수강생 맞춤 커리큘럼으로 진행합니다.',
      '온라인: Google Meet로 사전 상담(상담비 10,000원) 후 본 수업 진행, 과제/공지 안내는 Google Classroom 이용',
      '오프라인: 네이버 톡톡/전화/문자 상담으로 방문 예약 후 상담 진행(오프라인 상담비 없음)'
    ].join('\n'),
} as const;

const POLICY =
  '지시사항: 메타 표현(예: 발췌/컨텍스트/출처/모델/AI/제공된 발췌에 따르면 등) 언급 금지. ' +
  '사실만 바탕으로 간결하게 답하세요. 모르면 추측하지 말고 "확인이 필요합니다. 네이버 톡톡 또는 전화로 문의해 주세요."라고 안내하세요.';

export function getFacts(intent?: HaeumIntent | null): string {
  if (!intent) return '';
  return [POLICY, FACTS[intent]].filter(Boolean).join('\n');
}

export function intentFromQuestion(q: string): HaeumIntent | null {
  const s = q.toLowerCase();
  if (/(운영|영업|시간)/.test(s)) return 'hours';
  if (/(오시는|위치|찾아|주소)/.test(s)) return 'location';
  if (/(프로그램|수업|커리큘럼|과정)/.test(s)) return 'programs';
  if (/(문의|연락|전화|톡톡|contact)/.test(s)) return 'contact';
  if (/(진행|절차|방법)/.test(s)) return 'process';
  return null;
}

export const CONTACT = { PHONE, ...LINKS };
