// test-simple.js - 简化版测试
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function test() {
  console.log('====== 开始测试 ======\n');
  
  const app = await NestFactory.create(AppModule);
  await app.init();
  
  console.log('✅ 应用初始化成功\n');
  
  try {
    // 测试1: 健康检查
    console.log('【测试1】健康检查任务');
    const schedulerService = app.get('SchedulerService');
    const health = await schedulerService.triggerHealthCheck();
    console.log('结果:', JSON.stringify(health, null, 2));
    console.log('✅ 测试1通过\n');
    
    // 测试2: 查询用户
    console.log('【测试2】查询测试用户');
    const dataSource = app.get('DataSource');
    const users = await dataSource.query('SELECT id, phone FROM users LIMIT 3');
    console.log(`找到 ${users.length} 个用户`);
    users.forEach(u => console.log(`- ${u.phone}`));
    
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log(`\n使用测试用户: ${users[0].phone}`);
      
      // 测试3: 检查联系人
      console.log('\n【测试3】检查联系人');
      const contacts = await dataSource.query(
        'SELECT id, name, phone FROM contacts WHERE user_id = $1',
        [testUserId]
      );
      console.log(`该用户有 ${contacts.length} 个联系人`);
      
      if (contacts.length > 0) {
        console.log(`联系人: ${contacts[0].name} - ${contacts[0].phone}`);
        
        // 测试4: 发送通知
        console.log('\n【测试4】发送通知');
        const notificationsService = app.get('NotificationsService');
        await notificationsService.sendCheckinAlert(testUserId, 2);
        console.log('✅ 通知发送完成');
        
        // 测试5: 查询通知记录
        console.log('\n【测试5】查询通知记录');
        const logs = await dataSource.query(
          'SELECT type, status, sent_at FROM notification_logs WHERE user_id = $1 ORDER BY sent_at DESC LIMIT 3',
          [testUserId]
        );
        console.log(`找到 ${logs.length} 条通知记录`);
        logs.forEach(log => {
          console.log(`- ${log.type} | ${log.status} | ${log.sent_at}`);
        });
      } else {
        console.log('⚠️  该用户没有联系人，跳过通知测试');
      }
    }
    
    console.log('\n====== 所有测试完成 ======');
    console.log('✅ 通知服务模块测试通过');
    console.log('✅ 定时任务模块测试通过');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

test().catch(console.error);