const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

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
      const avatar = req.files.avatar?.[0]?.filename;
      const background = req.files.profile_background?.[0]?.filename;

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
        WHERE user_id = $4
      `, [name, avatar, background, userId]);

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