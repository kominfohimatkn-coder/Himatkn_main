import importlib
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pathlib import Path
for path in Path('app').rglob('*.py'):
 if path.name=='__init__.py': continue
 importlib.import_module('.'.join(path.with_suffix('').parts))
print('IMPORT_OK')
