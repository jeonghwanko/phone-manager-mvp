(function(){const C=window.CONFIG||{},issues=C.REPO+'/issues';
window.contactHTML=()=>C.CONTACT_EMAIL?`<a href="mailto:${C.CONTACT_EMAIL}">${C.CONTACT_EMAIL}</a>`:`<a href="${issues}" target="_blank" rel="noopener">GitHub 이슈</a>`;
window.operatorName=()=>C.OPERATOR_NAME||'호갱 판독기 운영자(개인)';
const B=location.pathname.startsWith('/phone-manager-mvp/')?'/phone-manager-mvp/':'';window.footerHTML=()=>`<nav class="foot"><a href="${B}terms.html">약관</a> · <a href="${B}privacy.html">개인정보처리방침</a> · <a href="${C.CONTACT_EMAIL?'mailto:'+C.CONTACT_EMAIL:issues}" ${C.CONTACT_EMAIL?'':'target="_blank" rel="noopener"'}>문의</a></nav>`;
document.querySelectorAll('[data-footer]').forEach(e=>e.innerHTML=footerHTML());
document.querySelectorAll('[data-contact]').forEach(e=>e.innerHTML=contactHTML());
document.querySelectorAll('[data-operator]').forEach(e=>e.textContent=operatorName());
document.querySelectorAll('[data-retention]').forEach(e=>e.textContent=(C.RETENTION_MONTHS||6)+'개월');
window.track=(name)=>{try{window.gtag&&gtag('event',name)}catch(e){}};// 이벤트 이름만, 개인정보·견적 내용은 보내지 않음
function loadGA(){if(window.gtag)return;const s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id='+C.GA_ID;document.head.append(s);
 window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());
 gtag('config',C.GA_ID,{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false})}
if(C.GA_ID){const k='pm_analytics';const v=localStorage.getItem(k);if(v==='y')loadGA();else if(v!=='n'){const b=document.createElement('div');b.className='cookie';
 b.innerHTML='방문 통계용 쿠키를 써도 될까요? <a href="privacy.html#analytics">자세히</a><span><button data-v="n">거부</button><button data-v="y">허용</button></span>';
 b.onclick=e=>{const x=e.target.dataset.v;if(!x)return;localStorage.setItem(k,x);b.remove();if(x==='y')loadGA()};document.body.append(b)}}})();
localStorage.removeItem('pm_leads');localStorage.removeItem('pm_alerts');
