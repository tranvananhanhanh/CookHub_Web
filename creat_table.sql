-- Bảng users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255)
);

-- Bảng admins
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255)
);

-- Bảng công thức nấu ăn
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    ingredient TEXT,
    level VARCHAR(50),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng ảnh của công thức
CREATE TABLE recipe_images (
    image_id SERIAL PRIMARY KEY,
    recipe_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Bảng người dùng xem công thức

CREATE TABLE reads (
    user_id INT,
    recipe_id INT,
    rate INT CHECK (rate BETWEEN 1 AND 5), -- Cột đánh giá từ 1 đến 5 sao
    comment TEXT,
    report BOOLEAN DEFAULT FALSE,
    save BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Bảng admin quản lý công thức
CREATE TABLE manages (
    admin_id INT,
    recipe_id INT,
    action_type VARCHAR(10) NOT NULL,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, recipe_id),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    CHECK (action_type IN ('Block', 'Browse'))
);


