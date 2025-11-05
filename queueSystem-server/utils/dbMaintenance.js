const { sequelize, BusinessType, Counter, Setting } = require('../models');
const { updateBusinessTypes } = require('./updateBusinessTypes');

/**
 * 重置特定表的數據
 * @param {string} tableName - 表名
 */
const resetTable = async (tableName) => {
  try {
    console.log(`開始重置表 ${tableName}...`);
    
    // 根據表名獲取對應的模型
    let model;
    switch (tableName.toLowerCase()) {
      case 'business_types':
      case 'businesstypes':
        model = BusinessType;
        break;
      case 'counters':
        model = Counter;
        break;
      case 'settings':
        model = Setting;
        break;
      default:
        throw new Error(`不支持的表名: ${tableName}`);
    }
    
    // 刪除表中所有數據
    await model.destroy({ where: {}, truncate: true, cascade: true });
    console.log(`已清空表 ${tableName} 中的所有數據`);
    
    // 如果是業務類型表，重新填充數據
    if (model === BusinessType) {
      await BusinessType.bulkCreate([
        { name: '優惠客戶專綫', code: 'A', prefix: 'A' },
        { name: '訂購專綫', code: 'B', prefix: 'B' },
        { name: '特快訂購專綫', code: 'C', prefix: 'C' },
        { name: '訪問服務', code: 'D', prefix: 'D' },
        { name: '總裁組服務專綫', code: 'E', prefix: 'E' }
      ]);
      console.log(`已重新填充業務類型數據`);
    }
    
    // 如果是窗口表，重新填充數據
    else if (model === Counter) {
      await Counter.bulkCreate([
        { counter_number: 1, name: '1號窗口', status: 'closed' },
        { counter_number: 2, name: '2號窗口', status: 'closed' },
        { counter_number: 3, name: '3號窗口', status: 'closed' },
        { counter_number: 4, name: '4號窗口', status: 'closed' },
        { counter_number: 5, name: '5號窗口', status: 'closed' },
        { counter_number: 6, name: '6號窗口', status: 'closed' }
      ]);
      console.log(`已重新填充窗口數據`);
    }
    
    // 如果是設置表，重新填充數據
    else if (model === Setting) {
      await Setting.bulkCreate([
        { key: 'voice_enabled', value: 'true', description: '是否啟用語音' },
        { key: 'voice_volume', value: '80', description: '語音音量(0-100)' },
        { key: 'display_rows', value: '10', description: '顯示屏顯示的行數' }
      ]);
      console.log(`已重新填充設置數據`);
    }
    
    console.log(`表 ${tableName} 重置完成！`);
  } catch (error) {
    console.error(`重置表 ${tableName} 失敗:`, error);
    throw error;
  }
};

/**
 * 顯示命令行使用說明
 */
const showHelp = () => {
  console.log(`
數據庫維護工具使用說明：
  node dbMaintenance.js <命令> [參數]

可用命令：
  update-names     更新業務類型名稱（簡體轉繁體）
  reset-table      重置指定表的數據
  help             顯示此幫助信息

例子：
  node dbMaintenance.js update-names
  node dbMaintenance.js reset-table business_types
  `);
};

// 主函數
const main = async () => {
  // 獲取命令行參數
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'update-names':
        await updateBusinessTypes();
        break;
        
      case 'reset-table':
        const tableName = args[1];
        if (!tableName) {
          console.error('錯誤: 請指定要重置的表名');
          showHelp();
          process.exit(1);
        }
        await resetTable(tableName);
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
    
    process.exit(0);
  } catch (error) {
    console.error('執行失敗:', error);
    process.exit(1);
  }
};

// 如果直接執行此腳本，則運行主函數
if (require.main === module) {
  main();
}

module.exports = {
  resetTable,
  updateBusinessTypes
};
