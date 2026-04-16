(function () {
    const galleryImages = Array.from(document.querySelectorAll('.image-grid img, .product-image'));

    if (!galleryImages.length) {
        return;
    }

    const lightbox = document.createElement('div');
    lightbox.className = 'product-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = [
        '<button class="product-lightbox-close" type="button" aria-label="Close image viewer">&times;</button>',
        '<div class="product-lightbox-stage">',
        '<button class="product-lightbox-btn product-lightbox-prev" type="button" aria-label="Previous image">&#10094;</button>',
        '<img class="product-lightbox-image" src="" alt="Expanded product image">',
        '<button class="product-lightbox-btn product-lightbox-next" type="button" aria-label="Next image">&#10095;</button>',
        '</div>',
        '<div class="product-lightbox-counter" aria-live="polite"></div>'
    ].join('');

    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.product-lightbox-close');
    const prevBtn = lightbox.querySelector('.product-lightbox-prev');
    const nextBtn = lightbox.querySelector('.product-lightbox-next');
    const viewerImage = lightbox.querySelector('.product-lightbox-image');
    const counter = lightbox.querySelector('.product-lightbox-counter');

    let currentIndex = 0;

    function updateImage() {
        const sourceImage = galleryImages[currentIndex];
        viewerImage.src = sourceImage.currentSrc || sourceImage.src;
        viewerImage.alt = sourceImage.alt || 'Expanded product image';
        counter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
    }

    function openAt(index) {
        currentIndex = index;
        updateImage();
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        viewerImage.removeAttribute('src');
    }

    function goNext() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateImage();
    }

    function goPrev() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateImage();
    }

    galleryImages.forEach((image, index) => {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', function (event) {
            event.preventDefault();
            openAt(index);
        });
    });

    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);
    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (lightbox.getAttribute('aria-hidden') === 'true') {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowRight') {
            goNext();
        } else if (event.key === 'ArrowLeft') {
            goPrev();
        }
    });

    if (galleryImages.length === 1) {
        prevBtn.hidden = true;
        nextBtn.hidden = true;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx > 0 ? goNext() : goPrev();
        }
    }, { passive: true });
})();
