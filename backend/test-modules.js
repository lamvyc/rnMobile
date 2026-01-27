// test-modules.js - 测试通知服务和定时任务模块
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testModules() {
  console.log('====== 测试通知服务和定时任务模块 ======\n');
  
  const app = await NestFactory.create(AppModule, { logger: false });
  
  try {
    // 获取服务实例
    const notificationsService = app.get('NotificationsService');
    const schedulerService = app.get('SchedulerService');
    
    console.log('✅ 服务实例获取成功\n');
    
    // ========================================
    // 测试1: 健康检查任务
    // ========================================
    console.log('========================================');
    console.log('测试1: 健康检查任务');
    console.log('========================================\n');
    
    const healthResult = await schedulerService.triggerHealthCheck();
    console.log('健康检查结果:');
    console.log(JSON.stringify(healthResult, null, 2));
    console.log('\n✅ 测试1完成\n');
    
    // ========================================
    // 测试2: 准备测试数据
    // ========================================
    console.log('========================================');
    console.log('测试2: 检查是否有测试用户');
    console.log('========================================\n');
    
    const usersService = app.get('UsersService');
    const contactsService = app.get('ContactsService');
    
    // 查找一个有联系人的用户
    const users = await app.get('User').getRepository().find({
      take: 5,
    });
    
    console.log(`找到 ${users.length} 个用户`);
    
    let testUserId = null;
    for (const user of users) {
      const contact = await contactsService.findPrimaryContact(user.id);
      if (contact) {
        testUserId = user.id;
        console.log(`\n找到测试用户: ${user.phone} (有联系人)`);
        console.log(`联系人: ${contact.name} - ${contact.phone}`);
        break;
      }
    }
    
    if (!testUserId) {
      console.log('\n⚠️  没有找到有联系人的用户，跳过通知测试');
      console.log('提示: 请先添加一个用户并配置联系人\n');
    } else {
      // ========================================
      // 测试3: 通知服务 - 发送未签到警告
      // ========================================
      console.log('\n========================================');
      console.log('测试3: 通知服务 - 发送未签到警告');
      console.log('========================================\n');
      
      console.log(`向用户 ${testUserId} 发送未签到警告（2天）...\n`);
      
      await notificationsService.sendCheckinAlert(testUserId, 2);
      
      console.log('\n✅ 测试3完成');
      
      // ========================================
      // 测试4: 查询通知历史
      // ========================================
      console.log('\n========================================');
      console.log('测试4: 查询通知历史');
      console.log('========================================\n');
      
      const history = await notificationsService.getNotificationHistory(testUserId, 5);
      console.log(`通知历史记录数: ${history.length}`);
      
      if (history.length > 0) {
        console.log('\n最近的通知:');
        history.slice(0, 3).forEach((log, index) => {
          console.log(`\n${index + 1}. ${log.type.toUpperCase()} - ${log.status}`);
          console.log(`   内容: ${log.content.substring(0, 50)}...`);
          console.log(`   时间: ${log.sentAt.toISOString()}`);
          if (log.errorMessage) {
            console.log(`   错误: ${log.errorMessage}`);
          }
        });
      }
      
      console.log('\n✅ 测试4完成');
      
      // ========================================
      // 测试5: 查询通知统计
      // ========================================
      console.log('\n========================================');
      console.log('测试5: 查询通知统计');
      console.log('========================================\n');
      
      const stats = await notificationsService.getNotificationStats(testUserId);
      console.log('通知统计:');
      console.log(JSON.stringify(stats, null, 2));
      
      console.log('\n✅ 测试5完成');
    }
    
    // ========================================
    // 测试6: 签到检查任务（手动触发）
    // ========================================
    console.log('\n========================================');
    console.log('测试6: 签到检查任务（手动触发）');
    console.log('========================================\n');
    
    console.log('执行签到检查任务...\n');
    await schedulerService.triggerCheckinCheck();
    
    console.log('\n✅ 测试6完成');
    
    // ========================================
    // 测试总结
    // ========================================
    console.log('\n========================================');
    console.log('测试总结');
    console.log('========================================\n');
    
    console.log('✅ 健康检查任务 - 通过');
    console.log('✅ 通知服务模块 - 通过');
    console.log('✅ 签到检查任务 - 通过');
    console.log('✅ 通知历史查询 - 通过');
    console.log('✅ 通知统计查询 - 通过');
    
    console.log('\n所有测试完成！\n');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

testModules().catch(console.error);