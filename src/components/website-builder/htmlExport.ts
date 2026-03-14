import type { WebsiteData } from "./types";

export function generateFullHTML(data: WebsiteData, brandName: string): string {
  const navLinks = data.navigation.map(n => `<a href="#${n.page}" class="nav-link" onclick="showPage('${n.page}')">${n.label}</a>`).join("\n          ");
  const footerLinks = data.footer.links?.map(l => `<a href="#${l.page}" onclick="showPage('${l.page}')">${l.label}</a>`).join(" · ") || "";

  let pagesHTML = "";

  if (data.pages.home) {
    const h = data.pages.home;
    pagesHTML += `
    <div id="page-home" class="page active">
      <section class="hero">
        ${h.hero.trust_badge ? `<span class="trust-badge">${h.hero.trust_badge}</span>` : ""}
        <h1>${h.hero.headline}</h1>
        <p>${h.hero.subheadline}</p>
        <a href="#contact" class="btn" onclick="showPage('contact')">${h.hero.cta_text}</a>
      </section>
      <section class="features"><div class="grid">
        ${h.features.map(f => `<div class="card"><div class="icon">${f.icon || "✨"}</div><h3>${f.title}</h3><p>${f.description}</p></div>`).join("\n          ")}
      </div></section>
      <section class="testimonials">
        <h2>${h.social_proof.headline}</h2>
        <div class="grid">
          ${h.social_proof.testimonials.map(t => `<div class="card"><div class="stars">${"★".repeat(t.rating)}</div><p>${t.text}</p><span class="author">${t.name}</span></div>`).join("\n          ")}
        </div>
      </section>
      <section class="cta-section">
        <h2>${h.cta_section.headline}</h2>
        ${h.cta_section.subheadline ? `<p>${h.cta_section.subheadline}</p>` : ""}
        <a href="#contact" class="btn" onclick="showPage('contact')">${h.cta_section.cta_text}</a>
        ${h.cta_section.urgency_text ? `<small>${h.cta_section.urgency_text}</small>` : ""}
      </section>
    </div>`;
  }

  if (data.pages.about) {
    const a = data.pages.about;
    pagesHTML += `
    <div id="page-about" class="page">
      <section class="content-section">
        <h1>${a.headline}</h1>
        <p class="story">${a.story}</p>
        <div class="mission-box"><span class="label">Unsere Mission</span><p>${a.mission}</p></div>
        <div class="grid values-grid">
          ${a.values.map(v => `<div class="card"><h3>${v.title}</h3><p>${v.description}</p></div>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.products) {
    const p = data.pages.products;
    pagesHTML += `
    <div id="page-products" class="page">
      <section class="content-section">
        <h1>${p.headline}</h1>
        ${p.subheadline ? `<p class="subtitle">${p.subheadline}</p>` : ""}
        <div class="grid products-grid">
          ${p.items.map(item => `<div class="card product-card">${item.badge ? `<span class="badge">${item.badge}</span>` : ""}<h3>${item.name}</h3><p>${item.description}</p>${item.price ? `<div class="price">${item.price}</div>` : ""}<a href="#contact" class="btn-sm" onclick="showPage('contact')">${item.cta_text || "Mehr erfahren"}</a></div>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.contact) {
    const c = data.pages.contact;
    pagesHTML += `
    <div id="page-contact" class="page">
      <section class="content-section">
        <h1>${c.headline}</h1>
        ${c.subheadline ? `<p class="subtitle">${c.subheadline}</p>` : ""}
        <form class="contact-form" onsubmit="event.preventDefault(); alert('Nachricht gesendet!')">
          ${c.form_fields.map(f => f.type === "textarea" ? `<label>${f.label}<textarea placeholder="${f.placeholder || ""}" required></textarea></label>` : `<label>${f.label}<input type="${f.type}" placeholder="${f.placeholder || ""}" required /></label>`).join("\n          ")}
          <button type="submit" class="btn">Nachricht senden</button>
        </form>
        <div class="contact-info">
          ${c.email ? `<div><strong>E-Mail</strong><br/>${c.email}</div>` : ""}
          ${c.phone ? `<div><strong>Telefon</strong><br/>${c.phone}</div>` : ""}
          ${c.address ? `<div><strong>Adresse</strong><br/>${c.address}</div>` : ""}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.faq) {
    const f = data.pages.faq;
    pagesHTML += `
    <div id="page-faq" class="page">
      <section class="content-section">
        <h1>${f.headline}</h1>
        <div class="faq-list">
          ${f.items.map(item => `<details class="faq-item"><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.meta.title}</title>
  <meta name="description" content="${data.meta.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #1a1a2e; --accent: #e68a00; --bg: #fff; --text: #1a1a2e; --muted: #666; --border: #e5e5e5; --card-bg: #fff; --section-alt: #f8f8f8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: var(--text); line-height: 1.6; background: var(--bg); }
    .site-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 100; }
    .site-nav .brand { font-weight: 700; font-size: 1.125rem; }
    .site-nav nav { display: flex; gap: 1.5rem; }
    .nav-link { text-decoration: none; color: var(--muted); font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
    .nav-link:hover, .nav-link.active { color: var(--text); }
    .mobile-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .page { display: none; } .page.active { display: block; }
    .hero { background: var(--primary); color: #fff; padding: 5rem 2rem; text-align: center; }
    .hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; max-width: 640px; margin: 0 auto 1rem; }
    .hero p { font-size: 1.125rem; opacity: 0.8; max-width: 480px; margin: 0 auto 2rem; }
    .trust-badge { display: inline-block; background: rgba(230,138,0,0.2); color: var(--accent); border: 1px solid rgba(230,138,0,0.3); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem; }
    .btn { display: inline-block; background: var(--accent); color: #fff; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; border: none; cursor: pointer; font-size: 1rem; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-sm { display: inline-block; background: var(--primary); color: #fff; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 960px; margin: 0 auto; }
    .card { border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; background: var(--card-bg); }
    .card h3 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0; }
    .card p { font-size: 0.875rem; color: var(--muted); }
    .card .icon { font-size: 2rem; }
    .features { padding: 4rem 2rem; text-align: center; }
    .testimonials { background: var(--section-alt); padding: 4rem 2rem; text-align: center; }
    .testimonials h2 { font-size: 1.5rem; margin-bottom: 2rem; }
    .stars { color: var(--accent); margin-bottom: 0.5rem; }
    .author { display: block; font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem; font-weight: 600; }
    .cta-section { background: var(--primary); color: #fff; padding: 4rem 2rem; text-align: center; }
    .cta-section h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .cta-section p { opacity: 0.8; margin-bottom: 1.5rem; }
    .cta-section small { display: block; margin-top: 1rem; opacity: 0.5; font-size: 0.75rem; }
    .content-section { padding: 4rem 2rem; max-width: 800px; margin: 0 auto; }
    .content-section h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; text-align: center; }
    .subtitle { text-align: center; color: var(--muted); margin-bottom: 2rem; }
    .story { color: var(--muted); margin-bottom: 2rem; line-height: 1.8; }
    .mission-box { background: var(--section-alt); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; text-align: center; margin-bottom: 2rem; }
    .mission-box .label { text-transform: uppercase; font-size: 0.625rem; letter-spacing: 0.1em; color: var(--muted); display: block; margin-bottom: 0.5rem; }
    .product-card { display: flex; flex-direction: column; }
    .product-card .price { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0.75rem 0; }
    .badge { display: inline-block; background: var(--section-alt); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
    .contact-form { max-width: 560px; margin: 0 auto 2rem; }
    .contact-form label { display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 1rem; }
    .contact-form input, .contact-form textarea { width: 100%; border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.625rem 0.75rem; font-size: 0.875rem; margin-top: 0.375rem; font-family: inherit; }
    .contact-form textarea { resize: vertical; min-height: 120px; }
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; text-align: center; font-size: 0.875rem; }
    .contact-info strong { font-size: 0.625rem; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; }
    .faq-list { max-width: 640px; margin: 0 auto; }
    .faq-item { border: 1px solid var(--border); border-radius: 0.75rem; margin-bottom: 0.75rem; overflow: hidden; }
    .faq-item summary { padding: 1rem 1.25rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; list-style: none; }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item p { padding: 0 1.25rem 1rem; font-size: 0.875rem; color: var(--muted); }
    .site-footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; }
    .site-footer a { color: var(--muted); text-decoration: none; font-size: 0.75rem; }
    .site-footer .copy { font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem; }
    @media (max-width: 768px) {
      .site-nav nav { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: 1rem 2rem; gap: 0.75rem; }
      .site-nav nav.open { display: flex; }
      .mobile-toggle { display: block; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="site-nav">
    <span class="brand">${brandName}</span>
    <button class="mobile-toggle" onclick="document.querySelector('.site-nav nav').classList.toggle('open')">☰</button>
    <nav>${navLinks}</nav>
  </header>
  ${pagesHTML}
  <footer class="site-footer">
    ${footerLinks ? `<div>${footerLinks}</div>` : ""}
    <p class="copy">${data.footer.copyright}</p>
  </footer>
  <script>
    function showPage(id) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const el = document.getElementById('page-' + id);
      if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
      document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
      document.querySelectorAll('.nav-link').forEach(a => { if (a.getAttribute('onclick')?.includes(id)) a.classList.add('active'); });
      document.querySelector('.site-nav nav')?.classList.remove('open');
    }
    if (location.hash) showPage(location.hash.replace('#',''));
  </script>
</body>
</html>`;
}
