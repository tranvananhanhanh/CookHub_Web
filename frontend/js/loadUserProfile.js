document.addEventListener("DOMContentLoaded", async () => {
    const avatar = document.querySelector(".profile-cover .cover-content .profile-avatar");
    const cover = document.querySelector(".profile-cover");
    const name = document.querySelector(".profile-cover .cover-content .username");
    const userid = document.querySelector(".profile-cover .cover-content .userid");
    const profilelink = document.querySelector(".profile-cover .cover-content .profile-link");
    const socialIcons = document.querySelectorAll(".profile-cover .social-icons a");
    const socialLinkInputs = document.querySelectorAll(".edit-links .links-container input");
    const socialLinkAnchors = document.querySelectorAll(".edit-links .user-links a");

    // Hàm chuẩn hóa chuỗi (bỏ dấu, bỏ ký tự đặc biệt, thay dấu cách bằng "_")
    // function normalizeString(str) {
    //     return str.normalize("NFD")  // Tách dấu khỏi ký tự gốc
    //               .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    //               .replace(/[^a-zA-Z0-9\s]/g, "") // Giữ lại chữ và số, xóa ký tự đặc biệt
    //               .trim() // Xóa khoảng trắng ở đầu và cuối
    //               .replace(/\s+/g, "_") // Thay dấu cách bằng "_"
    //               .toLowerCase(); // Chuyển về chữ thường
    // }

    try {
        // Gọi API lấy user info và social links
        const response = await fetch("http://localhost:4000/api/users?user_id=1");
        if (!response.ok) {
            throw new Error(`Lỗi ${response.status}: Không thể tải thông tin người dùng`);
        }

        const userinfo = await response.json();

        if (userinfo.length > 0) {
            const user = userinfo[0];
            // const cleanName = normalizeString(user.name);

            if (user.avatar.length > 0) {
                avatar.src = `../assets/image/users/avatars/${user.avatar}`;
            }

            if (user.profile_background.length > 0) {
                cover.style.backgroundImage = `url('../assets/image/users/profile_backgrounds/${user.profile_background}')`;
            }

            name.innerHTML = user.name;
            userid.innerHTML = `@cook_${user.random_code}`;
            profilelink.innerHTML = `www.cookhub.com/cook_${user.random_code}`;

            // Cập nhật social links cho .social-icons
            if (socialIcons.length > 0) {
                const socialLinks = user.social_links || [];
                console.log("Social links từ API:", socialLinks); // Debug
                socialIcons.forEach(icon => {
                    const platform = icon.querySelector('img').alt.toLowerCase();
                    console.log(`Cập nhật link cho platform (social-icons): ${platform}`); // Debug
                    const link = socialLinks.find(sl => sl.platform === platform);
                    if (link && link.url) {
                        icon.href = link.url;
                        icon.target = '_blank';
                        console.log(`Đã cập nhật href cho ${platform}: ${link.url}`);
                    } else {
                        icon.href = '#';
                        console.warn(`Không tìm thấy URL cho platform (social-icons): ${platform}`);
                    }
                });
            } else {
                console.warn("Không tìm thấy .social-icons a trong DOM");
            }

            // Cập nhật social links cho .edit-links (inputs và anchors)
            if (socialLinkInputs.length > 0) {
                const socialLinks = user.social_links || [];
                console.log("Cập nhật social links cho .edit-links"); // Debug
                socialLinkInputs.forEach(input => {
                    const platform = input.id.replace('user-social-link ', '').toLowerCase();
                    const link = socialLinks.find(sl => sl.platform === platform);
                    if (link && link.url) {
                        input.value = link.url;
                        console.log(`Đã cập nhật input value cho ${platform}: ${link.url}`);
                    } else {
                        input.value = '';
                        console.warn(`Không tìm thấy URL cho platform (input): ${platform}`);
                    }
                });
            } else {
                console.warn("Không tìm thấy input trong .edit-links");
            }

            if (socialLinkAnchors.length > 0) {
                const socialLinks = user.social_links || [];
                socialLinkAnchors.forEach(anchor => {
                    const platform = anchor.querySelector('i').className.includes('fa-facebook') ? 'facebook' :
                        anchor.querySelector('i').className.includes('fa-x-twitter') ? 'x' :
                            anchor.querySelector('i').className.includes('fa-instagram') ? 'instagram' : '';
                    const link = socialLinks.find(sl => sl.platform === platform);
                    if (link && link.url) {
                        anchor.href = link.url;
                        console.log(`Đã cập nhật href cho ${platform} (anchor): ${link.url}`);
                    } else {
                        anchor.href = '#';
                        console.warn(`Không tìm thấy URL cho platform (anchor): ${platform}`);
                    }
                });
            } else {
                console.warn("Không tìm thấy a trong .user-links");
            }
        } else {
            console.warn("Không tìm thấy thông tin người dùng");
        }
    } catch (error) {
        // recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
    }
});