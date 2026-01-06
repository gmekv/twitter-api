# MongoDB Setup Guide

## Table of Contents
1. [MongoDB Atlas Setup (Free Cloud Database)](#mongodb-atlas-setup)
2. [Automated Backup Script](#automated-backup-script)
3. [Data Recovery](#data-recovery)

---

## MongoDB Atlas Setup (Free Cloud Database)

MongoDB Atlas provides a free tier (512MB storage) with automatic backups and high availability.

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Choose the **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster

1. After signing in, click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (choose one closest to you):
   - **AWS** - Recommended
   - Region: Choose closest to Georgia (e.g., Frankfurt, Ireland, or Mumbai)
4. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Configure Database Access

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (SAVE THESE!)
   - Example: Username: `twitter-api-user`
   - Password: Generate a strong one
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your Application

1. Create a `.env` file in your project root:
   ```bash
   touch .env
   ```

2. Add your MongoDB Atlas connection string to `.env`:
   ```
   MONGODB_URL=mongodb+srv://twitter-api-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/twitter-api?retryWrites=true&w=majority
   ```
   
   **Important:** Replace:
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx` with your actual cluster address
   - Added `/twitter-api` before the `?` to specify the database name

3. Install dotenv package:
   ```bash
   npm install dotenv
   ```

4. Update `src/index.js` to load environment variables:
   ```javascript
   require('dotenv').config()
   const express = require('express')
   require('../db/mongoose')
   // ... rest of your code
   ```

5. Your `db/mongoose.js` already uses `process.env.MONGODB_URL`, so it will automatically use Atlas when the env variable is set!

6. Add `.env` to your `.gitignore`:
   ```
   node_modules/
   .env
   ```

### Step 7: Test the Connection

1. Stop your local MongoDB:
   ```bash
   brew services stop mongodb-community@8.0
   ```

2. Restart your app:
   ```bash
   npm run dev
   ```

3. You should see "Server is up on the port 3000" without any MongoDB connection errors!

---

## Automated Backup Script

### Local MongoDB Backup

Create a backup script that runs automatically:

1. The backup script is in `scripts/backup-mongodb.sh`
2. Make it executable:
   ```bash
   chmod +x scripts/backup-mongodb.sh
   ```

3. Run manual backup:
   ```bash
   ./scripts/backup-mongodb.sh
   ```

4. Backups are saved to `backups/` directory with timestamps

### Automated Daily Backups (macOS)

Set up a daily backup using launchd:

1. The launch agent is in `scripts/com.twitter-api.backup.plist`
2. Copy it to LaunchAgents:
   ```bash
   cp scripts/com.twitter-api.backup.plist ~/Library/LaunchAgents/
   ```

3. Load the agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.twitter-api.backup.plist
   ```

4. Your database will now backup automatically every day at 2 AM!

### Manual Backup Commands

**Backup:**
```bash
mongodump --db=twitter-api --out=./backups/manual-backup-$(date +%Y%m%d-%H%M%S)
```

**Restore:**
```bash
mongorestore --db=twitter-api ./backups/YOUR_BACKUP_FOLDER/twitter-api
```

---

## Data Recovery

### If You Have a Backup

```bash
# List available backups
ls -la backups/

# Restore from a specific backup
mongorestore --db=twitter-api ./backups/backup-20251211-123456/twitter-api
```

### MongoDB Atlas Automatic Backups

With MongoDB Atlas (even free tier), you get:
- **Continuous backups** (on paid tiers)
- **Point-in-time recovery** (on paid tiers)
- **Manual snapshots** (available on all tiers)

To create a manual snapshot:
1. Go to your cluster in Atlas
2. Click "Backup" tab
3. Click "Take Snapshot Now"

---

## Comparison: Local vs Atlas

| Feature | Local MongoDB | MongoDB Atlas (Free) |
|---------|--------------|---------------------|
| Storage | Unlimited | 512 MB |
| Backups | Manual | Automatic |
| Availability | Only when computer is on | 24/7 |
| Security | Local only | Encrypted, secure |
| Cost | Free | Free |
| Setup | Complex | Easy |
| Maintenance | You manage | Fully managed |

---

## Troubleshooting

### Can't connect to Atlas?
- Check your IP is whitelisted in Network Access
- Verify username/password are correct
- Make sure connection string has the database name

### Local MongoDB won't start?
```bash
brew services restart mongodb-community@8.0
```

### Need to switch between local and Atlas?
Just change the `MONGODB_URL` in your `.env` file:
- **Atlas:** `mongodb+srv://...`
- **Local:** `mongodb://127.0.0.1:27017/twitter-api`

---

## Best Practices

1. ✅ **Always use `.env` for sensitive data**
2. ✅ **Never commit `.env` to git**
3. ✅ **Run backups regularly**
4. ✅ **Use Atlas for production**
5. ✅ **Use local MongoDB for development (optional)**
6. ✅ **Test your backups by restoring them**

---

## Quick Commands Reference

```bash
# Start local MongoDB
brew services start mongodb-community@8.0

# Stop local MongoDB
brew services stop mongodb-community@8.0

# Check MongoDB status
brew services list | grep mongodb

# Manual backup
mongodump --db=twitter-api --out=./backups/backup-$(date +%Y%m%d)

# Restore backup
mongorestore --db=twitter-api ./backups/YOUR_BACKUP/twitter-api

# Connect to MongoDB shell (local)
mongosh

# Connect to MongoDB shell (Atlas)
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net" --username YOUR_USERNAME
```
