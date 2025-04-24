-- Bảng người dùng
-- CREATE TABLE users (
--     user_id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL,
--     avatar TEXT DEFAULT '',
--     is_banned BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT NOW(),
-- 	last_login TIMESTAMP NULL

-- );
-- new users table add age and gender 
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    random_code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    profile_background TEXT DEFAULT '',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP NULL,
    age INT CHECK (age >= 0),
    gender VARCHAR(10) CHECK (gender IN ('female', 'male', 'other'))
);

-- Bảng liên kết các mạng xã hội của người dùng
CREATE TABLE user_social_links (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'x')),  
    url TEXT NOT NULL, -- URL của tài khoản mạng xã hội
    PRIMARY KEY (user_id, platform)
);

-- Bảng liên kết các mạng xã hội của người dùng
CREATE TABLE user_social_links (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'x')),  
    url TEXT NOT NULL, -- URL của tài khoản mạng xã hội
    PRIMARY KEY (user_id, platform)
);

-- Bảng công thức nấu ăn
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    thumbnail TEXT NOT NULL,  -- URL ảnh chính của món ăn
    description TEXT,
    cooking_time INTEGER CHECK (cooking_time > 0),
    servings INTEGER CHECK (servings > 0), -- Khẩu phần ăn
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')) DEFAULT 'pending',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hình ảnh các bước nấu ăn
CREATE TABLE recipe_images (
    image_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- Bảng mô tả các bước nấu ăn
CREATE TABLE recipe_steps (
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,  -- Liên kết với công thức nấu ăn
    step_number INTEGER NOT NULL CHECK (step_number > 0),  -- Số thứ tự bước trong công thức
    description TEXT NOT NULL,  -- Mô tả chi tiết về bước nấu ăn, có thể là văn bản mô tả hoặc link
    PRIMARY KEY (recipe_id, step_number) 
);

-- Bảng nguyên liệu
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    calories_per_100g FLOAT CHECK (calories_per_100g >= 0),
    protein_per_100g FLOAT CHECK (protein_per_100g >= 0),
    fat_per_100g FLOAT CHECK (fat_per_100g >= 0),
    carbs_per_100g FLOAT CHECK (carbs_per_100g >= 0)
);

-- Bảng đơn vị 
CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name TEXT UNIQUE NOT NULL,       -- ví dụ: 'gram', 'kg', 'tsp'
    equivalent_grams FLOAT NOT NULL CHECK (equivalent_grams > 0) -- Quy đổi tất cả đơn vị ra gram. Ví dụ: 1 kg = 1000g
);

-- Bảng nguyên liệu trong công thức
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    amount FLOAT CHECK (amount > 0),
    unit_id INTEGER NOT NULL DEFAULT 1 REFERENCES units(unit_id)  -- Mặc định là gram (unit_id = 1)
);

-- Bảng danh mục món ăn
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL, -- Cấp 1: Chia theo loại món ăn
    category_name VARCHAR(100) UNIQUE NOT NULL -- Cấp 2: Chia theo đặc điểm/kiểu nấu
);

-- Bảng liên kết công thức với danh mục
CREATE TABLE recipe_categories (
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, category_id)
);

-- Bảng đánh giá món ăn
CREATE TABLE ratings (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    rate INTEGER NOT NULL CHECK (rate BETWEEN 1 AND 5),
    PRIMARY KEY (user_id, recipe_id)
);

-- Bảng bình luận
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lưu công thức yêu thích
CREATE TABLE saved_recipes (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, recipe_id)
);

-- Bảng báo cáo nội dung
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Người báo cáo
    recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE, -- Công thức bị báo cáo
    reason TEXT NOT NULL,
    report_status VARCHAR(50) CHECK (report_status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);