document.addEventListener("DOMContentLoaded", async () => {
    const editProfile = document.querySelector('.js-edit-profile');
    const editProfileModal = document.querySelector('.modal-edit-profile');
    const closeBtns = document.querySelectorAll('.edit-profile-form .js-modal-close');

    const form = document.querySelector('.edit-profile-form');

    const editAvatarImg = form.querySelector(".edit-avatar img");
    const avatarInput = form.querySelector("#avatarInput");

    const editCoverImg = form.querySelector(".edit-background img");
    const coverInput = form.querySelector("#backgroundInput");

    const edit_name = form.querySelector(".edit-name input"); 
    const edit_id = form.querySelector(".edit-userid input"); 
    const edit_mail = form.querySelector(".edit-mail input");

    // 1. Modal open/close
    editProfile.addEventListener('click', () => editProfileModal.classList.add('open'));
    closeBtns.forEach(btn => btn.addEventListener('click', () => editProfileModal.classList.remove('open')));

    // 2. Xử lý chọn ảnh avatar tạm thời
    form.querySelector(".edit-avatar .edit").addEventListener("click", (e) => {
        e.preventDefault();
        avatarInput.click();
    });

    avatarInput.addEventListener("change", () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => editAvatarImg.src = reader.result;
            reader.readAsDataURL(file);
        }
    });

    // 3. Xử lý chọn ảnh background tạm thời
    form.querySelector(".edit-background .edit").addEventListener("click", (e) => {
        e.preventDefault();
        coverInput.click();
    });

    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => editCoverImg.src = reader.result;
            reader.readAsDataURL(file);
        }
    });

    // Hàm lấy userId từ URL
    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdStr = urlParams.get('userId'); // Giả sử param là 'userId'
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }

    let targetUserId = getUserIdFromUrl();

    if (!targetUserId) {
        console.warn("[UserProfile] No target userId found in URL or localStorage. Defaulting or error handling needed.");
        if (statsParagraph) statsParagraph.innerHTML = "User not specified.";
        if (avatar) avatar.src = "../assets/image/avatar_default.png"; // Đặt avatar mặc định
    }

    console.log("[UserProfile] Target User ID to load:", targetUserId);

    // 4. Lấy thông tin user ban đầu
    async function loadUserInfo() {
        try {
            let apiUrl = "http://localhost:4000/api/users";
            if (targetUserId) {
                apiUrl += `?user_id=${targetUserId}`;
            } else {
                console.log("[UserProfile] Fetching default user (user_id=1) as no targetUserId specified in URL.");
                // apiUrl += `?user_id=1`; // Mặc định user_id=1 nếu không có trên URL
            }
            console.log("[UserProfile] Fetching user profile from:", apiUrl);
            const res = await fetch(apiUrl);
            // const res = await fetch("http://localhost:4000/api/users");
            const data = await res.json();
            const user = data[0];
            if (!user) return;

            // Lưu dữ liệu user vào localStorage để dùng ở nơi khác
            localStorage.setItem("currentUser", JSON.stringify(user));
            if (user.avatar) {
                editAvatarImg.src = `../assets/image/users/avatars/${user.avatar}`;
            } else {
                editAvatarImg.src = `../assets/image/avatar_default.png`;
            }

            if (user.profile_background) {
                editCoverImg.src = `../assets/image/users/profile_backgrounds/${user.profile_background}`;
            } else {
                editCoverImg.src = `../assets/image/profile_background_default.jpg`;
            }
            edit_name.value = user.name;
            edit_id.value = `@cook_${user.random_code}`;
            edit_mail.value = user.email;
        } catch (err) {
            console.error("Lỗi tải dữ liệu người dùng", err);
        }
    }

    loadUserInfo();

    // 5. Gửi dữ liệu khi Save
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        
        formData.append("userId", currentUser.user_id);
        formData.append("randomCode", currentUser.random_code);
        formData.append("name", edit_name.value.trim());

        // Nếu có file mới được chọn
        if (avatarInput.files[0]) {
            formData.append("avatar", avatarInput.files[0]);
        }
        if (coverInput.files[0]) {
            formData.append("background", coverInput.files[0]);
        }

        // Thu thập social links
        const socialLinks = [
            { platform: 'facebook', url: document.getElementById('user-social-link facebook').value },
            { platform: 'x', url: document.getElementById('user-social-link x-twitter').value },
            { platform: 'instagram', url: document.getElementById('user-social-link instagram').value }
        ].filter(link => link.url.trim() !== '');

        formData.append('socialLinks', JSON.stringify(socialLinks));

        try {
            const res = await fetch("http://localhost:4000/api/users/update", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                editProfileModal.classList.remove("open");
                loadUserInfo(); // Tải lại ảnh và thông tin mới từ server
                window.location.reload(); // Làm mới trang để cập nhật giao diện
            } else {
                alert(result.error || "Lỗi cập nhật profile");
            }
        } catch (err) {
            console.error("Lỗi khi gửi dữ liệu:", err);
            alert("Lỗi server");
        }
    });
});