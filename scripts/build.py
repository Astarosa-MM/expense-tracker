"""Compile-check sources and package an explicit allowlist, never the database."""
from pathlib import Path
import py_compile
import zipfile

root = Path(__file__).resolve().parents[1]
out = root / 'dist'
out.mkdir(exist_ok=True)
py_compile.compile(str(root / 'server.py'), doraise=True)
files = [root / name for name in ['server.py', 'exchange_rates.py', 'VERIFICATION.md', 'README.md', 'TASKS.md', 'requirements.txt', 'Dockerfile', '.dockerignore', '.gitignore', 'scripts/build.py', '.github/workflows/build.yml']]
files += sorted((root / 'public').glob('*'))
files += sorted((root / 'tests').glob('*.py'))
with zipfile.ZipFile(out / 'expense-tracker.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, Path('expense-tracker') / path.relative_to(root))
print(f'Built {out / "expense-tracker.zip"}')
