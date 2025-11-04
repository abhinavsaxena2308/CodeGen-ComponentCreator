const fs = require('fs');

// Test the API
async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'create a simple button component',
        language: 'html'
      })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    // Also test the preview
    if (data.id) {
      console.log('\n--- Testing Preview ---');
      const previewResponse = await fetch(`http://localhost:5000/preview/${data.id}`);
      console.log('Preview Status:', previewResponse.status);
      const previewData = await previewResponse.text();
      console.log('Preview Length:', previewData.length);
      console.log('Preview Start:', previewData.substring(0, 200));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();