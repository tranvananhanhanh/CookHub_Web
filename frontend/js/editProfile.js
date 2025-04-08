document.addEventListener("DOMContentLoaded", () => {
    const editProfile = document.querySelector('.js-edit-profile');
    const editProfileModal = document.querySelector('.modal-edit-profile');
    const closeBtns = document.querySelectorAll('.edit-profile-form .js-modal-close');

    // Hàm hiển thị form edit profile
    function showEditProfileForm() {
        editProfileModal.classList.add('open');
    }

    // Hàm ẩn form edit profile
    function hideEditProfileForm() {
        editProfileModal.classList.remove('open');
    }

    // Nghe hành vi click vào button edit my profile
    editProfile.addEventListener('click', showEditProfileForm);

    // Nghe hành vi click vào close button hoặc button cancel 
    for (const closeBtn of closeBtns) {
        closeBtn.addEventListener('click', hideEditProfileForm);
    }
});