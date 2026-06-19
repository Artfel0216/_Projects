#!/bin/sh
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-wegym}
DB_PASSWORD=${DB_PASSWORD:-}

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File $BACKUP_FILE not found."
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

echo "-> Restoring $BACKUP_FILE to $DB_NAME@$DB_HOST:$DB_PORT"
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
echo "-> Restore complete."
