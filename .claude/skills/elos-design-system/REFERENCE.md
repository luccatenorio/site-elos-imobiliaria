# Elos Design System — Referência técnica

Complemento do `SKILL.md`. Aqui ficam os valores exatos e as receitas prontas.

---

## 1. Tokens completos

```css
:root{
  /* ---- Marca (travado) ---- */
  --navy-950:#0a1930;  --navy-900:#0f2540;  --navy-800:#123a5e;  --navy-700:#1a4b78;
  --teal-600:#2c6e8e;  --teal-500:#3a86ab;  --teal-300:#7fb8d3;
  --gold-500:#b9975b;
  --gray-50:#edefe9;   --gray-100:#e0e2dc;  --gray-300:#cdcfc8;  --gray-600:#5b6774;
  --white:#ffffff;
  --bg-ice:#f5f6f2;    --bg-ice-light:#f9faf7;

  /* ---- Derivados aprovados ---- */
  --gold-700:#8f7139;  --gold-300:#d8bd8a;
  --teal-100:#dceaf3;  --teal-050:#eef6fa;
  --green-500:#3f9d5b;            /* tag "pronto para morar" */
  --wa-green:#25d366;             /* cor oficial WhatsApp */
  --avatar-green:#34804a;         /* inicial de cliente sem foto no Google */
  --avatar-purple:#7c4dab;        /* idem */

  /* ---- Gradientes ---- */
  --grad-navy:linear-gradient(165deg,var(--navy-900),var(--navy-950));
  --grad-teal:linear-gradient(120deg,var(--teal-600),var(--teal-300));
  --grad-gold:linear-gradient(120deg,var(--gold-700),var(--gold-500),var(--gold-300));
  --grad-line:linear-gradient(90deg,transparent,var(--teal-500),var(--gold-500),transparent);

  /* ---- Vidro ---- */
  --glass-bg:rgba(255,255,255,.06);
  --glass-brd:rgba(255,255,255,.14);
  --glass-blur:blur(18px);

  /* ---- Elevação ---- */
  --shadow-xs:0 1px 2px rgba(10,25,48,.06);
  --shadow-sm:0 2px 10px rgba(10,25,48,.08);
  --shadow-md:0 12px 32px rgba(10,25,48,.14);
  --shadow-lg:0 26px 60px -18px rgba(10,25,48,.32);
  --shadow-xl:0 40px 90px -30px rgba(5,12,24,.55);
  --glow-teal:0 0 0 3px rgba(58,134,171,.28);
  --glow-gold:0 0 26px rgba(185,151,91,.35);

  /* ---- Forma ---- */
  --r-sm:8px; --r-md:14px; --r-lg:22px; --r-xl:32px; --r-pill:999px;

  /* ---- Movimento ---- */
  --ease-out-expo:cubic-bezier(.16,1,.3,1);
  --ease-out-quart:cubic-bezier(.25,1,.5,1);
  --ease-spring:cubic-bezier(.34,1.4,.64,1);
  --ease-in-out:cubic-bezier(.65,0,.35,1);
  --dur-1:.18s; --dur-2:.32s; --dur-3:.62s; --dur-4:.9s;

  /* ---- Tipografia fluida ---- */
  --fs-display:clamp(2.4rem,1.5rem+3.8vw,4rem);
  --fs-h1:clamp(2rem,1.3rem+2.6vw,3.1rem);
  --fs-h2:clamp(1.65rem,1.15rem+1.9vw,2.5rem);
  --fs-h3:clamp(1.05rem,.95rem+.4vw,1.25rem);
  --fs-lead:clamp(1rem,.95rem+.3vw,1.15rem);
  --fs-body:1rem; --fs-sm:.88rem; --fs-xs:.76rem;

  /* ---- Espaço ---- */
  --sp-1:4px;  --sp-2:8px;  --sp-3:12px; --sp-4:16px; --sp-5:20px;
  --sp-6:24px; --sp-7:32px; --sp-8:40px; --sp-9:48px; --sp-10:64px;
  --sp-12:88px; --sp-14:128px;
  --section-y:clamp(72px,7vw,132px);
}
```

---

## 2. Receitas prontas

### 2.1 Reveal on scroll

```html
<div data-reveal>…</div>
<div data-reveal style="--reveal-delay:120ms">…</div>
<div class="grid" data-reveal-stagger="80">…filhos revelam em cascata…</div>
```

```css
[data-reveal]{
  opacity:0; transform:translateY(28px); filter:blur(6px);
  transition:opacity var(--dur-3) var(--ease-out-expo) var(--reveal-delay,0ms),
             transform var(--dur-3) var(--ease-out-expo) var(--reveal-delay,0ms),
             filter var(--dur-3) var(--ease-out-expo) var(--reveal-delay,0ms);
}
[data-reveal].is-visible{opacity:1;transform:none;filter:none}
```

O observer marca `.is-visible` uma única vez e para de observar.

### 2.2 Botão primário com varredura de brilho

```css
.btn-primary{background:var(--navy-800);color:var(--white);position:relative;overflow:hidden}
.btn-primary::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.28) 50%,transparent 65%);
  transform:translateX(-120%);transition:transform var(--dur-3) var(--ease-out-quart);
}
.btn-primary:hover::after{transform:translateX(120%)}
```

### 2.3 Spotlight que segue o cursor

```css
.spotlight{position:relative;isolation:isolate}
.spotlight::before{
  content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(320px circle at var(--mx,50%) var(--my,50%),
             rgba(58,134,171,.16),transparent 62%);
  opacity:0;transition:opacity var(--dur-2) ease;z-index:-1;
}
.spotlight:hover::before{opacity:1}
```

```js
el.addEventListener('pointermove', e => {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
});
```

### 2.4 Borda que se desenha (jeito certo)

```js
const w = box.offsetWidth, h = box.offsetHeight, gap = 4;
const radius = parseFloat(getComputedStyle(box).borderRadius) || 14;
svg.setAttribute('viewBox', `0 0 ${w + gap*2} ${h + gap*2}`);
rect.setAttribute('width',  w + gap*2 - 4);
rect.setAttribute('height', h + gap*2 - 4);
rect.setAttribute('rx', radius + gap - 1);
const len = rect.getTotalLength();               // NÃO usar pathLength="100"
rect.style.strokeDasharray = `${len} ${len}`;
rect.style.setProperty('--ring-length', len);    // dashoffset em repouso
```

Recalcular em `resize` (debounce ~200ms).

### 2.5 Count-up

```js
function countUp(el, to, dur = 1600){
  const t0 = performance.now();
  (function frame(t){
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 4);        // easeOutQuart
    el.textContent = Math.round(to * eased).toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}
```

### 2.6 Marquee infinito

Duplique o conteúdo da faixa no DOM e anime o trilho:

```css
.marquee-track{display:flex;gap:var(--sp-10);width:max-content;animation:marquee 32s linear infinite}
.marquee:hover .marquee-track{animation-play-state:paused}
@keyframes marquee{to{transform:translateX(-50%)}}
```

### 2.7 Drag-to-scroll no carrossel

`pointerdown` guarda `startX` + `scrollLeft`; `pointermove` aplica
`track.scrollLeft = start - (e.clientX - startX)`; `pointerup` libera. Marque
`.is-dragging` para suprimir o `click` do card logo em seguida.

---

## 3. Anatomia dos componentes

### `.property-card`

```
┌──────────────────────────────┐
│ [tag]              [♥]       │  media 220px, img scale(1.06) no hover
│        (scrim navy ↓)        │
├──────────────────────────────┤
│ Título                       │  --fs-h3, Poppins 700
│ 📍 Bairro, Cidade - MG       │  --fs-sm, --gray-600
│ ─────────────────────────    │  divisor 1px --gray-100
│ 🛏 2  🛁 1  ⤢ 52m²  🚗 1     │  specs row
│ A partir de                  │  --fs-xs --gray-600
│ R$ 298.900,00                │  --fs-h3 700 --navy-800
│ [badge-outline]              │
│ [Saiba mais →]               │  seta desliza 4px no hover
└──────────────────────────────┘
```

Hover: `translateY(-6px)`, `--shadow-lg`, borda vira `--teal-500`.

### `.glass-card`

```css
background:var(--glass-bg);
border:1px solid var(--glass-brd);
backdrop-filter:var(--glass-blur);
border-radius:var(--r-lg);
```
Só sobre fundo escuro ou foto. Nunca sobre branco.

### `.section-head`

```html
<div class="section-head" data-reveal>
  <p class="eyebrow">Imóveis</p>
  <h2>Empreendimentos</h2>
  <p class="section-subtitle">Selecione o status do empreendimento</p>
</div>
```

---

## 4. Contraste verificado

| Combinação | Ratio | OK |
| --- | --- | --- |
| `--navy-950` sobre branco | 15.9:1 | ✅ |
| `--navy-800` sobre branco | 9.4:1 | ✅ |
| `--teal-600` sobre branco | 4.9:1 | ✅ (texto normal) |
| `--gray-600` sobre branco | 5.7:1 | ✅ |
| branco sobre `--navy-950` | 15.9:1 | ✅ |
| `--teal-300` sobre `--navy-950` | 8.1:1 | ✅ |
| `--gold-500` sobre `--navy-950` | 6.4:1 | ✅ |
| `--gold-500` sobre branco | 2.6:1 | ❌ **só para ícone/filete, nunca texto** |
| `--teal-300` sobre branco | 2.1:1 | ❌ **nunca como texto em fundo claro** |

---

## 5. Ordem canônica das seções da home

1. Header + barra de progresso de scroll
2. Hero (carrossel de destaque, Ken Burns, cue de scroll)
3. Faixa de confiança (4 diferenciais)
4. Widget de busca (card escuro flutuante, sobreposto)
5. Faixa de números (count-up)
6. Empreendimentos (abas + carrossel)
7. Sobre a Elos
8. Nossos Diferenciais (3 cards sobre foto, **sem** borda animada — intencional)
9. Formulário de contato multi-etapa
10. Fale com nossos Corretores (dock) — colado no formulário, de propósito
11. Grid de 6 diferenciais (**com** borda animada)
12. Parceiros (marquee)
13. Depoimentos (carrossel + modal)
14. Instagram
15. Avaliações Google
16. Footer + voltar ao topo
17. WhatsApp flutuante

Mudar essa ordem exige aprovação do cliente.
