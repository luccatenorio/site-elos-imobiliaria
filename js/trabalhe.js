/* =========================================================================
   ELOS IMOBILIÁRIA — página Trabalhe Conosco
   Script próprio, separado do main.js: aquele carrega carrossel, hero e a
   integração com o Supabase, que não existem aqui.
   ========================================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* Número que recebe as candidaturas. Trocar aqui se mudar o RH. */
const WHATSAPP_RH = '5531992497076';


/* ---------------------------------------------------------------- Ano ---- */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ------------------------------------------- Scroll: header e topo ------- */
(() => {
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (toTop) toTop.classList.toggle('is-visible', y > 620);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  }
})();


/* --------------------------------------------------- Menu mobile --------- */
(() => {
  const toggle = $('#mobileToggle');
  const nav = $('#mainNav');
  const scrim = $('#navScrim');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('modal-open', open);

    if (scrim) {
      if (open) {
        scrim.hidden = false;
        requestAnimationFrame(() => scrim.classList.add('is-visible'));
      } else {
        scrim.classList.remove('is-visible');
        setTimeout(() => { scrim.hidden = true; }, 320);
      }
    }
  }

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  if (scrim) scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => setOpen(false)));
})();


/* -------------------------------------------------- Reveal ao rolar ------ */
(() => {
  $$('[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 80;
    $$('[data-reveal]', group).forEach((el, i) => {
      if (!el.style.getPropertyValue('--reveal-delay')) {
        el.style.setProperty('--reveal-delay', `${i * step}ms`);
      }
    });
  });

  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ------------------------------------------ Formulário de candidatura ---- */
(() => {
  const form = $('#applyForm');
  if (!form) return;

  const sucesso = $('#applySuccess');
  const fallback = $('#applyFallback');

  /* Máscara de telefone brasileiro: (31) 90000-0000 */
  const telefone = $('#a-telefone');
  if (telefone) {
    telefone.addEventListener('input', () => {
      const digitos = telefone.value.replace(/\D/g, '').slice(0, 11);
      let saida = digitos;
      if (digitos.length > 2) saida = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
      if (digitos.length > 7) {
        const corte = digitos.length > 10 ? 7 : 6;
        saida = `(${digitos.slice(0, 2)}) ${digitos.slice(2, corte)}-${digitos.slice(corte)}`;
      }
      telefone.value = saida;
    });
  }

  const REGRAS = {
    'a-nome':     v => v.trim().split(/\s+/).length >= 2 || 'Digite seu nome e sobrenome.',
    'a-email':    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'E-mail inválido.',
    'a-telefone': v => v.replace(/\D/g, '').length >= 10 || 'Telefone incompleto — inclua o DDD.',
    'a-idade':    v => {
      const n = parseInt(v, 10);
      if (!v.trim()) return 'Informe sua idade.';
      if (isNaN(n) || n < 16 || n > 90) return 'Idade deve estar entre 16 e 90.';
      return true;
    },
    'a-cidade':   v => v.trim().length >= 3 || 'Informe a cidade onde você mora.',
    'a-sobre':    v => v.trim().length >= 20 || 'Escreva pelo menos uma frase sobre você.',
  };

  function validarCampo(input) {
    const regra = REGRAS[input.id];
    if (!regra) return true;

    const resultado = regra(input.value);
    const campo = input.closest('.field');
    const msg = campo ? campo.querySelector('.field-error') : null;

    if (resultado === true) {
      if (campo) campo.classList.remove('has-error');
      if (msg) msg.textContent = '';
      return true;
    }
    if (campo) {
      campo.classList.remove('has-error');
      void campo.offsetWidth;              // reinicia o shake
      campo.classList.add('has-error');
    }
    if (msg) msg.textContent = resultado;
    return false;
  }

  Object.keys(REGRAS).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => { if (input.value) validarCampo(input); });
    input.addEventListener('input', () => {
      const campo = input.closest('.field');
      if (campo && campo.classList.contains('has-error')) validarCampo(campo.querySelector('input, textarea'));
    });
  });

  function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function montarMensagem() {
    /* Sem backend ainda: a candidatura vai por WhatsApp já formatada.
       Quando houver tabela de candidatos no Supabase, trocar isto por um
       POST — ver directives/site_elos.md. */
    const linhas = [
      '*Nova candidatura — Trabalhe Conosco*',
      '',
      `*Nome:* ${valor('a-nome')}`,
      `*E-mail:* ${valor('a-email')}`,
      `*WhatsApp:* ${valor('a-telefone')}`,
      `*Idade:* ${valor('a-idade')}`,
      `*Cidade:* ${valor('a-cidade')}`,
      `*CRECI:* ${valor('a-creci')}`,
      `*Experiência:* ${valor('a-experiencia')}`,
      `*Disponibilidade:* ${valor('a-disponibilidade')}`,
      `*Veículo:* ${valor('a-veiculo')}`,
    ];

    const link = valor('a-link');
    if (link) linhas.push(`*Perfil:* ${link}`);

    linhas.push('', '*Sobre:*', valor('a-sobre'));
    return linhas.join('\n');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const campos = Object.keys(REGRAS).map(id => document.getElementById(id)).filter(Boolean);
    let primeiroErro = null;

    campos.forEach(input => {
      if (!validarCampo(input) && !primeiroErro) primeiroErro = input;
    });

    if (primeiroErro) {
      primeiroErro.focus({ preventScroll: true });
      primeiroErro.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'center' });
      return;
    }

    const url = `https://wa.me/${WHATSAPP_RH}?text=${encodeURIComponent(montarMensagem())}`;
    if (fallback) fallback.href = url;

    // Bloqueador de pop-up pode barrar: por isso o link de resgate na tela.
    window.open(url, '_blank', 'noopener');

    form.querySelectorAll('.apply-fields, .btn, .apply-hint').forEach(el => { el.style.display = 'none'; });
    if (sucesso) sucesso.classList.add('is-visible');
  });
})();
