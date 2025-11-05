const { BusinessType } = require('../models');

/**
 * 更新業務類型名稱（從簡體轉為繁體）
 */
const updateBusinessTypes = async () => {
  try {
    console.log('開始更新業務類型名稱...');
    
    // 業務類型映射（簡體 -> 繁體）
    const nameMapping = {
      '优惠客户专线': '優惠客戶專綫',
      '订购专线': '訂購專綫',
      '特快订购专线': '特快訂購專綫',
      '访问服务': '訪問服務',
      '总裁组服务专线': '總裁組服務專綫'
    };
    
    // 獲取所有業務類型
    const businessTypes = await BusinessType.findAll();
    console.log(`找到 ${businessTypes.length} 個業務類型記錄`);
    
    // 更新每個業務類型的名稱
    for (const type of businessTypes) {
      const oldName = type.name;
      const newName = nameMapping[oldName] || oldName;
      
      if (oldName !== newName) {
        await type.update({ name: newName });
        console.log(`已更新: "${oldName}" -> "${newName}"`);
      } else {
        console.log(`跳過: "${oldName}" (無需更新)`);
      }
    }
    
    console.log('業務類型名稱更新完成！');
  } catch (error) {
    console.error('更新業務類型失敗:', error);
    throw error;
  }
};

// 如果直接執行此腳本（非導入），則執行更新
if (require.main === module) {
  updateBusinessTypes()
    .then(() => {
      console.log('更新腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('更新腳本執行失敗:', error);
      process.exit(1);
    });
} else {
  // 作為模塊導出
  module.exports = {
    updateBusinessTypes
  };
}
