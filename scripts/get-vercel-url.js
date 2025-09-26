#!/usr/bin/env node

/**
 * Script to get the current Vercel production URL
 * Usage: node scripts/get-vercel-url.js
 */

const { execSync } = require('child_process');

try {
  // Get the latest production deployment
  const output = execSync('vercel ls --json', { encoding: 'utf8' });
  const deployments = JSON.parse(output);
  
  // Find the most recent successful production deployment
  const productionDeployment = deployments.find(deployment => 
    deployment.state === 'READY' && 
    deployment.target === 'production'
  );
  
  if (productionDeployment) {
    console.log('🚀 Current Production URL:', productionDeployment.url);
    console.log('📅 Deployed:', new Date(productionDeployment.createdAt).toLocaleString());
    
    // Also show the stable pattern
    const projectName = productionDeployment.name;
    console.log('🔗 Stable URL Pattern:', `https://${projectName}.vercel.app`);
  } else {
    console.log('❌ No production deployment found');
  }
} catch (error) {
  console.error('Error getting Vercel URL:', error.message);
  console.log('💡 Make sure you have Vercel CLI installed and are logged in');
  console.log('   npm install -g vercel');
  console.log('   vercel login');
}