# 💕 Wishlist của Má Phính

Một trang web wishlist xinh xắn để lưu trữ những món đồ yêu thích và địa điểm muốn đi!

## ✨ Tính năng

- ➕ Thêm món đồ, địa điểm, trải nghiệm vào wishlist
- 🏷️ Phân loại theo loại (món đồ, địa điểm, trải nghiệm, khác)
- 🔗 Thêm link tham khảo
- 📝 Ghi chú chi tiết
- ✅ Đánh dấu đã hoàn thành
- 🗑️ Xóa item
- 🌙 Dark mode
- 📱 Responsive - dùng tốt trên điện thoại
- 💾 Tự động lưu vào trình duyệt (LocalStorage)

## 🚀 Cách sử dụng

### Cách 1: Mở trực tiếp (đơn giản nhất)

1. Tải 3 file về máy:
   - `index.html`
   - `styles.css`
   - `script.js`

2. Đặt cả 3 file vào cùng một thư mục

3. Mở file `index.html` bằng trình duyệt (Chrome, Safari, Edge...)

### Cách 2: Deploy lên GitHub Pages (miễn phí)

1. Tạo repository mới trên GitHub

2. Upload 3 file lên repository

3. Vào Settings → Pages

4. Chọn branch (thường là `main`) và folder `/root`

5. Chờ vài phút, trang web sẽ có link dạng: `https://username.github.io/repository-name`

### Cách 3: Deploy lên Netlify (miễn phí)

1. Đăng ký tài khoản Netlify

2. Drag & drop thư mục chứa 3 file vào Netlify

3. Xong! Trang web sẽ live ngay lập tức

## 📱 Sử dụng trên điện thoại

- Deploy lên GitHub Pages hoặc Netlify
- Lưu link trang web vào màn hình chính (Add to Home Screen)
- Sử dụng như một app!

## 💾 Dữ liệu

- Dữ liệu được lưu trong LocalStorage của trình duyệt
- Mỗi trình duyệt/điện thoại sẽ có dữ liệu riêng
- **Lưu ý:** Nếu xóa cache trình duyệt, dữ liệu sẽ mất

## 🎨 Tùy chỉnh

### Đổi màu chủ đạo

Mở file `styles.css`, tìm phần `:root` và đổi màu:

```css
:root {
    --primary: #ff6b9d;  /* Màu chính - đổi ở đây */
    --primary-dark: #e84a7f;
    --secondary: #c44569;
    /* ... */
}
```

### Đổi tiêu đề

Mở file `index.html`, tìm và đổi:

```html
<h1>💕 Wishlist của em</h1>
<p class="subtitle">Những điều em muốn...</p>
```

## 🛠️ Công nghệ

- HTML5
- CSS3 (Flexbox, Grid, CSS Variables)
- Vanilla JavaScript (không cần framework)
- LocalStorage API

## 📝 License

Miễn phí sử dụng cho mục đích cá nhân! 💖

---

Made with ❤️ by alex
