"""
FastAPI 应用：实现 RAG 问答系统
"""
import os
import json
import re
import numpy as np
from typing import List, Optional, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# 加载环境变量（优先加载 .env.local，然后加载 .env）
load_dotenv('.env.local')  # 先加载 .env.local（如果存在）
load_dotenv()  # 再加载 .env（.env 中的值会覆盖 .env.local）

app = FastAPI(title="RAG 问答系统")

# 配置 CORS，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
model = None
chunks = None
embeddings = None
chunk_game_names: Optional[List[Optional[str]]] = None  # 每个 chunk 所属的游戏名称
supabase: Optional[Client] = None
current_game_name: Optional[str] = None  # 当前攻略的游戏名称

class QuestionRequest(BaseModel):
    question: str
    top_k: Optional[int] = 3  # 返回最相似的段落数量

class QuestionResponse(BaseModel):
    answer: str
    relevant_chunks: List[str]
    source: str  # "rag" 或 "llm_generated" 或 "llm_general"
    game_name: Optional[str] = None  # 检测到的游戏名称

def identify_game_from_chunk(chunk: str) -> Optional[str]:
    """
    从 chunk 内容中识别游戏名称
    支持格式：<<游戏名>>、游戏名攻略、游戏名相关关键词
    """
    # 尝试匹配 <<游戏名>> 格式
    match = re.search(r'<<([^>>]+)>>', chunk)
    if match:
        return match.group(1).strip()
    
    # 尝试匹配《游戏名》格式
    match = re.search(r'《([^》]+)》', chunk)
    if match:
        return match.group(1).strip()
    
    # 尝试匹配 "游戏名" 或 '游戏名' 格式
    match = re.search(r'["\']([^"\']+?)["\']', chunk)
    if match:
        candidate = match.group(1).strip()
        if len(candidate) >= 2 and len(candidate) <= 30:
            return candidate
    
    # 如果 chunk 开头包含明显的游戏名称模式
    # 例如：游戏名 + 空格/换行 + 攻略内容
    lines = chunk.split('\n')
    if lines:
        first_line = lines[0].strip()
        # 如果第一行较短且不包含常见动词，可能是游戏名
        if len(first_line) >= 2 and len(first_line) <= 30:
            # 排除明显不是游戏名的内容（包含常见动词、标点等）
            if not re.search(r'[=：:，,。.！!？?]', first_line):
                # 检查是否包含中文或英文单词
                if re.search(r'[\u4e00-\u9fa5A-Za-z]', first_line):
                    return first_line
    
    return None

def load_game_sequence_from_guide(guide_file: str = 'guide.txt') -> list:
    """
    从 guide.txt 读取游戏序列信息
    返回: [(游戏名称, 在原始文本中的位置信息)]
    用于确定每个游戏在文本中的位置范围
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    guide_path = os.path.join(script_dir, guide_file)
    
    if not os.path.exists(guide_path):
        return []
    
    game_sequence = []
    
    with open(guide_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # 找到所有游戏标识符的位置
        for match in re.finditer(r'<<([^>>]+)>>', content):
            game_name = match.group(1).strip()
            start_pos = match.start()
            game_sequence.append((game_name, start_pos))
    
    return game_sequence

def load_vectors(vector_file: str = 'guide_vectors.json'):
    """
    加载预生成的向量，并为每个 chunk 标记所属游戏
    规则：<<游戏名>> 标识符后面的所有内容都属于该游戏，直到遇到下一个 <<游戏名>>
    """
    global chunks, embeddings, chunk_game_names
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    vector_path = os.path.join(script_dir, vector_file)
    
    if not os.path.exists(vector_path):
        raise FileNotFoundError(
            f"向量文件 {vector_path} 不存在。请先运行 vectorize_guide.py 生成向量。"
        )
    
    with open(vector_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    chunks = data['chunks']
    embeddings = np.array(data['embeddings'])
    
    # 为每个 chunk 识别所属游戏
    # 规则：如果 chunk 中包含 <<游戏名>>，则设置当前游戏为该游戏
    # 之后的所有 chunks 都继承这个游戏名称，直到遇到下一个 <<游戏名>>
    chunk_game_names = []
    current_game = None
    
    for i, chunk in enumerate(chunks):
        # 检查 chunk 中是否包含游戏标识符 <<游戏名>>
        match = re.search(r'<<([^>>]+)>>', chunk)
        if match:
            # 找到新的游戏标识符，更新当前游戏
            current_game = match.group(1).strip()
            chunk_game_names.append(current_game)
        else:
            # 没有游戏标识符，继承上一个 chunk 的游戏名称
            # 这样可以确保 <<游戏名>> 后面的所有内容都属于该游戏
            chunk_game_names.append(current_game)
    
    # 统计游戏分布
    game_stats = {}
    for game_name in chunk_game_names:
        if game_name:
            game_stats[game_name] = game_stats.get(game_name, 0) + 1
    
    print(f"已加载 {len(chunks)} 个向量段落")
    if game_stats:
        print(f"检测到 {len(game_stats)} 个游戏的攻略:")
        for game, count in sorted(game_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {game}: {count} 个段落")
    else:
        print("⚠️  未检测到游戏名称标记，所有段落将视为通用内容")

def init_supabase():
    """
    初始化 Supabase 客户端
    """
    global supabase
    if supabase is None:
        # 尝试多种环境变量名称（兼容不同的配置方式）
        supabase_url = (
            os.getenv('SUPABASE_URL') or 
            os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        )
        supabase_key = (
            os.getenv('SUPABASE_KEY') or 
            os.getenv('SUPABASE_ANON_KEY') or
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        if not supabase_url or not supabase_key:
            print("⚠️  警告: Supabase 配置未找到，将无法保存攻略到数据库")
            print("   请设置 SUPABASE_URL 和 SUPABASE_KEY 环境变量")
            return None
        
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Supabase 客户端初始化完成")
    
    return supabase

def extract_game_name(question: str) -> Optional[str]:
    """
    从问题中提取游戏名称
    尝试识别常见的游戏名称模式
    """
    # 常见模式：<<游戏名称>>、游戏名称攻略、关于游戏名称等
    patterns = [
        r'<<([^>>]+)>>',  # <<游戏名称>>
        r'《([^》]+)》',    # 《游戏名称》
        r'([^，。！？\s]+)(?:的)?攻略',  # 游戏名称攻略
        r'关于([^，。！？\s]+)',  # 关于游戏名称
    ]
    
    for pattern in patterns:
        match = re.search(pattern, question)
        if match:
            game_name = match.group(1).strip()
            if len(game_name) > 1:  # 至少2个字符
                return game_name

    # 提取在疑问词/关键词前出现的游戏名（优先处理）
    # 疑问词和关键词列表
    question_keywords = [
        '有没有', '是什么', '怎么', '如何', '怎样', '能否', '可否', '是否',
        '攻略', '怎么玩', '怎么打', '怎么过', '打法', '技巧', '阵容', '配装',
        '流程', '任务', '通关', 'boss', 'BOSS', '英雄', '角色', '难度', '段位', '思路',
        '秘籍', '作弊码', '代码', '指令', '命令'
    ]
    
    # 移除开头的噪音词
    leading_noise = r'^(关于|请问|求|想了解|帮我看看|问下|听说|求助|大神|各位|大家|请教)\s*'
    cleaned_question = re.sub(leading_noise, '', question.strip())
    
    # 尝试匹配：游戏名 + 疑问词/关键词 + 其他内容
    for keyword in question_keywords:
        if keyword in cleaned_question:
            # 找到关键词的位置
            keyword_pos = cleaned_question.find(keyword)
            if keyword_pos > 0:
                # 提取关键词之前的部分作为游戏名候选
                candidate = cleaned_question[:keyword_pos].strip()
                # 清理候选名称（移除可能的标点符号）
                candidate = candidate.strip('《》"「」『』，。！？?!；;：: ')
                # 如果候选名称合理（长度在2-30之间，且不包含疑问词）
                if 2 <= len(candidate) <= 30 and not any(qk in candidate for qk in question_keywords):
                    return candidate
    
    # 二次启发式：如果整句较短且不含明显动作词/疑问词，直接视为游戏名
    condensed = question.strip().strip('《》"「」『』')
    # 检查是否包含疑问词或动作词
    has_question_word = any(kw in condensed for kw in question_keywords)
    if (
        1 < len(condensed) <= 20
        and not re.search(r'[？?！!。，,；;：:\n]', condensed)
        and re.search(r'[\u4e00-\u9fa5A-Za-z0-9]', condensed)
        and not has_question_word  # 不包含疑问词才视为游戏名
    ):
        return condensed

    # 分句后尝试提取在关键词前出现的游戏名
    segments = re.split(r'[。！？?!；;，,]', question)
    for segment in segments:
        seg = segment.strip()
        if not seg:
            continue
        for keyword in question_keywords:
            if keyword in seg:
                candidate = seg.split(keyword)[0]
                candidate = re.sub(leading_noise, '', candidate).strip('《》"「」『』 ')
                if len(candidate) >= 2:
                    return candidate

    # 兜底：尝试抓取连续的中文/字母词组作为候选（但排除包含疑问词的情况）
    fallback_match = re.search(r'([\u4e00-\u9fa5A-Za-z0-9][\u4e00-\u9fa5A-Za-z0-9\s]{1,20})', question)
    if fallback_match:
        candidate = fallback_match.group(0).strip()
        # 检查候选是否包含疑问词，如果包含则尝试提取疑问词之前的部分
        for keyword in question_keywords:
            if keyword in candidate:
                keyword_pos = candidate.find(keyword)
                if keyword_pos > 0:
                    candidate = candidate[:keyword_pos].strip()
                    break
        if len(candidate) >= 2 and not any(kw in candidate for kw in question_keywords):
            return candidate

    return None

def normalize_game_title(name: str) -> str:
    """
    归一化游戏名称，移除括号/空格并转为小写，便于比较
    """
    cleaned = re.sub(r'[《》<>「」『』\s]+', '', name or '')
    return cleaned.lower()

def resolve_game_name(detected_name: Optional[str], fallback_name: Optional[str]) -> Optional[str]:
    """
    根据检测结果与已有攻略名称，决定最终用于展示的游戏名
    规则：优先返回包含更多信息（更长且包含关系）的名称
    """
    if detected_name and fallback_name:
        normalized_detected = normalize_game_title(detected_name)
        normalized_fallback = normalize_game_title(fallback_name)
        
        if normalized_detected in normalized_fallback and len(fallback_name) > len(detected_name):
            return fallback_name
        if normalized_fallback in normalized_detected and len(detected_name) >= len(fallback_name):
            return detected_name
        # 两者不同且不可包含时，优先返回检测到的，保证与用户输入一致
        return detected_name
    
    return detected_name or fallback_name

def is_direct_game_match(detected_name: Optional[str], fallback_name: Optional[str]) -> bool:
    """
    判断检测到的游戏名与当前攻略名是否直接匹配（忽略空格与括号）
    """
    if not detected_name or not fallback_name:
        return False
    
    normalized_detected = normalize_game_title(detected_name)
    normalized_fallback = normalize_game_title(fallback_name)
    
    return (
        normalized_detected == normalized_fallback
        or normalized_detected in normalized_fallback
        or normalized_fallback in normalized_detected
    )

def get_current_game_name() -> Optional[str]:
    """
    从 guide.txt 中读取当前游戏名称
    """
    global current_game_name
    
    if current_game_name:
        return current_game_name
    
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        guide_path = os.path.join(script_dir, 'guide.txt')
        
        if os.path.exists(guide_path):
            with open(guide_path, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
                # 提取 <<游戏名称>> 格式
                match = re.search(r'<<([^>>]+)>>', first_line)
                if match:
                    current_game_name = match.group(1).strip()
                    return current_game_name
    except Exception as e:
        print(f"读取游戏名称时出错: {e}")
    
    return None

def check_game_match(question: str, rag_chunks: List[str]) -> bool:
    """
    检查 RAG 内容是否适用于问题中的游戏
    返回 True 如果匹配，False 如果不匹配
    """
    # 提取问题中的游戏名称
    question_game = extract_game_name(question)
    
    # 获取当前攻略的游戏名称
    current_game = get_current_game_name()
    
    # 如果问题中没有游戏名称，假设匹配
    if not question_game:
        return True
    
    # 如果当前攻略没有游戏名称，假设不匹配
    if not current_game:
        return False
    
    # 检查游戏名称是否匹配（使用相似度判断）
    if model:
        try:
            # 将游戏名称转换为向量并计算相似度
            question_vec = model.encode([question_game])[0]
            current_vec = model.encode([current_game])[0]
            
            similarity = np.dot(question_vec, current_vec) / (
                np.linalg.norm(question_vec) * np.linalg.norm(current_vec)
            )
            
            # 相似度阈值：0.6 以上认为匹配
            is_match = similarity >= 0.6
            
            print(f"🎮 游戏匹配检测:")
            print(f"   问题中的游戏: {question_game}")
            print(f"   当前攻略游戏: {current_game}")
            print(f"   相似度: {similarity:.4f}")
            print(f"   匹配结果: {'✅ 匹配' if is_match else '❌ 不匹配'}")
            
            return is_match
        except Exception as e:
            print(f"游戏匹配检测出错: {e}")
            # 出错时使用简单的字符串匹配
            return question_game.lower() in current_game.lower() or current_game.lower() in question_game.lower()
    
    # 如果没有模型，使用简单的字符串匹配
    return question_game.lower() in current_game.lower() or current_game.lower() in question_game.lower()

def generate_guide_with_llm(game_name: str, question: str) -> str:
    """
    使用 LLM 生成新游戏的攻略
    """
    api_key = os.getenv('DEEPSEEK_API_KEY')
    
    if not api_key:
        return "无法生成攻略：未配置 DEEPSEEK_API_KEY"
    
    try:
        openai.api_base = "https://api.deepseek.com/v1"
        openai.api_key = api_key
        
        prompt = f"""你是一名硬核游戏攻略撰写专家。当前检测到用户询问的游戏《{game_name}》与现有 RAG 攻略库不匹配，请为这款游戏重新生成完整攻略。请参考以下结构输出 Markdown 内容，并确保用词专业、条理清晰：

## 🎮 游戏概览
- 简述游戏类型、背景、核心特色

## 💡 新手必读
- 3-5 条入门关键技巧（操作、系统、资源）

## ⚔️ 核心机制解析
- 说明战斗/养成/系统玩法，给出示例或优先级

## 🗺️ 任务与进度指引
- 重要主线/支线、小贴士或流程建议

## 🔥 进阶与成就技巧
- 高难度挑战、装备搭配、刷资源策略

额外要求：
- 必须针对《{game_name}》编写，而不是其他游戏
- 可以结合用户问题提供的上下文：{question}
- 保持 Markdown 结构，使用必要的加粗、列表、表情符号增强可读性
- 中文回答"""

        response = openai.ChatCompletion.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个专业的游戏攻略撰写者，擅长撰写详细、实用的游戏攻略。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        guide = response.choices[0].message.content.strip()
        return guide
    except Exception as e:
        print(f"生成攻略时出错: {e}")
        return f"生成攻略时出错: {str(e)}"

def save_guide_to_supabase(game_name: str, guide_content: str, question: str) -> bool:
    """
    将生成的攻略保存到 Supabase
    """
    global supabase
    
    if supabase is None:
        supabase = init_supabase()
    
    if supabase is None:
        print("⚠️  Supabase 未初始化，无法保存攻略")
        return False
    
    try:
        # 检查是否已存在该游戏的攻略
        existing = supabase.table('game_guides').select('*').eq('game_name', game_name).execute()
        
        data = {
            'game_name': game_name,
            'guide_content': guide_content,
            'question': question,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        if existing.data and len(existing.data) > 0:
            # 更新现有攻略
            result = supabase.table('game_guides').update(data).eq('game_name', game_name).execute()
            print(f"✅ 已更新游戏《{game_name}》的攻略到 Supabase")
        else:
            # 插入新攻略
            result = supabase.table('game_guides').insert(data).execute()
            print(f"✅ 已保存游戏《{game_name}》的攻略到 Supabase")
        
        return True
    except Exception as e:
        print(f"❌ 保存攻略到 Supabase 时出错: {e}")
        return False

def load_model():
    """
    加载 sentence-transformers 模型
    """
    global model
    if model is None:
        print("正在加载 sentence-transformers 模型...")
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("模型加载完成")

def find_similar_chunks(question: str, top_k: int = 3, similarity_threshold: float = 0.3, target_game_name: Optional[str] = None) -> Tuple[List[str], float]:
    """
    在向量中搜索最相似的段落
    优化策略：
    1. 如果指定了游戏名称，只搜索该游戏的 chunks
    2. 使用更宽松的 top_k 搜索（先找更多候选）
    3. 然后根据相似度过滤
    返回: (相关段落列表, 最高相似度分数)
    
    Args:
        question: 用户问题
        top_k: 返回最相似的段落数量
        similarity_threshold: 相似度阈值
        target_game_name: 目标游戏名称，如果提供则只搜索该游戏的 chunks
    """
    if model is None or chunks is None or embeddings is None:
        raise RuntimeError("模型或向量未加载")
    
    # 如果指定了游戏名称，先过滤出属于该游戏的 chunks
    valid_indices = None
    if target_game_name and chunk_game_names:
        normalized_target = normalize_game_title(target_game_name)
        valid_indices = [
            i for i, game_name in enumerate(chunk_game_names)
            if game_name and normalize_game_title(game_name) == normalized_target
        ]
        
        if not valid_indices:
            print(f"⚠️  未找到游戏《{target_game_name}》的攻略段落，将搜索所有内容")
            valid_indices = None
        else:
            print(f"🎮 已过滤出 {len(valid_indices)} 个《{target_game_name}》的攻略段落")
    
    # 将问题转换为向量
    question_embedding = model.encode([question])[0]
    
    # 计算余弦相似度（只计算有效索引的相似度）
    if valid_indices is not None:
        # 只计算目标游戏的 chunks 的相似度
        valid_embeddings = embeddings[valid_indices]
        similarities_all = np.zeros(len(chunks))
        valid_similarities = np.dot(valid_embeddings, question_embedding) / (
            np.linalg.norm(valid_embeddings, axis=1) * np.linalg.norm(question_embedding)
        )
        # 将相似度映射回原始索引
        for idx, orig_idx in enumerate(valid_indices):
            similarities_all[orig_idx] = valid_similarities[idx]
        similarities = similarities_all
        # 只从有效索引中选择
        candidate_indices = valid_indices
    else:
        # 计算所有 chunks 的相似度
        similarities = np.dot(embeddings, question_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(question_embedding)
        )
        candidate_indices = list(range(len(chunks)))
    
    # 先获取更多的候选（top_k * 2），然后过滤
    candidate_count = min(top_k * 2, len(candidate_indices))
    # 只从候选索引中选择
    candidate_similarities = similarities[candidate_indices]
    top_local_indices = np.argsort(candidate_similarities)[-candidate_count:][::-1]
    top_indices = [candidate_indices[i] for i in top_local_indices]
    
    # 获取最高相似度
    max_similarity = similarities[top_indices[0]] if len(top_indices) > 0 else 0.0
    
    # 智能选择策略：
    # 1. 如果最高相似度足够高，返回 top_k 个最相似的
    # 2. 如果相似度不够，但有一些段落相似度还可以，返回这些段落
    # 3. 如果相似度都很低，至少返回 1 个最相似的（可能使用 LLM 通用知识）
    if max_similarity >= similarity_threshold:
        # 相似度足够，返回 top_k 个
        selected_indices = top_indices[:top_k]
    else:
        # 相似度不够，使用更宽松的策略
        # 计算动态阈值：最高相似度的 70%
        dynamic_threshold = max_similarity * 0.7 if max_similarity > 0 else 0.1
        
        # 返回所有超过动态阈值的段落（至少 1 个）
        selected_indices = [idx for idx in top_indices if similarities[idx] >= dynamic_threshold]
        
        if not selected_indices:
            # 如果都没有，至少返回相似度最高的 1 个
            selected_indices = [top_indices[0]] if len(top_indices) > 0 else []
        else:
            # 限制数量，但至少返回 1 个
            selected_indices = selected_indices[:top_k]
    
    # 打印调试信息
    print(f"\n{'='*60}")
    print(f"🔍 搜索问题: {question}")
    if target_game_name:
        print(f"🎮 目标游戏: {target_game_name}")
    print(f"{'='*60}")
    print(f"找到 {len(selected_indices)} 个相关段落:")
    for idx, i in enumerate(selected_indices):
        game_info = f" [{chunk_game_names[i] if chunk_game_names and i < len(chunk_game_names) else '未知'}]" if chunk_game_names else ""
        print(f"  [{idx+1}] 相似度: {similarities[i]:.4f}{game_info}")
        print(f"      内容: {chunks[i][:100]}..." if len(chunks[i]) > 100 else f"      内容: {chunks[i]}")
        print()
    print(f"最高相似度: {max_similarity:.4f} (阈值: {similarity_threshold:.4f})")
    if max_similarity >= similarity_threshold:
        print("✅ 相似度足够，将优先使用 RAG 内容回答")
    else:
        print("⚠️  相似度较低，但仍会使用找到的 RAG 内容（可能补充通用知识）")
    print(f"{'='*60}\n")
    
    return [chunks[i] for i in selected_indices], max_similarity

def get_llm_response(question: str, context_chunks: List[str], use_rag: bool = True) -> str:
    """
    将问题和相关段落发送给 Deepseek LLM 生成回答
    
    Args:
        question: 用户问题
        context_chunks: 相关段落列表
        use_rag: 是否使用 RAG 内容（True=严格使用攻略，False=使用通用知识）
    """
    if use_rag and context_chunks:
        # 使用 RAG 内容回答
        context = "\n\n".join([f"段落 {i+1}: {chunk}" for i, chunk in enumerate(context_chunks)])
        
        prompt = f"""你是一个游戏攻略助手。请基于以下攻略内容回答用户问题。

【攻略内容】
{context}
【攻略内容结束】

用户问题：{question}

回答规则：
1. 优先使用上述攻略内容中的信息回答
2. 如果攻略中有相关内容，请直接引用或转述攻略内容
3. 如果攻略中的信息不够完整，可以适当补充合理的游戏常识，但要明确区分哪些是攻略内容，哪些是补充说明
4. 回答要详细、准确、实用，尽量提供完整的答案
5. 如果攻略内容与问题相关度不高，可以基于攻略内容进行合理推断

现在请基于攻略内容回答："""
    else:
        # 使用 LLM 通用知识回答
        prompt = f"""你是一个专业的游戏攻略助手，拥有丰富的游戏知识和经验。

用户问题：{question}

请基于你的游戏知识，提供专业、详细的回答。回答要：
1. 准确、实用
2. 结构清晰，易于理解
3. 包含具体的建议和技巧
4. 如果问题涉及特定游戏，请提供通用的游戏策略和思路

请回答："""

    # 使用 Deepseek API
    api_key = os.getenv('DEEPSEEK_API_KEY')
    
    if api_key:
        try:
            # 配置 Deepseek API
            openai.api_base = "https://api.deepseek.com/v1"
            openai.api_key = api_key
            
            # 使用更低的 temperature 让回答更确定，更严格遵循攻略
            response = openai.ChatCompletion.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一个游戏攻略助手。你必须严格按照用户提供的攻略内容回答问题，不能添加攻略中没有的信息。如果攻略中没有相关信息，必须明确说明。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # 降低温度，让回答更确定
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Deepseek API 调用失败: {str(e)}。请检查 API 密钥配置。"
    else:
        # 如果没有配置 API，返回一个简单的基于规则的回答
        return f"根据攻略内容：{context_chunks[0] if context_chunks else '无相关内容'}，回答您的问题：{question}。\n\n（提示：请设置 DEEPSEEK_API_KEY 环境变量以使用完整的 LLM 功能）"

@app.on_event("startup")
async def startup_event():
    """
    应用启动时加载模型和向量
    """
    load_model()
    init_supabase()
    try:
        load_vectors()
    except FileNotFoundError as e:
        print(f"警告: {e}")

@app.get("/")
async def root():
    return {"message": "RAG 问答系统 API", "status": "running"}

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """
    接收用户问题，在向量中搜索最相似的段落，然后使用 LLM 回答
    
    逻辑流程：
    1. 提取问题中的游戏名称
    2. 搜索 RAG 相关内容
    3. 检查 RAG 内容是否适用于输入的游戏
    4. 如果不适用，使用 LLM 生成新攻略并保存到 Supabase
    5. 如果适用，使用 RAG 内容回答
    """
    try:
        # 提取游戏名称
        game_name = extract_game_name(request.question)
        current_game = get_current_game_name()
        resolved_game_name = resolve_game_name(game_name, current_game)
        print(f"\n{'='*60}")
        print(f"🎮 检测到的游戏名称: {game_name or '未检测到'}")
        print(f"{'='*60}")
        
        # 相似度阈值
        SIMILARITY_THRESHOLD = 0.7
        
        # 如果检测到游戏名称，只搜索该游戏的攻略
        target_game = resolved_game_name or game_name
        
        # 搜索最相似的段落（如果检测到游戏名称，只搜索该游戏的 chunks）
        relevant_chunks, max_similarity = find_similar_chunks(
            request.question, 
            request.top_k,
            similarity_threshold=SIMILARITY_THRESHOLD,
            target_game_name=target_game  # 传入目标游戏名称，实现按游戏过滤
        )
        
        # 判断是否使用 RAG
        use_rag = len(relevant_chunks) > 0
        
        # 如果找到了 RAG 内容，检查游戏是否匹配
        direct_text_match = is_direct_game_match(game_name, current_game)
        skip_game_match_check = direct_text_match and max_similarity >= SIMILARITY_THRESHOLD
        
        if use_rag and game_name and not skip_game_match_check:
            is_game_match = check_game_match(request.question, relevant_chunks)
            
            if not is_game_match:
                # RAG 内容不适用于输入的游戏，生成新攻略
                print(f"\n{'='*60}")
                print(f"⚠️  RAG 内容不适用于游戏《{game_name}》，将生成新攻略")
                print(f"{'='*60}\n")
                
                # 生成新攻略
                new_guide = generate_guide_with_llm(game_name, request.question)
                
                # 保存到 Supabase
                save_success = save_guide_to_supabase(game_name, new_guide, request.question)
                
                if save_success:
                    print(f"✅ 新攻略已保存到 Supabase")
                else:
                    print(f"⚠️  新攻略生成成功，但保存到 Supabase 失败")
                
                return QuestionResponse(
                    answer=new_guide,
                    relevant_chunks=[],
                    source="llm_generated",
                    game_name=resolved_game_name or game_name
                )
        
        # 使用 RAG 内容回答
        if use_rag:
            if max_similarity >= SIMILARITY_THRESHOLD:
                print(f"📝 使用 RAG 模式（高相似度 {max_similarity:.4f}）- 发送给 LLM 的上下文:")
            else:
                print(f"📝 使用 RAG 模式（相似度较低 {max_similarity:.4f}，但仍使用找到的内容）- 发送给 LLM 的上下文:")
            for i, chunk in enumerate(relevant_chunks):
                print(f"  段落 {i+1}: {chunk}")
            print()
            answer = get_llm_response(request.question, relevant_chunks, use_rag=True)
            source = "rag"
        else:
            # 使用 LLM 通用知识回答（完全没有找到相关段落）
            print(f"📝 使用 LLM 通用知识模式（未找到相关段落）")
            print()
            answer = get_llm_response(request.question, [], use_rag=False)
            relevant_chunks = []
            source = "llm_general"
        
        print(f"✅ LLM 生成的回答:")
        print(f"   {answer}")
        print(f"{'='*60}\n")
        
        return QuestionResponse(
            answer=answer,
            relevant_chunks=relevant_chunks,
            source=source,
            game_name=resolved_game_name or game_name
        )
    except Exception as e:
        print(f"错误: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    健康检查接口
    """
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "vectors_loaded": chunks is not None and embeddings is not None,
        "chunks_count": len(chunks) if chunks else 0
    }

if __name__ == '__main__':
    import uvicorn
    print("\n" + "="*50)
    print("🚀 FastAPI 服务启动中...")
    print("="*50)
    print(f"📖 API 文档: http://localhost:8000/docs")
    print(f"❤️  健康检查: http://localhost:8000/health")
    print(f"🌐 服务地址: http://localhost:8000")
    print("="*50 + "\n")
    # 使用导入字符串方式以支持 reload
    uvicorn.run("index:app", host="127.0.0.1", port=8000, reload=True)
