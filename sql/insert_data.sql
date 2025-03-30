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
(1, 'step1_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step1_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step1_pho_bo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step2_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step2_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step2_pho_bo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step3_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step3_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step3_pho_bo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step4_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step4_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step4_pho_bo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step5_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step5_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step5_pho_bo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step6_pho_bo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step6_pho_bo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, 'step6_pho_bo(3).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step6_bun_bo_hue(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(3, 'step6_bun_bo_hue(2).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(4, 'step3_com_tam(1).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step6_goi_cuon(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step6_goi_cuon(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step7_goi_cuon(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(5, 'step7_goi_cuon(2).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step2_cha_gio(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step3_cha_gio(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step4_cha_gio(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step5_cha_gio(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step5_cha_gio(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(6, 'step5_cha_gio(3).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step1_lau_thai(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step1_lau_thai(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step1_lau_thai(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step2_lau_thai(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step2_lau_thai(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step2_lau_thai(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step3_lau_thai(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(7, 'step3_lau_thai(2).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step1_mi_quang(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step1_mi_quang(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step1_mi_quang(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step2_mi_quang(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step2_mi_quang(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step2_mi_quang(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step3_mi_quang(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step3_mi_quang(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(8, 'step3_mi_quang(3).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step1_xoi_ga(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step1_xoi_ga(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(9, 'step3_xoi_ga(1).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step1_banh_xeo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step1_banh_xeo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step1_banh_xeo(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step2_banh_xeo(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step2_banh_xeo(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(10, 'step2_banh_xeo(3).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step1_hu_tieu(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step1_hu_tieu(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step1_hu_tieu(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step2_hu_tieu(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step2_hu_tieu(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step2_hu_tieu(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(11, 'step3_hu_tieu(1).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step1_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step1_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step1_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step2_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step2_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step2_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step3_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step3_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step3_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step4_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step4_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step4_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step5_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step5_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step5_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step6_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step6_bo_kho(2).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step6_bo_kho(3).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step7_bo_kho(1).png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(12, 'step7_bo_kho(2).png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step1_che_ba_mau.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step2_che_ba_mau.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step3_che_ba_mau.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step4_che_ba_mau.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(13, 'step5_che_ba_mau.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step1_banh_bao.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step2_banh_bao.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step3_banh_bao.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step4_banh_bao.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(14, 'step5_banh_bao.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step1_bun_rieu.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step2_bun_rieu.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step3_bun_rieu.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step4_bun_rieu.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(15, 'step5_bun_rieu.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step1_nem_lui.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step2_nem_lui.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step3_nem_lui.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step4_nem_lui.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(16, 'step5_nem_lui.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step1_bo_luc_lac.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step2_bo_luc_lac.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step3_bo_luc_lac.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step4_bo_luc_lac.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(17, 'step5_bo_luc_lac.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step1_ga_nuong.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step2_ga_nuong.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step3_ga_nuong.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step4_ga_nuong.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(18, 'step5_ga_nuong.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step1_canh_chua.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step2_canh_chua.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step3_canh_chua.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step4_canh_chua.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(19, 'step5_canh_chua.png');

INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step1_banh_flan.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step2_banh_flan.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step3_banh_flan.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step4_banh_flan.png');
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(20, 'step5_banh_flan.png');

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
('Đường', 400, 0, 0, 100);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Sữa', 42, 3, 1, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bơ', 720, 1, 81, 1);
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
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bắp bò', 250, 26, 15, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gân bò', 150, 31, 4, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bò viên', 220, 16, 14, 4);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bánh phở', 110, 2, 0.3, 25);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gừng', 80, 1.8, 0.8, 17);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Hành tây', 40, 1.1, 0.1, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Giá', 30, 3, 0.1, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Ngò gai', 23, 2.2, 0.5, 3);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Húng quế', 22, 3.2, 0.6, 2.7);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Hành ngò', 25, 1.8, 0.2, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước ấm', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bột số 13', 364, 10, 1, 76);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Muối', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Trứng', 143, 12.6, 9.5, 1.1);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước lạnh', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước chanh', 22, 0.4, 0.2, 7);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dầu ăn', 884, 0, 100, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Xương bò', 150, 25, 5, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Chân giò', 270, 17, 22, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Sả', 99, 1.8, 0.5, 25);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Giò lụa', 160, 14, 10, 3);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Tóp mỡ hành phi', 800, 0, 88, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gừng nướng', 80, 1.8, 0.8, 17);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bún', 110, 2, 0.3, 25);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Mắm ruốc', 80, 10, 2, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Ớt tươi', 40, 1.9, 0.4, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Ớt bột', 282, 14, 13, 56);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Hành tím', 40, 1.1, 0.1, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Tỏi', 149, 6.4, 0.5, 33);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dầu điều', 884, 0, 100, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Chả trứng', 200, 14, 12, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Thịt đùi', 250, 26, 15, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dừa', 354, 3.3, 33, 15);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nấm mèo', 35, 2.2, 0.2, 7);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bún tàu', 365, 0, 0, 91);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Khoai lang', 86, 1.6, 0.1, 20);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Cà rốt', 41, 0.9, 0.2, 10);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Tiêu xay', 251, 10, 3, 64);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dầu olive', 884, 0, 100, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Tôm', 99, 24, 0.3, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nghêu', 86, 15, 1.5, 5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Mực', 92, 15, 1.5, 3);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nấm đông cô', 35, 2.2, 0.2, 7);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nấm kim châm', 37, 2.7, 0.2, 8);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nấm linh chi nâu', 22, 3.1, 0.3, 3.4);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Cải dún', 23, 2.3, 0.3, 3);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Cải thìa', 13, 1.5, 0.2, 2);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Sốt tomyum', 50, 3.5, 2, 7.5);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Vịt', 337, 19, 28, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước dừa khô', 18, 0, 0, 4);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Mì quảng', 110, 2, 0.3, 25);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Đậu phộng', 567, 26, 49, 16);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Thịt ức gà', 165, 31, 3.6, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Lạp xưởng', 541, 16, 52, 10);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nước cốt dừa', 230, 2, 24, 6);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bột bánh xèo', 350, 8, 2, 78);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Soda', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Hủ tiếu mềm', 110, 2, 0.3, 25);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Nõn tôm', 99, 24, 0.3, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Trứng cút', 154, 13, 11, 1.2);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Dầu hào', 50, 1, 0, 10);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Rượu trắng', 231, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bột nghệ', 354, 8, 10, 65);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Bột ngũ vị hương', 300, 10, 3, 60);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gia vị nấu phở', 250, 8, 2, 50);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
('Gia vị', NULL, NULL, NULL, NULL);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Men', 325, 45, 5, 40);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Hành tây nướng', 40, 1, 0, 9);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Rau', 25, 2, 0.2, 4.5); -- Giá trị trung bình
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Hạt nêm', 250, 10, 2, 50);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Bột canh', 150, 5, 1, 30);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Bột điều đỏ', 350, 10, 5, 60);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Nước mắm', 150, 10, 0, 30);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Bột tỏi', 331, 16, 0.7, 72);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Trứng gà', 143, 12.6, 9.5, 0.7);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Thịt ba chỉ', 518, 9, 50, 1);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Rau sống', NULL, NULL, NULL, NULL);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Hành lá', 32, 2, 0.4, 7);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Bánh tráng nhúng', 320, 5, 1, 72);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Dứa', 50, 0.5, 0.1, 13);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Mắm nêm', 130, 8, 3, 12);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Bánh tráng', 320, 2, 1, 75);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Hành phi', 550, 8, 45, 35);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Bột nêm gà', 250, 5, 3, 50);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Nước mắm gừng', NULL, NULL, NULL, NULL);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Xà lách', 15, 1.4, 0.2, 2.9);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Húng lủi', 44, 3.3, 0.7, 8);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Đường phèn', 400, 0, 0, 100);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Ớt sa tế', 120, 2, 10, 5);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Nước tương', 80, 8, 0, 10);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Bột năng', 350, 0.3, 0, 87);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Tương ớt', 100, 1, 0.5, 22);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Nước dứa ép', 55, 0.5, 0.1, 13);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Nấm hương', 28, 2.2, 0.4, 5.6);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Củ cải trắng', 18, 0.6, 0.1, 4.2);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES  
('Rau cải xanh', 16, 1.7, 0.2, 3.1);  
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Dầu mè', 884, 0, 100, 0); 
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Bột ngọt', 0, 0, 0, 0);
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES 
('Ớt hiểm', 40, 2, 0.4, 9);

-- Đơn vị chung (ingredient_id = NULL)
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'gram', 1);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'lạng', 100);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'kg', 1000);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'ml', 1);

-- Đơn vị riêng theo nguyên liệu
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(2, 'ổ', 150),  -- Ổ bánh mì nặng 150g
(4, 'bát', 200),  -- 1 bát bún = 200g
(6, 'muỗng cà phê', 3),  -- 1 muỗng cà phê bột = 3g
(7, 'hộp', 250),  -- 1 hộp sữa đặc = 250g
(8, 'muỗng canh', 14),  -- 1 muỗng canh dầu ăn = 14g
(9, 'củ', 150),  -- 1 củ hành tây = 150g
(10, 'bát', 200),  -- 1 bát nước lèo = 200g
(12, 'con', 500),  -- 1 con gà = 500g
(13, 'con', 300),  -- 1 con cá = 300g
(14, 'cái', 500),  -- Giả sử 1 cái bắp bò nặng 500g
(14, 'miếng', 50), -- 1 miếng bắp bò = 50g
(16, 'viên', 15),  -- 1 viên bò viên = 15g
(17, 'vắt', 50),  -- 1 vắt bánh phở = 50g
(17, 'tô', 200),  -- 1 tô bánh phở = 200g
(18, 'củ nhỏ', 20), 
(18, 'củ', 50),
(18, 'củ lớn', 100),
(18, 'miếng', 10),
(19, 'củ nhỏ', 75),   -- 1 củ hành tây nhỏ ≈ 75g
(19, 'củ', 150),  -- 1 củ hành tây vừa ≈ 150g
(19, 'củ lớn', 250),  -- 1 củ hành tây lớn ≈ 250g
(19, 'nửa củ', 75),   -- Nửa củ hành tây vừa ≈ 75g
(19, 'miếng', 25),    -- 1 miếng hành tây ≈ 25g (thường cắt miếng khi nấu) 
(79, 'gói', 50),   -- 1 gói gia vị nấu phở ≈ 50g
(79, 'gói lớn', 100),  -- 1 gói gia vị nấu phở lớn ≈ 100g
(79, 'muỗng cà phê', 3),  -- 1 muỗng cà phê gia vị nấu phở ≈ 3g
(79, 'muỗng canh', 9),  -- 1 muỗng canh gia vị nấu phở ≈ 9g 
(27, 'quả nhỏ', 40),  -- trứng
(27, 'quả', 50),  
(27, 'quả lớn', 60),  
(27, 'lòng đỏ', 18),  
(27, 'lòng trắng', 32),
(33, 'lít', 1000), -- 1 lít nước = 1kg  
(30, 'ml', 0.92); -- 1ml dầu ăn ~ 0.92g
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'muỗng canh', 20);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'thìa canh', 15);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(NULL, 'thìa cà phê', 5);
INSERT INTO units (ingredient_id, unit_name, equivalent_grams) VALUES 
(89, 'quả', 50),
(89, 'trái', 50),
(47, 'trái', 1000),  -- Giả sử 1 trái dừa trung bình nặng 1000g (1kg)
(47, 'ly', 250),  -- Giả sử 1 ly nước dừa chứa 250ml
(93, 'gói', 200),  -- Giả sử 1 gói bánh tráng nhúng nặng 200g
(96, 'miếng', 10),  -- Giả sử 1 miếng bánh tráng nặng 10g  
(48, 'tai', 5),  -- Giả sử 1 tai nấm mèo nặng 5g  
(49, 'vắt', 50),  -- Giả sử 1 vắt bún tàu nặng 50g  
(50, 'củ', 200),  -- Giả sử 1 củ khoai lang trung bình nặng 200g  
(51, 'củ', 100),  -- Giả sử 1 củ cà rốt trung bình nặng 100g  
(58, 'bịch', 200),  -- Giả sử 1 bịch nấm kim châm nặng 200g  
(59, 'bịch', 250),  -- Giả sử 1 bịch nấm linh chi nâu nặng 250g  
(60, 'bó', 300),  -- Giả sử 1 bó cải dún nặng 300g  
(61, 'bó', 250),  -- Giả sử 1 bó cải thìa nặng 250g  
(63, 'con', 2000),  -- Giả sử 1 con vịt trung bình nặng 2kg  
(NULL, 'lít', 1000),  
(74, 'quả', 10),  -- Giả sử 1 quả trứng cút nặng khoảng 10g  
(73, 'chén', 180),  -- Giả sử 1 chén nõn tôm nặng 180g
(34, 'cây', 20);  -- Giả sử 1 cây sả trung bình nặng 20g

-- Bảng nguyên liệu trong công thức
-- Phở bò
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(1, 14, 14, 1), -- 1 cái bắp bò
(1, 15, 1, 800), -- 800g gân bò
(1, 16, 1, 300), -- 300g bò viên
(1, 17, 3, 1), -- 1kg bánh phở
(1, 18, 20, 1), -- 1 củ gừng
(1, 19, 24, 3), -- 3 củ hành tây
(1, 79, 28, 1), -- 1 gói gia vị nấu phở
(1, 20, NULL, NULL), -- Giá
(1, 21, NULL, NULL),-- Ngò gai
(1, 22, NULL, NULL),-- Húng quế
(1, 23, NULL, NULL), -- Hành ngò
(1, 80, NULL, NULL); -- Gia vị

-- Bánh mì
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(2, 24, 4, 100), -- 100ml nước ấm
(2, 25, 1, 600), -- 600g bột số 13
(2, 81, 1, 7), -- 7g men
(2, 26, 1, 5), -- 5g muối
(2, 6, 1, 20), -- 20g đường
(2, 27, 33, 1), -- 1 quả trứng
(2, 29, 1, 15), -- 15g nước chanh
(2, 30, 1, 10); -- 10g dầu ăn

-- Bún bò Huế
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 31, 3, 1.5), -- 1,5 kg xương bò
(3, 14, 3, 1.5), -- 1,5 kg bắp bò
(3, 32, 3, 1), -- 1 kg chân giò
(3, 33, 37, 5), -- 4-5 lít nước
(3, 34, 1, 700), -- 700g sả
(3, 35, NULL, NULL), -- Giò lụa
(3, 16, NULL, NULL), -- Viên bò
(3, 36, NULL, NULL), -- Tóp mỡ hành phi
(3, 82, NULL, NULL), -- Hành tây nướng
(3, 37, NULL, NULL), -- Gừng nướng
(3, 20, NULL, NULL), -- Giá
(3, 83, NULL, NULL), -- Rau
(3, 80, NULL, NULL); -- Gia vị

-- Gia vị nêm nước dùng
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 26, 1, 10), -- 10g muối
(3, 84, 1, 15), -- 15g hạt nêm
(3, 6, 1, 20), -- 20g đường
(3, 85, 1, 5); -- 5g bột canh

-- Hỗn hợp dầu của nước dùng
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 30, 38, 30), -- 30ml dầu ăn hoặc mỡ heo
(3, 43, 1, 10), -- 10g tỏi băm
(3, 34, 1, 15), -- 15g sả băm
(3, 42, 1, 10), -- 10g hành tím băm
(3, 86, 1, 5); -- 5g bột điều đỏ

-- Hỗn hợp mắm ruốc
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 39, 39, 1.5), -- 1.5 muỗng canh mắm ruốc
(3, 28, 40, 1.5); -- 1.5 thìa canh nước lạnh

-- Sa tế ớt
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 40, 1, 100), -- 100g ớt tươi
(3, 41, 1, 50), -- 50g ớt bột
(3, 42, 1, 100), -- 100g hành tím
(3, 43, 1, 100), -- 100g tỏi
(3, 34, 1, 100), -- 100g sả băm
(3, 44, 39, 1), -- 1 muỗng canh dầu điều
(3, 26, 41, 1), -- 1 thìa cà phê muối
(3, 6, 39, 1), -- 1 muỗng canh đường
(3, 30, 39, 3); -- 3 muỗng canh dầu ăn

-- Gia vị ướp bò bắp
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(3, 87, 39, 2), -- 2 muỗng canh nước mắm
(3, 26, 39, 0.5), -- 1/2 muỗng canh muối
(3, 88, 39, 0.5), -- 1/2 muỗng canh bột tỏi
(3, 41, 39, 0.5), -- 1/2 muỗng canh ớt bột
(3, 42, 39, 1.5), -- 1.5 muỗng canh hành tím băm
(3, 39, 39, 1.5); -- 1.5 muỗng canh mắm ruốc

-- Cơm tấm
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(4, 46, 3, 1), -- 1 kg thịt đùi
(4, 89, 43, 5), -- 5 trái trứng gà
(4, 47, 44, 2), -- 2 trái dừa
(4, 19, 39, 2), -- 2 muỗng canh hành băm
(4, 43, 39, 2), -- 2 muỗng canh tỏi băm
(4, 80, NULL, NULL); -- Gia vị

-- Gỏi cuốn
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(5, 90, 1, 300), -- 300g thịt ba chỉ
(5, 54, 1, 200), -- 200g tôm
(5, 38, 1, 200), -- 200g bún
(5, 91, NULL, NULL), -- Rau sống
(5, 92, NULL, NULL), -- Hành lá
(5, 93, 46, 1), -- 1 gói bánh tráng nhúng
(5, 34, 1, 50), -- 50g sả
(5, 43, 1, 20), -- 20g tỏi
(5, 40, 1, 10), -- 10g ớt
(5, 94, 1, 30), -- 30g thơm
(5, 6, 1, 20), -- 20g đường
(5, 95, 4, 50); -- 50ml mắm nêm

-- -- Chả trứng
-- INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
-- (4, 50, 1, 500), -- 500g thịt xay
-- (4, 51, 1, 20), -- 20g nấm mèo
-- (4, 52, 1, 2), -- 2 lọn bún tàu
-- (4, 53, 1, 3), -- 3 trái trứng gà
-- (4, 54, 1, 1), -- 1 mcf dầu màu điều
-- (4, 55, 1, 10), -- 10g hành lá
-- (4, 56, NULL, NULL); -- Gia vị

-- Chả giò
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(6, 5, 1, 350), -- 350g thịt xay
(6, 96, 47, 30), -- 30 miếng bánh tráng
(6, 49, 49, 1), -- 1 vắt bún tàu
(6, 48, 48, 3), -- 2-3 tai nấm mèo
(6, 50, 50, 0.5), -- 1/2 củ khoai lang
(6, 51, 51, 0.5), -- 1/2 củ cà rốt
(6, 89, 42, 1), -- 1 quả trứng gà
(6, 97, 39, 2), -- 2 muỗng canh hành phi
(6, 87, 41, 1), -- 1 muỗng cà phê nước mắm
(6, 6, 41, 0.5), -- 1/2 muỗng cà phê Đường
(6, 98, 41, 0.5), -- 1/2 muỗng cà phê bột nêm gà
(6, 52, 41, 1), -- 1 muỗng cà phê tiêu xay
(6, 53, 41, 3); -- 3 muỗng cà phê dầu olive

-- Lẩu Thái
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(7, 54, 3, 1), -- 1kg tôm
(7, 55, 3, 1), -- 1kg nghêu
(7, 56, 1, 500), -- 500g mực
(7, 1, 1, 500), -- 500g bò
(7, 62, NULL, NULL), -- Sốt tomyum
(7, 80, NULL, NULL), -- Gia vị
(7, 57, 1, 200), -- 200g nấm đông cô
(7, 58, 52, 1), -- 1 bịch nấm kim châm
(7, 59, 53, 1), -- 1 bịch nấm linh chi nâu
(7, 60, 54, 1), -- 1 bó cải dún
(7, 61, 55, 1); -- 1 bó cải thìa

-- Mì Quảng
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(8, 63, 56, 1), -- 1 con vịt không lấy đầu cổ cánh
(8, 64, 57, 1.1), -- 1.1 lít nước dừa khô
(8, 65, 3, 1), -- 1kg mì quảng
(8, 66, NULL, NULL), -- Đậu phộng
(8, 99, NULL, NULL), -- Nước mắm gừng
(8, 100, NULL, NULL), -- Xà lách
(8, 101, NULL, NULL), -- Húng lủi
(8, 30, 4, 30), -- 30ml dầu ăn
(8, 102, 1, 20), -- 20g đường phèn
(8, 26, 1, 10), -- 10g muối
(8, 84, 1, 15), -- 15g hạt nêm
(8, 87, 4, 25), -- 25ml nước mắm
(8, 44, 1, 5), -- 5g màu dầu điều
(8, 43, 1, 20), -- 20g tỏi băm
(8, 42, 1, 15), -- 15g hành băm
(8, 18, 1, 10), -- 10g gừng băm
(8, 103, 1, 10); -- 10g ớt sa tế

-- Xôi gà
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(9, 67, 1, 300), -- 300g thịt ức gà
(9, 68, 1, 150), -- 150g lạp xưởng
(9, 89, 42, 3), -- 3 quả trứng gà
(9, 74, 58, 10), -- 10 quả trứng cút
(9, 42, 1, 50), -- 50g hành tím
(9, 92, 1, 30), -- 30g hành lá
(9, 43, 1, 20), -- 20g tỏi băm
(9, 35, 1, 100), -- 100g giò lụa thái sợi
(9, 104, 39, 2), -- 2 muỗng canh nước tương
(9, 87, 39, 1.5), -- 1.5 muỗng canh nước mắm
(9, 6, 39, 1), -- 1 muỗng canh đường
(9, 105, 39, 1), -- 1 muỗng canh bột năng
(9, 106, 39, 1), -- 1 muỗng canh tương ớt
(9, 30, 39, 2), -- 2 muỗng canh dầu ăn
(9, 107, 4, 200); -- 200ml nước thơm ép

-- Bánh xèo
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(10, 69, 4, 150), -- 150ml nước cốt dừa
(10, 70, 1, 200), -- 200g bột bánh xèo Vĩnh Thuận
(10, 71, 4, 330), -- 1 lon soda (330ml)
(10, 1, 1, 100), -- 100g thịt bò
(10, 11, 1, 100), -- 100g thịt gà
(10, 5, 1, 100), -- 100g thịt heo
(10, 108, 1, 50), -- 50g nấm hương
(10, 20, 1, 100), -- 100g giá đỗ
(10, 51, 1, 50), -- 50g carrot
(10, 109, 1, 50), -- 50g củ cải trắng
(10, 92, 1, 30), -- 30g hành lá
(10, 19, 1, 100), -- 100g hành tây
(10, 87, 4, 50), -- 50ml nước mắm
(10, 110, NULL, NULL), -- Rau cải xanh
(10, 100, NULL, NULL); -- Salad

-- Hủ tiếu
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(11, 72, 1, 400), -- 400g hủ tiếu mềm
(11, 73, 59, 0.5), -- 1/2 chén nõn tôm
(11, 74, 58, 10), -- 10 cái trứng cút
(11, 104, 39, 2), -- 2 tbsp nước tương
(11, 6, 39, 2), -- 2 tbsp đường
(11, 75, 39, 1), -- 1 tbsp dầu hào
(11, 106, 39, 0.5), -- 1/2 tbsp tương ớt
(11, 111, 39, 0.5), -- 1/2 tbsp dầu mè
(11, 52, 41, 0.5), -- 1/2 tsp tiêu
(11, 84, 41, 0.5), -- 1/2 tsp hạt nêm
(11, 112, 41, 0.25); -- 1/4 tsp bột ngọt

-- Bò khô
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit_id, amount) VALUES
(12, 1, 3, 1), -- 1 kg thịt bò
(12, 19, 10, 1), -- 1 củ hành tây
(12, 18, 1, 50), -- 50 gram gừng cắt lát
(12, 34, 60, 5), -- 5 cây sả
(12, 76, 4, 20), -- 20 ml rượu trắng
(12, 6, 1, 130), -- 130 gram đường
(12, 112, 1, 5), -- 5 gram bột ngọt
(12, 26, 1, 8), -- 8 gram muối
(12, 87, 2, 20), -- 20 gram nước mắm
(12, 77, 1, 3), -- 3 gram bột nghệ
(12, 78, 1, 2), -- 2 gram bột ngũ vị hương
(12, 30, 4, 100), -- 100 ml dầu ăn
(12, 43, 1, 50), -- 50 gram tỏi băm
(12, 34, 1, 50), -- 50 gram sả băm
(12, 18, 1, 30), -- 30 gram gừng băm
(12, 113, 1, 30); -- 30 gram ớt hiểm

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