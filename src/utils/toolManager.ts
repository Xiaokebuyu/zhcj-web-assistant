// src/utils/toolManager.ts
// 集成了OpenManus AI代理功能的工具管理器

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
    },

    {
      type: "function",
      function: {
        name: "web_search",
        description: "搜索网络上的最新信息，获取实时资讯、新闻、资料等。当用户询问最新信息、新闻、实时数据或你无法确定答案时使用此工具",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "搜索关键词，例如：最新科技新闻、2024年人工智能发展、某某公司最新消息"
            },
            count: {
              type: "number",
              description: "返回结果数量，默认8条",
              default: 8
            }
          },
          required: ["query"]
        }
      }
    },

    // OpenManus工具定义
    {
      type: "function",
      function: {
        name: "openmanus_web_automation",
        description: "网页自动化操作，包括数据抓取、表单填写、页面交互等。适用于需要与网页进行复杂交互的任务",
        parameters: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "详细的任务描述，例如：抓取某网站的产品信息、自动填写表单、下载文件等"
            },
            url: {
              type: "string",
              description: "目标网页URL（可选）"
            }
          },
          required: ["task_description"]
        }
      }
    },

    {
      type: "function",
      function: {
        name: "openmanus_code_execution",
        description: "执行Python代码进行数据分析、计算、文件处理等。适用于需要编程解决的复杂任务",
        parameters: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "详细的任务描述，例如：分析CSV数据、生成图表、数据处理、算法实现等"
            },
            code_type: {
              type: "string",
              description: "代码类型：data_analysis（数据分析）、file_processing（文件处理）、calculation（计算）、visualization（可视化）",
              enum: ["data_analysis", "file_processing", "calculation", "visualization"]
            }
          },
          required: ["task_description"]
        }
      }
    },

    {
      type: "function",
      function: {
        name: "openmanus_file_operations",
        description: "文件操作，包括文件读写、编辑、格式转换等。适用于需要处理文件的任务",
        parameters: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "详细的任务描述，例如：编辑配置文件、转换文件格式、批量重命名等"
            },
            operation_type: {
              type: "string",
              description: "操作类型：read（读取）、write（写入）、edit（编辑）、convert（转换）",
              enum: ["read", "write", "edit", "convert"]
            }
          },
          required: ["task_description"]
        }
      }
    },

    {
      type: "function",
      function: {
        name: "openmanus_general_task",
        description: "通用的智能任务处理，适用于复杂的多步骤任务或需要AI智能决策的场景",
        parameters: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "详细的任务描述，OpenManus将自动分析并执行"
            },
            complexity: {
              type: "string",
              description: "任务复杂度：simple（简单）、medium（中等）、complex（复杂）",
              enum: ["simple", "medium", "complex"]
            }
          },
          required: ["task_description"]
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
  
  // OpenManus任务类型定义
  export interface OpenManusTaskRequest {
    task_description: string;
    agent_type?: string;
    tools?: string[];
    context?: any;
    max_steps?: number;
  }

  export interface OpenManusTaskResponse {
    task_id: string;
    status: string;
    result?: string;
    error?: string;
    steps_completed: number;
    total_steps: number;
    created_at: string;
    updated_at: string;
  }

  // 工具执行器
  export class ToolExecutor {
    private static readonly QWEATHER_TOKEN = process.env.QWEATHER_API_KEY;
    private static readonly OPENMANUS_API_URL = 'http://127.0.0.1:8001';
    
    static async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
      const results: ToolResult[] = [];
      
      for (const toolCall of toolCalls) {
        try {
          let result: object;
          
          switch (toolCall.function.name) {
            case 'get_weather':
              result = await this.getWeather(toolCall.function.arguments);
              break;
            case 'openmanus_web_automation':
              result = await this.executeOpenManusTask(toolCall.function.arguments, 'web_automation');
              break;
            case 'openmanus_code_execution':
              result = await this.executeOpenManusTask(toolCall.function.arguments, 'code_execution');
              break;
            case 'openmanus_file_operations':
              result = await this.executeOpenManusTask(toolCall.function.arguments, 'file_operations');
              break;
            case 'openmanus_general_task':
              result = await this.executeOpenManusTask(toolCall.function.arguments, 'general');
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

    // OpenManus任务执行
    static async executeOpenManusTask(argumentsStr: string, taskType: string): Promise<object> {
      const args = JSON.parse(argumentsStr);
      const { task_description, ...otherArgs } = args;
      
      try {
        // 创建任务请求
        const taskRequest: OpenManusTaskRequest = {
          task_description,
          agent_type: 'manus',
          max_steps: 20,
          ...otherArgs
        };

        // 发送任务到OpenManus API
        const response = await fetch(`${this.OPENMANUS_API_URL}/api/execute_task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskRequest)
        });

        if (!response.ok) {
          throw new Error(`OpenManus API请求失败: ${response.status}`);
        }

        const taskResponse: OpenManusTaskResponse = await response.json();
        const taskId = taskResponse.task_id;

        // 轮询任务状态，直到完成
        let attempts = 0;
        const maxAttempts = 60; // 最多等待5分钟
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
          
          const statusResponse = await fetch(`${this.OPENMANUS_API_URL}/api/task_status/${taskId}`);
          
          if (!statusResponse.ok) {
            throw new Error(`获取任务状态失败: ${statusResponse.status}`);
          }
          
          const status = await statusResponse.json();
          
          if (status.status === 'completed') {
            return {
              success: true,
              task_type: taskType,
              task_id: taskId,
              result: status.result,
              progress: status.progress,
              timestamp: new Date().toISOString()
            };
          } else if (status.status === 'failed') {
            throw new Error(`OpenManus任务执行失败: ${status.error}`);
          }
          
          attempts++;
        }
        
        throw new Error('OpenManus任务执行超时');
        
      } catch (error) {
        console.error('OpenManus任务执行错误:', error);
        return {
          success: false,
          task_type: taskType,
          error: error instanceof Error ? error.message : '任务执行失败',
          timestamp: new Date().toISOString()
        };
      }
    }
  }