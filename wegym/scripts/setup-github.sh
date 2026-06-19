
#!/bin/sh
set -e

echo "============================================"
echo "  GitHub Configuration Setup"
echo "============================================"
echo ""

if ! command -v gh &> /dev/null; then
  echo "Required: GitHub CLI (gh)"
  echo ""
  echo "Install it:"
  echo "  macOS: brew install gh"
  echo "  Linux: apt install gh  |  yum install gh"
  echo "  Windows: winget install GitHub.cli"
  echo ""
  echo "Then authenticate:"
  echo "  gh auth login"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "Not authenticated with GitHub."
  echo "Run: gh auth login"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
  echo "Not in a GitHub repository directory."
  echo "Run this script from the repo root."
  exit 1
fi

echo "-> Configuring repository: $REPO"
echo ""

# --- ghcr.io: ensure packages are enabled ---
echo "-> Enabling GitHub Container Registry (ghcr.io)..."
echo "   ghcr.io is enabled by default for all repos."
echo "   Ensure 'Actions' have write permission:"
echo "   Settings -> Actions -> General -> Workflow permissions"
echo "   -> 'Read and write permissions' -> Save"
echo ""

# --- Set secrets ---
echo "============================================"
echo "  Setting GitHub Secrets"
echo "============================================"
echo ""
echo "Enter the following values (leave empty to skip):"
echo ""

read_secret() {
  local name=$1
  local prompt=$2
  local default=$3

  if [ -n "$default" ]; then
    echo -n "$prompt [$default]: "
  else
    echo -n "$prompt: "
  fi

  read -r value
  if [ -z "$value" ] && [ -n "$default" ]; then
    value="$default"
  fi
  echo "$value"
}

DEPLOY_HOST=$(read_secret "DEPLOY_HOST" "Server SSH host")
if [ -n "$DEPLOY_HOST" ]; then
  gh secret set DEPLOY_HOST --repo "$REPO" --body "$DEPLOY_HOST"
  echo "  -> DEPLOY_HOST set"
fi

DEPLOY_USER=$(read_secret "DEPLOY_USER" "Server SSH user" "root")
if [ -n "$DEPLOY_USER" ]; then
  gh secret set DEPLOY_USER --repo "$REPO" --body "$DEPLOY_USER"
  echo "  -> DEPLOY_USER set"
fi

echo ""
echo "-> DEPLOY_SSH_KEY (paste the private key, press Ctrl+D when done):"
echo "   Leave empty to skip."
echo ""
SSH_KEY=$(cat)
if [ -n "$SSH_KEY" ]; then
  echo "$SSH_KEY" | gh secret set DEPLOY_SSH_KEY --repo "$REPO"
  echo "  -> DEPLOY_SSH_KEY set"
fi

echo ""
echo "-> Setting environment variables as secrets..."
echo ""

for SECRET in DATABASE_URL NEXTAUTH_SECRET GEMINI_API_KEY MP_ACCESS_TOKEN NEXT_PUBLIC_MP_PUBLIC_KEY RESEND_API_KEY POSTGRES_PASSWORD SENTRY_DSN NEXT_PUBLIC_SENTRY_DSN REDIS_URL; do
  VAL=$(read_secret "$SECRET" "  $SECRET")
  if [ -n "$VAL" ]; then
    gh secret set "$SECRET" --repo "$REPO" --body "$VAL"
    echo "    -> $SECRET set"
  fi
done

echo ""
echo "============================================"
echo "  GitHub Configuration Complete!"
echo "============================================"
echo ""
echo "Summary of secrets set:"
gh secret list --repo "$REPO"
echo ""
echo "To verify: gh secret list --repo \"$REPO\""
echo ""
echo "Next: push to 'main' to trigger CI/CD pipeline."
