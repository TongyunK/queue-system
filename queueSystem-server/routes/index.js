const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const counterController = require('../controllers/counterController');
const businessTypeController = require('../controllers/businessTypeController');
const adminRoutes = require('./admin');
const adminSystemRoutes = require('./adminRoutes');

// API文档路由 - 显示所有可用的API端点
router.get('/', (req, res) => {
  const apiEndpoints = [
    { method: 'GET', path: '/api/business-types', description: '获取所有业务类型' },
    { method: 'GET', path: '/api/tickets/current', description: '获取当前票号' },
    { method: 'POST', path: '/api/tickets', description: '创建新票号' },
    { method: 'PUT', path: '/api/tickets/:id/status', description: '更新票号状态' },
    { method: 'GET', path: '/api/counters', description: '获取所有窗口信息' },
    { method: 'PUT', path: '/api/counters/:id', description: '更新窗口信息' },
    { method: 'POST', path: '/api/counters/:id/next', description: '叫号下一位客户' },
    { method: 'POST', path: '/api/counters/:id/call-manual', description: '手动叫号指定客户' },
    { method: 'POST', path: '/api/counters/:id/end-service', description: '结束当前服务' },
    { method: 'GET', path: '/api/admin/tables', description: '获取数据库所有表' },
    { method: 'GET', path: '/api/admin/tables/:tableName/schema', description: '获取表结构' },
    { method: 'GET', path: '/api/admin/tables/:tableName/data', description: '获取表数据' },
    { method: 'POST', path: '/api/admin/query', description: '执行自定义SQL查询' },
    { method: 'GET', path: '/adminer/', description: 'SQLite数据库管理界面' },
    { method: 'POST', path: '/api/admin-system/login', description: '管理员登录验证' },
    { method: 'GET', path: '/api/admin-system/settings', description: '获取所有系统设置' },
    { method: 'PUT', path: '/api/admin-system/settings/:key', description: '更新系统设置' },
    { method: 'POST', path: '/api/admin-system/change-password', description: '更改管理员密码' },
    { method: 'GET', path: '/api/admin-system/devices', description: '获取所有设备' },
    { method: 'POST', path: '/api/admin-system/devices', description: '创建新设备' },
    { method: 'PUT', path: '/api/admin-system/devices/:id', description: '更新设备信息' },
    { method: 'DELETE', path: '/api/admin-system/devices/:id', description: '删除设备' },
    { method: 'POST', path: '/api/admin-system/devices/:deviceId/bind/:counterId', description: '绑定设备到窗口' },
    { method: 'POST', path: '/api/admin-system/devices/:deviceId/unbind', description: '解除设备与窗口的绑定' }
  ];

  // 生成HTML格式的API文档
  const html = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>队列系统API文档</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      h1 { color: #1a73e8; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
      tr:hover { background-color: #f5f5f5; }
      .method { font-weight: bold; }
      .get { color: #4CAF50; }
      .post { color: #2196F3; }
      .put { color: #FF9800; }
      .delete { color: #F44336; }
    </style>
  </head>
  <body>
    <h1>队列系统API文档</h1>
    <table>
      <tr>
        <th>请求方法</th>
        <th>接口路径</th>
        <th>描述</th>
      </tr>
      ${apiEndpoints.map(endpoint => `
        <tr>
          <td class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</td>
          <td>${endpoint.path}</td>
          <td>${endpoint.description}</td>
        </tr>
      `).join('')}
    </table>
  </body>
  </html>
  `;

  res.send(html);
});

// 业务类型路由
router.get('/business-types', businessTypeController.getAllBusinessTypes);

// 取号路由
router.post('/tickets', ticketController.createTicket);
router.get('/tickets/current', ticketController.getCurrentTickets);
router.get('/tickets/waiting-counts', ticketController.getWaitingCounts);
router.put('/tickets/:id/status', ticketController.updateTicketStatus);

// 窗口路由
router.get('/counters', counterController.getAllCounters);
router.put('/counters/:id', counterController.updateCounter);
router.post('/counters/:id/next', counterController.callNextTicket);
router.post('/counters/:id/call-manual', counterController.callManualTicket);
router.post('/counters/:id/end-service', counterController.endService);

// 管理员数据库工具路由
router.use('/admin', adminRoutes);

// 系统管理路由
router.use('/admin-system', adminSystemRoutes);

module.exports = router;
