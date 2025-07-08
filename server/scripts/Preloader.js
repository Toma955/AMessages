import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function rewriteLine(line) {
    process.stdout.write(`\r${line}`);
}

function clearLine() {
    process.stdout.write('\r\x1b[K');
}

async function checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
        const { stdout } = await execAsync('npm list --depth=0');
        console.log('✅ Dependencies check completed');
        return true;
    } catch (error) {
        console.log('❌ Dependencies check failed');
        return false;
    }
}

async function checkFiles() {
    console.log('📁 Checking files...');
    
    try {
        const { stdout } = await execAsync('node scripts/files_and_data/checkFIles.js');
        console.log('✅ Files check completed');
        return true;
    } catch (error) {
        console.log('❌ Files check failed');
        return false;
    }
}

async function checkDatabases() {
    console.log('🗄️ Checking databases...');
    
    try {
        const { stdout } = await execAsync('node scripts/files_and_data/checkDatabases.js');
        console.log('✅ Databases check completed');
        return true;
    } catch (error) {
        console.log('❌ Databases check failed');
        return false;
    }
}

async function main() {
    console.log('🚀 AMessages Preloader Starting...\n');
    
    const checks = [
        { name: 'Dependencies', fn: checkDependencies },
        { name: 'Files', fn: checkFiles },
        { name: 'Databases', fn: checkDatabases }
    ];
    
    for (const check of checks) {
        const success = await check.fn();
        if (!success) {
            console.log(`\n❌ ${check.name} check failed. Please fix the issues and try again.`);
            process.exit(1);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ All checks passed! Starting server...\n');
    
    rl.question('Press Enter to continue or Ctrl+C to exit...', () => {
        rl.close();
        console.log('🚀 Starting server...');
        exec('npm start', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Failed to start server:', error);
                return;
            }
            console.log(stdout);
        });
    });
}

main().catch(console.error);
