document.addEventListener("DOMContentLoaded", function () {
    // Load Header
    fetch("../components/header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector(".header").innerHTML = data;
            initHeaderScript(); // Gọi hàm xử lý menubar
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