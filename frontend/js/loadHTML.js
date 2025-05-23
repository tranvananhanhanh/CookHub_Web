document.addEventListener("DOMContentLoaded", function () {
    // Load Header
    fetch("../components/header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".header").innerHTML = data;
            initHeaderScript(); // Gọi hàm xử lý menubar
            updateHeaderLinksWithUserIdFromUrl();
            loadUserAvatarForHeader(); // Gọi hàm tải avatar cho header
        });

    // Load Footer
    fetch("../components/footer.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".footer").innerHTML = data;
            updateFooterLinksWithUserIdFromUrl(); // Cập nhật liên kết trong footer
        });
});

function initHeaderScript() {
    const menuIcon = document.querySelector('.menu-bar-icon');
    const nav = document.querySelector('nav');
    let isNavVisible = false;

    // Kiểm tra sau một khoảng trễ ngắn để đảm bảo DOM đã sẵn sàng hoàn toàn
    setTimeout(() => {
        const menuIcon = document.querySelector('header .menu-bar-icon');
        const nav = document.querySelector('header nav');

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
        const navLinks = document.querySelectorAll('header nav ul li a');
        const currentUrl = window.location.pathname;

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentUrl || (link.getAttribute('href') === '/homepage' && currentUrl === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Xử lý avatar dropdown
        const avatar = document.getElementById('avatar');
        const dropdown = document.getElementById('avatar-dropdown');
        if (avatar && dropdown) {
            avatar.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('open');
            });

            const profileItem = dropdown.querySelector('.dropdown-item:nth-child(1)');
            const logoutItem = dropdown.querySelector('.dropdown-item:nth-child(2)');

            if (profileItem) {
                profileItem.addEventListener('click', () => {
                    const userId = getCurrentUserIdFromUrl();
                    const profileUrl = userId ? `/profile?userId=${userId}` : '/profile';
                    window.location.href = profileUrl;
                    dropdown.classList.remove('open');
                });
            }

            if (logoutItem) {
                logoutItem.addEventListener('click', () => {
                    window.location.href = '/homepage';
                    dropdown.classList.remove('open');
                });
            }

            document.addEventListener('click', (e) => {
                if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });
        }
    }, 100); // Chờ 100ms
}

async function loadUserAvatarForHeader() {
    const headerUserAvatarImg = document.querySelector('header .user-logo img');
    if (!headerUserAvatarImg) {
        console.warn("Header user avatar image element not found.");
        return;
    }

    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdStr = urlParams.get('userId');
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }

    const currentUserId = getUserIdFromUrl();

    if (currentUserId) {
        console.log(`[HeaderAvatar] Found userId from URL: ${currentUserId}`);
        try {
            const response = await fetch(`http://localhost:4000/api/users?user_id=${currentUserId}`);
            if (!response.ok) {
                console.error(`[HeaderAvatar] Failed to fetch user info for userId ${currentUserId}. Status: ${response.status}`);
                headerUserAvatarImg.src = "../assets/image/avatar_default.png";
                return;
            }
            const userDataArray = await response.json();

            if (userDataArray && userDataArray.length > 0) {
                const user = userDataArray[0];
                if (user && user.avatar && user.avatar.trim() !== '') {
                    headerUserAvatarImg.src = `../assets/image/users/avatars/${user.avatar}`;
                    console.log(`[HeaderAvatar] Avatar updated to: ${user.avatar}`);
                    document.getElementsByClassName('login-post-button')[0].style.display = 'none';
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
            headerUserAvatarImg.src = "../assets/image/avatar_default.png";
        }
    } else {
        console.log("[HeaderAvatar] No userId found in URL, using default avatar.");
        headerUserAvatarImg.src = "../assets/image/avatar_default.png";
    }
}

function updateHeaderLinksWithUserIdFromUrl() {
    const currentUserId = getCurrentUserIdFromUrl();
    console.log("Updating all header links. Current User ID from URL:", currentUserId);

    const specificLinksToUpdate = [
        'logo-link-header',        // Link logo (trang chủ)
        'nav-home-link',           // Link Home trong nav
        'nav-cooks-chart-link',    // Link Cooks Chart
        'nav-bmi-link',            // Link BMI
        'nav-saved-recipes-link',  // Link Saved Recipes
        'search-link-header',      // Link Search Icon
        'profile-link-header',     // Link User Profile
        'create-post-button',      // Link Create Post (nav-btn)
        'nav-create-post-button'   // Link Create Post (nav)
    ];

    specificLinksToUpdate.forEach(linkId => {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            updateSingleLinkWithUserId(linkElement, currentUserId);
        } else {
            console.warn(`Link with ID #${linkId} not found in loaded header.`);
        }
    });

    // 2. Cập nhật link Create trong create-post-button và nav-create-post-button
    const createPostLink = document.querySelector('#create-post-button a');
    const navCreatePostLink = document.querySelector('#nav-create-post-button a');

    if (createPostLink) {
        updateSingleLinkWithUserId(createPostLink, currentUserId);
    } else {
        console.warn("Create post link in #create-post-button not found.");
    }

    if (navCreatePostLink) {
        updateSingleLinkWithUserId(navCreatePostLink, currentUserId);
    } else {
        console.warn("Create post link in #nav-create-post-button not found.");
    }

    // 2. Xử lý hiển thị/ẩn các nút Create
    const createPostButton = document.getElementById('create-post-button');
    const navCreatePostButton = document.getElementById('nav-create-post-button');

    if (currentUserId !== null) {
        if (createPostButton) createPostButton.style.display = 'block'; // Hiện nút Create trong nav-btn
        if (navCreatePostButton && window.innerWidth <= 600) {
            navCreatePostButton.style.display = 'block';
        }
    } else {
        if (createPostButton) createPostButton.style.display = 'none'; // Ẩn nút Create trong nav-btn
        if (navCreatePostButton) navCreatePostButton.style.display = 'none'; // Ẩn nút Create trong nav
    }

    // Xử lý hiển thị/ẩn user-logo (giữ nguyên logic này)
    const userLogoDiv = document.querySelector('.header .user-logo');
    if (currentUserId !== null) {
        if (userLogoDiv) userLogoDiv.style.display = 'flex';
    } else {
        if (userLogoDiv) userLogoDiv.style.display = 'none';
    }
}

function updateFooterLinksWithUserIdFromUrl() {
    const currentUserId = getCurrentUserIdFromUrl();
    console.log("Updating all footer links. Current User ID from URL:", currentUserId);

    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        const baseHref = link.getAttribute('href');
        if (!baseHref.includes('userId=') && !baseHref.startsWith('#')) {
            link.setAttribute('href', `${baseHref}${baseHref.includes('?') ? '&' : '?'}userId=${currentUserId}`);
        }
    });

    // Thêm sự kiện click để đảm bảo điều hướng giữ userId
    const aboutUsLink = document.querySelector('.footer-links a[href="/about_us"]');
    if (aboutUsLink && currentUserId) {
        aboutUsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `/about_us?userId=${currentUserId}`;
        });
    }
}

function updateSingleLinkWithUserId(linkElement, currentUserId) {
    if (linkElement && linkElement.href) {
        try {
            const originalHref = linkElement.getAttribute('href'); // Lấy href gốc
            if (!originalHref || originalHref === '#') { // Bỏ qua nếu href là '#' hoặc rỗng
                console.log(`Skipping link with href: ${originalHref}`, linkElement);
                return;
            }

            const linkUrl = new URL(originalHref, window.location.origin);

            if (currentUserId !== null) {
                linkUrl.searchParams.set('userId', currentUserId);
            } else {
                linkUrl.searchParams.delete('userId');
            }
            linkElement.href = linkUrl.toString();
            console.log(`Updated link: ${linkElement.id || 'N/A'} to ${linkElement.href}`);
        } catch (e) {
            console.warn(`Could not parse or update href for link: ${linkElement.id || linkElement.outerHTML}`, e);
        }
    } else if (linkElement) {
        console.warn(`Link element found but has no href: ${linkElement.id || linkElement.outerHTML}`);
    }
}

function getCurrentUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    if (userIdFromUrl) {
        const parsedId = parseInt(userIdFromUrl, 10);
        return !isNaN(parsedId) ? parsedId : null;
    }
    return null;
}

// Hàm loadHTML (nếu được sử dụng trực tiếp)
function loadHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            if (elementId === "footer") {
                updateFooterLinksWithUserIdFromUrl(); // Cập nhật liên kết sau khi load footer
            }
        })
        .catch(error => console.error('Error loading HTML:', error));
}