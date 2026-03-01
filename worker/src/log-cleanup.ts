import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import logger from './config/logger';

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const archiveDir = path.join(logDir, 'archive');
const MAX_AGE_DAYS = 90; // Remove archives older than 3 months

/**
 * Monthly log cleanup cron job.
 * Runs at midnight on the 1st of every month.
 *
 * 1. Moves current log files into archive/ with a date-stamped name.
 * 2. Deletes archived logs older than MAX_AGE_DAYS (3 months).
 */
export function startLogCleanupCron() {
    // Runs at 00:00 on the 1st of every month
    cron.schedule('0 0 1 * *', () => {
        logger.info('Running monthly log cleanup...');

        try {
            // Ensure archive directory exists
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
            }

            // 1. Archive current log files
            archiveCurrentLogs();

            // 2. Remove old archives (> 3 months)
            removeOldArchives();

            logger.info('Monthly log cleanup completed.');
        } catch (err: any) {
            logger.error('Log cleanup failed: %s', err.message);
        }
    });

    logger.info('Log cleanup cron scheduled: monthly on the 1st at midnight.');
}

function archiveCurrentLogs() {
    const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const logFiles = fs.readdirSync(logDir).filter((f) => {
        const fullPath = path.join(logDir, f);
        return fs.statSync(fullPath).isFile() && f.endsWith('.log');
    });

    for (const file of logFiles) {
        const src = path.join(logDir, file);
        const baseName = path.basename(file, '.log');
        const dest = path.join(archiveDir, `${baseName}_${dateStamp}.log`);

        // Copy the file to archive, then truncate the original
        fs.copyFileSync(src, dest);
        fs.truncateSync(src, 0);

        logger.info(`Archived ${file} → archive/${baseName}_${dateStamp}.log`);
    }
}

function removeOldArchives() {
    if (!fs.existsSync(archiveDir)) return;

    const now = Date.now();
    const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const archiveFiles = fs.readdirSync(archiveDir);

    for (const file of archiveFiles) {
        const filePath = path.join(archiveDir, file);
        const stat = fs.statSync(filePath);

        if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            logger.info(`Removed old archive: ${file} (older than ${MAX_AGE_DAYS} days)`);
        }
    }
}
