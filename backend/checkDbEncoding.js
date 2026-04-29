const { Sequelize } = require('sequelize');
const iconv = require('iconv-lite');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 54321,
  username: 'postgres',
  password: 'root',
  database: 'fitness_app',
  logging: false
});

async function checkData() {
  try {
    // 检查数据库编码
    const dbEncoding = await sequelize.query(
      `SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = 'fitness_app'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('数据库编码:', dbEncoding[0]);

    // 获取原始字节
    const result = await sequelize.query(
      `SELECT name, name_zh FROM exercise_library LIMIT 3`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    result.forEach((row, i) => {
      const bytes = Buffer.from(row.name_zh, 'utf8');
      console.log(`\n行 ${i + 1}:`);
      console.log(`  name: ${row.name}`);
      console.log(`  name_zh hex: ${bytes.toString('hex')}`);
      console.log(`  name_zh bytes: ${Array.from(bytes).join(', ')}`);
      
      // 尝试用 GBK 解码这些字节
      try {
        const gbkDecoded = iconv.decode(bytes, 'gbk');
        console.log(`  GBK decoded: ${gbkDecoded}`);
      } catch (e) {}
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}

checkData();
