#!/usr/bin/env node
/**
 * Backend Setup Script
 * Ensures Python virtual environment and dependencies are ready
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const venvDir = path.join(backendDir, 'venv');
const isWindows = process.platform === 'win32';

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

function execCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function checkPython() {
  log('🔍 Checking Python installation...', 'blue');
  
  const pythonCommands = ['python', 'python3'];
  for (const cmd of pythonCommands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'pipe' });
      log(`✅ Found Python: ${cmd}`, 'green');
      return cmd;
    } catch (error) {
      continue;
    }
  }
  
  log('❌ Python not found. Please install Python 3.9+', 'red');
  process.exit(1);
}

function setupVirtualEnv(pythonCmd) {
  if (fs.existsSync(venvDir)) {
    log('✅ Virtual environment exists', 'green');
    return;
  }
  
  log('📦 Creating virtual environment...', 'yellow');
  if (!execCommand(`${pythonCmd} -m venv ${venvDir}`)) {
    log('❌ Failed to create virtual environment', 'red');
    process.exit(1);
  }
  log('✅ Virtual environment created', 'green');
}

function installDependencies(pythonCmd) {
  log('📦 Installing Python dependencies...', 'yellow');
  
  const pipCmd = isWindows 
    ? path.join(venvDir, 'Scripts', 'pip.exe')
    : path.join(venvDir, 'bin', 'pip');
  
  const requirementsFile = path.join(backendDir, 'requirements.txt');
  
  if (!fs.existsSync(requirementsFile)) {
    log('⚠️  requirements.txt not found, skipping dependency installation', 'yellow');
    return;
  }
  
  if (!execCommand(`"${pipCmd}" install -r "${requirementsFile}"`)) {
    log('⚠️  Failed to install some dependencies', 'yellow');
  } else {
    log('✅ Dependencies installed', 'green');
  }
}

function main() {
  log('\n🚀 Setting up backend environment...\n', 'blue');
  
  const pythonCmd = checkPython();
  setupVirtualEnv(pythonCmd);
  installDependencies(pythonCmd);
  
  log('\n✅ Backend setup complete!\n', 'green');
}

main();
