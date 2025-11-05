const { Counter, Ticket, BusinessType, CallLog, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取所有窗口
const getAllCounters = async (req, res) => {
  try {
    const counters = await Counter.findAll();
    
    // 获取相关的当前票号信息
    for (let counter of counters) {
      if (counter.current_ticket_number) {
        const ticket = await Ticket.findOne({
          where: { ticket_number: counter.current_ticket_number },
          include: [{ model: BusinessType }]
        });
        
        if (ticket) {
          counter.dataValues.currentTicket = ticket;
          counter.dataValues.currentBusinessType = ticket.businessType;
        }
      }
    }
    
    res.json(counters);
  } catch (error) {
    console.error('获取窗口列表失败:', error);
    res.status(500).json({ message: '获取窗口列表失败', error: error.message });
  }
};

// 更新窗口信息
const updateCounter = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const counter = await Counter.findByPk(id);
    if (!counter) {
      return res.status(404).json({ message: '窗口不存在' });
    }
    
    // 更新数据
    const updates = {};
    if (status) updates.status = status;
    
    await counter.update(updates);
    
    // 重新查询获取更新后的数据
    const updatedCounter = await Counter.findByPk(id);
    
    // 获取当前票号信息（如果有）
    if (updatedCounter.current_ticket_number) {
      const ticket = await Ticket.findOne({
        where: { ticket_number: updatedCounter.current_ticket_number },
        include: [{ model: BusinessType }]
      });
      
      if (ticket) {
        updatedCounter.dataValues.currentTicket = ticket;
        updatedCounter.dataValues.currentBusinessType = ticket.businessType;
      }
    }
    
    res.json(updatedCounter);
  } catch (error) {
    console.error('更新窗口失败:', error);
    res.status(500).json({ message: '更新窗口失败', error: error.message });
  }
};

// 叫下一位客户
const callNextTicket = async (req, res) => {
  const { id } = req.params;
  const { businessTypeId } = req.body;
  
  if (!businessTypeId) {
    return res.status(400).json({ message: '业务类型ID是必须的' });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(id);
    if (!counter) {
      await transaction.rollback();
      return res.status(404).json({ message: '窗口不存在' });
    }
    
    // 查找下一个等待的票号
    const nextTicket = await Ticket.findOne({
      where: {
        business_type_id: businessTypeId,
        status: 'waiting'
      },
      order: [['created_at', 'ASC']],
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    
    if (!nextTicket) {
      await transaction.rollback();
      return res.json(null); // 没有等待的客户
    }
    
    // 更新票号状态
    await nextTicket.update({
      status: 'called',
      counter_id: id,
      called_at: new Date()
    }, { transaction });
    
    // 更新窗口信息
    await counter.update({
      status: 'busy',
      current_ticket_number: nextTicket.ticket_number
    }, { transaction });
    
    // 创建叫号记录
    await CallLog.create({
      ticket_id: nextTicket.id,
      counter_id: id,
      business_type_id: businessTypeId,
      call_type: 'next'
    }, { transaction });
    
    await transaction.commit();
    
    // 获取业务类型名称
    const businessType = await BusinessType.findByPk(businessTypeId);
    
    // 返回叫号信息和窗口编号
    const result = {
      ...nextTicket.toJSON(),
      business_type_name: businessType ? businessType.name : '',
      counter_number: counter.counter_number
    };
    
    res.json(result);
  } catch (error) {
    await transaction.rollback();
    console.error('叫号失败:', error);
    res.status(500).json({ message: '叫号失败', error: error.message });
  }
};

// 手动叫号
const callManualTicket = async (req, res) => {
  const { id } = req.params;
  const { ticketNumber } = req.body;
  
  if (!ticketNumber) {
    return res.status(400).json({ message: '票号是必须的' });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(id);
    if (!counter) {
      await transaction.rollback();
      return res.status(404).json({ message: '窗口不存在' });
    }
    
    // 查找票号
    const ticket = await Ticket.findOne({
      where: { ticket_number: ticketNumber },
      include: [{ model: BusinessType }],
      transaction
    });
    
    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: '票号不存在' });
    }
    
    // 只有waiting或called状态的票号可以手动叫号
    if (!['waiting', 'called'].includes(ticket.status)) {
      await transaction.rollback();
      return res.status(400).json({ message: '票号已无效' });
    }
    
    // 更新票号状态
    await ticket.update({
      status: 'called',
      counter_id: id,
      called_at: new Date()
    }, { transaction });
    
    // 更新窗口信息
    await counter.update({
      status: 'busy',
      current_ticket_number: ticketNumber
    }, { transaction });
    
    // 创建叫号记录
    await CallLog.create({
      ticket_id: ticket.id,
      counter_id: id,
      business_type_id: ticket.business_type_id,
      call_type: 'manual'
    }, { transaction });
    
    await transaction.commit();
    
    // 返回叫号信息和窗口编号
    const result = {
      ...ticket.toJSON(),
      business_type_name: ticket.businessType ? ticket.businessType.name : '',
      counter_number: counter.counter_number
    };
    
    res.json(result);
  } catch (error) {
    await transaction.rollback();
    console.error('手动叫号失败:', error);
    res.status(500).json({ message: '手动叫号失败', error: error.message });
  }
};

// 结束服务
const endService = async (req, res) => {
  const { id } = req.params;
  
  const transaction = await sequelize.transaction();
  
  try {
    const counter = await Counter.findByPk(id);
    
    if (!counter) {
      await transaction.rollback();
      return res.status(404).json({ message: '窗口不存在' });
    }
    
    // 如果存在当前票号，获取票号详情并更新状态
    if (counter.current_ticket_number) {
      const currentTicket = await Ticket.findOne({
        where: { ticket_number: counter.current_ticket_number }
      });
      
      if (currentTicket) {
        // 更新票号状态为已完成
        await currentTicket.update({
          status: 'completed',
          completed_at: new Date()
        }, { transaction });
      }
    }
    
    // 更新窗口状态
    await counter.update({
      status: 'available',
      current_ticket_number: null
    }, { transaction });
    
    await transaction.commit();
    
    res.json({ success: true, message: '服务已结束' });
  } catch (error) {
    await transaction.rollback();
    console.error('结束服务失败:', error);
    res.status(500).json({ message: '结束服务失败', error: error.message });
  }
};

module.exports = {
  getAllCounters,
  updateCounter,
  callNextTicket,
  callManualTicket,
  endService
};
