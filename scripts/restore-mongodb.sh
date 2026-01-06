#!/bin/bash

# MongoDB Restore Script for twitter-api
# Usage: ./restore-mongodb.sh [backup-folder-name]

DB_NAME="twitter-api"
BACKUP_DIR="$HOME/Desktop/twitter-api/backups"

# Check if backup folder is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide a backup folder name"
    echo ""
    echo "Available backups:"
    ls -1 "$BACKUP_DIR" | grep "backup-"
    echo ""
    echo "Usage: ./restore-mongodb.sh backup-YYYYMMDD-HHMMSS"
    exit 1
fi

BACKUP_PATH="$BACKUP_DIR/$1"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    echo "❌ Error: Backup folder not found: $BACKUP_PATH"
    echo ""
    echo "Available backups:"
    ls -1 "$BACKUP_DIR" | grep "backup-"
    exit 1
fi

# Confirm before restoring
echo "⚠️  WARNING: This will replace your current database with the backup!"
echo "📁 Backup: $1"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Perform the restore
echo "Starting restore of $DB_NAME database..."
mongorestore --db="$DB_NAME" --drop "$BACKUP_PATH/$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
