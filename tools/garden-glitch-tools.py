"""GardenGlitch developer utility helpers."""

from __future__ import annotations

import json
from pathlib import Path


def validate_animals(data: dict) -> bool:
    animals = data.get("Animals", [])
    return isinstance(animals, list) and all(
        isinstance(item, dict) and item.get("TypeId") in range(9)
        for item in animals
    )


def inspect_save(path: str) -> None:
    save = json.loads(Path(path).read_text(encoding="utf-8"))
    print("GardenGlitch save valid:", validate_animals(save))


if __name__ == "__main__":
    print("GardenGlitch Python tools ready.")
