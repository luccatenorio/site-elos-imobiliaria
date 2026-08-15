/* =========================================================================
   ELOS IMOBILIÁRIA — interações
   Cada bloco é independente e falha em silêncio se o HTML dele não existir.
   Regra do design system: nada se move quando o usuário pede
   `prefers-reduced-motion: reduce`.
   ========================================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ---------------------------------------------------------------- Ano ---- */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ------------------------------------------- Scroll: header, progresso --- */
(() => {
  const header = $('#siteHeader');
  const progress = $('#scrollProgress span');
  const toTop = $('#toTop');
  let isScrolled = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    // Histerese para eliminar oscilações no header ao rolar
    if (header) {
      if (!isScrolled && y > 80) {
        isScrolled = true;
        header.classList.add('is-scrolled');
      } else if (isScrolled && y <= 15) {
        isScrolled = false;
        header.classList.remove('is-scrolled');
      }
    }
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
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


/* --------------------------------------------------- Menu mobile / nav --- */
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
    document.body.classList.toggle('nav-open', open);

    const header = $('#siteHeader');
    if (header) header.classList.toggle('has-open-nav', open);

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

  // Dropdown: no mobile o primeiro toque abre o submenu em vez de navegar.
  $$('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Mesmo breakpoint do menu mobile no style.css — mudou lá, muda aqui.
      if (window.innerWidth <= 1150) {
        e.preventDefault();
        link.closest('.has-dropdown').classList.toggle('is-open');
      }
    });
  });

  // Qualquer link que leve a uma âncora fecha o menu.
  $$('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.closest('.has-dropdown') && !link.closest('.dropdown')) return;
      setOpen(false);
    });
  });
})();


/* -------------------------------------------------- Reveal ao rolar ------ */
(() => {
  // Stagger declarado no container pai: data-reveal-stagger="80"
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
  }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ------------------------------------------------ Contador de Stats ------- */
(() => {
  const statsSection = $('.section-stats');
  if (!statsSection) return;

  const countEls = $$('[data-count]', statsSection);

  // Inicializa todos com 0
  countEls.forEach(el => {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = `${prefix}0${suffix}`;
  });

  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  let animated = false;

  function checkAndAnimate() {
    if (animated) return;
    const rect = statsSection.getBoundingClientRect();
    // Exige que o topo da seção de estatísticas tenha subido até a metade superior da visão (35% da tela)
    const inView = rect.top <= window.innerHeight * 0.35 && rect.bottom >= 0;

    if (inView) {
      animated = true;
      countEls.forEach(el => animateCounter(el));
      window.removeEventListener('scroll', checkAndAnimate);
    }
  }

  window.addEventListener('scroll', checkAndAnimate, { passive: true });
})();


/* ------------------------------------------------------------- Hero ------ */
window.initHeroSlider = function() {
  const slides = $$('.hero-slide');
  const dotsWrap = $('#heroDots');
  if (!slides.length || !dotsWrap) return;

  if (window.heroTimer) clearInterval(window.heroTimer);

  const AUTOPLAY_MS = 7000;
  let index = 0;
  let paused = false;

  // Limpa dots antigos
  dotsWrap.innerHTML = '';

  // Título palavra a palavra: cada palavra sobe de baixo, em cascata.
  slides.forEach(slide => {
    const title = $('[data-split]', slide);
    if (!title || title.classList.contains('is-split')) return;
    const words = title.textContent.trim().split(/\s+/);
    title.textContent = '';
    words.forEach((word, i) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      const inner = document.createElement('span');
      inner.className = 'word-in';
      inner.textContent = word;
      inner.style.setProperty('--word-delay', `${180 + i * 70}ms`);
      outer.appendChild(inner);
      title.appendChild(outer);
      if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(() => title.classList.add('is-split'));
  });

  // Dots com barra de preenchimento
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir para o destaque ${i + 1}`);
    dot.setAttribute('aria-selected', String(i === 0));
    dot.innerHTML = '<i></i>';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function restartDotFill(dot) {
    if (!dot) return;
    const bar = dot.firstElementChild;
    if (!bar || REDUCED_MOTION) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
  }

  function goTo(next) {
    const target = (next + slides.length) % slides.length;

    slides.forEach((s, idx) => {
      const active = idx === target;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', String(!active));
    });

    dots.forEach((d, idx) => {
      const active = idx === target;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
    });

    index = target;
    if (dots[index]) restartDotFill(dots[index]);
    restart();
  }

  function restart() {
    clearInterval(window.heroTimer);
    if (REDUCED_MOTION || slides.length < 2) return;
    window.heroTimer = setInterval(() => { if (!paused) goTo(index + 1); }, AUTOPLAY_MS);
  }

  const prev = $('#heroPrev');
  const next = $('#heroNext');
  if (prev) {
    const newPrev = prev.cloneNode(true);
    prev.parentNode.replaceChild(newPrev, prev);
    newPrev.addEventListener('click', () => goTo(index - 1));
  }
  if (next) {
    const newNext = next.cloneNode(true);
    next.parentNode.replaceChild(newNext, next);
    newNext.addEventListener('click', () => goTo(index + 1));
  }

  const hero = $('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => { paused = true; });
    hero.addEventListener('mouseleave', () => { paused = false; });
  }

  if (dots[0]) restartDotFill(dots[0]);
  restart();
};

window.initHeroSlider();


/* --------------------------------------- Parallax (mouse e scroll) ------- */
(() => {
  if (REDUCED_MOTION) return;

  // Mouse: camadas do hero acompanham o cursor de leve.
  const mouseLayers = $$('[data-parallax]');
  if (mouseLayers.length && CAN_HOVER) {
    let raf = null;
    let mx = 0, my = 0;

    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 .. 1
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    function apply() {
      mouseLayers.forEach(layer => {
        const amount = parseFloat(layer.dataset.parallax) || 14;
        layer.style.transform = `translate3d(${-mx * amount}px, ${-my * amount}px, 0)`;
      });
      raf = null;
    }
  }

  // Scroll: fundo fotográfico desliza mais devagar que a página.
  const bgLayers = $$('[data-parallax-bg]');
  if (bgLayers.length) {
    let ticking = false;

    function updateBg() {
      const vh = window.innerHeight;
      bgLayers.forEach(layer => {
        const section = layer.parentElement;
        const box = section.getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) return;
        const amount = parseFloat(layer.dataset.parallaxBg) || 50;
        const progress = (box.top + box.height / 2 - vh / 2) / vh;  // ~ -1 .. 1
        layer.style.transform = `translate3d(0, ${-progress * amount}px, 0)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateBg); }
    }, { passive: true });
    updateBg();
  }
})();


/* ------------------------------------------------- Contadores (stats) ---- */
(() => {
  // O seletor é o atributo, não a classe: o contador escreve via textContent,
  // então precisa mirar num elemento sem irmãos (ex.: a nota tem uma estrela
  // ao lado, e o número mora num <span> interno).
  const numbers = $$('[data-count]');
  if (!numbers.length) return;

  function format(value, decimals) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function run(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (REDUCED_MOTION) {
      el.textContent = prefix + format(target, decimals) + suffix;
      return;
    }

    const duration = 1700;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + format(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (REDUCED_MOTION) {
    numbers.forEach(run);
    return;
  }

  /* Por que não IntersectionObserver aqui:
     no celular a página nasce curta — as imagens ainda não carregaram e os
     empreendimentos ainda estão vindo do Supabase — então a faixa de números
     cai dentro da primeira tela e o observer dispara na hora. Quando a pessoa
     rola até lá, a contagem já acabou e ela nunca vê a animação.

     Aqui a posição é conferida de verdade a cada scroll, contra o layout do
     momento. Se o bloco se mover porque o conteúdo carregou, a checagem
     seguinte pega a posição nova. Cada número dispara uma vez só. */
  let pendentes = numbers.slice();
  let agendado = false;

  function verificar() {
    agendado = false;
    const vh = window.innerHeight;

    pendentes = pendentes.filter(el => {
      const box = el.getBoundingClientRect();
      // Precisa estar confortavelmente dentro da tela, não só encostando
      // na borda — assim a animação começa com o bloco já à vista.
      const visivel = box.top < vh * 0.85 && box.bottom > vh * 0.15;
      if (!visivel) return true;
      run(el);
      return false;
    });

    if (!pendentes.length) {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
    }
  }

  function agendar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(verificar);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);

  // Checagem inicial só depois do layout assentar: se a faixa já estiver
  // visível de largada (tela grande, página curta), anima mesmo sem rolar.
  if (document.readyState === 'complete') {
    agendar();
  } else {
    window.addEventListener('load', agendar, { once: true });
  }
})();


/* ------------------------------------------- Empreendimentos: abas ------- */
(() => {
  const tabsWrap = $('#empTabs');
  const track = $('#empCards');
  if (!tabsWrap || !track) return;

  const buttons = $$('.tab-btn', tabsWrap);
  const cards = $$('.property-card', track);
  if (!buttons.length) return;

  tabsWrap.style.setProperty('--tab-count', buttons.length);

  function activate(tab, { scroll = false } = {}) {
    const btn = buttons.find(b => b.dataset.tab === tab) || buttons[0];
    const idx = buttons.indexOf(btn);

    buttons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    tabsWrap.style.setProperty('--tab-index', idx);

    // Fade out -> troca de visibilidade -> fade in em cascata.
    cards.forEach(card => card.classList.add('is-filtering'));

    setTimeout(() => {
      let visible = 0;
      cards.forEach(card => {
        const show = btn.dataset.tab === 'todos' || card.dataset.tab === btn.dataset.tab;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.transitionDelay = REDUCED_MOTION ? '' : `${visible * 10}ms`;
          visible += 1;
        } else {
          card.style.transitionDelay = '';
        }
      });

      requestAnimationFrame(() => {
        cards.forEach(card => card.classList.remove('is-filtering'));
      });
      setTimeout(() => cards.forEach(card => { card.style.transitionDelay = ''; }), 300);

      track.scrollTo({ left: 0, behavior: 'auto' });
      track.dispatchEvent(new Event('scroll'));
    }, REDUCED_MOTION ? 0 : 20);

    if (scroll) {
      document.getElementById('empreendimentos')
        .scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
    }
  }

  buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tab)));

  // Links do dropdown "Imóveis" caem direto na aba correspondente.
  $$('[data-jump-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activate(link.dataset.jumpTab, { scroll: true });
    });
  });

  activate('construcao');
})();


/* ------------------------------------ Carrosséis: setas, arrasto, trilho - */
(() => {
  const tracks = $$('[data-drag-scroll]');

  function step(track) {
    const card = track.querySelector(':scope > *:not([style*="display: none"])');
    const width = card ? card.getBoundingClientRect().width : 300;
    return width + 24;
  }

  function updateRail(track) {
    const rail = document.querySelector(`[data-rail-for="${track.id}"]`);
    const maxScroll = track.scrollWidth - track.clientWidth;

    const prevBtn = document.querySelector(`[data-carousel-prev="${track.id}"]`);
    const nextBtn = document.querySelector(`[data-carousel-next="${track.id}"]`);
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 2;

    if (!rail) return;
    if (maxScroll <= 0) { rail.style.width = '100%'; rail.style.marginLeft = '0'; return; }
    const thumb = Math.max((track.clientWidth / track.scrollWidth) * 100, 14);
    const pos = (track.scrollLeft / maxScroll) * (100 - thumb);
    rail.style.width = `${thumb}%`;
    rail.style.marginLeft = `${pos}%`;
  }

  $$('[data-carousel-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.carouselPrev);
      if (track) track.scrollBy({ left: -step(track), behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });
  $$('[data-carousel-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.carouselNext);
      if (track) track.scrollBy({ left: step(track), behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });

  tracks.forEach(track => {
    let down = false, moved = false, startX = 0, startScroll = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;   // toque já rola nativamente
      down = true; moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });

    track.addEventListener('pointermove', (e) => {
      if (!down) return;
      const delta = e.clientX - startX;
      if (!moved && Math.abs(delta) > 5) {
        moved = true;
        track.classList.add('is-dragging');
        track.setPointerCapture(e.pointerId);
      }
      if (moved) track.scrollLeft = startScroll - delta;
    });

    function release() {
      down = false;
      if (moved) setTimeout(() => track.classList.remove('is-dragging'), 30);
      moved = false;
    }
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener('mouseleave', release);

    track.addEventListener('scroll', () => updateRail(track), { passive: true });
    updateRail(track);
    window.addEventListener('resize', () => updateRail(track));
  });
})();


/* --------------------------------------------------- Favoritar imóvel ---- */
$$('.fav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!on));
  });
});


/* ------------------------------------------------------ Busca / chips ---- */
(() => {
  const form = $('#searchForm');
  if (!form) return;

  $$('.chip', form).forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('is-active'));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Sem backend ainda: leva o usuário para a vitrine de empreendimentos.
    const alvo = document.getElementById('empreendimentos');
    if (alvo) alvo.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  });
})();


/* ------------------------------------------ Formulário multi-etapa ------- */
(() => {
  const form = $('#contactForm');
  if (!form) return;

  const panels = $$('.contact-panel', form);
  const steps = $$('.step', form);
  const fill = $('#contactProgressFill');
  const success = $('#contactSuccess');
  let current = 0;

  /* Máscara de telefone brasileiro: (31) 90000-0000 */
  const phone = $('#c-telefone');
  if (phone) {
    phone.addEventListener('input', () => {
      const digits = phone.value.replace(/\D/g, '').slice(0, 11);
      let out = digits;
      if (digits.length > 2) out = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length > 7) {
        const cut = digits.length > 10 ? 7 : 6;
        out = `(${digits.slice(0, 2)}) ${digits.slice(2, cut)}-${digits.slice(cut)}`;
      }
      phone.value = out;
    });
  }

  const RULES = {
    'c-nome':     v => v.trim().length >= 3 || 'Digite seu nome completo.',
    'c-telefone': v => v.replace(/\D/g, '').length >= 10 || 'Telefone incompleto — inclua o DDD.',
    'c-email':    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'E-mail inválido.',
  };

  function validateField(input) {
    const rule = RULES[input.id];
    if (!rule) return true;

    const result = rule(input.value);
    const field = input.closest('.field');
    const msg = field ? field.querySelector('.field-error') : null;

    if (result === true) {
      if (field) field.classList.remove('has-error');
      if (msg) msg.textContent = '';
      return true;
    }
    if (field) {
      field.classList.remove('has-error');
      void field.offsetWidth;              // reinicia o shake
      field.classList.add('has-error');
    }
    if (msg) msg.textContent = result;
    return false;
  }

  Object.keys(RULES).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && field.classList.contains('has-error')) validateField(input);
    });
  });

  function show(index) {
    panels[current].classList.remove('is-active');
    current = index;
    panels[current].classList.add('is-active');

    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === current);
      step.classList.toggle('is-done', i < current);
    });
    if (fill) fill.style.transform = `scaleX(${(current + 1) / panels.length})`;

    const firstInput = panels[current].querySelector('input, select, textarea');
    if (firstInput) firstInput.focus({ preventScroll: true });
  }

  $$('[data-next]', form).forEach(btn => {
    btn.addEventListener('click', () => {
      const inputs = $$('input, select', panels[current]);
      const ok = inputs.every(input => validateField(input));
      if (ok && current < panels.length - 1) show(current + 1);
    });
  });

  $$('[data-prev]', form).forEach(btn => {
    btn.addEventListener('click', () => { if (current > 0) show(current - 1); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Front-end apenas: ainda não há backend ligado neste formulário.
    $$('.contact-panel, .contact-steps, .contact-progress', form)
      .forEach(el => { el.style.display = 'none'; });
    if (success) success.classList.add('is-visible');
  });
})();


/* ------------------------- Corretores: magnetização estilo dock (macOS) --- */
(() => {
  const grid = $('.brokers-grid');
  const cards = $$('.brokers-grid .broker-item');
  if (!grid || !cards.length || !CAN_HOVER || REDUCED_MOTION) return;

  const EFFECT_RADIUS = 190;
  const MAX_SCALE = 1.12;
  const MIN_SCALE = 1;
  const LIFT = 10;

  let pointer = null;
  let scales = cards.map(() => MIN_SCALE);
  let raf = null;

  function targetScales() {
    if (!pointer) return cards.map(() => MIN_SCALE);
    const gridBox = grid.getBoundingClientRect();

    return cards.map(card => {
      const box = card.getBoundingClientRect();
      const cx = box.left - gridBox.left + box.width / 2;
      const cy = box.top - gridBox.top + box.height / 2;
      const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
      if (distance >= EFFECT_RADIUS) return MIN_SCALE;

      const theta = (distance / EFFECT_RADIUS) * Math.PI;
      const falloff = (1 + Math.cos(theta)) / 2;
      return MIN_SCALE + falloff * (MAX_SCALE - MIN_SCALE);
    });
  }

  function tick() {
    const targets = targetScales();
    const lerp = pointer ? 0.22 : 0.16;
    let moving = false;

    scales = scales.map((scale, i) => {
      const next = scale + (targets[i] - scale) * lerp;
      if (Math.abs(targets[i] - next) > 0.001) moving = true;
      return next;
    });

    scales.forEach((scale, i) => {
      cards[i].style.transform = `translateY(${-(scale - 1) * LIFT}px) scale(${scale})`;
      cards[i].style.zIndex = Math.round(scale * 10);
    });

    raf = (moving || pointer) ? requestAnimationFrame(tick) : null;
  }

  function ensureAnimating() { if (!raf) raf = requestAnimationFrame(tick); }

  grid.addEventListener('mousemove', (e) => {
    const gridBox = grid.getBoundingClientRect();
    pointer = { x: e.clientX - gridBox.left, y: e.clientY - gridBox.top };
    ensureAnimating();
  });
  grid.addEventListener('mouseleave', () => { pointer = null; ensureAnimating(); });
})();


/* ------------------------------------------- Depoimentos: modal ---------- */
(() => {
  const modal = $('#testimonialModal');
  if (!modal) return;

  const modalStars = $('#modalStars');
  const modalText = $('#modalText');
  const modalAvatar = $('#modalAvatar');
  const modalName = $('#modalName');
  const modalLocation = $('#modalLocation');
  let lastFocused = null;

  function open(card) {
    if (card.closest('.is-dragging')) return;   // não abrir logo após arrastar

    if (modalStars) modalStars.innerHTML = card.querySelector('.stars').innerHTML;
    if (modalText) modalText.textContent = card.querySelector('p').textContent;
    // Nem todo autor tem foto — alguns usam a inicial colorida como o Google.
    const avatar = card.querySelector('.testimonial-author img');
    if (modalAvatar) {
      if (avatar) {
        modalAvatar.src = avatar.src;
        modalAvatar.hidden = false;
      } else {
        modalAvatar.hidden = true;
      }
    }
    if (modalName) modalName.textContent = card.querySelector('.testimonial-author strong').textContent;
    if (modalLocation) modalLocation.textContent = card.querySelector('.testimonial-author span').textContent;

    lastFocused = card;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.testimonial-modal-close').focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  $$('.testimonial-card').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });

  $$('[data-modal-close]', modal).forEach(el => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();


/* ------------------------------ Diferenciais: borda que se desenha ------- */
/* O <rect> é medido em PIXELS REAIS do card. viewBox normalizado distorce os
   cantos arredondados e faz o traço "vazar" para fora (bug já corrigido antes). */
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function build() {
    $$('.highlight-box:not(.diff-card)').forEach(box => {
      const existing = box.querySelector('.highlight-ring');
      if (existing) existing.remove();

      const w = box.offsetWidth;
      const h = box.offsetHeight;
      if (!w || !h) return;

      const radius = parseFloat(getComputedStyle(box).borderRadius) || 14;
      const gap = 4;   // a linha corre AO REDOR do card, 4px afastada

      const ring = document.createElementNS(SVG_NS, 'svg');
      ring.setAttribute('class', 'highlight-ring');
      ring.setAttribute('viewBox', `0 0 ${w + gap * 2} ${h + gap * 2}`);
      ring.setAttribute('aria-hidden', 'true');

      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', '2');
      rect.setAttribute('y', '2');
      rect.setAttribute('width', Math.max(w + gap * 2 - 4, 0));
      rect.setAttribute('height', Math.max(h + gap * 2 - 4, 0));
      rect.setAttribute('rx', Math.max(radius + gap - 1, 0));
      // Sem isto o traço nasce com o dashoffset de fallback do CSS e "desenha
      // sozinho" ao carregar a página, porque a transição já está ativa.
      rect.style.transition = 'none';

      ring.appendChild(rect);
      box.prepend(ring);

      const length = rect.getTotalLength();   // pathLength="100" não funciona aqui
      rect.style.strokeDasharray = `${length} ${length}`;
      rect.style.setProperty('--ring-length', length);

      // Força o recálculo com a transição desligada e só então devolve o
      // controle ao CSS — assim o hover continua animando normalmente.
      void getComputedStyle(rect).strokeDashoffset;
      rect.style.transition = '';
    });
  }

  build();
  window.addEventListener('load', build);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
})();


/* --------------------------------------------- Spotlight de cursor ------- */
(() => {
  if (!CAN_HOVER || REDUCED_MOTION) return;

  $$('.spotlight').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const box = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - box.left}px`);
      el.style.setProperty('--my', `${e.clientY - box.top}px`);
    });
  });
})();


/* ------------------------------------------- Parceiros: faixa infinita --- */
(() => {
  const track = $('#partnersMarquee .marquee-track');
  if (!track || REDUCED_MOTION) return;
  // Duplica o conteúdo: a animação anda -50% e emenda sem costura.
  track.innerHTML += track.innerHTML;
})();


/* =========================================================================
   INTEGRAÇÃO SUPABASE CRM — Carregamento Dinâmico de Imóveis da Elos
   ========================================================================= */
(() => {
  let allEnterprises = [];
  let currentModalPhotos = [];
  let currentPhotoIndex = 0;
  let activePropertyId = null;

  // Seletores do Modal de Detalhes
  const modal = $('#propertyModal');
  const modalTitle = $('#pModalTitle');
  const modalLocation = $('#pModalLocation span');
  const modalTag = $('#pModalTag');
  const modalConstructor = $('#pModalConstructor');
  const modalExchangeBadge = $('#pModalExchangeBadge');
  const modalPrice = $('#pModalPrice');
  const modalBed = $('#pModalBed span');
  const modalBath = $('#pModalBath span');
  const modalArea = $('#pModalArea span');
  const modalParking = $('#pModalParking span');
  const modalExchangeDetails = $('#pModalExchangeDetails');
  const modalDesc = $('#pModalDesc');
  const modalWaBtn = $('#pModalWaBtn');
  const modalPdfBtn = $('#pModalPdfBtn');
  const modalShareBtn = $('#pModalShareBtn');
  const modalMainImg = $('#pModalMainImg');
  const modalImgCount = $('#pModalImgCount');
  const modalThumbs = $('#pModalThumbs');
  const modalPrevBtn = $('#pModalPrevImg');
  const modalNextBtn = $('#pModalNextImg');

  function openModal(item, updateUrl = true) {
    if (!modal) return;
    activePropertyId = item.id;
    currentModalPhotos = item.photos && item.photos.length > 0 ? item.photos : ['assets/img/logo-elos-header.png'];
    currentPhotoIndex = 0;

    // Atualiza a URL no navegador para permitir compartilhamento direto da rota do imóvel
    if (updateUrl && window.history && window.history.pushState) {
      const newUrl = `${window.location.origin}${window.location.pathname}?imovel=${item.id}`;
      window.history.pushState({ imovelId: item.id }, '', newUrl);
    }

    // Pré-carrega todas as imagens do modal em memória para transição instantânea
    currentModalPhotos.forEach(src => {
      if (src && typeof src === 'string' && src.startsWith('http')) {
        const img = new Image();
        img.src = src;
      }
    });

    if (modalTitle) modalTitle.textContent = item.name;
    if (modalLocation) modalLocation.textContent = item.region || 'Belo Horizonte e Região - MG';
    
    if (modalTag) {
      modalTag.className = `tag ${item.statusTag.class}`;
      modalTag.innerHTML = `<i class="tag-dot"></i>${item.statusTag.text}`;
    }

    if (modalConstructor) {
      if (item.constructorName) {
        modalConstructor.querySelector('span').textContent = item.constructorName;
        modalConstructor.style.display = 'inline-flex';
      } else {
        modalConstructor.style.display = 'none';
      }
    }

    if (modalExchangeBadge) {
      modalExchangeBadge.style.display = item.acceptsExchange ? 'inline-block' : 'none';
    }

    if (modalPrice) modalPrice.textContent = item.priceFormatted;

    const bedText = item.bedrooms > 0 ? `${item.bedrooms} quarto${item.bedrooms > 1 ? 's' : ''}` : '2 a 3 quartos';
    const bathText = item.bathrooms > 0 ? `${item.bathrooms} banho${item.bathrooms > 1 ? 's' : ''}` : '1 a 2 banhos';
    const areaText = item.areaUseful ? `${item.areaUseful} m²` : 'Sob consulta';
    const parkText = item.parkingSpots > 0 ? `${item.parkingSpots} vaga${item.parkingSpots > 1 ? 's' : ''}` : 'Sob consulta';

    if (modalBed) modalBed.textContent = bedText;
    if (modalBath) modalBath.textContent = bathText;
    if (modalArea) modalArea.textContent = areaText;
    if (modalParking) modalParking.textContent = parkText;

    if (modalExchangeDetails) {
      if (item.acceptsExchange && item.exchangeDetails) {
        modalExchangeDetails.querySelector('span').textContent = item.exchangeDetails;
        modalExchangeDetails.style.display = 'block';
      } else {
        modalExchangeDetails.style.display = 'none';
      }
    }

    if (modalDesc) {
      modalDesc.textContent = item.description || 'Entre em contato com nossos corretores para saber mais detalhes sobre este empreendimento exclusivo da Elos Imobiliária.';
    }

    if (modalWaBtn) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?imovel=${item.id}`;
      const msg = `Olá! Vi o imóvel "${item.name}" no site da Elos Imobiliária (${shareUrl}), tenho interesse e gostaria de receber mais informações.`;
      modalWaBtn.href = `https://wa.me/5531992497076?text=${encodeURIComponent(msg)}`;
    }

    if (modalPdfBtn) {
      const pdfWrap = $('#pModalPdfWrap');
      if (item.pdfUrl) {
        modalPdfBtn.href = item.pdfUrl;
        if (pdfWrap) pdfWrap.style.display = 'block';
      } else {
        if (pdfWrap) pdfWrap.style.display = 'none';
      }
    }

    renderRelatedEnterprises(item.id);

    updateGallery();

    modal.hidden = false;
    modal.scrollTop = 0;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('modal-open');
  }

  function renderRelatedEnterprises(currentId) {
    const modalRelatedGrid = $('#pModalRelatedGrid');
    if (!modalRelatedGrid) return;
    modalRelatedGrid.innerHTML = '';
    
    const relatedList = allEnterprises
      .filter(p => p.id !== currentId)
      .slice(0, 3);

    const section = $('#pModalRelatedSection');
    if (relatedList.length === 0) {
      if (section) section.style.display = 'none';
      return;
    } else {
      if (section) section.style.display = 'block';
    }

    relatedList.forEach(relItem => {
      const card = document.createElement('article');
      card.className = 'property-card';
      const cover = (relItem.photos && relItem.photos[0]) || 'assets/img/logo-elos-header.png';

      card.innerHTML = `
        <div class="property-card-media">
          <span class="tag ${relItem.statusTag.class}"><i class="tag-dot"></i>${relItem.statusTag.text}</span>
          <img src="${cover}" alt="${relItem.name}" loading="lazy">
          <div class="media-scrim"></div>
        </div>
        <div class="property-card-body">
          <h3>${relItem.name}</h3>
          <p class="property-location">
            <svg class="icon icon-xs" aria-hidden="true"><use href="#i-pin"/></svg> <span>${relItem.region || 'Belo Horizonte - MG'}</span>
          </p>
          <div class="property-price-label">Valor a partir de</div>
          <div class="property-price">${relItem.priceFormatted}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        openModal(relItem, true);
        if (modal) modal.scrollTop = 0;
      });

      modalRelatedGrid.appendChild(card);
    });
  }

  function closeModal(updateUrl = true) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    activePropertyId = null;

    // Limpa a URL removendo o parâmetro do imóvel quando fecha o modal
    if (updateUrl && window.history && window.history.pushState) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('imovel') || urlParams.has('id')) {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({}, '', cleanUrl);
      }
    }

    setTimeout(() => { modal.hidden = true; }, 300);
  }

  function updateGallery() {
    if (!modalMainImg || currentModalPhotos.length === 0) return;

    modalMainImg.src = currentModalPhotos[currentPhotoIndex];
    modalMainImg.style.opacity = '1';

    if (modalImgCount) {
      modalImgCount.textContent = `${currentPhotoIndex + 1} / ${currentModalPhotos.length}`;
    }

    if (modalPrevBtn && modalNextBtn) {
      modalPrevBtn.style.display = currentModalPhotos.length > 1 ? 'flex' : 'none';
      modalNextBtn.style.display = currentModalPhotos.length > 1 ? 'flex' : 'none';
    }

    if (modalThumbs) {
      modalThumbs.innerHTML = '';
      if (currentModalPhotos.length > 1) {
        modalThumbs.style.display = 'flex';
        currentModalPhotos.forEach((url, idx) => {
          const thumb = document.createElement('div');
          thumb.className = `pmodal-thumb ${idx === currentPhotoIndex ? 'is-active' : ''}`;
          thumb.innerHTML = `<img src="${url}" alt="Miniatura ${idx + 1}">`;
          thumb.addEventListener('click', () => {
            currentPhotoIndex = idx;
            updateGallery();
          });
          modalThumbs.appendChild(thumb);
        });
      } else {
        modalThumbs.style.display = 'none';
      }
    }
  }

  if (modalShareBtn) {
    modalShareBtn.addEventListener('click', () => {
      if (!activePropertyId) return;
      const shareUrl = `${window.location.origin}${window.location.pathname}?imovel=${activePropertyId}`;
      const btnSpan = modalShareBtn.querySelector('span');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          if (btnSpan) {
            const originalText = btnSpan.textContent;
            btnSpan.textContent = 'Link Copiado com Sucesso! 📋';
            setTimeout(() => { btnSpan.textContent = originalText; }, 2500);
          }
        }).catch(() => {
          prompt('Copie o link do imóvel para enviar ao cliente:', shareUrl);
        });
      } else {
        prompt('Copie o link do imóvel para enviar ao cliente:', shareUrl);
      }
    });
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
      currentPhotoIndex = (currentPhotoIndex - 1 + currentModalPhotos.length) % currentModalPhotos.length;
      updateGallery();
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      currentPhotoIndex = (currentPhotoIndex + 1) % currentModalPhotos.length;
      updateGallery();
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-pmodal-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modal && !modal.hidden && modal.classList.contains('is-open')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft' && currentModalPhotos.length > 1) {
        currentPhotoIndex = (currentPhotoIndex - 1 + currentModalPhotos.length) % currentModalPhotos.length;
        updateGallery();
      } else if (e.key === 'ArrowRight' && currentModalPhotos.length > 1) {
        currentPhotoIndex = (currentPhotoIndex + 1) % currentModalPhotos.length;
        updateGallery();
      }
    }
  });

  /**
   * Verifica se há um ID de imóvel na URL e abre o modal diretamente (Deep Linking)
   */
  function checkUrlDeepLink() {
    if (!allEnterprises || allEnterprises.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('imovel') || urlParams.get('id') || (window.location.hash ? window.location.hash.replace('#imovel-', '') : null);

    if (sharedId) {
      const foundItem = allEnterprises.find(p => p.id === sharedId || p.id.toLowerCase() === sharedId.toLowerCase());
      if (foundItem) {
        setTimeout(() => {
          openModal(foundItem, false);
          const sectionEmp = $('#empreendimentos');
          if (sectionEmp) {
            sectionEmp.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
          }
        }, 200);
      }
    }
  }

  // Listener para navegação via botões voltar/avançar do navegador
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get('imovel') || urlParams.get('id');
    if (currentId && allEnterprises.length > 0) {
      const foundItem = allEnterprises.find(p => p.id === currentId);
      if (foundItem) {
        openModal(foundItem, false);
      }
    } else {
      if (modal && !modal.hidden && modal.classList.contains('is-open')) {
        closeModal(false);
      }
    }
  });

  /**
   * Renderiza os cards de imóveis dinâmicos na vitrine
   */
  function renderProperties(list) {
    const track = $('#empCards');
    if (!track) return;

    if (!list || list.length === 0) {
      track.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--white); border-radius: var(--r-lg); border: 1px dashed var(--gray-300);">
          <p style="font-size: 1.1rem; font-weight: 600; color: var(--navy-900); margin-bottom: 12px;">Nenhum imóvel encontrado para os filtros aplicados.</p>
          <button type="button" class="btn btn-outline" id="btnResetSearch">Ver todos os imóveis</button>
        </div>
      `;
      const btnReset = $('#btnResetSearch');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          renderProperties(allEnterprises);
          const form = $('#searchForm');
          if (form) form.reset();
          $$('.chip.is-active').forEach(c => c.classList.remove('is-active'));
        });
      }
      return;
    }

    // Pré-carrega fotos principais dos imóveis exibidos para carregamento instantâneo
    list.forEach(item => {
      if (item.mainPhoto && typeof item.mainPhoto === 'string' && item.mainPhoto.startsWith('http')) {
        const img = new Image();
        img.src = item.mainPhoto;
      }
    });

    track.innerHTML = list.map(item => {
      const bedText = item.bedrooms > 0 ? `${item.bedrooms} quarto${item.bedrooms > 1 ? 's' : ''}` : '2 a 3 quartos';
      const bathText = item.bathrooms > 0 ? `${item.bathrooms} banho${item.bathrooms > 1 ? 's' : ''}` : '1 a 2 banhos';
      const areaText = item.areaUseful ? `${item.areaUseful} m²` : 'Sob consulta';
      const parkText = item.parkingSpots > 0 ? `${item.parkingSpots} vaga${item.parkingSpots > 1 ? 's' : ''}` : 'Sob consulta';

      return `
        <article class="property-card" data-id="${item.id}" data-tab="${item.statusTab}">
          <div class="property-card-media">
            <span class="tag ${item.statusTag.class}"><i class="tag-dot"></i>${item.statusTag.text}</span>
            <button type="button" class="fav-btn" aria-label="Salvar ${item.name} nos favoritos" aria-pressed="false">
              <svg class="icon icon-sm" aria-hidden="true"><use href="#i-heart"/></svg>
            </button>
            <img src="${item.mainPhoto}" alt="${item.name}" loading="eager" decoding="async">
            <span class="media-scrim" aria-hidden="true"></span>
          </div>
          <div class="property-card-body">
            <h3>${item.name}</h3>
            <p class="property-location"><svg class="icon icon-xs" aria-hidden="true"><use href="#i-pin"/></svg> ${item.region}</p>
            <ul class="property-specs">
              <li><svg class="icon icon-xs" aria-hidden="true"><use href="#i-bed"/></svg> ${bedText}</li>
              <li><svg class="icon icon-xs" aria-hidden="true"><use href="#i-bath"/></svg> ${bathText}</li>
              <li><svg class="icon icon-xs" aria-hidden="true"><use href="#i-expand"/></svg> ${areaText}</li>
              <li><svg class="icon icon-xs" aria-hidden="true"><use href="#i-car"/></svg> ${parkText}</li>
            </ul>
            <p class="property-price-label">Valor a partir de</p>
            <p class="property-price">${item.priceFormatted}</p>
            <span class="badge-outline">${item.acceptsExchange ? 'Aceita permuta' : 'Financiamento facilitado'}</span>
            <button type="button" class="btn btn-outline btn-block btn-open-details" data-id="${item.id}">
              Saiba mais <svg class="icon icon-xs btn-arrow" aria-hidden="true"><use href="#i-arrow-right"/></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Eventos de clique no card inteiro (imagem, título, corpo ou botão "Saiba mais")
    $$('.property-card', track).forEach(card => {
      card.addEventListener('click', (e) => {
        // Se o clique for no botão de favoritar, ignora a abertura do modal
        if (e.target.closest('.fav-btn')) return;

        const id = card.dataset.id;
        const item = allEnterprises.find(p => p.id === id);
        if (item) openModal(item);
      });
    });

    // Eventos dos botões de favoritar
    $$('.fav-btn', track).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
      });
    });
  }

  /**
   * Atualiza os slides do Hero do topo com 3 imóveis distintos do CRM com fotos reais (substituindo Águas Residence pelo Del Iara)
   */
  function updateHeroSlides(list) {
    const heroSlides = $('#heroSlides');
    if (!heroSlides) return;

    const featured = [];
    const seenIds = new Set();

    // Prioriza o imóvel DEL IARA
    const delIara = list.find(p => (p.name || '').toUpperCase().includes('DEL IARA'));

    for (const item of list) {
      const nameUpper = (item.name || '').toUpperCase();
      // Ignora o loteamento Águas Residence nos destaques do topo
      if (nameUpper.includes('AGUAS RESIDENCE') || nameUpper.includes('LOTEAMENTO')) continue;

      if (item.price > 0 && item.photos && item.photos.length > 0 && !seenIds.has(item.id)) {
        const hasRealPhoto = item.photos.some(p => typeof p === 'string' && p.startsWith('http'));
        if (hasRealPhoto) {
          featured.push(item);
          seenIds.add(item.id);
          if (featured.length >= 3) break;
        }
      }
    }

    // Garante a inclusão do Del Iara entre os 3 destaques
    if (delIara) {
      if (!seenIds.has(delIara.id)) {
        if (featured.length >= 3) {
          featured[2] = delIara;
        } else {
          featured.push(delIara);
        }
      }
    }

    if (featured.length === 0) return;

    heroSlides.innerHTML = featured.map((item, index) => {
      const activeClass = index === 0 ? 'is-active' : '';
      const ariaHidden = index === 0 ? 'false' : 'true';
      const thumb1 = item.photos[0] || item.mainPhoto;
      const thumb2 = item.photos[1] || item.photos[0] || item.mainPhoto;

      const bedText = item.bedrooms > 0 ? `${item.bedrooms} quartos com opções exclusivas` : 'Opções de 2 e 3 quartos';

      return `
        <article class="hero-slide ${activeClass}" aria-hidden="${ariaHidden}">
          <div class="hero-slide-bg" style="background-image:url('${thumb1}')"></div>
          <div class="hero-overlay"></div>
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="container hero-content">
            <div class="hero-highlight">
              <span class="tag ${item.statusTag.class}"><i class="tag-dot"></i>${item.statusTag.text}</span>
              <h2 class="hero-title">${item.name}</h2>
              <p class="hero-location"><svg class="icon icon-xs" aria-hidden="true"><use href="#i-pin"/></svg> ${item.region}</p>
              <div class="hero-price-row">
                <div class="hero-price"><span class="label">Valor a partir de</span><strong>${item.priceFormatted}</strong></div>
                <div class="hero-price"><span class="label">Financiamento</span><strong>Facilitado</strong></div>
              </div>
              <ul class="hero-badges">
                <li>${bedText}</li>
                <li>${item.propertyType} em excelente localização</li>
              </ul>
              <div class="hero-actions">
                <button type="button" class="btn btn-primary btn-hero-detail" data-id="${item.id}">Ver empreendimento <svg class="icon icon-xs btn-arrow" aria-hidden="true"><use href="#i-arrow-right"/></svg></button>
                <a href="#contato" class="btn btn-ghost">Falar com corretor</a>
              </div>
            </div>
            <div class="hero-thumbs" data-parallax="18">
              <img src="${thumb1}" alt="${item.name}" loading="eager" decoding="async">
              <img src="${thumb2}" alt="${item.name}" loading="eager" decoding="async">
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Eventos dos botões e imagens do Hero
    $$('.btn-hero-detail, .hero-thumbs img', heroSlides).forEach(elem => {
      elem.style.cursor = 'pointer';
      elem.addEventListener('click', () => {
        const slide = elem.closest('.hero-slide');
        const btn = slide ? slide.querySelector('.btn-hero-detail') : null;
        const id = btn ? btn.dataset.id : elem.dataset.id;
        const item = allEnterprises.find(p => p.id === id);
        if (item) openModal(item);
      });
    });

    // Reinicializa a navegação, setas (próximo/anterior) e dots do slider
    if (typeof window.initHeroSlider === 'function') {
      window.initHeroSlider();
    }
  }

  /**
   * Conecta os campos de busca aos imóveis do Supabase (Desktop & Mobile Modal)
   */
  function bindSearchFilters() {
    const desktopForm = $('#searchForm');
    const mobileForm = $('#mobileSearchForm');
    const searchModal = $('#searchModal');
    const openBtn = $('#btnOpenSearchModal');
    const closeBtn = $('#searchModalClose');
    const backdrop = $('#searchModalBackdrop');

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.classList.add('is-open');
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.classList.remove('is-open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openSearchModal);
    if (closeBtn) closeBtn.addEventListener('click', closeSearchModal);
    if (backdrop) backdrop.addEventListener('click', closeSearchModal);

    // Toggle de chips no form do modal mobile
    if (mobileForm) {
      $$('.chip', mobileForm).forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('is-active');
        });
      });
    }

    function applyFilter(targetForm) {
      if (!targetForm) return;

      const isMobile = targetForm.id === 'mobileSearchForm';
      const prefix = isMobile ? 'mf-' : 'f-';

      const statusVal = $(`#${prefix}finalidade`) ? $(`#${prefix}finalidade`).value : 'todos';
      const tipo = $(`#${prefix}tipo`) ? $(`#${prefix}tipo`).value : 'Todos os tipos';
      const cidade = $(`#${prefix}cidade`) ? $(`#${prefix}cidade`).value : 'Todas as regiões';
      const bairro = $(`#${prefix}bairro`) ? $(`#${prefix}bairro`).value.toLowerCase().trim() : '';
      const quartosVal = $(`#${prefix}quartos`) ? $(`#${prefix}quartos`).value : 'Qualquer';
      const banheirosVal = $(`#${prefix}banheiros`) ? $(`#${prefix}banheiros`).value : 'Qualquer';
      const minVal = $(`#${prefix}min`) ? parseFloat($(`#${prefix}min`).value.replace(/\D/g, '')) : 0;
      const maxVal = $(`#${prefix}max`) ? parseFloat($(`#${prefix}max`).value.replace(/\D/g, '')) : 0;

      const activeChips = $$('.chip.is-active', targetForm).map(c => c.dataset.chip);

      const filtered = allEnterprises.filter(item => {
        if (statusVal !== 'todos' && item.statusTab !== statusVal) return false;
        if (tipo !== 'Todos os tipos' && item.propertyType.toLowerCase() !== tipo.toLowerCase()) return false;
        if (cidade !== 'Todas as regiões') {
          const region = (item.region || '').toLowerCase();
          if (!region.includes(cidade.toLowerCase())) return false;
        }
        if (bairro.length > 0) {
          const textSearch = `${item.name} ${item.region} ${item.description}`.toLowerCase();
          if (!textSearch.includes(bairro)) return false;
        }
        if (quartosVal !== 'Qualquer') {
          const minQuartos = parseInt(quartosVal, 10);
          if (item.bedrooms > 0 && item.bedrooms < minQuartos) return false;
        }
        if (banheirosVal !== 'Qualquer') {
          const minBanhos = parseInt(banheirosVal, 10);
          if (item.bathrooms > 0 && item.bathrooms < minBanhos) return false;
        }
        if (minVal > 0 && item.price > 0 && item.price < minVal) return false;
        if (maxVal > 0 && item.price > 0 && item.price > maxVal) return false;

        if (activeChips.length > 0) {
          for (const chip of activeChips) {
            if (chip === 'permuta' && !item.acceptsExchange) return false;
            if ((chip === 'construcao' || chip === 'lancamento' || chip === 'prontos') && item.statusTab !== chip) return false;
          }
        }

        return true;
      });

      renderProperties(filtered);

      if (isMobile) closeSearchModal();

      const sectionEmp = $('#empreendimentos');
      if (sectionEmp) {
        sectionEmp.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
      }
    }

    if (desktopForm) {
      desktopForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilter(desktopForm);
      });
    }

    if (mobileForm) {
      mobileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilter(mobileForm);
      });
    }
  }

  /**
   * Inicializa o carregamento dos imóveis
   */
  async function init() {
    if (window.SupabaseService && typeof window.SupabaseService.fetchSupabaseEnterprises === 'function') {
      const data = await window.SupabaseService.fetchSupabaseEnterprises();
      if (data && data.length > 0) {
        allEnterprises = data;
        renderProperties(allEnterprises);
        updateHeroSlides(allEnterprises);
        bindSearchFilters();

        // Pré-carrega assincronamente as fotos de todos os empreendimentos em segundo plano
        setTimeout(() => {
          allEnterprises.forEach(item => {
            if (item.photos && Array.isArray(item.photos)) {
              item.photos.forEach(p => {
                if (p && typeof p === 'string' && p.startsWith('http')) {
                  const img = new Image();
                  img.src = p;
                }
              });
            }
          });
        }, 500);
      }
    }
  }

  // Inicia após o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



/* ------------------------------------------- Instagram: feed real -------- */
/* Se `assets/data/instagram.json` existir (gerado por
   execution/sync_instagram.py), troca as fotos de exemplo pelos posts reais.
   Sem o arquivo, não faz nada — o HTML já tem o fallback. */
(() => {
  const grid = document.getElementById('instagramGrid');
  if (!grid) return;

  const PERFIL = 'https://www.instagram.com/elosnegociosimobiliarios/';

  fetch('assets/data/instagram.json', { cache: 'no-cache' })
    .then(resposta => (resposta.ok ? resposta.json() : Promise.reject(resposta.status)))
    .then(feed => {
      const posts = (feed.posts || []).slice(0, 6);
      if (!posts.length) return;

      const perfil = feed.profileUrl || PERFIL;
      const fragmento = document.createDocumentFragment();

      posts.forEach(post => {
        // Montado com a API do DOM, não com innerHTML: a legenda vem do
        // Instagram e é conteúdo de terceiro.
        const link = document.createElement('a');
        link.className = 'insta-item';
        link.href = perfil;
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute(
          'aria-label',
          post.caption
            ? `Publicação no Instagram: ${post.caption}`
            : 'Ver o Instagram da Elos Imobiliária'
        );

        const img = document.createElement('img');
        img.src = post.image;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';

        const overlay = document.createElement('span');
        overlay.className = 'insta-overlay';
        overlay.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-instagram"/></svg>';

        link.append(img, overlay);
        fragmento.appendChild(link);
      });

      grid.replaceChildren(fragmento);
    })
    .catch(() => {
      /* Ainda não há feed sincronizado — segue com as fotos do HTML. */
    });
})();


/* ------------------------------------------- Quem Somos: Animação Baralho --- */
(() => {
  const stack = document.getElementById('aboutCardStack');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.about-card'));
  if (cards.length < 2) return;

  let activeIndex = 0;
  let isAnimating = false;
  let timer = null;

  function shuffle() {
    if (isAnimating) return;
    isAnimating = true;

    const topCard = cards[activeIndex];
    const nextIndex = (activeIndex + 1) % cards.length;
    const nextCard = cards[nextIndex];

    topCard.classList.add('is-shuffling');

    setTimeout(() => {
      topCard.classList.remove('is-top', 'is-shuffling');
      topCard.classList.add('is-back');

      nextCard.classList.remove('is-back');
      nextCard.classList.add('is-top');

      activeIndex = nextIndex;
      isAnimating = false;
    }, 700);
  }

  stack.addEventListener('click', () => {
    shuffle();
    restartTimer();
  });

  function startTimer() {
    if (REDUCED_MOTION) return;
    timer = setInterval(shuffle, 4500);
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    startTimer();
  }

  startTimer();

  stack.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  stack.addEventListener('mouseleave', () => { restartTimer(); });
})();

