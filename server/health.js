const http = require('http');

const port = process.env.PORT || 5000;
const healthUrl = `http://localhost:${port}/health`;

console.log(`Checking health at ${healthUrl}...`);

http.get(healthUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk.toString()}`);
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Server is healthy!');
    } else {
      console.log('❌ Server is not healthy');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error checking server health:', err.message);
});