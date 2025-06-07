// 测试聊天 API 的脚本
const testMessages = [
  { role: 'user', content: '你好' },
  { role: 'user', content: '测试' },
  { role: 'user', content: '帮助' },
  { role: 'user', content: '谢谢' },
  { role: 'user', content: '什么是人工智能' }
];

async function testAPI() {
  console.log('🧪 开始测试 AI 助手 API...\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📝 测试 ${i + 1}/${testMessages.length}: "${message.content}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [message]
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ 成功 (${response.status})`);
        console.log(`💬 回复: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`);
        if (data.isSimulated) {
          console.log(`⚠️  注意: 这是模拟回复（${data.error}）`);
        }
      } else {
        console.log(`❌ 失败 (${response.status})`);
        console.log(`💬 错误: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ 网络错误: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n🎉 测试完成！');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ 服务器正在运行\n');
      return true;
    } else {
      console.log('❌ 服务器响应异常\n');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法连接到服务器，请确保运行 npm run dev\n');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 AI 助手 API 测试工具\n');
  
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAPI();
  }
}

// 如果是直接运行这个脚本
if (require.main === module) {
  main().catch(error => {
    console.error('测试过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = { testAPI, checkServer }; 