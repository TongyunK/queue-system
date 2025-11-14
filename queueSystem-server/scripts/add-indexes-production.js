/**
 * 生产环境数据库索引添加脚本
 * 
 * 使用方法：
 * 1. 在添加索引前，请先备份数据库
 * 2. 在低峰期执行此脚本
 * 3. 执行命令：node scripts/add-indexes-production.js
 * 
 * 注意事项：
 * - SQLite 创建索引时会对表加锁，建议在业务低峰期执行
 * - 索引创建过程可能需要一些时间，取决于数据量大小
 * - 如果索引已存在，脚本会跳过（使用 IF NOT EXISTS）
 */

const path = require('path');
const { Sequelize } = require('sequelize');

// 使用 sqlite3 作为 SQLite 驱动（脚本环境）
// 创建数据库连接（使用生产环境的数据库路径）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log // 显示SQL执行日志
  // 不指定 dialectModule，使用默认的 sqlite3
});

// 索引列表
const indexes = [
  {
    name: 'idx_counter_business_last_ticket_business_type_id',
    table: 'counter_business_last_ticket',
    columns: ['business_type_id'],
    description: 'counter_business_last_ticket 表的 business_type_id 索引'
  },
  {
    name: 'idx_counter_business_last_ticket_counter_id',
    table: 'counter_business_last_ticket',
    columns: ['counter_id'],
    description: 'counter_business_last_ticket 表的 counter_id 索引'
  },
  {
    name: 'idx_counter_business_last_ticket_composite',
    table: 'counter_business_last_ticket',
    columns: ['business_type_id', 'counter_id'],
    description: 'counter_business_last_ticket 表的复合索引'
  },
  {
    name: 'idx_counters_ip_address',
    table: 'counters',
    columns: ['ip_address'],
    description: 'counters 表的 ip_address 索引'
  },
  {
    name: 'idx_ticket_sequences_business_type_date',
    table: 'ticket_sequences',
    columns: ['business_type_id', 'date'],
    description: 'ticket_sequences 表的复合索引'
  }
];

// 检查索引是否已存在
async function indexExists(indexName) {
  try {
    const [results] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name='${indexName}'
    `);
    return results.length > 0;
  } catch (error) {
    console.error(`检查索引 ${indexName} 时出错:`, error.message);
    return false;
  }
}

// 添加单个索引
async function addIndex(index) {
  try {
    // 检查索引是否已存在
    const exists = await indexExists(index.name);
    if (exists) {
      console.log(`⏭️  索引 ${index.name} 已存在，跳过`);
      return { success: true, skipped: true };
    }

    // 构建SQL语句
    const columns = index.columns.join(', ');
    const sql = `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${columns});`;

    console.log(`\n📝 正在添加索引: ${index.name}`);
    console.log(`   描述: ${index.description}`);
    console.log(`   SQL: ${sql}`);

    const startTime = Date.now();
    await sequelize.query(sql);
    const duration = Date.now() - startTime;

    console.log(`✅ 索引 ${index.name} 添加成功 (耗时: ${duration}ms)`);
    return { success: true, skipped: false, duration };
  } catch (error) {
    console.error(`❌ 添加索引 ${index.name} 失败:`, error.message);
    return { success: false, error: error.message };
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('生产环境数据库索引添加脚本');
  console.log('='.repeat(60));
  console.log(`数据库路径: ${sequelize.config.storage}`);
  console.log(`执行时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('='.repeat(60));

  // 测试数据库连接
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }

  // 统计信息
  const stats = {
    total: indexes.length,
    success: 0,
    skipped: 0,
    failed: 0,
    totalDuration: 0
  };

  // 逐个添加索引
  for (const index of indexes) {
    const result = await addIndex(index);
    if (result.success) {
      if (result.skipped) {
        stats.skipped++;
      } else {
        stats.success++;
        if (result.duration) {
          stats.totalDuration += result.duration;
        }
      }
    } else {
      stats.failed++;
    }
  }

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log('索引添加完成 - 统计信息');
  console.log('='.repeat(60));
  console.log(`总计: ${stats.total} 个索引`);
  console.log(`成功: ${stats.success} 个`);
  console.log(`跳过: ${stats.skipped} 个 (已存在)`);
  console.log(`失败: ${stats.failed} 个`);
  if (stats.totalDuration > 0) {
    console.log(`总耗时: ${stats.totalDuration}ms`);
  }
  console.log('='.repeat(60));

  // 关闭数据库连接
  await sequelize.close();
  console.log('\n✅ 脚本执行完成');
}

// 执行主函数
main().catch(error => {
  console.error('\n❌ 脚本执行失败:', error);
  process.exit(1);
});

