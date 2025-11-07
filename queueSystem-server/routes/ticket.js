const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// 取票
router.post('/tickets', ticketController.getTicket);

// 获取特定业务类型的等待人数
router.get('/tickets/waiting/:businessTypeId', ticketController.getWaitingCountForBusinessType);

module.exports = router;
