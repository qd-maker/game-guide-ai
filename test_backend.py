"""
测试 FastAPI 后端是否运行
"""
import requests
import sys

def test_backend():
    url = "http://localhost:8000/health"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print("✅ FastAPI 服务正在运行！")
            print(f"响应: {response.json()}")
            return True
        else:
            print(f"❌ FastAPI 服务返回错误: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到 FastAPI 服务")
        print("   请确保 FastAPI 服务正在运行在 http://localhost:8000")
        print("\n启动方法:")
        print("   1. 激活虚拟环境: .\\.venv\\Scripts\\Activate.ps1")
        print("   2. 进入目录: cd resume-frontend")
        print("   3. 启动服务: python index.py")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")
        return False

if __name__ == '__main__':
    test_backend()




























