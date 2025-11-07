const { ticketSequences, businessTypes, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取当前日期，格式为 YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 取票功能
const createTicket = async (businessTypeId) => {
  const today = getTodayDate();

  return sequelize.transaction(async (t) => {
    // 查找今天的票号序列
    let ticketSequence = await ticketSequences.findOne({
      where: {
        business_type_id: businessTypeId,
        date: today
      },
      transaction: t,
      lock: t.LOCK.UPDATE // 锁定行以防止并发问题
    });

    // 如果今天没有记录，则创建一条新记录
    if (!ticketSequence) {
      const businessType = await businessTypes.findByPk(businessTypeId, { transaction: t });
      if (!businessType) {
        throw new Error('业务类型不存在');
      }

      // 创建新的票号序列
      ticketSequence = await ticketSequences.create({
        business_type_id: businessTypeId,
        date: today,
        business_code: businessType.code,
        current_total_number: 0,
        'current_passed _number': 0 // 注意这里的字段名有空格，因为数据库模型中的定义有空格
      }, { transaction: t });
    }

    // 增加当前总票号
    await ticketSequence.increment('current_total_number', { transaction: t });
    
    // 重新加载以获取最新值
    await ticketSequence.reload({ transaction: t });

    // 获取业务类型信息
    const businessType = await businessTypes.findByPk(businessTypeId);

    // 生成票号（不使用短横线）
    const ticketNumber = `${businessType.prefix}${String(ticketSequence.current_total_number).padStart(3, '0')}`;
    
    // 计算等待人数（减去1，因为当前用户不算在等待人数中）
    const waitingCount = Math.max(0, ticketSequence.current_total_number - ticketSequence['current_passed _number'] - 1);

    return {
      ticket_number: ticketNumber,
      waiting_count: waitingCount,
      business_type_name: businessType.name,
      business_type_english_name: businessType.english_name
    };
  });
};

// 获取等待人数
const getWaitingCount = async (businessTypeId) => {
  const today = getTodayDate();

  const ticketSequence = await ticketSequences.findOne({
    where: {
      business_type_id: businessTypeId,
      date: today
    }
  });

  if (!ticketSequence) {
    return 0; // 如果今天还没有取票记录，则等待人数为0
  }

  return Math.max(0, ticketSequence.current_total_number - ticketSequence['current_passed _number'] - 1);
};

module.exports = {
  createTicket,
  getWaitingCount
};
