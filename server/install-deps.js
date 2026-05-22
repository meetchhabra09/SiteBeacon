import { execSync } from 'child_process';

console.log('Installing missing analytics dependencies...');

try {
  execSync('npm install chart.js chartjs-node-canvas', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  console.log('✓ Dependencies installed successfully!');
} catch (error) {
  console.error('✗ Failed to install dependencies:', error.message);
  process.exit(1);
}
