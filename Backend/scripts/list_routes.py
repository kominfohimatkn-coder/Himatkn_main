import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.main import app
for route in app.routes:
    methods=sorted(getattr(route,'methods',set())-{'HEAD','OPTIONS'})
    if methods:
        print(f"{'/'.join(methods):6} {route.path}")
