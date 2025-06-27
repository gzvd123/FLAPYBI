#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐦 Flappy Bird APK Builder');
console.log('==========================');

// Configuration
const config = {
    appName: 'Flappy Bird Vui Nhộn',
    packageId: 'com.yourname.flappybird',
    version: '1.0.0',
    projectDir: 'FlappyBirdApp'
};

// Helper function to run commands
function runCommand(command, description) {
    console.log(`\n📦 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed!`);
    } catch (error) {
        console.error(`❌ Error: ${description} failed`);
        console.error(error.message);
        process.exit(1);
    }
}

// Main build process
async function buildAPK() {
    try {
        // Check if Cordova is installed
        console.log('\n🔍 Checking Cordova installation...');
        try {
            execSync('cordova --version', { stdio: 'pipe' });
            console.log('✅ Cordova is installed');
        } catch (error) {
            console.log('❌ Cordova not found. Installing...');
            runCommand('npm install -g cordova', 'Installing Cordova');
        }

        // Create Cordova project if it doesn't exist
        if (!fs.existsSync(config.projectDir)) {
            runCommand(
                `cordova create ${config.projectDir} ${config.packageId} "${config.appName}"`,
                'Creating Cordova project'
            );
        }

        // Copy game files
        console.log('\n📁 Copying game files...');
        const wwwDir = path.join(config.projectDir, 'www');
        
        // Files to copy
        const filesToCopy = [
            'index.html',
            'style.css', 
            'game.js',
            'manifest.json',
            'sw.js'
        ];

        filesToCopy.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(wwwDir, file));
                console.log(`✅ Copied ${file}`);
            } else {
                console.log(`⚠️  Warning: ${file} not found`);
            }
        });

        // Change to project directory
        process.chdir(config.projectDir);

        // Add Android platform
        console.log('\n🤖 Setting up Android platform...');
        try {
            runCommand('cordova platform add android', 'Adding Android platform');
        } catch (error) {
            console.log('Android platform might already exist, continuing...');
        }

        // Update config.xml for better APK
        console.log('\n⚙️  Updating configuration...');
        updateConfigXml();

        // Build APK
        runCommand('cordova build android', 'Building APK');

        // Success message
        console.log('\n🎉 APK Build Complete!');
        console.log('📱 Your APK files are located at:');
        console.log(`   📁 platforms/android/app/build/outputs/apk/debug/app-debug.apk`);
        console.log(`   📁 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`);
        
        console.log('\n📖 Next steps:');
        console.log('   1. Install app-debug.apk on your device for testing');
        console.log('   2. Sign the release APK for distribution');
        console.log('   3. Test on different devices');

    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Update config.xml with better settings
function updateConfigXml() {
    const configPath = 'config.xml';
    
    if (fs.existsSync(configPath)) {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Add orientation preference
        if (!configContent.includes('orientation')) {
            configContent = configContent.replace(
                '</widget>',
                `    <preference name="orientation" value="portrait" />
    <preference name="Fullscreen" value="true" />
    <preference name="StatusBarOverlaysWebView" value="false" />
    <preference name="StatusBarBackgroundColor" value="#FF6B6B" />
    
    <!-- Android specific settings -->
    <platform name="android">
        <preference name="android-minSdkVersion" value="21" />
        <preference name="android-targetSdkVersion" value="30" />
        <allow-intent href="market:*" />
    </platform>
    
</widget>`
            );
            
            fs.writeFileSync(configPath, configContent);
            console.log('✅ Updated config.xml');
        }
    }
}

// Run if called directly
if (require.main === module) {
    buildAPK();
}

module.exports = { buildAPK }; 