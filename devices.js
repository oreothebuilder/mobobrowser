const DEVICES = [
  // Google Pixel (Android Studio Standards)
  {
    id: 'pixel-8-pro',
    name: 'Google Pixel 8 / 9 Pro',
    category: 'Google Pixel',
    width: 412,
    height: 915,
    dpr: 3.0,
    aspectRatio: '20:9',
    cutout: 'punch-hole',
    borderRadius: 44,
    bezel: 12,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Android Studio flagship profile'
  },
  {
    id: 'pixel-7',
    name: 'Google Pixel 7 / 7 Pro',
    category: 'Google Pixel',
    width: 412,
    height: 892,
    dpr: 2.8,
    aspectRatio: '19.5:9',
    cutout: 'punch-hole',
    borderRadius: 42,
    bezel: 12,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Android Studio standard profile'
  },
  {
    id: 'pixel-6a',
    name: 'Google Pixel 6a',
    category: 'Google Pixel',
    width: 412,
    height: 892,
    dpr: 2.6,
    aspectRatio: '19.5:9',
    cutout: 'punch-hole',
    borderRadius: 38,
    bezel: 14,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Mid-range benchmark'
  },

  // Samsung Galaxy
  {
    id: 'galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Samsung Galaxy',
    width: 412,
    height: 960,
    dpr: 3.5,
    aspectRatio: '21:9',
    cutout: 'punch-hole',
    borderRadius: 26, // Squared titanium corners
    bezel: 10,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Large titanium flagship with squared corners'
  },
  {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24 / S23',
    category: 'Samsung Galaxy',
    width: 360,
    height: 780,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'punch-hole',
    borderRadius: 40,
    bezel: 11,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Compact 360px width standard'
  },
  {
    id: 'galaxy-z-flip-5',
    name: 'Samsung Galaxy Z Flip 5',
    category: 'Samsung Galaxy',
    width: 412,
    height: 1008,
    dpr: 2.6,
    aspectRatio: '22:9',
    cutout: 'punch-hole',
    borderRadius: 38,
    bezel: 12,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F731B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    description: 'Ultra-tall 22:9 aspect ratio'
  },

  // Apple iPhone
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 / 15 Pro Max',
    category: 'Apple iPhone',
    width: 430,
    height: 932,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'dynamic-island',
    borderRadius: 52,
    bezel: 11,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    description: 'Flagship iOS with Dynamic Island'
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 / 15 Pro',
    category: 'Apple iPhone',
    width: 393,
    height: 852,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'dynamic-island',
    borderRadius: 48,
    bezel: 11,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    description: 'Compact iOS pro with Dynamic Island'
  },
  {
    id: 'iphone-14-13',
    name: 'iPhone 14 / 13',
    category: 'Apple iPhone',
    width: 390,
    height: 844,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'notch',
    borderRadius: 44,
    bezel: 13,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    description: 'Classic iPhone with notch'
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE (3rd Gen)',
    category: 'Apple iPhone',
    width: 375,
    height: 667,
    dpr: 2.0,
    aspectRatio: '16:9',
    cutout: 'classic',
    borderRadius: 24,
    bezel: 18,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    description: '16:9 classic viewport'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEVICES };
}
