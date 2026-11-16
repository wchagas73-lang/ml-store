from pathlib import Path
from PIL import Image, ImageOps
import json

MEDIA = Path("media/images")
ORIGINALS = Path("media/originals")
MEDIA.mkdir(parents=True, exist_ok=True)

converted = {}
missing = []

def jpg_source_for(stem):
    candidates = sorted(ORIGINALS.glob(stem + ".jpg"))
    if candidates:
        return candidates[0]
    candidates = sorted(ORIGINALS.glob(stem + "-*.jpg"))
    if candidates:
        return candidates[0]
    return None

def ensure_jpg(path_value):
    if not isinstance(path_value, str) or not path_value.startswith("/media/"):
        return path_value
    source_path = Path(path_value.lstrip("/"))

    if source_path.suffix.lower() in {".jpg", ".jpeg"}:
        if source_path.parent == ORIGINALS:
            target = MEDIA / (source_path.stem + ".jpg")
            if not target.exists():
                target.write_bytes(source_path.read_bytes())
            return "/" + target.as_posix()
        return path_value

    if source_path.suffix.lower() != ".webp":
        return path_value

    target = MEDIA / (source_path.stem + ".jpg")
    original = jpg_source_for(source_path.stem)
    if original is None:
        missing.append((path_value, str(target)))
        return path_value

    with Image.open(original) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.mode in ("RGBA", "LA") or "transparency" in image.info:
            rgba = image.convert("RGBA")
            background = Image.new("RGB", rgba.size, "white")
            background.paste(rgba, mask=rgba.getchannel("A"))
            image = background
        else:
            image = image.convert("RGB")
        options = {"format": "JPEG", "quality": 94, "optimize": True, "progressive": True}
        icc = opened.info.get("icc_profile")
        if icc:
            options["icc_profile"] = icc
        image.save(target, **options)
    converted[path_value] = "/" + target.as_posix()
    print(f"JPG criado: {target}")
    return "/" + target.as_posix()

def walk(value):
    if isinstance(value, dict):
        return {key: walk(item) for key, item in value.items()}
    if isinstance(value, list):
        return [walk(item) for item in value]
    return ensure_jpg(value)

for data_file in sorted(Path("data").glob("*.json")):
    original_text = data_file.read_text(encoding="utf-8")
    data = json.loads(original_text)
    updated = walk(data)
    rendered = json.dumps(updated, ensure_ascii=False, indent=2) + "\\n"
    if rendered != original_text:
        data_file.write_text(rendered, encoding="utf-8")
        print(f"Referencias atualizadas: {data_file}")

if missing:
    details = "\\n".join(f"{source} -> {target}" for source, target in missing)
    raise SystemExit("Originais JPG nao encontrados para:\\n" + details)

print(f"Conversao concluida. Novos JPGs: {len(converted)}")
