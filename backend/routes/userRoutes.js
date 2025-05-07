const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const fs = require("fs").promises;

// Lấy thông tin user (trả về JSON)
router.get("/", async (req, res) => {
  try {
    const userId = 1; //req.query.user_id;
    const userInfo = await UserModel.getUserByIdWithSocialLinks(userId);
    if (userInfo.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.json(userInfo);
  } catch (err) {
    console.error("Lỗi lấy dữ liệu người dùng:", err);
    res.status(500).json({ error: "Lỗi server", details: err.message });
  }
});

// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === "avatar" ? "avatars" : "profile_backgrounds";
    cb(null, `./frontend/assets/image/users/${folder}`);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomCode = req.body.randomCode;
    const prefix = file.fieldname === "avatar" ? "avatar" : "background";
    const filename = `${prefix}_${randomCode}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post('/update', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 }
]),
  async (req, res) => {
    try {
      const { userId, name, randomCode, socialLinks } = req.body;
      const newAvatarFile = req.files.avatar?.[0];
      const newBackgroundFile = req.files.background?.[0];

      // Hàm xóa file cũ dựa trên randomCode và prefix (avatar/background)
      const deleteOldFilesByRandomCode = async (folderPath, prefix, code, newUploadedFilename) => {
        console.log(`Attempting to delete old files. Folder: ${folderPath}, Prefix: ${prefix}, Code: ${code}, NewFile: ${newUploadedFilename || 'N/A'}`);
        const commonExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']; // Có thể thêm .webp
        for (const ext of commonExtensions) {
          const potentialOldFilename = `${prefix}_${code}${ext}`;
          
          // Nếu có file mới được upload và tên file cũ tiềm năng này TRÙNG KHỚP với tên file mới
          // thì KHÔNG XÓA nó.
          if (newUploadedFilename && potentialOldFilename.toLowerCase() === newUploadedFilename.toLowerCase()) {
            console.log(`  Skipping deletion for: ${potentialOldFilename} because it matches the newly uploaded file.`);
            continue;
          }

          const oldFilePath = path.join(__dirname, `../../frontend/assets/image/users/`, folderPath, potentialOldFilename);
          console.log(`  Checking to delete: ${oldFilePath}`);
          try {
            await fs.unlink(oldFilePath);
            console.log(`  SUCCESS: Deleted old file: ${oldFilePath}`);
          } catch (err) {
            if (err.code === 'ENOENT') {
              // File không tồn tại, không sao cả
            } else {
              console.error(`  ERROR: Failed to delete ${oldFilePath} - Code: ${err.code}, Msg: ${err.message}`);
            }
          }
        }
      };

      const avatar = newAvatarFile ? newAvatarFile.filename : undefined;
      const background = newBackgroundFile ? newBackgroundFile.filename : undefined;

      // Nếu có avatar mới được upload, xóa các avatar cũ khác (không phải file mới này)
      if (newAvatarFile && randomCode) { // randomCode phải tồn tại và hợp lệ
        console.log(`[DEBUG] randomCode for avatar deletion: '${randomCode}', New Avatar Filename: '${avatar}'`);
        if (typeof randomCode !== 'string' || randomCode.trim() === '') {
            console.error('[ERROR] randomCode is empty or not a string. Skipping deletion for avatar.');
        } else {
            await deleteOldFilesByRandomCode('avatars', 'avatar', randomCode, avatar);
        }
      }

      // Nếu có background mới được upload, xóa các background cũ khác
      if (newBackgroundFile && randomCode) {
        console.log(`[DEBUG] randomCode for background deletion: '${randomCode}', New Background Filename: '${background}'`);
        if (typeof randomCode !== 'string' || randomCode.trim() === '') {
            console.error('[ERROR] randomCode is empty or not a string. Skipping deletion for background.');
        } else {
            await deleteOldFilesByRandomCode('profile_backgrounds', 'background', randomCode, background);
        }
      }

      const user = await db.query("SELECT * FROM users WHERE user_id = $1 AND random_code = $2",
        [userId, randomCode]);

      if (user.rowCount === 0) {
        return res.status(403).json({ message: "Không xác thực được người dùng." });
      }

      await db.query(`
        UPDATE users
        SET name = $1,
          avatar = COALESCE($2, avatar),
          profile_background = COALESCE($3, profile_background)
        WHERE user_id = $4 AND random_code = $5 
      `, [name, avatar, background, userId, randomCode]);

      await db.query("DELETE FROM user_social_links WHERE user_id = $1", [userId]);

      if (socialLinks) {
        const links = JSON.parse(socialLinks);
        for (const link of links) {
          await db.query(`
            INSERT INTO user_social_links (user_id, platform, url)
            VALUES ($1, $2, $3)
          `, [userId, link.platform, link.url]);
        }
      }

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

router.post('/update-password', async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    console.log("🔒 Update Password Request:", req.body);

    if (!user_id || !new_password) {
      return res.status(400).json({ error: 'Missing user ID or password' });
    }

    await db.query(
      `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
      [new_password, user_id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Error updating password:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;