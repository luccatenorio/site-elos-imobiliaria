#!/usr/bin/env python3
"""
Validador do design system da Elos Imobiliária.

Varre index.html, css/style.css e js/main.js procurando desvios do
`SKILL.md`. Não altera nada — só relata.

Uso:
    python .claude/skills/elos-design-system/validate_design.py
    python .claude/skills/elos-design-system/validate_design.py --root "C:/caminho/do/site"

Saída: lista de achados agrupados por severidade. Exit code 1 se houver ERRO.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paleta oficial (SKILL.md). Tudo fora disso vira achado.
# ---------------------------------------------------------------------------
PALETTE = {
    "#0a1930": "navy-950",
    "#0f2540": "navy-900",
    "#123a5e": "navy-800",
    "#1a4b78": "navy-700",
    "#2c6e8e": "teal-600",
    "#3a86ab": "teal-500",
    "#7fb8d3": "teal-300",
    "#dceaf3": "teal-100",
    "#eef6fa": "teal-050",
    "#b9975b": "gold-500",
    "#8f7139": "gold-700",
    "#d8bd8a": "gold-300",
    # Família de neutros: tons "gelo" levemente quentes (decisão do cliente,
    # substituiu os cinzas azulados originais em 2026-08-05).
    "#edefe9": "gray-50",
    "#e0e2dc": "gray-100",
    "#cdcfc8": "gray-300",
    "#5b6774": "gray-600",
    "#f5f6f2": "bg-ice",
    "#f9faf7": "bg-ice-light",
    "#ffffff": "white",
    "#fff": "white",
    "#000": "black-ref",
    "#3f9d5b": "green-500 (tag pronto para morar)",
    "#25d366": "wa-green (marca WhatsApp)",
    "#34804a": "avatar-green (inicial de cliente sem foto)",
    "#7c4dab": "avatar-purple (inicial de cliente sem foto)",
    "#3897f0": "verified-blue (selo de avaliação verificada)",
}

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{3,8})\b")
VERSION_RE = re.compile(r"(css/style\.css|js/main\.js)\?v=(\d+)")


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.notes: list[str] = []

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def note(self, msg: str) -> None:
        self.notes.append(msg)

    def render(self) -> int:
        for label, items, mark in (
            ("ERRO", self.errors, "x"),
            ("AVISO", self.warnings, "!"),
            ("NOTA", self.notes, "-"),
        ):
            if not items:
                continue
            print(f"\n{label} ({len(items)})")
            print("=" * (len(label) + 12))
            for item in items:
                print(f"  [{mark}] {item}")

        total = len(self.errors) + len(self.warnings)
        print()
        if total == 0:
            print("OK - nada fora do design system.")
        else:
            print(f"{len(self.errors)} erro(s), {len(self.warnings)} aviso(s).")
        return 1 if self.errors else 0


def line_of(text: str, index: int) -> int:
    """Número da linha (1-based) de um offset no texto."""
    return text.count("\n", 0, index) + 1


def check_palette(css: str, rel: str, report: Report) -> None:
    """Todo hex literal precisa estar na paleta aprovada."""
    seen: set[tuple[str, int]] = set()
    for match in HEX_RE.finditer(css):
        raw = match.group(0).lower()
        if raw in PALETTE:
            continue
        line = line_of(css, match.start())
        if (raw, line) in seen:
            continue
        seen.add((raw, line))
        report.error(f"{rel}:{line} cor fora da paleta: {raw}")


def check_transition_all(css: str, rel: str, report: Report) -> None:
    for match in re.finditer(r"transition\s*:\s*all\b", css):
        report.error(
            f"{rel}:{line_of(css, match.start())} 'transition:all' proibido - "
            "nomeie as propriedades animadas"
        )


def check_animated_layout_props(css: str, rel: str, report: Report) -> None:
    """Animar geometria causa layout thrash - só transform/opacity."""
    banned = ("width", "height", "top", "left", "right", "bottom", "margin", "padding")
    for match in re.finditer(r"transition\s*:\s*([^;{}]+)[;}]", css):
        decl = match.group(1)
        for prop in banned:
            if re.search(rf"(^|[\s,]){prop}\s+[\d.]", decl):
                report.warn(
                    f"{rel}:{line_of(css, match.start())} anima '{prop}' - "
                    "prefira transform/opacity"
                )
                break


def check_reduced_motion(css: str, rel: str, report: Report) -> None:
    if "prefers-reduced-motion" not in css:
        report.error(
            f"{rel} não tem nenhum bloco @media (prefers-reduced-motion) - "
            "acessibilidade obrigatória"
        )
        return
    keyframes = len(re.findall(r"@keyframes\b", css))
    if keyframes and "prefers-reduced-motion" in css:
        report.note(f"{rel}: {keyframes} @keyframes, com bloco reduced-motion presente")


def check_focus_visible(css: str, rel: str, report: Report) -> None:
    if ":focus-visible" not in css:
        report.error(f"{rel} não define nenhum estilo :focus-visible")


def check_hardcoded_font_size(css: str, rel: str, report: Report) -> None:
    """Títulos de seção devem usar token fluido, não px cravado."""
    for match in re.finditer(r"\bh[12]\b[^{]*\{[^}]*font-size\s*:\s*(\d+)px", css):
        report.warn(
            f"{rel}:{line_of(css, match.start())} título com font-size em px - "
            "use --fs-h1/--fs-h2 (clamp)"
        )


def check_cache_busting(html: str, rel: str, project: Path, report: Report) -> None:
    versions = VERSION_RE.findall(html)
    if not versions:
        report.error(f"{rel} não usa cache-busting '?v=N' em style.css / main.js")
        return

    found = {asset: int(num) for asset, num in versions}
    for asset in ("css/style.css", "js/main.js"):
        if asset not in found:
            report.error(f"{rel} não versiona {asset} com '?v=N'")

    stamp_file = project / ".claude" / "skills" / "elos-design-system" / ".last-versions"
    current = ",".join(f"{k}={v}" for k, v in sorted(found.items()))

    if stamp_file.exists():
        previous = stamp_file.read_text(encoding="utf-8").strip()
        if previous == current:
            for asset, num in found.items():
                path = project / asset
                if path.exists() and path.stat().st_mtime > stamp_file.stat().st_mtime:
                    report.error(
                        f"{asset} foi editado mas '?v={num}' não mudou em {rel} - "
                        "o navegador do cliente vai servir cache velho"
                    )
    stamp_file.parent.mkdir(parents=True, exist_ok=True)
    stamp_file.write_text(current, encoding="utf-8")
    report.note(f"cache-busting atual: {current}")


def check_alt_and_labels(html: str, rel: str, report: Report) -> None:
    for match in re.finditer(r"<img\b(?![^>]*\balt=)[^>]*>", html):
        report.error(f"{rel}:{line_of(html, match.start())} <img> sem atributo alt")

    for match in re.finditer(r"<button\b[^>]*>(\s*<svg.*?</svg>\s*)</button>", html, re.S):
        tag = match.group(0)
        if "aria-label" not in tag:
            report.error(
                f"{rel}:{line_of(html, match.start())} <button> só com ícone e "
                "sem aria-label"
            )


def check_inline_style_colors(html: str, rel: str, report: Report) -> None:
    for match in re.finditer(r'style="[^"]*(?:color|background)\s*:[^";]*#[0-9a-fA-F]{3,8}', html):
        report.warn(
            f"{rel}:{line_of(html, match.start())} cor inline no HTML - "
            "mova para o CSS com token"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida o design system da Elos.")
    parser.add_argument(
        "--root",
        default=None,
        help="raiz do projeto (padrão: dois níveis acima de .claude/skills/)",
    )
    args = parser.parse_args()

    project = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[3]

    print(f"Projeto: {project}")
    report = Report()

    css_path = project / "css" / "style.css"
    html_path = project / "index.html"

    if css_path.exists():
        css = css_path.read_text(encoding="utf-8")
        rel = "css/style.css"
        check_palette(css, rel, report)
        check_transition_all(css, rel, report)
        check_animated_layout_props(css, rel, report)
        check_reduced_motion(css, rel, report)
        check_focus_visible(css, rel, report)
        check_hardcoded_font_size(css, rel, report)
    else:
        report.error("css/style.css não encontrado")

    if html_path.exists():
        html = html_path.read_text(encoding="utf-8")
        rel = "index.html"
        check_cache_busting(html, rel, project, report)
        check_alt_and_labels(html, rel, report)
        check_inline_style_colors(html, rel, report)
    else:
        report.error("index.html não encontrado")

    return report.render()


if __name__ == "__main__":
    sys.exit(main())
