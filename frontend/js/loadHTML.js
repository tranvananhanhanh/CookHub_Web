// --- START OF FILE loadHTML.js ---

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
    }, 100);
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
        'logo-link-header',
        'nav-home-link',
        'nav-cooks-chart-link',
        'nav-bmi-link',
        'nav-saved-recipes-link',
        'search-link-header',
        'profile-link-header'
    ];

    specificLinksToUpdate.forEach(linkId => {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            updateSingleLinkWithUserId(linkElement, currentUserId);
        }
    });

    const createPostButtonLink = document.querySelector('#create-post-button-header');
    if (createPostButtonLink && createPostButtonLink.tagName === 'A') {
        updateSingleLinkWithUserId(createPostButtonLink, currentUserId);
    }

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
            const originalHref = linkElement.getAttribute('href');
            if (!originalHref || originalHref === '#') {
                return;
            }

            const linkUrl = new URL(originalHref, window.location.origin);

            if (currentUserId !== null) {
                linkUrl.searchParams.set('userId', currentUserId);
            } else {
                linkUrl.searchParams.delete('userId');
            }
            linkElement.href = linkUrl.toString();
        } catch (e) {
            console.warn(`Could not parse or update href for link: ${linkElement.id || linkElement.outerHTML}`, e);
        }
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