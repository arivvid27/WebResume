// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Typing animation
document.addEventListener('DOMContentLoaded', function() {
    const typed = new Typed('#typed-strings', {
        strings: [
            'Cybersecurity Professional',
            'Software Developer',
            'System Administrator',
            'Network Engineer'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // Reveal on scroll: intersection observer to add .in-view to .reveal elements
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // if the element has children with reveal-child, stagger them
                const children = entry.target.querySelectorAll('.reveal-child');
                if (children.length) {
                    children.forEach((c, i) => {
                        c.style.transitionDelay = `${i * 80}ms`;
                        c.classList.add('in-view');
                    });
                }
                // unobserve once in view to avoid repeated toggles
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach(r => observer.observe(r));
});
