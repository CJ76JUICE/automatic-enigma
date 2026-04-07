(function () {
    const dropdowns = Array.from(document.querySelectorAll('.site-header .nav-dropdown'));

    if (!dropdowns.length) {
        return;
    }

    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('a');

        if (!trigger) {
            return;
        }

        trigger.setAttribute('aria-expanded', 'false');

        trigger.addEventListener('click', (event) => {
            const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
            const isOpen = dropdown.classList.contains('is-open');

            if (isTouchLike && !isOpen) {
                event.preventDefault();
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', (event) => {
        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('a');
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('is-open');
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('a');
            dropdown.classList.remove('is-open');
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });
})();
