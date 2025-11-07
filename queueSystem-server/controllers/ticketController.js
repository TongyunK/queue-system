const ticketService = require('../services/ticketService');

// 取票
const getTicket = async (req, res) => {
  try {
    const { businessTypeId } = req.body;
    
    if (!businessTypeId) {
      return res.status(400).json({ message: '业务类型ID不能为空' });
    }

    const ticketInfo = await ticketService.createTicket(businessTypeId);
    res.status(200).json(ticketInfo);
  } catch (error) {
    console.error('取票失败:', error);
    res.status(500).json({ message: '取票失败', error: error.message });
  }
};

// 获取特定业务类型的等待人数
const getWaitingCountForBusinessType = async (req, res) => {
  try {
    const { businessTypeId } = req.params;
    const waitingCount = await ticketService.getWaitingCount(businessTypeId);
    res.status(200).json({ waiting_count: waitingCount });
  } catch (error) {
    console.error('获取等待人数失败:', error);
    res.status(500).json({ message: '获取等待人数失败', error: error.message });
  }
};

module.exports = {
  getTicket,
  getWaitingCountForBusinessType
};
