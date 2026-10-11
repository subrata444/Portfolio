/* ===== EDIT HERE: personal details, links, resume, projects ===== */
const CONFIG = {
  email: "digititanic@gmail.com",
  phone: "+919382085005",
  whatsapp: "919382085005",          // digits only, with country code; set "" to hide
  github: "",                        // e.g. "https://github.com/your-username"
  linkedin: "",                      // e.g. "https://www.linkedin.com/in/your-name"
  resume: ""                         // e.g. "assets/resume/Subrata-Jana-Resume.pdf" (file must exist)
};

/* One object per project. Leave demo/source "" to hide that button.
   image: path like "assets/images/lead-tracker.jpg"; leave "" for a neutral mockup. */
const PROJECTS = [
  { title:"WhatsApp Lead Tracker", image:"", demo:"https://meta4marketing.github.io/whatsapp/", source:"",
    desc:"A web application for organizing business leads, tracking follow-ups, and managing lead statuses.",
    tech:["HTML","Bootstrap","Firebase Authentication","Cloud Firestore","JavaScript"],
    purpose:"Help small businesses keep track of leads and follow-ups in one place.",
    role:"I designed the interface and built the app with Firebase sign-in and Firestore storage.",
    features:["Lead list with status tracking","Follow-up tracking","User sign-in with Firebase Authentication"],
    learning:"Working with authentication and a cloud database taught me how to structure data and keep the interface responsive." },
  { title:"Meta Ad Manager", image:"", demo:"", source:"",
    desc:"An advertising workflow interface featuring an ad submission form, audience targeting, image preview, and dashboard workflow.",
    tech:["HTML","CSS","JavaScript","Firebase","Cloudinary"],
    purpose:"Make preparing and submitting ad campaigns a clear, guided workflow.",
    role:"I built the form, audience targeting inputs, image preview, and dashboard workflow.",
    features:["Ad submission form","Audience targeting","Image preview","Dashboard workflow"],
    learning:"I learned to connect image uploads with Cloudinary and to design multi-step forms that are easy to follow." },
  { title:"Business Listing Website", image:"", demo:"https://localink.rf.gd/", source:"",
    desc:"A business directory project for displaying local business listings and information.",
    tech:["HTML","CSS","Bootstrap","JavaScript","Firebase (where applicable)"],
    purpose:"Let people find local businesses and their information in one directory.",
    role:"I designed the layout and built the listing pages.",
    features:["Local business listings","Business information pages","Responsive layout"],
    learning:"I practised organising listing content and making a directory readable on small screens." },
  { title:"Static E-commerce Website", badge:"Static demo, no payment gateway", image:"", demo:"https://youtu.be/8a6REj1lVqs", demoLabel:"Watch demo", source:"",
    desc:"A responsive product catalog concept that allows customers to explore products and contact a business through WhatsApp to inquire or order.",
    tech:["HTML","CSS","Bootstrap","JavaScript"],
    purpose:"Show how a small business can present products online without a full shopping backend.",
    role:"I designed and built the responsive catalog and the WhatsApp inquiry flow.",
    features:["Responsive product catalog","Order or inquiry through WhatsApp"],
    learning:"I learned how to design a simple product browsing experience that works well on phones. This is a static concept: it has no payment gateway or shopping backend." },
  { title:"Web Design and Digital Marketing Portfolio", image:"", demo:"https://meta4marketing.github.io/protfolio/", source:"",
    desc:"A showcase of website design and digital marketing service work.",
    tech:["HTML","CSS","JavaScript"],
    purpose:"Present web design and digital marketing services in one place.",
    role:"I designed and built the full site.",
    features:["Service showcase","Responsive layout"],
    learning:"I learned how to present services clearly and keep a site easy to edit." }
];
/* ===== END EDIT AREA ===== */

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const links = {
  email: CONFIG.email && "mailto:" + CONFIG.email,
  phone: CONFIG.phone && "tel:" + CONFIG.phone,
  whatsapp: CONFIG.whatsapp && "https://wa.me/" + CONFIG.whatsapp,
  github: CONFIG.github, linkedin: CONFIG.linkedin, resume: CONFIG.resume
};
document.querySelectorAll("[data-link]").forEach(a => {
  const u = links[a.dataset.link];
  if (u) { a.href = u; a.hidden = false; if (/^https?:/.test(u)) { a.target = "_blank"; a.rel = "noopener noreferrer"; } }
  else a.hidden = true;
});
$("#year").textContent = new Date().getFullYear();

/* Project cards */
const grid = $("#projectGrid");
const shot = p => p.image
  ? `<img src="${esc(p.image)}" alt="Screenshot of ${esc(p.title)}" loading="lazy" width="640" height="400">`
  : `<div class="mock"><div class="bar"><i></i><i></i><i></i></div><div class="mb">${esc(p.title)}</div></div>`;
const btn = (u, label, ghost) => u ? `<a class="btn btn-sm ${ghost ? "btn-ghost" : ""}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}</a>` : "";
PROJECTS.forEach((p, i) => {
  const el = document.createElement("article");
  el.className = "card proj reveal"; el.style.setProperty("--d", i * 0.08 + "s");
  el.innerHTML = `<div class="shot">${shot(p)}</div><div class="pb">
    ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
    <h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
    <ul class="chips">${p.tech.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    <div class="acts">${btn(p.demo, p.demoLabel || "Live demo")}${btn(p.source, "Source code", true)}
    <button class="btn btn-sm btn-ghost" data-i="${i}" aria-haspopup="dialog">View details</button></div></div>`;
  grid.appendChild(el);
});

/* Modal */
const modal = $("#modal"), mBody = $("#mBody");
let opener;
grid.addEventListener("click", e => {
  const b = e.target.closest("[data-i]"); if (!b) return;
  const p = PROJECTS[b.dataset.i]; opener = b;
  mBody.innerHTML = `<h3 id="mTitle">${esc(p.title)}</h3>
    <h4>Purpose</h4><p>${esc(p.purpose)}</p>
    <h4>My contribution</h4><p>${esc(p.role)}</p>
    <h4>Technologies</h4><ul class="chips">${p.tech.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
    <h4>Key features</h4><ul class="l">${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
    <h4>Challenges and learning</h4><p>${esc(p.learning)}</p>
    <div class="acts" style="margin-top:22px">${btn(p.demo, p.demoLabel || "Live demo")}${btn(p.source, "Source code", true)}</div>`;
  modal.showModal();
});
$("#mClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
modal.addEventListener("close", () => opener && opener.focus());

/* Mobile menu */
const burger = $("#burger"), menu = $("#menu");
burger.addEventListener("click", () => {
  const o = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
});
menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });

/* Reveal on scroll and active nav link */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
const navLinks = [...menu.querySelectorAll("a:not(.btn)")];
const so = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => so.observe(s));

/* Dark / light toggle (saved in localStorage) */
const themeBtn = $("#themeBtn");
const setTheme = t => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch (e) {}
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  $('meta[name="theme-color"]').content = t === "dark" ? "#070b1a" : "#f5f7ff";
};
themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
setTheme(document.documentElement.dataset.theme || "dark");
