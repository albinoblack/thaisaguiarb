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

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            self.ids.add(values["id"])
        if tag == "a" and values.get("href", "").startswith("#"):
            self.fragments.append(values["href"][1:])
        if tag in {"img", "script", "link"}:
            asset = values.get("src") or values.get("href", "")
            if asset and not asset.startswith(("http:", "https:", "#")):
                self.assets.append(asset)
        if tag == "img":
            self.images.append(values)


parser = SiteParser()
parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))

missing_ids = sorted(set(parser.fragments) - parser.ids)
missing_assets = sorted(asset for asset in parser.assets if not (ROOT / asset).is_file())
missing_alts = [image.get("src", "") for image in parser.images if "alt" not in image]
photo_count = sum(image.get("src", "").endswith((".webp", ".jpeg")) for image in parser.images)
hero_slides = [image for image in parser.images if "hero-slide" in image.get("class", "").split()]
surgery_slides = [image for image in parser.images if "surgery-slide" in image.get("class", "").split()]

assert not missing_ids, f"Links sem destino: {missing_ids}"
assert not missing_assets, f"Arquivos ausentes: {missing_assets}"
assert not missing_alts, f"Imagens sem alt: {missing_alts}"
assert photo_count == 11, f"Esperadas 11 fotos estratégicas, encontradas {photo_count}"
assert len(hero_slides) == 3, f"Esperadas 3 fotos no banner, encontradas {len(hero_slides)}"
assert len(surgery_slides) == 5, f"Esperadas 5 fotos cirúrgicas no banner, encontradas {len(surgery_slides)}"
assert "is-active" in hero_slides[0].get("class", "").split(), "Primeira foto do banner deve iniciar visível"

print(f"OK: {len(parser.ids)} IDs, {photo_count} fotos (3 no hero, 5 no banner cirúrgico), links e arquivos locais.")
