(() => {
  const root = new URL(".", document.baseURI);
  const href = (path) => new URL(path, root).href;
  const pathname = window.location.pathname;
  const current = pathname.includes("/manifesto/")
    ? "manifesto"
    : pathname.includes("/jogos/")
      ? "jogos"
      : pathname.includes("/loja/")
        ? "loja"
        : "inicio";

  class DiretoriaHeader extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: "open" });
      const links = [
        ["inicio", "Início", "index.html#inicio"],
        ["manifesto", "Manifesto", "manifesto/index.html"],
        ["jogos", "Jogos", "jogos/index.html"],
        ["loja", "Loja oficial", "loja/index.html"],
      ];
      shadow.innerHTML = `
        <style>
          :host { display:block; position:absolute; z-index:20; inset:0 0 auto; width:100%; }
          * { box-sizing:border-box; }
          header { position:relative; width:100%; height:86px; padding:0 clamp(24px,6vw,92px); border-bottom:1px solid rgba(255,255,255,.12); background:#000; }
          .header-inner { display:flex; align-items:center; width:100%; max-width:1392px; height:100%; margin:0 auto; }
          .brand { display:inline-flex; flex:0 0 auto; align-items:center; }
          .brand img { display:block; width:56px; height:56px; object-fit:contain; }
          nav { display:flex; align-items:center; gap:clamp(22px,3.3vw,52px); margin-left:clamp(22px,3.3vw,52px); }
          nav a { color:rgba(255,255,255,.82); font:700 14px/1 "DM Sans",Arial,sans-serif; letter-spacing:.1em; text-decoration:none; text-transform:uppercase; transition:color .2s; }
          nav a:hover, nav a:focus-visible, nav a[aria-current="page"] { color:#fff; }
          nav a:focus-visible, button:focus-visible { outline:2px solid #e91e27; outline-offset:5px; }
          button { display:none; width:44px; height:44px; padding:0; border:1px solid rgba(255,255,255,.42); background:transparent; cursor:pointer; }
          button span { display:block; width:18px; height:1px; margin:5px auto; background:#fff; }
          @media (max-width:780px) {
            header { height:76px; padding:0 clamp(24px,6vw,92px); }
            .brand img { width:46px; height:46px; }
            button { display:block; margin-left:auto; }
            nav { position:absolute; top:76px; right:0; left:0; display:none; align-items:stretch; flex-direction:column; gap:0; margin:0; padding:8px 24px 20px; border-bottom:1px solid rgba(255,255,255,.16); background:rgba(17,17,17,.98); }
            nav.open { display:flex; }
            nav a { padding:16px 0; border-bottom:1px solid rgba(255,255,255,.12); }
            nav a:last-child { border-bottom:0; }
          }
        </style>
        <header>
          <div class="header-inner">
            <a class="brand" href="${href("index.html#inicio")}" aria-label="Diretoria — início"><img src="${href("logo-diretoria.png")}" alt=""></a>
            <button type="button" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span></button>
            <nav aria-label="Navegação principal">
              ${links.map(([id, label, path]) => `<a href="${href(path)}"${current === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            </nav>
          </div>
        </header>`;
      const button = shadow.querySelector("button");
      const nav = shadow.querySelector("nav");
      const close = () => {
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Abrir menu");
        nav.classList.remove("open");
      };
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        nav.classList.toggle("open", open);
      });
      nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) close();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 780) close();
      });
    }
  }

  if (!customElements.get("diretoria-header")) {
    customElements.define("diretoria-header", DiretoriaHeader);
  }
})();
