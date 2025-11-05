const { Sequelize } = require('sequelize');
const path = require('path');
const initModels = require('../generated-models-auto/init-models');

// 创建SQLite连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false // 禁用SQL查询日志输出
});

// 初始化所有模型
const models = initModels(sequelize);

// 解构模型以便单独导出
const {
  businessTypes: BusinessType,
  counters: Counter,
  tickets: Ticket,
  ticketSequences: TicketSequence,
  callLogs: CallLog,
  settings: Setting
} = models;

// 自定义关联已移除 - counters表现在使用current_ticket_number而不是外键

// 导出所有模型和sequelize实例
module.exports = {
  sequelize,
  BusinessType,
  Counter,
  Ticket,
  TicketSequence,
  CallLog,
  Setting
};
