document.addEventListener("DOMContentLoaded", async () => {
    const avatar = document.querySelector(".profile-cover .cover-content .profile-avatar"); 
    const cover = document.querySelector(".profile-cover");
    const name = document.querySelector(".profile-cover .cover-content .username"); 
    const userid = document.querySelector(".profile-cover .cover-content .userid");
    const profilelink = document.querySelector(".profile-cover .cover-content .profile-link");

    // Hàm chuẩn hóa chuỗi (bỏ dấu, bỏ ký tự đặc biệt, thay dấu cách bằng "_")
    function normalizeString(str) {
        return str.normalize("NFD")  // Tách dấu khỏi ký tự gốc
                  .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
                  .replace(/[^a-zA-Z0-9\s]/g, "") // Giữ lại chữ và số, xóa ký tự đặc biệt
                  .trim() // Xóa khoảng trắng ở đầu và cuối
                  .replace(/\s+/g, "_") // Thay dấu cách bằng "_"
                  .toLowerCase(); // Chuyển về chữ thường
    }

    try {
        // Gọi API lấy user info
        const response = await fetch("http://localhost:4000/api/userinfo");
        const userinfo = await response.json();
        
        if (userinfo.length > 0) {
            const user = userinfo[0]; 
            const cleanName = normalizeString(user.name);

            if (user.avatar.length > 0) {
                avatar.src = `../assets/image/users/avatars/${user.avatar}`;
            }

            if (user.profile_background.length > 0) {
                cover.style.backgroundImage = `url('../assets/image/users/profile_backgrounds/${user.profile_background}')`;
            }
            
            name.innerHTML = user.name;
            userid.innerHTML = `@cook_${user.random_code}`;
            profilelink.innerHTML = `www.cookhub.com/cook_${user.random_code}/${cleanName}`;
        }
    } catch (error) {
        recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
    }
});