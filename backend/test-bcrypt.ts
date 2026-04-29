import bcrypt from 'bcrypt';

console.log('测试bcrypt导入...');

try {
  console.log('bcrypt导入成功');
  
  // 测试bcrypt功能
  const password = 'test123';
  console.log('生成密码哈希...');
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('bcrypt哈希失败:', err);
      process.exit(1);
    }
    console.log('bcrypt哈希成功:', hash);
    console.log('测试完成！');
    process.exit(0);
  });
} catch (error) {
  console.error('bcrypt导入失败:', error);
  process.exit(1);
}
