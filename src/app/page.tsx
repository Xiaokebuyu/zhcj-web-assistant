'use client';

import { MessageCircle, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import FloatingAssistant from '@/components/FloatingAssistant';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* 悬浮助手 */}
      <FloatingAssistant />
      
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <MessageCircle size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-gray-900">AI 助手</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/embed" className="text-gray-600 hover:text-orange-600 transition-colors">
                集成演示
              </Link>
              <Link href="/api/chat" className="text-gray-600 hover:text-orange-600 transition-colors">
                API 文档
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 英雄区域 */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                由 DeepSeek AI 驱动
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              智能悬浮框
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                助手
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              一个现代化的可嵌入式 AI 聊天助手，采用 Anthropic 风格设计，
              支持语音交互，可轻松集成到任何网站中。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 hover:scale-105">
                开始使用
              </button>
              <Link 
                href="/embed" 
                className="border border-gray-200 hover:border-orange-300 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:bg-orange-50"
              >
                查看演示
              </Link>
            </div>
          </div>
        </section>

        {/* 功能特性 */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              强大的功能特性
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              为现代网站设计的智能助手解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                快速集成
              </h3>
              <p className="text-gray-600 leading-relaxed">
                只需一行代码即可在任何网站中集成 AI 助手，支持多种配置选项和自定义样式。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle size={24} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                智能对话
              </h3>
              <p className="text-gray-600 leading-relaxed">
                基于先进的 AI 模型，提供自然流畅的对话体验，支持多轮对话和上下文理解。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={24} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                安全可靠
              </h3>
              <p className="text-gray-600 leading-relaxed">
                采用现代安全架构，支持 HTTPS，确保用户数据安全和隐私保护。
              </p>
            </div>
          </div>
        </section>

        {/* 集成示例 */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              简单集成
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              仅需几行代码即可为您的网站添加 AI 助手
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm ml-4">embed.html</span>
            </div>
            <pre className="text-green-400 text-sm overflow-x-auto">
{`<!-- 在您的网站中添加以下代码 -->
<script src="http://localhost:3000/embed.js"></script>
<script>
  window.initAIAssistant({
    config: {
      position: 'bottom-right',
      theme: 'light',
      enableVoice: true
    }
  });
</script>`}
            </pre>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <MessageCircle size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-gray-900">AI 助手</span>
            </div>
            
            <div className="flex items-center gap-6 text-gray-600">
              <Link href="/embed" className="hover:text-orange-600 transition-colors">
                演示
              </Link>
              <Link href="/api/chat" className="hover:text-orange-600 transition-colors">
                API
              </Link>
              <a 
                href="https://github.com" 
                className="hover:text-orange-600 transition-colors flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={16} />
                GitHub
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 AI 助手. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
