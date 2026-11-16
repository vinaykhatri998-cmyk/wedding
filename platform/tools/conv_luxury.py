p='templates/luxury.html'; s=open(p,encoding='utf8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,n,a[:70]); s=s.replace(a,b)
def cut(start,end,new):
    global s
    i=s.index(start); j=s.index(end,i)+len(end); s=s[:i]+new+s[j:]
rep('<html lang="en">','<html lang="en" data-theme="{{theme}}">')
cut('<title>','<meta property="og:image" content="couple.jpg">','<title>{{groom.name}} &amp; {{bride.name}} · Wedding Invitation</title>\n<meta name="description" content="You are invited · {{dateLong}} · {{venueName}}">\n<meta property="og:title" content="{{groom.name}} &amp; {{bride.name}} · Wedding Invitation">\n<meta property="og:description" content="Tap to open your personal invitation">\n{{#ogImage}}<meta property="og:image" content="{{ogImage}}">{{/ogImage}}')
rep('*{box-sizing:border-box}',''':root[data-theme="emerald"]{--night:#0b1a15;--night-2:#11261f;--maroon:#0f4a3a;--maroon-2:#14614c;--ink:#12493a;--ink-soft:#4f7a6d}
:root[data-theme="navy"]{--night:#0b1024;--night-2:#131a38;--maroon:#1b2a5c;--maroon-2:#253a7c;--ink:#1b2a5c;--ink-soft:#56618a}
*{box-sizing:border-box}''')
rep('<div class="caps gold" style="margin-top:14px;font-size:10px">॥ श्री गणेशाय नमः ॥ &nbsp; ॥ जय झूलेलाल ॥</div>','<div class="caps gold" style="margin-top:14px;font-size:10px">{{blessing}}</div>')
rep('<div class="seal" id="seal"><span>S&amp;R</span></div>','<div class="seal" id="seal"><span>{{gi}}&amp;{{bi}}</span></div>')
rep('<p class="hint">Shivendra &amp; Roshni</p>','<p class="hint">{{groom.name}} &amp; {{bride.name}}</p>')
cut('<div class="hin rv">॥ श्री गणेशाय नमः ॥<br>','<div class="on rv">','''<div class="hin rv">{{blessing}}</div>
  <h2 class="respect rv" id="respect">Respected Family &amp; Friends</h2>
  <p class="lead rv">{{hostLine}}</p>
  <div class="name goldtext rv" style="font-size:48px">{{groom.name}}</div>
  <p class="par rv">{{#groom.parents}}Son of {{groom.parents}}{{/groom.parents}}{{#groom.grandparents}}<small>Grandson of {{groom.grandparents}}</small>{{/groom.grandparents}}</p>
  <div class="amp rv">&amp;</div>
  <div class="name goldtext rv" style="font-size:48px;margin-top:0">{{bride.name}}</div>
  <p class="par rv">{{#bride.parents}}Daughter of {{bride.parents}}{{/bride.parents}}{{#bride.grandparents}}<small>Granddaughter of {{bride.grandparents}}</small>{{/bride.grandparents}}</p>
  <div class="on rv">''')
rep('<b>Wednesday · 2nd December 2026</b>','<b>{{dateLong}}</b>')
rep('<div class="photo rv" id="photo"><img src="couple.jpg" alt="Shivendra and Roshni" loading="lazy"></div>\n  <p class="rv">Two hearts, two families, and one beautiful beginning. With the blessings of our elders, we are ready to begin our forever together, and we would love for you to be there.</p>',
 '{{#hasCouplePhoto}}<div class="photo rv" id="photo"><img src="{{couplePhoto}}" alt="{{groom.name}} and {{bride.name}}" loading="lazy"></div>{{/hasCouplePhoto}}\n  <p class="rv">{{#message}}{{message}}{{/message}}{{^message}}Two hearts, two families, and one beautiful beginning. With the blessings of our elders, we are ready to begin our forever together, and we would love for you to be there.{{/message}}</p>')
rep('<!-- ================= SCRATCH ================= -->','{{#hasDate}}<!-- SCRATCH -->')
rep('<div class="under"><div class="w">Wednesday</div><div class="d">2</div><div class="m">December 2026</div></div>','<div class="under"><div class="w">{{weekday}}</div><div class="d">{{dayNum}}</div><div class="m">{{month}} {{year}}</div></div>')
cut('<!-- ================= TIMELINE ================= -->','<div class="swipe rv">Swipe to see every ceremony →</div>\n</section>','''{{/hasDate}}{{#hasEvents}}<!-- TIMELINE -->
<section class="dark pad">
  <div class="caps gold rv">The celebrations unfold</div>
  <h2 class="big rv" style="font-size:52px;margin-top:12px">What to<br>expect</h2>
  <div class="tl-rail rv" id="rail"><div class="line"></div><div class="fill" id="fill"></div>
    <div class="stops">{{#events}}<div class="stop"><span>{{time}}</span><i></i></div>{{/events}}</div>
  </div>
  <div class="tl-cards rv" id="cards">
    {{#events}}<article class="tl-card"><div class="day">{{day}}</div><h3>{{name}}</h3><div class="t">{{time}}</div>{{#venue}}<p style="font-style:normal;color:var(--gold-hi);font-size:15px">{{venue}}</p>{{/venue}}</article>{{/events}}
  </div>
  <div class="swipe rv">Swipe to see every ceremony →</div>
</section>{{/hasEvents}}''')
cut('<!-- ================= WISH ================= -->','</form>\n</section>','''{{#showRsvp}}<section class="cream pad wish">
  <h2 class="h2 rv" style="font-size:46px">Send a Wish</h2>
  <p class="lead rv" style="margin-top:10px">Leave your wishes &amp; love for {{groom.name}} &amp; {{bride.name}} ✨</p>
  <form id="wishForm" class="rv">
    <label for="w-name">Your name<input id="w-name" type="text" autocomplete="name" placeholder="Your name" required></label>
    <label for="w-to">Will you join us?<select id="w-to"><option value="yes">Joyfully accept</option><option value="no">Regretfully decline</option></select></label>
    <label for="w-msg">Your wish<textarea id="w-msg" placeholder="Write your heartfelt wish for the couple…"></textarea></label>
    <button class="btn" type="submit" id="w-send">Send your wishes →</button>
    <a class="btn" id="w-open" hidden target="_blank" rel="noopener">Open WhatsApp to send</a>
    <p id="w-ok" hidden style="text-align:center;margin:0">Thank you! Your reply has been sent. ✨</p>
  </form>
</section>{{/showRsvp}}''')
cut('<div class="tiles rv">','</div>\n</section>','''<div class="tiles rv">
    {{#calUrl}}<a class="tile{{^hasPhone}} wide{{/hasPhone}}" target="_blank" rel="noopener" href="{{calUrl}}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg><b>Save the Date</b><span>Add to calendar</span></a>{{/calUrl}}
    {{#hasPhone}}<button class="tile{{^calUrl}} wide{{/calUrl}}" type="button" id="callBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><b>Contact</b><span>Call or WhatsApp</span></button>{{/hasPhone}}
    <button class="tile wide" type="button" id="venueBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg><b>Venue &amp; Directions</b><span>{{venueName}}</span></button>
  </div>
</section>''')
cut('<h3>Sindhu Bhawan</h3>','</div></dialog>','''<h3>{{venueName}}</h3><p>{{venueAddress}}</p>
  {{#mapUrl}}<a class="btn" target="_blank" rel="noopener" href="{{mapUrl}}">Open in Google Maps</a>{{/mapUrl}}
  {{#note}}<p style="margin:16px 0 0;font-size:15px">{{note}}</p>{{/note}}
</div></dialog>''')
cut('<h3>Khatri Family</h3>','</div></dialog>','''<h3>Contact</h3><p>{{phoneDisplay}}</p>
  <div style="display:grid;gap:10px">
    <a class="btn" href="tel:+{{phone}}">Call</a>
    <a class="btn" style="background:linear-gradient(180deg,#2f8a55,#1f6b40)" target="_blank" rel="noopener" href="https://wa.me/{{phone}}">WhatsApp</a>
  </div>
</div></dialog>''')
cut('<div class="sig goldtext">Shivendra &amp; Roshni</div>','</footer>','''<div class="sig goldtext">{{groom.name}} &amp; {{bride.name}}</div>
  <div class="caps" style="color:var(--muted)">We await your presence</div>
  {{#hasFamily}}<div class="fam">{{#family}}<div>{{#title}}<h4>{{title}}</h4>{{/title}}<p>{{names}}</p></div>{{/family}}</div>{{/hasFamily}}
</footer>''')
rep("var PHONE = '919713669838';\n  var WEDDING = new Date('2026-12-02T11:00:00+05:30').getTime();","var INV = {{{json}}}, PHONE = INV.phone, WEDDING = INV.ts;")
rep("try { guest = (new URLSearchParams","if (INV.guestLinks) try { guest = (new URLSearchParams")
rep("document.title = 'Invitation for ' + guest + ' · Shivendra & Roshni';","document.title = 'Invitation for ' + guest + ' · ' + INV.names;")
rep("var sw=document.getElementById('scratch'), sc=document.getElementById('scr'), x=sc.getContext('2d'), done=false;","var sw=document.getElementById('scratch'), sc=document.getElementById('scr'); if(sc){ var x=sc.getContext('2d'), done=false;")
rep("document.getElementById('after').textContent='See you on 2nd December!';","document.getElementById('after').textContent='See you there!';")
rep("['pointerup','pointercancel'].forEach(function(t){ sc.addEventListener(t,function(){ drawing=false; last=null; check(); }); });","['pointerup','pointercancel'].forEach(function(t){ sc.addEventListener(t,function(){ drawing=false; last=null; check(); }); }); }")
rep("tick(); setInterval(tick,1000);","if(document.getElementById('cd-d')){ tick(); setInterval(tick,1000); }")
rep("var cards=document.getElementById('cards'), stops","var cards=document.getElementById('cards'); if(cards){ var stops")
rep("fill.style.width=(idx/(stops.length-1)*80)+'%'; }","fill.style.width=(idx/Math.max(1,stops.length-1)*80)+'%'; }")
rep("cards.scrollTo({left:it.offsetLeft-cards.offsetLeft-(cards.clientWidth-it.clientWidth)/2,behavior:'smooth'}); }); });","cards.scrollTo({left:it.offsetLeft-cards.offsetLeft-(cards.clientWidth-it.clientWidth)/2,behavior:'smooth'}); }); }); }")
cut("document.getElementById('wishForm').addEventListener('submit'","if(w) { a.textContent='Opened WhatsApp · tap again if needed'; }\n  });",'''var wf=document.getElementById('wishForm'); if(wf) wf.addEventListener('submit',function(e){ e.preventDefault();
    var n=document.getElementById('w-name').value.trim(), yes=document.getElementById('w-to').value==='yes', m=document.getElementById('w-msg').value.trim(); if(!n) return;
    var btn=document.getElementById('w-send');
    if(INV.rsvpTracking){ btn.disabled=true; SN.post({slug:INV.slug,name:n,attending:yes,message:m}).then(function(ok){ btn.disabled=false; if(ok){ btn.hidden=true; document.getElementById('w-ok').hidden=false; } else alert('Could not send. Please try again.'); },function(){ btn.disabled=false; alert('Could not send. Please try again.'); }); return; }
    var msg='💌 RSVP · '+INV.names+'\\nFrom: '+n+'\\n'+(yes?'✅ Joyfully accept':'🙏 Regretfully decline')+(m?'\\n\\n'+m:'');
    var url='https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg);
    var a=document.getElementById('w-open'); a.href=url; a.hidden=false; btn.hidden=true;
    var w=window.open(url,'_blank'); if(w) { a.textContent='Opened WhatsApp · tap again if needed'; }
  });''')
rep("document.getElementById('callBtn').addEventListener('click',function(){ openDlg('callDlg'); });","var cb=document.getElementById('callBtn'); if(cb) cb.addEventListener('click',function(){ openDlg('callDlg'); });")
for bad in ['Shivendra','Roshni','Khatri','Lalwani','Sindhu','couple.jpg','97136','Bilaspur']:
    assert bad not in s, bad
open(p,'w',encoding='utf8').write(s); print('ok',len(s))
