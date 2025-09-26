const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building frontend for Vercel deployment...');

try {
  // Navigate to frontend directory and build
  process.chdir('frontend');
  
  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Build the React app
  console.log('⚛️  Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Frontend build complete!');
  
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}