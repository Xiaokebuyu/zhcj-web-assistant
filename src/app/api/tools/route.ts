// src/app/api/tools/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { tool_calls }: { tool_calls: ToolCall[] } = await request.json();

    if (!tool_calls || !Array.isArray(tool_calls) || tool_calls.length === 0) {
      return NextResponse.json(
        { error: '无效的工具调用格式' },
        { status: 400 }
      );
    }

    // 执行所有工具调用
    const results: ToolResult[] = [];
    
    for (const toolCall of tool_calls) {
      try {
        let result: object;
        
        switch (toolCall.function.name) {
          case 'get_weather':
            result = await executeWeatherTool(toolCall.function.arguments);
            break;
          default:
            throw new Error(`未知工具: ${toolCall.function.name}`);
        }
        
        results.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify(result)
        });
        
      } catch (error) {
        console.error(`工具执行失败 ${toolCall.function.name}:`, error);
        results.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify({
            error: error instanceof Error ? error.message : '工具执行失败',
            success: false
          })
        });
      }
    }

    return NextResponse.json({
      results,
      success: true
    });

  } catch (error) {
    console.error('工具API错误:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '服务器内部错误',
        success: false 
      },
      { status: 500 }
    );
  }
}

// 天气工具执行函数
async function executeWeatherTool(argumentsStr: string) {
  const args = JSON.parse(argumentsStr);
  const { location, adm } = args;
  
  const QWEATHER_TOKEN = process.env.QWEATHER_API_KEY;
  
  if (!QWEATHER_TOKEN) {
    throw new Error('和风天气API密钥未配置');
  }
  
  // 第一步：获取地理位置信息
  const geoData = await getGeoLocation(location, adm, QWEATHER_TOKEN);
  if (!geoData || geoData.length === 0) {
    throw new Error(`未找到城市: ${location}`);
  }
  
  const cityInfo = geoData[0]; // 取第一个结果
  const { lat, lon, name, adm1, adm2 } = cityInfo;
  
  // 并行请求多个天气API
  const [weatherNow, airQuality, weatherIndices, minutely] = await Promise.allSettled([
    getWeatherNow(lat, lon, QWEATHER_TOKEN),
    getAirQuality(lat, lon, QWEATHER_TOKEN),
    getWeatherIndices(lat, lon, QWEATHER_TOKEN),
    getMinutelyPrecipitation(lat, lon, QWEATHER_TOKEN)
  ]);
  
  // 处理结果
  const result = {
    success: true,
    location: {
      name,
      adm1,
      adm2,
      lat,
      lon
    },
    weather: weatherNow.status === 'fulfilled' ? weatherNow.value : null,
    airQuality: airQuality.status === 'fulfilled' ? airQuality.value : null,
    indices: weatherIndices.status === 'fulfilled' ? weatherIndices.value : null,
    minutely: minutely.status === 'fulfilled' ? minutely.value : null,
    timestamp: new Date().toISOString(),
    errors: [
      weatherNow.status === 'rejected' ? `天气数据: ${weatherNow.reason}` : null,
      airQuality.status === 'rejected' ? `空气质量: ${airQuality.reason}` : null,
      weatherIndices.status === 'rejected' ? `天气指数: ${weatherIndices.reason}` : null,
      minutely.status === 'rejected' ? `分钟降水: ${minutely.reason}` : null,
    ].filter(Boolean)
  };
  
  return result;
}

// 地理位置查询
async function getGeoLocation(location: string, adm: string | undefined, token: string) {
  const params = new URLSearchParams({
    location,
    key: token
  });
  
  if (adm) {
    params.append('adm', adm);
  }
  
  const response = await fetch(`https://geoapi.qweather.com/v2/city/lookup?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`地理位置API请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`地理位置查询失败: ${data.code}`);
  }
  
  return data.location || [];
}

// 实时天气
async function getWeatherNow(lat: string, lon: string, token: string) {
  const response = await fetch(
    `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${token}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`实时天气API请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`实时天气查询失败: ${data.code}`);
  }
  
  return data.now;
}

// 空气质量
async function getAirQuality(lat: string, lon: string, token: string) {
  const response = await fetch(
    `https://devapi.qweather.com/airquality/v1/current/${lat}/${lon}?key=${token}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`空气质量API请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`空气质量查询失败: ${data.code}`);
  }
  
  return data.now;
}

// 天气指数
async function getWeatherIndices(lat: string, lon: string, token: string) {
  const response = await fetch(
    `https://devapi.qweather.com/v7/indices/1d?type=1,2,3,5,8&location=${lon},${lat}&key=${token}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`天气指数API请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`天气指数查询失败: ${data.code}`);
  }
  
  return data.daily || [];
}

// 分钟级降水
async function getMinutelyPrecipitation(lat: string, lon: string, token: string) {
  const response = await fetch(
    `https://devapi.qweather.com/v7/minutely/5m?location=${lon},${lat}&key=${token}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`分钟降水API请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`分钟降水查询失败: ${data.code}`);
  }
  
  return data;
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 健康检查
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Tools API',
    supportedTools: ['get_weather'],
    timestamp: new Date().toISOString() 
  });
}