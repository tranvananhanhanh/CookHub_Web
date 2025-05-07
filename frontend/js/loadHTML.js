// --- START OF FILE loadHTML.js ---

document.addEventListener("DOMContentLoaded", function () {
    // Load Header
    fetch("../components/header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".header").innerHTML = data;
            initHeaderScript(); // Gọi hàm xử lý menubar
            // --- BEGIN MODIFICATION ---
            loadUserAvatarForHeader(); // Gọi hàm tải avatar cho header
            // --- END MODIFICATION ---
        });

    // Load Footer
    fetch("../components/footer.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".footer").innerHTML = data;
        });
});

function initHeaderScript() {
    const menuIcon = document.querySelector('.menu-bar-icon');
    const nav = document.querySelector('nav');
    let isNavVisible = false;

    // Sửa lại: Kiểm tra sau một khoảng trễ ngắn để đảm bảo DOM đã sẵn sàng hoàn toàn
    setTimeout(() => {
        const menuIcon = document.querySelector('header .menu-bar-icon'); // Selector cụ thể hơn
        const nav = document.querySelector('header nav'); // Selector cụ thể hơn

        if (!menuIcon || !nav) {
            console.warn("Header elements for menu bar not found after delay!");
            return;
        }

        // Xử lý menu bar
        menuIcon.addEventListener('click', () => {
            isNavVisible = !isNavVisible;
            nav.style.display = isNavVisible ? 'block' : 'none';
        });

        // Xử lý active link
        const navLinks = document.querySelectorAll('header nav ul li a'); // Selector cụ thể hơn
        const currentUrl = window.location.pathname;

        navLinks.forEach(link => {
            // So sánh href của link với URL hiện tại
            if (link.getAttribute('href') === currentUrl || (link.getAttribute('href') === '/homepage' && currentUrl === '/')) { // Xử lý trường hợp homepage là /
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }, 100); // Chờ 100ms
}

// --- BEGIN MODIFICATION ---
async function loadUserAvatarForHeader() {
    const headerUserAvatarImg = document.querySelector('header .user-logo img');
    if (!headerUserAvatarImg) {
        console.warn("Header user avatar image element not found.");
        return;
    }

    // Hàm lấy userId từ URL
    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdStr = urlParams.get('userId'); 
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }

    const currentUserId = getUserIdFromUrl();

    if (currentUserId) {
        console.log(`[HeaderAvatar] Found userId from URL: ${currentUserId}`);
        try {
            // Gọi API lấy thông tin user
            // Giả sử API của bạn là /api/users và chấp nhận user_id làm query param
            // Nếu endpoint là /api/users/:id thì fetch(`http://localhost:4000/api/users/${currentUserId}`)
            const response = await fetch(`http://localhost:4000/api/users?user_id=${currentUserId}`);
            if (!response.ok) {
                console.error(`[HeaderAvatar] Failed to fetch user info for userId ${currentUserId}. Status: ${response.status}`);
                // Giữ avatar mặc định nếu không fetch được
                headerUserAvatarImg.src = "../assets/image/avatar_default.png";
                return;
            }
            const userDataArray = await response.json();

            if (userDataArray && userDataArray.length > 0) {
                const user = userDataArray[0]; // API của bạn trả về mảng user
                if (user && user.avatar && user.avatar.trim() !== '') {
                    headerUserAvatarImg.src = `../assets/image/users/avatars/${user.avatar}`;
                    console.log(`[HeaderAvatar] Avatar updated to: ${user.avatar}`);
                } else {
                    console.log("[HeaderAvatar] User has no avatar or avatar is empty, using default.");
                    headerUserAvatarImg.src = "../assets/image/avatar_default.png";
                }
            } else {
                console.log(`[HeaderAvatar] No user data found for userId: ${currentUserId}, using default avatar.`);
                headerUserAvatarImg.src = "../assets/image/avatar_default.png";
            }
        } catch (error) {
            console.error("[HeaderAvatar] Error loading user info for header avatar:", error);
            headerUserAvatarImg.src = "../assets/image/avatar_default.png"; // Fallback về default khi có lỗi
        }
    } else {
        console.log("[HeaderAvatar] No userId found in URL, using default avatar.");
        // Nếu không có userId trên URL, vẫn giữ avatar mặc định (hoặc xử lý theo cách khác nếu muốn)
        headerUserAvatarImg.src = "../assets/image/avatar_default.png";
    }
}
// --- END MODIFICATION ---
// --- END OF FILE loadHTML.js ---