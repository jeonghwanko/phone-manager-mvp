(function(root){
// 예시 기준값: 견적서에 값이 없을 때만 쓰고, 화면에 '예시 기준값'으로 표시
const REF={basePlan:55000,addonPrice:9900,rate:5.9,months:24};
function num(s){if(s==null)return null;s=String(s).replace(/[,\s원]/g,'');let m=s.match(/^(\d+(?:\.\d+)?)만(?:(\d+)천)?/);if(m)return Math.round(+m[1]*1e4+(m[2]?+m[2]*1e3:0));
 m=s.match(/^(\d+)천/);if(m)return +m[1]*1e3;m=s.match(/^\d+(?:\.\d+)?/);return m?+m[0]:null}
const N='(\\d[\\d,.]*\\s*(?:만\\s*(?:\\d+\\s*천)?|천)?\\s*원?)';
function find(t,re){const m=t.match(re);return m?num(m[1]):null}
function planWon(v){return v==null?null:v<1000?v*1000:v}
function parse(t){t=t.replace(/\r/g,'');const q={src:t,ref:[]};
 q.device=find(t,new RegExp('(?:출고가|기기값|정가|단말기?\\s*가격?)\\s*[:：]?\\s*'+N));
 q.principal=find(t,new RegExp('할부\\s*원금\\s*[:：]?\\s*'+N));
 q.cash=find(t,new RegExp('(?:현금\\s*완납|완납|일시불)\\s*(?:가|금액)?\\s*[:：]?\\s*'+N));
 q.cashback=find(t,new RegExp('(?:페이백|캐시백|현금\\s*지원)\\s*[:：]?\\s*'+N));
 let m=t.match(/요금제\s*[:：]?\s*(?:월\s*)?(\d[\d,.]*\s*(?:만\s*(?:\d+\s*천)?)?)\s*원?[^\n\d]{0,8}?(\d+)\s*개월/)||t.match(/(\d{2,3}(?:,\d{3})?)\s*요금제[^\n\d]{0,8}?(\d+)\s*개월/);
 if(m){q.plan=planWon(num(m[1]));q.planMonths=+m[2]}else{q.plan=planWon(find(t,/요금제\s*[:：]?\s*(?:월\s*)?(\d[\d,.]*\s*(?:만\s*(?:\d+\s*천)?)?)/));q.planMonths=q.plan?REF.months:0}
 q.after=planWon(find(t,new RegExp('(?:이후|변경\\s*후|평소)\\s*(?:요금제?)?\\s*[:：]?\\s*(?:월\\s*)?'+N)));
 m=t.match(/부가\s*(?:서비스)?\s*(\d+)\s*개(?!월)[^\n]*?(\d+)\s*개월/);q.addonCount=m?+m[1]:(/부가/.test(t)?1:0);q.addonMonths=m?+m[2]:(q.addonCount?REF.months:0);
 q.addonPrice=find(t,/부가[^\n]*?(?:월|개당)\s*(\d[\d,.]*\s*(?:만|천)?\s*원?)/);
 q.rate=find(t,/(?:이자|금리)\s*(?:율)?\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%/);
 q.instMonths=find(t,/(\d{2})\s*개월\s*할부/)||REF.months;
 m=t.match(/카드[^\n]*/);q.card=m?m[0]:null;q.cardSpend=q.card?find(q.card,new RegExp('(?:실적|이용|사용)\\s*'+N)):null;
 return q}
function calc(q){const M=24,ref=[],traps=[],W=n=>Math.round(n).toLocaleString('ko-KR')+'원';
 const base=q.after!=null?q.after:(ref.push(`평소 요금 월 ${W(REF.basePlan)} (예시 기준값)`),REF.basePlan);
 let principal=q.principal;if(principal==null&&q.cash==null&&q.device!=null)principal=q.device;principal=principal||0;
 const rate=q.rate!=null?q.rate:(principal>0?(ref.push(`할부 이자 연 ${REF.rate}% (예시 기준값)`),REF.rate):0);
 const r=rate/1200,n=q.instMonths,mo=principal>0?(r?principal*r/(1-Math.pow(1+r,-n)):principal/n):0;
 const interest=principal>0?mo*Math.min(n,M)-principal*Math.min(n,M)/n:0;
 const devicePaid=(q.cash||0)+principal*Math.min(n,M)/n;
 const planM=Math.min(q.planMonths||0,M),plan=q.plan||0;
 const planExtra=plan>base?(plan-base)*planM:0;
 const addonP=q.addonCount?(q.addonPrice!=null?q.addonPrice:(ref.push(`부가서비스 월 ${W(REF.addonPrice)}/개 (예시 기준값)`),REF.addonPrice)):0;
 const addon=q.addonCount*addonP*Math.min(q.addonMonths,M);
 const cashback=q.cashback||0;
 const comm=plan?plan*planM+base*(M-planM):base*M;
 const total=devicePaid+interest+comm+addon-cashback;
 const headline=(q.cash||0)+(q.principal!=null?q.principal:principal);
 const hidden=Math.max(0,total-headline-base*M);
 if(planExtra>0)traps.push({t:'고가 요금제 유지',won:planExtra,msg:`월 ${W(plan)} 요금제를 ${planM}개월 유지해야 해서 평소 요금보다 ${W(planExtra)} 더 냅니다.`});
 if(q.principal===0&&planExtra>0)traps.push({t:'할부원금 0원 착시',won:0,msg:`할부원금 0원인데 요금제 차액으로 ${W(planExtra)} 냅니다. 공짜폰이 아니에요.`});
 if(addon>0)traps.push({t:'부가서비스 끼워팔기',won:addon,msg:`부가서비스 ${q.addonCount}개를 ${q.addonMonths}개월 유지하면 ${W(addon)}이 나가요. 해지 날짜를 꼭 달력에 적으세요.`});
 if(interest>0)traps.push({t:'할부 이자',won:interest,msg:`할부원금 ${W(principal)}에 연 ${rate}% 이자가 붙어 24개월 동안 이자만 ${W(interest)}예요. 현금 완납이면 안 내도 돼요.`});
 if(q.card)traps.push({t:'카드 할인 조건',won:0,msg:`"${q.card.trim()}" — ${q.cardSpend?`매달 ${W(q.cardSpend)} 이상 써야`:'전월 실적을 채워야'} 할인돼요. 실적 못 채우면 할인이 사라져서 총액에 넣지 않았어요.`});
 if(cashback>0)traps.push({t:'페이백 약속',won:0,msg:`페이백 ${W(cashback)}은 총액에서 뺐지만, 구두 약속이면 못 받는 경우가 많아요. 계약서에 금액·지급일을 적어달라고 하세요.`});
 const score=Math.min(100,Math.round(hidden/7000)+traps.length*4);
 const title=score>=80?'🏆 전설의 호갱님':score>=60?'🐟 대리점의 VIP 물주':score>=40?'😵 반쯤 털린 호갱':score>=20?'🤨 살짝 호갱 기운':'😎 호갱 면역자';
 return {M,base,principal,rate,interest,devicePaid,planExtra,addon,cashback,comm,total,headline,hidden,traps,score,title,ref}}
const api={parse,calc,num,REF};if(typeof module!=='undefined')module.exports=api;else root.Quote=api})(this);
