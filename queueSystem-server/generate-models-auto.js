const SequelizeAuto = require('sequelize-auto');
const path = require('path');

const auto = new SequelizeAuto(null, null, null, {
  dialect: 'sqlite',
  directory: path.join(__dirname, 'generated-models-auto'), // 输出目录
  caseFile: 'c', // 使用驼峰式命名文件
  caseModel: 'c', // 使用驼峰式命名模型
  caseProp: 's', // 使用蛇形命名属性，与数据库字段匹配
  additional: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  storage: path.join(__dirname, 'database.sqlite'),
  closeConnectionAutomatically: true
});

// 生成模型
auto.run().then(data => {
  console.log('模型已生成！');
  console.log('表：', Object.keys(data.tables));
}).catch(err => {
  console.error('生成模型出错:', err);
});
