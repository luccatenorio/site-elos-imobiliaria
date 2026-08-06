# Diretiva: Feed do Instagram no site da Elos

## Objetivo
Manter a seção "Acompanhe nosso Instagram" da home mostrando os **6 posts mais
recentes reais** do perfil `@elosnegociosimobiliarios`, atualizados sozinhos,
sem servidor e sem custo.

## Decisões tomadas com o usuário (2026-08-05)
- **6 posts**, em grade **3×2** (formato do próprio Instagram).
- **Todo clique leva ao perfil**, não ao post individual. O `permalink` de cada
  post é salvo no JSON mesmo assim — se um dia quiserem linkar post a post, é
  só trocar `perfil` por `post.permalink` no bloco do `main.js`.
- Hospedagem definida: **Vercel / Netlify / GitHub Pages** → a sincronização
  roda por **GitHub Actions**, não por servidor.

## Arquitetura (3 camadas)
```
directives/instagram_feed.md          # esta diretiva (camada 1)
execution/sync_instagram.py           # o trabalho (camada 3)
.github/workflows/instagram.yml       # o agendador (cron diário 09:00 UTC)
assets/data/instagram.json            # GERADO — o que o site lê
assets/img/instagram/<post_id>.jpg    # GERADO — imagens baixadas
```

## Por que baixar as imagens em vez de linkar
As URLs `media_url` que a Meta devolve são **assinadas e expiram**. Site que
guarda só o link fica com buracos no lugar das fotos depois de algumas semanas.
É o erro mais comum dessa integração. O script baixa e versiona as imagens no
repositório; o site nunca depende da API em tempo de execução.

## Credenciais

| Variável | Onde vive | Sigiloso? |
| --- | --- | --- |
| `INSTAGRAM_USER_ID` | `.env` local / GitHub **Variables** | não |
| `INSTAGRAM_TOKEN` | `.env` local / GitHub **Secrets** | **SIM** |
| `INSTAGRAM_HANDLE` | `.env` local / GitHub **Variables** | não |

Modelo em `.env.example` (ID e handle já preenchidos, token em branco).

**O token nunca entra no repositório, no JavaScript nem em conversa de chat.**
É um token de System User gerado com validade "Nunca" — ele **não expira
sozinho**, o que significa que um vazamento é acesso vitalício ao Instagram da
Elos até alguém perceber e revogar.

> Contraste com a `anon key` do Supabase, que está hardcoded em
> `js/supabase-service.js`: aquela é **feita** para ser pública e é protegida
> por RLS no banco. Não confundir os dois casos.

## Valores conhecidos

```
INSTAGRAM_USER_ID = 17841471776917861
INSTAGRAM_HANDLE  = elosnegociosimobiliarios
```

## Como gerar o token — via System User (caminho escolhido)

Pré-requisitos já confirmados: conta profissional, o usuário é admin da BM da
Elos, Instagram vinculado à Página, app já criado.

**Por que System User e não token de usuário:** o token de usuário morre se
quem autorizou sair da BM ou trocar a senha do Facebook. O System User é uma
identidade da própria empresa, não de uma pessoa — e o token pode ser gerado
com validade **"Nunca"**, o que elimina a renovação de 60 dias.

1. `business.facebook.com/settings` → **Usuários → Usuários do sistema** →
   **Adicionar**. Nome sugerido: `Site Elos — Feed Instagram`. Função: **Admin**.
2. **Atribuir ativos** ao system user (é o passo que mais se esquece — sem ele
   o token gera mas devolve lista vazia):
   - o **App**, com "Gerenciar app"
   - a **Página** do Facebook da Elos, com controle total
   - a **Conta do Instagram** da Elos, com controle total
3. **Gerar novo token**:
   - app: o da Elos
   - validade: **Nunca**
   - permissões: `instagram_basic`, `pages_show_list`,
     `pages_read_engagement`, `business_management`
4. **Copiar na hora.** A Meta mostra o token **uma única vez**. Perdeu, gera
   outro (o antigo continua válido — revogue o antigo se isso acontecer).

**Não é preciso App Review**: o app fica em modo de desenvolvimento e só a
própria conta da Elos é lida.

### Testar antes de colar no GitHub
```
GET https://graph.facebook.com/v21.0/17841471776917861/media
  ?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp
  &limit=6&access_token={TOKEN}
```
Se voltar os 6 últimos posts, está pronto. Se voltar `data: []`, o passo 2
ficou incompleto.

### O que ainda derruba um token "Nunca"
Não expira sozinho, mas cai se: o system user for removido, os ativos forem
desatribuídos, o app for apagado, ou a Meta forçar um reset de segurança.
Nesses casos o Actions falha e manda e-mail — o site não quebra.

## Rodando

```bash
# local (com .env preenchido)
python execution/sync_instagram.py --dry-run     # não escreve nada
python execution/sync_instagram.py --limit 6

# produção: automático, todo dia 09:00 UTC (06:00 BRT)
# manual: aba Actions > "Sincronizar feed do Instagram" > Run workflow
```

O script usa **só a biblioteca padrão do Python** — nenhum `pip install`, o
workflow é trivial.

## Comportamento em falha
- Token morto / ID errado → **sai com código 1**, o Actions falha e o GitHub
  manda e-mail. O `instagram.json` anterior fica intacto e o site continua no
  ar com os últimos posts. Nunca quebra a página.
- Uma imagem que não baixa é pulada; os outros posts entram normalmente.
- Sem o `instagram.json`, o `main.js` não faz nada e ficam as 6 fotos de
  exemplo que estão no HTML. Esse é o fallback permanente.

## Edge cases já tratados
- **Reels e vídeos**: `media_url` não serve como imagem; o script usa
  `thumbnail_url` quando `media_type == "VIDEO"`.
- **Legenda**: cortada em 140 caracteres, só para o `aria-label`. O texto
  inteiro fica no Instagram.
- **Segurança no front**: os cards são montados com a API do DOM, não com
  `innerHTML` — legenda é conteúdo de terceiro.
- **Posts que saem do feed**: `prune()` apaga as imagens órfãs, senão a pasta
  cresce para sempre no repositório.
- **Imagem já baixada** não é baixada de novo (compara pelo `post_id`).

## Otimização das imagens (importante)
O Instagram devolve a foto em tamanho cheio — chegou a **1,9 MB num único
post**, para um quadrado que aparece a ~260px na tela. O script recorta no
centro (como a própria grade do Instagram faz) e reduz para 640×640, JPEG
qualidade 82, progressivo.

Resultado medido no primeiro sync real: **4,39 MB → 304 KB** (queda de 93%).

Usa **Pillow**, a única dependência. Se não estiver instalado, o script avisa e
segue salvando em tamanho cheio — o site funciona igual, só pesado. O workflow
faz `pip install pillow` antes de rodar.

## Primeiro sync real (2026-08-05) — funcionou
Rodado localmente com token de System User: 6 posts baixados, JSON gerado,
grade da home renderizando os posts reais. Vieram 3 Reels (`VIDEO`, usaram
`thumbnail_url` corretamente) e 3 carrosséis (`CAROUSEL_ALBUM`).

## Pendências
- **Rotacionar o token**: o token usado no primeiro teste foi colado em uma
  conversa de chat e por isso está queimado. Revogar no System User da BM,
  gerar outro e colocar só no GitHub Secrets. O `.env` local tem o token
  antigo — trocar lá também.
- Colocar `INSTAGRAM_TOKEN` em Settings > Secrets and variables > Actions.
- Rodar o workflow manualmente uma vez para validar em produção.
