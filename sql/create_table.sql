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
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP NULL,
    age INT CHECK (age >= 0),
    gender VARCHAR(10) CHECK (gender IN ('female', 'male', 'other'))
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

-- Bảng nguyên liệu
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    calories_per_100g FLOAT NOT NULL CHECK (calories_per_100g >= 0),
    protein_per_100g FLOAT NOT NULL CHECK (protein_per_100g >= 0),
    fat_per_100g FLOAT NOT NULL CHECK (fat_per_100g >= 0),
    carbs_per_100g FLOAT NOT NULL CHECK (carbs_per_100g >= 0)
);

-- Bảng đơn vị đo nguyên liệu
CREATE TABLE ingredient_units (
    unit_id SERIAL PRIMARY KEY,
	unit_name VARCHAR(50) NOT NULL, -- VD: lít, muỗng cà phê, cốc,...
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    equivalent_grams FLOAT NOT NULL CHECK (equivalent_grams > 0) -- Quy đổi sang gam, ví dụ: "1 củ hành" = 50g
);

-- Bảng nguyên liệu trong công thức
CREATE TABLE recipe_ingredients (
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    amount FLOAT NOT NULL CHECK (amount > 0),
    unit_id INTEGER REFERENCES ingredient_units(unit_id),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Bảng danh mục món ăn
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
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
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    report_status VARCHAR(50) CHECK (report_status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);