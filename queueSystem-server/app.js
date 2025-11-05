const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', routes);

// 静态文件服务 - 前端构建文件将放在这里
app.use(express.static(path.join(__dirname, 'public')));

// SQLite数据库管理界面路由
app.get('/adminer', (req, res) => {
  res.redirect('/adminer/');
});
app.get('/adminer/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminer', 'index.html'));
});

// SPA模式 - 处理前端路由
// 处理所有前端路由
app.use((req, res, next) => {
  // 排除API路径和Socket.IO路径
  // 注意：/admin 路径用于前端的管理员界面，而 /api/admin 用于后端数据库管理API
  if (
    (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) ||
    (req.path.startsWith('/admin/') && !req.path.startsWith('/api/admin/'))
  ) {
    // console.log('将请求转发到前端路由:', req.path);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
