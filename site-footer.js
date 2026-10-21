(() => {
  const root = new URL(".", document.baseURI);
  const href = (path) => new URL(path, root).href;

  class DiretoriaFooter extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          :host { display: block; }
          * { box-sizing: border-box; }
          footer { padding: 12px clamp(24px, 6vw, 92px) 9px; background: #f5f3ef; color: #111; }
          .inner { max-width: 1392px; margin: 0 auto; }
          .main { display: flex; min-height: 42px; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; }
          .brand { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; }
          .brand img { display: block; width: 38px; height: 38px; object-fit: contain; }
          .brand-name { font: 800 22px/.9 "Barlow Condensed", Impact, sans-serif; letter-spacing: .06em; text-transform: uppercase; }
          .brand-name small { display: block; margin-top: 9px; color: #77736e; font: 600 10px/1.2 "DM Sans", Arial, sans-serif; letter-spacing: .12em; }
          .social { display: inline-flex; min-height: 44px; align-items: center; gap: 9px; padding: 0; color: #111; text-decoration: none; transition: opacity .2s; }
          .social:hover { opacity: .72; }
          .social > img { display: block; width: 38px; height: 38px; flex: 0 0 auto; object-fit: contain; }
          .social-copy { display: grid; gap: 0; }
          .social-copy small { font: 600 8px/1.1 "DM Sans", Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; }
          .social-wordmark { display: block; width: 112px; height: 25px; object-fit: contain; object-position: left center; }
          .social:focus-visible, .brand:focus-visible { outline: 2px solid #e91e27; outline-offset: 4px; }
          .bottom { margin-top: 8px; padding-top: 7px; border-top: 1px solid #d8d5d0; color: #77736e; font: 400 10px/1.4 "DM Sans", Arial, sans-serif; text-align: center; }
          .bottom p { margin: 0; }
          @media (max-width: 520px) {
            footer { padding: 10px 24px 8px; }
            .main { justify-content: center; }
            .brand { display: none; }
            .brand img { width: 34px; height: 34px; }
            .brand-name { font-size: 20px; }
            .social { min-height: 40px; gap: 8px; }
            .social > img { width: 34px; height: 34px; }
            .social-copy small { font-size: 7px; }
            .social-wordmark { width: 100px; height: 22px; }
            .bottom { margin-top: 6px; padding-top: 6px; }
          }
          @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; } }
        </style>
        <footer>
          <div class="inner">
            <div class="main">
              <a class="brand" href="${href("index.html#inicio")}" aria-label="Diretoria — voltar ao início">
                <img src="${href("logo-diretoria.png")}" alt="">
                <span class="brand-name">Diretoria<small>Futsal feminino</small></span>
              </a>
              <a class="social" href="https://instagram.com/diretoria.ffc/" target="_blank" rel="noreferrer" aria-label="Siga a Diretoria no Instagram" title="Siga a Diretoria no Instagram">
                <img src="${href("instagram.svg")}" alt="">
                <span class="social-copy"><small>Siga a Diretoria no</small><img class="social-wordmark" src="${href("instagram-wordmark.svg")}" alt="Instagram"></span>
              </a>
            </div>
            <div class="bottom"><p>© ${new Date().getFullYear()} Diretoria Futsal. Todos os direitos reservados.</p></div>
          </div>
        </footer>`;
    }
  }

  if (!customElements.get("diretoria-footer")) {
    customElements.define("diretoria-footer", DiretoriaFooter);
  }
})();
