#!/bin/sh
set -e

echo "============================================"
echo "  Let's Encrypt SSL Certificate Setup"
echo "============================================"
echo ""

DOMAIN=${1:-}
EMAIL=${2:-admin@wegym.app}

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <your-domain.com> [email]"
  echo ""
  echo "Example:"
  echo "  $0 wegym.app admin@wegym.app"
  echo ""
  echo "This will generate SSL certs and place them in ./ssl/"
  echo "The volume 'wegym_ssl' in docker-compose.prod.yml mounts ./ssl/"
  exit 1
fi

echo "-> Domain: $DOMAIN"
echo "-> Email: $EMAIL"
echo ""

mkdir -p ssl

echo "-> Running acme.sh in Docker to issue certificate..."
echo ""

docker run --rm -it \
  -v "$(pwd)/ssl:/acme.sh" \
  -e CF_Token="${CF_Token:-}" \
  -e CF_Email="${CF_Email:-}" \
  neilpang/acme.sh \
  --issue --standalone \
  -d "$DOMAIN" \
  --cert-file "/acme.sh/cert.pem" \
  --key-file "/acme.sh/key.pem" \
  --fullchain-file "/acme.sh/fullchain.pem" \
  --accountemail "$EMAIL"

echo ""
if [ -f ssl/fullchain.pem ] && [ -f ssl/key.pem ]; then
  echo "-> Certificates generated successfully!"
  echo ""
  echo "Files:"
  echo "  ssl/fullchain.pem  (bundle)"
  echo "  ssl/cert.pem       (cert only)"
  echo "  ssl/key.pem        (private key)"
  echo ""
  echo "These are mounted automatically by docker-compose.prod.yml"
  echo "via the volume 'wegym_ssl' -> /etc/nginx/ssl/"
  echo ""
  echo "To renew (runs automatically via acme.sh cron):"
  echo "  docker run --rm -v \"$(pwd)/ssl:/acme.sh\" neilpang/acme.sh --renew -d \"$DOMAIN\""
else
  echo "Error: Certificate files not found. Check the acme.sh output above."
  exit 1
fi
