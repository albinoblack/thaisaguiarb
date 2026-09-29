from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.fragments = []
        self.assets = []
        self.images = []
        self.headings = []
        self.booking_links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            assert values["id"] not in self.ids, f"ID duplicado: {values['id']}"
            self.ids.add(values["id"])
        if tag == "a":
            href = values.get("href", "")
            if href.startswith("#"):
                self.fragments.append(href[1:])
            if "js-booking" in values.get("class", "").split():
                self.booking_links.append(href)
        if tag in {"img", "script", "link"}:
            asset = values.get("src") or values.get("href", "")
            if asset and not asset.startswith(("http:", "https:", "#")):
                self.assets.append(asset)
        if tag == "img":
            self.images.append(values)
        if tag in {"h1", "h2", "h3"}:
            self.headings.append(tag)


html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
script = (ROOT / "script.js").read_text(encoding="utf-8")
parser = SiteParser()
parser.feed(html)

missing_ids = sorted(set(parser.fragments) - parser.ids)
missing_assets = sorted(asset for asset in parser.assets if not (ROOT / asset).is_file())
missing_alts = [image.get("src", "") for image in parser.images if "alt" not in image]
assert not missing_ids, f"Links sem destino: {missing_ids}"
assert not missing_assets, f"Arquivos ausentes: {missing_assets}"
assert not missing_alts, f"Imagens sem alt: {missing_alts}"
assert parser.headings.count("h1") == 1, "A página deve ter um único H1"
assert html.count("assets/img/hero-premium.webp") == 2, "Hero e preload devem usar a mesma imagem"
assert len(parser.booking_links) >= 5, "CTAs insuficientes na jornada"
assert all("wa.me/5581988863875" in link for link in parser.booking_links), "WhatsApp incorreto"
assert "assets/img/whatsapp.svg" in html, "Ícone do WhatsApp ausente"
assert "prefers-reduced-motion" in css, "Movimento reduzido não contemplado"
assert 'class="scroll-progress"' in html and "updateScrollUi" in script, "Indicador de progresso ausente"
assert "ambient-active" in css and "ambient-active" in script, "Animação de fundo sem controle de visibilidade"
assert "data-future-path=" in html, "Rotas futuras de tratamentos ausentes"

print(f"OK: {len(parser.ids)} IDs, {len(parser.images)} imagens, {len(parser.booking_links)} CTAs, links e arquivos locais.")
