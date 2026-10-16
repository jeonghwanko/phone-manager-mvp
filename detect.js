const $=id=>document.getElementById(id),log=$('log'),chips=$('chips'),W=n=>Math.round(n).toLocaleString('ko-KR')+'원';
let R=null,history=[];const LLM=JSON.parse(localStorage.getItem('pm_llm')||'null');$('mode').textContent=LLM&&LLM.endpoint?'AI 연결됨':'';if(!(LLM&&LLM.endpoint))$('mode').remove();
const SAMPLES={'😇 공짜폰이라는데?':'갤럭시 S26 출고가 125만원\n할부원금 0원\n요금제 109,000원 6개월 유지, 이후 요금제 55,000원\n부가 2개 월 9,900원 3개월\n카드 할인 월 1.5만원 (전월 실적 30만원)',
 '💸 현금완납 특가':'아이폰 17 현금완납 45만원\n요금제 월 9만원 6개월 유지, 이후 요금제 4만원\n부가서비스 3개 월 8,800원 4개월\n페이백 10만원',
 '📄 36개월 할부':'갤럭시 Z 플립7 출고가 148만원\n할부원금 98만원 36개월 할부, 이자 5.9%\n요금제 월 8만9천원 24개월 유지, 평소 요금 6만원\n부가 1개 월 5,500원 2개월'};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let skip=false;const man=n=>{n=Math.round(n);return Math.abs(n)<1e4?W(n):(Math.round(n/1e3)/10).toLocaleString('ko-KR')+'만원'};
function scroll(){log.scrollTo({top:log.scrollHeight,behavior:window.FAST||matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function grp(who){const l=log.lastElementChild;if(l&&l.classList.contains('grp')&&l.classList.contains(who))return l.querySelector('.stack');
 const g=document.createElement('div');g.className='grp '+who;g.innerHTML=who==='bot'?'<div class="av" aria-hidden="true">'+svg('scan',18)+'</div><div class="stack"><div class="name">판독기</div></div>':'<div class="stack"></div>';log.append(g);return g.querySelector('.stack')}
function me(t){const d=document.createElement('div');d.className='b me';d.textContent=t.length>220?t.slice(0,220)+'…':t;grp('me').append(d);scroll()}
function typing(){const t=document.createElement('div');t.className='b bot';t.setAttribute('aria-label','입력 중');t.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';grp('bot').append(t);scroll();return t}
const wait=ms=>new Promise(r=>{if(skip)return r();const id=setInterval(()=>{if(skip){clearInterval(id);r()}},50);setTimeout(()=>{clearInterval(id);r()},ms)});
async function bot(h,cls=''){const t=typing();await wait(Math.min(900,500+h.replace(/<[^>]+>/g,'').length*5));t.className='b bot '+cls;t.innerHTML=h;scroll();return t}
async function say(list){skip=!!window.FAST;chips.innerHTML='';const sk=document.createElement('button');sk.type='button';sk.className='skip';sk.textContent='⏩ 전부 보기';sk.onclick=()=>{skip=true;sk.remove()};chips.append(sk);
 let last;for(const x of list)last=await(Array.isArray(x)?bot(x[0],x[1]):bot(x));sk.remove();skip=!!window.FAST;return last}
function setChips(l){chips.innerHTML='';l.forEach(([x,f])=>{const b=document.createElement('button');b.type='button';b.textContent=x;b.onclick=f;chips.append(b)})}
function startChips(){setChips([])}
function looksLikeQuote(t){return /(할부|요금제|출고가|완납|부가|페이백)/.test(t)&&/\d/.test(t)&&(t.length>25||/\n/.test(t))}
const P={signal:'<path d="M5 18v-3M10 18v-6M15 18V9M20 18V5"/>',eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',puzzle:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M16.5 13.5v6M13.5 16.5h6"/>',
 percent:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',hand:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
 scan:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 12h8"/>',cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 send:'<path d="M12 19V5M6 11l6-6 6 6"/>',gift:'<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0"/>',coin:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>'};
const svg=(n,z=20)=>`<svg width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const ICON={'고가 요금제 유지':'signal','할부원금 0원 착시':'eye','부가서비스 끼워팔기':'puzzle','할부 이자':'percent','카드 할인 조건':'card','페이백 약속':'hand'};
function trapAmt(x,r,q){if(x.won)return {v:x.won,l:'더 내는 돈'};if(x.t.includes('0원'))return {v:r.planExtra,l:'요금제로 내는 돈'};if(x.t.includes('카드'))return {v:q.cardSpend||0,l:'매달 써야 할 카드 실적'};if(x.t.includes('페이백'))return {v:r.cashback,l:'못 받을 수도 있는 돈'};return {v:0,l:''}}
async function analyze(t){me(t);const q=Quote.parse(t);
 if(q.plan==null&&q.principal==null&&q.cash==null&&q.device==null)return say([['금액을 못 찾았어요.','err'],'예: 할부원금 0원, 요금제 109,000원 6개월 유지']).then(startChips);
 R={q,r:Quote.calc(q)};const r=R.r,exp=r.headline+r.base*24,mx=Math.max(r.total,exp,1),pc=v=>Math.max(0,v/mx*100).toFixed(1);
 const traps=r.traps.map(x=>({...x,a:trapAmt(x,r,q)})).sort((x,y)=>y.a.v-x.a.v);
 const rows=[['견적서 기기 금액(24개월분)',r.headline],['할부 이자',r.interest],['통신요금 24개월',r.comm],['부가서비스',r.addon],['페이백',-r.cashback],['실제 총액',r.total],['평소 요금×24개월',r.base*24]];
 const col=r.score>=60?'var(--danger)':r.score>=30?'var(--warn)':'var(--good)',C=2*Math.PI*42,dash=(r.score/100*C).toFixed(1),lvl=r.score>=60?'hi':r.score>=30?'mid':'lo';
 const list=[[`<div class="verdict ${lvl}"><div class="vtxt"><div class="eyebrow">숨은 비용 (24개월)</div><div class="big num">${man(r.hidden)}</div><div class="vtitle">${r.title}</div></div>
  <div class="ring" role="img" aria-label="호갱 지수 ${r.score}점"><svg width="104" height="104" viewBox="0 0 104 104"><circle cx="52" cy="52" r="42" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="7"/><circle cx="52" cy="52" r="42" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${dash} ${C.toFixed(1)}"/></svg><div class="v"><b class="num">${r.score}</b><span>호갱 지수</span></div></div></div>`,'card hero-card'],
  [`<div class="ttl">예상 vs 실제</div>
  <div class="barrow"><div class="lab"><span>예상한 돈</span><b class="num">${man(exp)}</b></div><div class="track"><div class="fill" style="width:${pc(exp)}%"><div class="seg-a" style="flex:1"></div></div></div></div>
  <div class="barrow"><div class="lab"><span>실제로 낼 돈</span><b class="num">${man(r.total)}</b></div><div class="track"><div class="fill" style="width:${pc(r.total)}%"><div class="seg-b" style="flex:${Math.max(0,r.total-r.hidden)}"></div><div class="seg-x" style="flex:${r.hidden}"></div></div></div></div>
  ${r.ref.length?`<div class="tag">예시 기준값 포함</div>`:''}<details><summary>자세히</summary><table>${rows.map(([k,v])=>`<tr><td>${k}</td><td class="num">${W(v)}</td></tr>`).join('')}</table><p class="cap">견적서대로 생각한 돈 = 견적서 기기 금액 + 평소 요금×24개월. 숨은 비용 = 실제 총액 − 견적서 기기 금액 − 평소 요금×24개월.</p>${r.ref.length?`<p class="cap">견적서에 없어서 쓴 <b>예시 기준값</b>: ${r.ref.join(', ')}</p>`:''}</details>`,'card']];
 if(!traps.length)list.push('함정은 안 보여요.');
 if(traps.length)list.push([`<div class="ttl">함정 ${traps.length}개</div><ul class="traps">${traps.map(x=>`<li><details><summary><span class="ic">${svg(ICON[x.t]||'eye')}</span><span class="tm"><span class="t">${x.t}</span></span><span class="amt num">${x.a.v?man(x.a.v):'-'}</span></summary><p>${x.a.l}: <b>${W(x.a.v)}</b><br>${esc(x.msg)}</p></details></li>`).join('')}</ul>`,'card']);
 const act=[];if(q.addonCount)act.push(`${q.addonMonths}개월 뒤 <b>부가서비스 해지</b>`);
 if(r.planExtra)act.push(`${q.planMonths}개월 뒤 <b>요금제 낮추기</b>`);
 if(r.interest)act.push(`<b>현금완납</b> 가격 물어보기`);
 if(r.cashback)act.push(`<b>페이백</b> 계약서에 적기`);
 if(q.card)act.push(`<b>카드 할인</b> 빼고 다시 계산`);
 if(r.planExtra)act.push(`요금제 <b>유지 기간</b> 줄여달라기`);
 list.push([`<div class="ttl">이렇게 하세요</div><ol class="steps">${(act.length?act:['이대로 진행해도 괜찮아요.']).slice(0,3).map(x=>`<li><span>${x}</span></li>`).join('')}</ol>`,'card']);
 list.push([`<div class="share"><canvas width="1080" height="1080" aria-label="호갱 지수 공유 이미지"></canvas><div class="btns"><button class="btn dl" type="button">이미지 저장</button><button class="btn pri sh" type="button">공유하기</button></div></div>`,'card']);
 const c=await say(list);
 draw(c.querySelector('canvas'));c.querySelector('.dl').onclick=()=>{const a=document.createElement('a');a.href=c.querySelector('canvas').toDataURL('image/png');a.download='hogang.png';a.click()};c.querySelector('.sh').onclick=()=>share(c.querySelector('canvas'));
 await say(['더 궁금하면 물어보세요.']);
 setChips([['공유하기',()=>share(c.querySelector('canvas'))],['어떻게 깎아요?',()=>ask('어떻게 깎아요?')],['부가 언제 해지?',()=>ask('부가서비스 언제 해지해?')],['다른 견적서',()=>{R=null;say(['새 견적서를 올려주세요.']).then(startChips)}]])}
function draw(cv){const x=cv.getContext('2d'),r=R.r,F='"Pretendard Variable",Pretendard,"Apple SD Gothic Neo",sans-serif',col=r.score>=60?'#e8434d':r.score>=30?'#e8930c':'#10a05a';
 x.fillStyle='#f4f5f7';x.fillRect(0,0,1080,1080);x.fillStyle='#fff';x.beginPath();x.roundRect(64,64,952,952,56);x.fill();
 x.textAlign='left';x.fillStyle='#8b919a';x.font=`600 34px ${F}`;x.fillText('휴대폰 견적서 호갱 판독기',136,168);
 x.fillStyle='#8b919a';x.font=`500 38px ${F}`;x.fillText('24개월 숨은 비용',136,300);x.fillStyle='#16181d';x.font=`800 124px ${F}`;x.letterSpacing='-4px';x.fillText(man(r.hidden),128,430);x.letterSpacing='0px';
 x.fillStyle='#16181d';x.font=`700 50px ${F}`;x.fillText(r.title,136,520);
 const cx=540,cy=740;x.lineWidth=26;x.lineCap='round';x.strokeStyle='#eef0f3';x.beginPath();x.arc(cx,cy,120,0,Math.PI*2);x.stroke();x.strokeStyle=col;x.beginPath();x.arc(cx,cy,120,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.01,r.score/100));x.stroke();
 x.textAlign='center';x.fillStyle='#16181d';x.font=`800 96px ${F}`;x.fillText(r.score,cx,cy+28);x.fillStyle='#8b919a';x.font=`500 30px ${F}`;x.fillText('호갱 지수',cx,cy+80);
 x.font=`500 28px ${F}`;x.fillText('jeonghwanko.github.io/phone-manager-mvp',540,960)}
async function share(cv){const text=`내 휴대폰 견적서 호갱 지수 ${R.r.score}점 ${R.r.title} (숨은 비용 ${W(R.r.hidden)}) 너도 판독해봐 👉 ${location.href.split('#')[0]}`;
 try{const blob=await new Promise(r=>cv.toBlob(r,'image/png')),f=new File([blob],'hogang.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[f]}))return await navigator.share({files:[f],text});if(navigator.share)return await navigator.share({text,url:location.href})}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);say(['공유 문구를 복사했어요.'])}catch(e){say(['이미지 저장을 눌러주세요.'])}}
function answer(q){const r=R.r,f=k=>r.traps.find(t=>t.t.includes(k));
 if(/부가|해지/.test(q))return R.q.addonCount?`부가서비스 ${R.q.addonCount}개는 ${R.q.addonMonths}개월 유지 조건이에요. 개통일로부터 ${R.q.addonMonths}개월 + 하루 뒤에 통신사 앱이나 114로 해지하세요. 총 ${W(r.addon)}이에요.`:'견적서에 부가서비스 조건이 없어요.';
 if(/깎|협상|싸게|줄이/.test(q))return `① 고가 요금제 유지 기간을 줄여달라고 하기${r.planExtra?` (지금 차액 ${W(r.planExtra)})`:''} ② 부가서비스 빼달라고 하기${r.addon?` (${W(r.addon)})`:''} ③ 현금완납 가격을 물어보기${r.interest?` (이자 ${W(r.interest)} 절약)`:''} ④ 페이백은 계약서에 적어달라고 하기.`;
 if(/완납|현금|이자|할부/.test(q))return r.interest?`할부 이자만 24개월 ${W(r.interest)}예요. 현금완납 가격이 할부원금보다 이 금액 이상 싸지 않다면 할부와 큰 차이 없어요.`:'이 견적서엔 할부 이자가 없어요.';
 if(/카드/.test(q))return f('카드')?f('카드').msg:'견적서에 카드 조건이 없어요.';
 if(/페이백|캐시백/.test(q))return f('페이백')?f('페이백').msg:'견적서에 페이백이 없어요.';
 if(/요금제|0원|공짜/.test(q))return f('요금제')?f('요금제').msg:'요금제 유지 조건으로 생기는 추가 비용은 없어 보여요.';
 if(/점수|지수|호갱/.test(q))return `호갱 지수는 숨은 비용(7천원당 1점)과 함정 개수(개당 4점)로 매겨요. 지금 ${r.score}점이에요.`;
 return '부가서비스 해지, 깎는 법, 현금완납·이자, 카드 조건, 페이백, 요금제 유지에 대해 물어보세요.'}
async function ask(q){me(q);if(LLM&&LLM.endpoint){const t=typing();try{history.push({role:'user',content:q});
 const res=await fetch(LLM.endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(LLM.key?{Authorization:'Bearer '+LLM.key}:{})},body:JSON.stringify({model:LLM.model||'gpt-4o-mini',
  messages:[{role:'system',content:'너는 휴대폰 견적서 호갱 판독기 상담원이다. 아래 견적서와 계산 결과의 숫자만 근거로 쉬운 한국어로 짧게 답하라. 숫자를 지어내지 마라. 예시 기준값은 그렇다고 밝혀라.\n'+JSON.stringify({quote:R.q,result:R.r})},...history.slice(-8)]})});
 const j=await res.json(),a=j.choices?.[0]?.message?.content||j.reply||j.output_text;if(!a)throw 0;history.push({role:'assistant',content:a});t.remove();await say(a.split(/\n+|(?<=[.!?])\s+/).filter(Boolean).map(esc));return}catch(e){t.remove()}}
 const c=chips.innerHTML,saved=[...chips.children];await say(split(answer(q)));chips.innerHTML='';saved.forEach(x=>chips.append(x))}
function split(t){return t.replace(/(\d[\d,]*원)/g,'<b>$1</b>').split(/(?<=[.?!요다]\.?)\s+(?=[가-힣①②③④"])|(?=[②③④])/).map(x=>x.trim()).filter(Boolean)}
$('bar').onsubmit=e=>{e.preventDefault();const t=$('q').value.trim();$('q').value='';$('q').style.height='';if(!t)return;if(looksLikeQuote(t)||!R)return analyze(t);ask(t)};
$('q').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(160,e.target.scrollHeight)+'px'};
$('q').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!/\n/.test(e.target.value)&&e.target.value.length<40){e.preventDefault();$('bar').requestSubmit()}};
document.querySelector('label.ibtn').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click()}};
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;e.target.value='';me('📷 견적서 사진');const t=typing();t.innerHTML='OCR 엔진 불러오는 중…<div class="prog"><i></i></div>';
 try{if(!window.Tesseract)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=ok;s.onerror=no;document.head.append(s)});
  t.innerHTML='글자 읽는 중… <span class="num">0%</span><div class="prog"><i></i></div><div class="cap">처음엔 10~30초 걸려요</div>';const {data}=await Tesseract.recognize(f,'kor+eng',{logger:m=>{if(m.status==='recognizing text'){const p=Math.round(m.progress*100);t.querySelector('.num').textContent=p+'%';t.querySelector('.prog i').style.width=p+'%'}}});t.remove();const txt=data.text.trim();
  if(!txt)throw 0;await say(['읽은 내용이에요.','틀린 숫자만 고쳐 보내주세요.']);$('q').value=txt;$('q').dispatchEvent(new Event('input'));$('q').focus()}
 catch(err){t.remove();say([['사진을 못 읽었어요.','err'],'글자로 붙여넣어 주세요.'])}};
const SI=['eye','coin','cal'],DESC=['할부원금 0원 · 고가 요금제 6개월','현금완납 45만원 · 페이백 10만원','할부원금 98만원 · 이자 5.9%'];
(()=>{const h=document.createElement('section');h.className='hero';h.innerHTML=`<h2>견적서 속<br>숨은 비용 찾기</h2><p>견적서를 붙여넣거나 사진을 올리세요.</p><div class="samples" role="list"></div>`;
 Object.keys(SAMPLES).forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.className='sample';b.setAttribute('role','listitem');b.innerHTML=`<span class="ic">${svg(SI[i])}</span><span class="tm"><span class="s">${k.split(' ').slice(1).join(' ')}</span><span class="d">${DESC[i]}</span></span><span class="chev" aria-hidden="true">›</span>`;b.onclick=()=>analyze(SAMPLES[k]);h.querySelector('.samples').append(b)});
 log.append(h)})();
startChips();
if(location.hash==='#demo'){window.FAST=1;analyze(SAMPLES[Object.keys(SAMPLES)[0]])}
