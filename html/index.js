document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Split section headings into per-word spans so they can mask-reveal in,
    // rather than fading in as a single block.
    document.querySelectorAll('.section-head h2, .footer-inner h2').forEach(function (heading) {
        const words = heading.textContent.trim().split(/\s+/);
        heading.innerHTML = words
            .map(function (word) {
                return '<span class="word-reveal"><span class="word-reveal-inner">' + word + '</span></span>';
            })
            .join(' ');
    });

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

    // ---- Combined scroll effects: header state, progress bar, parallax ----
    const header = document.querySelector('.site-header');
    const progressBar = document.getElementById('scroll-progress');
    const parallaxEls = document.querySelectorAll('.section-index');

    let scrollTicking = false;
    function updateScrollEffects() {
        scrollTicking = false;

        header.classList.toggle('is-scrolled', window.scrollY > 8);

        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

        if (!prefersReducedMotion) {
            const vh = window.innerHeight;
            parallaxEls.forEach(function (el) {
                const rect = el.getBoundingClientRect();
                const centerDelta = rect.top + rect.height / 2 - vh / 2;
                const offset = Math.max(-8, Math.min(8, centerDelta * 0.015));
                el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
            });
        }
    }
    function onScroll() {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateScrollEffects);
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollEffects();

    // Subtle magnetic tilt on cards — pointer devices only, and only without
    // a reduced-motion preference.
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    'perspective(700px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' +
                    (px * 6).toFixed(2) + 'deg) translateY(-3px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }
});
