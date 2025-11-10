const { sequelize } = require('../models');

const createTicketSequencesTable = async () => {
  try {
    // 检查ticket_sequences表是否存在
    const [results] = await sequelize.query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='ticket_sequences';
    `);

    // 如果表不存在，则创建
    if (results.length === 0) {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ticket_sequences" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "business_type_id" INTEGER NOT NULL,
          "date" DATE NOT NULL,
          "business_code" VARCHAR(10),
          "current_total_number" INTEGER DEFAULT 0,
          "current_passed_number" INTEGER DEFAULT 0,
          "created_at" DATETIME NOT NULL,
          "updated_at" DATETIME NOT NULL,
          FOREIGN KEY ("business_type_id") REFERENCES "business_types" ("id"),
          UNIQUE ("business_type_id", "date")
        );
      `);
      console.log('ticket_sequences表已创建');
    } else {
      console.log('ticket_sequences表已存在');
    }
  } catch (error) {
    console.error('创建ticket_sequences表失败:', error);
  }
};

module.exports = createTicketSequencesTable;
