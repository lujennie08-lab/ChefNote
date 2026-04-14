var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Upload directory for images
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
const UPLOAD_URL_BASE = '/uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /api/upload - Handle base64 file upload
router.post('/upload', (req, res) => {
  try {
    const { filename, data } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ 
        code: -1, 
        message: 'Missing filename or data' 
      });
    }

    // Extract base64 content (remove data:image/xxx;base64, prefix)
    let base64String = data;
    if (data.includes(',')) {
      base64String = data.split(',')[1];
    }

    // Validate base64 string
    if (!base64String || base64String.length < 10) {
      console.error('❌ Invalid base64 data - too short');
      return res.status(400).json({ 
        code: -1, 
        message: 'Invalid base64 data' 
      });
    }

    console.log('📥 Processing upload:', filename, 'Base64 length:', base64String.length);

    // Convert base64 to buffer
    let buffer;
    try {
      buffer = Buffer.from(base64String, 'base64');
    } catch (e) {
      console.error('❌ Base64 decode error:', e.message);
      return res.status(400).json({ 
        code: -1, 
        message: 'Invalid base64 format' 
      });
    }

    if (buffer.length < 10) {
      console.error('❌ Decoded buffer too small:', buffer.length, 'bytes');
      return res.status(400).json({ 
        code: -1, 
        message: 'Decoded file is corrupt' 
      });
    }

    console.log('✅ Decoded successfully, buffer size:', buffer.length, 'bytes');

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const uniqueName = `${basename}-${timestamp}${ext}`;
    const filepath = path.join(UPLOAD_DIR, uniqueName);

    // Write file to disk
    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error('❌ File write error:', err);
        return res.status(500).json({ 
          code: -1, 
          message: 'Failed to save file' 
        });
      }

      const imageUrl = `${UPLOAD_URL_BASE}/${uniqueName}`;
      const fullUrl = `http://localhost:3001${imageUrl}`;
      
      console.log('✅ Image uploaded successfully:');
      console.log('   File:', filepath);
      console.log('   Size:', buffer.length, 'bytes');
      console.log('   URL:', fullUrl);
      
      res.json({
        code: 0,
        url: fullUrl,  // Return absolute URL
        message: 'Upload successful'
      });
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      code: -1, 
      message: 'Upload failed: ' + error.message 
    });
  }
});

module.exports = router;

