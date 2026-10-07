#!/usr/bin/env bash
# Sauvegarde de production : base du site, fichiers (CV, images) et base Umami.
# À lancer depuis le dossier du projet sur le serveur ; prévu pour une tâche cron
# quotidienne.
set -euo pipefail

cd "$(dirname "$0")/.."
BACKUP_DIR="${BACKUP_DIR:-/srv/backups/portfolio}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%F_%H%M)"

set -a
. ./.env.production
set +a

dc() { docker compose --env-file .env.production -f docker-compose.prod.yml "$@"; }

mkdir -p "$BACKUP_DIR"

# Format « custom » de pg_dump : compressé, restaurable table par table avec pg_restore.
dc exec -T db pg_dump -U "$POSTGRES_USER" -d portfolio -Fc > "$BACKUP_DIR/portfolio_$STAMP.dump"
dc exec -T umami-db pg_dump -U umami -d umami -Fc > "$BACKUP_DIR/umami_$STAMP.dump"
dc exec -T app tar -C /app/storage -czf - . > "$BACKUP_DIR/storage_$STAMP.tar.gz"

# Rotation : suppression des sauvegardes plus anciennes que la durée de rétention.
find "$BACKUP_DIR" -type f -mtime "+$RETENTION_DAYS" -delete

echo "Sauvegarde terminée : $BACKUP_DIR (*_$STAMP.*)"
