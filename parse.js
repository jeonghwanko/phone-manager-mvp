(function(root){
const P={
 carrier(t){t=t.toUpperCase().replace(/\s/g,'');if(/알뜰|MVNO/.test(t))return'알뜰폰';if(/LG|유플|U\+/.test(t))return'LGU+';if(/SK/.test(t))return'SKT';if(/KT|케이티/.test(t))return'KT';return null},
 won(t){t=t.replace(/[,\s]/g,'');let m=t.match(/(\d+(?:\.\d+)?)만(?:(\d+)천)?/);if(m)return Math.round(+m[1]*10000+(m[2]?+m[2]*1000:0));m=t.match(/\d{4,7}/);return m?+m[0]:null},
 date(t,today){today=today||new Date();const f=d=>d.toISOString().slice(0,10);t=t.replace(/\s/g,'');
  let m=t.match(/(\d{4})[-./년](\d{1,2})(?:[-./월](\d{1,2}))?/);if(m)return f(new Date(Date.UTC(+m[1],+m[2]-1,+(m[3]||1))));
  if(/끝|없|만료됐|지났/.test(t))return f(today);
  m=t.match(/(\d+)개월/);if(m){const d=new Date(today);d.setMonth(d.getMonth()+ +m[1]);return f(d)}
  m=t.match(/(내년|올해|후년)?(\d{1,2})월/);if(m){let y=today.getFullYear()+({내년:1,후년:2}[m[1]]||0);if(!m[1]&&+m[2]-1<today.getMonth())y++;return f(new Date(Date.UTC(y,+m[2]-1,1)))}
  return null},
 model(t,models){const n=s=>s.toLowerCase().replace(/\s/g,'').replace('프로','pro').replace('플립','zflip');const q=n(t);
  let best=null,score=0;for(const k of Object.keys(models)){const kk=n(k);if(kk===q)return k;const toks=k.toLowerCase().split(' ').map(n);
  const s=toks.filter(x=>q.includes(x)||q.includes(x.replace(/^z/,''))).length/toks.length+(q.includes(kk)?1:0);if(s>score){score=s;best=k}}return score>=0.5?best:null},
 gb(t){if(/무제한|엄청|많이/.test(t))return 100;if(/거의안|조금|적게/.test(t))return 5;const m=t.match(/(\d+(?:\.\d+)?)/);return m?+m[1]:null},
 yesno(t){if(/아니|없|안\s*해|no|x/i.test(t))return false;if(/네|예|응|있|해요|yes|o/i.test(t))return true;return null}
};
if(typeof module!=='undefined')module.exports=P;else root.Parse=P;})(this);
