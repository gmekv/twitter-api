# Quick Reference: MongoDB Commands

## Backup & Restore

### Create a backup
```bash
./scripts/backup-mongodb.sh
```

### Restore from backup
```bash
# List available backups
ls backups/

# Restore a specific backup
./scripts/restore-mongodb.sh backup-YYYYMMDD-HHMMSS
```

## MongoDB Atlas Setup

Follow the detailed guide in `MONGODB_SETUP_GUIDE.md`

Quick steps:
1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a FREE cluster (M0)
3. Create database user
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get connection string
6. Create `.env` file with:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/twitter-api?retryWrites=true&w=majority
   ```
7. Restart your app: `npm run dev`

## Local MongoDB Commands

```bash
# Start MongoDB
brew services start mongodb-community@8.0

# Stop MongoDB
brew services stop mongodb-community@8.0

# Check status
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh

# View databases
mongosh --eval "show dbs"

# View collections in twitter-api
mongosh twitter-api --eval "show collections"

# Count documents
mongosh twitter-api --eval "db.users.countDocuments()"
```

## Switch Between Local and Atlas

Just change `MONGODB_URL` in `.env`:

**Local:**
```
MONGODB_URL=mongodb://127.0.0.1:27017/twitter-api
```

**Atlas:**
```
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/twitter-api?retryWrites=true&w=majority
```

Then restart: `npm run dev`
