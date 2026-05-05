// animations.js - Scroll Animations for Graphicy Marketing Site
// Adds fade-in, scale-in effects as elements scroll into view

(function() {
    // Animation keyframes
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeInLeft {
            from {
                opacity: 0;
                transform: translateX(-40px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(40px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        @keyframes glowPulse {
            0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        
        .animate-on-scroll {
            opacity: 0;
        }
        .animated-fade-up {
            animation: fadeInUp 0.7s ease forwards;
        }
        .animated-fade-left {
            animation: fadeInLeft 0.7s ease forwards;
        }
        .animated-fade-right {
            animation: fadeInRight 0.7s ease forwards;
        }
        .animated-scale {
            animation: scaleIn 0.6s ease forwards;
        }
        
        .glow-pulse {
            animation: glowPulse 2s infinite;
        }
        
        .float-animation {
            animation: float 2s ease-in-out infinite;
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        
        /* Hover animations */
        .service-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .service-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: rgba(139, 92, 246, 0.4);
            box-shadow: 0 20px 30px -15px rgba(0, 0, 0, 0.5);
        }
        .service-card:hover .service-icon {
            transform: scale(1.1) rotate(5deg);
            display: inline-block;
        }
        
        .step {
            transition: transform 0.3s;
        }
        .step:hover {
            transform: translateY(-5px);
        }
        .step:hover .step-number {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        }
        
        .course-highlight {
            transition: all 0.3s;
        }
        .course-highlight:hover {
            transform: scale(1.01);
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.1);
        }
        
        .guarantee-banner {
            transition: all 0.3s;
        }
        .guarantee-banner:hover {
            border-color: rgba(139, 92, 246, 0.5);
            animation: borderGlow 1.5s infinite;
        }
        
        @keyframes borderGlow {
            0% { border-color: rgba(139, 92, 246, 0.1); }
            50% { border-color: rgba(139, 92, 246, 0.5); }
            100% { border-color: rgba(139, 92, 246, 0.1); }
        }
        
        .quote-btn {
            transition: all 0.2s;
        }
        .quote-btn:hover {
            background: #8b5cf6;
            color: white;
            transform: translateX(5px);
        }
        
        .whatsapp-float {
            transition: all 0.3s;
            animation: float 2s ease-in-out infinite;
        }
        .whatsapp-float:hover {
            transform: scale(1.15);
            box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
        }
    `;
    document.head.appendChild(animationStyles);

    // Scroll Observer
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-animation') || 'fade-up';
                const delay = element.getAttribute('data-delay') || '0';
                
                if (animation === 'fade-up') {
                    element.classList.add('animated-fade-up');
                } else if (animation === 'fade-left') {
                    element.classList.add('animated-fade-left');
                } else if (animation === 'fade-right') {
                    element.classList.add('animated-fade-right');
                } else if (animation === 'scale') {
                    element.classList.add('animated-scale');
                } else {
                    element.classList.add('animated-fade-up');
                }
                
                if (delay && delay !== '0') {
                    element.style.animationDelay = (parseInt(delay) * 0.1) + 's';
                }
                
                observer.unobserve(element);
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
    });

    animatedElements.forEach(el => observer.observe(el));

    // Add glow-pulse to badge if exists
    const badge = document.querySelector('.badge');
    if (badge) {
        badge.classList.add('glow-pulse');
    }

    // Add float animation to WhatsApp button
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.classList.add('float-animation');
    }

    console.log('Animations loaded - Graphicy');
})();
