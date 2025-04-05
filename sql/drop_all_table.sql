-- Vô hiệu hóa ràng buộc khóa ngoại để tránh lỗi khi xóa bảng
SET session_replication_role = 'replica';

-- Xóa tất cả các bảng
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Duyệt qua tất cả các bảng trong schema public và xóa từng bảng
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- Kích hoạt lại ràng buộc khóa ngoại
SET session_replication_role = 'origin';