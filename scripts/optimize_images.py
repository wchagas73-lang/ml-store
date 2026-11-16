from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import json

MEDIA = Path("media/images")
ORIGINALS = Path("media/originals")
QUALITY = 88
mapping = {}

MEDIA.mkdir(parents=True, exist_ok=True)
ORIGINALS.mkdir(parents=True, exist_ok=True)

for source in sorted(MEDIA.iterdir()):
    if not source.is_file() or source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue

    target = source.with_suffix(".webp")
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        save_options = {"format": "WEBP", "quality": QUALITY, "method": 6}
        if "A" in image.getbands():
            save_options["lossless"] = False
            save_options["alpha_quality"] = 100
        icc = image.info.get("icc_profile")
        if icc:
            save_options["icc_profile"] = icc
        image.save(target, **save_options)

    archived = ORIGINALS / source.name
    if archived.exists():
        digest = hashlib.sha256(source.read_bytes()).hexdigest()[:10]
        archived = ORIGINALS / f"{source.stem}-{digest}{source.suffix.lower()}"
    source.replace(archived)
    mapping[f"/media/images/{source.name}"] = f"/media/images/{target.name}"
    print(f"Convertida: {source.name} -> {target.name}")

def replace_paths(value):
    if isinstance(value, dict):
        return {key: replace_paths(item) for key, item in value.items()}
    if isinstance(value, list):
        return [replace_paths(item) for item in value]
    if isinstance(value, str):
        return mapping.get(value, value)
    return value

for data_file in Path("data").glob("*.json"):
    original = data_file.read_text(encoding="utf-8")
    parsed = json.loads(original)
    updated = replace_paths(parsed)
    rendered = json.dumps(updated, ensure_ascii=False, indent=2) + "\n"
    if rendered != original:
        data_file.write_text(rendered, encoding="utf-8")
        print(f"Referências atualizadas: {data_file}")

print(f"Qualidade WebP: {QUALITY}%. Arquivos originais preservados em {ORIGINALS}.")
