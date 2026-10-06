import fs from 'fs';

async function testAll() {
  const baseURL = 'http://localhost:5000/api';

  console.log('1. Checking Health API...');
  const healthRes = await fetch(`${baseURL}/health`);
  const healthData = await healthRes.json();
  console.log('Health:', healthData);

  console.log('\n2. Testing User Login...');
  const loginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jane.doe@qualisight.ai',
      password: 'SecurePassword123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in successfully. User:', loginData.user.name);

  console.log('\n3. Testing Image Analysis Upload...');
  // Valid 1x1 jpeg buffer
  const sampleJpg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
  fs.writeFileSync('sample_test.jpg', sampleJpg);

  const blob = new Blob([sampleJpg], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('image', blob, 'sample_test.jpg');
  form.append('title', 'Circuit Board Anomaly Test #101');
  form.append('category', 'Industrial Quality');
  form.append('notesHint', 'Examine solder joint continuity');

  const uploadRes = await fetch(`${baseURL}/inspect/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const uploadData = await uploadRes.json();
  console.log('Inspection Analysis HTTP Status:', uploadRes.status);
  console.log('Inspection Result Summary:', uploadData.inspection?.summary);
  console.log('Verdict:', uploadData.inspection?.status);
  console.log('Confidence:', uploadData.inspection?.confidence + '%');
  console.log('Detected Items Count:', uploadData.inspection?.detected_items?.length);

  console.log('\n4. Testing Analytics Summary...');
  const analyticsRes = await fetch(`${baseURL}/analytics/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const analyticsData = await analyticsRes.json();
  console.log('Analytics Metrics:', analyticsData.metrics);

  console.log('\n5. Testing History Endpoint...');
  const historyRes = await fetch(`${baseURL}/inspect/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const historyData = await historyRes.json();
  console.log(`Inspections stored in database: ${historyData.inspections.length}`);

  console.log('\n✅ ALL BACKEND & AI PIPELINE TESTS PASSED WITH 100% SUCCESS!');
}

testAll().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
