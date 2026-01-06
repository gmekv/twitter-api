#!/bin/bash

# MongoDB Backup Script for twitter-api
# This script creates a timestamped backup of your MongoDB database

# Configuration
DB_NAME="twitter-api"
BACKUP_DIR="$HOME/Desktop/twitter-api/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup-$TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform the backup
echo "Starting backup of $DB_NAME database..."
mongodump --db="$DB_NAME" --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📁 Backup location: $BACKUP_PATH"
    
    # Get backup size
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    echo "💾 Backup size: $BACKUP_SIZE"
    
    # Keep only last 7 backups (optional - uncomment to enable)
    # cd "$BACKUP_DIR"
    # ls -t | tail -n +8 | xargs rm -rf
    
else
    echo "❌ Backup failed!"
    exit 1
fi
