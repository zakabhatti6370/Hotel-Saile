// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon between bars and times
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && navToggle) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu after clicking
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const icon = navToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            // Scroll down
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            // Scroll up
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
    
    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + (element.textContent.includes('+') ? '+' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };
    
    // Intersection Observer for stats animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statsSection = entry.target;
                const numbers = statsSection.querySelectorAll('.stat-number');
                
                numbers.forEach(number => {
                    const text = number.textContent;
                    const value = parseInt(text.replace('+', ''));
                    if (!isNaN(value)) {
                        number.textContent = '0+';
                        animateValue(number, 0, value, 2000);
                    }
                });
                
                statsObserver.unobserve(statsSection);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Add active class to current page in navigation
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-lists li a');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentLocation.split('/').pop() || 
            (currentLocation.endsWith('/') && href === 'index.html')) {
            item.parentElement.classList.add('active');
        }
    });
    
    // Order button click handler
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            // Add your order logic here
            alert('Order Now feature coming soon!');
        });
    }
    
    // Contact button click handler
    const contactBtn = document.querySelector('.btn-primary:not(.order-btn)');
    if (contactBtn && contactBtn.textContent.includes('Contact Us')) {
        contactBtn.addEventListener('click', function() {
            window.location.href = 'Contact.html';
        });
    }
    
    // Reservations button click handler
    const reservationBtn = document.querySelector('.btn-secondary');
    if (reservationBtn && reservationBtn.textContent.includes('Reservations')) {
        reservationBtn.addEventListener('click', function() {
            // Add reservation logic
            alert('Reservation feature coming soon!');
        });
    }
    
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add smooth page transitions
window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
});

// Prevent form submission if forms exist
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
    });
});
    
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            
            if (query.length > 0) {
                // If on Menu page, filter items
                if (window.location.pathname.includes('Menu')) {
                    const menuItems = document.querySelectorAll('.menu-item');
                    menuItems.forEach(item => {
                        const title = item.querySelector('h3').textContent.toLowerCase();
                        const description = item.querySelector('p').textContent.toLowerCase();
                        
                        if (title.includes(query) || description.includes(query)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                } else {
                    // Redirect to Menu page with search query
                    window.location.href = `Menu.html?search=${encodeURIComponent(query)}`;
                }
            } else {
                // Show all items if search is empty
                const menuItems = document.querySelectorAll('.menu-item');
                menuItems.forEach(item => {
                    item.style.display = 'block';
                });
            }
        };
        
        // Search on button click
        searchBtn.addEventListener('click', performSearch);
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Handle search query from URL on Menu page
        if (window.location.pathname.includes('Menu')) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            
            if (searchQuery) {
                searchInput.value = searchQuery;
                const performSearchEvent = new Event('keypress');
                performSearchEvent.key = 'Enter';
                searchInput.dispatchEvent(performSearchEvent);
            }
        }
    }
    

