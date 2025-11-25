-- Supabase 表结构：游戏攻略表
-- 在 Supabase Dashboard 的 SQL Editor 中运行此脚本

CREATE TABLE IF NOT EXISTS game_guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_name TEXT NOT NULL UNIQUE,
    guide_content TEXT NOT NULL,
    question TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_guides_game_name ON game_guides(game_name);
CREATE INDEX IF NOT EXISTS idx_game_guides_created_at ON game_guides(created_at);

-- 添加注释
COMMENT ON TABLE game_guides IS '存储游戏攻略的表';
COMMENT ON COLUMN game_guides.game_name IS '游戏名称';
COMMENT ON COLUMN game_guides.guide_content IS '攻略内容';
COMMENT ON COLUMN game_guides.question IS '触发生成攻略的问题';
COMMENT ON COLUMN game_guides.created_at IS '创建时间';
COMMENT ON COLUMN game_guides.updated_at IS '更新时间';
