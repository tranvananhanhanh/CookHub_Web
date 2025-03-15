-- Chèn dữ liệu vào bảng users
INSERT INTO users (name, password, avatar_url) VALUES
('Ngọc Lan', 'hashed_password_123', 'https://example.com/avatar1.jpg'),
('Minh Anh', 'hashed_password_456', 'https://example.com/avatar2.jpg'),
('Hà My', 'hashed_password_789', 'https://example.com/avatar3.jpg');

-- Chèn dữ liệu vào bảng admins
INSERT INTO admins (name, password, avatar) VALUES
('Admin1', 'admin_password_123', 'https://example.com/admin1.jpg'),
('Admin2', 'admin_password_456', 'https://example.com/admin2.jpg');

-- Chèn dữ liệu vào bảng recipes
INSERT INTO recipes (user_id, title, type, description, ingredient, level) VALUES
(1, 'Phở Bò', 'Món nước', 'Món ăn truyền thống Việt Nam', 'Bò, bánh phở, hành, gừng', 'Khó'),
(2, 'Bánh Mì', 'Ăn sáng', 'Món ăn đường phố nổi tiếng', 'Bánh mì, pate, thịt nguội, rau', 'Dễ'),
(3, 'Gỏi Cuốn', 'Món khai vị', 'Món ăn tươi mát, dễ làm', 'Tôm, bún, rau sống, bánh tráng', 'Trung bình');

-- Chèn dữ liệu vào bảng recipe_images
INSERT INTO recipe_images (recipe_id, image_url, caption) VALUES
(1, 'https://example.com/pho.jpg', 'Tô phở bò ngon tuyệt'),
(2, 'https://example.com/banhmi.jpg', 'Bánh mì giòn rụm'),
(3, 'https://example.com/goicuon.jpg', 'Gỏi cuốn tươi ngon');

-- Chèn dữ liệu vào bảng reads
INSERT INTO reads (user_id, recipe_id, rate, comment, report, save) VALUES
(2, 1, 5, 'Món này ngon quá!', FALSE, TRUE),
(3, 2, 4, 'Bánh mì giòn ngon nhưng hơi ít pate.', FALSE, TRUE),
(1, 3, 3, 'Gỏi cuốn bình thường, chấm nước mắm ngon.', FALSE, FALSE);

-- Chèn dữ liệu vào bảng manages
INSERT INTO manages (admin_id, recipe_id, action_type) VALUES
(1, 1, 'Browse'),
(2, 2, 'Browse'),
(1, 3, 'Block');
