/**
 * 数据库索引添加脚本
 * 用于在现有数据库上添加性能优化所需的索引
 * 
 * 注意：索引是性能优化项，不是必需的
 * - 如果索引添加失败，不会影响程序正常运行
 * - 只是查询性能可能会稍慢一些
 * - 程序启动时会自动尝试添加索引
 */
const { sequelize } = require('../models');

async function addDatabaseIndexes() {
  try {
    console.log('正在检查并添加数据库索引（性能优化）...');

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 添加 counter_business_last_ticket 表的索引
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_counter_business_last_ticket_business_type_id 
        ON counter_business_last_ticket(business_type_id);
      `);
      console.log('✓ 索引已就绪: idx_counter_business_last_ticket_business_type_id');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        skippedCount++;
      } else {
        console.warn('⚠️  索引添加跳过（不影响运行）: idx_counter_business_last_ticket_business_type_id -', error.message);
        errorCount++;
      }
    }

    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_counter_business_last_ticket_counter_id 
        ON counter_business_last_ticket(counter_id);
      `);
      console.log('✓ 索引已就绪: idx_counter_business_last_ticket_counter_id');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        skippedCount++;
      } else {
        console.warn('⚠️  索引添加跳过（不影响运行）: idx_counter_business_last_ticket_counter_id -', error.message);
        errorCount++;
      }
    }

    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_counter_business_last_ticket_composite 
        ON counter_business_last_ticket(business_type_id, counter_id);
      `);
      console.log('✓ 索引已就绪: idx_counter_business_last_ticket_composite');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        skippedCount++;
      } else {
        console.warn('⚠️  索引添加跳过（不影响运行）: idx_counter_business_last_ticket_composite -', error.message);
        errorCount++;
      }
    }

    // 添加 counters 表的 ip_address 索引
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_counters_ip_address 
        ON counters(ip_address);
      `);
      console.log('✓ 索引已就绪: idx_counters_ip_address');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        skippedCount++;
      } else {
        console.warn('⚠️  索引添加跳过（不影响运行）: idx_counters_ip_address -', error.message);
        errorCount++;
      }
    }

    // 确认 ticket_sequences 表的复合索引存在
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_ticket_sequences_business_type_date 
        ON ticket_sequences(business_type_id, date);
      `);
      console.log('✓ 索引已就绪: idx_ticket_sequences_business_type_date');
      successCount++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        skippedCount++;
      } else {
        console.warn('⚠️  索引添加跳过（不影响运行）: idx_ticket_sequences_business_type_date -', error.message);
        errorCount++;
      }
    }

    // 输出统计信息
    const total = successCount + skippedCount + errorCount;
    if (total > 0) {
      console.log(`数据库索引检查完成: ${successCount} 个就绪, ${skippedCount} 个已存在, ${errorCount} 个跳过`);
      if (errorCount > 0) {
        console.log('提示: 索引是性能优化项，即使添加失败也不影响程序正常运行');
      }
    }
  } catch (error) {
    // 即使发生严重错误，也不抛出异常，确保程序可以继续运行
    console.warn('⚠️  数据库索引检查时发生错误（不影响程序运行）:', error.message);
    console.warn('提示: 索引是性能优化项，程序可以正常运行，只是查询可能稍慢');
  }
}

module.exports = { addDatabaseIndexes };

