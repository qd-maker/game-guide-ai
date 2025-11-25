"""
将 guide.txt 文件向量化，生成 guide_vectors.json
"""
import os
import json
import re
from sentence_transformers import SentenceTransformer
import numpy as np

def split_text_into_chunks(text: str, chunk_size: int = 200, overlap: int = 50) -> list:
    """
    将文本分割成 chunks
    chunk_size: 每个 chunk 的字符数
    overlap: chunks 之间的重叠字符数
    """
    chunks = []
    
    # 按段落分割（保留换行符）
    paragraphs = text.split('\n\n')
    
    current_chunk = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # 如果当前 chunk 加上新段落不超过 chunk_size，则添加
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
        else:
            # 如果当前 chunk 不为空，保存它
            if current_chunk:
                chunks.append(current_chunk)
            
            # 如果新段落本身就很长，需要进一步分割
            if len(para) > chunk_size:
                # 按句子分割长段落
                sentences = re.split(r'[。！？.!?]\s*', para)
                current_chunk = ""
                for sentence in sentences:
                    sentence = sentence.strip()
                    if not sentence:
                        continue
                    
                    if len(current_chunk) + len(sentence) + 1 <= chunk_size:
                        if current_chunk:
                            current_chunk += " " + sentence
                        else:
                            current_chunk = sentence
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sentence
            else:
                current_chunk = para
    
    # 添加最后一个 chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    # 应用重叠策略：如果 chunks 之间有重叠，可以保留更多上下文
    if overlap > 0 and len(chunks) > 1:
        overlapped_chunks = [chunks[0]]
        for i in range(1, len(chunks)):
            prev_chunk = chunks[i-1]
            current_chunk = chunks[i]
            
            # 取前一个 chunk 的最后 overlap 个字符
            if len(prev_chunk) > overlap:
                overlap_text = prev_chunk[-overlap:]
                overlapped_chunk = overlap_text + " " + current_chunk
            else:
                overlapped_chunk = current_chunk
            
            overlapped_chunks.append(overlapped_chunk)
        chunks = overlapped_chunks
    
    return chunks

def load_guide_file(guide_file: str = 'guide.txt') -> str:
    """
    加载 guide.txt 文件
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    guide_path = os.path.join(script_dir, guide_file)
    
    if not os.path.exists(guide_path):
        raise FileNotFoundError(f"文件 {guide_path} 不存在")
    
    with open(guide_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return content

def vectorize_guide(guide_file: str = 'guide.txt', output_file: str = 'guide_vectors.json', 
                    chunk_size: int = 200, overlap: int = 50):
    """
    将 guide.txt 向量化并保存到 guide_vectors.json
    
    Args:
        guide_file: 输入的攻略文件路径
        output_file: 输出的向量文件路径
        chunk_size: 每个 chunk 的字符数
        overlap: chunks 之间的重叠字符数
    """
    print("=" * 60)
    print("🚀 开始向量化攻略文件...")
    print("=" * 60)
    
    # 1. 加载攻略文件
    print(f"📖 正在加载 {guide_file}...")
    text = load_guide_file(guide_file)
    print(f"✅ 已加载，文件大小: {len(text)} 字符")
    
    # 2. 分割成 chunks
    print(f"\n📝 正在将文本分割成 chunks (chunk_size={chunk_size}, overlap={overlap})...")
    chunks = split_text_into_chunks(text, chunk_size=chunk_size, overlap=overlap)
    print(f"✅ 已分割成 {len(chunks)} 个 chunks")
    
    # 显示前几个 chunks 的预览
    print("\n前 3 个 chunks 预览:")
    for i, chunk in enumerate(chunks[:3]):
        print(f"  [{i+1}] {chunk[:100]}..." if len(chunk) > 100 else f"  [{i+1}] {chunk}")
    
    # 3. 加载模型
    print(f"\n🤖 正在加载 sentence-transformers 模型...")
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    print("✅ 模型加载完成")
    
    # 4. 生成向量
    print(f"\n🔢 正在为 {len(chunks)} 个 chunks 生成向量...")
    embeddings = model.encode(chunks, show_progress_bar=True)
    print(f"✅ 向量生成完成，向量维度: {embeddings.shape}")
    
    # 5. 保存到 JSON 文件
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, output_file)
    
    print(f"\n💾 正在保存到 {output_path}...")
    
    # 将 numpy 数组转换为列表（JSON 可序列化）
    data = {
        'chunks': chunks,
        'embeddings': embeddings.tolist()
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已保存到 {output_path}")
    print(f"\n📊 统计信息:")
    print(f"   - 总 chunks 数: {len(chunks)}")
    print(f"   - 向量维度: {embeddings.shape[1]}")
    print(f"   - 文件大小: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
    print("=" * 60)
    print("🎉 向量化完成！")
    print("=" * 60)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='将 guide.txt 向量化')
    parser.add_argument('--guide', type=str, default='guide.txt', 
                       help='输入的攻略文件路径 (默认: guide.txt)')
    parser.add_argument('--output', type=str, default='guide_vectors.json',
                       help='输出的向量文件路径 (默认: guide_vectors.json)')
    parser.add_argument('--chunk-size', type=int, default=200,
                       help='每个 chunk 的字符数 (默认: 200)')
    parser.add_argument('--overlap', type=int, default=50,
                       help='chunks 之间的重叠字符数 (默认: 50)')
    
    args = parser.parse_args()
    
    vectorize_guide(
        guide_file=args.guide,
        output_file=args.output,
        chunk_size=args.chunk_size,
        overlap=args.overlap
    )

