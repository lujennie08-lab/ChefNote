// Quick test to verify the image upload works
console.log('Testing image upload endpoint...');

const testImageUpload = async () => {
  // Create a sample base64 image (1x1 red pixel PNG)
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  try {
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'test.png',
        data: sampleBase64,
      }),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Upload result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run test
testImageUpload().then(result => {
  if (result && result.url) {
    console.log('✅ Upload endpoint working!');
    console.log('Image URL:', result.url);
  } else {
    console.log('❌ Upload endpoint failed or returned unexpected response');
  }
});
