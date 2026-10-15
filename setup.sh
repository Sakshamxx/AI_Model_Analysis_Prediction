#!/bin/bash
# Setup: creates env_AI_Model_Analysis (Python 3.15.0) and installs requirements.txt via uv.
# Usage: bash setup.sh  (or: chmod +x setup.sh && ./setup.sh)
set -e

cd "$(dirname "$0")"

ENV="env_AI_Model_Analysis"

echo "==> Python: $(python3.15 --version)"

# 0. Ensure uv is available (fast installer)
if ! command -v uv >/dev/null 2>&1; then
  echo "==> Installing uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

# 1. Drop old .venv if it still exists (moved to new env name)
if [ -d ".venv" ]; then
  echo "==> Removing old .venv..."
  rm -rf .venv
fi

# 2. Create new env if missing
if [ ! -d "$ENV" ]; then
  echo "==> Creating $ENV with Python 3.15.0..."
  python3.15 -m venv "$ENV"
else
  echo "==> $ENV already exists, reusing."
fi

# 3. Install requirements with uv (fast) — logic/packages unchanged
echo "==> Installing requirements.txt via uv (may take 5-10 min first time)..."
uv pip install --python "$ENV/bin/python" -r requirements.txt

# 4. Register notebook kernel
"$ENV/bin/python" -m ipykernel install --user --name=ai-pricing --display-name='ai-pricing (3.15.0)'

echo ""
echo "==> Done."
echo "    Activate with: source $ENV/bin/activate"
echo "    Notebook kernel: ai-pricing (3.15.0)"
