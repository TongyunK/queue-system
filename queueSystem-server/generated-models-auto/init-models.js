var DataTypes = require("sequelize").DataTypes;
var _businessTypes = require("./businessTypes");
var _callLogs = require("./callLogs");
var _counters = require("./counters");
var _settings = require("./settings");
var _ticketSequences = require("./ticketSequences");
var _tickets = require("./tickets");

function initModels(sequelize) {
  var businessTypes = _businessTypes(sequelize, DataTypes);
  var callLogs = _callLogs(sequelize, DataTypes);
  var counters = _counters(sequelize, DataTypes);
  var settings = _settings(sequelize, DataTypes);
  var ticketSequences = _ticketSequences(sequelize, DataTypes);
  var tickets = _tickets(sequelize, DataTypes);

  callLogs.belongsTo(businessTypes, { as: "businessType", foreignKey: "businessTypeId"});
  businessTypes.hasMany(callLogs, { as: "call_logs", foreignKey: "businessTypeId"});
  ticketSequences.belongsTo(businessTypes, { as: "business_type", foreignKey: "business_type_id"});
  businessTypes.hasMany(ticketSequences, { as: "ticket_sequences", foreignKey: "business_type_id"});
  tickets.belongsTo(businessTypes, { as: "businessType", foreignKey: "businessTypeId"});
  businessTypes.hasMany(tickets, { as: "tickets", foreignKey: "businessTypeId"});
  callLogs.belongsTo(counters, { as: "counter", foreignKey: "counterId"});
  counters.hasMany(callLogs, { as: "call_logs", foreignKey: "counterId"});
  // devices关联已移除
  tickets.belongsTo(counters, { as: "counter", foreignKey: "counterId"});
  counters.hasMany(tickets, { as: "tickets", foreignKey: "counterId"});
  callLogs.belongsTo(tickets, { as: "ticket", foreignKey: "ticketId"});
  tickets.hasMany(callLogs, { as: "call_logs", foreignKey: "ticketId"});

  return {
    businessTypes,
    callLogs,
    counters,
    settings,
    ticketSequences,
    tickets,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
