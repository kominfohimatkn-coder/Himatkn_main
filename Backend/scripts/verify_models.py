import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database.connection import Base
from app import models  # noqa: F401


names = [table.name for table in Base.metadata.sorted_tables]

duplicates = [
    name
    for name, count in Counter(names).items()
    if count > 1
]

if duplicates:
    raise SystemExit(
        f"Duplicate table mappings: {sorted(duplicates)}"
    )

EXPECTED_DOMAIN_TABLES = 22

if len(names) != EXPECTED_DOMAIN_TABLES:
    raise SystemExit(
        f"Expected {EXPECTED_DOMAIN_TABLES} canonical domain tables, "
        f"found {len(names)}: {names}"
    )

print(f"MODELS_OK {len(names)} domain tables")