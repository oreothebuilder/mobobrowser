/**
 * Mobile Device Browser - Application Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentDevice: DEVICES[0], // Pixel 8 / 9 Pro default
    isLandscape: false,
    navbarEnabled: true,
    isFixed: false,
    proxyMode: 'direct', // 'direct' | 'proxy'
    scale: 0.8,
    url: 'demo.html',
    historyStack: [],
    historyIndex: -1,
    customSkinUrl: null,
    chassisColor: '#1a1d24'
  };

  // DOM Elements
  const elements = {
    workspace: document.getElementById('appWorkspace'),
    deviceStage: document.getElementById('deviceStage'),
    phoneWrapper: document.getElementById('phoneWrapper'),
    phoneChassis: document.getElementById('phoneChassis'),
    phoneScreen: document.getElementById('phoneScreen'),
    mobileIframe: document.getElementById('mobileIframe'),
    mobileStatusBar: document.getElementById('mobileStatusBar'),
    clockDisplay: document.getElementById('clockDisplay'),
    cameraElement: document.getElementById('cameraElement'),
    androidNavbar: document.getElementById('androidNavbar'),
    gestureBar: document.getElementById('gestureBar'),
    fixedModeBanner: document.getElementById('fixedModeBanner'),
    screenLoader: document.getElementById('screenLoader'),
    screenError: document.getElementById('screenError'),
    errorUrlCode: document.getElementById('errorUrlCode'),
    customSkinOverlay: document.getElementById('customSkinOverlay'),

    // Floating Bar Controls
    floatingBar: document.getElementById('floatingBar'),
    urlInput: document.getElementById('urlInput'),
    protocolBadge: document.getElementById('protocolBadge'),
    btnClearUrl: document.getElementById('btnClearUrl'),
    btnGoUrl: document.getElementById('btnGoUrl'),
    btnBrowserBack: document.getElementById('btnBrowserBack'),
    btnBrowserForward: document.getElementById('btnBrowserForward'),
    btnBrowserReload: document.getElementById('btnBrowserReload'),
    btnDeviceModalTrigger: document.getElementById('btnDeviceModalTrigger'),
    pillDeviceName: document.getElementById('pillDeviceName'),
    pillDeviceRes: document.getElementById('pillDeviceRes'),
    btnToggleNavbar: document.getElementById('btnToggleNavbar'),
    btnToggleFixed: document.getElementById('btnToggleFixed'),
    btnRotate: document.getElementById('btnRotate'),
    btnMoreOptions: document.getElementById('btnMoreOptions'),
    btnDisableFixed: document.getElementById('btnDisableFixed'),
    scaleSelect: document.getElementById('scaleSelect'),
    metaAspectRatio: document.getElementById('metaAspectRatio'),
    metaDpr: document.getElementById('metaDpr'),
    metaProxyMode: document.getElementById('metaProxyMode'),

    // Navbar Buttons (Bottom of Device)
    navBackBtn: document.getElementById('navBackBtn'),
    navHomeBtn: document.getElementById('navHomeBtn'),
    navRecentsBtn: document.getElementById('navRecentsBtn'),

    // Modals
    deviceModal: document.getElementById('deviceModal'),
    btnCloseDeviceModal: document.getElementById('btnCloseDeviceModal'),
    deviceGrid: document.getElementById('deviceGrid'),
    optionsModal: document.getElementById('optionsModal'),
    btnCloseOptionsModal: document.getElementById('btnCloseOptionsModal'),
    skinDropzone: document.getElementById('skinDropzone'),
    skinFileInput: document.getElementById('skinFileInput'),
    skinActions: document.getElementById('skinActions'),
    skinFileName: document.getElementById('skinFileName'),
    btnRemoveSkin: document.getElementById('btnRemoveSkin'),
    btnModeDirect: document.getElementById('btnModeDirect'),
    btnModeProxy: document.getElementById('btnModeProxy'),

    // Fallback actions
    btnRetry: document.getElementById('btnRetry'),
    btnOpenDemo: document.getElementById('btnOpenDemo')
  };

  // =====================================================================
  // INITIALIZATION
  // =====================================================================
  function init() {
    renderDeviceList('all');
    applyDevice(state.currentDevice);
    updateClock();
    setInterval(updateClock, 30000);
    bindEvents();

    // Check system info from server (e.g. LAN IP)
    fetch('/api/info')
      .then(res => res.json())
      .then(info => {
        if (info.localIp && info.localIp !== 'localhost') {
          console.log(`Mobile tester accessible on LAN at: http://${info.localIp}:${info.port}`);
        }
      })
      .catch(() => {});

    // Initial load demo page
    navigateTo('demo.html');
  }

  // =====================================================================
  // 1. DEVICE ADAPTATION (Strictly Non-Resizable Manually)
  // =====================================================================
  function applyDevice(device) {
    state.currentDevice = device;

    let width = device.width;
    let height = device.height;

    // Handle landscape orientation flip
    if (state.isLandscape) {
      const temp = width;
      width = height;
      height = temp;
    }

    const bezel = device.bezel || 12;
    const cornerRadius = device.borderRadius || 44;

    // Apply strict non-resizable dimensions
    elements.phoneWrapper.style.width = `${width + bezel * 2}px`;
    elements.phoneWrapper.style.height = `${height + bezel * 2}px`;

    // Apply chassis styling & roundness
    elements.phoneChassis.style.padding = `${bezel}px`;
    elements.phoneChassis.style.borderRadius = `${cornerRadius}px`;
    elements.phoneScreen.style.borderRadius = `${Math.max(16, cornerRadius - bezel + 2)}px`;

    // Apply Camera Cutout
    updateCameraCutout(device.cutout);

    // Update Floating Island Bar Labels
    elements.pillDeviceName.innerText = device.name;
    elements.pillDeviceRes.innerText = `${width} × ${height}`;
    elements.metaAspectRatio.innerText = state.isLandscape 
      ? device.aspectRatio.split(':').reverse().join(':') 
      : device.aspectRatio;
    elements.metaDpr.innerText = `${device.dpr}x DPR`;

    // Update active highlight in modal grid
    document.querySelectorAll('.device-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === device.id);
    });

    // Reapply scale/zoom fit
    applyScale();
  }

  function updateCameraCutout(cutoutType) {
    elements.cameraElement.className = 'camera-lens';
    if (cutoutType === 'dynamic-island') {
      elements.cameraElement.classList.add('dynamic-island');
    } else if (cutoutType === 'notch') {
      elements.cameraElement.classList.add('notch');
    } else if (cutoutType === 'classic' || cutoutType === 'none') {
      elements.cameraElement.style.display = 'none';
      return;
    } else {
      // Default punch-hole
      elements.cameraElement.classList.add('punch-hole');
    }
    elements.cameraElement.style.display = 'flex';
  }

  function applyScale() {
    let scaleVal = state.scale;
    if (scaleVal === 'auto') {
      const availableHeight = window.innerHeight - 220;
      const deviceHeight = parseInt(elements.phoneWrapper.style.height, 10) || 900;
      scaleVal = Math.min(1, Math.max(0.4, (availableHeight / deviceHeight)));
    }
    elements.phoneWrapper.style.transform = `scale(${scaleVal})`;
  }

  // =====================================================================
  // 2. SETTINGS: NAVBAR TOGGLE (ONLY BACK WORKS, OTHER 2 DONT)
  // =====================================================================
  function toggleNavbar(forceState) {
    if (forceState !== undefined) {
      state.navbarEnabled = forceState;
    } else {
      state.navbarEnabled = !state.navbarEnabled;
    }

    if (state.navbarEnabled) {
      elements.androidNavbar.style.display = 'flex';
      elements.gestureBar.style.display = 'none';
      elements.btnToggleNavbar.classList.add('active');
      elements.btnToggleNavbar.querySelector('.toggle-indicator').innerText = 'ON';
    } else {
      elements.androidNavbar.style.display = 'none';
      elements.gestureBar.style.display = 'flex';
      elements.btnToggleNavbar.classList.remove('active');
      elements.btnToggleNavbar.querySelector('.toggle-indicator').innerText = 'OFF';
    }
  }

  // Back Button (Functional)
  function handleBackAction() {
    createRipple(elements.navBackBtn);
    try {
      // Try native iframe history back
      if (elements.mobileIframe.contentWindow) {
        elements.mobileIframe.contentWindow.history.back();
      }
    } catch (e) {
      console.log('Cross-origin history.back blocked by browser policy, using fallback');
    }

    // Stack fallback
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const prevUrl = state.historyStack[state.historyIndex];
      elements.urlInput.value = prevUrl;
      loadUrlInIframe(prevUrl, false);
    }
  }

  // Home Button (Tactile Only - Does not navigate per prompt requirement)
  function handleHomeAction() {
    createRipple(elements.navHomeBtn);
    showTactileToast('Home button pressed (Navigation disabled in settings)');
  }

  // Recents Button (Tactile Only - Does not navigate per prompt requirement)
  function handleRecentsAction() {
    createRipple(elements.navRecentsBtn);
    showTactileToast('Recents button pressed (Multitask disabled in settings)');
  }

  function createRipple(button) {
    const ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  }

  let toastTimer = null;
  function showTactileToast(msg) {
    let toast = document.getElementById('tactileToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tactileToast';
      toast.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(8px);
        color: #e2e8f0;
        font-size: 0.72rem;
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.15);
        z-index: 100;
        pointer-events: none;
        transition: opacity 0.2s ease;
      `;
      elements.phoneScreen.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 1800);
  }

  // =====================================================================
  // 3. SETTINGS: FIXED ON OR OFF (STICKY PROPERTY)
  // =====================================================================
  function toggleFixed(forceState) {
    if (forceState !== undefined) {
      state.isFixed = forceState;
    } else {
      state.isFixed = !state.isFixed;
    }

    if (state.isFixed) {
      elements.deviceStage.classList.add('fixed-mode');
      elements.fixedModeBanner.style.display = 'flex';
      elements.btnToggleFixed.classList.add('active');
      elements.btnToggleFixed.querySelector('.toggle-indicator').innerText = 'ON';
    } else {
      elements.deviceStage.classList.remove('fixed-mode');
      elements.fixedModeBanner.style.display = 'none';
      elements.btnToggleFixed.classList.remove('active');
      elements.btnToggleFixed.querySelector('.toggle-indicator').innerText = 'OFF';
    }
  }

  // =====================================================================
  // 4. URL NAVIGATION & LOCALHOST RESOLUTION
  // =====================================================================
  function normalizeUrl(input) {
    let trimmed = input.trim();
    if (!trimmed) return 'demo.html';
    if (trimmed === 'demo' || trimmed === 'demo.html') return 'demo.html';

    // Auto prepend http:// if missing
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'http://' + trimmed;
    }
    return trimmed;
  }

  function navigateTo(rawUrl, addToHistory = true) {
    const url = normalizeUrl(rawUrl);
    elements.urlInput.value = (url === 'demo.html') ? 'http://localhost:3000' : url;
    elements.btnClearUrl.style.display = elements.urlInput.value ? 'block' : 'none';

    // Protocol badge
    if (url.startsWith('https://')) {
      elements.protocolBadge.innerText = 'HTTPS';
      elements.protocolBadge.style.color = '#38bdf8';
      elements.protocolBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
    } else {
      elements.protocolBadge.innerText = 'HTTP';
      elements.protocolBadge.style.color = '#34d399';
      elements.protocolBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }

    if (addToHistory && (state.historyStack[state.historyIndex] !== url)) {
      state.historyIndex++;
      state.historyStack.splice(state.historyIndex, state.historyStack.length, url);
    }

    loadUrlInIframe(url);
  }

  function loadUrlInIframe(targetUrl) {
    elements.screenError.style.display = 'none';
    elements.screenLoader.style.display = 'flex';
    elements.btnBrowserReload.classList.add('spinning');

    let finalSrc = targetUrl;
    if (targetUrl !== 'demo.html' && state.proxyMode === 'proxy') {
      finalSrc = `/proxy?url=${encodeURIComponent(targetUrl)}`;
    }

    elements.mobileIframe.src = finalSrc;

    // Timeout safety
    const loadTimeout = setTimeout(() => {
      elements.screenLoader.style.display = 'none';
      elements.btnBrowserReload.classList.remove('spinning');
    }, 7000);

    elements.mobileIframe.onload = () => {
      clearTimeout(loadTimeout);
      elements.screenLoader.style.display = 'none';
      elements.btnBrowserReload.classList.remove('spinning');
    };

    elements.mobileIframe.onerror = () => {
      clearTimeout(loadTimeout);
      elements.screenLoader.style.display = 'none';
      elements.btnBrowserReload.classList.remove('spinning');
      showErrorView(targetUrl);
    };
  }

  function showErrorView(url) {
    elements.screenError.style.display = 'flex';
    elements.errorUrlCode.innerText = url;
  }

  // =====================================================================
  // 5. DEVICE PICKER MODAL
  // =====================================================================
  function renderDeviceList(category) {
    elements.deviceGrid.innerHTML = '';
    const filtered = (category === 'all') 
      ? DEVICES 
      : DEVICES.filter(d => d.category === category);

    filtered.forEach(dev => {
      const card = document.createElement('div');
      card.className = `device-card ${dev.id === state.currentDevice.id ? 'active' : ''}`;
      card.dataset.id = dev.id;

      card.innerHTML = `
        <div>
          <div class="device-card-header">
            <span class="device-card-name">${dev.name}</span>
            ${dev.badge ? `<span class="device-badge">${dev.badge}</span>` : ''}
          </div>
          <div class="device-card-specs">
            <span class="spec-chip">${dev.width} × ${dev.height}</span>
            <span class="spec-chip">${dev.aspectRatio}</span>
            <span class="spec-chip">${dev.dpr}x</span>
          </div>
          <p class="device-card-desc">${dev.description}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        applyDevice(dev);
        closeDeviceModal();
      });

      elements.deviceGrid.appendChild(card);
    });
  }

  function openDeviceModal() {
    elements.deviceModal.style.display = 'flex';
  }

  function closeDeviceModal() {
    elements.deviceModal.style.display = 'none';
  }

  // =====================================================================
  // 6. CUSTOM DEVICE PHOTO / SKIN HANDLER
  // =====================================================================
  function handleSkinUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      state.customSkinUrl = e.target.result;
      elements.customSkinOverlay.style.backgroundImage = `url(${state.customSkinUrl})`;
      elements.customSkinOverlay.style.display = 'block';
      elements.skinFileName.innerText = file.name;
      elements.skinActions.style.display = 'flex';
      elements.optionsModal.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function removeCustomSkin() {
    state.customSkinUrl = null;
    elements.customSkinOverlay.style.backgroundImage = 'none';
    elements.customSkinOverlay.style.display = 'none';
    elements.skinActions.style.display = 'none';
    elements.skinFileInput.value = '';
  }

  // =====================================================================
  // 7. REAL-TIME CLOCK
  // =====================================================================
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    elements.clockDisplay.innerText = `${hours}:${minutes}`;
  }

  // =====================================================================
  // 8. EVENT BINDINGS
  // =====================================================================
  function bindEvents() {
    // Address Bar navigation
    elements.btnGoUrl.addEventListener('click', () => navigateTo(elements.urlInput.value));
    elements.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigateTo(elements.urlInput.value);
    });

    elements.urlInput.addEventListener('input', () => {
      elements.btnClearUrl.style.display = elements.urlInput.value ? 'block' : 'none';
    });

    elements.btnClearUrl.addEventListener('click', () => {
      elements.urlInput.value = '';
      elements.btnClearUrl.style.display = 'none';
      elements.urlInput.focus();
    });

    // Browser navigation cluster
    elements.btnBrowserBack.addEventListener('click', handleBackAction);
    elements.btnBrowserForward.addEventListener('click', () => {
      try {
        if (elements.mobileIframe.contentWindow) elements.mobileIframe.contentWindow.history.forward();
      } catch (e) {}
    });
    elements.btnBrowserReload.addEventListener('click', () => {
      loadUrlInIframe(elements.urlInput.value);
    });

    // Localhost Port Chips
    document.querySelectorAll('.port-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.port-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (chip.dataset.url === 'demo') {
          navigateTo('demo.html');
        } else {
          const port = chip.dataset.port;
          navigateTo(`http://localhost:${port}`);
        }
      });
    });

    // Device Modal
    elements.btnDeviceModalTrigger.addEventListener('click', openDeviceModal);
    elements.btnCloseDeviceModal.addEventListener('click', closeDeviceModal);
    elements.deviceModal.addEventListener('click', (e) => {
      if (e.target === elements.deviceModal) closeDeviceModal();
    });

    // Device Category Filter Tabs
    document.querySelectorAll('.device-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.device-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDeviceList(btn.dataset.category);
      });
    });

    // Setting 1: Navbar Toggle
    elements.btnToggleNavbar.addEventListener('click', () => toggleNavbar());

    // Setting 2: Fixed / Sticky Toggle
    elements.btnToggleFixed.addEventListener('click', () => toggleFixed());
    elements.btnDisableFixed.addEventListener('click', () => toggleFixed(false));

    // Navbar Hardware Actions
    elements.navBackBtn.addEventListener('click', handleBackAction);
    elements.navHomeBtn.addEventListener('click', handleHomeAction);
    elements.navRecentsBtn.addEventListener('click', handleRecentsAction);

    // Orientation Rotate
    elements.btnRotate.addEventListener('click', () => {
      state.isLandscape = !state.isLandscape;
      applyDevice(state.currentDevice);
    });

    // Scale / Zoom
    elements.scaleSelect.addEventListener('change', (e) => {
      state.scale = (e.target.value === 'auto') ? 'auto' : parseFloat(e.target.value);
      applyScale();
    });
    window.addEventListener('resize', () => {
      if (state.scale === 'auto') applyScale();
    });

    // Options Modal
    elements.btnMoreOptions.addEventListener('click', () => {
      elements.optionsModal.style.display = 'flex';
    });
    elements.btnCloseOptionsModal.addEventListener('click', () => {
      elements.optionsModal.style.display = 'none';
    });
    elements.optionsModal.addEventListener('click', (e) => {
      if (e.target === elements.optionsModal) elements.optionsModal.style.display = 'none';
    });

    // Custom Skin Upload
    elements.skinDropzone.addEventListener('click', () => elements.skinFileInput.click());
    elements.skinFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleSkinUpload(e.target.files[0]);
    });
    elements.skinDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.skinDropzone.style.borderColor = '#6366f1';
    });
    elements.skinDropzone.addEventListener('dragleave', () => {
      elements.skinDropzone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    });
    elements.skinDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.skinDropzone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      if (e.dataTransfer.files.length) handleSkinUpload(e.dataTransfer.files[0]);
    });
    elements.btnRemoveSkin.addEventListener('click', removeCustomSkin);

    // Proxy Mode Segments
    elements.btnModeDirect.addEventListener('click', () => {
      state.proxyMode = 'direct';
      elements.btnModeDirect.classList.add('active');
      elements.btnModeProxy.classList.remove('active');
      elements.metaProxyMode.innerText = 'Mode: Direct';
      elements.metaProxyMode.style.color = '#06b6d4';
      loadUrlInIframe(elements.urlInput.value);
    });

    elements.btnModeProxy.addEventListener('click', () => {
      state.proxyMode = 'proxy';
      elements.btnModeProxy.classList.add('active');
      elements.btnModeDirect.classList.remove('active');
      elements.metaProxyMode.innerText = 'Mode: Proxy';
      elements.metaProxyMode.style.color = '#f59e0b';
      loadUrlInIframe(elements.urlInput.value);
    });

    elements.metaProxyMode.addEventListener('click', () => {
      if (state.proxyMode === 'direct') {
        elements.btnModeProxy.click();
      } else {
        elements.btnModeDirect.click();
      }
    });

    // Chassis Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.dataset.color;
        let hex = '#1a1d24';
        if (color === 'titanium') hex = '#3a3d45';
        if (color === 'silver') hex = '#a0a5ad';
        if (color === 'gold') hex = '#5a493a';
        elements.phoneChassis.style.setProperty('--chassis-color', hex);
      });
    });

    // Error View Buttons
    elements.btnRetry.addEventListener('click', () => loadUrlInIframe(elements.urlInput.value));
    elements.btnOpenDemo.addEventListener('click', () => navigateTo('demo.html'));
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
