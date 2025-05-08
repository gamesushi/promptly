const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.js');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /"image":\s*"([^"]+)"/g,
  (match, p1) => {
    // 提取文件名（去掉路径，只保留文件名）
    const filename = path.basename(p1, path.extname(p1)) + '.webp';
    const cdnUrl = `https://cdn.jsdelivr.net/gh/hebeihang/picx-images-hosting@master/${filename}`;
    return `"image": "${cdnUrl}"`;
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('全部 image 字段已替换为 CDN 路径！');