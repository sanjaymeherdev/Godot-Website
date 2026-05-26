document.addEventListener("DOMContentLoaded", () => {
  populateData();
  setupParticles();
  setupScrollAnimations();
  setupCountdown();
  setupScratchCard();
  setupSlideshow();
  setupMusic();
});

function populateData() {
  // Portal Button
  const bi = WEDDING.bride.trim().split(' ')[0][0];
  const gi = WEDDING.groom.trim().split(' ')[0][0];
  document.getElementById('portal-bride').textContent = WEDDING.bride;
  document.getElementById('portal-groom').textContent = WEDDING.groom;

  // Hero
  document.getElementById('hero-families').textContent = `${WEDDING.brideFamily}  ·  ${WEDDING.groomFamily}`;
  document.getElementById('bride-name').textContent = WEDDING.bride;
  document.getElementById('groom-name').textContent = WEDDING.groom;
  document.getElementById('hero-date').textContent = WEDDING.weddingDateDisplay;
  document.getElementById('hero-venue-mini').textContent = `${WEDDING.venueName} · ${WEDDING.weddingTimeDisplay}`;
  document.getElementById('hero-hashtag').textContent = WEDDING.coupleHashtag;

  // Message & Scratch
  document.getElementById('invite-message').textContent = WEDDING.inviteMessage;
  document.getElementById('scratch-date-text').textContent = WEDDING.weddingDateDisplay;

  // Events
  const grid = document.getElementById('events-grid');
  WEDDING.events.forEach(ev => {
    grid.innerHTML += `<div class="event-card"><div class="event-icon">${ev.icon}</div><div class="event-name">${ev.name}</div><div class="event-date">${ev.date}</div><div class="event-time">${ev.time}</div><div class="event-venue">${ev.venue}</div></div>`;
  });

  // Dress & Venue
  document.getElementById('dress-type').textContent = WEDDING.dressCode;
  document.getElementById('dress-colors').textContent = WEDDING.dressCodeColors;
  document.getElementById('venue-name').textContent = WEDDING.venueName;
  document.getElementById('venue-address').textContent = WEDDING.venueAddress;
  document.getElementById('venue-link').href = WEDDING.venueMapLink;
  document.getElementById('venue-map').src = WEDDING.venueMapEmbedUrl;
  document.getElementById('rsvp-deadline-display').textContent = WEDDING.rsvpDeadline;
  document.getElementById('footer-note').textContent = WEDDING.footerNote;
  document.getElementById('music-tooltip').textContent = WEDDING.musicLabel;
  if (!WEDDING.musicUrl) document.getElementById('music-btn').style.display = 'none';
}

// 3D Door Open
let doorOpened = false;
function openDoor() {
  if (doorOpened) return;
  doorOpened = true;
  const overlay = document.getElementById('door-overlay');
  overlay.classList.add('opening');
  
  // Sparkle burst
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div'); s.className = 'sparkle';
    const angle = (i / 40) * Math.PI * 2, dist = 80 + Math.random() * 100;
    s.style.cssText = `left:${cx}px;top:${cy}px;width:${3+Math.random()*5}px;height:${3+Math.random()*5}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;animation-delay:${Math.random()*0.2}s;background:${THEME_CONFIG.colors.particle};`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 1000);
  }

  setTimeout(() => {
    overlay.classList.add('gone');
    setTimeout(() => overlay.classList.add('hidden'), 700);
    document.getElementById('invitation').classList.add('visible');
    animateOnScroll(); // Re-trigger scroll animations for main content
  }, 800);
}

// Scroll Animations
function setupScrollAnimations() {
  window.animateOnScroll = function() {
    const els = document.querySelectorAll('.fade-in, .stagger');
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  };
}

// Countdown (Compact)
function setupCountdown() {
  const target = new Date(WEDDING.weddingDateTime).getTime();
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  };
  update(); setInterval(update, 1000);
}

// Scratch Card
function setupScratchCard() {
  const canvas = document.getElementById('scratch-canvas'), ctx = canvas.getContext('2d'), wrap = document.getElementById('scratch-container');
  let drawing = false, cleared = false;
  const resize = () => { canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-gold').trim(); ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim(); ctx.font = `16px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center'; ctx.fillText('✦ Scratch Here ✦', canvas.width/2, canvas.height/2); };
  if (document.fonts) document.fonts.ready.then(resize); else window.addEventListener('load', resize);
  window.addEventListener('resize', resize);

  const getPos = e => { const r = canvas.getBoundingClientRect(); const src = e.touches ? e.touches[0] : e; return { x: src.clientX - r.left, y: src.clientY - r.top }; };
  const scratch = (x,y) => { ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.fill(); };
  const check = () => { if (cleared) return; const d = ctx.getImageData(0,0,canvas.width,canvas.height).data; let t=0; for(let i=3;i<d.length;i+=4) if(d[i]===0)t++; if(t/(canvas.width*canvas.height)>0.5){ cleared=true; canvas.style.opacity=0; canvas.style.pointerEvents='none'; document.getElementById('scratch-cleared').classList.add('show'); }};

  canvas.addEventListener('mousedown', e => { drawing=true; scratch(getPos(e).x,getPos(e).y); });
  canvas.addEventListener('mousemove', e => { if(!drawing)return; scratch(getPos(e).x,getPos(e).y); check(); });
  canvas.addEventListener('mouseup', () => drawing=false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing=true; scratch(getPos(e).x,getPos(e).y); }, {passive:false});
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if(!drawing)return; scratch(getPos(e).x,getPos(e).y); check(); }, {passive:false});
  canvas.addEventListener('touchend', () => drawing=false);
}

// Slideshow
function setupSlideshow() {
  const track = document.getElementById('slideshow-track'), dots = document.getElementById('slide-dots');
  let cur = 0;
  WEDDING.photos.forEach((src,i) => {
    const img = document.createElement('img'); img.src=src; img.className='slide-img'; img.onerror=()=>img.src=`https://placehold.co/800x460/1a4a3a/c9a84c?text=Photo+${i+1}`; track.appendChild(img);
    const dot = document.createElement('div'); dot.className='slide-dot'+(i===0?' active':''); dot.onclick=()=>go(i); dots.appendChild(dot);
  });
  const go = n => { cur=(n+WEDDING.photos.length)%WEDDING.photos.length; track.style.transform=`translateX(-${cur*100}%)`; document.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===cur)); };
  document.getElementById('slide-prev').onclick=()=>go(cur-1);
  document.getElementById('slide-next').onclick=()=>go(cur+1);
  setInterval(()=>go(cur+1), 4000);
}

// Particles
function setupParticles() {
  const c = document.getElementById('particles-canvas'), ctx = c.getContext('2d'), p = [];
  const resize = () => { c.width=window.innerWidth; c.height=window.innerHeight; }; resize(); window.addEventListener('resize', resize);
  class Part { constructor(){this.reset();} reset(){this.x=Math.random()*c.width; this.y=Math.random()*c.height; this.r=Math.random()*1.5+0.5; this.vx=(Math.random()-0.5)*0.4; this.vy=-(Math.random()*0.3+0.1); this.a=Math.random()*0.5+0.2;} update(){this.x+=this.vx; this.y+=this.vy; if(this.y<-5)this.reset();} draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim().replace(')', `,${this.a})`).replace('rgb','rgba');ctx.fill();} }
  for(let i=0;i<70;i++) p.push(new Part());
  const loop = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(x=>{x.update();x.draw();}); requestAnimationFrame(loop); }; loop();
}

// Music
function setupMusic() {
  const audio = document.getElementById('bg-music');
  audio.src = WEDDING.musicUrl || '';
  window.toggleMusic = () => {
    const btn = document.getElementById('music-btn');
    if (audio.paused) { audio.volume=0.35; audio.play().catch(()=>{}); btn.textContent='♫'; btn.classList.add('playing'); }
    else { audio.pause(); btn.textContent='♪'; btn.classList.remove('playing'); }
  };
}

// RSVP
window.submitRSVP = () => {
  const n=document.getElementById('rsvp-name').value.trim(), p=document.getElementById('rsvp-phone').value.trim(), a=document.getElementById('rsvp-attending').value, g=document.getElementById('rsvp-guests').value, m=document.getElementById('rsvp-msg').value.trim();
  if(!n||!a){alert('Please fill name and attendance.');return;}
  if(WEDDING.rsvpFormAction){ /* Form POST logic */ }
  else if(WEDDING.rsvpWhatsApp){
    const txt=`*Wedding RSVP*\nName: ${n}\nPhone: ${p}\nAttending: ${a==='yes'?'Yes ✅':'No ❌'}\nGuests: ${g||1}\nMessage: ${m||'—'}`;
    window.open(`https://wa.me/${WEDDING.rsvpWhatsApp.replace(/\D/g,'')}?text=${encodeURIComponent(txt)}`,'_blank');
  }
  document.getElementById('rsvp-form-wrap').style.display='none';
  document.getElementById('rsvp-success').style.display='flex';
};