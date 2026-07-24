#!/bin/sh
# Installs pre-commit hook: regenerate manifest.json + restage before every commit.
set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"

cat > "$HOOK_PATH" <<'EOF'
#!/bin/sh
node scripts/generate-manifest.js
git add manifest.json
EOF

chmod +x "$HOOK_PATH"
echo "pre-commit hook installed at $HOOK_PATH"
