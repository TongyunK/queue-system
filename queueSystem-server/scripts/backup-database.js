/**
 * 数据库备份脚本
 * 在生产环境添加索引前，建议先备份数据库
 * 
 * 使用方法：
 * node scripts/backup-database.js
 */

const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../database.sqlite');
const backupDir = path.join(__dirname, '../backups');

// 创建备份目录
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 生成备份文件名（包含时间戳）
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFileName = `database-backup-${timestamp}.sqlite`;
const backupPath = path.join(backupDir, backupFileName);

try {
  // 检查数据库文件是否存在
  if (!fs.existsSync(databasePath)) {
    console.error(`❌ 数据库文件不存在: ${databasePath}`);
    process.exit(1);
  }

  // 获取数据库文件信息
  const stats = fs.statSync(databasePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('='.repeat(60));
  console.log('数据库备份脚本');
  console.log('='.repeat(60));
  console.log(`源文件: ${databasePath}`);
  console.log(`文件大小: ${fileSizeMB} MB`);
  console.log(`备份路径: ${backupPath}`);
  console.log('='.repeat(60));

  // 复制数据库文件
  console.log('\n📋 正在备份数据库...');
  fs.copyFileSync(databasePath, backupPath);
  
  // 验证备份文件
  const backupStats = fs.statSync(backupPath);
  if (backupStats.size === stats.size) {
    console.log(`✅ 备份成功！`);
    console.log(`   备份文件: ${backupPath}`);
    console.log(`   文件大小: ${(backupStats.size / (1024 * 1024)).toFixed(2)} MB`);
  } else {
    console.error(`❌ 备份文件大小不匹配！`);
    console.error(`   源文件: ${stats.size} 字节`);
    console.error(`   备份文件: ${backupStats.size} 字节`);
    process.exit(1);
  }

  console.log('\n💡 提示: 备份文件已保存，如需恢复，请将备份文件复制回原位置');
  console.log(`   恢复命令: copy "${backupPath}" "${databasePath}"`);
} catch (error) {
  console.error('\n❌ 备份失败:', error.message);
  process.exit(1);
}

