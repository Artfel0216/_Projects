#!/bin/sh
set -e

echo "============================================"
echo "  WEGYM - Complete Setup"
echo "============================================"
echo ""

echo "Choose what to configure:"
echo "  1) Sentry (error tracking)"
echo "  2) SSL Certificate (Let's Encrypt)"
echo "  3) GitHub Secrets + ghcr.io"
echo "  4) All of the above"
echo ""

echo -n "Option [1-4]: "
read -r OPTION

case "$OPTION" in
  1)
    bash scripts/setup-sentry.sh
    ;;
  2)
    echo -n "Domain: "
    read -r DOMAIN
    echo -n "Email [admin@wegym.app]: "
    read -r EMAIL
    EMAIL=${EMAIL:-admin@wegym.app}
    bash scripts/setup-ssl.sh "$DOMAIN" "$EMAIL"
    ;;
  3)
    bash scripts/setup-github.sh
    ;;
  4)
    echo ""
    echo "--- Step 1/3: Sentry ---"
    bash scripts/setup-sentry.sh
    echo ""
    echo "--- Step 2/3: SSL ---"
    echo -n "Domain: "
    read -r DOMAIN
    echo -n "Email [admin@wegym.app]: "
    read -r EMAIL
    EMAIL=${EMAIL:-admin@wegym.app}
    bash scripts/setup-ssl.sh "$DOMAIN" "$EMAIL"
    echo ""
    echo "--- Step 3/3: GitHub ---"
    bash scripts/setup-github.sh
    echo ""
    echo "============================================"
    echo "  Setup Complete!"
    echo "============================================"
    echo ""
    echo "Next steps:"
    echo "  1. Push to main branch to trigger CI/CD"
    echo "  2. Deploy: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    echo "  3. Monitor: sentry.io dashboard"
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
