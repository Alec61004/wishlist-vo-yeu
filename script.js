// Wishlist App
class WishlistApp {
    constructor() {
        this.items = this.loadItems();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.initTheme();
    }

    bindEvents() {
        // Form submission
        document.getElementById('wishlistForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Random gift button
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.pickRandomItem();
        });

        // Modal close button
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeRandomModal();
        });

        // Random again button
        document.getElementById('randomAgain').addEventListener('click', () => {
            this.pickRandomItem();
        });

        // Confirm random selection
        document.getElementById('randomConfirm').addEventListener('click', () => {
            this.confirmRandomSelection();
        });

        // Close modal when clicking outside
        document.getElementById('randomModal').addEventListener('click', (e) => {
            if (e.target.id === 'randomModal') {
                this.closeRandomModal();
            }
        });
    }

    addItem() {
        const name = document.getElementById('itemName').value.trim();
        const type = document.getElementById('itemType').value;
        const link = document.getElementById('itemLink').value.trim();
        const note = document.getElementById('itemNote').value.trim();

        if (!name) {
            alert('Vui lòng nhập tên món đồ hoặc địa điểm!');
            return;
        }

        const item = {
            id: Date.now(),
            name,
            type,
            link,
            note,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.items.unshift(item);
        this.saveItems();
        this.render();

        // Reset form
        document.getElementById('wishlistForm').reset();

        // Show success feedback
        this.showNotification('Đã thêm vào wishlist! 💖');
    }

    deleteItem(id) {
        if (confirm('Bạn có chắc muốn xóa món này không?')) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveItems();
            this.render();
            this.showNotification('Đã xóa! 🗑️');
        }
    }

    toggleComplete(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveItems();
            this.render();
            this.showNotification(item.completed ? 'Đã hoàn thành! 🎉' : 'Đã bỏ đánh dấu');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    getFilteredItems() {
        if (this.currentFilter === 'all') {
            return this.items;
        }
        return this.items.filter(item => item.type === this.currentFilter);
    }

    render() {
        const wishlist = document.getElementById('wishlist');
        const emptyState = document.getElementById('emptyState');
        const filteredItems = this.getFilteredItems();

        if (filteredItems.length === 0) {
            wishlist.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        wishlist.innerHTML = filteredItems.map(item => this.renderItem(item)).join('');
    }

    renderItem(item) {
        const typeLabels = {
            item: '🎁 Món đồ',
            place: '🗺️ Địa điểm',
            experience: '✨ Trải nghiệm',
            other: '💭 Khác'
        };

        const linkHtml = item.link 
            ? `<a href="${this.escapeHtml(item.link)}" target="_blank" class="item-link">🔗 Xem link</a>`
            : '';

        const noteHtml = item.note 
            ? `<div class="item-note">${this.escapeHtml(item.note)}</div>`
            : '';

        return `
            <div class="wishlist-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                <div class="item-header">
                    <span class="item-type ${item.type}">${typeLabels[item.type]}</span>
                </div>
                <div class="item-name">${this.escapeHtml(item.name)}</div>
                ${linkHtml}
                ${noteHtml}
                <div class="item-actions">
                    <button class="btn-action btn-complete" onclick="app.toggleComplete(${item.id})">
                        ${item.completed ? '↩️ Bỏ đánh dấu' : '✅ Đã hoàn thành'}
                    </button>
                    <button class="btn-action btn-delete" onclick="app.deleteItem(${item.id})">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveItems() {
        localStorage.setItem('wishlist_items', JSON.stringify(this.items));
    }

    loadItems() {
        const saved = localStorage.getItem('wishlist_items');
        return saved ? JSON.parse(saved) : [];
    }

    initTheme() {
        const savedTheme = localStorage.getItem('wishlist_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('wishlist_theme', newTheme);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
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
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Random Gift Methods
    pickRandomItem() {
        // Get only uncompleted items
        const availableItems = this.items.filter(item => !item.completed);
        
        if (availableItems.length === 0) {
            alert('Không có món nào để chọn! Hãy thêm món mới vào wishlist hoặc bỏ đánh dấu hoàn thành.');
            return;
        }

        // Random selection
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        this.currentRandomItem = availableItems[randomIndex];
        
        this.showRandomModal();
    }

    showRandomModal() {
        const modal = document.getElementById('randomModal');
        const resultDiv = document.getElementById('randomResult');
        
        if (!this.currentRandomItem) {
            resultDiv.innerHTML = `
                <div class="random-empty">
                    <p>😢 Không có món nào để chọn!</p>
                    <p>Hãy thêm món mới vào wishlist nhé.</p>
                </div>
            `;
        } else {
            const typeLabels = {
                item: '🎁 Món đồ',
                place: '🗺️ Địa điểm',
                experience: '✨ Trải nghiệm',
                other: '💭 Khác'
            };

            const linkHtml = this.currentRandomItem.link 
                ? `<a href="${this.escapeHtml(this.currentRandomItem.link)}" target="_blank" class="item-link">🔗 Xem link</a>`
                : '';

            const noteHtml = this.currentRandomItem.note 
                ? `<div class="item-note">${this.escapeHtml(this.currentRandomItem.note)}</div>`
                : '';

            resultDiv.innerHTML = `
                <div class="random-item">
                    <span class="item-type ${this.currentRandomItem.type}">${typeLabels[this.currentRandomItem.type]}</span>
                    <div class="item-name">${this.escapeHtml(this.currentRandomItem.name)}</div>
                    ${linkHtml}
                    ${noteHtml}
                </div>
            `;
        }

        modal.style.display = 'flex';
    }

    closeRandomModal() {
        document.getElementById('randomModal').style.display = 'none';
        this.currentRandomItem = null;
    }

    confirmRandomSelection() {
        if (this.currentRandomItem) {
            // Highlight the selected item in the list
            this.highlightRandomItem(this.currentRandomItem.id);
            
            // Close modal
            this.closeRandomModal();
            
            // Show notification
            this.showNotification(`Đã chọn: ${this.currentRandomItem.name} 🎁`);
            
            // Scroll to the highlighted item
            setTimeout(() => {
                const itemElement = document.querySelector(`[data-id="${this.currentRandomItem.id}"]`);
                if (itemElement) {
                    itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }

    highlightRandomItem(id) {
        // Remove highlight from all items
        document.querySelectorAll('.wishlist-item').forEach(item => {
            item.classList.remove('highlighted');
        });

        // Add highlight to selected item
        const itemElement = document.querySelector(`[data-id="${id}"]`);
        if (itemElement) {
            itemElement.classList.add('highlighted');
            
            // Remove highlight after animation
            setTimeout(() => {
                itemElement.classList.remove('highlighted');
            }, 1500);
        }
    }
}

// Initialize app
const app = new WishlistApp();
