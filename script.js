// Wishlist App
class WishlistApp {
    constructor() {
        this.items = this.loadItems();
        this.currentFilter = 'all';
        this.currentRandomItem = null;
        this.currentRole = null;

        // Lưu ý: đây chỉ là bảo vệ UI phía client, không phải bảo mật backend thực sự
        this.defaultHusbandPassword = 'chong';
        this.defaultWifePassword = 'thao123';

        this.init();
    }

    init() {
        this.bindEvents();
        this.initTheme();
        this.initAuth();
    }

    bindEvents() {
        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Change wife password
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const changePasswordClose = document.getElementById('changePasswordClose');
        const changePasswordForm = document.getElementById('changePasswordForm');
        const changePasswordModal = document.getElementById('changePasswordModal');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.openChangePasswordModal());
        }

        if (changePasswordClose) {
            changePasswordClose.addEventListener('click', () => this.closeChangePasswordModal());
        }

        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changeWifePassword();
            });
        }

        if (changePasswordModal) {
            changePasswordModal.addEventListener('click', (e) => {
                if (e.target.id === 'changePasswordModal') this.closeChangePasswordModal();
            });
        }

        // Form submission
        const wishlistForm = document.getElementById('wishlistForm');
        if (wishlistForm) {
            wishlistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addItem();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Random gift button
        const randomBtn = document.getElementById('randomBtn');
        const modalClose = document.getElementById('modalClose');
        const randomAgain = document.getElementById('randomAgain');
        const randomConfirm = document.getElementById('randomConfirm');
        const randomModal = document.getElementById('randomModal');

        if (randomBtn) randomBtn.addEventListener('click', () => this.pickRandomItem());
        if (modalClose) modalClose.addEventListener('click', () => this.closeRandomModal());
        if (randomAgain) randomAgain.addEventListener('click', () => this.pickRandomItem());
        if (randomConfirm) randomConfirm.addEventListener('click', () => this.confirmRandomSelection());
        if (randomModal) {
            randomModal.addEventListener('click', (e) => {
                if (e.target.id === 'randomModal') this.closeRandomModal();
            });
        }
    }

    // ===== AUTH / ROLE =====
    initAuth() {
        const savedRole = localStorage.getItem('wishlist_role');
        if (savedRole === 'wife' || savedRole === 'husband') {
            this.currentRole = savedRole;
            this.showMainApp();
            this.applyRolePermissions();
            this.render();
        } else {
            this.showLoginScreen();
        }
    }

    login() {
        const input = document.getElementById('password');
        const password = input.value;

        const wifePassword = this.getWifePassword();
        const husbandPassword = this.defaultHusbandPassword;

        if (password === wifePassword) {
            this.currentRole = 'wife';
        } else if (password === husbandPassword) {
            this.currentRole = 'husband';
        } else {
            alert('Sai mật khẩu, thử lại nhé!');
            return;
        }

        localStorage.setItem('wishlist_role', this.currentRole);
        this.showMainApp();
        this.applyRolePermissions();
        this.render();
        this.showNotification(this.currentRole === 'wife' ? 'Đăng nhập chế độ Thảo 💖' : 'Đăng nhập chế độ chồng 🎁');
        input.value = '';
    }

    logout() {
        localStorage.removeItem('wishlist_role');
        this.currentRole = null;
        this.closeRandomModal();
        this.showLoginScreen();
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        document.body.removeAttribute('data-role');
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    }

    applyRolePermissions() {
        document.body.setAttribute('data-role', this.currentRole);

        const roleBadge = document.getElementById('roleBadge');
        if (roleBadge) {
            roleBadge.textContent = this.currentRole === 'wife'
                ? '👩 Chế độ Thảo: toàn quyền chỉnh sửa'
                : '👨 Chế độ chồng: chỉ xem + random quà';
        }
    }

    isWifeMode() {
        return this.currentRole === 'wife';
    }

    getWifePassword() {
        return localStorage.getItem('wishlist_wife_password') || this.defaultWifePassword;
    }

    openChangePasswordModal() {
        if (!this.isWifeMode()) return;
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.style.display = 'flex';
    }

    closeChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.style.display = 'none';

        const form = document.getElementById('changePasswordForm');
        if (form) form.reset();
    }

    changeWifePassword() {
        if (!this.isWifeMode()) return;

        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (currentPassword !== this.getWifePassword()) {
            alert('Mật khẩu hiện tại không đúng.');
            return;
        }

        if (newPassword.length < 4) {
            alert('Mật khẩu mới cần ít nhất 4 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (newPassword === this.defaultHusbandPassword) {
            alert('Không thể đặt trùng mật khẩu của chồng.');
            return;
        }

        localStorage.setItem('wishlist_wife_password', newPassword);
        this.closeChangePasswordModal();
        this.showNotification('Đổi mật khẩu thành công! 🔐');
    }

    // ===== WISHLIST =====
    addItem() {
        if (!this.isWifeMode()) {
            alert('Chỉ chế độ của Thảo mới được thêm/sửa wishlist.');
            return;
        }

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

        document.getElementById('wishlistForm').reset();
        this.showNotification('Đã thêm vào wishlist! 💖');
    }

    deleteItem(id) {
        if (!this.isWifeMode()) {
            alert('Chỉ chế độ của Thảo mới được xóa món.');
            return;
        }

        if (confirm('Bạn có chắc muốn xóa món này không?')) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveItems();
            this.render();
            this.showNotification('Đã xóa! 🗑️');
        }
    }

    toggleComplete(id) {
        if (!this.isWifeMode()) {
            alert('Chỉ chế độ của Thảo mới được đánh dấu hoàn thành.');
            return;
        }

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
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredItems() {
        if (this.currentFilter === 'all') return this.items;
        return this.items.filter(item => item.type === this.currentFilter);
    }

    render() {
        const wishlist = document.getElementById('wishlist');
        const emptyState = document.getElementById('emptyState');
        if (!wishlist || !emptyState) return;

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

    // ===== RANDOM =====
    pickRandomItem() {
        const availableItems = this.items.filter(item => !item.completed);

        if (availableItems.length === 0) {
            alert('Không có món nào để chọn! Hãy thêm món mới vào wishlist hoặc bỏ đánh dấu hoàn thành.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableItems.length);
        this.currentRandomItem = availableItems[randomIndex];
        this.showRandomModal();
    }

    showRandomModal() {
        const modal = document.getElementById('randomModal');
        const resultDiv = document.getElementById('randomResult');
        const randomConfirm = document.getElementById('randomConfirm');

        if (!modal || !resultDiv) return;

        const typeLabels = {
            item: '🎁 Món đồ',
            place: '🗺️ Địa điểm',
            experience: '✨ Trải nghiệm',
            other: '💭 Khác'
        };

        if (!this.currentRandomItem) {
            resultDiv.innerHTML = `
                <div class="random-empty">
                    <p>😢 Không có món nào để chọn!</p>
                    <p>Hãy thêm món mới vào wishlist nhé.</p>
                </div>
            `;
        } else {
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

        // Chồng chỉ xem random, không cần nút "chọn món này"
        if (randomConfirm) {
            randomConfirm.style.display = this.currentRole === 'husband' ? 'none' : 'inline-block';
        }

        modal.style.display = 'flex';
    }

    closeRandomModal() {
        const modal = document.getElementById('randomModal');
        if (modal) modal.style.display = 'none';
        this.currentRandomItem = null;
    }

    confirmRandomSelection() {
        if (!this.currentRandomItem) return;

        const selectedItem = this.currentRandomItem;
        this.highlightRandomItem(selectedItem.id);
        this.closeRandomModal();
        this.showNotification(`Đã chọn: ${selectedItem.name} 🎁`);

        setTimeout(() => {
            const itemElement = document.querySelector(`[data-id="${selectedItem.id}"]`);
            if (itemElement) {
                itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    highlightRandomItem(id) {
        document.querySelectorAll('.wishlist-item').forEach(item => {
            item.classList.remove('highlighted');
        });

        const itemElement = document.querySelector(`[data-id="${id}"]`);
        if (itemElement) {
            itemElement.classList.add('highlighted');
            setTimeout(() => itemElement.classList.remove('highlighted'), 1500);
        }
    }

    // ===== UTILS =====
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

        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize app
const app = new WishlistApp();
