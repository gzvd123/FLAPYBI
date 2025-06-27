#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 Flappy Bird Quick Test');
console.log('========================');

// Check if game files exist
const gameFiles = ['index.html', 'style.css', 'game.js', 'manifest.json', 'sw.js'];
const missingFiles = gameFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('❌ Missing files:', missingFiles.join(', '));
    console.log('Please make sure all game files are in the current directory.');
    process.exit(1);
}

console.log('✅ All game files found');

// Try to install http-server if not exists
try {
    execSync('npx http-server --version', { stdio: 'pipe' });
} catch (error) {
    console.log('📦 Installing http-server...');
    execSync('npm install -g http-server', { stdio: 'inherit' });
}

console.log('\n🚀 Starting game server...');
console.log('🌐 Game will open at: http://localhost:8080');
console.log('📱 To test on mobile: Use your computer\'s IP address');
console.log('\n⚡ Quick Actions:');
console.log('   1. Test game on browser');
console.log('   2. Open browser DevTools (F12)');
console.log('   3. Toggle device emulation for mobile testing');
console.log('   4. Test PWA installation (Install App button)');
console.log('\n🎮 Game Features (Kid-Friendly):');
console.log('   • Easier difficulty - wider gaps, slower speed');
console.log('   • More frequent power-ups');
console.log('   • Longer power-up duration');
console.log('   • Positive encouragement messages');
console.log('\n🛑 Press Ctrl+C to stop server');
console.log('\n' + '='.repeat(50));

try {
    execSync('npx http-server . -p 8080 -o -c-1', { stdio: 'inherit' });
} catch (error) {
    console.log('\n⚠️  Server stopped');
} 