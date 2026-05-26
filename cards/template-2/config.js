// config.js

// ============================================================
//  THEME CONFIG — Adjust colors here for dynamic theming
// ============================================================
const THEME_CONFIG = {
  name: "maroon",
  colors: {
    bgDark:      "#1a0505",     // Deepest background
    bgMid:       "#2b0a0a",     // Card backgrounds
    primary:     "#5c0f0f",     // Main Maroon
    primaryLight:"#7a1c1c",     // Lighter Maroon
    gold:        "#c9a84c",     // Gold accents
    goldLight:   "#e8c97a",     // Light Gold
    goldShine:   "#f5e0a0",     // Shimmer
    ivory:       "#f5e6c7",     // Main text
    textMuted:   "#a08575",     // Secondary text
    particle:    "#c9a84c"      // Particle color
  }
};

// ============================================================
//  WEDDING DATA — Your content
// ============================================================
const WEDDING = {
  bride: "Aanya",
  groom: "Rohan",
  coupleHashtag: "#AanyaWedsRohan",
  weddingDateTime: "2026-12-05T19:00:00",
  weddingDateDisplay: "5th December 2026",
  weddingTimeDisplay: "7:00 PM onwards",
  venueName: "The Grand Leela Palace",
  venueAddress: "Diplomatic Enclave, Chanakyapuri, New Delhi",
  venueMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.2!2d77.1855!3d28.5975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d4c1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sThe%20Leela%20Palace%20New%20Delhi!5e0!3m2!1sen!2sin!4v1234567890",
  venueMapLink: "https://maps.google.com/?q=The+Leela+Palace+New+Delhi",
  events: [
    { name: "Mehendi Ceremony", date: "3rd December", time: "11:00 AM", venue: "Sharma Residence", icon: "🌿" },
    { name: "Sangeet Night", date: "4th December", time: "7:00 PM", venue: "The Grand Leela", icon: "🎶" },
    { name: "Wedding Ceremony", date: "5th December", time: "7:00 PM", venue: "Garden Lawn", icon: "💍" },
    { name: "Reception", date: "5th December", time: "9:30 PM", venue: "Ballroom", icon: "🥂" }
  ],
  dressCode: "Formal / Ethnic",
  dressCodeColors: "Maroon · Gold · Ivory",
  photos: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80"
  ],
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  rsvpWhatsApp: "+919999999999",
  brideFamily: "The Sharma Family",
  groomFamily: "The Mehta Family",
  inviteMessage: "Together with our families, we joyfully invite you to share in the celebration of our union. Your presence will make our day complete.",
  footerNote: "With love & gratitude — Aanya & Rohan 💚"
};

// Apply theme on load
document.addEventListener('DOMContentLoaded', () => {
  const r = document.documentElement;
  const c = THEME_CONFIG.colors;
  r.style.setProperty('--bg-dark', c.bgDark);
  r.style.setProperty('--bg-mid', c.bgMid);
  r.style.setProperty('--c-primary', c.primary);
  r.style.setProperty('--c-primary-light', c.primaryLight);
  r.style.setProperty('--c-gold', c.gold);
  r.style.setProperty('--c-gold-light', c.goldLight);
  r.style.setProperty('--c-gold-shine', c.goldShine);
  r.style.setProperty('--c-ivory', c.ivory);
  r.style.setProperty('--text-muted', c.textMuted);
  r.style.setProperty('--particle-color', c.particle);

  // Populate Content
  populateContent(WEDDING);
});

function populateContent(w) {
  document.getElementById('portal-bride').textContent = w.bride;
  document.getElementById('portal-groom').textContent = w.groom;
  document.getElementById('hero-bride').textContent = w.bride;
  document.getElementById('hero-groom').textContent = w.groom;
  document.getElementById('hero-families').textContent = `${w.brideFamily}  ·  ${w.groomFamily}`;
  document.getElementById('hero-date').textContent = w.weddingDateDisplay;
  document.getElementById('hero-venue-mini').textContent = `${w.venueName} · ${w.weddingTimeDisplay}`;
  document.getElementById('hero-hashtag').textContent = w.coupleHashtag;
  document.getElementById('invite-message').textContent = w.inviteMessage;
  document.getElementById('scratch-date-text').textContent = w.weddingDateDisplay;
  document.getElementById('dress-type').textContent = w.dressCode;
  document.getElementById('dress-colors').textContent = w.dressCodeColors;
  document.getElementById('venue-name').textContent = w.venueName;
  document.getElementById('venue-address').textContent = w.venueAddress;
  document.getElementById('venue-link').href = w.venueMapLink;
  document.getElementById('venue-map').src = w.venueMapEmbedUrl;
  document.getElementById('rsvp-deadline-display').textContent = w.rsvpDeadline;
  document.getElementById('footer-note').textContent = w.footerNote;
  document.getElementById('music-tooltip').textContent = "Background Music";

  // Events Grid
  const grid = document.getElementById('events-grid');
  w.events.forEach(ev => {
    grid.innerHTML += `<div class="event-card"><div class="event-icon">${ev.icon}</div><div class="event-name">${ev.name}</div><div class="event-date">${ev.date}</div><div class="event-time">${ev.time}</div><div class="event-venue">${ev.venue}</div></div>`;
  });

  // Gallery
  const track = document.getElementById('slideshow-track');
  w.photos.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src; img.className = 'slide-img';
    track.appendChild(img);
  });
}