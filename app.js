const $=id=>document.getElementById(id),W=Engine.won,log=$('log'),chips=$('chips');
let D,A={},step=0,editing=false,res={},months=24,history=[];
const LLM=JSON.parse(localStorage.getItem('pm_llm')||'null');$('mode').textContent=LLM&&LLM.endpoint?'· AI 연결됨':'· 규칙 기반 상담';
const Q=[
 {k:'cur',q:'지금 쓰고 계신 휴대폰이 뭐예요?',chips:['갤럭시 S24','아이폰 15','갤럭시 S22'],p:t=>t.trim()||null},
 {k:'carrier',q:'통신사는 어디세요?',chips:['SKT','KT','LGU+','알뜰폰'],p:t=>Parse.carrier(t),err:'SKT, KT, LGU+, 알뜰폰 중에 골라주세요.'},
 {k:'curPlan',q:'지금 한 달 요금은 얼마쯤 내세요?',chips:['5만원','8만원','10만원'],p:t=>Parse.won(t),err:'"8만원"처럼 알려주세요.',show:v=>W(v)},
 {k:'contractEnd',q:'약정은 언제 끝나요?',chips:['이미 끝났어요','3개월 후','내년 3월'],p:t=>Parse.date(t),err:'"내년 3월", "6개월 후", "2027-03-01"처럼 알려주세요.'},
 {k:'model',q:'어떤 기종으로 바꾸고 싶으세요?',chips:()=>Object.keys(D.models),p:t=>Parse.model(t,D.models),err:()=>'지금은 '+Object.keys(D.models).join(', ')+' 중에서 비교할 수 있어요.'},
 {k:'dataGB',q:'데이터는 한 달에 얼마나 쓰세요?',chips:['5GB','20GB','무제한급'],p:t=>Parse.gb(t),err:'"20GB"처럼 알려주세요.',show:v=>v+'GB'},
 {k:'family',q:'가족결합 할인 받고 계세요?',chips:['네','아니요'],p:t=>Parse.yesno(t),err:'네/아니요로 알려주세요.',show:v=>v?'예':'아니요'}];
function scroll(){log.scrollTop=1e9}
function me(t,i){const d=document.createElement('div');d.className='b me';d.textContent=t;if(i!=null){d.title='눌러서 수정';d.onclick=()=>edit(i)}log.append(d);scroll()}
function bot(html,cls=''){return new Promise(r=>{const t=document.createElement('div');t.className='b bot';t.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';log.append(t);scroll();
 setTimeout(()=>{t.className='b bot '+cls;t.innerHTML=html;scroll();r(t)},Math.min(1200,350+html.replace(/<[^>]+>/g,'').length*8))})}
function setChips(list){chips.innerHTML='';list.forEach(([l,f])=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=f;chips.append(b)})}
function ask(){const s=Q[step],c=typeof s.chips==='function'?s.chips():s.chips;
 bot(`${s.q} <span class="small">(${step+1}/${Q.length})</span>`).then(()=>setChips([...c.map(x=>[x,()=>input(x)]),...(step>0?[['← 이전',back]]:[])]))}
function back(){if(step>0){step--;me('← 이전 질문');ask()}}
function edit(i){editing=true;step=i;bot(`"${Q[i].q}" 다시 알려주세요.`).then(()=>{const s=Q[i],c=typeof s.chips==='function'?s.chips():s.chips;setChips(c.map(x=>[x,()=>input(x)]))})}
function input(t){t=t.trim();if(!t)return;
 if(step<Q.length){if(/^(뒤로|이전)/.test(t)){me(t);return back()}
  const s=Q[step],v=s.p(t);me(t,v==null?null:step);if(v==null){const e=typeof s.err==='function'?s.err():s.err;return bot(e)}
  A[s.k]=v;if(editing){editing=false;const nx=Q.findIndex(x=>A[x.k]==null);if(nx<0){step=Q.length;return result()}step=nx;return ask()}step++;return step<Q.length?ask():result()}
 me(t);followUp(t)}
function compute(){const inp={...A,rate:D.installmentRate};res={24:Engine.compare(inp,D,24),36:Engine.compare(inp,D,36)}}
function card(){const r=res[months],rows=[['단말기','device'],['지원금','subsidy'],['할부이자','interest'],['요금','plan'],['부가서비스','addon'],['가족결합','family'],['위약금','penalty'],['총비용','total']],s=r.options[1];
 return `<b>${months}개월 총비용 비교</b> <span class="small">예시 데이터 (실제 조건 아님)</span><table><tr><th></th>${r.options.map(o=>`<th${o===r.best?' class="best"':''}>${o.name}</th>`).join('')}</tr>${rows.map(([k,f])=>`<tr${f==='total'?' class="best"':''}><td>${k}</td>${r.options.map(o=>`<td>${W(o[f])}</td>`).join('')}</tr>`).join('')}</table>
 <p>👉 추천: <b>${r.best.name}</b> · ${s.name}보다 약 <b>${W(s.total-r.best.total)}</b> 절약</p>${r.options.map(o=>`<div class="small">· ${o.name}: ${o.note}</div>`).join('')}`}
function mainChips(){setChips([[months===24?'36개월로 보기':'24개월로 보기',()=>{months=months===24?36:24;me(months+'개월로 보여줘');bot(card(),'card')}],
 ['왜 이게 싸요?',()=>input('왜 이게 제일 싸요?')],['위약금은?',()=>input('위약금은?')], ['답변 수정',()=>setChips(Q.map((q,i)=>[q.k==='cur'?'현재 폰':q.q.slice(0,8)+'…',()=>edit(i)]))],['처음부터',()=>{A={};step=0;me('처음부터');ask()}]])}
async function result(){compute();const r=res[months];await bot(`정리해볼게요! ${A.cur} → ${A.model}, ${A.carrier}, 월 ${W(A.curPlan)}, 데이터 ${A.dataGB}GB, 가족결합 ${A.family?'예':'아니요'}. <span class="small">(내 말풍선을 누르면 수정돼요)</span>`);
 await bot(card(),'card');await bot(rule(''));mainChips()}
function rule(q){return answer(q)}
function answer(q){const r=res[months],b=r.best,f=n=>r.options.find(o=>o.name===n);
 if(!q)return `예시 데이터 기준 <b>${b.name}</b>이(가) ${months}개월 총 ${W(b.total)}으로 가장 저렴해요. ${r.remaining?`약정이 ${r.remaining}개월 남아 통신사를 옮기면 위약금이 생길 수 있어요.`:'약정이 끝나서 위약금 걱정은 없어요.'} 궁금한 걸 물어보세요!`;
 if(/위약|해지/.test(q))return r.remaining?`약정이 ${r.remaining}개월 남았어요. 예시 기준 번호이동·알뜰폰 이동 시 위약금 약 ${W(f('번호이동').penalty)}이 총비용에 들어가 있어요.${r.remaining<=3?' 몇 달만 기다리면 위약금 없이 바꿀 수 있어요.':''}`:'약정이 끝나서 위약금이 없어요.';
 if(/이자|할부/.test(q))return `할부 이자는 연 ${D.installmentRate}% 기준이에요. 지원금을 뺀 금액을 ${months}개월로 나눠 내면 이자가 붙어요. 일시불이면 아낄 수 있어요.`;
 if(/지원금|보조/.test(q))return '지원금은 단말기 값을 깎아주지만 비싼 필수 요금제를 몇 달 유지해야 해요. 그래서 지원금이 커도 총비용은 더 비쌀 수 있어요.';
 if(/알뜰|자급/.test(q)){const o=f('자급제+알뜰폰');return `자급제+알뜰폰은 지원금이 없지만 요금이 싸서 ${months}개월 요금 합계가 ${W(o.plan)}이에요. 데이터를 많이 안 쓰면 보통 유리해요.`}
 if(/가족|결합/.test(q))return A.family?'가족결합 할인은 같은 통신사에 남는 기기변경에만 반영했어요. 번호이동하면 할인이 사라질 수 있어요.':'가족결합을 안 쓰신다고 해서 할인은 넣지 않았어요.';
 if(/언제|시점|기다/.test(q))return r.remaining?`약정 만료(${A.contractEnd})까지 ${r.remaining}개월이에요. 만료 직후에 바꾸면 선택지가 가장 넓어요. '교체 알림 받기'를 눌러보세요.`:'지금 바꿔도 위약금이 없어 좋은 시점이에요.';
 if(/36|24|기간/.test(q)){const a=res[24].best,c=res[36].best;return `24개월 추천은 ${a.name}(${W(a.total)}), 36개월 추천은 ${c.name}(${W(c.total)})이에요.`}
 if(/견적|판매점|개통/.test(q))return '견적 요청은 메인 호갱 판독기에서 할 수 있어요.';
 if(/왜|이유|추천|싸/.test(q)){const s=r.options[1];return `${b.name}이(가) ${s.name}보다 싸요. 요금 합계 ${W(b.plan)} vs ${W(s.plan)}, 단말 실구매가 ${W(b.device+b.subsidy)} vs ${W(s.device+s.subsidy)}.`}
 return '위약금, 할부 이자, 지원금, 알뜰폰, 가족결합, 교체 시점, 견적 요청에 대해 물어봐 주세요.'}
async function followUp(q){
 if(LLM&&LLM.endpoint){const t=document.createElement('div');t.className='b bot';t.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';log.append(t);scroll();
  try{history.push({role:'user',content:q});const ctx={answers:A,months,result:res[months],notice:'모든 숫자는 예시 데이터 (실제 조건 아님)'};
   const r=await fetch(LLM.endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(LLM.key?{Authorization:'Bearer '+LLM.key}:{})},
    body:JSON.stringify({model:LLM.model||'gpt-4o-mini',messages:[{role:'system',content:'너는 휴대폰 교체 상담원 폰매니저 AI다. 아래 계산 결과만 근거로 쉬운 한국어로 짧게 답하라. 숫자는 예시 데이터임을 밝히고 지어내지 마라.\n'+JSON.stringify(ctx)},...history.slice(-8)]})});
   const j=await r.json(),a=j.choices?.[0]?.message?.content||j.reply||j.output_text;if(!a)throw 0;history.push({role:'assistant',content:a});t.textContent=a;scroll();return}
  catch(e){t.remove()}}
 await bot(answer(q))}
function formCard(html,onSave){bot(html,'card').then(el=>{el.querySelector('.save').onclick=()=>{const m=onSave(el);if(m)el.querySelector('.okmsg').textContent=m}})}
function leadForm(){bot('견적 요청은 메인 호갱 판독기에서 할 수 있어요.')}
function alertForm(){bot('알림 신청은 지금 받지 않아요.')}
$('bar').onsubmit=e=>{e.preventDefault();const t=$('q').value;$('q').value='';input(t)};
fetch('data.json').then(r=>r.json()).then(async d=>{D=d;await bot('안녕하세요! 휴대폰 교체를 도와드리는 <b>폰매니저 AI</b>예요 🤖 몇 가지만 여쭤보고 가장 유리한 교체 방법을 찾아드릴게요.');ask()});
