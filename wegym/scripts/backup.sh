#!/bin/sh
set -e

BACKUP_DIR=${BACKUP_DIR:-/backups}
RETENTION_DAYS=${RETENTION_DAYS:-7}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-wegym}
DB_PASSWORD=${DB_PASSWORD:-}

mkdir -p "$BACKUP_DIR"

export PGPASSWORD="$DB_PASSWORD"

FILENAME="$BACKUP_DIR/wegym_${TIMESTAMP}.sql.gz"

echo "-> Starting backup: $DB_NAME@$DB_HOST:$DB_PORT"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$FILENAME"
echo "-> Backup saved: $FILENAME ($(du -h "$FILENAME" | cut -f1))"

echo "-> Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "wegym_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "-> Backup complete."
