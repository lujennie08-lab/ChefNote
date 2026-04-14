// 👨‍💻 在浏览器 Console 中运行此脚本来测试图片上传功能
// 打开浏览器开发者工具 (F12)，进入 Console 标签，复制粘贴以下代码

console.log('🧪 ChefNote 图片上传测试脚本');
console.log('════════════════════════════════');

// 测试 1: 检查后端连接
console.log('\n[测试 1] 检查后端连接...');
fetch('http://localhost:3001/api/recipes')
  .then(r => {
    console.log('✅ 后端可访问 (状态码:', r.status, ')');
    return r.json();
  })
  .then(data => {
    console.log('✅ 数据加载成功，菜谱数:', data.length);
  })
  .catch(e => {
    console.error('❌ 后端不可访问:', e.message);
    console.error('   请确保已运行: cd chefnote-api && node bin/www');
  });

// 测试 2: 测试上传端点
console.log('\n[测试 2] 测试上传端点...');

// 创建一个测试用的小图片 (1x1 红色像素)
const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'test-upload.png',
    data: testBase64,
  }),
})
  .then(r => {
    console.log('✅ 上传请求成功 (状态码:', r.status, ')');
    return r.json();
  })
  .then(data => {
    if (data.code === 0) {
      console.log('✅ 上传完成! URL:', data.url);
      console.log('   可以访问:', 'http://localhost:3001' + data.url);
    } else {
      console.error('❌ 上传失败:', data.message);
    }
  })
  .catch(e => {
    console.error('❌ 上传端点异常:', e.message);
    console.error('   请确保 routes/upload.js 已创建');
  });

// 测试 3: 验证文件系统
console.log('\n[测试 3] 文件系统检查 (需要后端日志)');
console.log('   检查后端输出是否包含:');
console.log('   ✅ Image uploaded successfully: /uploads/...');
console.log('   如果没有，检查是否有错误信息');

console.log('\n════════════════════════════════');
console.log('测试完成！检查上面的结果。');
console.log('');
console.log('💡 提示:');
console.log('   - 确保后端正在运行');
console.log('   - 确保已创建 chefnote-api/routes/upload.js');
console.log('   - 检查后端日志中是否有错误');
