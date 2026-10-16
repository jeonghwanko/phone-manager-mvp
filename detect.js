const $=id=>document.getElementById(id),log=$('log'),chips=$('chips'),W=n=>Math.round(n).toLocaleString('ko-KR')+'원';
let R=null,history=[];const LLM=JSON.parse(localStorage.getItem('pm_llm')||'null');$('mode').textContent=LLM&&LLM.endpoint?'· AI 연결됨':'· 규칙 기반';
const SAMPLES={'😇 공짜폰이라는데?':'갤럭시 S26 출고가 125만원\n할부원금 0원\n요금제 109,000원 6개월 유지, 이후 요금제 55,000원\n부가 2개 월 9,900원 3개월\n카드 할인 월 1.5만원 (전월 실적 30만원)',
 '💸 현금완납 특가':'아이폰 17 현금완납 45만원\n요금제 월 9만원 6개월 유지, 이후 요금제 4만원\n부가서비스 3개 월 8,800원 4개월\n페이백 10만원',
 '📄 36개월 할부':'갤럭시 Z 플립7 출고가 148만원\n할부원금 98만원 36개월 할부, 이자 5.9%\n요금제 월 8만9천원 24개월 유지, 평소 요금 6만원\n부가 1개 월 5,500원 2개월'};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function scroll(){log.scrollTop=1e9}
function me(t){const d=document.createElement('div');d.className='b me';d.textContent=t;d.style.whiteSpace='pre-wrap';log.append(d);scroll()}
function typing(){const t=document.createElement('div');t.className='b bot';t.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';log.append(t);scroll();return t}
function bot(h,cls=''){return new Promise(r=>{const t=typing();setTimeout(()=>{t.className='b bot '+cls;t.innerHTML=h;scroll();r(t)},Math.min(1100,300+h.replace(/<[^>]+>/g,'').length*6))})}
function setChips(l){chips.innerHTML='';l.forEach(([x,f])=>{const b=document.createElement('button');b.type='button';b.textContent=x;b.onclick=f;chips.append(b)})}
function startChips(){setChips(Object.keys(SAMPLES).map(k=>[k,()=>analyze(SAMPLES[k])]))}
function looksLikeQuote(t){return /(할부|요금제|출고가|완납|부가|페이백)/.test(t)&&/\d/.test(t)&&(t.length>25||/\n/.test(t))}
async function analyze(t){me(t);const q=Quote.parse(t);
 if(q.plan==null&&q.principal==null&&q.cash==null&&q.device==null)return bot('견적서에서 요금제·할부원금·현금완납 금액을 못 찾았어요 😢 "할부원금 0원, 요금제 109,000원 6개월 유지"처럼 붙여넣어 주세요.');
 R={q,r:Quote.calc(q)};const r=R.r;
 const rows=[['견적서가 말하는 금액',r.headline],['24개월 실제 총비용',r.total],['└ 기기 값(24개월분)',r.devicePaid],['└ 할부 이자',r.interest],['└ 통신요금',r.comm],['└ 부가서비스',r.addon],['└ 페이백',-r.cashback],['평소 요금으로 24개월',r.base*24]];
 await bot(`<b>견적서 판독 결과</b><table>${rows.map(([k,v])=>`<tr><td>${k}</td><td>${W(v)}</td></tr>`).join('')}<tr class="best"><td>숨은 비용</td><td>${W(r.hidden)}</td></tr></table>
 ${r.ref.length?`<p class="small">견적서에 없어서 쓴 <b>예시 기준값</b>: ${r.ref.join(', ')}</p>`:''}<p class="small">숨은 비용 = 실제 총비용 − 견적서 금액 − 평소 요금×24개월</p>`,'card');
 await bot(`<b>🚨 발견한 함정 ${r.traps.length}개</b>${r.traps.map((x,i)=>`<p>${i+1}. <b>${x.t}</b><br>${esc(x.msg)}</p>`).join('')||'<p>뚜렷한 함정이 안 보여요 👍</p>'}`,'card');
 const c=await bot(`<div style="text-align:center"><div class="small">호갱 지수</div><div style="font-size:48px;font-weight:800">${r.score}</div><div style="font-size:20px;font-weight:700">${r.title}</div><p>숨은 비용 <b>${W(r.hidden)}</b></p>
 <canvas width="1080" height="1080" style="width:100%;border-radius:12px"></canvas><button class="dl" type="button">이미지 저장</button><button class="sh" type="button" style="background:#fee500;color:#000">공유하기</button></div>`,'card');
 draw(c.querySelector('canvas'));c.querySelector('.dl').onclick=()=>{const a=document.createElement('a');a.href=c.querySelector('canvas').toDataURL('image/png');a.download='hogang.png';a.click()};c.querySelector('.sh').onclick=()=>share(c.querySelector('canvas'));
 await bot('궁금한 거 물어보세요. 예: "부가서비스 언제 해지해?", "현금완납이 나아?"');
 setChips([['공유하기',()=>share(c.querySelector('canvas'))],['어떻게 깎아요?',()=>ask('어떻게 깎아요?')],['부가 언제 해지?',()=>ask('부가서비스 언제 해지해?')],['다른 견적서',()=>{R=null;bot('새 견적서를 붙여넣거나 📷 사진을 올려주세요.');startChips()}]])}
function draw(cv){const x=cv.getContext('2d'),r=R.r;x.fillStyle='#ffe14d';x.fillRect(0,0,1080,1080);x.fillStyle='#111';x.textAlign='center';
 x.font='bold 54px sans-serif';x.fillText('📱 휴대폰 견적서 호갱 판독기',540,130);x.font='bold 64px sans-serif';x.fillText('호갱 지수',540,300);
 x.font='bold 260px sans-serif';x.fillText(r.score,540,560);x.font='bold 76px sans-serif';x.fillText(r.title,540,700);
 x.font='48px sans-serif';x.fillText('숨은 비용 '+W(r.hidden),540,800);x.font='36px sans-serif';x.fillText('함정 '+r.traps.length+'개: '+r.traps.map(t=>t.t).slice(0,3).join(' · '),540,880);
 x.font='32px sans-serif';x.fillStyle='#444';x.fillText('너도 판독해봐 → jeonghwanko.github.io/phone-manager-mvp',540,1010)}
async function share(cv){const text=`내 휴대폰 견적서 호갱 지수 ${R.r.score}점 ${R.r.title} (숨은 비용 ${W(R.r.hidden)}) 너도 판독해봐 👉 ${location.href.split('#')[0]}`;
 try{const blob=await new Promise(r=>cv.toBlob(r,'image/png')),f=new File([blob],'hogang.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[f]}))return await navigator.share({files:[f],text});if(navigator.share)return await navigator.share({text,url:location.href})}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text);bot('📋 공유 문구를 복사했어요! 카톡에 붙여넣으세요.')}catch(e){bot('공유가 안 돼요. 이미지 저장 버튼을 써 주세요.')}}
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
 const j=await res.json(),a=j.choices?.[0]?.message?.content||j.reply||j.output_text;if(!a)throw 0;history.push({role:'assistant',content:a});t.textContent=a;scroll();return}catch(e){t.remove()}}
 bot(answer(q))}
$('bar').onsubmit=e=>{e.preventDefault();const t=$('q').value.trim();$('q').value='';if(!t)return;if(looksLikeQuote(t)||!R)return analyze(t);ask(t)};
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;e.target.value='';me('📷 견적서 사진');const t=typing();
 try{if(!window.Tesseract)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=ok;s.onerror=no;document.head.append(s)});
  t.innerHTML='글자 읽는 중… (처음엔 10~30초 걸려요)';const {data}=await Tesseract.recognize(f,'kor+eng');t.remove();const txt=data.text.trim();
  if(!txt)throw 0;await bot('사진에서 읽은 내용이에요. 틀린 숫자는 고쳐서 보내주세요 👇');$('q').value=txt;$('q').rows=6;$('q').focus()}
 catch(err){t.remove();bot('사진에서 글자를 못 읽었어요 😢 견적서 내용을 직접 붙여넣어 주세요.')}};
bot('견적서 받으셨어요? 🕵️ 대리점 견적서를 <b>붙여넣거나 📷 사진</b>으로 올려주세요. 24개월 실제 총비용, 숨은 비용, 함정, <b>호갱 지수</b>를 판독해 드려요.<br><span class="small">아래 예시 견적서를 눌러 바로 해볼 수도 있어요.</span>').then(startChips);
