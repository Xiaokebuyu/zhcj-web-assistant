#!/usr/bin/env python3
"""
OpenManus API Service
为悬浮框助手提供OpenManus功能的HTTP API服务
"""

import asyncio
import json
import logging
import subprocess
import sys
import uuid
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# 添加OpenManus路径
OPENMANUS_DIR = Path(__file__).parent.parent / "OpenManus"
sys.path.insert(0, str(OPENMANUS_DIR))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 初始化FastAPI应用
app = FastAPI(
    title="OpenManus API Service",
    description="为悬浮框助手提供OpenManus AI代理功能的API服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenManus工作目录  
WORKSPACE_DIR = OPENMANUS_DIR / "workspace"

# 导入OpenManus核心模块
try:
    from app.agent.manus import Manus
    from app.logger import logger as manus_logger
except ImportError as e:
    print(f"无法导入OpenManus模块: {e}")
    manus_logger = None

# 数据模型
class TaskRequest(BaseModel):
    """任务请求模型"""
    task_description: str = Field(..., description="任务描述")
    agent_type: str = Field(default="manus", description="代理类型: manus, react, browser, swe")
    tools: List[str] = Field(default=[], description="指定使用的工具")
    context: Optional[Dict[str, Any]] = Field(default=None, description="上下文信息")
    max_steps: int = Field(default=20, description="最大执行步数")

class TaskResponse(BaseModel):
    """任务响应模型"""
    task_id: str
    status: str  # pending, running, completed, failed
    result: Optional[str] = None
    error: Optional[str] = None
    steps_completed: int = 0
    total_steps: int = 0
    created_at: str
    updated_at: str

class TaskStatus(BaseModel):
    """任务状态模型"""
    task_id: str
    status: str
    progress: float  # 0.0 - 1.0
    current_step: Optional[str] = None
    result: Optional[str] = None
    error: Optional[str] = None

# 内存中的任务存储
tasks: Dict[str, TaskResponse] = {}
task_processes: Dict[str, subprocess.Popen] = {}

# 全局的OpenManus代理实例缓存
_manus_instances: Dict[str, Any] = {}

async def get_or_create_manus_instance(task_id: str) -> Any:
    """获取或创建OpenManus实例"""
    if manus_logger is None:
        raise Exception("OpenManus模块未正确导入")
        
    if task_id not in _manus_instances:
        try:
            # 创建新的Manus实例
            _manus_instances[task_id] = await Manus.create()
            manus_logger.info(f"为任务 {task_id} 创建了新的Manus实例")
        except Exception as e:
            manus_logger.error(f"创建Manus实例失败: {e}")
            raise
    
    return _manus_instances[task_id]

async def execute_openmanus_task(task_id: str, task_request: TaskRequest):
    """异步执行OpenManus任务"""
    manus_instance = None
    try:
        # 更新任务状态为运行中
        tasks[task_id].status = "running"
        tasks[task_id].updated_at = datetime.now().isoformat()
        
        # 获取Manus实例
        manus_instance = await get_or_create_manus_instance(task_id)
        
        # 执行任务
        manus_logger.info(f"开始执行任务 {task_id}: {task_request.task_description}")
        
        # 使用OpenManus的run方法执行任务
        await manus_instance.run(task_request.task_description)
        
        # 任务成功完成
        tasks[task_id].status = "completed"
        tasks[task_id].result = f"任务已完成: {task_request.task_description}"
        tasks[task_id].steps_completed = tasks[task_id].total_steps
        
        manus_logger.info(f"任务 {task_id} 执行完成")
        
    except Exception as e:
        tasks[task_id].status = "failed"
        tasks[task_id].error = str(e)
        if manus_logger:
            manus_logger.error(f"任务 {task_id} 执行失败: {e}")
    finally:
        tasks[task_id].updated_at = datetime.now().isoformat()
        
        # 清理Manus实例
        if manus_instance and task_id in _manus_instances:
            try:
                await manus_instance.cleanup()
                del _manus_instances[task_id]
            except Exception as e:
                if manus_logger:
                    manus_logger.error(f"清理Manus实例失败: {e}")

@app.post("/api/execute_task", response_model=TaskResponse)
async def execute_task(task_request: TaskRequest, background_tasks: BackgroundTasks):
    """执行OpenManus任务"""
    try:
        # 生成任务ID
        task_id = str(uuid.uuid4())
        
        # 创建任务记录
        task_response = TaskResponse(
            task_id=task_id,
            status="pending",
            steps_completed=0,
            total_steps=task_request.max_steps,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        
        tasks[task_id] = task_response
        
        # 在后台执行任务
        background_tasks.add_task(execute_openmanus_task, task_id, task_request)
        
        logger.info(f"创建新任务: {task_id} - {task_request.task_description}")
        return task_response
        
    except Exception as e:
        logger.error(f"创建任务失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/task_status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """获取任务状态"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = tasks[task_id]
    
    # 计算进度
    progress = 0.0
    if task.total_steps > 0:
        progress = task.steps_completed / task.total_steps
    
    return TaskStatus(
        task_id=task_id,
        status=task.status,
        progress=progress,
        result=task.result,
        error=task.error
    )

@app.get("/api/available_tools", response_model=List[Dict[str, str]])
async def get_available_tools():
    """获取可用工具列表"""
    tools = [
        {
            "name": "browser_use",
            "description": "网页自动化工具，支持页面导航、元素交互、内容提取"
        },
        {
            "name": "python_execute", 
            "description": "Python代码执行工具，支持数据分析、计算、文件处理"
        },
        {
            "name": "str_replace_editor",
            "description": "文件编辑工具，支持文件查看、创建、文本替换"
        },
        {
            "name": "web_search",
            "description": "网络搜索工具，支持多引擎搜索"
        }
    ]
    return tools

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openmanus_dir": str(OPENMANUS_DIR),
        "manus_available": manus_logger is not None,
        "active_instances": len(_manus_instances)
    }

@app.delete("/api/task/{task_id}")
async def cancel_task(task_id: str):
    """取消任务"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 如果任务正在运行，清理Manus实例
    if task_id in _manus_instances:
        try:
            await _manus_instances[task_id].cleanup()
            del _manus_instances[task_id]
            tasks[task_id].status = "cancelled"
            tasks[task_id].updated_at = datetime.now().isoformat()
        except Exception as e:
            logger.error(f"取消任务时清理实例失败: {e}")
    
    return {"message": "任务已取消"}

if __name__ == "__main__":
    # 确保工作目录存在
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
    
    # 启动服务
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
        log_level="info"
    )