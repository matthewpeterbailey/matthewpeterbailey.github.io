document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggler Functionality
    const darkModeToggler = document.getElementById('toggler');
    const body = document.body;
    
    darkModeToggler.addEventListener('change', function() {
        if (darkModeToggler.checked) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    });
    
    // Bio Switcher Functionality
    const bioButtons = document.querySelectorAll('.bio-switcher .toggler button');
    const bios = document.querySelectorAll('.bio');
    
    bioButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const targetBioClass = this.id;
            
            bios.forEach(function(bio) {
                if (bio.classList.contains(targetBioClass)) {
                    bio.classList.add('show');
                } else {
                    bio.classList.remove('show');
                }
            });
        });
    });
    
    // Image Gallery Functionality
    const imageLinks = document.querySelectorAll('.bio.speaker a');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    imageLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const imageUrl = this.href;
            modalImage.src = imageUrl;
            imageModal.classList.add('show');
        });
    });
    
    // Close Image Modal
    const closeModalButton = document.getElementById('close-modal');
    
    closeModalButton.addEventListener('click', function() {
        imageModal.classList.remove('show');
    });
});
