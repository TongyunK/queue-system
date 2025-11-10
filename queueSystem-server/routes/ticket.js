const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// 取票
router.post('/tickets', ticketController.getTicket);

// 叫号：处理下一个票号
router.post('/tickets/call-next', ticketController.callNext);

// 获取特定业务类型的等待人数
router.get('/tickets/waiting/:businessTypeId', ticketController.getWaitingCountForBusinessType);

// 批量获取所有业务类型的等待人数
router.get('/tickets/waiting-counts', ticketController.getAllWaitingCounts);

module.exports = router;
