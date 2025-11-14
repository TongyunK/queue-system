const path = require('path');
const fs = require('fs');

/**
 * 获取数据库文件路径
 * 在打包后的环境中，数据库文件应该放在可执行文件同目录下
 * @returns {string} 数据库文件路径
 */
function getDatabasePath() {
  // 如果设置了环境变量，优先使用
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  // 判断是否在打包环境中（pkg 打包后 __dirname 会指向快照目录）
  const isPacked = typeof process.pkg !== 'undefined';
  
  if (isPacked) {
    // 打包环境：数据库文件放在可执行文件同目录下
    const execPath = process.execPath; // 可执行文件路径
    const execDir = path.dirname(execPath);
    const dbPath = path.join(execDir, 'database.sqlite');
    
    // 如果数据库文件不存在，尝试从打包的资源中复制模板
    if (!fs.existsSync(dbPath)) {
      // pkg 打包的资源在快照目录中
      // 在打包环境中，__dirname 指向快照目录，数据库文件应该在快照目录的根目录
      // 尝试多个可能的路径
      const possiblePaths = [
        path.join(__dirname, '../../database.sqlite'), // 从 utils 目录向上两级
        path.join(__dirname, '../database.sqlite'),    // 从 utils 目录向上一级
        path.join(process.cwd(), 'database.sqlite'),  // 当前工作目录
      ];
      
      // 如果以上路径都不存在，尝试从快照目录查找
      // pkg 打包后，资源文件在快照目录中，路径类似: /snapshot/queue-system-server/database.sqlite
      const snapshotBase = __dirname.split(path.sep).slice(0, -2).join(path.sep); // 去掉 utils 和 queue-system-server
      if (snapshotBase) {
        possiblePaths.push(path.join(snapshotBase, 'database.sqlite'));
      }
      
      let copied = false;
      for (const templateDbPath of possiblePaths) {
        if (fs.existsSync(templateDbPath)) {
          try {
            fs.copyFileSync(templateDbPath, dbPath);
            console.log(`已从打包资源中复制初始数据库文件: ${templateDbPath} -> ${dbPath}`);
            copied = true;
            break;
          } catch (error) {
            console.warn(`复制数据库模板失败 (${templateDbPath}):`, error.message);
          }
        }
      }
      
      if (!copied) {
        console.log('未找到打包的数据库模板，将创建新的空数据库');
      }
    }
    
    return dbPath;
  } else {
    // 开发环境：使用项目目录下的数据库文件
    return path.join(__dirname, '../database.sqlite');
  }
}

module.exports = { getDatabasePath };

