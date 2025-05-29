// Test script to start React app
process.chdir(__dirname);
console.log('Current directory:', process.cwd());
console.log('Checking React...');

try {
  const react = require('react');
  console.log('React found:', react.version);
} catch (e) {
  console.error('React not found:', e.message);
}

try {
  console.log('Starting React Scripts...');
  require('./node_modules/react-scripts/scripts/start.js');
} catch (e) {
  console.error('Error starting React Scripts:', e.message);
}
