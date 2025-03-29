-- Bảng người dùng
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Nguyen Van A', 'a@example.com', 'hash1', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Tran Thi B', 'b@example.com', 'hash2', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Le Van C', 'c@example.com', 'hash3', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Pham Thi D', 'd@example.com', 'hash4', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Hoang Van E', 'e@example.com', 'hash5', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Nguyen Van F', 'f@example.com', 'hash6', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Tran Thi G', 'g@example.com', 'hash7', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Le Van H', 'h@example.com', 'hash8', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Pham Thi I', 'i@example.com', 'hash9', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Hoang Van J', 'j@example.com', 'hash10', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Nguyen Van K', 'k@example.com', 'hash11', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Tran Thi L', 'l@example.com', 'hash12', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Le Van M', 'm@example.com', 'hash13', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Pham Thi N', 'n@example.com', 'hash14', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Hoang Van O', 'o@example.com', 'hash15', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Nguyen Van P', 'p@example.com', 'hash16', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Tran Thi Q', 'q@example.com', 'hash17', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Le Van R', 'r@example.com', 'hash18', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Pham Thi S', 's@example.com', 'hash19', '', FALSE);
INSERT INTO users (name, email, password_hash, avatar, is_banned) VALUES
('Hoang Van T', 't@example.com', 'hash20', '', FALSE);

-- Bảng công thức nấu ăn
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Pho Bo', 'pho_bo.png', 'Món phở bò truyền thống', 45, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Banh Mi', 'banh_mi.png', 'Bánh mì Việt Nam', 10, 1, 'rejected', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Bun Bo Hue', 'bun_bo_hue.png', 'Bún bò Huế cay nồng', 60, 3, 'pending', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Com Tam', 'com_tam.png', 'Cơm tấm sườn bì chả', 30, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Goi Cuon', 'goi_cuon.png', 'Gỏi cuốn tôm thịt', 15, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Cha Gio', 'cha_gio.png', 'Chả giò giòn rụm', 40, 4, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Lau Thai', 'lau_thai.png', 'Lẩu thái chua cay', 60, 4, 'pending', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Mi Quang', 'mi_quang.png', 'Mì Quảng đặc trưng', 50, 3, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Xoi Ga', 'xoi_ga.png', 'Xôi gà lá chanh', 40, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Banh Xeo', 'banh_xeo.png', 'Bánh xèo vàng giòn', 50, 3, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Hu Tieu', 'hu_tieu.png', 'Hủ tiếu Nam Vang', 45, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(1, 'Bo Kho', 'bo_kho.png', 'Bò kho đậm đà', 90, 3, 'pending', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Che Ba Mau', 'che_ba_mau.png', 'Chè ba màu thơm ngon', 20, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Banh Bao', 'banh_bao.png', 'Bánh bao nhân thịt', 60, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Bun Rieu', 'bun_rieu.png', 'Bún riêu cua ngon miệng', 50, 3, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Nem Lui', 'nem_lui.png', 'Nem lụi nướng thơm ngon', 40, 4, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Bo Luc Lac', 'bo_luc_lac.png', 'Bò lúc lắc mềm ngon', 35, 2, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Ga Nuong', 'ga_nuong.png', 'Gà nướng mật ong', 60, 4, 'approved', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Canh Chua', 'canh_chua.png', 'Canh chua cá lóc', 40, 3, 'rejected', '2025-03-20 17:10:25');
INSERT INTO recipes (user_id, title, thumbnail, description, cooking_time, servings, status, date_created) VALUES
(2, 'Banh Flan', 'banh_flan.png', 'Bánh flan béo ngậy', 30, 2, 'approved', '2025-03-20 17:10:25');

-- Bảng hình ảnh các bước nấu ăn
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step1_pho_bo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step2_pho_bo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step3_pho_bo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step4_pho_bo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step5_pho_bo.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(2, 'step1_banh_mi.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(2, 'step2_banh_mi.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(2, 'step3_banh_mi.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(2, 'step4_banh_mi.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step1_bun_bo_hue.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step2_bun_bo_hue.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step3_bun_bo_hue.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step4_bun_bo_hue.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step5_bun_bo_hue.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(4, 'step1_com_tam.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(4, 'step2_com_tam.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(4, 'step3_com_tam.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(4, 'step4_com_tam.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step1_goi_cuon.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step2_goi_cuon.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step3_goi_cuon.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step4_goi_cuon.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step1_cha_gio.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step2_cha_gio.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step3_cha_gio.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step4_cha_gio.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step5_cha_gio.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step1_lau_thai.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step2_lau_thai.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step3_lau_thai.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step4_lau_thai.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step5_lau_thai.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step1_mi_quang.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step2_mi_quang.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step3_mi_quang.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step4_mi_quang.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step1_xoi_ga.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step2_xoi_ga.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step3_xoi_ga.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step4_xoi_ga.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step1_banh_xeo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step2_banh_xeo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step3_banh_xeo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step4_banh_xeo.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step5_banh_xeo.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step1_hu_tieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step2_hu_tieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step3_hu_tieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step4_hu_tieu.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step1_bo_kho.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step2_bo_kho.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step3_bo_kho.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step4_bo_kho.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step5_bo_kho.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step1_che_ba_mau.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step2_che_ba_mau.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step3_che_ba_mau.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step4_che_ba_mau.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step5_che_ba_mau.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step1_banh_bao.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step2_banh_bao.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step3_banh_bao.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step4_banh_bao.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step5_banh_bao.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step1_bun_rieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step2_bun_rieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step3_bun_rieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step4_bun_rieu.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step5_bun_rieu.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step1_nem_lui.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step2_nem_lui.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step3_nem_lui.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step4_nem_lui.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step5_nem_lui.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step1_bo_luc_lac.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step2_bo_luc_lac.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step3_bo_luc_lac.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step4_bo_luc_lac.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step5_bo_luc_lac.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step1_ga_nuong.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step2_ga_nuong.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step3_ga_nuong.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step4_ga_nuong.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step5_ga_nuong.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step1_canh_chua.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step2_canh_chua.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step3_canh_chua.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step4_canh_chua.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step5_canh_chua.jpg');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step1_banh_flan.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step2_banh_flan.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step3_banh_flan.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step4_banh_flan.jpg');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step5_banh_flan.jpg');

-- Bảng nguyên liệu
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Thịt bò', 250, 26, 15, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bánh mì', 250, 10, 3, 50);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Rau thơm', 15, 1, 0, 3);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gạo', 360, 7, 1, 80);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Thịt heo', 270, 25, 20, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Trứng', 150, 13, 10, 1);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Đường', 400, 0, 0, 100);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Muối', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Hành tây', 40, 1, 0, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Tỏi', 150, 6, 1, 33);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Ớt', 40, 2, 0, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Sữa', 42, 3, 1, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bơ', 720, 1, 81, 1);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dừa', 354, 3, 33, 15);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Cà rốt', 41, 1, 0, 10);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Khoai tây', 77, 2, 0, 17);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Đậu xanh', 350, 25, 1, 60);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Thịt gà', 239, 27, 14, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Cá lóc', 90, 20, 1, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bột mì', 340, 10, 1, 70);

-- Bảng đơn vị đo nguyên liệu
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('gram', 1, 1);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('ổ', 2, 150);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('bát', 3, 200);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('muỗng canh', 4, 15);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('củ', 5, 50);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('ml', 6, 1);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('quả', 7, 60);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('nhánh', 8, 5);
INSERT INTO ingredient_units (unit_name, ingredient_id, equivalent_grams) VALUES
('lát', 9, 20);

-- Bảng nguyên liệu trong công thức
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(1, 1, 1, 500);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(2, 2, 2, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 1, 1, 400);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(4, 5, 5, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(5, 3, 3, 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(6, 6, 6, 50);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(7, 7, 7, 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(8, 8, 8, 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(9, 9, 9, 5);

-- Bảng danh mục món ăn
INSERT INTO categories (category_name) VALUES
('Soup dishes');
INSERT INTO categories (category_name) VALUES
('Breakfast dishes');
INSERT INTO categories (category_name) VALUES
('Vegetarian dishes');
INSERT INTO categories (category_name) VALUES
('Grilled dishes');
INSERT INTO categories (category_name) VALUES
('Fried dishes');
INSERT INTO categories (category_name) VALUES
('Desserts');
INSERT INTO categories (category_name) VALUES
('Noodle dishes');
INSERT INTO categories (category_name) VALUES
('Rice dishes');
INSERT INTO categories (category_name) VALUES
('Seafood dishes');
INSERT INTO categories (category_name) VALUES
('Stews');
INSERT INTO categories (category_name) VALUES
('Salads');
INSERT INTO categories (category_name) VALUES
('Appetizers');
INSERT INTO categories (category_name) VALUES
('Main courses');
INSERT INTO categories (category_name) VALUES
('Street food');
INSERT INTO categories (category_name) VALUES
('Beverages');
INSERT INTO categories (category_name) VALUES
('Side dishes');
INSERT INTO categories (category_name) VALUES
('Healthy dishes');
INSERT INTO categories (category_name) VALUES
('Fast food');

-- Bảng liên kết công thức với danh mục
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(1, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(1, 7);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(2, 2);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(2, 14);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(3, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(3, 7);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(4, 8);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(5, 11);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(5, 12);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(6, 5);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(7, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(7, 9);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(8, 7);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(8, 14);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(9, 8);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(10, 5);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(11, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(12, 10);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(13, 6);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(14, 14);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(15, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(16, 4);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(17, 14);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(18, 4);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(19, 1);
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
(20, 6);

-- Bảng đánh giá món ăn
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(1, 1, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(2, 2, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(3, 3, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(4, 4, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(5, 5, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(6, 6, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(7, 7, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(8, 8, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(9, 9, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(10, 10, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(11, 11, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(12, 12, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(13, 13, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(14, 14, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(15, 15, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(16, 16, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(17, 17, 4);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(18, 18, 3);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(19, 19, 5);
INSERT INTO ratings (user_id, recipe_id, rate) VALUES
(20, 20, 4);

-- Bảng bình luận
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(1, 1, 'Món ăn rất ngon!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(1, 1, 'Tuyệt vời luôn!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(2, 2, 'Bánh mì giòn rụm!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(3, 3, 'Bún bò cay quá!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(4, 4, 'Cơm tấm ngon tuyệt!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(4, 4, 'Mãi mới thấy công thức ngon như này');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(5, 5, 'Nguyên liệu rất tươi!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(6, 6, 'Chả giò giòn và thơm!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(7, 7, 'Lẩu thái đậm vị!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(7, 7, 'Mình thấy công thức này chuẩn nè');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(8, 8, 'Mì Quảng chuẩn vị!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(9, 9, 'Xôi gà thơm ngon!');
INSERT INTO comments (user_id, recipe_id, comment) VALUES
(10, 10, 'Bánh xèo giòn rụm!');

-- Bảng lưu công thức yêu thích
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(1, 1);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(2, 2);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(3, 3);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(4, 4);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(5, 5);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(6, 6);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(7, 7);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(8, 8);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(9, 9);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(10, 10);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(11, 11);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(12, 12);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(13, 13);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(14, 14);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(15, 15);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(16, 16);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(17, 17);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(18, 18);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(19, 19);
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(20, 20);

-- Bảng báo cáo nội dung
INSERT INTO reports (user_id, recipe_id, reason, report_status) VALUES
(1, 3, 'Nội dung không phù hợp', 'pending');
INSERT INTO reports (user_id, recipe_id, reason, report_status) VALUES
(2, 2, 'Thiếu thông tin', 'accepted');
INSERT INTO reports (user_id, recipe_id, reason, report_status) VALUES
(3, 5, 'Hình ảnh không rõ ràng', 'pending');
INSERT INTO reports (user_id, recipe_id, reason, report_status) VALUES
(4, 7, 'Món ăn không tồn tại', 'rejected');
INSERT INTO reports (user_id, recipe_id, reason, report_status) VALUES
(5, 10, 'Sai nguyên liệu', 'accepted');