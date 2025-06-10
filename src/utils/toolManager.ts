// src/utils/toolManager.ts

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }
  
  export interface ToolResult {
    tool_call_id: string;
    role: 'tool';
    content: string;
  }
  
  // 工具定义
  export const toolDefinitions = [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "获取指定城市的详细天气信息，包括实时天气、空气质量、天气指数等",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "城市名称，例如：北京、上海、西安"
            },
            adm: {
              type: "string",
              description: "省份或地区名称，用于区分重名城市，例如：黑龙江、陕西"
            }
          },
          required: ["location"]
        }
      }
    }
  ];
  
  // 天气API响应类型定义
  interface GeoLocation {
    name: string;
    id: string;
    lat: string;
    lon: string;
    adm1: string;
    adm2: string;
    country: string;
    rank: string;
  }
  
  interface WeatherNow {
    obsTime: string;
    temp: string;
    feelsLike: string;
    text: string;
    wind360: string;
    windDir: string;
    windScale: string;
    windSpeed: string;
    humidity: string;
    precip: string;
    pressure: string;
    vis: string;
    cloud: string;
    dew: string;
  }
  
  interface AirQuality {
    pubTime: string;
    aqi: string;
    level: string;
    category: string;
    primary: string;
    pm10: string;
    pm2p5: string;
    no2: string;
    so2: string;
    co: string;
    o3: string;
  }
  
  interface WeatherIndex {
    date: string;
    type: string;
    name: string;
    level: string;
    category: string;
    text: string;
  }
  
  // 工具执行器
  export class ToolExecutor {
    private static readonly QWEATHER_TOKEN = process.env.QWEATHER_API_KEY;
    
    static async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
      const results: ToolResult[] = [];
      
      for (const toolCall of toolCalls) {
        try {
          let result: object;
          
          switch (toolCall.function.name) {
            case 'get_weather':
              result = await this.getWeather(toolCall.function.arguments);
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
      
      return results;
    }
    
    // 获取天气信息的核心方法
    static async getWeather(argumentsStr: string) {
      const args = JSON.parse(argumentsStr);
      const { location, adm } = args;
      
      if (!this.QWEATHER_TOKEN) {
        throw new Error('和风天气API密钥未配置');
      }
      
      // 第一步：获取地理位置信息
      const geoData = await this.getGeoLocation(location, adm);
      if (!geoData || geoData.length === 0) {
        throw new Error(`未找到城市: ${location}`);
      }
      
      const cityInfo = geoData[0]; // 取第一个结果
      const { lat, lon, name, adm1, adm2 } = cityInfo;
      
      // 并行请求多个天气API
      const [weatherNow, airQuality, weatherIndices, minutely] = await Promise.allSettled([
        this.getWeatherNow(lat, lon),
        this.getAirQuality(lat, lon),
        this.getWeatherIndices(lat, lon),
        this.getMinutelyPrecipitation(lat, lon)
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
    private static async getGeoLocation(location: string, adm?: string): Promise<GeoLocation[]> {
      const params = new URLSearchParams({
        location,
        key: this.QWEATHER_TOKEN!
      });
      
      if (adm) {
        params.append('adm', adm);
      }
      
      const response = await fetch(`https://geoapi.qweather.com/v2/city/lookup?${params}`);
      
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
    private static async getWeatherNow(lat: string, lon: string): Promise<WeatherNow> {
      const response = await fetch(
        `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${this.QWEATHER_TOKEN}`
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
    private static async getAirQuality(lat: string, lon: string): Promise<AirQuality> {
      const response = await fetch(
        `https://devapi.qweather.com/v7/air/now?location=${lon},${lat}&key=${this.QWEATHER_TOKEN}`
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
    private static async getWeatherIndices(lat: string, lon: string): Promise<WeatherIndex[]> {
      const response = await fetch(
        `https://devapi.qweather.com/v7/indices/1d?type=1,2,3,5,8&location=${lon},${lat}&key=${this.QWEATHER_TOKEN}`
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
    private static async getMinutelyPrecipitation(lat: string, lon: string) {
      const response = await fetch(
        `https://devapi.qweather.com/v7/minutely/5m?location=${lon},${lat}&key=${this.QWEATHER_TOKEN}`
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
  }