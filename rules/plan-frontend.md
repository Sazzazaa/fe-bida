# Frontend Plan - Bida Management

## Tech Stack
- React 18 (Vite)
- React Router v6
- Axios (API calls)
- Socket.IO Client
- Recharts (bieu do doanh thu)
- CSS Modules hoac Tailwind CSS

## Team

| Member | Phan cong | Mo ta |
|---|---|---|
| **FE-1** | Auth + Layout + Routing | Dang nhap/ky, layout chung, protected routes, navigation |
| **FE-2** | Trang chu - So do ban | So do ban truc quan, modal actions, timer, order F&B, tinh tien |
| **FE-3** | Trang Admin | CRUD ban bi-da, CRUD F&B, Dashboard doanh thu |

---

## Project Structure

```
client/
├── src/
│   ├── components/              # Reusable components
│   │   ├── Layout/
│   │   │   ├── MainLayout.jsx   # Layout chinh (sidebar + header + content)
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── ProtectedRoute.jsx   # Redirect neu chua login
│   │   ├── AdminRoute.jsx       # Redirect neu khong phai admin
│   │   ├── Modal.jsx            # Modal component chung
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Table.jsx            # Data table component
│   │   └── Loading.jsx
│   ├── pages/
│   │   ├── Login.jsx            # FE-1
│   │   ├── Register.jsx         # FE-1
│   │   ├── Home.jsx             # FE-2 (so do ban)
│   │   ├── admin/
│   │   │   ├── TableManage.jsx  # FE-3
│   │   │   ├── FnbManage.jsx    # FE-3
│   │   │   └── Revenue.jsx      # FE-3
│   ├── services/
│   │   ├── api.js               # Axios instance (base URL, interceptor JWT)
│   │   ├── authService.js
│   │   ├── tableService.js
│   │   ├── sessionService.js
│   │   ├── fnbService.js
│   │   ├── orderService.js
│   │   └── revenueService.js
│   ├── context/
│   │   ├── AuthContext.jsx      # FE-1 (user state, login/logout)
│   │   └── SocketContext.jsx    # FE-1 (socket connection)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   └── formatTime.js
│   ├── App.jsx                  # FE-1 (routing)
│   ├── main.jsx
│   └── index.css
├── vite.config.js
└── package.json
```

---

## FE-1: Auth + Layout + Routing

### Phase 1: Project Setup
- [ ] Init Vite + React project
- [ ] Cai dependencies (react-router-dom, axios, socket.io-client)
- [ ] Setup Axios instance voi base URL, JWT interceptor (auto attach token, handle 401 refresh)
- [ ] Setup React Router (App.jsx)

### Phase 2: Auth
- [ ] AuthContext: luu user + token vao state + localStorage
- [ ] Login page: form username/password, goi authService.login(), redirect ve Home
- [ ] Register page: form dang ky, goi authService.register(), redirect ve Login
- [ ] ProtectedRoute component: check token, redirect ve /login neu chua dang nhap
- [ ] AdminRoute component: check role admin, redirect neu khong phai admin

### Phase 3: Layout
- [ ] MainLayout component: Sidebar (menu nav) + Header (user info, logout) + Content area
- [ ] Sidebar: link toi Home (So do ban), Admin pages (neu la admin)
- [ ] Header: hien ten user, nut logout
- [ ] Responsive sidebar (thu nho tren mobile)

### Phase 4: Socket + Shared Components
- [ ] SocketContext: ket noi socket khi login, ngat khi logout
- [ ] useSocket hook: subscribe/unsubscribe events
- [ ] Cac component dung chung: Modal, Button, Input, Loading, DataTable
- [ ] Utility functions: formatCurrency (VND), formatTime

---

## FE-2: Trang chu - So do ban (TRANG CHINH)

### Phase 1: So do ban
- [ ] Home page layout: grid hien thi cac ban bi-da
- [ ] Moi ban la 1 card/box: ten ban, loai ban, trang thai
- [ ] Mau sac theo trang thai:
  - Xanh la: `available` (trong)
  - Do: `playing` (dang choi)
  - Vang: `reserved` (dat truoc - optional)
  - Xam: `maintenance` (bao tri)
- [ ] Goi tableService.getAll() khi load trang
- [ ] Hien thi thoi gian dang choi tren card (neu status = playing)

### Phase 2: Real-time
- [ ] Lang nghe socket event `table:statusChange` -> cap nhat UI ngay
- [ ] Khi mo/dong ban -> UI tat ca nguoi deu thay doi

### Phase 3: Modal Actions (click vao ban)
- [ ] Click ban trong (available):
  - Hien modal xac nhan "Mo ban?"
  - Goi sessionService.startSession(tableId)
  - UI cap nhat trang thai -> playing

- [ ] Click ban dang choi (playing):
  - Hien modal chi tiet:
    - Thoi gian choi (timer chay real-time tren client)
    - Tien ban tam tinh = thoi gian x don gia
    - Danh sach F&B da order
    - Nut "Order F&B" -> mo form chon mon tu menu
    - Nut "Tinh tien" -> goi sessionService.endSession()

- [ ] Form Order F&B:
  - Hien danh sach menu (fnbService.getAll())
  - Chon mon + so luong
  - Goi orderService.create(sessionId, fnbItemId, quantity)
  - Cap nhat danh sach order trong modal

### Phase 4: Hoa don tinh tien
- [ ] Khi nhan "Tinh tien":
  - Goi API end session
  - Hien hoa don: thoi gian choi, tien ban, chi tiet F&B, tong tien
  - Nut "Xac nhan" -> dong modal, ban tro ve available

---

## FE-3: Trang Admin

### Phase 1: Quan ly Ban bi-da
- [ ] Trang TableManage: bang danh sach ban (DataTable)
- [ ] Cot: ten, loai, gia/gio, trang thai, actions (sua/xoa)
- [ ] Nut "Them ban" -> modal form (ten, loai, gia, vi tri)
- [ ] Nut "Sua" -> modal form pre-filled
- [ ] Nut "Xoa" -> confirm dialog -> goi API delete
- [ ] Validation form co ban

### Phase 2: Quan ly F&B
- [ ] Trang FnbManage: bang danh sach mon
- [ ] Cot: ten, danh muc, gia, trang thai (con/het), actions
- [ ] Nut "Them mon" -> modal form (ten, danh muc, gia, hinh anh URL)
- [ ] Nut "Sua" -> modal form pre-filled
- [ ] Nut "Xoa" -> confirm dialog
- [ ] Filter theo danh muc (nuoc/bia/snack)

### Phase 3: Dashboard Doanh thu
- [ ] Trang Revenue: 3 phan chinh
- [ ] Bieu do doanh thu theo ngay (line chart hoac bar chart - Recharts)
- [ ] Chon khoang thoi gian (date picker)
- [ ] Thong ke tong: tong doanh thu, so phien, trung binh/phien
- [ ] Top 5 ban duoc su dung nhieu nhat (bar chart hoac bang)
- [ ] Top 5 mon F&B ban chay nhat (bar chart hoac bang)

---

## Routing Map

| Path | Page | Auth | Role | Nguoi lam |
|---|---|---|---|---|
| `/login` | Login | No | - | FE-1 |
| `/register` | Register | No | - | FE-1 |
| `/` | Home (So do ban) | Yes | - | FE-2 |
| `/admin/tables` | Quan ly ban | Yes | Admin | FE-3 |
| `/admin/fnb` | Quan ly F&B | Yes | Admin | FE-3 |
| `/admin/revenue` | Doanh thu | Yes | Admin | FE-3 |

---

## Quy uoc chung

- Tat ca API call thong qua services/ (khong goi axios truc tiep trong component)
- Su dung AuthContext de check auth state
- Su dung SocketContext de subscribe real-time events
- Format tien: `xxx.xxx VND` (dung formatCurrency util)
- Format thoi gian: `HH:MM:SS` (dung formatTime util)
- Loading state cho moi API call
- Toast/notification khi thanh cong hoac loi
