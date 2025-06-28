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
        description: "公共互联网关键词搜索，快速获取网页标题、简要摘要与链接。适用于获取事实性信息、新闻动态、公开数据等【无需登录或复杂交互】的场景。若用户提问的是「最新消息」「资料查找」「某事是什么」之类，则优先使用该工具。",
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

    {
      type: "function",
      function: {
        name: "submit_feedback",
        description: "向智慧残健平台提交用户反馈",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string", description: "反馈正文，≤200 字" },
            type:    { type: "integer", description: "反馈类别 0~3", default: 0 },
            name:    { type: "string", description: "反馈人姓名", nullable: true },
            phone:   { type: "string", description: "手机号(11 位)", nullable: true },
            satoken: { type: "string", description: "当前登录 token(自动注入)", nullable: true }
          },
          required: ["content"]
        }
      }
    },

    {
      type: "function",
      function: {
        name: "submit_post",
        description: "在论坛发表新帖子",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "帖子标题" },
            content: { type: "string", description: "正文，不少于10字" },
            type: { type: "integer", description: "帖子分类 0~5", default: 0 },
            satoken: { type: "string", description: "用户登录 token(自动注入)", nullable: true }
          },
          required: ["title", "content"]
        }
      }
    },

    {
      type: "function",
      function: {
        name: "submit_request",
        description: "发布新的求助信息（残障人士使用）",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string", description: "求助内容，不少于10字" },
            type: { type: "integer", description: "求助类别 0~N", default: 0 },
            urgent: { type: "integer", description: "紧急程度 0-普通 1-较急 2-紧急 3-危急", default: 0 },
            isOnline: { type: "integer", description: "0=线下 1=线上", default: 1 },
            address: { type: "string", description: "线下地址(仅 isOnline=0 时必填)", nullable: true },
            satoken: { type: "string", description: "登录 token(自动注入)", nullable: true }
          },
          required: ["content"]
        }
      }
    },

    // OpenManus工具定义
    {
      type: "function",
      function: {
        name: "openmanus_web_automation",
        description: "基于浏览器的自动化与爬取工具，可在目标网页上执行点击、输入、滚动、抓取结构化数据、下载文件、登录等复杂交互。用于【需要模拟用户操作或批量抓取/填报】的任务，而不仅仅是简单搜索。",
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
        description: "OpenManus 通用代理，适合无法通过以上专用工具完成，或需要多步骤规划/决策/混合操作（代码+网页+文件）的复合型任务。",
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
    context?: Record<string, unknown>;
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
    
    // ✅ 添加认证调试功能
    private static debugAuthInfo(pageContext?: import('@/types').PageContext) {
      console.log('🔍 认证调试信息:');
      console.log('- pageContext存在:', !!pageContext);
      console.log('- pageContext.auth存在:', !!pageContext?.auth);
      console.log('- pageContext.auth.satoken:', pageContext?.auth?.satoken ? '已获取' : '未获取');
      
      // 尝试直接从Cookie获取（如果在浏览器环境）
      if (typeof document !== 'undefined') {
        const directSaToken = document.cookie
          .split('; ')
          .find(c => c.startsWith('satoken='))?.split('=')[1];
        console.log('- 直接从Cookie获取satoken:', directSaToken ? '已获取' : '未获取');
        
        // 显示所有cookies用于调试
        console.log('- 所有Cookies:', document.cookie);
      }
    }

    // ✅ 添加回退token提取方法
    private static extractFallbackToken(): string | null {
      try {
        // 尝试从当前环境的Cookie直接提取
        if (typeof document !== 'undefined') {
          // 优先读取 Sa-Token 默认 cookie("satoken")
          let token = document.cookie
            .split('; ')
            .find(c => c.startsWith('satoken='))?.split('=')[1];

          // 回退：尝试旧版 "ada_token"
          if (!token) {
            token = document.cookie
              .split('; ')
              .find(c => c.startsWith('ada_token='))?.split('=')[1];
          }

          return token || null;
        }
        return null;
      } catch (error) {
        console.warn('回退认证提取失败:', error);
        return null;
      }
    }

    // ✅ 修复submitFeedback方法 - 使用Authorization头
    private static async submitFeedback(argsStr: string): Promise<object> {
      const { content, type = 0, name, phone, satoken } = JSON.parse(argsStr);
 
      // 参数校验
      if (!content?.trim()) throw new Error("反馈内容不能为空");
      if (!satoken) throw new Error("用户未登录，缺少认证信息");
 
      // ✅ 修改：使用正确的认证头格式，与Vue前端保持一致
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "satoken": satoken  // 直接按Sa-Token约定传递token
      };
 
      // 如果 name / phone 为空，可先调用 /user/current
      let finalName = name, finalPhone = phone;
      if (!name || !phone) {
        const r = await fetch("http://localhost:81/user/current", { 
          headers: {
            "satoken": satoken  // 按Sa-Token约定传递token
          }, 
          credentials: "include" 
        });
        if (r.ok) {
          const j = await r.json();
          if (j.code === 200) {
            finalName = finalName ?? j.data.uName;
            finalPhone = finalPhone ?? j.data.uPhone;
          }
        }
      }
 
      const body = JSON.stringify({ content, type, name: finalName, phone: finalPhone });
      const res = await fetch("http://localhost:81/Feedback/submit", {
        method: "POST", headers, body, credentials: "include"
      });
      const data = await res.json();
      return { success: data.code === 200, ...data };
    }

    // ✅ 修复submitPost方法 - 使用Authorization头
    private static async submitPost(argsStr: string): Promise<object> {
      const { title, content, type = 0, satoken } = JSON.parse(argsStr);

      // 参数校验
      if (!satoken) throw new Error("未登录，缺少认证信息");
      if (!title || !content) throw new Error("标题和内容不能为空");
      if (content.length < 10) throw new Error("帖子内容不少于10字");

      // ✅ 修改：使用正确的认证头格式
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "satoken": satoken  // 直接按Sa-Token约定传递token
      };

      const body = JSON.stringify({
        ftype: Number(type),
        ftitle: title,
        fcontent: content
      });

      const res = await fetch('http://localhost:81/forum/publish', {
        method: 'POST',
        headers,
        body,
        credentials: 'include'
      });

      const data = await res.json();
      return { success: data.code === 200, ...data };
    }

    // ✅ 修复submitRequest方法 - 使用Authorization头
    private static async submitRequest(argsStr: string): Promise<object> {
      const { content, type = 0, urgent = 0, isOnline = 1, address, satoken } = JSON.parse(argsStr);

      // 参数校验
      if (!satoken) throw new Error("未登录，缺少认证信息");
      if (!content?.trim()) throw new Error("求助内容不能为空");
      if (content.length < 10) throw new Error("求助内容不少于10字");
      if (isOnline === 0 && !address?.trim()) throw new Error("线下求助必须填写地址");

      // ✅ 修改：使用正确的认证头格式
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "satoken": satoken  // 直接按Sa-Token约定传递token
      };

      const body = JSON.stringify({
        rType: type,
        rContent: content,
        rUrgent: urgent,
        rIsOnline: isOnline,
        rAddress: address?.trim() || ''
      });

      const res = await fetch('http://localhost:81/request/publish', {
        method: 'POST',
        headers,
        body,
        credentials: 'include'
      });

      const data = await res.json();
      return { success: data.code === 200, ...data };
    }
    
    // ✅ 增强executeTools方法 - 添加调试信息和回退机制
    static async executeTools(toolCalls: ToolCall[], pageContext?: import('@/types').PageContext): Promise<ToolResult[]> {
      // 添加调试信息
      this.debugAuthInfo(pageContext);
      
      const results: ToolResult[] = [];
      
      for (const toolCall of toolCalls) {
        try {
          let result: object;
          
          switch (toolCall.function.name) {
            case 'get_weather':
              result = await this.getWeather(toolCall.function.arguments);
              break;
            case 'web_search':
              result = await this.executeWebSearchTool(toolCall.function.arguments);
              break;
            case 'submit_feedback':
              // ✅ 增强认证处理 - 添加回退机制
              try {
                // 主要认证流程
                let feedbackArgs = JSON.parse(toolCall.function.arguments);
                
                // 优先从pageContext获取认证信息
                if (pageContext?.auth?.satoken) {
                  feedbackArgs.satoken = pageContext.auth.satoken;
                } 
                // 回退：尝试直接从环境获取
                else {
                  const fallbackToken = this.extractFallbackToken();
                  if (fallbackToken) {
                    feedbackArgs.satoken = fallbackToken;
                    console.warn('⚠️ 使用回退认证token');
                  } else {
                    throw new Error('无法获取认证信息，请确保用户已登录');
                  }
                }
                
                result = await this.submitFeedback(JSON.stringify(feedbackArgs));
              } catch (authError) {
                console.error('认证失败:', authError);
                result = {
                  error: `认证失败: ${authError instanceof Error ? authError.message : '未知错误'}`,
                  suggestion: '请刷新页面重新登录，或检查登录状态',
                  success: false
                };
              }
              break;
            case 'submit_post':
              // ✅ 增强认证处理 - 添加回退机制
              try {
                // 主要认证流程
                let postArgs = JSON.parse(toolCall.function.arguments);
                
                // 优先从pageContext获取认证信息
                if (pageContext?.auth?.satoken) {
                  postArgs.satoken = pageContext.auth.satoken;
                } 
                // 回退：尝试直接从环境获取
                else {
                  const fallbackToken = this.extractFallbackToken();
                  if (fallbackToken) {
                    postArgs.satoken = fallbackToken;
                    console.warn('⚠️ 使用回退认证token');
                  } else {
                    throw new Error('无法获取认证信息，请确保用户已登录');
                  }
                }
                
                result = await this.submitPost(JSON.stringify(postArgs));
              } catch (authError) {
                console.error('认证失败:', authError);
                result = {
                  error: `认证失败: ${authError instanceof Error ? authError.message : '未知错误'}`,
                  suggestion: '请刷新页面重新登录，或检查登录状态',
                  success: false
                };
              }
              break;
            case 'submit_request':
              // ✅ 增强认证处理 - 添加回退机制
              try {
                // 主要认证流程
                let requestArgs = JSON.parse(toolCall.function.arguments);
                
                // 优先从pageContext获取认证信息
                if (pageContext?.auth?.satoken) {
                  requestArgs.satoken = pageContext.auth.satoken;
                } 
                // 回退：尝试直接从环境获取
                else {
                  const fallbackToken = this.extractFallbackToken();
                  if (fallbackToken) {
                    requestArgs.satoken = fallbackToken;
                    console.warn('⚠️ 使用回退认证token');
                  } else {
                    throw new Error('无法获取认证信息，请确保用户已登录');
                  }
                }
                
                result = await this.submitRequest(JSON.stringify(requestArgs));
              } catch (authError) {
                console.error('认证失败:', authError);
                result = {
                  error: `认证失败: ${authError instanceof Error ? authError.message : '未知错误'}`,
                  suggestion: '请刷新页面重新登录，或检查登录状态',
                  success: false
                };
              }
              break;
            case 'openmanus_web_automation':
              result = await this.createOpenManusTask(toolCall.function.arguments, 'web_automation');
              break;
            case 'openmanus_code_execution':
              result = await this.createOpenManusTask(toolCall.function.arguments, 'code_execution');
              break;
            case 'openmanus_file_operations':
              result = await this.createOpenManusTask(toolCall.function.arguments, 'file_operations');
              break;
            case 'openmanus_general_task':
              result = await this.createOpenManusTask(toolCall.function.arguments, 'general');
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
    
    // Web 搜索工具
    private static async executeWebSearchTool(argumentsStr: string): Promise<object> {
      const args = JSON.parse(argumentsStr);
      const { query, count = 8 } = args;

      const BOCHA_API_KEY = process.env.BOCHA_API_KEY;

      if (!BOCHA_API_KEY) {
        throw new Error('博查AI搜索API密钥未配置');
      }

      try {
        const response = await fetch('https://api.bochaai.com/v1/web-search', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${BOCHA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            freshness: 'oneYear',
            summary: true,
            count: Math.min(count, 8),
          }),
        });

        if (!response.ok) {
          throw new Error(`搜索API请求失败: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200) {
          throw new Error(`搜索失败: ${data.msg || '未知错误'}`);
        }

        const searchResults = data.data?.webPages?.value || [];

        return {
          success: true,
          query,
          totalResults: data.data?.webPages?.totalEstimatedMatches || 0,
          results: searchResults.map((item: any) => ({
            name: item.name || '',
            url: item.url || '',
            snippet: item.snippet || '',
            summary: item.summary || item.snippet || '',
            siteName: item.siteName || '',
            datePublished: item.datePublished || item.dateLastCrawled || '',
            siteIcon: item.siteIcon || '',
          })),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('网络搜索失败:', error);
        throw new Error(`网络搜索失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
    
    // OpenManus任务执行
    static async executeOpenManusTask(argumentsStr: string, taskType: string): Promise<object> {
      const args = JSON.parse(argumentsStr);
      const { task_description, ...otherArgs } = args;

      try {
        const taskRequest: OpenManusTaskRequest = {
          task_description,
          agent_type: 'manus',
          max_steps: 20,
          ...otherArgs,
        };

        const response = await fetch(`${this.OPENMANUS_API_URL}/api/execute_task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskRequest),
        });

        if (!response.ok) {
          throw new Error(`OpenManus API请求失败: ${response.status}`);
        }

        const taskResponse: OpenManusTaskResponse = await response.json();
        const taskId = taskResponse.task_id;

        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts) {
          await new Promise((res) => setTimeout(res, 5000));

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
              timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 仅创建OpenManus任务并立即返回pending结果（供前端展示进度）
    static async createOpenManusTask(argumentsStr: string, taskType: string): Promise<object> {
      const args = JSON.parse(argumentsStr);
      const { task_description, ...otherArgs } = args;

      try {
        const taskRequest: OpenManusTaskRequest = {
          task_description,
          agent_type: 'manus',
          max_steps: 20,
          ...otherArgs,
        };

        const response = await fetch(`${this.OPENMANUS_API_URL}/api/execute_task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskRequest),
        });

        if (!response.ok) {
          throw new Error(`OpenManus API请求失败: ${response.status}`);
        }

        const taskResponse: OpenManusTaskResponse = await response.json();

        return {
          success: true,
          task_type: taskType,
          task_id: taskResponse.task_id,
          status: taskResponse.status || 'pending',
          message: '任务已创建',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('创建OpenManus任务失败:', error);
        return {
          success: false,
          task_type: taskType,
          error: error instanceof Error ? error.message : '任务创建失败',
          status: 'error',
          timestamp: new Date().toISOString(),
        };
      }
    }
  }