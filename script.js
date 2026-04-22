// Wishlist App with Supabase
class WishlistApp {
    constructor() {
        this.items = [];
        this.currentFilter = 'all';
        this.currentRandomItem = null;
        this.currentUser = null;
        this.unsubscribeChannel = null;

        // Supabase config
        this.supabaseUrl = 'https://gssoefbsebholdgwtrhg.supabase.co';
        this.supabaseKey = 'sb_publishable_5NufQ0jVdrfmkJOs4w_fGg_i-oXvZE-';
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);

        // Tài khoản mặc định của bạn
        this.defaultGuestAccount = {
            username: 'ngobao2004',
            password: 'chongalec',
            role: 'guest'
        };

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

        // Register
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Show/Hide screens
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        if (showRegister) showRegister.addEventListener('click', (e) => { e.preventDefault(); this.showRegisterScreen(); });
        if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); this.showLoginScreen(); });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
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

    // ===== AUTH / USER =====
    async initAuth() {
        // Kiểm tra session local
        const savedUser = localStorage.getItem('wishlist_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
            this.applyRolePermissions();
            await this.loadWishlist();
            this.setupRealtimeSync();
        } else {
            this.showLoginScreen();
        }
    }

    getUsers() {
        const users = localStorage.getItem('wishlist_users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers(users) {
        localStorage.setItem('wishlist_users', JSON.stringify(users));
    }

    async login() {
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Kiểm tra tài khoản mặc định của bạn
        if (username === this.defaultGuestAccount.username && password === this.defaultGuestAccount.password) {
            this.currentUser = { ...this.defaultGuestAccount };
            this.currentUser.role = 'guest';
            this.currentUser.displayName = 'Người tặng quà';
        } else {
            // Kiểm tra tài khoản đã đăng ký (local)
            const users = this.getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (!user) {
                alert('Tên đăng nhập hoặc mật khẩu không đúng!');
                return;
            }

            this.currentUser = { ...user };
            this.currentUser.role = 'owner';
            this.currentUser.displayName = user.username;
        }

        localStorage.setItem('wishlist_current_user', JSON.stringify(this.currentUser));
        this.showMainApp();
        this.applyRolePermissions();
        await this.loadWishlist();
        this.setupRealtimeSync();
        this.showNotification(`Xin chào, ${this.currentUser.displayName}! 💖`);

        usernameInput.value = '';
        passwordInput.value = '';
    }

    register() {
        const usernameInput = document.getElementById('regUsername');
        const passwordInput = document.getElementById('regPassword');
        const confirmPasswordInput = document.getElementById('regConfirmPassword');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validate
        if (username.length < 3) {
            alert('Tên đăng nhập cần ít nhất 3 ký tự!');
            return;
        }

        if (password.length < 4) {
            alert('Mật khẩu cần ít nhất 4 ký tự!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Kiểm tra trùng username
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            alert('Tên đăng nhập đã tồn tại!');
            return;
        }

        // Không cho đăng ký trùng với tài khoản mặc định
        if (username === this.defaultGuestAccount.username) {
            alert('Tên đăng nhập này đã được sử dụng!');
            return;
        }

        // Tạo user mới
        const newUser = {
            username,
            password,
            role: 'owner',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        alert('Đăng ký thành công! Hãy đăng nhập ngay.');
        this.showLoginScreen();

        usernameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    }

    logout() {
        localStorage.removeItem('wishlist_current_user');
        this.currentUser = null;
        this.closeRandomModal();
        this.showLoginScreen();

        // Cleanup realtime subscription
        if (this.unsubscribeChannel) {
            this.supabase.removeChannel(this.unsubscribeChannel);
            this.unsubscribeChannel = null;
        }
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const mainApp = document.getElementById('mainApp');
        if (loginScreen) loginScreen.style.display = 'flex';
        if (registerScreen) registerScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'none';
        document.body.removeAttribute('data-role');
    }

    showRegisterScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'flex';
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const mainApp = document.getElementById('mainApp');
        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    }

    applyRolePermissions() {
        document.body.setAttribute('data-role', this.currentUser.role);

        const modeBadge = document.getElementById('modeBadge');
        if (modeBadge) {
            modeBadge.textContent = this.currentUser.role === 'owner'
                ? '🔓 Chế độ chỉnh sửa'
                : '🔒 Chế độ xem';
        }
    }

    isOwner() {
        return this.currentUser && this.currentUser.role === 'owner';
    }

    // ===== WISHLIST (SUPABASE) =====
    async loadWishlist() {
        try {
            const { data, error } = await this.supabase
                .from('wishlists')
                .select('items')
                .eq('id', 1)
                .single();

            if (error) {
                // Nếu chưa có row, tạo mới
                if (error.code === 'PGRST116') {
                    await this.createInitialWishlist();
                    this.items = [];
                } else {
                    throw error;
                }
            } else {
                this.items = data.items || [];
            }

            this.render();
        } catch (error) {
            console.error('Error loading wishlist:', error);
            // fallback localStorage
            const saved = localStorage.getItem('wishlist_items');
            this.items = saved ? JSON.parse(saved) : [];
            this.render();
            this.showNotification('Đang dùng dữ liệu local (chưa kết nối cloud)');
        }
    }

    async createInitialWishlist() {
        const { error } = await this.supabase
            .from('wishlists')
            .insert({ id: 1, items: [] });

        if (error) {
            console.error('Error creating initial wishlist:', error);
        }
    }

    setupRealtimeSync() {
        // Cleanup old channel
        if (this.unsubscribeChannel) {
            this.supabase.removeChannel(this.unsubscribeChannel);
        }

        this.unsubscribeChannel = this.supabase
            .channel('wishlist_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'wishlists',
                    filter: 'id=eq.1'
                },
                (payload) => {
                    this.items = payload.new.items || [];
                    this.render();
                    this.showNotification('Dữ liệu đã sync! 🔄');
                }
            )
            .subscribe();
    }

    async saveWishlistToCloud() {
        try {
            const { error } = await this.supabase
                .from('wishlists')
                .upsert({ id: 1, items: this.items }, { onConflict: 'id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving to cloud:', error);
            // fallback localStorage
            localStorage.setItem('wishlist_items', JSON.stringify(this.items));
        }
    }

    async addItem() {
        if (!this.isOwner()) {
            alert('Bạn không có quyền thêm món mới.');
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

        const newItem = {
            id: Date.now().toString(),
            name,
            type,
            link,
            note,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.items.unshift(newItem);
        await this.saveWishlistToCloud();
        this.render();

        document.getElementById('wishlistForm').reset();
        this.showNotification('Đã thêm vào wishlist! 💖');
    }

    async deleteItem(id) {
        if (!this.isOwner()) {
            alert('Bạn không có quyền xóa món.');
            return;
        }

        if (!confirm('Bạn có chắc muốn xóa món này không?')) {
            return;
        }

        this.items = this.items.filter(item => item.id !== id);
        await this.saveWishlistToCloud();
        this.render();
        this.showNotification('Đã xóa! 🗑️');
    }

    async toggleComplete(id) {
        if (!this.isOwner()) {
            alert('Bạn không có quyền đánh dấu hoàn thành.');
            return;
        }

        const item = this.items.find(item => item.id === id);
        if (item) {
            item.completed = !item.completed;
            await this.saveWishlistToCloud();
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
                    <button class="btn-action btn-complete" onclick="app.toggleComplete('${item.id}')">
                        ${item.completed ? '↩️ Bỏ đánh dấu' : '✅ Đã hoàn thành'}
                    </button>
                    <button class="btn-action btn-delete" onclick="app.deleteItem('${item.id}')">
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

        // Guest chỉ xem random, không cần nút "chọn món này"
        if (randomConfirm) {
            randomConfirm.style.display = this.currentUser.role === 'guest' ? 'none' : 'inline-block';
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
