const fs = require('fs');
const iconv = require('iconv-lite');

const filePath = 'd:\\Project\\pj1\\训练动作中文翻译.csv';
const buffer = fs.readFileSync(filePath);

// 检查文件头几个字节
console.log('文件前10字节 (hex):', buffer.slice(0, 10).toString('hex'));

// 尝试 UTF-8
console.log('\n--- UTF-8 解码 ---');
try {
  const utf8 = buffer.toString('utf8');
  console.log('前3行:');
  console.log(utf8.split('\n').slice(0, 3).join('\n'));
} catch (e) {
  console.log('UTF-8 解码失败:', e.message);
}

// 尝试 GBK (cp936)
console.log('\n--- GBK (cp936) 解码 ---');
try {
  const gbk = iconv.decode(buffer, 'cp936');
  console.log('前3行:');
  console.log(gbk.split('\n').slice(0, 3).join('\n'));
} catch (e) {
  console.log('GBK 解码失败:', e.message);
}

// 尝试 UTF-16LE
console.log('\n--- UTF-16LE 解码 ---');
try {
  const utf16 = iconv.decode(buffer, 'utf16');
  console.log('前3行:');
  console.log(utf16.split('\n').slice(0, 3).join('\n'));
} catch (e) {
  console.log('UTF-16LE 解码失败:', e.message);
}

// 尝试 GB18030
console.log('\n--- GB18030 解码 ---');
try {
  const gb18030 = iconv.decode(buffer, 'gb18030');
  console.log('前3行:');
  console.log(gb18030.split('\n').slice(0, 3).join('\n'));
} catch (e) {
  console.log('GB18030 解码失败:', e.message);
}
