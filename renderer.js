/**
 * Native Mobile Device Browser - Renderer Process
 * Multi-Tab Engine with Accurate Mobile Experience
 */

(function () {
  'use strict';

  const DEFAULT_HOME_URL = 'https://www.google.com';

  // Application State
  const state = {
    tabs: [], // Array of { id, url, title, webviewEl }
    activeTabId: null,
    tabCounter: 0,
    currentDevice: DEVICES[0], // Google Pixel 8 / 9 Pro default
    isLandscape: false,
    navbarEnabled: true,
    isAlwaysOnTop: false,
    isMenuOpen: false,
    isTabsOverviewOpen: false
  };

  // DOM Elements
  const el = {
    phoneFrame: document.getElementById('phoneFrame'),
    phoneChassis: document.getElementById('phoneChassis'),
    deviceScreen: document.getElementById('deviceScreen'),
    statusClock: document.getElementById('statusClock'),
    cameraLens: document.getElementById('cameraLens'),
    
    // Top Browser Toolbar
    btnHome: document.getElementById('btnHome'),
    omniboxWrapper: document.getElementById('omniboxWrapper'),
    omniboxInput: document.getElementById('omniboxInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    btnNewTab: document.getElementById('btnNewTab'),
    btnTabsCounter: document.getElementById('btnTabsCounter'),
    tabCountBadge: document.getElementById('tabCountBadge'),
    btnThreeDots: document.getElementById('btnThreeDots'),

    // Floating Settings Menu (3-dots)
    floatingSettingsMenu: document.getElementById('floatingSettingsMenu'),
    menuDeviceName: document.getElementById('menuDeviceName'),
    menuDeviceRes: document.getElementById('menuDeviceRes'),
    btnMinWin: document.getElementById('btnMinWin'),
    btnCloseWin: document.getElementById('btnCloseWin'),
    btnToggleNavbar: document.getElementById('btnToggleNavbar'),
    deviceSelector: document.getElementById('deviceSelector'),
    btnRotateDevice: document.getElementById('btnRotateDevice'),
    btnToggleFixed: document.getElementById('btnToggleFixed'),
    btnReloadTab: document.getElementById('btnReloadTab'),
    btnMenuDemo: document.getElementById('btnMenuDemo'),

    // Tab Overview / Switcher Screen
    tabsOverviewOverlay: document.getElementById('tabsOverviewOverlay'),
    toTabCount: document.getElementById('toTabCount'),
    btnOverviewNewTab: document.getElementById('btnOverviewNewTab'),
    btnCloseTabsOverview: document.getElementById('btnCloseTabsOverview'),
    tabsGrid: document.getElementById('tabsGrid'),

    // Webviews Container & Progress Loader
    webviewsContainer: document.getElementById('webviewsContainer'),
    pageLoader: document.getElementById('pageLoader'),

    // Bottom 3-Button Navbar
    androidNavbar: document.getElementById('androidNavbar'),
    btnNavBack: document.getElementById('btnNavBack'),
    btnNavHome: document.getElementById('btnNavHome'),
    btnNavRecents: document.getElementById('btnNavRecents'),
    gestureBar: document.getElementById('gestureBar'),
    tactileToast: document.getElementById('tactileToast')
  };

  // =====================================================================
  // INITIALIZATION
  // =====================================================================
  function init() {
    populateDeviceSelector();
    applyDevice(state.currentDevice);
    updateClock();
    setInterval(updateClock, 10000); // Live real-time clock
    bindEvents();

    // Listen to Always on Top changes from main process
    if (window.electronAPI) {
      window.electronAPI.onAlwaysOnTopChanged((isTop) => {
        state.isAlwaysOnTop = isTop;
        updateFixedButtonUI();
      });

      // Handle popup windows from webview
      window.electronAPI.onOpenNewTabUrl((newUrl) => {
        createNewTab(newUrl);
      });
    }

    // Launch with Google by default
    createNewTab(DEFAULT_HOME_URL);
  }

  // =====================================================================
  // 1. MULTI-TAB ENGINE
  // =====================================================================
  function createNewTab(targetUrl = DEFAULT_HOME_URL) {
    state.tabCounter++;
    const tabId = 'tab_' + state.tabCounter;

    // Create the native webview DOM element
    const webview = document.createElement('webview');
    webview.id = 'wv_' + tabId;
    webview.setAttribute('src', targetUrl);
    webview.setAttribute('allowpopups', 'true');
    webview.className = 'inactive-tab';

    // Set mobile user agent declaratively
    if (state.currentDevice && state.currentDevice.userAgent) {
      webview.setAttribute('useragent', state.currentDevice.userAgent);
    }

    const tabObj = {
      id: tabId,
      url: targetUrl,
      title: 'Google',
      webviewEl: webview
    };

    // Append to DOM FIRST so Chromium registers and starts the guest instance
    el.webviewsContainer.appendChild(webview);

    // Attach lifecycle listeners
    attachWebviewEvents(tabObj);

    state.tabs.push(tabObj);

    // Switch to this new tab immediately
    switchTab(tabId);
    updateTabBadge();

    // Close overlays if open
    closeTabsOverview();
    closeFloatingMenu();

    return tabObj;
  }

  function switchTab(tabId) {
    const target = state.tabs.find(t => t.id === tabId);
    if (!target) return;

    state.activeTabId = tabId;

    // Toggle active/inactive class on webviews
    state.tabs.forEach(t => {
      if (t.id === tabId) {
        t.webviewEl.className = 'active-tab';
      } else {
        t.webviewEl.className = 'inactive-tab';
      }
    });

    // Update omnibox text with active tab's URL
    try {
      const currentUrl = target.webviewEl.getURL() || target.url;
      updateOmniboxDisplay(currentUrl);
    } catch (e) {
      updateOmniboxDisplay(target.url);
    }

    updateTabBadge();
  }

  function closeTab(tabId, e) {
    if (e) e.stopPropagation();

    const index = state.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    const tabObj = state.tabs[index];

    // Remove webview from DOM
    if (tabObj.webviewEl && tabObj.webviewEl.parentNode) {
      tabObj.webviewEl.parentNode.removeChild(tabObj.webviewEl);
    }

    state.tabs.splice(index, 1);

    // If closed the active tab, switch to another or create fresh home tab
    if (state.activeTabId === tabId) {
      if (state.tabs.length > 0) {
        const nextTab = state.tabs[Math.max(0, index - 1)];
        switchTab(nextTab.id);
      } else {
        createNewTab(DEFAULT_HOME_URL);
      }
    }

    updateTabBadge();
    if (state.isTabsOverviewOpen) {
      renderTabsOverviewGrid();
    }
  }

  function getActiveTab() {
    return state.tabs.find(t => t.id === state.activeTabId);
  }

  function updateTabBadge() {
    const count = state.tabs.length;
    el.tabCountBadge.innerText = count;
    el.toTabCount.innerText = `${count} ${count === 1 ? 'Tab' : 'Tabs'}`;
  }

  function attachWebviewEvents(tab) {
    const wv = tab.webviewEl;

    wv.addEventListener('did-start-loading', () => {
      if (tab.id === state.activeTabId) {
        el.pageLoader.style.display = 'block';
      }
    });

    wv.addEventListener('did-stop-loading', () => {
      if (tab.id === state.activeTabId) {
        el.pageLoader.style.display = 'none';
      }
      try {
        const currentUrl = wv.getURL();
        if (currentUrl && currentUrl !== 'about:blank') {
          tab.url = currentUrl;
          tab.title = wv.getTitle() || currentUrl;
          if (tab.id === state.activeTabId) {
            updateOmniboxDisplay(currentUrl);
          }
        }
      } catch (e) {}
    });

    wv.addEventListener('page-title-updated', (e) => {
      tab.title = e.title || tab.url;
      if (state.isTabsOverviewOpen) {
        renderTabsOverviewGrid();
      }
    });

    wv.addEventListener('did-navigate', (e) => {
      tab.url = e.url;
      if (tab.id === state.activeTabId) {
        updateOmniboxDisplay(e.url);
      }
    });

    wv.addEventListener('did-navigate-in-page', (e) => {
      tab.url = e.url;
      if (tab.id === state.activeTabId) {
        updateOmniboxDisplay(e.url);
      }
    });

    wv.addEventListener('did-fail-load', (e) => {
      if (tab.id === state.activeTabId) {
        el.pageLoader.style.display = 'none';
        if (e.errorCode !== -3) { // Ignore aborted loads
          showToast(`Failed to load: ${e.errorDescription}`);
        }
      }
    });
  }

  // =====================================================================
  // 2. SEARCH & URL RESOLUTION (REQUIREMENT 4)
  // - If link: open the link
  // - If search query: search it up on Google
  // =====================================================================
  function updateOmniboxDisplay(url) {
    if (!url) return;
    el.omniboxInput.value = url;
    el.btnClearSearch.style.display = url ? 'block' : 'none';
  }

  function resolveSearchOrUrl(rawInput) {
    const query = rawInput.trim();
    if (!query) return DEFAULT_HOME_URL;

    // 1. Localhost or 127.0.0.1 (e.g. localhost:3000, 127.0.0.1:5173, localhost:8080/dashboard)
    if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(query)) {
      return 'http://' + query;
    }

    // 2. Already starts with protocol (http:// or https://)
    if (/^https?:\/\//i.test(query)) {
      return query;
    }

    // 3. Contains spaces -> definitely a search query
    if (/\s/.test(query)) {
      return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    // 4. Looks like a link / domain with a dot and valid TLD (e.g. youtube.com, github.com/user, vite.dev)
    if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(query)) {
      return 'https://' + query;
    }

    // 5. Anything else -> Search it up on Google
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  function navigateActiveTab(targetInput) {
    const finalUrl = resolveSearchOrUrl(targetInput);
    const activeTab = getActiveTab();
    if (activeTab && activeTab.webviewEl) {
      activeTab.url = finalUrl;
      updateOmniboxDisplay(finalUrl);
      activeTab.webviewEl.loadURL(finalUrl);
    }
    closeFloatingMenu();
    closeTabsOverview();
  }

  // =====================================================================
  // 3. FLOATING 3-DOTS SETTINGS MENU
  // (Clicking 3 dots opens menu, clicking again closes menu)
  // =====================================================================
  function toggleFloatingMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    if (state.isMenuOpen) {
      closeTabsOverview();
      el.floatingSettingsMenu.style.display = 'flex';
      el.btnThreeDots.classList.add('active');
    } else {
      closeFloatingMenu();
    }
  }

  function closeFloatingMenu() {
    state.isMenuOpen = false;
    el.floatingSettingsMenu.style.display = 'none';
    el.btnThreeDots.classList.remove('active');
  }

  // =====================================================================
  // 4. TAB OVERVIEW / SWITCHER SCREEN
  // (Opened by [N] badge OR bottom right ◽ button)
  // =====================================================================
  function toggleTabsOverview() {
    state.isTabsOverviewOpen = !state.isTabsOverviewOpen;
    if (state.isTabsOverviewOpen) {
      closeFloatingMenu();
      renderTabsOverviewGrid();
      el.tabsOverviewOverlay.style.display = 'flex';
    } else {
      closeTabsOverview();
    }
  }

  function closeTabsOverview() {
    state.isTabsOverviewOpen = false;
    el.tabsOverviewOverlay.style.display = 'none';
  }

  function renderTabsOverviewGrid() {
    el.tabsGrid.innerHTML = '';
    state.tabs.forEach(tab => {
      const card = document.createElement('div');
      card.className = `tab-card ${tab.id === state.activeTabId ? 'active' : ''}`;
      
      const title = tab.title || 'New Tab';
      const urlText = tab.url || 'google.com';

      card.innerHTML = `
        <div class="tab-card-header">
          <span class="tab-card-title" title="${title}">${title}</span>
          <button class="tab-card-close" title="Close Tab">✕</button>
        </div>
        <div class="tab-card-preview">
          <span>${urlText}</span>
        </div>
      `;

      // Click card to switch to this tab
      card.addEventListener('click', () => {
        switchTab(tab.id);
        closeTabsOverview();
      });

      // Close button on card
      const closeBtn = card.querySelector('.tab-card-close');
      closeBtn.addEventListener('click', (e) => closeTab(tab.id, e));

      el.tabsGrid.appendChild(card);
    });
  }

  // =====================================================================
  // 5. BOTTOM 3-BUTTON NAVBAR (USER REQUIREMENTS)
  // - 1. Middle button: Return to Home Screen (Google)
  // - 2. Back button: Navigates back in history
  // - 3. Other button: View currently opened tabs
  // =====================================================================
  function handleHomeButtonAction() {
    createRipple(el.btnNavHome);
    closeTabsOverview();
    closeFloatingMenu();
    navigateActiveTab(DEFAULT_HOME_URL);
    showToast('Returned to Home (Google)');
  }

  function handleBackButtonAction() {
    createRipple(el.btnNavBack);
    closeFloatingMenu();
    if (state.isTabsOverviewOpen) {
      closeTabsOverview();
      return;
    }
    const active = getActiveTab();
    if (active && active.webviewEl) {
      if (active.webviewEl.canGoBack()) {
        active.webviewEl.goBack();
      } else {
        showToast('At start of history');
      }
    }
  }

  function handleRecentsButtonAction() {
    createRipple(el.btnNavRecents);
    toggleTabsOverview();
  }

  function toggleNavbar() {
    state.navbarEnabled = !state.navbarEnabled;
    if (state.navbarEnabled) {
      el.androidNavbar.style.display = 'flex';
      el.gestureBar.style.display = 'none';
      el.btnToggleNavbar.classList.add('active');
      el.btnToggleNavbar.querySelector('.fswitch-text').innerText = 'ON';
    } else {
      el.androidNavbar.style.display = 'none';
      el.gestureBar.style.display = 'flex';
      el.btnToggleNavbar.classList.remove('active');
      el.btnToggleNavbar.querySelector('.fswitch-text').innerText = 'OFF';
    }
  }

  function createRipple(button) {
    const ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  }

  let toastTimer = null;
  function showToast(msg) {
    el.tactileToast.innerText = msg;
    el.tactileToast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.tactileToast.style.display = 'none';
    }, 1800);
  }

  // =====================================================================
  // 6. DEVICE ADAPTATION (STRICTLY NON-RESIZABLE MANUALLY)
  // =====================================================================
  function populateDeviceSelector() {
    el.deviceSelector.innerHTML = '';
    DEVICES.forEach(dev => {
      const opt = document.createElement('option');
      opt.value = dev.id;
      opt.innerText = `${dev.name} (${dev.width}×${dev.height})`;
      el.deviceSelector.appendChild(opt);
    });
  }

  function applyDevice(device) {
    state.currentDevice = device;

    let width = device.width;
    let height = device.height;

    if (state.isLandscape) {
      const temp = width;
      width = height;
      height = temp;
    }

    const bezel = device.bezel || 12;
    const cornerRadius = device.borderRadius || 44;

    // Window dimensions (screen + bezels + exterior button padding)
    const windowWidth = width + bezel * 2 + 20;
    const windowHeight = height + bezel * 2 + 20;

    // Request Electron resize
    if (window.electronAPI) {
      window.electronAPI.resizeWindow(windowWidth, windowHeight);
    }

    // Apply Chassis Bezel & Roundness
    el.phoneChassis.style.padding = `${bezel}px`;
    el.phoneChassis.style.borderRadius = `${cornerRadius}px`;
    el.deviceScreen.style.borderRadius = `${Math.max(16, cornerRadius - bezel + 2)}px`;

    // Camera Cutout
    updateCameraCutout(device.cutout);

    // Update Floating Menu Labels
    el.menuDeviceName.innerText = device.name;
    el.menuDeviceRes.innerText = `${width} × ${height}`;
    el.deviceSelector.value = device.id;

    // Update User-Agent on all webviews
    state.tabs.forEach(t => {
      if (t.webviewEl && device.userAgent) {
        try {
          t.webviewEl.setUserAgent(device.userAgent);
        } catch (e) {
          t.webviewEl.setAttribute('useragent', device.userAgent);
        }
      }
    });
  }

  function updateCameraCutout(cutout) {
    el.cameraLens.className = 'camera-lens';
    if (cutout === 'dynamic-island') {
      el.cameraLens.classList.add('dynamic-island');
    } else if (cutout === 'notch') {
      el.cameraLens.classList.add('notch');
    } else if (cutout === 'classic' || cutout === 'none') {
      el.cameraLens.style.display = 'none';
      return;
    } else {
      el.cameraLens.classList.add('punch-hole');
    }
    el.cameraLens.style.display = 'flex';
  }

  // =====================================================================
  // 7. FIXED ON OR OFF (STICKY PROPERTY / ALWAYS ON TOP)
  // =====================================================================
  function toggleFixed() {
    if (window.electronAPI) {
      window.electronAPI.toggleAlwaysOnTop();
    }
  }

  function updateFixedButtonUI() {
    if (state.isAlwaysOnTop) {
      el.btnToggleFixed.classList.add('active');
      el.btnToggleFixed.querySelector('.fswitch-text').innerText = 'ON';
      showToast('📌 Sticky Pin ON: Floating on top of all windows');
    } else {
      el.btnToggleFixed.classList.remove('active');
      el.btnToggleFixed.querySelector('.fswitch-text').innerText = 'OFF';
      showToast('Sticky Pin OFF: Standard window stacking');
    }
  }

  // =====================================================================
  // 8. REAL-TIME CLOCK (LOCAL TIME)
  // =====================================================================
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    el.statusClock.innerText = `${hours}:${minutes}`;
  }

  // =====================================================================
  // 9. EVENT BINDINGS
  // =====================================================================
  function bindEvents() {
    // 1. Home button in top toolbar (Go to Google)
    el.btnHome.addEventListener('click', handleHomeButtonAction);

    // 2. Search / Omnibox Input
    el.omniboxInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigateActiveTab(el.omniboxInput.value);
        el.omniboxInput.blur();
      }
    });

    el.omniboxInput.addEventListener('focus', () => {
      el.omniboxInput.select();
    });

    el.omniboxInput.addEventListener('input', () => {
      el.btnClearSearch.style.display = el.omniboxInput.value ? 'block' : 'none';
    });

    el.btnClearSearch.addEventListener('click', () => {
      el.omniboxInput.value = '';
      el.btnClearSearch.style.display = 'none';
      el.omniboxInput.focus();
    });

    // 3. Plus button (New Tab)
    el.btnNewTab.addEventListener('click', () => createNewTab(DEFAULT_HOME_URL));

    // 4. Tab counter badge (Toggle Opened Tabs view)
    el.btnTabsCounter.addEventListener('click', toggleTabsOverview);
    el.btnOverviewNewTab.addEventListener('click', () => createNewTab(DEFAULT_HOME_URL));
    el.btnCloseTabsOverview.addEventListener('click', closeTabsOverview);

    // 5. Three Dots Button (Click opens, clicking again closes menu)
    el.btnThreeDots.addEventListener('click', toggleFloatingMenu);

    // Quick Localhost Port buttons in floating menu
    document.querySelectorAll('.qport-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.id === 'btnMenuDemo') {
          navigateActiveTab('demo.html');
        } else {
          navigateActiveTab(btn.dataset.url);
        }
        closeFloatingMenu();
      });
    });

    // Setting 1: Toggle Navbar
    el.btnToggleNavbar.addEventListener('click', toggleNavbar);

    // Setting 2: Switch Device
    el.deviceSelector.addEventListener('change', (e) => {
      const selected = DEVICES.find(d => d.id === e.target.value);
      if (selected) applyDevice(selected);
    });

    // Rotate device
    el.btnRotateDevice.addEventListener('click', () => {
      state.isLandscape = !state.isLandscape;
      applyDevice(state.currentDevice);
    });

    // Setting 3: Fixed / Always on top
    el.btnToggleFixed.addEventListener('click', toggleFixed);

    // Reload Active Tab
    el.btnReloadTab.addEventListener('click', () => {
      const active = getActiveTab();
      if (active && active.webviewEl) active.webviewEl.reload();
      closeFloatingMenu();
    });

    // Window controls in menu
    el.btnMinWin.addEventListener('click', () => {
      if (window.electronAPI) window.electronAPI.minimizeWindow();
    });
    el.btnCloseWin.addEventListener('click', () => {
      if (window.electronAPI) window.electronAPI.closeWindow();
    });

    // 6. Bottom Navbar 3 Buttons
    el.btnNavBack.addEventListener('click', handleBackButtonAction);
    el.btnNavHome.addEventListener('click', handleHomeButtonAction);
    el.btnNavRecents.addEventListener('click', handleRecentsButtonAction);
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
