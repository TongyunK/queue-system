# 数据库维护脚本

## 📁 脚本列表

### 1. backup-database.js
**数据库备份脚本**

在添加索引或进行其他数据库操作前，建议先备份数据库。

```bash
# 使用 npm 脚本
npm run backup-db

# 或直接执行
node scripts/backup-database.js
```

备份文件保存在 `backups/` 目录，文件名格式：`database-backup-YYYY-MM-DDTHH-MM-SS.sqlite`

### 2. add-indexes-production.js
**生产环境索引添加脚本**

用于在生产环境中安全地添加性能优化所需的数据库索引。

```bash
# 使用 npm 脚本
npm run add-indexes

# 或直接执行
node scripts/add-indexes-production.js
```

## 🚀 快速开始

### 生产环境索引添加流程

```bash
# 1. 备份数据库
npm run backup-db

# 2. 添加索引（建议在业务低峰期执行）
npm run add-indexes

# 3. 验证索引（可选）
sqlite3 database.sqlite ".indices"
```

## ⚠️ 注意事项

1. **备份优先**：执行任何数据库操作前，务必先备份
2. **选择时机**：索引创建会对表加锁，建议在业务低峰期执行
3. **监控影响**：创建索引时可能短暂影响查询性能
4. **验证结果**：执行后检查脚本输出，确认所有索引添加成功

## 📚 详细文档

更多信息请参考：[生产环境索引添加指南](../README-生产环境索引添加指南.md)

