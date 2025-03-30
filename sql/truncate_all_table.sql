-- Tắt kiểm tra khóa ngoại tạm thời
SET session_replication_role = 'replica';

-- Xóa dữ liệu trong tất cả các bảng và reset IDENTITY
TRUNCATE TABLE 
    reports, 
    saved_recipes, 
    comments, 
    ratings, 
    recipe_categories, 
    categories, 
    recipe_ingredients, 
    units, 
    ingredients, 
    recipe_images, 
    recipes, 
    users
RESTART IDENTITY CASCADE;

-- Đặt lại giá trị sequence (nếu cần)
DO $$ 
DECLARE 
    seq RECORD;
BEGIN
    -- Duyệt qua tất cả các sequence trong database
    FOR seq IN 
        SELECT c.oid::regclass AS seqname FROM pg_class c WHERE c.relkind = 'S'
    LOOP
        -- Đặt lại giá trị của sequence về 1
        EXECUTE format('ALTER SEQUENCE %s RESTART WITH 1', seq.seqname);
    END LOOP;
END $$;

-- Bật lại kiểm tra khóa ngoại
SET session_replication_role = 'origin';