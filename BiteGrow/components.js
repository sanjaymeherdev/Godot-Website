/* ============================================================
   BITEGROW — site chrome as Web Components
   Drop <script src="components.js"></script> on any page, then use:
     <bitegrow-header active="home"></bitegrow-header>
     <bitegrow-footer></bitegrow-footer>
   No build step, no framework. Styles are scoped via Shadow DOM
   but inherit the CSS custom properties from styles.css.
   ============================================================ */

const WA_NUMBER = "918984636695";
const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const NAV_LINKS = [
  { href: "index.html",    label: "Home",     key: "home" },
  { href: "services.html", label: "The Menu", key: "services" },
  { href: "about.html",    label: "About",    key: "about" },
  { href: "contact.html",  label: "Contact",  key: "contact" },
];

class BiteGrowHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute("active") || "";
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host{
          display:block;
          font-family:var(--font-body);
          position:sticky; top:0; z-index:100;
        }
        header{
          background:var(--paper);
          border-bottom:1px solid var(--line);
        }
        .bar{
          max-width:var(--max-w);
          margin:0 auto;
          padding:18px 24px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:24px;
        }
        .mark{
          font-family:var(--font-display);
          font-weight:600;
          font-size:20px;
          text-decoration:none;
          color:var(--charcoal);
          display:flex;
          align-items:baseline;
          gap:8px;
          letter-spacing:-0.01em;
        }
        .mark .sub{
          font-family:var(--font-mono);
          font-size:10.5px;
          text-transform:uppercase;
          letter-spacing:0.12em;
          color:var(--ink-soft);
          font-weight:400;
        }
        .mark .grow{color:var(--chili);}
        nav{display:flex; align-items:center; gap:28px;}
        nav a{
          font-family:var(--font-mono);
          font-size:13px;
          letter-spacing:0.04em;
          text-transform:uppercase;
          text-decoration:none;
          color:var(--ink-soft);
          padding:6px 0;
          border-bottom:2px solid transparent;
          transition:color .15s ease, border-color .15s ease;
        }
        nav a:hover{color:var(--charcoal);}
        nav a.active{color:var(--chili); border-color:var(--chili);}
        .cta{
          font-family:var(--font-mono);
          font-size:12.5px;
          letter-spacing:0.03em;
          text-transform:uppercase;
          text-decoration:none;
          background:var(--chili);
          color:var(--paper);
          padding:10px 18px;
          border-radius:999px;
          white-space:nowrap;
          transition:background .15s ease, transform .15s ease;
        }
        .cta:hover{background:var(--chili-deep); transform:translateY(-1px);}
        .navlinks{display:flex; align-items:center; gap:28px;}
        .toggle{display:none;}
        @media (max-width:760px){
          .navlinks{display:none;}
          .cta{padding:9px 14px; font-size:11.5px;}
          .mark .sub{display:none;}
        }
      </style>
      <header>
        <div class="bar">
          <a class="mark" href="index.html">
            Bite<span class="grow">Grow</span>
            <span class="sub">by Sanjay Meher</span>
          </a>
          <div class="navlinks">
            ${NAV_LINKS.map(l => `<a href="${l.href}" class="${l.key===active?'active':''}">${l.label}</a>`).join("")}
          </div>
          <a class="cta" target="_blank" rel="noopener" href="${waLink("Hi BiteGrow, I run a food business and want to talk growth.")}">Start on WhatsApp</a>
        </div>
      </header>
    `;
  }
}

class BiteGrowFooter extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    const year = new Date().getFullYear();
    root.innerHTML = `
      <style>
        :host{ display:block; font-family:var(--font-body); }
        footer{
          background:var(--charcoal);
          color:var(--paper);
          padding:64px 0 28px;
        }
        .wrap{ max-width:var(--max-w); margin:0 auto; padding:0 24px; }
        .top{
          display:flex; flex-wrap:wrap; gap:40px;
          justify-content:space-between;
          padding-bottom:40px;
          border-bottom:1px solid var(--line-dark);
        }
        .brand{ max-width:340px; }
        .brand .mark{
          font-family:var(--font-display);
          font-size:22px; font-weight:600;
          margin-bottom:12px;
        }
        .brand .mark .grow{color:var(--turmeric);}
        .brand p{ color:rgba(250,246,236,0.65); font-size:14.5px; margin:0; }
        .cols{ display:flex; gap:56px; flex-wrap:wrap; }
        .col h4{
          font-family:var(--font-mono);
          font-size:11.5px;
          text-transform:uppercase;
          letter-spacing:0.1em;
          color:var(--turmeric);
          margin:0 0 14px;
          font-weight:500;
        }
        .col a{
          display:block;
          text-decoration:none;
          color:rgba(250,246,236,0.82);
          font-size:14.5px;
          margin-bottom:10px;
          transition:color .15s ease;
        }
        .col a:hover{color:var(--paper);}
        .bottom{
          padding-top:24px;
          display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;
          font-family:var(--font-mono);
          font-size:12px;
          color:rgba(250,246,236,0.5);
        }
        @media (max-width:640px){
          .top{flex-direction:column;}
        }
      </style>
      <footer>
        <div class="wrap">
          <div class="top">
            <div class="brand">
              <div class="mark">Bite<span class="grow">Grow</span></div>
              <p>A creative &amp; tech growth partner for food businesses — reels, ordering systems, automation, and everything in between. Built and run by Sanjay Meher.</p>
            </div>
            <div class="cols">
              <div class="col">
                <h4>Site</h4>
                <a href="index.html">Home</a>
                <a href="services.html">The Menu</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
              </div>
              <div class="col">
                <h4>Start Here</h4>
                <a target="_blank" rel="noopener" href="${waLink("Hi BiteGrow, I want to talk about AI reels for my food business.")}">AI Reels</a>
                <a target="_blank" rel="noopener" href="${waLink("Hi BiteGrow, I want WhatsApp/IG/FB order automation.")}">Order Automation</a>
                <a target="_blank" rel="noopener" href="${waLink("Hi BiteGrow, I want to talk about the full growth stack.")}">Full Stack</a>
              </div>
              <div class="col">
                <h4>Contact</h4>
                <a href="mailto:graphicyin@gmail.com">graphicyin@gmail.com</a>
                <a href="tel:+918984636695">+91 89846 36695</a>
                <a target="_blank" rel="noopener" href="https://instagram.com/freelance.sanjay">@freelance.sanjay</a>
              </div>
            </div>
          </div>
          <div class="bottom">
            <span>&copy; ${year} BiteGrow — Graphicy (Graphicy Media), Udyam Registered</span>
            <span>Marwadipara, Sambalpur, Odisha, India 768001</span>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("bitegrow-header", BiteGrowHeader);
customElements.define("bitegrow-footer", BiteGrowFooter);
