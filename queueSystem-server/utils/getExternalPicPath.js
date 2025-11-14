const path = require('path');
const fs = require('fs');

/**
 * 获取外部图片目录路径
 * 在打包后的可执行文件中，优先使用可执行文件同目录下的 pic 文件夹
 * 如果不存在，则使用打包内的 public/pic 目录
 */
function getExternalPicPath() {
  // 判断是否在 pkg 打包环境中
  const isPkg = typeof process.pkg !== 'undefined';
  
  if (isPkg) {
    // 在 pkg 环境中，需要获取可执行文件所在目录
    // process.execPath 是可执行文件的完整路径
    const execDir = path.dirname(process.execPath);
    const externalPicPath = path.join(execDir, 'pic');
    
    // 检查外部图片目录是否存在
    if (fs.existsSync(externalPicPath)) {
      return externalPicPath;
    }
    
    // 如果外部目录不存在，返回 null，让调用者使用默认的 public/pic 路径
    return null;
  } else {
    // 开发环境：检查是否有外部 pic 目录（项目根目录下的 pic）
    const projectRoot = path.resolve(__dirname, '../..');
    const externalPicPath = path.join(projectRoot, 'pic');
    
    if (fs.existsSync(externalPicPath)) {
      return externalPicPath;
    }
    
    // 使用默认的 public/pic 目录
    return null;
  }
}

/**
 * 获取图片文件的完整路径
 * @param {string} imagePath - 图片相对路径，例如：/pic/ticket_bg.jpg
 * @returns {string} - 图片的完整路径
 */
function getImageFullPath(imagePath) {
  // 移除开头的 /pic/ 前缀
  const relativePath = imagePath.replace(/^\/pic\//, '');
  
  // 先尝试外部目录
  const externalPicPath = getExternalPicPath();
  if (externalPicPath) {
    const externalImagePath = path.join(externalPicPath, relativePath);
    if (fs.existsSync(externalImagePath)) {
      return externalImagePath;
    }
  }
  
  // 使用默认的 public/pic 目录
  const defaultPicPath = path.join(__dirname, '../public/pic', relativePath);
  return defaultPicPath;
}

module.exports = {
  getExternalPicPath,
  getImageFullPath
};

