const fs = require("fs");
const path = require("path");
const os = require("os");
const checkDiskSpace = require("check-disk-space").default;

async function getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                calculateSize(fullPath);
            } else {
                const stats = fs.statSync(fullPath);
                totalSize += stats.size;
            }
        }
    }

    calculateSize(folderPath);
    return totalSize;
}

module.exports = async function checkMemory(locale) {
    const serverFolder = path.join(__dirname, "../server");
    const minRamMB = 512;

    const totalRamMB = os.totalmem() / 1024 / 1024;
    console.log(locale.ram.ramMessage.replace("{{ram}}", Math.floor(totalRamMB)));

    if (totalRamMB < minRamMB) {
        throw new Error(
            locale.ram.ramError
                .replace("{{total}}", Math.floor(totalRamMB))
                .replace("{{min}}", minRamMB)
        );
    }

    const folderSizeBytes = await getFolderSize(serverFolder);
    const folderSizeMB = folderSizeBytes / 1024 / 1024;
    console.log(locale.disk.diskSpaceMessage.replace("{{space}}", folderSizeMB.toFixed(2)));

    const diskPath = path.parse(serverFolder).root;
    const diskSpace = await checkDiskSpace(diskPath);
    const freeMB = diskSpace.free / 1024 / 1024;
    console.log(locale.disk.diskSpaceMessage.replace("{{space}}", freeMB.toFixed(2)));

    if (freeMB < folderSizeMB + 100) {
        throw new Error(
            locale.disk.diskSpaceStopMessage
                .replace("{{free}}", freeMB.toFixed(2))
                .replace("{{needed}}", (folderSizeMB + 100).toFixed(2))
        );
    }

    return true;
};
