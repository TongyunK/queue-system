const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');
const { getDatabasePath } = require('../utils/getDatabasePath');

// 管理界面根路径
router.get('/', (req, res) => {
  // 记录请求信息以便调试
  console.log('收到/admin/请求');
  
  try {
    console.log('尝试发送文件:', path.join(__dirname, '../public/adminer/index.html'));
    
    // 检查文件是否存在
    const filePath = path.join(__dirname, '../public/adminer/index.html');
    if (!require('fs').existsSync(filePath)) {
      console.error('文件不存在:', filePath);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>数据库管理</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .error { color: red; }
            .links { margin-top: 20px; }
            .links a { display: block; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>数据库管理</h1>
          <p class="error">错误: 管理界面文件未找到 (${filePath})。</p>
          <div class="links">
            <a href="/adminer/">尝试访问Adminer界面</a>
            <a href="/api">查看API文档</a>
            <a href="/api/admin/tables">查看数据库表列表</a>
          </div>
        </body>
        </html>
      `);
    }
    
    // 使用express的sendFile函数的回调来捕获错误
    res.sendFile(filePath, err => {
      if (err) {
        console.error('发送文件时出错:', err);
        
        if (err.code === 'ENOENT') {
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>数据库管理</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .error { color: red; }
                .links { margin-top: 20px; }
                .links a { display: block; margin-bottom: 10px; }
              </style>
            </head>
            <body>
              <h1>数据库管理</h1>
              <p class="error">错误: 管理界面文件未找到 (${err.path})。</p>
              <div class="links">
                <a href="/adminer/">尝试访问Adminer界面</a>
                <a href="/api">查看API文档</a>
              </div>
            </body>
            </html>
          `);
        } else {
          res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>服务器错误</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .error { color: red; }
                pre { background: #f8f8f8; padding: 10px; overflow: auto; }
              </style>
            </head>
            <body>
              <h1>服务器错误</h1>
              <p class="error">访问管理界面时发生错误</p>
              <pre>${err.stack || err.message || JSON.stringify(err)}</pre>
            </body>
            </html>
          `);
        }
      }
    });
  } catch (error) {
    console.error('加载数据库管理界面失败:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>服务器错误</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .error { color: red; }
          pre { background: #f8f8f8; padding: 10px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>服务器错误</h1>
        <p class="error">加载数据库管理界面时发生错误</p>
        <pre>${error.stack || error.message}</pre>
      </body>
      </html>
    `);
  }
});

// 测试路由 - 用于确认路由本身是否正常工作
router.get('/test', (req, res) => {
  res.json({ message: '管理路由测试成功' });
});

// 直接HTML渲染路由
router.get('/html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>数据库管理 - 直接HTML</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .links { margin-top: 20px; }
        .links a { display: block; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>数据库管理界面</h1>
      <p>这是直接通过路由渲染的HTML页面，不依赖文件系统。</p>
      <div class="links">
        <a href="/api/admin/tables">查看数据库表列表</a>
        <a href="/api/admin/test">测试API路由</a>
        <a href="/adminer/">访问Adminer界面</a>
      </div>
    </body>
    </html>
  `);
});

// 获取所有表名
router.get('/tables', (req, res) => {
  try {
    const dbPath = getDatabasePath();
    const db = new Database(dbPath, { readonly: true });
    
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    db.close();
    res.json(tables);
  } catch (error) {
    console.error('获取表结构失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取表结构
router.get('/tables/:tableName/schema', (req, res) => {
  try {
    const { tableName } = req.params;
    const dbPath = getDatabasePath();
    const db = new Database(dbPath, { readonly: true });
    
    const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
    
    db.close();
    res.json(tableInfo);
  } catch (error) {
    console.error('获取表结构失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 查询表数据
router.get('/tables/:tableName/data', (req, res) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    const dbPath = getDatabasePath();
    const db = new Database(dbPath, { readonly: true });
    
    const data = db.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`).all(limit, offset);
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    
    db.close();
    
    res.json({
      data,
      total: count.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取表数据失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 执行自定义SQL查询
router.post('/query', express.json(), (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: '必须提供SQL查询' });
    }
    
    const dbPath = getDatabasePath();
    const db = new Database(dbPath);
    
    let result;
    // 检查SQL语句类型
    const sqlType = sql.trim().split(' ')[0].toUpperCase();
    
    if (sqlType === 'SELECT') {
      result = db.prepare(sql).all();
    } else {
      result = db.prepare(sql).run();
    }
    
    db.close();
    res.json(result);
  } catch (error) {
    console.error('执行SQL查询失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
