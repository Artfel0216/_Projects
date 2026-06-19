#!/bin/sh
set -e

echo "============================================"
echo "  Sentry Project Setup"
echo "============================================"
echo ""

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
  echo "Required: SENTRY_AUTH_TOKEN"
  echo ""
  echo "To create one:"
  echo "  1. Go to https://sentry.io/settings/account/api/auth-tokens/"
  echo "  2. Create a token with 'project:write' and 'project:admin' scopes"
  echo "  3. Export it: export SENTRY_AUTH_TOKEN='your-token'"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

if [ -z "$SENTRY_ORG" ]; then
  echo "Required: SENTRY_ORG (your Sentry org slug)"
  echo "  export SENTRY_ORG='your-org-slug'"
  exit 1
fi

SENTRY_PROJECT=${SENTRY_PROJECT:-wegym}
SENTRY_TEAM=${SENTRY_TEAM:-$SENTRY_ORG}

echo "-> Creating Sentry project '$SENTRY_PROJECT' in org '$SENTRY_ORG'..."

RESPONSE=$(curl -s -X POST "https://sentry.io/api/0/projects/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$SENTRY_PROJECT\",
    \"slug\": \"$SENTRY_PROJECT\",
    \"platform\": \"javascript-nextjs\",
    \"team\": \"$SENTRY_TEAM\"
  }")

DSN=$(echo "$RESPONSE" | grep -o '"dsn":"[^"]*"' | cut -d'"' -f4)
PUBLIC_DSN=$(echo "$RESPONSE" | grep -o '"publicDsn":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DSN" ]; then
  echo "Error creating project. Response:"
  echo "$RESPONSE"
  echo ""
  echo "Note: If project already exists, get DSN from Sentry dashboard."
  exit 1
fi

echo "-> Project created successfully!"
echo ""
echo "============================================"
echo "  Add these to your .env file:"
echo "============================================"
echo "SENTRY_DSN=\"$DSN\""
echo "NEXT_PUBLIC_SENTRY_DSN=\"$PUBLIC_DSN\""
echo "SENTRY_ORG=\"$SENTRY_ORG\""
echo "SENTRY_PROJECT=\"$SENTRY_PROJECT\""
echo "SENTRY_AUTH_TOKEN=\"$SENTRY_AUTH_TOKEN\""
echo "============================================"

# Auto-update .env
if [ -f .env ]; then
  sed -i "s|^SENTRY_DSN=.*|SENTRY_DSN=\"$DSN\"|" .env 2>/dev/null || true
  sed -i "s|^NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=\"$PUBLIC_DSN\"|" .env 2>/dev/null || true
  echo ""
  echo "-> .env file updated."
fi
