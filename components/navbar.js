function loadNavbar() {

    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    fetch('./components/navbar.html')
        .then(response => response.text())
        .then(data => {
            navbarPlaceholder.innerHTML = data;
            const activeLink = navbarPlaceholder
                .querySelector(`[data-page="${currentPage}"], a[href*="${currentPage}.html"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        })
        .catch(error => console.error('Error loading navbar:', error));

}

window.addEventListener('DOMContentLoaded', loadNavbar);