# Diretiva: Site institucional Elos Imobiliária

## Objetivo
Criar um site institucional para a Elos Imobiliária (Belo Horizonte/Contagem - MG),
usando como referência de **estrutura e funcionalidades** o site da Alpha Imóveis
(mais completo, com carrossel de destaque, busca por filtros, seções de
empreendimentos, depoimentos, redes sociais, avaliações do Google etc.), mas
aplicando a **identidade visual da Elos** (logo, paleta de cores, tom de voz)
extraída do site atual dela.

## Entradas
- Referências visuais fornecidas pelo usuário via chat (não versionadas em arquivo):
  inspiração da Alpha Imóveis, prints do site atual da Elos, referência de logo,
  referência de efeito "macOS dock" (Corretores), referência de "border draw on
  hover" (Habib Consultancy, cards Nossos Diferenciais), foto de prédio para o
  fundo da seção Nossos Diferenciais.
- Sem acesso a arquivos de marca originais (logo em alta resolução, guia de estilo).
  O usuário colou uma imagem do logo oficial diretamente no chat — **não há como
  extrair esse arquivo para o projeto** (imagens coladas em chat não viram arquivo
  acessível às ferramentas). O logo atual (`assets/img/logo-elos.svg` e
  `logo-elos-white.svg`) é uma **recriação vetorial aproximada**. Se o cliente
  puder enviar o arquivo oficial (PNG/SVG) por um caminho de arquivo real, trocar
  pelo original.
- Sem dados reais de imóveis ainda — home construída com **conteúdo placeholder**
  (imagens via picsum.photos/pravatar, textos de exemplo). Trocar por dados reais
  assim que o cliente disponibilizar planilha/CRM.

## Decisões tomadas com o usuário (2026-07-28)
- Stack: **HTML/CSS/JS puro** (sem framework/build step). Fácil de hospedar em qualquer lugar.
- Assets de marca: recriar a partir do print (logo em SVG, paleta em hex aproximada).
- Dados de imóveis: placeholder por enquanto.
- **Nunca usar frase que a concorrência já usa.** Em 2026-08-05 o eyebrow da
  seção do Instagram era "Fique por dentro" e o cliente pediu troca porque uma
  imobiliária rival usa exatamente essa frase. Virou **"Nosso dia a dia"**.
  Antes de escrever qualquer eyebrow/headline novo, checar se não é frase
  batida do mercado imobiliário de BH.
- Conteúdo institucional (seções "diferenciais") **não deve replicar o texto da
  Alpha Imóveis verbatim** — o usuário está preocupado com semelhança excessiva
  com a concorrente do mesmo estado. Sempre reescrever títulos/textos com ângulo
  próprio, mesmo quando o usuário manda um print da Alpha como referência de
  **layout/efeito** (ver seção "Nossos Diferenciais" abaixo).

## Paleta extraída do site atual da Elos
- Navy escuro (fundo header/footer/seções destaque): `#0a1930`
- Navy médio (títulos, botões primários): `#123a5e`
- Teal/azul petróleo (ícones, acentos, hover): `#2c6e8e`
- Dourado/khaki (detalhe do bloco "Quem somos"): `#b9975b`
- Cinza claro (fundo de seções alternadas): `#f5f7fa`
- Texto corpo: `#5b6774`

## Stack de execução
- Site estático servido via `npm run dev` (script em `package.json`, usa o pacote
  `serve`) em `http://localhost:3000`. `npm install` já rodado (`node_modules`
  presente, ignorado no git).
- **Cache-busting manual**: `index.html` referencia `css/style.css?v=N` e
  `js/main.js?v=N`. Sempre que editar `style.css` ou `main.js`, **incrementar o
  `N` em ambos os links no `index.html`**, senão o navegador do cliente pode
  continuar servindo a versão antiga do cache (isso já gerou confusão real numa
  sessão — o cliente reportou "bug" que na verdade era cache velho).
  Versão atual: `style.css?v=22` e `main.js?v=12`. O `validate_design.py`
  acusa erro se um dos arquivos mudar sem o `N` subir.
- Sem git inicializado no projeto ainda.

## Estrutura de arquivos do site
```
index.html             # Home (single page)
css/style.css           # Design system + todos os estilos
js/main.js               # Interações: carrossel, tabs, menu mobile, dropdown,
                          # form multi-etapa, efeito dock (Corretores), modal de
                          # depoimento, anel de borda animado (highlights)
assets/img/logo-elos.svg        # logo navy (fundo claro)
assets/img/logo-elos-white.svg  # logo branco (fundo escuro)
package.json / node_modules      # apenas o pacote `serve` p/ dev local
directives/site_elos.md          # este arquivo
```
Imagens placeholder: `picsum.photos` (imóveis/interiores/instagram) e
`i.pravatar.cc` (avatares). Uma imagem real já está em uso: foto de prédio do
cliente (`https://i.ibb.co/7JgDg1Bj/predio-02.jpg`) como fundo da seção
"Nossos Diferenciais".

## Estrutura atual da home (ordem das seções, 2026-07-28 fim do dia)
1. Topbar (telefone/e-mail/redes)
2. Header/nav (logo + menu + CTA "Faça sua Simulação")
3. Hero com carrossel de imóvel em destaque
4. Faixa de diferenciais (4 ícones, fundo branco — "Imóveis exclusivos",
   "Consultoria de confiança", "Avaliação justa e transparente",
   "Negociação facilitada")
5. Widget de busca por filtros (card escuro flutuante)
6. Empreendimentos (abas + carrossel de cards)
7. Sobre a Elos (texto + foto)
8. **Nossos Diferenciais** (3 cards sobre foto de prédio real, fundo escuro,
   ícones em selo claro — SEM efeito de borda animada, é intencional)
9. Formulário de contato multi-etapa
10. **Fale com nossos Corretores** (5 cards, fundo branco, efeito de
    magnetização estilo dock no hover) — posicionado logo abaixo do formulário
    de contato, propositalmente colado nele (baixo espaçamento entre as duas
    seções)
11. Grid de 6 diferenciais institucionais ("Nossa História", "Curadoria de
    Imóveis", "Suporte em Cada Etapa", "Conquistas Reais", "Segurança Jurídica",
    "Oportunidades de Investimento") — COM efeito de borda animada no hover
12. Faixa de parceiros/construtoras (placeholder)
13. Depoimentos (5 cards em carrossel, tilt no hover, clique abre modal)
14. Bloco Instagram
15. Avaliações Google
16. Footer completo (menu, busca por cidade, contato, mapa, redes sociais)

## Efeitos de interação implementados
- **Corretores (5 cards)**: magnetização estilo dock do macOS — o card mais
  próximo do cursor cresce suavemente, com os vizinhos acompanhando em degradê,
  via `requestAnimationFrame` (fórmula do cosseno). Só ativa em dispositivos com
  `hover:hover` + `pointer:fine`.
- **Grid de 6 diferenciais (Nossa História etc.)**: borda que se "desenha" ao
  redor do card inteiro no hover (`stroke-dashoffset` de um `<rect>` SVG
  injetado via JS), começando do topo e fechando nos 4 lados, ficando completa
  e estável enquanto o mouse permanece — sem loop. Some suavemente ao sair.
  **Importante**: o SVG do anel é dimensionado em **pixels reais** por card
  (medido via `getBoundingClientRect`/`offsetWidth`/`offsetHeight` em JS, não em
  viewBox normalizado tipo "0 0 100 100"), porque um viewBox genérico esticado
  de forma não uniforme (`preserveAspectRatio="none"`) distorce os cantos
  arredondados e faz a borda "vazar" para fora do card. Recalcula no resize.
  Função: `buildHighlightRings()` em `main.js`.
- **Nossos Diferenciais (3 cards)**: **sem** esse efeito de borda — removido a
  pedido do cliente (achou que não combinava e que os cards já eram imponentes
  sozinhos). A função `buildHighlightRings()` seleciona
  `.highlight-box:not(.diff-card)` propositalmente para excluir esses 3 cards.
- **Depoimentos**: carrossel horizontal com setas (reaproveita o padrão de
  `.cards-carousel`/`.carousel-arrow` já usado em Empreendimentos), tilt 3D leve
  no hover (`transform:perspective(...) rotateX/rotateY/rotate/scale`, via CSS
  puro), clique no card abre modal com texto completo (fecha por X, clique fora
  ou Esc).
- **WhatsApp**: ícone é o logotipo real da marca (path SVG oficial), não um
  ícone genérico de balão de chat. Usado no botão flutuante e no topbar.

## Aprendizados / edge cases (bugs reais encontrados e corrigidos)
- Menu mobile: o botão de fechar (hambúrguer) ficava atrás do próprio `<nav>`
  porque um elemento `position:fixed` com `z-index` sempre empilha acima de um
  irmão sem posicionamento, mesmo estando depois no DOM. Corrigido com
  `position:relative;z-index` explícito no `.mobile-toggle`.
- Topbar quebrava feio em telas <600px — corrigido empilhando o bloco de
  contato em coluna nesse breakpoint.
- Setas do carrossel do hero ficavam por cima do texto em telas <560px —
  reposicionadas para o canto superior direito nesse breakpoint.
- `<iframe>` do Google Maps no rodapé retorna `net::ERR_ABORTED` em ambiente de
  teste headless (provável bloqueio de consentimento do Google sem cookies de
  sessão). Layout não quebra (altura reservada), mas confirmar num navegador
  real; se persistir em produção, trocar por link estático "Ver no Google Maps".
- **Bug de máscara CSS (`mask-composite`)**: uma primeira tentativa de "borda
  animada" usando `conic-gradient` + `mask` vazava um leque diagonal enorme para
  fora do card. A técnica de mask com `padding` + `content-box`/`mask-composite`
  não é confiável o suficiente neste ambiente — abandonada em favor de um
  `<rect>` SVG com `stroke-dasharray`/`stroke-dashoffset`.
- **Bug do `pathLength` em `<rect>`**: usar o atributo `pathLength="100"` para
  normalizar `stroke-dasharray`/`stroke-dashoffset` não funcionou como esperado
  neste Chromium — deixava sempre um trecho fixo do traço visível mesmo em
  repouso. Resolvido calculando o comprimento real via `rect.getTotalLength()`
  em JS (sem depender de `pathLength`).
- **Bug do `vector-effect:non-scaling-stroke`**: sob escala não uniforme (viewBox
  esticado com `preserveAspectRatio="none"`), essa propriedade produzia um traço
  parcial incorreto e sempre visível, mesmo com o dashoffset "certo" matematicamente.
  Removida — e depois o problema de fundo (viewBox não uniforme) foi
  resolvido dimensionando o SVG em pixels reais por card (ver seção de efeitos acima).
- **Contadores animando antes da hora no celular (2026-08-05)**: a faixa de
  números usava `IntersectionObserver`. No celular a página **nasce curta** —
  imagens ainda não carregaram e os empreendimentos ainda estão vindo do
  Supabase — então a faixa cai dentro da primeira tela, o observer dispara de
  imediato e, quando a pessoa rola até lá, a contagem já terminou. No desktop
  não aparecia porque a página nasce alta o bastante.
  Corrigido trocando o observer por **checagem de posição real a cada scroll**
  (`getBoundingClientRect` contra o layout do momento, com rAF): se o bloco se
  mover porque o conteúdo carregou, a checagem seguinte pega a posição nova.
  Cada número roda uma vez só; ao acabar, os listeners se removem.
  **Lição geral**: `IntersectionObserver` é traiçoeiro em página cujo layout
  cresce depois do primeiro paint. Para efeitos que o usuário precisa *ver
  acontecer*, conferir a posição no momento do scroll.
  Validado por CDP em viewport 390×780: no topo os números ficam em
  `0+ | +0 anos | 0/5` e só começam a contar ao rolar até a seção.
- **Cache do navegador**: sem query string de versão nos links de `css`/`js`, o
  cliente via versões antigas do site mesmo após eu corrigir bugs — parecia
  "bug que não sai", mas era só cache. Solução: query string `?v=N` incrementada
  a cada edição relevante desses dois arquivos (ver seção "Stack de execução").
- picsum.photos/pravatar/i.ibb.co carregam normalmente no ambiente de teste
  (sem bloqueio de rede para CDNs externas).

## Próximos passos (não incluídos ainda)
- **Logo oficial**: cliente enviou uma imagem de referência colada no chat: não
  foi possível extrair o arquivo. Se ele puder anexar o arquivo real (PNG/SVG)
  de um jeito que vire um caminho de arquivo acessível, trocar
  `assets/img/logo-elos.svg` / `logo-elos-white.svg` pelo original.
- Páginas internas: listagem de imóveis com filtros reais, página de imóvel
  individual, Quem Somos, Blog, Contato, Anuncie seu imóvel.
- Trocar imagens/textos placeholder pelos dados reais do cliente (imóveis,
  depoimentos adicionais, parceiros/construtoras reais).
- Conectar formulário de contato a um backend real (hoje é só front-end).
- Avaliar necessidade de CMS/painel administrativo para a imobiliária editar
  imóveis sozinha — decidir com o cliente.
- Considerar inicializar git no projeto para versionamento (ainda não feito).
- **Números da faixa de estatísticas** (`.section-stats`), atualizado 2026-08-05:
  - São **3 números**, não 4 (o cliente cortou "150+ imóveis no portfólio"
    em 2026-08-05 por não ter o dado). O grid é `repeat(3,1fr)` e empilha em
    coluna única abaixo de 760px, com o divisor virando linha horizontal.
  - ✅ **250+ Famílias realizaram o sonho** — confirmado pelo cliente
    (250+ vendas). Rótulo definido pelo cliente em 2026-08-05; lê-se como
    frase completa junto com o número. Não encurtar para "famílias felizes"
    nem "famílias atendidas" sem falar com ele.
  - ✅ **2 anos de mercado em BH** — confirmado pelo cliente (era 12 no
    placeholder inicial; a Elos é uma imobiliária nova).
  - ⏳ **150+ imóveis no portfólio** — ainda placeholder.
  - ✅ **18 avaliações no Google** — confirmado pelo cliente (era 21 no
    placeholder). Aparece na seção `.section-google`.
  - ⏳ **5,0/5 no Google** (faixa de números e selo do "Sobre") — ainda
    placeholder; conferir a nota real no perfil.
  Não publicar os pendentes sem aval: são afirmações públicas sobre o negócio
  do cliente. O comentário no HTML marca o que falta.
- ✅ **Depoimentos reais aplicados (2026-08-05)**: 9 avaliações reais do perfil
  da Elos no Google substituíram todo o conteúdo placeholder.
  - **Carrossel de Depoimentos (6)**: claudiaheringer da silva (Local Guide),
    Paty Rabelo, Luiz Eduardo, Pedro Santos, Claudia Landa, Barbara Castro.
  - **Bloco Avaliações do Google (3)**: Victor Hugo, Karolyne Adriana,
    Ronaldo Silva.
  - **Textos são verbatim** — não reescrever, não corrigir gramática, não
    "melhorar" a fala de cliente real. Dois deles (claudiaheringer e Luiz
    Eduardo) vieram truncados com "..." do "ver mais" do Google; se o cliente
    conseguir o texto completo, substituir.
  - **Nenhum tem localização** — o subtítulo do autor virou "Avaliação no
    Google" em vez de cidade. Não inventar cidade.
  - **Todos com 5 estrelas** — inferido do tom dos textos, o cliente não
    informou nota individual. Conferir no perfil se algum for 4.
  - **Fotos** baixadas do CDN do Google para `assets/img/depoimentos/*.png`
    (7 arquivos). Baixadas de propósito: as URLs `lh3.googleusercontent.com`
    mudam e expiram, hotlink quebraria o site com o tempo.
  - **Victor Hugo e Ronaldo Silva não têm foto** no Google → avatar de inicial
    colorido (`.avatar-initial` + `.avatar-green` / `.avatar-purple`),
    imitando o padrão do próprio Google. Cores adicionadas ao design system
    como exceção documentada.
  - O modal de depoimento agora tolera autor sem foto (esconde o `<img>`).
  - **Selo de verificado** (azul, estilo Instagram) ao lado de cada nome, nos
    dois blocos e no modal. Símbolo `#i-verified` + `.verified-badge`.
    **O selo afirma que a AVALIAÇÃO é verificável no Google, não que a PESSOA
    é uma conta verificada** — por isso o `aria-label` é
    "Avaliação verificada no Google". Nunca colocar esse selo em depoimento
    coletado por outro canal, em nome de corretor ou em texto escrito pela
    Elos: aí vira propaganda enganosa. Regra registrada no `SKILL.md`.
  - **"Com base em 18 avaliações no Google"** — número informado pelo cliente
    em 2026-08-05. Muda sozinho conforme entram avaliações novas; reconferir
    de tempos em tempos.
  - **LGPD**: são pessoas reais identificáveis por nome e rosto. Avaliação
    pública no Google é uma coisa; virar peça publicitária no site é outra.
    Confirmar com a Elos que existe o ok dessas pessoas antes de publicar.

## Ajustes pedidos pelo cliente por WhatsApp (2026-08-06)

- **Endereço de BH** trocado para **Rua Pedra Bonita, 703 - Prado, Belo
  Horizonte - MG** (era Av. Sebastião de Brito, Dona Clara). ⚠️ **Confirmar:**
  o cliente escreveu "esse endereço" no singular. Assumi que substitui o de
  BH, porque Prado é bairro de BH — o endereço de **Contagem foi mantido**. Se
  a intenção era virar endereço único, remover o de Contagem.
- **Telefone único: (31) 99249-7076.** Substituiu os dois do rodapé
  ((31) 9.8499-6144 e (31) 9.8786-7076) e o do menu mobile
  ((31) 9.7547-2244). Todos os `wa.me` apontavam para `5531975472244` e
  passaram para **`5531992497076`** — 3 links.
- **Item "WhatsApp" no menu**, com ícone e em verde da marca (`--wa-green`),
  abrindo conversa direta em nova aba.
- **Nova seção "Trabalhe Conosco"** (`#trabalhe`), antes do CTA final, com
  item no menu do topo e no rodapé. Três diferenciais + CTA para WhatsApp com
  mensagem pré-preenchida sobre vagas. Foto é **placeholder** — trocar por uma
  foto real da equipe. **Não usar foto de cliente/depoimento ali**: são
  pessoas reais que não consentiram em virar imagem de recrutamento.
- **Menu subiu para 6 itens** e passou a disputar espaço com o logo e o CTA.
  Corrigido com `white-space:nowrap` nos links, gap de 32px→24px e o
  breakpoint do menu mobile de **1024px → 1150px**. Esse valor está
  duplicado em `style.css` e em `main.js` (toque no dropdown) — mudou num,
  muda no outro.

### Página Trabalhe Conosco (2026-08-06)
O cliente pediu que virasse **rota própria**, não seção da home. A seção que
eu tinha criado em `#trabalhe` foi **removida da rolagem principal**.

- **`trabalhe-conosco.html`** — página completa, com header/footer próprios e
  o mesmo `style.css`. Links do menu apontam para ela (topo e rodapé).
- **`js/trabalhe.js`** — script próprio, **não usa o `main.js`**: aquele carrega
  hero, carrosséis e a integração Supabase, que não existem nesta página.
  Duplica só o essencial (menu mobile, header no scroll, reveal, voltar ao topo).
- **Formulário de candidatura** com: nome, e-mail, WhatsApp (com máscara),
  idade, cidade, CRECI, experiência, disponibilidade, veículo, texto livre e
  link de perfil. Obrigatórios validados: nome (2 palavras), e-mail, telefone
  (10+ dígitos), idade (16–90), cidade, texto (20+ caracteres).
- **Envio sem backend**: monta uma mensagem formatada e abre o `wa.me` do RH
  já preenchido. Tem link de resgate na tela de sucesso porque bloqueador de
  pop-up pode barrar o `window.open`.
  **Próximo passo natural**: gravar em uma tabela `candidates` no Supabase em
  vez de (ou além de) mandar por WhatsApp — hoje candidato e comprador não se
  misturam porque são canais diferentes, mas nada fica registrado.
- Número do RH fica em `WHATSAPP_RH`, no topo do `trabalhe.js`.
- Testado por CDP: envio vazio barra com 6 erros, e-mail inválido barra,
  preenchido gera a URL com todos os campos e a máscara aplicada.

### Pendente deste lote
- **"E aparecer para o cliente fazer aquele cadastro fraga"** — não implementado,
  pedido ambíguo. Perguntar ao cliente se ele quer um pop-up/modal de captura
  de lead ou só mais destaque para o formulário que já existe.
- Foto real da equipe (a seção da home saiu, mas se voltar a ter foto, não
  usar rosto de cliente/depoimento).

### ⚠️ Nunca usar PowerShell para editar HTML/CSS/JS deste projeto
`Get-Content -Raw | Set-Content -Encoding utf8` no PowerShell 5.1 **corrompe a
acentuação**: lê o arquivo UTF-8 como ANSI e regrava com dupla codificação
("Imobiliária" vira "ImobiliÃ¡ria"). Aconteceu de verdade em 2026-08-06 no
`trabalhe-conosco.html` e o arquivo teve que ser reescrito inteiro.
Usar as ferramentas de edição do agente ou Node (`fs.readFileSync(f,'utf8')`).
Conferência rápida: `node -e "..."` procurando por `/Ã[-¿]/`.

## Header translúcido sobre o hero (2026-08-16)

Pedido do cliente: "não quero ela branca, quero meio transparente".

Antes o header era `position:sticky` — ele **ocupava espaço** e o hero começava
abaixo dele. Deixar transparente naquele arranjo não mostrava nada: atrás da
barra só existia o fundo branco da página. Por isso a barra **passou a flutuar
sobre o hero** (`position:fixed`).

### Os dois estados
| | Topo | Rolado (`.is-scrolled`, y > 60) |
| --- | --- | --- |
| Fundo | Transparente + véu navy que se dissolve | `rgba(bg-ice,.72)` + `blur(22px)` |
| Texto | Branco, hover teal-300 | Navy, hover teal-600 |
| Logo | `logo-elos-footer-white.png` | `logo-elos-header.png` |
| Dropdown | Vidro navy escuro | Branco |

O logo colorido é navy — sobre a foto escura do hero ele sumiria. Por isso os
**dois logos ficam empilhados** no `.logo` e fazem crossfade por opacidade
(`.logo-dark` / `.logo-light`). Os dois arquivos têm proporção praticamente
idêntica (1.155 vs 1.156), então sobrepõem sem tremer.

### `--header-h`
O header flutua, então o hero precisa reservar a altura dele ou o conteúdo
nasce escondido atrás da barra. `main.js` e `trabalhe.js` medem o header e
publicam `--header-h` em `:root`. **Medem só no estado do topo** (`scrollY <=
15`): quando rola, o logo encolhe e o header diminui — atualizar sempre faria
o hero pular durante a rolagem. Consumido por `.hero-content` e `.careers-hero`.

### Três armadilhas que apareceram no caminho
1. **Emenda de 1px atravessando a foto.** O degradê do véu terminava na borda
   da caixa do header, e o limite do `backdrop-filter` criava uma linha
   visível. Resolvido movendo o véu para `.site-header::before`, com
   `height:calc(100% + 80px)` — o degradê morre 80px **abaixo** do header, longe
   de qualquer borda.
2. **`position:sticky` no mobile.** Havia um `@media (max-width:768px)` com
   `position:sticky` que anulava o `fixed`, e no celular a barra transparente
   mostrava só o branco da página. Trocado para `fixed`.
3. **Colisão no mobile.** O `@media (max-width:560px)` sobrescrevia
   `.hero-content{padding-top}` com um valor fixo, e a tag do imóvel nascia
   atrás do logo. Passou a usar o mesmo `calc(var(--header-h) + …)`.

### Contraste
O véu começa em `.66` e ainda tem `.52` na faixa onde o menu fica. Foi
calibrado assim de propósito: com `.30` o texto branco não garantia 4.5:1 num
slide de hero com céu claro. **Não reduzir sem reconferir com um hero claro.**

⚠️ **Limite conhecido**: o estado do topo assume que a primeira seção da página
é escura (hero com overlay navy, ou `--grad-navy` no Trabalhe Conosco). Uma
página nova com primeira seção clara vai ficar com texto branco sobre fundo
claro. Nesse caso, dar `is-scrolled` desde o início ou criar um modificador.

## Performance de imagens (2026-08-16) — 97 MB por visita

O cliente reportou que as fotos demoravam muito para aparecer no site
publicado. Medido com CDP na home em produção:

```
i.ibb.co                       61 img   92,88 MB
vercel.app (logo)               5 img    3,30 MB
picsum (placeholders)           9 img    0,82 MB
TOTAL                          75 img   96,99 MB
```

Fotos individuais de 4 a 8 MB, em **PNG** (formato sem perdas, péssimo para
render fotográfico), algumas em 4K, exibidas em slots de ~500px.

### Três causas
1. **`aggressivePreloadImages()` baixava todas as fotos de todos os imóveis**
   no load. Ironia: a função existia para deixar as imagens instantâneas e
   fazia o oposto — as 8 capas visíveis disputavam banda com dezenas de fotos
   de galerias que o visitante talvez nunca abrisse, e chegavam por último.
   Agora pré-carrega só as capas dos 8 primeiros (`CAPAS_PRE_CARREGADAS`),
   com `fetchpriority=high` nas 3 da primeira tela. O resto continua vindo no
   hover/toque do card e ao abrir o detalhe.
2. **Imagens servidas em tamanho original.** Resolvido com um redimensionador
   em `supabase-service.js` (`optimizeImage`, constante `IMG_CDN`): as URLs
   passam por **wsrv.nl** e voltam em WebP no tamanho de uso — 800px para
   cards/hero, 1400px para a galeria do detalhe. Uma linha de config
   (`IMG_CDN.ativo = false`) desliga tudo e volta ao original.
3. **Logo do cabeçalho com 1,6 MB** (1180×1021), exibido a 72px — e ainda
   usado como favicon, então baixava duas vezes. Reduzido para 335×290
   (**26 KB**) e criado `favicon-elos.png` 192×192 (13 KB). O arquivo original
   intocado continua em `logo-elos-cropped.png`.

### Resultado medido
```
antes:  75 img   96,99 MB   |  imagens levando 4.700–8.600 ms
depois: 31 img    2,83 MB   |  imagens levando 25–145 ms
```

### Cuidados
- **Cache frio do wsrv.nl**: a *primeira* requisição de cada foto após o
  deploy leva 4–8s, porque o CDN precisa baixar o original de 5 MB e
  converter. Depois disso fica em ~30ms. Vale abrir o site uma vez após
  publicar, para "esquentar" o cache antes do cliente ver.
- wsrv.nl é um serviço gratuito de terceiro. **A solução definitiva é subir
  as fotos já otimizadas** (WebP/JPEG, no máximo 1600px) e desligar o
  `IMG_CDN`. Enquanto o CRM aceitar upload de PNG de 8 MB, o problema volta a
  cada imóvel novo.
- Ainda faltam `width`/`height` nas `<img>` geradas por JS (118 delas), o que
  causa deslocamento de layout enquanto carregam. Melhoria pendente.

## Corte horizontal no detalhe do imóvel — celular (2026-08-15)

Conteúdo cortado à direita, sem como rolar. Duas causas somadas:
`min-width:auto` (padrão em item de grid) impedia a coluna de encolher, e
`.btn{white-space:nowrap}` fazia o rótulo do botão de PDF esticar a coluna
para 382px numa tela de 360px. O `overflow-x:hidden` que já existia
**escondia** o vazamento em vez de resolver — daí o "não tem como ver".
Só acontecia em imóvel COM PDF. Corrigido com `min-width:0` nas colunas,
quebra de linha nos botões de rótulo longo e `overflow-wrap:anywhere` no
texto vindo do CRM. Verificado sem estouro em 320/360/390/430px.

## Redesign completo (2026-08-04)

Reformulação visual da home mantendo **a mesma paleta, a mesma ordem de seções
e os mesmos objetivos**. Nada de cor nova, nada de conteúdo institucional novo
(exceto os itens listados abaixo).

### Novo: skill de design system
`.claude/skills/elos-design-system/` — no formato do cookbook oficial da
Anthropic (`SKILL.md` com frontmatter + `REFERENCE.md` + script Python):
- `SKILL.md` — paleta travada, escala tipográfica fluida, curvas de easing,
  padrões de animação aprovados/proibidos, regras de acessibilidade,
  armadilhas conhecidas deste projeto, checklist de entrega.
- `REFERENCE.md` — tokens completos, receitas de CSS/JS prontas, anatomia dos
  componentes, tabela de contraste verificada, ordem canônica das seções.
- `validate_design.py` — varre CSS/HTML e falha em: hex fora da paleta,
  `transition:all`, ausência de bloco `prefers-reduced-motion`, ausência de
  `:focus-visible`, `<img>` sem `alt`, botão só-ícone sem `aria-label` e `?v=N`
  não incrementado. Rodar antes de entregar qualquer mudança visual.

### O que mudou no site
- **Tokens**: gradientes de marca, escala de sombra em 5 níveis, tokens de
  movimento (4 easings + 4 durações), tipografia fluida com `clamp()`,
  escala de espaçamento e `--section-y` fluido.
- **Reveal on scroll** (`data-reveal` + `data-reveal-stagger`) via
  IntersectionObserver, com cascata declarada no container pai.
- **Header**: vidro fosco, encolhe no scroll, sublinhado animado no menu,
  barra de progresso de leitura no topo, hambúrguer que vira X, scrim no
  menu mobile.
- **Hero**: 3 slides com crossfade (grid empilhado, não `display:none`),
  título que sobe palavra a palavra, dots com barra de tempo, thumbs com
  parallax de mouse, cue "Explorar", autoplay que pausa no hover e com a aba
  em segundo plano.
- **Busca**: chips de filtro rápido, selects com caret próprio, glow no
  `:focus-within`, filete superior animado.
- **Novo bloco de números** com count-up (valores placeholder, ver acima).
- **Empreendimentos**: abas viraram segmented control com pílula deslizante
  (só `transform` anima — por isso todos os botões têm a mesma largura),
  4ª aba "Todos", filtro com fade em cascata, cards com specs
  (quartos/banhos/área/vagas), botão de favoritar, zoom na foto, trilho de
  progresso e arrasto com o mouse. 6 cards (2 por status).
- **Sobre**: moldura dourada deslocada, selo "Nota 5,0 no Google", lista de
  garantias.
- **Contato**: barra de progresso, rótulo em cada etapa, máscara de telefone
  BR, validação inline com mensagem e shake, campo de mensagem opcional,
  sucesso com check desenhado em SVG.
- **Parceiros**: marquee infinito (faixa duplicada via JS), pausa no hover.
- **Novo CTA final** antes do footer, botão dourado.
- **Footer**: filete gradiente, WhatsApp nas redes, telefones clicáveis.
- **Flutuantes**: botão voltar ao topo e WhatsApp que expande com rótulo.
- **Acessibilidade**: skip link, `<main>`, `h1` visualmente oculto,
  `:focus-visible` global, `aria-label` em todo ícone sem texto, bloco
  `prefers-reduced-motion` que zera todas as animações.

### Preservado de propósito
- Paleta, logos e assets originais.
- Ordem das seções (Corretores continua colado no formulário de contato).
- Efeito dock nos Corretores e borda que se desenha nos 6 diferenciais.
- "Nossos Diferenciais" (3 cards) continua **sem** borda animada.
- Modal de depoimento, avaliações do Google, bloco do Instagram.

### Bugs novos encontrados e corrigidos nesta sessão
- **Anel de borda "se desenhando sozinho" ao carregar**: `getTotalLength()`
  força um recálculo de estilo *antes* de `--ring-length` existir, então o
  `stroke-dashoffset` resolvia para o fallback do CSS (800) e a transição de
  .85s animava daquele valor até o comprimento real — o usuário via um traço
  teal retraindo em todos os cards. Correção: `rect.style.transition='none'`
  antes de inserir, aplicar dasharray/var, forçar o recálculo lendo
  `getComputedStyle(rect).strokeDashoffset` e só então devolver a transição
  ao CSS. Sem isso o bug volta.
- **Carrossel com cards encostados à esquerda**: `.cards-carousel` é item de
  um flex container (`.cards-carousel-wrap`), então `1fr` em
  `grid-auto-columns` resolvia contra o próprio conteúdo, não contra a
  largura disponível. Correção: `flex:1;min-width:0`, largura máxima fixa nas
  colunas (`minmax(268px,330px)`) e `justify-content:safe center` — centraliza
  quando há poucos cards e volta para `start` quando há overflow.
- **Botão dourado com emenda visível na borda**: gradiente + `border:2px solid
  transparent` com `background-origin:padding-box` (padrão) repete o gradiente
  na área da borda. Correção: `background-origin:border-box`.
- **Specs do card quebrando em 2 linhas irregulares**: viraram grid 2×2 fixo.
- **Teste em headless no Windows**: `--window-size=390` é *clampado* pela
  largura mínima de janela do SO — o print sai com 390px mas a página foi
  diagramada com ~500px, o que parece um bug de overflow horizontal e não é.
  Para testar mobile de verdade, usar 500px ou emulação por CDP.

### Como validar mudanças visuais daqui pra frente
```
python .claude/skills/elos-design-system/validate_design.py
node --check js/main.js
npm run dev            # http://localhost:3000
```

## Estado no fim do dia (2026-07-28)
Sessão pausada a pedido do cliente ("por hoje já podemos finalizar"). Todos os
arquivos já estão salvos em disco (edições foram sempre diretas nos arquivos,
não há estado "não salvo" pendente). Servidor de dev pode estar rodando em
background (`npm run dev`, porta 3000) — se a sessão for encerrada, é só rodar
de novo amanhã. Nenhuma pendência bloqueante; retomar pela lista de "Próximos
passos" acima quando o cliente voltar.
