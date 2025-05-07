document.addEventListener("DOMContentLoaded", function () {
    // Load Header
    fetch("../components/header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".header").innerHTML = data;
            initHeaderScript(); // Gọi hàm xử lý menubar
            updateHeaderLinksWithUserIdFromUrl();
            // updateUserInfoOnHeader();
        });
    
    // updateHeaderLinksWithUserId();
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

    if (!menuIcon || !nav) {
        console.warn("Header chưa render xong!");
        return;
    }

    // Xử lý menu bar
    menuIcon.addEventListener('click', () => {
        isNavVisible = !isNavVisible;
        nav.style.display = isNavVisible ? 'block' : 'none';
    });

    // Xử lý active link
    const navLinks = document.querySelectorAll('nav ul li a');
    const currentUrl = window.location.pathname;

    navLinks.forEach(link => {
        // So sánh href của link với URL hiện tại
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateHeaderLinksWithUserIdFromUrl() {
    const currentUserId = getCurrentUserIdFromUrl();
    console.log("Updating all header links. Current User ID from URL:", currentUserId);

    // 1. Cập nhật các link đã có ID cụ thể
    const specificLinksToUpdate = [
        'logo-link-header',        // Link logo (trang chủ)
        'nav-home-link',           // Link Home trong nav
        'nav-cooks-chart-link',    // Link Cooks Chart
        'nav-bmi-link',            // Link BMI
        'nav-saved-recipes-link',  // Link Saved Recipes
        'search-link-header',      // Link Search Icon
        'profile-link-header'      // Link User Profile
        // Thêm ID của các link khác nếu có
    ];

    specificLinksToUpdate.forEach(linkId => {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            updateSingleLinkWithUserId(linkElement, currentUserId);
        } else {
            // console.warn(`Link with ID #${linkId} not found in loaded header.`);
        }
    });

    // 2. Cập nhật các link chưa có ID cụ thể (ví dụ: tất cả <a> trong nav mà chưa được xử lý)
    // Cách này sẽ bao quát hơn nhưng cần cẩn thận để không ghi đè các link không mong muốn
    // const headerElement = document.querySelector('.header');
    // if (headerElement) {
    //     const allLinksInHeader = headerElement.querySelectorAll('a[href]'); // Chỉ chọn thẻ a có thuộc tính href
    //     allLinksInHeader.forEach(link => {
    //         // Kiểm tra xem link này đã được cập nhật bởi specificLinksToUpdate chưa
    //         // (cách đơn giản là kiểm tra ID, hoặc có thể có cách khác phức tạp hơn)
    //         // Hiện tại, để tránh cập nhật kép, chúng ta có thể bỏ qua bước này nếu danh sách specificLinksToUpdate đã đủ
    //         if (!specificLinksToUpdate.includes(link.id)) {
    //             // updateSingleLinkWithUserId(link, currentUserId);
    //         }
    //     });
    // }


    // Xử lý nút "Create" (nếu nó là link)
    // Giả sử nút Create trỏ đến /create-post
    const createPostButtonLink = document.querySelector('#create-post-button-header'); // Nếu nút Create chính là thẻ a
    // Hoặc nếu thẻ p nằm trong thẻ a:
    // const createPostButtonParentLink = document.querySelector('#create-post-button-header a');
    if (createPostButtonLink && createPostButtonLink.tagName === 'A') { // Kiểm tra xem nó có phải là thẻ <a> không
         updateSingleLinkWithUserId(createPostButtonLink, currentUserId);
    } else {
        // Nếu create-post-button không phải là link mà là một div/button mở modal,
        // thì không cần cập nhật href.
        // Tuy nhiên, nếu modal đó tải nội dung từ server có liên quan đến user,
        // bạn có thể cần lưu currentUserId vào một biến toàn cục để modal sử dụng.
    }


    // Xử lý hiển thị/ẩn user-logo (giữ nguyên logic này)
    const userLogoDiv = document.querySelector('.header .user-logo');
    if (currentUserId !== null) {
        if (userLogoDiv) userLogoDiv.style.display = 'flex';
    } else {
        if (userLogoDiv) userLogoDiv.style.display = 'none';
    }
}

function updateSingleLinkWithUserId(linkElement, currentUserId) {
    if (linkElement && linkElement.href) { // Kiểm tra linkElement và href tồn tại
        try {
            const originalHref = linkElement.getAttribute('href'); // Lấy href gốc
            if (!originalHref || originalHref === '#') { // Bỏ qua nếu href là '#' hoặc rỗng
                // console.log(`Skipping link with href: ${originalHref}`, linkElement);
                return;
            }

            const linkUrl = new URL(originalHref, window.location.origin);

            if (currentUserId !== null) {
                linkUrl.searchParams.set('userId', currentUserId);
            } else {
                linkUrl.searchParams.delete('userId');
            }
            linkElement.href = linkUrl.toString();
            // console.log(`Updated link: ${linkElement.id || 'N/A'} to ${linkElement.href}`);
        } catch (e) {
            console.warn(`Could not parse or update href for link: ${linkElement.id || linkElement.outerHTML}`, e);
        }
    } else if (linkElement) {
        // console.warn(`Link element found but has no href: ${linkElement.id || linkElement.outerHTML}`);
    }
}

function getCurrentUserIdFromUrl() { // Đảm bảo tên này khớp với tên bạn gọi
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    if (userIdFromUrl) {
        const parsedId = parseInt(userIdFromUrl, 10);
        return !isNaN(parsedId) ? parsedId : null;
    }
    return null;
}


