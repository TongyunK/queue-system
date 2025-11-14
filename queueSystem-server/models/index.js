const { Sequelize } = require('sequelize');
const { getDatabasePath } = require('../utils/getDatabasePath');
const initModels = require('../generated-models-auto/init-models');
const { loadSqlite3 } = require('../utils/loadSqlite3');

// 判断是否在打包环境中
const isPacked = typeof process.pkg !== 'undefined';

// 动态加载 SQLite 驱动
// 只使用 sqlite3，不使用 better-sqlite3
let dialectModule;
const attempts = [];

try {
  dialectModule = loadSqlite3();
  console.log(`✓ 使用 sqlite3 作为 SQLite 驱动${isPacked ? '（打包环境）' : '（开发环境）'}`);
} catch (error) {
  attempts.push(`sqlite3 加载失败: ${error.message}`);
  dialectModule = undefined;
  
  // 如果加载失败，输出详细错误信息
  console.error('❌ 无法加载 sqlite3 模块');
  console.error('   尝试的方法:');
  attempts.forEach((attempt, index) => {
    console.error(`   ${index + 1}. ${attempt}`);
  });
  
  if (isPacked) {
    console.error('\n解决方法（打包环境）:');
    console.error('   1. 确保 sqlite3 已正确安装: npm install sqlite3');
    console.error('   2. 重新构建原生模块: npm rebuild sqlite3');
    console.error('   3. 将 queueSystem-server/node_modules/sqlite3 复制到可执行文件同目录的 node_modules/sqlite3');
    console.error('   4. 检查 package.json 中的 pkg.assets 配置是否包含 sqlite3');
    console.error('   5. 或使用 PM2 直接运行 Node.js 代码（推荐）');
  } else {
    console.error('\n解决方法（开发环境）:');
    console.error('   1. 安装 sqlite3: npm install sqlite3');
    console.error('   2. 重新构建: npm rebuild sqlite3');
  }
  
  console.log('\n⚠ 警告: 将尝试让 Sequelize 自动加载 SQLite 驱动（可能失败）');
}

// 创建SQLite连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: getDatabasePath(),
  logging: false, // 禁用SQL查询日志输出
  dialectModule: dialectModule // 明确指定 SQLite 驱动
});

// 初始化所有模型
const models = initModels(sequelize);

// 获取数据库中实际存在的表
async function getActualTables() {
  try {
    // 查询SQLite系统表获取所有表名
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    return results.map(r => r.name);
  } catch (error) {
    console.error('获取数据库表失败:', error);
    return [];
  }
}

// 导出sequelize实例和所有模型
// 由于models是根据实际数据库通过generate-models-auto.js生成的，
// 所以我们可以直接导出所有模型，确保只包含数据库中存在的表
module.exports = {
  sequelize,
  ...models
};
