# Database Cleanup and Migration Summary (2026-05-02)

## 1. MongoDB Collection Cleanup
- **Dropped Collections**: `Builds` and `Comments` have been removed from the MongoDB database to streamline storage and remove legacy/unused data.
- **Audit Logs**: The `guidePocAuditLogs` collection was cleared (reset to an empty state) in the latest backup.

## 2. Backup & Sync Improvements
- **Standardized File Naming**: Updated `backupAllTables.js` and the backup directory structure so that JSON filenames now exactly match their MongoDB collection names:
    - `PowersData.json` → `guidePocPowers.json`
    - `RelicsData.json` → `guidePocRelics.json`
    - `ItemsData.json` → `guidePocItems.json`
    - `RunesData.json` → `guidePocRunes.json`
    - `cardList.json` → `guidePocCardList.json`
- **Removed Exclusions**: `Builds` and `Comments` are no longer included in the backup or restore processes.
- **Manifest Update**: `_manifest.json` has been updated to reflect the new file naming convention and updated document counts.

## 3. Tooling Updates
- **New Restore Script**: Created `be/uploadData/restoreToMongo.js` which automates the restoration of all collections from the latest JSON backup to MongoDB Atlas.
- **Database Stats**: Updated `be/src/routes/dbStats.js` to remove tracking for the deleted collections.

## 4. Current State
- **Total Collections**: 13 (active)
- **Latest Backup Folder**: `be/uploadData/mongo_backup_2026-05-02T13-40-55`
- **Environment**: MongoDB Atlas is now the primary source of truth for all data.
