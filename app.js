const $=id=>document.getElementById(id),W=Engine.won;let D,input,results={},months=24;
fetch('data.json').then(r=>r.json()).then(d=>{D=d;$('rate').value=d.installmentRate;
 $('model').innerHTML=Object.keys(d.models).map(m=>`<option>${m}</option>`).join('');
 const e=new Date();e.setMonth(e.getMonth()+4);$('end').value=e.toISOString().slice(0,10);});
$('f').onsubmit=ev=>{ev.preventDefault();
 input={cur:$('cur').value,carrier:$('carrier').value,curPlan:+$('curPlan').value,contractEnd:$('end').value,model:$('model').value,dataGB:+$('gb').value,family:$('family').value==='1',rate:+$('rate').value};
 results={24:Engine.compare(input,D,24),36:Engine.compare(input,D,36)};
 ['res','chatC','leadC'].forEach(i=>$(i).hidden=false);render();$('chat').innerHTML='';bot(summary());$('res').scrollIntoView({behavior:'smooth'});};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{months=+b.dataset.m;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));render();});
function render(){const r=results[months],rows=[['단말기 가격','device'],['지원금','subsidy'],['할부 이자','interest'],['요금 합계','plan'],['부가서비스','addon'],['가족결합 할인','family'],['위약금','penalty'],['총비용','total']];
 $('tbl').innerHTML=`<table><tr><th>항목</th>${r.options.map(o=>`<th${o===r.best?' class="best"':''}>${o.name}</th>`).join('')}</tr>`+
 rows.map(([k,f])=>`<tr${f==='total'?' class="best"':''}><td>${k}</td>${r.options.map(o=>`<td>${W(o[f])}</td>`).join('')}</tr>`).join('')+'</table>'+
 r.options.map(o=>`<p class="small">· ${o.name}: ${o.note}</p>`).join('');
 const s=r.options[1];$('rec').innerHTML=`👉 <b>${months}개월 기준 추천: ${r.best.name}</b> — 다음 방법(${s.name})보다 약 ${W(s.total-r.best.total)} 저렴해요. <span class="small">(예시 데이터 기준)</span>`;}
function bot(t){$('chat').insertAdjacentHTML('beforeend',`<div class="msg bot">${t}</div>`);$('chat').scrollTop=1e9}
function summary(){const r=results[months],b=r.best;return `${input.cur}에서 ${input.model}로 바꾸는 경우를 ${months}개월 총비용으로 비교했어요. 예시 데이터 기준으로 <b>${b.name}</b>이(가) 총 ${W(b.total)}으로 가장 저렴해요. ${r.remaining?`약정이 ${r.remaining}개월 남아서 통신사를 옮기면 위약금이 생길 수 있어요.`:'약정이 끝나서 위약금 걱정은 없어요.'} 궁금한 걸 물어보세요!`;}
function answer(q){const r=results[months],b=r.best,f=n=>r.options.find(o=>o.name===n);
 if(/위약|해지/.test(q))return r.remaining?`약정이 ${r.remaining}개월 남았어요. 예시 기준 번호이동·알뜰폰 이동 시 위약금 약 ${W(f('번호이동').penalty)}이 총비용에 들어가 있어요. ${r.remaining<=3?'몇 달만 기다리면 위약금 없이 바꿀 수 있어요.':''}`:'약정이 끝나서 위약금이 없어요.';
 if(/이자|할부/.test(q))return `할부 이자는 연 ${input.rate}% 기준이에요. 지원금을 뺀 금액을 ${months}개월로 나눠 내면 이자가 붙어요. 현금 일시불이면 이자를 아낄 수 있어요.`;
 if(/지원금|보조/.test(q))return `지원금은 단말기 값을 깎아주지만, 대신 비싼 필수 요금제를 몇 달 유지해야 해요. 그래서 지원금이 커도 총비용은 더 비쌀 수 있어요.`;
 if(/알뜰|자급/.test(q)){const o=f('자급제+알뜰폰');return `자급제+알뜰폰은 지원금이 없지만 요금이 싸서 ${months}개월 요금 합계가 ${W(o.plan)}이에요. 데이터를 많이 안 쓰면 보통 유리해요.`;}
 if(/가족|결합/.test(q))return input.family?'가족결합 할인은 같은 통신사에 남는 기기변경에만 반영했어요. 번호이동하면 할인이 사라질 수 있어요.':'가족결합을 안 쓰신다고 해서 할인은 넣지 않았어요.';
 if(/언제|시점|기다/.test(q))return r.remaining?`약정 만료(${input.contractEnd})까지 ${r.remaining}개월이에요. 만료 직후에 바꾸면 위약금 없이 선택지가 가장 넓어요. 아래 '교체 시점 알림'을 신청해 보세요.`:'지금 바꿔도 위약금이 없어 좋은 시점이에요.';
 if(/36|24|기간/.test(q)){const a=results[24].best,c=results[36].best;return `24개월 기준 추천은 ${a.name}(${W(a.total)}), 36개월 기준 추천은 ${c.name}(${W(c.total)})이에요. 오래 쓸수록 월 요금 차이가 더 커져요.`;}
 if(/견적|판매점|개통/.test(q))return '아래 "판매점 견적 요청"에 연락처를 남기면 제휴 판매점의 실제 조건을 받아볼 수 있어요(MVP에서는 저장만 돼요).';
 if(/왜|이유|추천/.test(q)){const s=r.options[1];return `${b.name}이(가) ${s.name}보다 싸요. 차이는 주로 ${Math.abs(b.plan-s.plan)>Math.abs(b.device+b.subsidy-s.device-s.subsidy)?'월 요금':'단말기 실구매가'}에서 나와요. 요금 합계 ${W(b.plan)} vs ${W(s.plan)}, 단말 실구매가 ${W(b.device+b.subsidy)} vs ${W(s.device+s.subsidy)}.`;}
 return '위약금, 할부 이자, 지원금, 알뜰폰, 가족결합, 교체 시점, 견적 요청 중에서 물어봐 주세요. (규칙 기반 상담이라 이 주제들만 답할 수 있어요)';}
$('send').onclick=()=>{const q=$('q').value.trim();if(!q)return;$('chat').insertAdjacentHTML('beforeend',`<div class="msg me"></div>`);$('chat').lastChild.textContent=q;$('q').value='';bot(answer(q));};
$('q').onkeydown=e=>{if(e.key==='Enter')$('send').click()};
const get=k=>JSON.parse(localStorage.getItem(k)||'[]');
$('leadBtn').onclick=()=>{if(!$('ln').value||!$('lp').value)return alert('이름과 연락처를 입력해 주세요');if(!$('lc').checked)return alert('개인정보 동의가 필요해요');
 const r=results[months],l=get('pm_leads');l.push({createdAt:new Date().toISOString(),name:$('ln').value,phone:$('lp').value,area:$('la').value,memo:$('lm').value,currentPhone:input.cur,carrier:input.carrier,contractEnd:input.contractEnd,model:input.model,dataGB:input.dataGB,family:input.family?'Y':'N',recommended:r.best.name,estTotal:r.best.total,months,status:'신규'});
 localStorage.setItem('pm_leads',JSON.stringify(l));$('leadOk').textContent='✅ 견적 요청이 저장됐어요. (MVP: 이 브라우저에만 저장)';};
$('alertBtn').onclick=()=>{if(!$('ac').value||!$('aok').checked)return alert('연락처와 동의가 필요해요');const a=get('pm_alerts');
 a.push({createdAt:new Date().toISOString(),contact:$('ac').value,contractEnd:$('end').value,carrier:$('carrier').value});localStorage.setItem('pm_alerts',JSON.stringify(a));
 $('alertOk').textContent=`✅ 알림 신청 완료! 약정 만료일(${$('end').value||'미입력'}) 전에 알려드릴게요. (MVP: 로컬 저장)`;};
