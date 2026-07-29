/*
 * Scroll-driven dot-matrix globe for the About section.
 * Continents are procedurally generated (Fibonacci sphere sampling tested
 * against hand-placed lat/lng "landmass" blobs) so no external map texture
 * is needed. Camera flies from a full-earth view down to Eastvale, CA —
 * the address already shown in the About card below — as the user scrolls
 * through the pinned section.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('globe-canvas');
    const section = document.getElementById('about');
    if (!canvas || !section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasThree = typeof window.THREE !== 'undefined';

    if (prefersReducedMotion || !hasThree) {
        section.classList.add('globe-static');
        const finalStage = section.querySelector('.globe-stage-final');
        if (finalStage) finalStage.classList.add('is-active');
        return;
    }

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
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
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

    // ---- camera keyframes: full earth -> North America -> California -> Eastvale ----
    const KEYFRAMES = [
        { p: 0.0, radius: 9.2, lat: 15, lng: -40 },
        { p: 0.18, radius: 5.6, lat: 40, lng: -95 },
        { p: 0.48, radius: 3.1, lat: 36, lng: -118 },
        { p: 0.85, radius: 1.6, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng },
        { p: 1.0, radius: 1.5, lat: HIGHLIGHT.lat, lng: HIGHLIGHT.lng }
    ];

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function getCameraFrame(progress) {
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
            radius: a.radius + (b.radius - a.radius) * t
        };
    }

    // ---- stage captions ----
    const stages = section.querySelectorAll('.globe-stage');
    let lastStage = -1;
    function updateStage(progress) {
        const idx = progress >= 0.85 ? 3 : progress >= 0.48 ? 2 : progress >= 0.18 ? 1 : 0;
        if (idx !== lastStage) {
            stages.forEach(function (s) {
                s.classList.toggle('is-active', Number(s.dataset.stage) === idx);
            });
            lastStage = idx;
        }
    }

    function computeProgress() {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return 1;
        return Math.min(1, Math.max(0, -rect.top / total));
    }

    function resize() {
        const wrap = canvas.parentElement;
        const w = Math.max(1, wrap.clientWidth);
        const h = Math.max(1, wrap.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    let running = false;
    function renderLoop() {
        if (!running) return;

        const progress = computeProgress();
        updateStage(progress);

        let frame = getCameraFrame(progress);
        if (progress < 0.02) {
            const drift = Math.sin(performance.now() * 0.00012) * 10;
            frame = getCameraFrame(0);
            frame.lng += drift;
        }

        camera.position.copy(toVector3(frame.lat, frame.lng, frame.radius));
        camera.lookAt(0, 0, 0);

        const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.18;
        ringSprite.scale.set(0.34 * pulse, 0.34 * pulse, 1);
        pinSprite.scale.set(0.18 + progress * 0.05, 0.18 + progress * 0.05, 1);

        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    // Render one static frame immediately so the globe isn't blank before scroll/IO fires.
    camera.position.copy(toVector3(KEYFRAMES[0].lat, KEYFRAMES[0].lng, KEYFRAMES[0].radius));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    const io = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !running) {
                    running = true;
                    requestAnimationFrame(renderLoop);
                } else if (!entry.isIntersecting) {
                    running = false;
                }
            });
        },
        { threshold: 0 }
    );
    io.observe(section);
})();
