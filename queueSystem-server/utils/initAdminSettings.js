const { settings: Setting } = require('../models');
const bcrypt = require('bcryptjs');

// 初始化管理员设置
async function initAdminSettings() {
  try {
    // 检查是否已存在管理员密码设置
    const adminPassword = await Setting.findOne({ where: { key: 'admin_password' } });

    // 如果不存在，创建默认管理员密码 (默认为 'admin123')
    if (!adminPassword) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      
      await Setting.create({
        key: 'admin_password',
        value: hashedPassword,
        description: '管理员登录密码 (默认: admin123)'
      });
      
      console.log('已创建默认管理员密码: admin123');
    }

    // 检查并创建其他系统设置项
    const settingsToCreate = [
      {
        key: 'ticket_reset_time',
        value: '00:00',
        description: '每日票号重置时间 (24小时制, 例如: 00:00)'
      },
      {
        key: 'ticket_banner_image',
        value: '/pic/ticket_bg.jpg',
        description: '取票页面背景图片路径 (例如: /pic/ticket_bg.jpg)'
      },
      {
        key: 'display_banner_image',
        value: '/pic/display_bg.png',
        description: '显示屏背景图片路径 (例如: /pic/display_bg.png)'
      }
    ];

    for (const setting of settingsToCreate) {
      const exists = await Setting.findOne({ where: { key: setting.key } });
      if (!exists) {
        await Setting.create(setting);
        console.log(`已创建系统设置: ${setting.key}`);
      }
    }

    console.log('管理员设置初始化完成');
  } catch (error) {
    console.error('初始化管理员设置失败:', error);
  }
}

module.exports = { initAdminSettings };
