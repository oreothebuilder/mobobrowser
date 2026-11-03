# 📱 MoboBrowser

**MoboBrowser** is a native Windows desktop mobile browser simulator designed for developers to test responsive websites, single-page applications (SPAs), and local development servers (`localhost:3000`, `localhost:5173`, etc.) with authentic physical device mockups, strict dimensions, and a built-in mobile Chrome experience.

---

## ✨ Features

- **📱 Authentic Smartphone Chassis:** Physical device bezels, side buttons, ear speaker slit, and real-time status bar (live clock, 5G, Wi-Fi, 100% full battery).
- **🔒 Non-Resizable Manually:** Locks dimensions and aspect ratios to the selected device profile (Google Pixel, Samsung Galaxy, iPhone).
- **🌐 Default Home Page:** Opens `https://www.google.com` by default on startup and for new tabs.
- **🔍 Smart Searchbar:**
  - Enter any link or localhost URL (e.g. `youtube.com`, `localhost:3000`, `127.0.0.1:5173`) to open it directly.
  - Enter any search query to automatically search on Google.
- **📑 Multi-Tab System:**
  - `+` button in top toolbar opens a new tab.
  - `[N]` tab counter badge displays open tab count.
  - Tab Switcher Overview displays all open tabs in a grid of preview cards with close buttons.
- **🔘 3-Button Android Navbar:**
  - ◀ **Back:** Navigates back in browser history.
  - ⚪ **Middle:** Returns to Home Screen (`google.com`).
  - ◽ **Other:** Opens the Opened Tabs Overview.
- **⚙️ Floating 3-Dots Menu (`⋮`):**
  - Click to open, click again to close.
  - Switch device profiles (Pixel 8/9 Pro, Galaxy S24 Ultra, iPhone 16 Pro, etc.).
  - Toggle 3-button navbar ON / OFF.
  - Toggle Fixed / Sticky mode (Always on Top).
  - Quick 1-click localhost ports (`:3000`, `:5173`, `:8080`, `:4200`, `:8000`).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/oreothebuilder/mobobrowser.git

# Navigate to the folder
cd mobobrowser

# Install dependencies
npm install

# Run the app in development mode
npm start
```

### Build Installable Windows App
```bash
# Build Windows Installer (NSIS Setup .exe)
npm run dist

# Build Standalone Portable Executable (.exe)
npm run portable

# Build both installer and portable
npm run build:all
```
The output binaries will be generated in the `dist/` directory.

---

## 📄 License
MIT License. Created by [oreothebuilder](https://github.com/oreothebuilder).
