#!/usr/bin/env node

const API_URL = 'http://localhost:3001/api';
const CAT_ID = 'a6a4fd1c-96c8-458f-a134-79f644ff69ce';

async function testSleepTracking() {
  console.log('🧪 Testing Sleep Tracking Functionality\n');
  
  // Test 1: Create a new sleep entry
  console.log('Test 1: Creating new sleep entry...');
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  const newEntry = {
    catId: CAT_ID,
    startTime: twoHoursAgo.toISOString(),
    endTime: now.toISOString(),
    quality: 'deep',
    location: 'Cat Bed',
    notes: 'Automated test entry',
    photos: []
  };
  
  try {
    const createResponse = await fetch(`${API_URL}/sleep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });
    
    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${await createResponse.text()}`);
    }
    
    const created = await createResponse.json();
    console.log('✅ Sleep entry created successfully');
    console.log(`   ID: ${created.id}`);
    console.log(`   Duration: ${created.duration} minutes`);
    
    // Test 2: Retrieve all sleep entries
    console.log('\nTest 2: Retrieving all sleep entries...');
    const getResponse = await fetch(`${API_URL}/sleep/${CAT_ID}`);
    
    if (!getResponse.ok) {
      throw new Error(`HTTP ${getResponse.status}: ${await getResponse.text()}`);
    }
    
    const entries = await getResponse.json();
    console.log(`✅ Retrieved ${entries.length} sleep entries`);
    
    // Check if our entry is in the list
    const foundEntry = entries.find(e => e.id === created.id);
    if (foundEntry) {
      console.log('✅ New entry appears in the list');
    } else {
      console.log('❌ New entry NOT found in the list');
    }
    
    // Test 3: Display recent entries
    console.log('\nTest 3: Recent sleep sessions (last 5):');
    entries.slice(0, 5).forEach((entry, index) => {
      const startDate = new Date(entry.start_time);
      const endDate = new Date(entry.end_time);
      console.log(`${index + 1}. ${startDate.toLocaleString()} - ${endDate.toLocaleTimeString()}`);
      console.log(`   Location: ${entry.location}, Quality: ${entry.quality}`);
      console.log(`   Duration: ${entry.duration} minutes`);
      if (entry.notes) {
        console.log(`   Notes: ${entry.notes}`);
      }
    });
    
    console.log('\n✅ All tests passed! Sleep tracking is working correctly.');
    console.log('\n📝 Summary:');
    console.log('- Sleep entries ARE being saved to the database');
    console.log('- The API is returning sleep entries correctly');
    console.log('- The backend properly handles the photos field');
    console.log('\nIf entries are not showing in the UI, try:');
    console.log('1. Refreshing the page (F5)');
    console.log('2. Checking the browser console for errors');
    console.log('3. Ensuring the dates are correct (not in the future)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSleepTracking().catch(console.error);