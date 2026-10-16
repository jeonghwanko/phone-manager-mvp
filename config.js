// 운영 설정. 비워두면 '문의: GitHub 이슈'로 대체되고, 견적 요청은 이 기기(localStorage)에만 저장돼요.
// 개인 이메일·실명을 넣으면 공개 저장소에 노출됩니다. 필요할 때만, 공개용 주소로 넣으세요.
window.CONFIG = {
  OPERATOR_NAME: '',   // 예: '호갱 판독기 운영자' (닉네임 가능)
  CONTACT_EMAIL: '',   // 예: 공개용 문의 메일
  LEAD_ENDPOINT: '',   // Google Apps Script 웹 앱 URL (docs/lead-sheet-setup.md)
  GA_ID: '',           // 예: 'G-XXXXXXXXXX' (비우면 분석 도구를 불러오지 않음)
  RETENTION_MONTHS: 6,
  REPO: 'https://github.com/jeonghwanko/phone-manager-mvp'
};
