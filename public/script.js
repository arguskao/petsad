// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        navbar.style.padding = '12px 0';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.padding = '16px 0';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to elements
document.querySelectorAll('.pet-card, .step-card, .story-card, .shelter-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(el);
});

// Pet card interactions
document.querySelectorAll('.pet-card').forEach(card => {
    // Add hover sound effect (optional)
    card.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // Click to view details
    card.addEventListener('click', function (e) {
        if (!e.target.closest('.favorite-btn')) {
            const petName = this.querySelector('h3').textContent;
            console.log(`Viewing details for: ${petName}`);
            // Add your navigation logic here
        }
    });
});

// Favorite button functionality
document.querySelectorAll('.favorite-btn').forEach(btn => {
    let isFavorited = false;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        isFavorited = !isFavorited;

        const svg = this.querySelector('svg path');
        if (isFavorited) {
            svg.setAttribute('fill', '#FF6B6B');
            svg.setAttribute('stroke', '#FF6B6B');
            this.style.background = 'rgba(255, 107, 107, 0.1)';

            // Show notification
            showNotification('❤️ 已加入最愛');
        } else {
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            this.style.background = 'white';
        }

        // Add bounce animation
        this.style.animation = 'bounce 0.5s';
        setTimeout(() => {
            this.style.animation = '';
        }, 500);
    });
});

// Add bounce animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

// Search filter functionality
const searchBtn = document.querySelector('.search-filters .btn-primary');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const filters = {
            type: document.querySelectorAll('.filter-select')[0].value,
            age: document.querySelectorAll('.filter-select')[1].value,
            size: document.querySelectorAll('.filter-select')[2].value,
            location: document.querySelectorAll('.filter-select')[3].value
        };

        console.log('Search filters:', filters);
        showNotification('🔍 搜尋中...');

        // Add your search logic here
        setTimeout(() => {
            showNotification('✨ 找到 127 隻符合條件的毛孩');
        }, 1000);
    });
}

// Filter select animations
document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function () {
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});

// Stats counter animation
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
};

// Trigger counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent.replace(/,/g, ''));
                stat.textContent = '0';
                setTimeout(() => {
                    animateCounter(stat, target);
                }, 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Step cards sequential animation
const stepCards = document.querySelectorAll('.step-card');
const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            stepCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
            stepObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const stepsGrid = document.querySelector('.steps-grid');
if (stepsGrid) {
    stepObserver.observe(stepsGrid);
}

// Story card hover effect
document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        const emoji = this.querySelector('.story-placeholder');
        if (emoji) {
            emoji.style.transform = 'scale(1.1) rotate(5deg)';
            emoji.style.transition = 'transform 0.3s';
        }
    });

    card.addEventListener('mouseleave', function () {
        const emoji = this.querySelector('.story-placeholder');
        if (emoji) {
            emoji.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Shelter card interactions
document.querySelectorAll('.shelter-card').forEach(card => {
    card.addEventListener('click', function () {
        const shelterName = this.querySelector('h3').textContent;
        console.log(`Viewing shelter: ${shelterName}`);
        showNotification(`📍 查看 ${shelterName} 的詳細資訊`);
    });
});

// CTA button interactions
document.querySelectorAll('.cta .btn-primary, .cta .btn-outline').forEach(btn => {
    btn.addEventListener('click', function () {
        const text = this.textContent.trim();
        if (text.includes('領養')) {
            console.log('Starting adoption journey');
            showNotification('🐾 開始你的領養旅程！');
        } else {
            console.log('Learn more clicked');
            showNotification('📚 了解更多領養資訊');
        }
    });
});

// Main CTA buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
    if (btn.textContent.includes('了解更多')) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const petCard = this.closest('.pet-card');
            if (petCard) {
                const petName = petCard.querySelector('h3').textContent;
                showNotification(`🐾 查看 ${petName} 的完整資料`);
            }
        });
    }
});

// Notification system
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: white;
        color: var(--text-dark);
        padding: 16px 24px;
        border-radius: 50px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-weight: 700;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Floating paws animation enhancement
document.querySelectorAll('.floating-paw').forEach((paw, index) => {
    paw.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.5) rotate(20deg)';
        this.style.opacity = '0.3';
    });

    paw.addEventListener('mouseleave', function () {
        this.style.transform = '';
        this.style.opacity = '0.1';
    });
});

// Add parallax effect to hero decoration
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const paws = document.querySelectorAll('.floating-paw');

    paws.forEach((paw, index) => {
        const speed = 0.3 + (index * 0.1);
        paw.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Easter egg: Click on logo multiple times
let logoClickCount = 0;
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', () => {
        logoClickCount++;
        if (logoClickCount === 5) {
            showNotification('🎉 你發現了隱藏彩蛋！感謝你對毛孩的關心 ❤️');
            logoClickCount = 0;

            // Add confetti effect (simple version)
            for (let i = 0; i < 20; i++) {
                createConfetti();
            }
        }
    });
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.textContent = ['🐾', '❤️', '🐕', '🐈'][Math.floor(Math.random() * 4)];
    confetti.style.cssText = `
        position: fixed;
        top: -50px;
        left: ${Math.random() * 100}vw;
        font-size: 24px;
        pointer-events: none;
        z-index: 10000;
        animation: fall 3s linear;
    `;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
}

const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

console.log('🐾 PawsHome - 給每一隻毛孩一個溫暖的家');
console.log('💡 提示：點擊 logo 5 次有驚喜！');
