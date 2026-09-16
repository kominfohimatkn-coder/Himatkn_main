import importlib
from pathlib import Path

def test_all_app_modules_import():
    modules=[]
    for p in Path('app').rglob('*.py'):
        if p.name=='__init__.py': continue
        modules.append('.'.join(p.with_suffix('').parts))
    for module in modules:
        importlib.import_module(module)
