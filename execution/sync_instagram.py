#!/usr/bin/env python3
"""
Sincroniza os últimos posts do Instagram da Elos para dentro do site.

Camada 3 (execução) da arquitetura do projeto. A diretiva correspondente é
`directives/instagram_feed.md` — leia antes de mexer aqui.

O que faz:
  1. Busca as mídias mais recentes na Instagram Graph API.
  2. BAIXA cada imagem para `assets/img/instagram/` (as URLs da Meta são
     assinadas e expiram — linkar direto quebra o site em algumas semanas).
  3. Escreve `assets/data/instagram.json`, que é o que o front lê.
  4. Remove imagens de posts que saíram do feed.

Nunca falha "em silêncio": se o token morreu, sai com código != 0 para o
GitHub Actions avisar por e-mail. O site continua no ar com o último JSON.

Uso:
    python execution/sync_instagram.py
    python execution/sync_instagram.py --limit 12 --dry-run

Variáveis de ambiente (ou arquivo .env na raiz do projeto):
    INSTAGRAM_USER_ID     ID numérico da conta profissional
    INSTAGRAM_TOKEN       Token de acesso da Página (permanente)
    INSTAGRAM_HANDLE      @ do perfil, sem o @ (opcional)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API_VERSION = "v21.0"
GRAPH = f"https://graph.facebook.com/{API_VERSION}"

PROJECT = Path(__file__).resolve().parents[1]
IMG_DIR = PROJECT / "assets" / "img" / "instagram"
DATA_FILE = PROJECT / "assets" / "data" / "instagram.json"

# Campos que a API devolve por mídia.
FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"

# Legenda no site é só uma prévia — o texto inteiro fica no Instagram.
CAPTION_MAX = 140

# A grade da home mostra os quadrados a ~260px. O Instagram devolve a imagem
# em tamanho cheio (chega a 2 MB por post), então recortamos em quadrado e
# reduzimos: 6 posts saem de ~4,4 MB para poucas centenas de KB.
THUMB_SIZE = 640
THUMB_QUALITY = 82

try:
    from PIL import Image  # type: ignore
    HAS_PILLOW = True
except ImportError:  # pragma: no cover - ambiente sem Pillow ainda funciona
    HAS_PILLOW = False


# --------------------------------------------------------------------------- #
# Utilidades
# --------------------------------------------------------------------------- #

def load_dotenv() -> None:
    """Lê o .env da raiz sem depender de biblioteca externa."""
    env_file = PROJECT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def die(message: str) -> "NoReturn":  # type: ignore[valid-type]
    print(f"ERRO: {message}", file=sys.stderr)
    sys.exit(1)


def get_json(url: str) -> dict:
    """GET que transforma erro da Meta em mensagem legível."""
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(body)["error"]["message"]
        except Exception:
            detail = body[:400]
        die(f"a Meta respondeu {exc.code}: {detail}")
    except urllib.error.URLError as exc:
        die(f"não consegui falar com a Meta: {exc.reason}")


def truncate(text: str, limit: int = CAPTION_MAX) -> str:
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(".,;:!?-") + "…"


# --------------------------------------------------------------------------- #
# Passos
# --------------------------------------------------------------------------- #

def fetch_media(user_id: str, token: str, limit: int) -> list[dict]:
    params = urllib.parse.urlencode({"fields": FIELDS, "limit": limit, "access_token": token})
    payload = get_json(f"{GRAPH}/{user_id}/media?{params}")
    return payload.get("data", [])


def optimize(destination: Path) -> None:
    """Recorta em quadrado (centro, como a grade do Instagram) e reduz.

    Se o Pillow não estiver instalado, mantém o arquivo original — o site
    funciona igual, só mais pesado.
    """
    if not HAS_PILLOW:
        return

    with Image.open(destination) as img:
        img = img.convert("RGB")
        largura, altura = img.size
        lado = min(largura, altura)
        esquerda = (largura - lado) // 2
        topo = (altura - lado) // 2
        img = img.crop((esquerda, topo, esquerda + lado, topo + lado))
        img = img.resize((THUMB_SIZE, THUMB_SIZE), Image.LANCZOS)
        img.save(destination, "JPEG", quality=THUMB_QUALITY, optimize=True, progressive=True)


def download(url: str, destination: Path) -> bool:
    """Baixa a imagem. Devolve False se falhar (um post não derruba o resto)."""
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "elos-site/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
        if len(data) < 1024:
            print(f"  aviso: {destination.name} veio com {len(data)} bytes, ignorando")
            return False
        destination.write_bytes(data)

        antes = len(data)
        optimize(destination)
        depois = destination.stat().st_size
        if depois < antes:
            print(f"  {destination.name}: {antes // 1024} KB -> {depois // 1024} KB")
        return True
    except Exception as exc:  # noqa: BLE001 — qualquer falha aqui é só "pula esse post"
        print(f"  aviso: falhou baixar {destination.name}: {exc}")
        return False


def build_entries(media: list[dict], dry_run: bool) -> list[dict]:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    entries: list[dict] = []

    for item in media:
        post_id = item.get("id")
        # Vídeo/Reel não tem media_url utilizável como imagem: usa a capa.
        source = item.get("thumbnail_url") if item.get("media_type") == "VIDEO" else item.get("media_url")
        if not post_id or not source:
            continue

        filename = f"{post_id}.jpg"
        destination = IMG_DIR / filename

        if dry_run:
            print(f"  [dry-run] baixaria {filename}")
        elif destination.exists():
            print(f"  ok (já tinha): {filename}")
        elif not download(source, destination):
            continue

        entries.append({
            "id": post_id,
            "image": f"assets/img/instagram/{filename}",
            "permalink": item.get("permalink", ""),
            "caption": truncate(item.get("caption", "")),
            "type": item.get("media_type", "IMAGE"),
            "timestamp": item.get("timestamp", ""),
        })

    return entries


def prune(entries: list[dict]) -> int:
    """Apaga imagens de posts que não estão mais no feed."""
    keep = {Path(entry["image"]).name for entry in entries}
    removed = 0
    for path in IMG_DIR.glob("*.jpg"):
        if path.name not in keep:
            path.unlink()
            removed += 1
    return removed


def write_json(entries: list[dict], handle: str) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "handle": handle,
        "profileUrl": f"https://www.instagram.com/{handle}/" if handle else "",
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "posts": entries,
    }
    DATA_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# --------------------------------------------------------------------------- #

def main() -> int:
    parser = argparse.ArgumentParser(description="Sincroniza o feed do Instagram da Elos.")
    parser.add_argument("--limit", type=int, default=6, help="quantos posts buscar (padrão: 6)")
    parser.add_argument("--dry-run", action="store_true", help="não baixa nem escreve nada")
    args = parser.parse_args()

    load_dotenv()

    user_id = os.environ.get("INSTAGRAM_USER_ID", "").strip()
    token = os.environ.get("INSTAGRAM_TOKEN", "").strip()
    handle = os.environ.get("INSTAGRAM_HANDLE", "").strip().lstrip("@")

    if not user_id or not token:
        die(
            "faltam INSTAGRAM_USER_ID e/ou INSTAGRAM_TOKEN.\n"
            "  Local:     coloque no arquivo .env da raiz (já está no .gitignore).\n"
            "  Produção:  Settings > Secrets and variables > Actions, no GitHub."
        )

    if not HAS_PILLOW:
        print("aviso: Pillow não instalado — as imagens ficam em tamanho cheio.")
        print("       Instale com: pip install pillow")

    print(f"Buscando os {args.limit} posts mais recentes...")
    media = fetch_media(user_id, token, args.limit)
    if not media:
        die("a API respondeu, mas não veio nenhum post. Conta vazia ou ID errado?")
    print(f"{len(media)} post(s) retornado(s) pela API.")

    entries = build_entries(media, args.dry_run)
    if not entries:
        die("nenhuma imagem pôde ser baixada — o JSON antigo foi preservado.")

    if args.dry_run:
        print(f"\n[dry-run] escreveria {len(entries)} post(s) em {DATA_FILE.relative_to(PROJECT)}")
        return 0

    removed = prune(entries)
    write_json(entries, handle)

    print(f"\nPronto: {len(entries)} post(s) em {DATA_FILE.relative_to(PROJECT)}")
    if removed:
        print(f"{removed} imagem(ns) antiga(s) removida(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
