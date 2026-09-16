from __future__ import annotations
import re,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.database.connection import Base
from app import models  # noqa: F401
root=Path(__file__).resolve().parents[1]
text=(root/'database/schema.sql').read_text(encoding='utf-8')
blocks=re.findall(r'CREATE TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\);',text,re.I|re.S)
type_names='(?:BIGINT|INT|INTEGER|BOOLEAN|DATE|DATETIME|VARCHAR|TEXT|LONGTEXT|CHAR)'
expected={}
for table,body in blocks:
    cols=set(re.findall(r'(?:^|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+'+type_names+r'\b',body,re.I))
    expected[table]=cols
model={name:set(table.columns.keys()) for name,table in Base.metadata.tables.items()}
if set(expected)!=set(model):
    raise SystemExit(f'Table mismatch: SQL-only={sorted(set(expected)-set(model))}, model-only={sorted(set(model)-set(expected))}')
for name in expected:
    if expected[name]!=model[name]:
        raise SystemExit(f'Column mismatch in {name}: SQL-only={sorted(expected[name]-model[name])}, model-only={sorted(model[name]-expected[name])}')
print(f'SCHEMA_OK {len(model)} tables / columns match')
