document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.querySelector('.edit-profile-form .edit-button');
    const editPassModal = document.querySelector('.modal-edit-pass');
    const closeBtns = document.querySelectorAll('.edit-pass-form .js-modal-close');

    // Hàm hiển thị form edit password
    function showEditPassForm() {
        editPassModal.classList.add('open');
    }

    // Hàm ẩn form edit password
    function hideEditPassForm() {
        editPassModal.classList.remove('open');
    }

    editBtn.addEventListener('click', showEditPassForm);

    // Nghe hành vi click vào close button hoặc button cancel 
    for (const closeBtn of closeBtns) {
        closeBtn.addEventListener('click', hideEditPassForm);
    }
});