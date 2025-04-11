const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Lấy thông tin user (trả về JSON)
router.get("/", async (req, res) => {
  try {
    const userInfo = await UserModel.getUserInfo();
    res.json(userInfo); 
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
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
      const { userId, name, randomCode } = req.body;
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

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

module.exports = router;