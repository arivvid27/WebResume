document.addEventListener('DOMContentLoaded', function () {
    // Smooth-scrolling nav links (also closes the mobile menu on tap)
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('is-open');
            navToggle.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Typing animation for the hero role line
    if (window.Typed) {
        new Typed('#typed-strings', {
            strings: [
                'Cybersecurity Enthusiast',
                'Software Developer',
                'System Administrator',
                'High School Student',
                'President and Founder',
                ''
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // Reveal-on-scroll
    const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger, .divider');
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    navToggle.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Sticky header gains a border/shadow once the page scrolls
    const header = document.querySelector('.site-header');
    const onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});
