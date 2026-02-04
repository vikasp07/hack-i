/**
 * Test Script for Restoration API
 * Run: node test-restoration-api.js
 */

const BASE_URL = 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: ${name}`, 'blue');
  log(`URL: ${url}`, 'yellow');
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`✓ Success (${duration}ms)`, 'green');
      log('\nResponse Data:', 'cyan');
      console.log(JSON.stringify(data, null, 2));
      return true;
    } else {
      log(`✗ Failed: ${data.message || data.error}`, 'red');
      console.log(data);
      return false;
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🌳 RESTORATION API TEST SUITE', 'green');
  log('='.repeat(60), 'cyan');
  
  const results = [];
  
  // Test 1: GET with coordinates
  results.push(await testEndpoint(
    'GET with coordinates (Mumbai)',
    `${BASE_URL}/api/restoration?lat=19.076&lon=72.878`
  ));
  
  // Test 2: GET with location
  results.push(await testEndpoint(
    'GET with location name',
    `${BASE_URL}/api/restoration?location=Amazon%20Rainforest`
  ));
  
  // Test 3: POST with coordinates
  results.push(await testEndpoint(
    'POST with coordinates',
    `${BASE_URL}/api/restoration`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 48.8566, lon: 2.3522 })
    }
  ));
  
  // Test 4: POST with location
  results.push(await testEndpoint(
    'POST with location',
    `${BASE_URL}/api/restoration`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Nairobi, Kenya' })
    }
  ));
  
  // Test 5: Invalid request (no parameters)
  results.push(await testEndpoint(
    'Invalid request (should fail)',
    `${BASE_URL}/api/restoration`
  ));
  
  // Test 6: Invalid coordinates
  results.push(await testEndpoint(
    'Invalid coordinates (should fail)',
    `${BASE_URL}/api/restoration?lat=999&lon=999`
  ));
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r).length;
  const failed = results.length - passed;
  
  log(`Total Tests: ${results.length}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (passed === results.length) {
    log('\n✓ All tests passed!', 'green');
  } else {
    log('\n✗ Some tests failed', 'red');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/restoration?lat=0&lon=0`);
    return true;
  } catch (error) {
    log('\n✗ Server not running!', 'red');
    log('Please start the development server:', 'yellow');
    log('  npm run dev', 'cyan');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
})();
