-- 创建 game_guides 表
-- 用于缓存游戏指南内容

CREATE TABLE IF NOT EXISTS game_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能（不区分大小写的查找）
CREATE INDEX IF NOT EXISTS idx_game_guides_game_name_lower 
ON game_guides (LOWER(game_name));

-- 添加注释
COMMENT ON TABLE game_guides IS '游戏指南缓存表';
COMMENT ON COLUMN game_guides.id IS '主键 UUID';
COMMENT ON COLUMN game_guides.game_name IS '游戏名称（唯一）';
COMMENT ON COLUMN game_guides.content IS '游戏指南内容（Markdown 格式）';
COMMENT ON COLUMN game_guides.created_at IS '创建时间';
