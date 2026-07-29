/*
 * Full-page scroll-driven dot-matrix globe.
 * The canvas is a fixed, full-viewport background that persists behind the
 * entire site. Its camera position is a continuous function of whole-page
 * scroll progress, passing through waypoints measured from each section's
 * real position on the page (so it stays in sync regardless of content
 * length). The About section additionally tracks its own local progress to
 * drive its four caption stages (Earth -> North America -> California ->
 * Eastvale, CA -> profile card), matching the address already shown in the
 * About card.
 *
 * Continents are procedurally generated (Fibonacci sphere sampling tested
 * against hand-placed lat/lng "landmass" blobs) so no external map texture
 * is needed.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('globe-canvas');
    const aboutSection = document.getElementById('about');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasThree = typeof window.THREE !== 'undefined';

    if (prefersReducedMotion || !hasThree) {
        if (aboutSection) {
            const finalStage = aboutSection.querySelector('.globe-stage-final');
            if (finalStage) finalStage.classList.add('is-active');
        }
        return;
    }

    document.documentElement.classList.add('has-globe');

    const THREE = window.THREE;
    const RADIUS = 2.4;

    // Eastvale, CA — matches the address in the About card.
    const HIGHLIGHT = { lat: 33.9581, lng: -117.5876 };

    // Rough continent centers/radii (degrees). Decorative, not cartographic —
    // just enough to read as recognizable landmasses in a dot-matrix style.
    const LANDMASSES = [
        { lat: 62, lng: -110, r: 26 }, // Canada
        { lat: 64, lng: -155, r: 14 }, // Alaska
        { lat: 40, lng: -95, r: 20 },  // USA central/east
        { lat: 38, lng: -119, r: 11 }, // USA west
        { lat: 23, lng: -102, r: 12 }, // Mexico
        { lat: 12, lng: -85, r: 6 },   // Central America
        { lat: 5, lng: -66, r: 12 },   // N. South America
        { lat: -10, lng: -52, r: 15 }, // Brazil
        { lat: -33, lng: -65, r: 11 }, // S. South America
        { lat: 54, lng: -3, r: 5 },    // UK/Ireland
        { lat: 50, lng: 12, r: 13 },   // Europe
        { lat: 62, lng: 30, r: 10 },   // Scandinavia / W Russia
        { lat: 20, lng: 15, r: 16 },   // N Africa
        { lat: -2, lng: 22, r: 15 },   // C Africa
        { lat: -27, lng: 25, r: 11 },  // S Africa
        { lat: 28, lng: 44, r: 9 },    // Middle East
        { lat: 60, lng: 95, r: 30 },   // Siberia
        { lat: 35, lng: 105, r: 17 },  // China
        { lat: 22, lng: 79, r: 11 },   // India
        { lat: 8, lng: 105, r: 9 },    // SE Asia
        { lat: 37, lng: 138, r: 5 },   // Japan
        { lat: -25, lng: 135, r: 14 }, // Australia
        { lat: 72, lng: -40, r: 9 }    // Greenland
    ];

    function toVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    function angularDistanceDeg(lat1, lng1, lat2, lng2) {
        const r1 = (lat1 * Math.PI) / 180;
        const r2 = (lat2 * Math.PI) / 180;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(dLng / 2) ** 2;
        return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 180) / Math.PI;
    }

    function makeDotTexture(color) {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    function makeRingTexture(color) {
        const size = 128;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
        ctx.stroke();
        return new THREE.CanvasTexture(c);
    }

    function buildLandPositions() {
        const positions = [];
        const N = 3600;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
            const y = 1 - (i / (N - 1)) * 2;
            const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
            const theta = goldenAngle * i;
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
            const lng = (((Math.atan2(z, x) * 180) / Math.PI) + 540) % 360 - 180;

            let isLand = false;
            for (let b = 0; b < LANDMASSES.length; b++) {
                const blob = LANDMASSES[b];
                const d = angularDistanceDeg(lat, lng, blob.lat, blob.lng);
                const wobble = 0.8 + 0.35 * Math.sin(lat * 12.9898 + lng * 78.233);
                if (d < blob.r * wobble) {
                    isLand = true;
                    break;
                }
            }
            if (!isLand) continue;

            const v = toVector3(lat, lng, RADIUS);
            positions.push(v.x, v.y, v.z);
        }
        return new Float32Array(positions);
    }

    // ---- scene ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const landGeometry = new THREE.BufferGeometry();
    landGeometry.setAttribute('position', new THREE.BufferAttribute(buildLandPositions(), 3));
    const landMaterial = new THREE.PointsMaterial({
        size: 0.105,
        map: makeDotTexture('rgba(210,215,220,1)'),
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true
    });
    globeGroup.add(new THREE.Points(landGeometry, landMaterial));

    const wireGeometry = new THREE.SphereGeometry(RADIUS * 0.995, 32, 20);
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x30363d,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    globeGroup.add(new THREE.Mesh(wireGeometry, wireMaterial));

    const highlightPos = toVector3(HIGHLIGHT.lat, HIGHLIGHT.lng, RADIUS * 1.01);

    const pinMaterial = new THREE.SpriteMaterial({
        map: makeDotTexture('rgba(225,117,62,1)'),
        transparent: true,
        depthTest: false
    });
    const pinSprite = new THREE.Sprite(pinMaterial);
    pinSprite.scale.set(0.18, 0.18, 1);
    pinSprite.position.copy(highlightPos);
    globeGroup.add(pinSprite);

    const ringMaterial = new THREE.SpriteMaterial({
        map: makeRingTexture('rgba(225,117,62,0.9)'),
        transparent: true,
        depthTest: false,
        opacity: 0.85
    });
    const ringSprite = new THREE.Sprite(ringMaterial);
    ringSprite.position.copy(highlightPos);
    globeGroup.add(ringSprite);

    // ---- waypoints: map real section positions to whole-page scroll fractions ----
    const SECTION_IDS = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];
    let waypoints = {};

    function computeWaypoints() {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        waypoints = {};
        SECTION_IDS.forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY;
            const bottom = top + el.offsetHeight;
            waypoints[id] = {
                start: total > 0 ? Math.max(0, top / total) : 0,
                end: total > 0 ? Math.min(1, bottom / total) : 1
            };
        });
    }

    // ---- camera keyframes built from waypoints: one continuous journey ----
    let KEYFRAMES = [];
    function buildKeyframes() {
        const about = waypoints.about || { start: 0.08, end: 0.32 };
        const experience = waypoints.experience || { start: 0.32, end: 0.55 };
        const projects = waypoints.projects || { start: 0.55, end: 0.72 };
        const skills = waypoints.skills || { start: 0.72, end: 0.88 };
        const contact = waypoints.contact || { start: 0.88, end: 1 };
        const aboutSpan = about.end - about.start || 0.01;

        KEYFRAMES = [
            { p: 0, radius: 9.4, lat: 15, lng: -40, opacity: 1 },
            { p: about.start, radius: 9.2, lat: 15, lng: -40, opacity: 1 },
            { p: about.start + aboutSpan * 0.35, radius: 5.6, lat: 40, lng: -95, opacity: 1 },
            { p: about.start + aboutSpan * 0.68, radius: 3.1, lat: 36, lng: -118, opacity: 0.95 },
            { p: about.end - aboutSpan * 0.05, radius: 1.55, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng, opacity: 0.9 },
            { p: about.end, radius: 2.2, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng, opacity: 0.55 },
            { p: experience.end, radius: 3.4, lat: HIGHLIGHT.lat + 5, lng: HIGHLIGHT.lng - 8, opacity: 0.4 },
            { p: projects.end, radius: 4.2, lat: 28, lng: -100, opacity: 0.4 },
            { p: skills.end, radius: 7.6, lat: 18, lng: -55, opacity: 0.55 },
            { p: contact.start + (contact.end - contact.start) * 0.45, radius: 3.0, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng, opacity: 0.85 },
            { p: 1, radius: 1.7, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng, opacity: 1 }
        ];
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function getFrame(progress) {
        let a = KEYFRAMES[0];
        let b = KEYFRAMES[KEYFRAMES.length - 1];
        for (let i = 0; i < KEYFRAMES.length - 1; i++) {
            if (progress >= KEYFRAMES[i].p && progress <= KEYFRAMES[i + 1].p) {
                a = KEYFRAMES[i];
                b = KEYFRAMES[i + 1];
                break;
            }
        }
        const span = b.p - a.p || 1;
        let t = (progress - a.p) / span;
        t = Math.min(1, Math.max(0, t));
        t = easeInOutCubic(t);
        return {
            lat: a.lat + (b.lat - a.lat) * t,
            lng: a.lng + (b.lng - a.lng) * t,
            radius: a.radius + (b.radius - a.radius) * t,
            opacity: a.opacity + (b.opacity - a.opacity) * t
        };
    }

    // ---- About section's own local progress drives its four caption stages ----
    const stages = aboutSection ? aboutSection.querySelectorAll('.globe-stage') : [];
    let lastStage = -1;
    function updateAboutStage() {
        if (!aboutSection) return;
        const rect = aboutSection.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const local = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : (rect.top < 0 ? 1 : 0);
        const idx = local >= 0.85 ? 3 : local >= 0.48 ? 2 : local >= 0.18 ? 1 : 0;
        if (idx !== lastStage) {
            stages.forEach(function (s) {
                s.classList.toggle('is-active', Number(s.dataset.stage) === idx);
            });
            lastStage = idx;
        }
    }

    function globalProgress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }

    function resize() {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        computeWaypoints();
        buildKeyframes();
    }
    window.addEventListener('resize', resize);

    let running = document.visibilityState !== 'hidden';
    document.addEventListener('visibilitychange', function () {
        const wasRunning = running;
        running = document.visibilityState === 'visible';
        if (running && !wasRunning) requestAnimationFrame(loop);
    });

    function loop() {
        if (!running) return;

        const progress = globalProgress();
        updateAboutStage();

        let frame = getFrame(progress);
        if (progress < 0.01) {
            const drift = Math.sin(performance.now() * 0.00012) * 10;
            frame = getFrame(0);
            frame.lng += drift;
        }

        camera.position.copy(toVector3(frame.lat, frame.lng, frame.radius));
        camera.lookAt(0, 0, 0);
        canvas.style.opacity = frame.opacity.toFixed(3);

        const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.18;
        ringSprite.scale.set(0.34 * pulse, 0.34 * pulse, 1);
        const proximity = Math.max(0, Math.min(1, 1 - (frame.radius - 1.4) / 8));
        pinSprite.scale.set(0.14 + proximity * 0.1, 0.14 + proximity * 0.1, 1);

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    }

    computeWaypoints();
    buildKeyframes();
    resize();

    // Render one static frame immediately so the backdrop isn't blank on first paint.
    const first = getFrame(0);
    camera.position.copy(toVector3(first.lat, first.lng, first.radius));
    camera.lookAt(0, 0, 0);
    canvas.style.opacity = String(first.opacity);
    renderer.render(scene, camera);

    // Fonts/late layout shifts can move section offsets after first measurement.
    window.addEventListener('load', function () {
        computeWaypoints();
        buildKeyframes();
    });
    setTimeout(function () {
        computeWaypoints();
        buildKeyframes();
    }, 400);

    requestAnimationFrame(loop);
})();
