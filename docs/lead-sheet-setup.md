# 견적 요청을 Google 시트로 받기 (Apps Script)

서버 없이 견적 요청을 내 Google 시트에 쌓는 방법이에요. 설정하지 않으면 견적 요청은 이용자 기기에만 저장되고, 화면에도 그렇게 안내돼요.

## 1. 시트 만들기
1. Google 드라이브에서 새 스프레드시트를 만들어요. 이름은 예를 들어 `호갱판독기 견적요청`으로 해요.
2. 메뉴 **확장 프로그램 → Apps Script**를 열어요.

## 2. 코드 붙여넣기
`Code.gs` 내용을 모두 지우고 아래를 붙여넣은 뒤 저장해요.

```js
const SHEET = 'leads';
const RETENTION_MONTHS = 6;   // 보관 기간 (개인정보처리방침과 같게)
const MAX_PER_MINUTE = 20;    // 전체 요청 상한 (분당)

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return out('ok');                       // 봇 함정(숨은 칸)에 값이 있으면 무시
  const name = clean(p.name, 40);
  const phone = String(p.phone || '').replace(/[^0-9-]/g, '').slice(0, 20);
  const area = clean(p.area, 40);
  const summary = clean(p.summary, 300);
  if (!name || !/^01\d-?\d{3,4}-?\d{4}$/.test(phone) || p.consent !== 'Y') return out('invalid');

  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('rate') || 0);
  if (n >= MAX_PER_MINUTE) return out('busy');           // 분당 상한
  cache.put('rate', String(n + 1), 60);
  const dupKey = 'p' + phone.replace(/-/g, '');
  if (cache.get(dupKey)) return out('dup');              // 같은 번호 10분 내 중복 차단
  cache.put(dupKey, '1', 600);

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) sh.appendRow(['받은 시각', '이름/닉네임', '연락처', '희망 지역', '견적 요약', '필수 동의', '동의 버전']);
    sh.appendRow([new Date(), name, "'" + phone, area, summary, 'Y', clean(p.consent_version, 20)]);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

// 시트 수식 실행을 막고 길이를 자름
function clean(v, max) {
  let s = String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function out(s) { return ContentService.createTextOutput(s); }

// 보관 기간이 지난 행 삭제 (아래 4단계에서 매일 실행되게 설정)
function purgeOld() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  if (!sh || sh.getLastRow() < 2) return;
  const limit = new Date(); limit.setMonth(limit.getMonth() - RETENTION_MONTHS);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = rows.length - 1; i >= 0; i--) if (new Date(rows[i][0]) < limit) sh.deleteRow(i + 2);
}
```

## 3. 웹 앱으로 배포
1. 오른쪽 위 **배포 → 새 배포**를 눌러요.
2. 유형 선택(톱니바퀴)에서 **웹 앱**을 골라요.
3. **실행 계정: 나**, **액세스 권한: 모든 사용자**로 설정하고 **배포**를 눌러요.
4. 권한 승인 창이 뜨면 본인 계정으로 허용해요. ("확인되지 않은 앱" 경고가 나오면 **고급 → 이동**을 눌러요. 내가 만든 스크립트라서 그래요.)
5. 나온 **웹 앱 URL**(`https://script.google.com/macros/s/.../exec`)을 복사해요.

## 4. 자동 삭제 켜기
Apps Script 왼쪽 **트리거(시계 아이콘) → 트리거 추가**에서 함수 `purgeOld`, 이벤트 소스 **시간 기반**, **일 단위 타이머**로 저장해요.

## 5. 사이트에 연결
저장소의 `config.js`에서 `LEAD_ENDPOINT`에 URL을 넣고 커밋해요.

```js
LEAD_ENDPOINT: 'https://script.google.com/macros/s/XXXX/exec',
```

몇 분 뒤 사이트에서 예시 견적서로 판독하고 **판매점 견적 받기**를 눌러 시트에 한 줄이 들어오는지 확인해요.

## 알아둘 점
- 브라우저는 `no-cors`로 보내서 응답을 읽지 못해요. 화면의 "보냈어요"는 전송 시도가 끝났다는 뜻이에요. 시트에서 실제로 들어왔는지 확인하세요.
- URL은 공개돼요. 위 코드의 형식 검사·중복 차단·분당 상한이 기본 보호예요. 스팸이 많으면 `MAX_PER_MINUTE`를 낮추거나 URL을 새로 배포해 바꾸세요.
- 코드를 고치면 **배포 → 배포 관리 → 수정 → 새 버전**으로 다시 배포해야 반영돼요. (URL은 그대로예요.)
- 시트는 공유하지 마세요. 개인정보가 들어 있어요.
