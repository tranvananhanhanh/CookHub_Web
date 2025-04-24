document.addEventListener("DOMContentLoaded", function () {
    // --- Load Header ---
    fetch("../components/header.html") // Đảm bảo đường dẫn này chính xác
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for header: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const headerElement = document.querySelector(".header"); // Lưu lại element header
            if (headerElement) {
                headerElement.innerHTML = data; // Chèn HTML header

                // *** GỌI CÁC HÀM CẬP NHẬT UI NGAY SAU KHI CHÈN HEADER ***
                updateHeaderUIBasedOnLogin();
                setActiveNavLink();
            } else {
                console.error("Không tìm thấy element '.header' để chèn header.");
            }
        })
        .catch(error => console.error('Lỗi tải hoặc xử lý header:', error));

    // --- Load Footer ---
    fetch("../components/footer.html") // Đảm bảo đường dẫn này chính xác
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for footer: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const footerElement = document.querySelector(".footer");
            if (footerElement) {
                footerElement.innerHTML = data;
            } else {
                console.error("Không tìm thấy element '.footer' để chèn footer.");
            }
        })
        .catch(error => console.error('Lỗi tải hoặc xử lý footer:', error));
});

// --- CÁC HÀM HỖ TRỢ CHO VIỆC CẬP NHẬT HEADER ---

function updateHeaderUIBasedOnLogin() {
    // Lấy tham chiếu đến các element trong header (sau khi nó đã được load)
    // Quan trọng: Đảm bảo các ID này khớp với ID bạn đã đặt trong header.html đã sửa đổi
    const loginArea = document.getElementById('login-button-area');
    const userArea = document.getElementById('user-profile-area');
    const userAvatarImg = document.getElementById('user-avatar-img');
    const userNameP = document.getElementById('user-profile-name');
    const userProfileLink = document.getElementById('user-profile-link');

    // Kiểm tra các biến global (phải được định nghĩa trong file EJS gốc trước khi loadHTML.js chạy)
    // Đảm bảo đã thêm script định nghĩa window.isUserLoggedIn và window.currentUser vào homepage.ejs
    if (typeof window.isUserLoggedIn !== 'undefined' && window.isUserLoggedIn && window.currentUser) {
        // --- Trạng thái Đã đăng nhập ---
        if (loginArea) loginArea.style.display = 'none';   // Ẩn nút Login
        if (userArea) userArea.style.display = 'flex';     // Hiện khu vực user
        console.log('Is login!');
        // Cập nhật thông tin user
        if (userNameP) userNameP.textContent = window.currentUser.name || 'User';
        if (userProfileLink) userProfileLink.href = `/profile/${window.currentUser.id}`; // Sử dụng ID từ currentUser

        // Cập nhật avatar (Cần `avatarUrl` trong `window.currentUser`)
        if (userAvatarImg) {
            userAvatarImg.src = window.currentUser.avatarUrl || '../assets/image/avatar_default.png'; // Thêm fallback
        }

    } else {
        // --- Trạng thái Chưa đăng nhập ---
        if (loginArea) loginArea.style.display = 'block'; // Hiện nút Login
        if (userArea) userArea.style.display = 'none';    // Ẩn khu vực user
    }
}

function setActiveNavLink() {
    try {
        const currentPath = window.location.pathname;
        // Selector này cần khớp với cấu trúc nav trong header.html đã load
        const navLinks = document.querySelectorAll('.header nav ul li a');

        if (!navLinks || navLinks.length === 0) {
            console.warn("Không tìm thấy link điều hướng trong header.");
            return;
        }

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            // Reset trước khi kiểm tra
            link.classList.remove('active-link');

            // Logic so sánh chính xác pathname
            if (linkPath && currentPath === linkPath) {
                link.classList.add('active-link');
            }
            // Có thể thêm logic phức tạp hơn nếu cần (ví dụ: trang chủ '/')
            // else if (currentPath === '/' && linkPath === '/') {
            //     link.classList.add('active-link');
            // }
        });
    } catch (error) {
        console.error("Lỗi khi thiết lập active nav link:", error);
    }
}

// --- NHẮC NHỞ QUAN TRỌNG ---
// Đảm bảo rằng trong file EJS gốc (ví dụ: homepage.ejs), bạn đã thêm đoạn script
// để định nghĩa window.isUserLoggedIn và window.currentUser TRƯỚC KHI
// bạn gọi <script src="/js/loadHTML.js"></script>
// Ví dụ:
/*
    <!-- Trong homepage.ejs -->
    <script>
        window.isUserLoggedIn = <%- JSON.stringify(isLoggedIn) %>;
        window.currentUser = <%- JSON.stringify(currentUser ? { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl } : null) %>;
        // Nhớ đảm bảo currentUser từ server có thuộc tính avatarUrl nếu bạn muốn hiển thị avatar động
    </script>
    <script src="/js/loadHTML.js"></script> // Script load phải chạy SAU khi biến window được gán
*/