---
name: elos-design-system
description: Design system e linguagem de movimento do site da Elos Imobiliária (BH/Contagem). Use sempre que for criar, alterar ou revisar qualquer tela, seção, componente, cor, tipografia ou animação do site — garante que tudo saia com a mesma paleta navy/teal/dourado, a mesma escala tipográfica fluida, as mesmas curvas de easing e os mesmos padrões de acessibilidade.
---

# Elos Imobiliária — Design System

Skill de marca e interface para o site institucional da **Elos Imobiliária**
(Belo Horizonte e Contagem - MG). Stack: HTML/CSS/JS puro, sem build step.

Este skill é a **Camada 1 (Diretiva)** visual do projeto: ele diz *o que* pode
ser feito. A implementação vive em `css/style.css` e `js/main.js`.

## Quando usar

Carregue este skill antes de:

- criar ou alterar qualquer seção da home ou de páginas internas;
- escolher uma cor, sombra, raio de borda, fonte ou espaçamento;
- adicionar qualquer animação, transição ou micro-interação;
- revisar um trecho de CSS/HTML pronto ("isso está no padrão da Elos?").

## Identidade

**Marca**: Elos Imobiliária
**Praça**: Belo Horizonte e Contagem - MG
**Promessa**: consultoria imobiliária de confiança — imóveis exclusivos,
avaliação justa, negociação facilitada.
**Tom de voz**: próximo, direto, adulto. Fala de *conquista* e *lar*, nunca de
"oportunidade imperdível". Sem gritaria promocional, sem caixa alta em frase
inteira, sem ponto de exclamação em série.

> Regra de conteúdo herdada da diretiva do projeto: **nunca replicar texto de
> concorrentes** (em especial Alpha Imóveis). Referências externas servem como
> inspiração de layout/efeito — o texto é sempre reescrito com ângulo próprio.

## Paleta — travada, não inventar cor nova

| Token | Hex | Uso |
| --- | --- | --- |
| `--navy-950` | `#0a1930` | Fundos escuros, footer, seções de destaque |
| `--navy-900` | `#0f2540` | Títulos, topo de gradientes escuros |
| `--navy-800` | `#123a5e` | Botão primário, preço, texto forte |
| `--navy-700` | `#1a4b78` | Estados intermediários |
| `--teal-600` | `#2c6e8e` | Ícones, eyebrow, hover primário |
| `--teal-500` | `#3a86ab` | Acento, bordas ativas, glow |
| `--teal-300` | `#7fb8d3` | Acento sobre fundo escuro, labels |
| `--gold-500` | `#b9975b` | **Acento premium**: tag de lançamento, estrelas, filetes |
| `--gray-50` | `#edefe9` | Fundo de seção alternada |
| `--gray-100` | `#e0e2dc` | Divisores, fundo sutil |
| `--gray-300` | `#cdcfc8` | Bordas, texto sobre navy |
| `--gray-600` | `#5b6774` | Texto de apoio |
| `--bg-ice` | `#f5f6f2` | Fundo gelo, seções claras |
| `--bg-ice-light` | `#f9faf7` | Fundo gelo mais claro |

> **Nota (2026-08-05):** a família de neutros deixou de ser cinza azulado e
> passou a ser **gelo levemente quente**, por decisão do cliente. O navy e o
> teal continuam frios de propósito — é esse contraste morno/frio que dá o ar
> caro. Não "corrigir" os neutros de volta para tons azulados.

Derivados permitidos (já definidos em `:root`): `--gold-300`, `--gold-700`,
`--teal-100`, `--teal-050`. **Qualquer outra cor precisa de aprovação.**

Exceções funcionais já aprovadas — não são cores de marca, são cores de sistema:

| Token | Hex | Por que existe |
| --- | --- | --- |
| `--green-500` | `#3f9d5b` | Tag "pronto para morar" |
| `--wa-green` | `#25d366` | Verde oficial do WhatsApp |
| `--avatar-green` | `#34804a` | Avatar de inicial, cliente sem foto no Google |
| `--avatar-purple` | `#7c4dab` | Avatar de inicial, cliente sem foto no Google |
| `--verified-blue` | `#3897f0` | Selo de avaliação verificada, 15px, ao lado do nome |

Os dois avatares imitam o padrão do próprio Google e só aparecem em círculo
de 42–46px com uma letra. Contraste com texto branco conferido: 4.85:1 e
5.99:1. **Não usar esses três em mais nada.**

### Regra do selo de verificado

O selo (`.verified-badge` + `#i-verified`) significa **"esta avaliação existe
e é verificável no Google"** — nunca "esta pessoa é uma conta verificada".
Por isso ele carrega sempre `role="img"` e
`aria-label="Avaliação verificada no Google"`.

Só pode aparecer ao lado do nome de alguém que realmente avaliou a Elos no
Google. **Nunca** ao lado de nome de corretor, de parceiro, de depoimento
coletado por outro canal ou de qualquer texto que a Elos tenha escrito. Um
selo de verificado em conteúdo não verificável é publicidade enganosa, e é o
tipo de detalhe que destrói exatamente a confiança que ele deveria construir.

### Regra do dourado

O dourado é **acento, nunca base**. Máximo ~5% da área visível de uma tela.
Usos legítimos: tag de lançamento, estrelas de avaliação, filete divisor,
número de destaque, borda de card premium. Nunca: fundo de seção, botão
primário, corpo de texto.

## Tipografia

- **Títulos**: Poppins (500/600/700/800)
- **Corpo**: Inter (400/500/600)
- Escala fluida via `clamp()` — tokens `--fs-display`, `--fs-h1`, `--fs-h2`,
  `--fs-h3`, `--fs-lead`, `--fs-body`, `--fs-sm`, `--fs-xs`.
- `line-height`: 1.08–1.15 em títulos grandes, 1.65 em corpo.
- Títulos grandes levam `letter-spacing:-.02em`; eyebrows levam `+.18em` com
  `text-transform:uppercase`.
- **Nunca** escrever tamanho em `px` cravado num título de seção — usar token.

## Espaçamento e forma

- Escala: `--sp-1` 4px → `--sp-14` 128px (múltiplos de 4).
- Padding vertical de seção: `--section-y` (fluido, 72px → 132px).
- Container: `max-width:1180px`, padding lateral 24px.
- Raios: `--r-sm` 8px · `--r-md` 14px · `--r-lg` 22px · `--r-xl` 32px · `--r-pill` 999px.
- Sombras: `--shadow-xs/sm/md/lg/xl` — todas em tom navy (`rgba(10,25,48,…)`),
  nunca preto puro. Glows: `--glow-teal`, `--glow-gold`.

## Linguagem de movimento

Movimento na Elos é **calmo e caro**: entra rápido, assenta devagar, nunca
quica de forma cômica. Nada pisca, nada gira em loop infinito pedindo atenção.

### Curvas

| Token | Valor | Uso |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | Padrão para entrada/revelação |
| `--ease-out-quart` | `cubic-bezier(.25,1,.5,1)` | Hover, transições curtas |
| `--ease-spring` | `cubic-bezier(.34,1.4,.64,1)` | Elementos que "assentam" (tags, badges) |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Crossfade, slides |

### Durações

`--dur-1` 180ms (hover) · `--dur-2` 320ms (estado) · `--dur-3` 620ms
(revelação) · `--dur-4` 900ms (hero, parallax).

### Padrões aprovados

1. **Reveal on scroll** — `data-reveal` no elemento. Entra de
   `opacity:0; translateY(28px); blur(6px)`. Stagger por
   `style="--reveal-delay:90ms"` ou `data-reveal-stagger` no container pai.
2. **Ken Burns** no fundo do hero: `scale(1) → scale(1.08)` em 12s, linear.
3. **Crossfade** de slides: opacidade + `scale(1.03→1)`, nunca `display:none`
   (quebra a transição).
4. **Magnetização tipo dock** (Corretores): cosseno sobre a distância do
   cursor, `requestAnimationFrame`. Só com `hover:hover` + `pointer:fine`.
5. **Borda que se desenha** (grid de 6 diferenciais): `<rect>` SVG com
   `stroke-dasharray`/`stroke-dashoffset`, dimensionado em **pixels reais** por
   card. Ver "Armadilhas conhecidas".
6. **Spotlight de cursor**: variáveis `--mx`/`--my` atualizadas no `mousemove`,
   consumidas por um `radial-gradient` numa pseudo-camada.
7. **Count-up** de números: só dispara quando o bloco entra na viewport, uma vez.
8. **Marquee** de parceiros: faixa duplicada com `translateX(-50%)` em loop,
   pausa no hover.
9. **Parallax**: no máximo 40px de deslocamento, sempre via `transform`.

### Proibido

- `transition:all` (usar propriedades nomeadas).
- Animar `top/left/width/height` — só `transform` e `opacity`.
- Animação em loop infinito que não seja decorativa e sutil.
- Duração acima de 1s em interação disparada por clique.
- Qualquer efeito sem fallback em `prefers-reduced-motion:reduce`.

## Acessibilidade — não negociável

1. Todo bloco de animação vai dentro de
   `@media (prefers-reduced-motion:no-preference)`, ou é neutralizado no bloco
   `reduce` no fim do CSS.
2. Contraste mínimo 4.5:1 em texto. Texto sobre foto **sempre** com overlay
   navy — nunca confiar só no `filter:brightness()`.
3. `:focus-visible` com anel `--teal-500` de 3px em tudo que é focável.
4. Ícone sem texto ao lado precisa de `aria-label`.
5. Carrossel navegável por teclado; modal fecha com `Esc` e devolve o foco.
6. Estado de aba/slide ativo nunca comunicado só por cor.

## Componentes canônicos

- `.btn` + `.btn-primary` (navy → teal no hover, com brilho que varre)
- `.btn-outline`, `.btn-ghost`, `.btn-gold`, `.btn-block`
- `.tag` (`.tag-launch` dourada · `.tag-construction` teal · `.tag-ready` verde)
- `.property-card` — mídia com zoom, scrim, tag, specs, preço, CTA
- `.glass-card` — vidro sobre fundo escuro (`backdrop-filter:blur(18px)`)
- `.eyebrow` / `.eyebrow-line` — rótulo de seção
- `.section-head` — eyebrow + h2 + subtítulo, centralizado
- `.stat-item` — número com count-up + rótulo
- `.cards-carousel` + `.carousel-arrow` — trilho com drag e snap

Antes de criar um componente novo, **procure um existente** para estender.

## Armadilhas conhecidas (bugs reais deste projeto)

- **Cache**: `index.html` referencia `css/style.css?v=N` e `js/main.js?v=N`.
  Editou um desses arquivos → **incremente o N**. Já gerou "bug fantasma" real.
- **`mask-composite` + `conic-gradient`** para borda animada vaza um leque
  diagonal para fora do card. Não usar — usar `<rect>` SVG.
- **`pathLength="100"` em `<rect>`** não normaliza o traço neste Chromium.
  Calcular o comprimento real com `rect.getTotalLength()`.
- **`vector-effect:non-scaling-stroke`** sob `viewBox` esticado produz traço
  parcial permanente. Dimensionar o SVG em pixels reais.
- **`position:fixed` empilha acima de irmão sem posicionamento**, mesmo vindo
  antes no DOM — o toggle do menu mobile precisa de `position:relative;z-index`.
- **`<iframe>` do Google Maps** retorna `net::ERR_ABORTED` em headless. O
  layout reserva altura; validar em navegador real.

## Breakpoints

`1180px` (container) · `1024px` (grids de 3→2) · `900px` (2→1, hero empilha)
· `760px` (grids densos) · `560px` (mobile pequeno).
Mobile-first no comportamento, mesmo com o CSS escrito desktop-first.

## Checklist antes de entregar

1. Só tokens da paleta — nenhum hex solto no CSS.
2. Tamanhos de fonte via token fluido.
3. Toda animação tem contrapartida em `prefers-reduced-motion`.
4. Contraste conferido em texto sobre imagem.
5. `:focus-visible` visível em todo elemento interativo.
6. Testado em 1440 / 1024 / 768 / 390px.
7. `?v=N` incrementado em `index.html`.
8. Diretiva `directives/site_elos.md` atualizada com o que mudou.

## Scripts

- `validate_design.py` — varre o CSS/HTML e aponta hex fora da paleta, uso de
  `transition:all`, animação sem bloco `prefers-reduced-motion` e `?v=` não
  incrementado. Rodar: `python .claude/skills/elos-design-system/validate_design.py`

## Referências

- `REFERENCE.md` — tabela completa de tokens, receitas de CSS prontas para
  colar e a anatomia de cada componente.
