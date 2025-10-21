class AsteroidBackground {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.asteroids = [];
        this.num = 22; // number of asteroids
        this.cursor = document.querySelector('.custom-cursor');
        this.mouseTarget = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.cursorVel = { x: 0, y: 0 };
        this.lastTime = 0;

        this.resize();
        this.init();
        this.setupEventListeners();
    }

    resize() {
        const header = document.querySelector('.header-container');
        if (!header) return;
        this.headerRect = header.getBoundingClientRect();
        this.width = Math.max(1, Math.ceil(this.headerRect.width));
        this.height = Math.max(1, Math.ceil(this.headerRect.height));
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `0px`;
        this.canvas.style.top = `0px`;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => this.resize());

        // Smooth cursor: track raw mouse target but do not create interactivity
        document.addEventListener('mousemove', (e) => {
            this.mouseTarget.x = e.clientX;
            this.mouseTarget.y = e.clientY;
        });

        // Hover effects for interactive elements still control cursor appearance
        document.querySelectorAll('a, button').forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (this.cursor) this.cursor.classList.add('hovering');
            });
            element.addEventListener('mouseleave', () => {
                if (this.cursor) this.cursor.classList.remove('hovering');
            });
        });

        // Make cursor active (turn green) on mouse/touch down and remove on up
        document.addEventListener('mousedown', () => {
            if (this.cursor) this.cursor.classList.add('active');
        });
        document.addEventListener('mouseup', () => {
            if (this.cursor) this.cursor.classList.remove('active');
        });

        // Touch support for mobile devices
        document.addEventListener('touchstart', (e) => {
            if (this.cursor) this.cursor.classList.add('active');
            // set mouseTarget to first touch for cursor positioning
            const t = e.touches[0];
            if (t) {
                this.mouseTarget.x = t.clientX;
                this.mouseTarget.y = t.clientY;
            }
        }, { passive: true });
        document.addEventListener('touchend', () => {
            if (this.cursor) this.cursor.classList.remove('active');
        });
    }

    initFlowField() {
        const resolution = 20;
        const cols = Math.ceil(this.width / resolution);
        const rows = Math.ceil(this.height / resolution);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const angle = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.PI * 2;
                if (!this.flowField[y]) this.flowField[y] = [];
                this.flowField[y][x] = angle;
            }
        }
    }

    init() {
        // create asteroids with staggered horizontal velocities and vertical arc offsets
        this.asteroids = [];
        for (let i = 0; i < this.num; i++) {
            const scale = Math.random() * 1.2 + 0.6;
            const startY = Math.random() * this.height * 0.55 + this.height * 0.2;
            const direction = Math.random() > 0.5 ? 1 : -1; // left-to-right or right-to-left
            const speed = (Math.random() * 0.6 + 0.4) * direction; // px per frame baseline
            this.asteroids.push({
                x: direction === 1 ? -100 - Math.random() * 600 : this.width + Math.random() * 600,
                y: startY,
                baseY: startY,
                vx: speed,
                amplitude: Math.random() * 40 + 30,
                frequency: Math.random() * 0.01 + 0.005,
                radius: Math.random() * 6 + 3,
                hueOffset: Math.random() * 30 - 15,
                scale
            });
        }
        this.animate();
    }

    updateParticle(particle, deltaTime) {
        // Mouse interaction
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < particle.interactionRadius) {
            const force = (particle.interactionRadius - distance) / particle.interactionRadius;
            const angle = Math.atan2(dy, dx);
            
            // Swirl effect
            const swirlAngle = angle + Math.PI / 2;
            const swirlForce = force * 2;
            
            particle.vx += Math.cos(swirlAngle) * swirlForce;
            particle.vy += Math.sin(swirlAngle) * swirlForce;
        }

        // Spring force to original position
        const dx2 = particle.originX - particle.x;
        const dy2 = particle.originY - particle.y;
        particle.vx += dx2 * particle.springFactor;
        particle.vy += dy2 * particle.springFactor;

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        
        // Apply friction
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;

        // Wobble animation
        particle.radius = particle.radius * 0.9 + (Math.sin(particle.phase) * 10 + 30) * 0.1;
        particle.phase += 0.05;
    }

    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, particle.color.replace('33', '66')); // More opaque center
        gradient.addColorStop(0.5, particle.color);
        gradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    createRipple(x, y) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.ripples.push({
            x,
            y,
            radius: 2,
            maxRadius: 80,
            lineWidth: 2,
            opacity: 0.5,
            color
        });
    }

    createPaintDrop(x, y, force = 1) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        
        this.paintDrops.push({
            x,
            y,
            vx: Math.cos(angle) * speed * force,
            vy: Math.sin(angle) * speed * force,
            radius: Math.random() * 15 + 5,
            color,
            opacity: 0.6,
            life: 1
        });
    }

    updatePaintDrops(deltaTime) {
        for (let i = this.paintDrops.length - 1; i >= 0; i--) {
            const drop = this.paintDrops[i];
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.life -= deltaTime * 0.001;
            drop.radius *= 0.99;
            
            if (drop.life <= 0 || drop.radius < 1) {
                this.paintDrops.splice(i, 1);
            }
        }
    }

    updateRipples(deltaTime) {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];
            ripple.radius += deltaTime * 3;
            ripple.opacity -= deltaTime * 0.02;
            ripple.lineWidth *= 0.98;
            
            if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }

    updateGlitter(deltaTime) {
        this.glitter.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += deltaTime * 0.001;
            
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;
            
            // Shimmer effect
            particle.opacity = 0.2 + Math.sin(particle.life) * 0.1;
        });
    }

    draw() {
        // Draw asteroids
        this.asteroids.forEach(a => {
            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius * 3);
            const baseHue = 210 + a.hueOffset;
            gradient.addColorStop(0, `hsla(${baseHue}, 90%, 70%, 0.95)`);
            gradient.addColorStop(0.4, `hsla(${baseHue}, 85%, 55%, 0.7)`);
            gradient.addColorStop(1, `hsla(${baseHue}, 80%, 40%, 0.0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.arc(a.x, a.y, a.radius * a.scale, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    // linear interpolation helper
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    animate(currentTime = 0) {
        const prevTime = this.lastTime || currentTime;
        const deltaTime = Math.min((currentTime - prevTime) / 16, 5);
        const dtSec = Math.max(0.016, (currentTime - prevTime) / 1000);
        this.lastTime = currentTime;

        // Exponential smoothing (no snapping): responsiveness controls how quickly cursor catches up
        const responsiveness = 14.0; // higher = snappier, lower = more lag
        const alpha = 1 - Math.exp(-responsiveness * dtSec);
        this.cursorPos.x += (this.mouseTarget.x - this.cursorPos.x) * alpha;
        this.cursorPos.y += (this.mouseTarget.y - this.cursorPos.y) * alpha;

        // Update cursor using translate3d (pixel offsets) to avoid percent rounding snaps
        if (this.cursor) {
            const rect = this.cursor.getBoundingClientRect();
            const ox = rect.width / 2;
            const oy = rect.height / 2;
            this.cursor.style.transform = `translate3d(${this.cursorPos.x - ox}px, ${this.cursorPos.y - oy}px, 0)`;
        }

        // Clear canvas fully each frame (non-interactive dynamic BG)
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update asteroid positions
        this.asteroids.forEach(a => {
            a.x += a.vx * (deltaTime * 0.8);
            a.y = a.baseY + Math.sin(a.x * a.frequency) * a.amplitude;
            // wrap horizontally
            if (a.vx > 0 && a.x - a.radius * a.scale > this.width + 80) {
                a.x = -120 - Math.random() * 400;
                a.baseY = Math.random() * this.height * 0.6 + this.height * 0.2;
            } else if (a.vx < 0 && a.x + a.radius * a.scale < -80) {
                a.x = this.width + 120 + Math.random() * 400;
                a.baseY = Math.random() * this.height * 0.6 + this.height * 0.2;
            }
        });

        // Draw everything
        this.draw();

        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AsteroidBackground();
});