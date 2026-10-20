# 🧪 Selenium Testing - Login Google

Automated testing untuk fitur Google Login menggunakan Selenium WebDriver.

## 📁 Struktur Folder

```
tests/
├── selenium/
│   ├── config.js              # Konfigurasi WebDriver
│   └── loginInternal.test.js  # Test cases untuk login internal
└── login_google.test.js       # Entry point
```

## 🚀 Cara Menjalankan

### Prerequisites

```bash
# Pastikan sudah install dependencies
npm install selenium-webdriver chromedriver
```

### 1. Pastikan Dev Server Berjalan

```bash
# Terminal 1: Backend
cd apps/backend
npm start

# Terminal 2: Frontend
cd apps/frontend/frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 2. Jalankan Test

**Opsi 1: Dengan GUI (buka browser)**

```bash
npm run test:login
```

**Opsi 2: Headless mode (tanpa GUI)**

```bash
npm run test:login:headless
```

**Opsi 3: Direct dengan Node**

```bash
node tests/login_google.test.js
```

## 📋 Test Cases

| #   | Test                            | Deskripsi                                         |
| --- | ------------------------------- | ------------------------------------------------- |
| 1   | testAccessLoginInternalPage     | Verifikasi halaman login bisa diakses             |
| 2   | testGoogleLoginButtonVisible    | Cek Google Login button ada dan visible           |
| 3   | testFormElementsPresent         | Verifikasi form elements (heading, dll)           |
| 4   | testUnauthorizedRedirectToLogin | Cek redirect dashboard ke login saat unauthorized |
| 5   | testGoogleLoginButtonClickable  | Test click Google Login button                    |

## 📊 Output Contoh

```
🚀 MEMULAI SELENIUM TESTS - LOGIN INTERNAL

============================================================
✅ Test 1: Halaman login internal bisa diakses

✅ Test 2: Google Login button visible

✅ Test 3: Login form heading ada

✅ Test 4: Unauthorized user di-redirect ke login page

✅ Test 5: Google Login button bisa diklik

============================================================

📊 HASIL TEST: 5 PASS, 0 FAIL

🔌 WebDriver closed
```

## 🔧 Konfigurasi

Edit `tests/selenium/config.js` untuk mengubah:

- **BASE_URL**: URL frontend (default: `http://localhost:5173`)
- **Chrome Options**: Headless mode, no-sandbox, dll

```javascript
// Uncomment untuk headless mode
options.addArguments("--headless");
```

## 🐛 Troubleshooting

### Error: ChromeDriver path not found

```bash
# Reinstall chromedriver
npm install chromedriver --save-dev
```

### Error: Connection refused (localhost:5173)

```bash
# Pastikan frontend dev server berjalan
cd apps/frontend/frontend
npm run dev
```

### Error: Element not found

- Tunggu lebih lama: Update `driver.sleep(2000)` menjadi `driver.sleep(5000)`
- Update XPath selector di test

## 💡 Tips

- Tambah test case: Copy function template dan sesuaikan
- Debug: Uncomment headless mode untuk lihat browser activity
- Screenshot: Gunakan `driver.takeScreenshot()` untuk debug

## 📚 Referensi

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [ChromeDriver](https://chromedriver.chromium.org/)
