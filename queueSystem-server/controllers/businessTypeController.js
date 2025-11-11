const { businessTypes: BusinessType, sequelize, settings: Setting } = require('../models');

// 获取所有业务类型
const getAllBusinessTypes = async (req, res) => {
  try {
    const businessTypes = await BusinessType.findAll({
      where: { status: 'active' },
      order: [['code', 'ASC']]
    });
    res.json(businessTypes);
  } catch (error) {
    console.error('获取业务类型失败:', error);
    res.status(500).json({ message: '获取业务类型失败', error: error.message });
  }
};

// 创建业务类型
const createBusinessType = async (req, res) => {
  try {
    const { name, english_name, code, prefix } = req.body;
    const businessType = await BusinessType.create({
      name,
      english_name,
      code,
      prefix
    });
    res.status(201).json(businessType);
  } catch (error) {
    console.error('创建业务类型失败:', error);
    res.status(500).json({ message: '创建业务类型失败', error: error.message });
  }
};

// 更新业务类型
const updateBusinessType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, english_name, code, prefix, status } = req.body;
    const businessType = await BusinessType.findByPk(id);
    
    if (!businessType) {
      return res.status(404).json({ message: '未找到该业务类型' });
    }
    
    await businessType.update({
      name,
      english_name,
      code,
      prefix,
      status
    });
    
    res.json(businessType);
  } catch (error) {
    console.error('更新业务类型失败:', error);
    res.status(500).json({ message: '更新业务类型失败', error: error.message });
  }
};

// 获取所有业务类型及其最新服务号及对应柜台（用于显示屏）
const getBusinessTypesWithLatestTickets = async (req, res) => {
  try {
    // 使用 SQL 查询获取每个业务类型的最新服务号及对应柜台
    // 对每个业务类型（按 business_type_id 分组），按 last_ticket_no 降序排序
    // 使用 ROW_NUMBER() 标记每条记录的序号，筛选出序号为 1 的记录
    const query = `
      WITH RankedTickets AS (
        SELECT 
          bt.id AS business_type_id,
          bt.code,
          bt.name,
          bt.english_name,
          cblt.last_ticket_no,
          c.counter_number,
          c.name AS counter_name,
          ROW_NUMBER() OVER (
            PARTITION BY bt.id 
            ORDER BY 
              CASE 
                WHEN cblt.last_ticket_no IS NULL THEN 0
                ELSE 1
              END DESC,
              cblt.last_ticket_no DESC
          ) AS row_num
        FROM business_types bt
        LEFT JOIN counter_business_last_ticket cblt ON bt.id = cblt.business_type_id
        LEFT JOIN counters c ON cblt.counter_id = c.id
        WHERE bt.status = 'active'
      )
      SELECT 
        business_type_id,
        code,
        name,
        english_name,
        last_ticket_no,
        counter_number,
        counter_name
      FROM RankedTickets
      WHERE row_num = 1
      ORDER BY code ASC
    `;

    const [results] = await sequelize.query(query);

    // 处理结果，确保每个业务类型都有数据（即使没有服务记录）
    const allBusinessTypes = await BusinessType.findAll({
      where: { status: 'active' },
      order: [['code', 'ASC']]
    });

    const resultMap = new Map();
    results.forEach(row => {
      resultMap.set(row.business_type_id, row);
    });

    const finalResults = allBusinessTypes.map(bt => {
      const row = resultMap.get(bt.id);
      if (row) {
        return row;
      } else {
        // 如果没有服务记录，返回业务类型信息，服务号和柜台为空
        return {
          business_type_id: bt.id,
          code: bt.code,
          name: bt.name,
          english_name: bt.english_name,
          last_ticket_no: null,
          counter_number: null,
          counter_name: null
        };
      }
    });

    res.json(finalResults);
  } catch (error) {
    console.error('获取业务类型及最新服务号失败:', error);
    res.status(500).json({ message: '获取业务类型及最新服务号失败', error: error.message });
  }
};

// 获取显示屏备注信息
const getDisplayRemarks = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { key: 'display_remarks' }
    });
    
    if (!setting) {
      return res.json({ value: '' });
    }
    
    res.json({ value: setting.value || '' });
  } catch (error) {
    console.error('获取显示屏备注失败:', error);
    res.status(500).json({ message: '获取显示屏备注失败', error: error.message });
  }
};

module.exports = {
  getAllBusinessTypes,
  createBusinessType,
  updateBusinessType,
  getBusinessTypesWithLatestTickets,
  getDisplayRemarks
};
