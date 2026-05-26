// ============================================================
//  WEDDING INVITATION CONFIG — Edit everything here
//  No need to touch index.html or style.css
// ============================================================

const WEDDING = {

  // ── Couple ──────────────────────────────────────────────
  bride: "Aanya Sharma",
  groom: "Rohan Mehta",
  coupleHashtag: "#AanyaWedRohan",

  // ── Wedding Date & Time ─────────────────────────────────
  // Format: "YYYY-MM-DDTHH:MM:SS"  (24-hour, local time)
  weddingDateTime: "2026-12-05T19:00:00",
  weddingDateDisplay: "5th December 2026",
  weddingTimeDisplay: "7:00 PM onwards",

  // ── Venue ───────────────────────────────────────────────
  venueName: "The Grand Leela Palace",
  venueAddress: "Diplomatic Enclave, Chanakyapuri, New Delhi – 110023",
  // Google Maps embed URL (replace with your actual venue)
  venueMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.2!2d77.1855!3d28.5975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d4c1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sThe%20Leela%20Palace%20New%20Delhi!5e0!3m2!1sen!2sin!4v1234567890",
  // Direct Google Maps link for "Get Directions" button
  venueMapLink: "https://maps.google.com/?q=The+Leela+Palace+New+Delhi",

  // ── Events ──────────────────────────────────────────────
  // Add / remove event objects as needed
  events: [
    {
      name: "Mehendi Ceremony",
      date: "3rd December 2026",
      time: "11:00 AM",
      venue: "Sharma Residence, Vasant Vihar",
      icon: "🌿"
    },
    {
      name: "Sangeet Night",
      date: "4th December 2026",
      time: "7:00 PM",
      venue: "The Grand Leela Palace — Ballroom",
      icon: "🎶"
    },
    {
      name: "Wedding Ceremony",
      date: "5th December 2026",
      time: "7:00 PM",
      venue: "The Grand Leela Palace — Garden",
      icon: "💍"
    },
    {
      name: "Reception",
      date: "5th December 2026",
      time: "9:30 PM",
      venue: "The Grand Leela Palace — Ballroom",
      icon: "🥂"
    }
  ],

  // ── Dress Code ──────────────────────────────────────────
  dressCode: "Formal / Ethnic Wear",
  dressCodeColors: "Emerald Green · Gold · Ivory",

  // ── Photos ──────────────────────────────────────────────
  // Use any public image URLs or local paths (e.g. "./photos/1.jpg")
  photos: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
  ],

  // ── Background Music ────────────────────────────────────
  // Use a direct link to an MP3 file or leave empty "" to disable
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  musicLabel: "♪ Canon in D — Pachelbel",

  // ── RSVP ────────────────────────────────────────────────
  rsvpEnabled: true,
  rsvpDeadline: "20th November 2026",
  // Where RSVP form submissions go (use Formspree, EmailJS, etc.)
  // Leave as "" to show a "copy to WhatsApp" fallback
  rsvpFormAction: "",
  rsvpWhatsApp: "+919999999999",   // WhatsApp number for fallback RSVP

  // ── Families ────────────────────────────────────────────
  brideFamily: "Mr. & Mrs. Rajiv Sharma",
  groomFamily: "Mr. & Mrs. Suresh Mehta",

  // ── Personal Message ────────────────────────────────────
  inviteMessage: "Together with our families, we joyfully invite you to share in the celebration of our union. Your presence will make our day complete.",

  // ── Footer ──────────────────────────────────────────────
  footerNote: "With love & gratitude — Aanya & Rohan 💚"
};
