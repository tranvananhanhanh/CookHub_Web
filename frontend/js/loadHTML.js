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

    menuIcon.addEventListener('click', () => {
        isNavVisible = !isNavVisible;
        nav.style.display = isNavVisible ? 'block' : 'none';
    });
}