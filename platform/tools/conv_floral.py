import re,sys
p='templates/floral.html'; s=open(p,encoding='utf8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    assert c==n, (c,n,a[:70])
    s=s.replace(a,b)
def cut(start,end,new):
    global s
    i=s.index(start); j=s.index(end,i)+len(end); s=s[:i]+new+s[j:]

rep('<html lang="en">','<html lang="en" data-theme="{{theme}}">')
rep('<title>Shivendra &amp; Roshni · Wedding Invitation</title>','<title>{{groom.name}} &amp; {{bride.name}} · Wedding Invitation</title>')
cut('<meta name="description"','<meta property="og:image" content="couple.jpg">',
 '<meta name="description" content="You are invited · {{dateLong}} · {{venueName}}">\n<meta property="og:title" content="{{groom.name}} &amp; {{bride.name}} · Wedding Invitation">\n<meta property="og:description" content="Break the seal to open your invitation">\n{{#ogImage}}<meta property="og:image" content="{{ogImage}}">{{/ogImage}}')
# themes
rep('*{box-sizing:border-box}', ''':root[data-theme="lavender"]{--sage:#8f8aa8;--sage-d:#5f5a80;--sage-l:#cfcbe0;--blush:#e2d6ee;--rose:#a78bc4;--rose-d:#7a5ea6;--kraft:#e6e0ec;--linen-2:#f1ecf5;--line:#ddd3e6}
:root[data-theme="blue"]{--sage:#7f97a8;--sage-d:#4f6a80;--sage-l:#c4d3de;--blush:#d3e0ea;--rose:#7fa0bf;--rose-d:#4f7699;--kraft:#dfe6ec;--linen-2:#ecf1f5;--line:#d3dde6}
*{box-sizing:border-box}''')
rep('.photo .ph{aspect-ratio:3/4;border-radius:999px 999px 12px 12px;background:url(couple.jpg) 50% 22%/cover;','.photo .ph{aspect-ratio:3/4;border-radius:999px 999px 12px 12px;background:#eee 50% 22%/cover;')
# intro
rep('<div class="n">Shivendra &amp; Roshni</div>','<div class="n">{{groom.name}} &amp; {{bride.name}}</div>')
rep('<div class="ld">2 · 12 · 2026</div>','<div class="ld">{{dateShort}}</div>')
rep('fill="#f7d6cf">S&amp;R</text>','fill="#f7d6cf">{{gi}}&amp;{{bi}}</text>')
# hero
rep('<div class="hindi">॥ श्री गणेशाय नमः ॥ &nbsp; ॥ जय झूलेलाल ॥</div>','<div class="hindi">{{blessing}}</div>')
rep('<h1>Shivendra</h1><div class="and">&amp;</div><h1 style="margin-top:0">Roshni</h1>','<h1>{{groom.name}}</h1><div class="and">&amp;</div><h1 style="margin-top:0">{{bride.name}}</h1>')
rep('<div class="date">DEC <b>02</b> 2026</div>','{{#hasDate}}<div class="date">{{monthShort}} <b>{{dayPad}}</b> {{year}}</div>{{/hasDate}}')
rep('letter-spacing:.24em">Sindhu Bhawan · Bilaspur</div>','letter-spacing:.24em">{{venueName}}</div>')
# card
cut('<div class="hindi">॥ श्री गणेशाय नमः ॥</div>\n    <p style="margin-top:16px" id="respect">','<div class="when">WEDNESDAY · 2ND DECEMBER 2026</div>',
'''<div class="hindi">{{blessing}}</div>
    <p style="margin-top:16px" id="respect">{{hostLine}}</p>
    <div class="nm">{{groom.name}}</div>
    <div class="par">{{#groom.parents}}S/o {{groom.parents}}{{/groom.parents}}{{#groom.grandparents}}<br>Grandson of {{groom.grandparents}}{{/groom.grandparents}}</div>
    <div class="amp">with</div>
    <div class="nm" style="margin-top:6px">{{bride.name}}</div>
    <div class="par">{{#bride.parents}}D/o {{bride.parents}}{{/bride.parents}}{{#bride.grandparents}}<br>Granddaughter of {{bride.grandparents}}{{/bride.grandparents}}</div>
    <div class="when" style="text-transform:uppercase">{{dateLong}}{{#timeText}} · {{timeText}}{{/timeText}}</div>
    {{#message}}<p style="margin-top:18px;font-style:italic;color:var(--muted)">“{{message}}”</p>{{/message}}''')
# countdown
rep('<!-- ================== COUNTDOWN ================== -->','{{#showCountdown}}<!-- COUNTDOWN -->')
rep('<!-- ================== COUPLE ================== -->','{{/showCountdown}}<!-- COUPLE -->')
cut('<div class="photo rv"><div class="ph" role="img" aria-label="Shivendra and Roshni"></div>','</section>',
'''{{#hasCouplePhoto}}<div class="photo rv"><div class="ph" role="img" aria-label="{{groom.name}} and {{bride.name}}" style="background-image:url('{{couplePhoto}}')"></div>
    <svg class="bloom" viewBox="0 0 200 200"><use href="#bouquet"/></svg>
    <svg class="bloom r" viewBox="0 0 200 200"><use href="#bouquet"/></svg></div>{{/hasCouplePhoto}}
  {{#hasPortraits}}<div class="duo" style="margin-top:34px"><div class="rv"><div class="photo" style="margin-top:0"><div class="ph" style="background-image:url('{{groom.photo}}')"></div></div></div><div class="rv"><div class="photo" style="margin-top:0"><div class="ph" style="background-image:url('{{bride.photo}}')"></div></div></div></div>{{/hasPortraits}}
  <div class="duo">
    <div class="rv"><div class="who">{{groom.name}}</div>{{#groom.parents}}<p>S/o {{groom.parents}}</p>{{/groom.parents}}</div>
    <div class="rv"><div class="who">{{bride.name}}</div>{{#bride.parents}}<p>D/o {{bride.parents}}</p>{{/bride.parents}}</div>
  </div>
</section>''')
# events
rep('<!-- ================== EVENTS ================== -->','{{#hasEvents}}<!-- EVENTS -->')
rep('<div class="tl" id="tl"></div>\n</section>','''<div class="tl">{{#days}}{{#label}}<div class="daylbl rv">{{label}}</div>{{/label}}{{#events}}<div class="ev rv"><div class="top"><div><h3>{{name}}</h3></div><div class="t">{{time}}</div></div>{{#venue}}<p>{{venue}}</p>{{/venue}}</div>{{/events}}{{/days}}</div>
</section>{{/hasEvents}}''')
# family cards
cut('<!-- ================== FAMILY ================== -->','<!-- ================== VENUE ================== -->','<!-- VENUE -->')
# venue
rep('<h3>Sindhu Bhawan</h3>\n      <p>Torwa, Bilaspur, Chhattisgarh</p>','<h3>{{venueName}}</h3>\n      {{#venueAddress}}<p>{{venueAddress}}</p>{{/venueAddress}}')
rep('<p class="muted" style="font-size:16px;margin-top:10px"><i>Barat departs from Radhe Radhe Hotel at 1:00 PM on 2nd December</i></p>','{{#note}}<p class="muted" style="font-size:16px;margin-top:10px"><i>{{note}}</i></p>{{/note}}')
cut('<div class="btns">','</div>\n    </div>\n  </div>','''<div class="btns">
        {{#mapUrl}}<a class="btn wide" target="_blank" rel="noopener" href="{{mapUrl}}">Get Directions</a>{{/mapUrl}}
        {{#calUrl}}<a class="btn o{{^hasPhone}} wide{{/hasPhone}}" target="_blank" rel="noopener" href="{{calUrl}}">Save Date</a>{{/calUrl}}
        {{#hasPhone}}<a class="btn s" target="_blank" rel="noopener" href="https://wa.me/{{phone}}">WhatsApp</a>{{/hasPhone}}
      </div>
    </div>
  </div>''')
cut('<p class="lead" style="font-size:16px">Khatri Family','</p>','{{#hasPhone}}<p class="lead" style="font-size:16px">Contact · <a href="tel:+{{phone}}" style="color:var(--rose-d)">{{phoneDisplay}}</a></p>{{/hasPhone}}')
# rsvp
rep('<!-- ================== RSVP ================== -->','{{#showRsvp}}<!-- RSVP -->')
rep('Leave your wishes &amp; love for Shivendra &amp; Roshni','Leave your wishes &amp; love for {{groom.name}} &amp; {{bride.name}}')
rep('<button class="btn" type="submit" style="width:100%">Send on WhatsApp →</button>\n  </form>\n</section>','<button class="btn" type="submit" style="width:100%" id="rsvpBtn">Send →</button>\n    <p id="rsvpOk" style="display:none;text-align:center;color:var(--sage-d);margin:0">Thank you! Your reply has been sent. 🌸</p>\n  </form>\n</section>{{/showRsvp}}')
# family names
cut('<!-- ================== FAMILY NAMES ================== -->','</section>','''{{#hasFamily}}<section class="pad" style="background:var(--linen-2)">
  <div class="kicker rv">With love &amp; warm regards</div>
  <h2 class="h2 rv">Our Families</h2>
  <svg class="sprig rv" viewBox="0 0 120 22"><use href="#sprig"/></svg>
  <div class="names">{{#family}}<div class="rv">{{#title}}<h4>{{title}}</h4>{{/title}}<p>{{names}}</p></div>{{/family}}</div>
</section>{{/hasFamily}}''')
rep('<div class="s">Shivendra &amp; Roshni</div>\n  <div class="k">KHATRI FAMILY WELCOMES YOU</div>','<div class="s">{{groom.name}} &amp; {{bride.name}}</div>\n  <div class="k">WE AWAIT YOUR PRESENCE</div>')
# script
rep("var WEDDING=new Date('2026-12-02T11:00:00+05:30').getTime(), PHONE='919713669838';","var INV={{{json}}}, WEDDING=INV.ts, PHONE=INV.phone;")
rep("try{ guest=(new URLSearchParams","if(INV.guestLinks) try{ guest=(new URLSearchParams")
rep("document.getElementById('rn').value=guest;","var rnEl=document.getElementById('rn'); if(rnEl) rnEl.value=guest;")
rep("document.title='Invitation for '+guest+' · Shivendra & Roshni';","document.title='Invitation for '+guest+' · '+INV.names;")
rep("function startMusic(){ try{","function startMusic(){ if(!INV.music) return; try{")
cut("(function tick(){","setTimeout(tick,1000); })();","if(document.getElementById('cd')) (function tick(){ var d=Math.max(0,WEDDING-Date.now()), s=Math.floor(d/1000);\n    document.getElementById('d').textContent=Math.floor(s/86400); document.getElementById('h').textContent=pad(Math.floor(s%86400/3600));\n    document.getElementById('m').textContent=pad(Math.floor(s%3600/60)); document.getElementById('s').textContent=pad(s%60);\n    setTimeout(tick,1000); })();")
cut("// events timeline","document.getElementById('tl').innerHTML=html;","")
cut("document.getElementById('rsvp').addEventListener('submit'","'_blank'); });",'''var rf=document.getElementById('rsvp'); if(rf) rf.addEventListener('submit',function(ev){ ev.preventDefault();
    var n=document.getElementById('rn').value.trim(), w=document.getElementById('rw').value.trim();
    if(INV.rsvpTracking){ if(!n){ document.getElementById('rn').focus(); return; } var b=document.getElementById('rsvpBtn'); b.disabled=true;
      SN.post({slug:INV.slug,name:n,attending:ans==='yes',message:w}).then(function(ok){ b.disabled=false; if(ok){ b.style.display='none'; document.getElementById('rsvpOk').style.display='block'; } else alert('Could not send. Please try again.'); },function(){ b.disabled=false; alert('Could not send. Please try again.'); }); return; }
    var msg='🌸 RSVP · '+INV.names+'\\n'+(n?'From: '+n+'\\n':'')+(ans==='yes'?'✅ Joyfully accept — we will be there!':'🙏 Regretfully decline')+(w?'\\n\\n'+w:'');
    window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg),'_blank'); });''')
for bad in ['Shivendra','Roshni','Khatri','Lalwani','Sindhu','couple.jpg','97136']:
    assert bad not in s, bad
open(p,'w',encoding='utf8').write(s)
print('ok',len(s))
