const a=require('assert'),Q=require('./quote');
const q=Q.parse('갤럭시 S26 출고가 125만원\n할부원금 0원\n요금제 109,000원 6개월 유지, 이후 요금제 55,000원\n부가 2개 월 9,900원 3개월\n카드 할인 월 1.5만원 (전월 실적 30만원)');
a.equal(q.device,1250000);a.equal(q.principal,0);a.equal(q.plan,109000);a.equal(q.planMonths,6);a.equal(q.after,55000);a.equal(q.addonCount,2);a.equal(q.addonPrice,9900);a.equal(q.addonMonths,3);a.equal(q.cardSpend,300000);
const r=Q.calc(q);a.equal(r.planExtra,324000);a.equal(r.addon,59400);a.equal(r.hidden,383400);a.equal(r.ref.length,0);a.ok(r.traps.some(t=>/할부원금 0원인데 요금제 차액으로 324,000원/.test(t.msg)));
const q2=Q.parse('현금완납 45만원, 109 요금제 6개월');a.equal(q2.cash,450000);a.equal(q2.plan,109000);a.equal(Q.calc(q2).ref.length,1);
console.log('ok',r.score,r.title);
