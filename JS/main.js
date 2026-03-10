// Single DOMContentLoaded for all initialization
document.addEventListener('DOMContentLoaded', function() {
    
    /* ========== MENU CATEGORY FILTER ========== */
    initMenuFilters();
    
    /* ========== VIDEO PLAYER ========== */
    initVideoPlayer();
    
    /* ========== FORM HANDLING ========== */
    initOrderForm();
    
    /* ========== INITIALIZE ORDER SYSTEM ========== */
    window.orderSystem = new OrderSystem();
    
    /* ========== ADD ANIMATION STYLES ========== */
    addAnimationStyles();
    
});

// Separate function for menu filters
function initMenuFilters() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuItems = document.querySelectorAll('.menu-item');

    if (categoryTabs.length === 0) return; // Exit if not on menu page

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get category
            const category = this.getAttribute('data-category');
            
            // Filter menu items
            menuItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Separate function for video player
function initVideoPlayer() {
    const videoWrapper = document.querySelector('.video-wrapper');
    if (videoWrapper) {
        videoWrapper.addEventListener('click', function() {
            const video = this.querySelector('video');
            if (video) {
                if (video.paused) {
                    video.play();
                    this.classList.remove('paused');
                } else {
                    video.pause();
                    this.classList.add('paused');
                }
            }
        });
    }
}

// Separate function for order form
function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Show success message
            alert('Thank you for your reservation! We will contact you soon.');
            
            // Reset form
            this.reset();
        });
    }
}

// Add animation styles
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    if (!document.querySelector('style[data-animation]')) {
        style.setAttribute('data-animation', 'true');
        document.head.appendChild(style);
    }
}

/* ========== ORDER SYSTEM CLASS ========== */
class OrderSystem {
    constructor() {
        this.cart = [];
        this.orders = [];
        this.modal = null;
        this.successModal = null;
        this.loadFromStorage();
        this.init();
    }

    init() {
        this.initModals();
        this.initEventListeners();
        this.updateCartCount();
        this.renderCart();
        this.renderOrderHistory();
    }

    initModals() {
        this.modal = document.getElementById('orderModal');
        this.successModal = document.getElementById('successModal');
    }

    initEventListeners() {
        // Order Now buttons - Fixed :contains issue
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });

        // Also handle any button with "Order Now" text
        document.querySelectorAll('.btn-primary').forEach(btn => {
            if (btn.textContent.includes('Order Now') && !btn.classList.contains('order-btn')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal();
                });
            }
        });

        // Add to cart buttons - Only in OrderSystem, removed from menu filter
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            // Remove any existing listeners to prevent double execution
            btn.removeEventListener('click', this.handleAddToCart);
            btn.addEventListener('click', (e) => {
                this.handleAddToCart(e);
            });
        });

        // Modal close
        if (this.modal) {
            document.querySelector('.modal-close')?.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Tab switching
        document.querySelectorAll('.order-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab);
            });
        });

        // Payment method change
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePaymentChange(e.target.value);
            });
        });

        // Checkout button
        document.querySelector('.checkout-btn')?.addEventListener('click', () => {
            this.checkout();
        });

        // Clear cart
        document.querySelector('.clear-cart')?.addEventListener('click', () => {
            this.clearCart();
        });

        // Track order
        document.querySelector('.track-btn')?.addEventListener('click', () => {
            this.trackOrder();
        });

        // Close success modal
        document.querySelector('.close-success')?.addEventListener('click', () => {
            if (this.successModal) {
                this.successModal.classList.remove('active');
            }
        });

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (this.modal && e.target === this.modal) {
                this.closeModal();
            }
            if (this.successModal && e.target === this.successModal) {
                this.successModal.classList.remove('active');
            }
        });
    }

    handleAddToCart(e) {
        const button = e.currentTarget;
        const menuItem = button.closest('.menu-item');
        if (menuItem) {
            this.addToCart(menuItem);
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update tab content
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const activeTab = document.getElementById(tabId + 'Tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    addToCart(menuItem) {
        // Check if item already in cart
        const itemName = menuItem.querySelector('h3')?.textContent || 'Food Item';
        const existingItem = this.cart.find(item => item.name === itemName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const item = {
                id: Date.now() + Math.random(),
                name: itemName,
                price: parseFloat(menuItem.querySelector('.price')?.textContent?.replace('$', '') || 8.99),
                image: menuItem.querySelector('img')?.src || 'img/food-placeholder.jpg',
                quantity: 1
            };
            this.cart.push(item);
        }
        
        this.saveToStorage();
        this.renderCart();
        this.updateCartCount();
        
        // Show notification
        this.showNotification(`${itemName} added to cart!`);
        
        // Animate button
        const originalText = menuItem.querySelector('.add-to-cart')?.innerHTML;
        const btn = menuItem.querySelector('.add-to-cart');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.innerHTML = originalText || '<i class="fas fa-plus"></i> Add';
                btn.style.background = 'var(--primary-color)';
            }, 2000);
        }
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            if (el) el.textContent = count;
        });
    }

    renderCart() {
        const cartContainer = document.querySelector('.cart-items');
        if (!cartContainer) return;
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <button class="btn-primary" onclick="window.orderSystem.closeModal()">Browse Menu</button>
                </div>
            `;
            this.updateSummary(0);
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='img/food-placeholder.jpg'">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" onclick="window.orderSystem.updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="window.orderSystem.updateQuantity(${index}, 1)">+</button>
                    </div>
                    <i class="fas fa-trash remove-item" onclick="window.orderSystem.removeItem(${index})"></i>
                </div>
            `;
        });
        
        cartContainer.innerHTML = html;
        this.updateSummary(subtotal);
    }

    // Rest of the methods remain the same...
    updateSummary(subtotal) {
        const deliveryFee = 2.00;
        const tax = subtotal * 0.1;
        const total = subtotal + deliveryFee + tax;
        
        const subtotalEl = document.querySelector('.subtotal');
        const deliveryEl = document.querySelector('.delivery-fee');
        const taxEl = document.querySelector('.tax');
        const totalEl = document.querySelector('.total-amount');
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (deliveryEl) deliveryEl.textContent = `$${deliveryFee.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }

    updateQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity += change;
            if (this.cart[index].quantity <= 0) {
                this.removeItem(index);
            } else {
                this.saveToStorage();
                this.renderCart();
                this.updateCartCount();
            }
        }
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveToStorage();
        this.renderCart();
        this.updateCartCount();
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveToStorage();
            this.renderCart();
            this.updateCartCount();
        }
    }

    handlePaymentChange(method) {
        const cardForm = document.getElementById('cardPaymentForm');
        const mobileForm = document.getElementById('mobilePaymentForm');
        
        if (cardForm) cardForm.style.display = method === 'card' ? 'block' : 'none';
        if (mobileForm) mobileForm.style.display = (method === 'easypaisa' || method === 'jazzcash') ? 'block' : 'none';
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        // Validate payment forms
        if (paymentMethod === 'card') {
            if (!this.validateCardForm()) return;
        } else if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
            if (!this.validateMobileForm()) return;
        }
        
        // Create order
        const order = {
            id: '#ORD' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            date: new Date().toLocaleString(),
            items: [...this.cart],
            subtotal: parseFloat(document.querySelector('.subtotal')?.textContent.replace('$', '') || 0),
            deliveryFee: 2.00,
            tax: parseFloat(document.querySelector('.tax')?.textContent.replace('$', '') || 0),
            total: parseFloat(document.querySelector('.total-amount')?.textContent.replace('$', '') || 0),
            paymentMethod: paymentMethod,
            status: 'pending',
            estimatedDelivery: new Date(Date.now() + 45 * 60000).toLocaleTimeString()
        };
        
        // Add to orders
        this.orders.unshift(order);
        this.saveToStorage();
        
        // Clear cart
        this.cart = [];
        this.renderCart();
        this.updateCartCount();
        
        // Show success modal
        const orderIdDisplay = document.getElementById('orderIdDisplay');
        if (orderIdDisplay) orderIdDisplay.textContent = order.id;
        if (this.successModal) this.successModal.classList.add('active');
        this.closeModal();
        
        // Render updated history
        this.renderOrderHistory();
    }

    validateCardForm() {
        const cardInputs = document.querySelectorAll('.card-input');
        let valid = true;
        
        cardInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff4757';
                valid = false;
            } else {
                input.style.borderColor = '#e1e1e1';
            }
        });
        
        if (!valid) {
            alert('Please fill all card details');
        }
        
        return valid;
    }

    validateMobileForm() {
        const mobileInputs = document.querySelectorAll('.mobile-input');
        let valid = true;
        
        mobileInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff4757';
                valid = false;
            } else {
                input.style.borderColor = '#e1e1e1';
            }
        });
        
        if (!valid) {
            alert('Please fill all mobile account details');
        }
        
        return valid;
    }

    renderOrderHistory() {
        const historyContainer = document.querySelector('.order-history-list');
        if (!historyContainer) return;
        
        if (this.orders.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-history"></i>
                    <p>No orders yet</p>
                    <button class="btn-primary" onclick="window.orderSystem.switchTab(document.querySelector('[data-tab=\"cart\"]'))">Start Shopping</button>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.orders.forEach(order => {
            const statusClass = this.getStatusClass(order.status);
            
            html += `
                <div class="order-history-item" onclick="window.orderSystem.viewOrderDetails('${order.id}')">
                    <div class="order-header">
                        <span class="order-id">${order.id}</span>
                        <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
                    </div>
                    <div class="order-details">
                        <div>
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${order.date}</span>
                        </div>
                        <div>
                            <span class="detail-label">Items:</span>
                            <span class="detail-value">${order.items.length}</span>
                        </div>
                        <div>
                            <span class="detail-label">Total:</span>
                            <span class="detail-value">$${order.total.toFixed(2)}</span>
                        </div>
                        <div>
                            <span class="detail-label">Est. Delivery:</span>
                            <span class="detail-value">${order.estimatedDelivery}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = html;
    }

    getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    }

    trackOrder() {
        const orderId = document.getElementById('orderId')?.value;
        if (!orderId) {
            alert('Please enter an Order ID');
            return;
        }
        
        const order = this.orders.find(o => o.id === orderId);
        const resultDiv = document.querySelector('.track-result');
        
        if (resultDiv) {
            if (order) {
                resultDiv.innerHTML = `
                    <h3>Order ${order.id}</h3>
                    <p>Status: <strong class="${this.getStatusClass(order.status)}">${order.status.toUpperCase()}</strong></p>
                    <p>Estimated Delivery: ${order.estimatedDelivery}</p>
                    <p>Payment Method: ${order.paymentMethod}</p>
                    <p>Total Amount: $${order.total.toFixed(2)}</p>
                `;
            } else {
                resultDiv.innerHTML = `
                    <p style="color: #ff4757;">Order not found! Please check your order ID.</p>
                `;
            }
        }
    }

    viewOrderDetails(orderId) {
        const trackTab = document.querySelector('[data-tab="track"]');
        if (trackTab) {
            this.switchTab(trackTab);
            const orderInput = document.getElementById('orderId');
            if (orderInput) {
                orderInput.value = orderId;
                this.trackOrder();
            }
        }
    }

    showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b35, #f7c35c);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('hotelSaileCart');
            const savedOrders = localStorage.getItem('hotelSaileOrders');
            
            this.cart = savedCart ? JSON.parse(savedCart) : [];
            this.orders = savedOrders ? JSON.parse(savedOrders) : [];
        } catch (e) {
            console.error('Error loading from storage:', e);
            this.cart = [];
            this.orders = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('hotelSaileCart', JSON.stringify(this.cart));
            localStorage.setItem('hotelSaileOrders', JSON.stringify(this.orders));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }
}

// Make orderSystem globally available
window.OrderSystem = OrderSystem;