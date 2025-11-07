#!/usr/bin/env node
/**
 * Kill Ports Script
 * Kills any processes running on ports 3000 and 8000
 */

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    white: '\x1b[0m'
  };
  console.log(colors[color] + message + colors.white);
}

function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    return null;
  }
}

function killPortWindows(port) {
  log(`🔍 Checking port ${port} on Windows...`, 'blue');
  
  try {
    // Find process using the port
    const result = execCommand(`netstat -ano | findstr :${port}`);
    
    if (!result) {
      log(`   ✅ Port ${port} is free`, 'green');
      return;
    }
    
    // Extract PIDs from netstat output
    const lines = result.split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.match(/LISTENING\s+(\d+)/);
      if (match) {
        pids.add(match[1]);
      }
    });
    
    if (pids.size === 0) {
      log(`   ✅ Port ${port} is free`, 'green');
      return;
    }
    
    // Kill each process
    pids.forEach(pid => {
      log(`   🔪 Killing process ${pid} on port ${port}...`, 'yellow');
      execCommand(`taskkill /F /PID ${pid}`);
    });
    
    log(`   ✅ Port ${port} cleared`, 'green');
    
  } catch (error) {
    log(`   ⚠️  Could not clear port ${port}: ${error.message}`, 'yellow');
  }
}

function killPortUnix(port) {
  log(`🔍 Checking port ${port} on Unix...`, 'blue');
  
  try {
    // Find process using the port
    const result = execCommand(`lsof -ti:${port}`);
    
    if (!result) {
      log(`   ✅ Port ${port} is free`, 'green');
      return;
    }
    
    // Kill the process
    const pids = result.split('\n').filter(pid => pid.trim());
    
    pids.forEach(pid => {
      log(`   🔪 Killing process ${pid} on port ${port}...`, 'yellow');
      execCommand(`kill -9 ${pid}`);
    });
    
    log(`   ✅ Port ${port} cleared`, 'green');
    
  } catch (error) {
    log(`   ⚠️  Could not clear port ${port}: ${error.message}`, 'yellow');
  }
}

function killPort(port) {
  const isWindows = os.platform() === 'win32';
  
  if (isWindows) {
    killPortWindows(port);
  } else {
    killPortUnix(port);
  }
}

function cleanNextLockFile() {
  const lockPath = path.join(__dirname, '.next', 'dev', 'lock');
  
  try {
    if (fs.existsSync(lockPath)) {
      log('🔓 Removing Next.js lock file...', 'blue');
      fs.unlinkSync(lockPath);
      log('   ✅ Lock file removed', 'green');
    }
  } catch (error) {
    log(`   ⚠️  Could not remove lock file: ${error.message}`, 'yellow');
  }
}

function main() {
  log('\n🧹 Cleaning up previous server instances...\n', 'blue');
  
  // Kill backend (port 8000)
  killPort(8000);
  
  // Kill frontend (port 3000)
  killPort(3000);
  
  // Clean Next.js lock file
  cleanNextLockFile();
  
  log('\n✅ Port cleanup complete!\n', 'green');
}

main();
