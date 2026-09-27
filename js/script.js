/*==================================================
  DOK'S OFF SALES - Part 2 interaction layer
==================================================*/

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* Page loader - do not wait for third-party iframes such as Google Maps. */
function hideLoader() {
    const loader = qs('.loader');
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 500);
}
document.addEventListener('DOMContentLoaded', hideLoader, { once: true });
window.setTimeout(hideLoader, 1800);

/* Scroll progress */
const progressBar = qs('.progress-bar');
window.addEventListener('scroll', () => {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
}, { passive: true });

/* Sticky header */
const header = qs('header');
window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* Mobile navigation */
const menuToggle = qs('.menu-toggle');
const navLinks = qs('.nav-links');
if (menuToggle && navLinks) {
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');
    menuToggle.setAttribute('aria-expanded', 'false');

    const toggleMenu = () => {
        const open = navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(open));
    };

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMenu();
        }
    });

    qsa('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* Reveal-on-scroll */
const revealElements = qsa('.reveal');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
} else {
    revealElements.forEach(element => element.classList.add('active'));
}

/* Hero slider */
qsa('.hero').forEach(hero => {
    const slides = qsa('.hero-slider .slide', hero);
    const dots = qsa('.slider-dots .dot', hero);
    if (slides.length < 2) return;

    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    let timer;

    const showSlide = index => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };

    const start = () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            timer = setInterval(() => showSlide(current + 1), 5000);
        }
    };
    const stop = () => clearInterval(timer);

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        showSlide(i);
        stop();
        start();
    }));

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(current);
    start();
});

/* Product category filter */
const categoryButtons = qsa('.category-btn');
const productCards = qsa('.product-card');
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        const category = button.textContent.trim().toLowerCase();
        productCards.forEach(card => {
            const categoryElement = qs('.product-category', card);
            const productCategory = categoryElement ? categoryElement.textContent.trim().toLowerCase() : '';
            const visible = category === 'all' || productCategory.includes(category) ||
                (category === 'premium spirits' && /brandy|tequila|gin|spirit/i.test(productCategory)) ||
                (category === 'mixers & soft drinks' && /mixer|soft|energy/i.test(productCategory));
            card.hidden = !visible;
        });
    });
});
categoryButtons.forEach((button, index) => button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false'));

/* Form validation and success feedback — only after valid submission. */
const forms = qsa('form');
forms.forEach(form => {
    form.addEventListener('submit', event => {
        const requiredFields = qsa('[required]', form);
        let valid = true;

        requiredFields.forEach(field => {
            const value = field.value.trim();
            const fieldValid = field.checkValidity() && value !== '';
            field.style.borderColor = fieldValid ? '' : '#d62828';
            if (!fieldValid) valid = false;
        });

        if (!valid) {
            event.preventDefault();
            const firstInvalid = qs(':invalid', form);
            firstInvalid?.focus();
            return;
        }

        /* These forms are front-end assignment demonstrations. */
        event.preventDefault();
        showSuccessMessage();
        form.reset();
        requiredFields.forEach(field => field.style.borderColor = '');
    });
});

function showSuccessMessage() {
    let message = qs('.success-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'success-message';
        message.setAttribute('role', 'status');
        message.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i><span>Your enquiry has been sent successfully!</span>';
        document.body.appendChild(message);
    }
    message.classList.add('show');
    window.setTimeout(() => message.classList.remove('show'), 3000);
}

/* Back to top */
const backToTop = qs('#backToTop');
window.addEventListener('scroll', () => {
    if (!backToTop) return;
    const visible = window.scrollY > 400;
    backToTop.classList.toggle('show', visible);
}, { passive: true });
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Smooth scrolling for same-page anchors */
qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
        const target = qs(anchor.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
