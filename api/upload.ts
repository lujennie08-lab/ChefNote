import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS 头
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 简单的图片上传处理
// 注意：Vercel Serverless 无法持久化存储文件
// 生产环境建议使用：Vercel Blob, Cloudinary, 或 S3
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 405,
      data: null,
      message: 'Method not allowed'
    });
  }

  try {
    const { filename, fileContentBase64 } = req.body;

    if (!filename || !fileContentBase64) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'Missing filename or fileContentBase64'
      });
    }

    // 由于 Vercel Serverless 无持久化存储，这里返回一个临时的 data URL
    // 生产环境应该使用 Vercel Blob 或其他云存储服务

    // 生成 data URL (Base64 编码的图片可以直接在浏览器显示)
    const ext = filename.split('.').pop()?.toLowerCase() || 'png';
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                     ext === 'gif' ? 'image/gif' :
                     ext === 'webp' ? 'image/webp' : 'image/png';

    const dataUrl = `data:${mimeType};base64,${fileContentBase64}`;

    console.log('Upload successful, returning data URL');

    return res.status(200).json({
      code: 0,
      data: { url: dataUrl },
      url: dataUrl,
      message: 'Success'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      code: -1,
      data: null,
      message: error.message || 'Upload failed'
    });
  }
}
