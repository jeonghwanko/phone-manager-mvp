// 운영 설정. 비워두면 '문의: GitHub 이슈'로 대체돼요.
// 개인 이메일·실명을 넣으면 공개 저장소에 노출됩니다. 필요할 때만, 공개용 주소로 넣으세요.
// 이 서비스는 개인정보를 받지 않아요. 이용자가 판매점에 직접 연락해요.
window.CONFIG = {
  OPERATOR_NAME: '',   // 예: '호갱 판독기 운영자' (닉네임 가능)
  CONTACT_EMAIL: '',   // 예: 공개용 문의 메일
  GA_ID: '',           // 예: 'G-XXXXXXXXXX' (비우면 분석 도구를 불러오지 않음)
  // 제휴 판매점. 비어 있으면 '제휴 판매점 준비 중'과 요약 복사만 보여요.
  // kakao는 https://pf.kakao.com/... 또는 https://open.kakao.com/... , tel은 'tel:0212345678' 형식만 허용.
  // 예: { name: '○○모바일 강남점', kakao: 'https://pf.kakao.com/_xxxx', tel: '', code: 'HOGANG10' }
  DEALERS: [],
  REPO: 'https://github.com/jeonghwanko/phone-manager-mvp'
};
