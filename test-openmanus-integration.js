#!/usr/bin/env node

/**
 * OpenManus集成测试脚本
 * 测试悬浮框助手与OpenManus的集成功能
 */

const http = require('http');
const https = require('https');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testService(name, url, expectedStatus = 200) {
  try {
    log(`测试 ${name}...`, 'blue');
    const result = await makeRequest(url);
    
    if (result.status === expectedStatus) {
      log(`✅ ${name} - 正常运行`, 'green');
      return true;
    } else {
      log(`❌ ${name} - 状态码: ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - 错误: ${error.message}`, 'red');
    return false;
  }
}

async function testOpenManusAPI() {
  try {
    log('测试OpenManus API...', 'blue');
    
    // 测试健康检查
    const healthResult = await makeRequest('http://localhost:8001/api/health');
    if (healthResult.status !== 200) {
      log('❌ OpenManus API健康检查失败', 'red');
      return false;
    }
    
    log('✅ OpenManus API健康检查通过', 'green');
    
    // 测试工具列表
    const toolsResult = await makeRequest('http://localhost:8001/api/available_tools');
    if (toolsResult.status === 200 && Array.isArray(toolsResult.data)) {
      log(`✅ OpenManus API工具列表获取成功 (${toolsResult.data.length}个工具)`, 'green');
    } else {
      log('⚠️  OpenManus API工具列表获取失败', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ OpenManus API测试失败: ${error.message}`, 'red');
    return false;
  }
}

async function testChatAPI() {
  try {
    log('测试Chat API...', 'blue');
    
    const chatRequest = {
      messages: [
        { role: 'user', content: '你好，请测试一下基本功能' }
      ],
      temperature: 0.7,
      max_tokens: 100
    };
    
    const result = await makeRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: chatRequest
    });
    
    if (result.status === 200 && result.data.message) {
      log('✅ Chat API基本功能正常', 'green');
      return true;
    } else {
      log(`❌ Chat API测试失败 - 状态码: ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Chat API测试失败: ${error.message}`, 'red');
    return false;
  }
}

async function testToolsAPI() {
  try {
    log('测试Tools API...', 'blue');
    
    const toolRequest = {
      tool_calls: [
        {
          id: 'test-call-1',
          type: 'function',
          function: {
            name: 'get_weather',
            arguments: JSON.stringify({ location: '北京' })
          }
        }
      ]
    };
    
    const result = await makeRequest('http://localhost:3000/api/tools', {
      method: 'POST',
      body: toolRequest
    });
    
    if (result.status === 200) {
      log('✅ Tools API基本功能正常', 'green');
      return true;
    } else {
      log(`❌ Tools API测试失败 - 状态码: ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Tools API测试失败: ${error.message}`, 'red');
    return false;
  }
}

async function testOpenManusIntegrationAPI() {
  try {
    log('测试OpenManus集成API...', 'blue');
    
    const result = await makeRequest('http://localhost:3000/api/openmanus?action=health');
    
    if (result.status === 200) {
      log('✅ OpenManus集成API正常', 'green');
      return true;
    } else {
      log(`❌ OpenManus集成API测试失败 - 状态码: ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ OpenManus集成API测试失败: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 开始测试OpenManus集成功能', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const results = [];
  
  // 基础服务测试
  log('\n📋 基础服务测试', 'magenta');
  results.push(await testService('Next.js应用', 'http://localhost:3000'));
  results.push(await testService('OpenManus API服务', 'http://localhost:8001/api/health'));
  
  // API功能测试
  log('\n🔧 API功能测试', 'magenta');
  results.push(await testOpenManusAPI());
  results.push(await testChatAPI());
  results.push(await testToolsAPI());
  results.push(await testOpenManusIntegrationAPI());
  
  // 测试结果汇总
  log('\n📊 测试结果汇总', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  if (passedTests === totalTests) {
    log(`🎉 所有测试通过！(${passedTests}/${totalTests})`, 'green');
    log('✅ OpenManus集成功能正常运行', 'green');
  } else {
    log(`⚠️  部分测试失败 (${passedTests}/${totalTests})`, 'yellow');
    log('🔧 请检查失败的服务并重新测试', 'yellow');
  }
  
  log('\n🔗 相关链接:', 'cyan');
  log('  - 主应用: http://localhost:3000', 'blue');
  log('  - 嵌入页面: http://localhost:3000/embed', 'blue');
  log('  - OpenManus API: http://localhost:8001', 'blue');
  log('  - API文档: http://localhost:8001/docs (如果可用)', 'blue');
  
  log('\n💡 使用建议:', 'cyan');
  log('  1. 在浏览器中访问主应用测试基本功能', 'white');
  log('  2. 尝试使用OpenManus相关的复杂任务', 'white');
  log('  3. 测试语音功能和页面上下文', 'white');
  log('  4. 检查网络搜索和工具调用', 'white');
}

// 运行测试
runTests().catch(error => {
  log(`💥 测试运行失败: ${error.message}`, 'red');
  process.exit(1);
});