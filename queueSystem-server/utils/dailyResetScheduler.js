const cron = require('node-cron');
const { sequelize, settings, ticketSequences, counters } = require('../models');

/**
 * 每日重置定时任务
 * 从settings表读取ticket_reset_time，每天在指定时间执行重置操作
 */
class DailyResetScheduler {
    constructor() {
        this.cronJob = null; // 定时任务
        this.isRunning = false;
        this.currentCronExpression = null; // 记录当前的 cron 表达式
    }

    /**
     * 获取重置时间（从settings表）
     */
    async getResetTime() {
        try {
            const setting = await settings.findOne({
                where: { key: 'ticket_reset_time' }
            });

            if (!setting || !setting.value) {
                console.warn('未找到 ticket_reset_time 设置，使用默认时间 00:00');
                return '00:00';
            }

            return setting.value.trim();
        } catch (error) {
            console.error('读取重置时间失败:', error);
            return '00:00'; // 默认时间
        }
    }

    /**
     * 执行重置操作
     */
    async performReset() {
        console.log('开始执行每日重置任务...');

        try {
            const today = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD

            // 开始事务
            await sequelize.transaction(async (t) => {
                // 1. 重置 ticket_sequences 表
                // 更新所有记录的 current_total_number 和 current_passed_number 为 0，date 设置为当前日期
                await sequelize.query(
                    `UPDATE ticket_sequences 
                    SET current_total_number = 0, 
                        current_passed_number = 0, 
                        date = :today,
                        updated_at = datetime('now')`,
                    {
                        replacements: { today },
                        transaction: t
                    }
                );

                // 2. 清空 ticket_sequences 表的 last_ticket_no 字段（如果字段存在）
                // 注意：如果字段不存在，这个操作会被忽略
                try {
                    // 先检查字段是否存在
                    const [columns] = await sequelize.query(
                        `PRAGMA table_info(ticket_sequences)`,
                        { transaction: t }
                    );
                    const hasLastTicketNo = columns.some(col => col.name === 'last_ticket_no');

                    if (hasLastTicketNo) {
                        await sequelize.query(
                            `UPDATE ticket_sequences 
                            SET last_ticket_no = NULL,
                                updated_at = datetime('now')
                            WHERE last_ticket_no IS NOT NULL`,
                            {
                                transaction: t
                            }
                        );
                        console.log('- ticket_sequences 表的 last_ticket_no 已清空');
                    } else {
                        console.log('- ticket_sequences 表没有 last_ticket_no 字段，跳过清空操作');
                    }
                } catch (error) {
                    // 如果检查失败，尝试直接执行更新（如果字段不存在会失败，但会被捕获）
                    try {
                        await sequelize.query(
                            `UPDATE ticket_sequences 
                            SET last_ticket_no = NULL,
                                updated_at = datetime('now')
                            WHERE last_ticket_no IS NOT NULL`,
                            {
                                transaction: t
                            }
                        );
                        console.log('- ticket_sequences 表的 last_ticket_no 已清空');
                    } catch (updateError) {
                        if (updateError.message && updateError.message.includes('no such column')) {
                            console.log('- ticket_sequences 表没有 last_ticket_no 字段，跳过清空操作');
                        } else {
                            throw updateError;
                        }
                    }
                }

                // 3. 清空 counters 表的所有记录的 current_ticket_number 字段
                await counters.update(
                    { current_ticket_number: null },
                    {
                        where: {},
                        transaction: t
                    }
                );

                console.log('每日重置任务执行成功');
                console.log(`- 重置日期: ${today}`);
                console.log('- ticket_sequences 表的 current_total_number 和 current_passed_number 已重置为 0');
                console.log('- ticket_sequences 表的 date 已更新为当前日期');
                console.log('- counters 表的 current_ticket_number 已清空');
            });
        } catch (error) {
            console.error('执行每日重置任务失败:', error);
            throw error;
        }
    }

    /**
     * 将时间字符串（如 "00:00" 或 "23:59"）转换为 cron 表达式
     */
    timeToCronExpression(timeString) {
        try {
            const [hours, minutes] = timeString.split(':').map(Number);

            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                throw new Error(`无效的时间格式: ${timeString}`);
            }

            // cron 格式: 分钟 小时 日 月 星期
            // 每天在指定时间执行
            return `${minutes} ${hours} * * *`;
        } catch (error) {
            console.error('时间格式转换失败:', error);
            return '0 0 * * *'; // 默认：每天 00:00
        }
    }

    /**
     * 启动定时任务
     */
    async start() {
        if (this.isRunning) {
            console.log('定时任务已在运行中');
            return;
        }

        try {
            // 获取重置时间
            const resetTime = await this.getResetTime();
            const cronExpression = this.timeToCronExpression(resetTime);

            console.log(`设置每日重置任务，执行时间: ${resetTime} (cron: ${cronExpression})`);

            // 停止旧的定时任务（如果存在）
            if (this.cronJob) {
                this.cronJob.stop();
            }

            // 创建新的定时任务
            this.cronJob = cron.schedule(cronExpression, async () => {
                console.log(`定时任务触发 - ${new Date().toLocaleString('zh-CN')}`);
                await this.performReset();
            }, {
                scheduled: true,
                timezone: 'Asia/Shanghai' // 使用中国时区
            });

            this.currentCronExpression = cronExpression; // 保存当前的 cron 表达式
            this.isRunning = true;
            console.log('每日重置定时任务已启动');

            // 监听 settings 表的变化，如果重置时间改变，重新启动定时任务
            this.setupSettingsWatcher();
        } catch (error) {
            console.error('启动定时任务失败:', error);
            throw error;
        }
    }

    /**
     * 设置 settings 表监听器，当 ticket_reset_time 改变时重新启动定时任务
     */
    setupSettingsWatcher() {
        // 每5分钟检查一次设置是否改变
        setInterval(async () => {
            try {
                const resetTime = await this.getResetTime();
                const newCronExpression = this.timeToCronExpression(resetTime);

                // 如果 cron 表达式改变，重新启动定时任务
                if (this.currentCronExpression && this.currentCronExpression !== newCronExpression) {
                    console.log('检测到重置时间设置已更改，重新启动定时任务...');
                    await this.restart();
                }
            } catch (error) {
                console.error('检查设置变化失败:', error);
            }
        }, 5 * 60 * 1000); // 每5分钟检查一次
    }

    /**
     * 停止定时任务
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.currentCronExpression = null;
        this.isRunning = false;
        console.log('每日重置定时任务已停止');
    }

    /**
     * 重启定时任务
     */
    async restart() {
        this.stop();
        await this.start();
    }

    /**
     * 手动触发重置（用于测试）
     */
    async manualReset() {
        console.log('手动触发重置任务...');
        await this.performReset();
    }
}

// 创建单例实例
const scheduler = new DailyResetScheduler();

module.exports = scheduler;

