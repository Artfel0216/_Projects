#!/bin/sh
set -e

# Load Docker secrets as environment variables
# (Docker Compose secrets are mounted as files in /run/secrets/)
for secret_dir in /run/secrets; do
  if [ -d "$secret_dir" ]; then
    for secret_file in "$secret_dir"/*; do
      if [ -f "$secret_file" ]; then
        name=$(basename "$secret_file" | tr '[:lower:]' '[:upper:]')
        value=$(cat "$secret_file")
        case "$name" in
          DB_PASSWORD)    export POSTGRES_PASSWORD="$value" ;;
          NEXTAUTH_SECRET) export NEXTAUTH_SECRET="$value" ;;
          GEMINI_API_KEY)  export GEMINI_API_KEY="$value" ;;
          MP_ACCESS_TOKEN) export MP_ACCESS_TOKEN="$value" ;;
          RESEND_API_KEY)  export RESEND_API_KEY="$value" ;;
        esac
      fi
    done
  fi
done

echo "-> Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "-> Migrations complete."

echo "-> Starting application..."
exec node server.js
