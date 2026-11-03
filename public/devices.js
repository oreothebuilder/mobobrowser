const DEVICES = [
  // Google Pixel (Android Studio Standard)
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
    os: 'android',
    badge: 'Popular',
    description: 'Modern Android flagship standard in Android Studio'
  },
  {
    id: 'pixel-7-pro',
    name: 'Google Pixel 7 / 7 Pro',
    category: 'Google Pixel',
    width: 412,
    height: 892,
    dpr: 2.8,
    aspectRatio: '19.5:9',
    cutout: 'punch-hole',
    borderRadius: 42,
    bezel: 12,
    os: 'android',
    description: 'Android Studio default device profile'
  },
  {
    id: 'pixel-6a',
    name: 'Google Pixel 6a / 7a',
    category: 'Google Pixel',
    width: 412,
    height: 892,
    dpr: 2.6,
    aspectRatio: '19.5:9',
    cutout: 'punch-hole',
    borderRadius: 38,
    bezel: 14,
    os: 'android',
    description: 'Mid-range Android benchmark'
  },
  {
    id: 'pixel-fold',
    name: 'Google Pixel Fold (Outer)',
    category: 'Google Pixel',
    width: 412,
    height: 892,
    dpr: 2.6,
    aspectRatio: '17.4:9',
    cutout: 'punch-hole',
    borderRadius: 36,
    bezel: 13,
    os: 'android',
    description: 'Foldable outer display'
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
    borderRadius: 28, // S24 Ultra has sharper, squared corners
    bezel: 10,
    os: 'android',
    badge: 'Flagship',
    description: 'Titanium chassis with squared-off modern corners'
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
    os: 'android',
    description: 'Compact 360px viewport baseline'
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
    os: 'android',
    description: 'Ultra-tall aspect ratio flip phone'
  },
  {
    id: 'galaxy-a54',
    name: 'Samsung Galaxy A54 5G',
    category: 'Samsung Galaxy',
    width: 412,
    height: 915,
    dpr: 2.5,
    aspectRatio: '20:9',
    cutout: 'punch-hole',
    borderRadius: 40,
    bezel: 14,
    os: 'android',
    description: 'Popular worldwide mid-range device'
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
    os: 'ios',
    badge: 'Largest iPhone',
    description: 'Large display with interactive Dynamic Island'
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 / 15 / 14 Pro',
    category: 'Apple iPhone',
    width: 393,
    height: 852,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'dynamic-island',
    borderRadius: 48,
    bezel: 11,
    os: 'ios',
    badge: 'Popular',
    description: 'Standard iOS pro display with Dynamic Island'
  },
  {
    id: 'iphone-14-13',
    name: 'iPhone 14 / 13 / 12',
    category: 'Apple iPhone',
    width: 390,
    height: 844,
    dpr: 3.0,
    aspectRatio: '19.5:9',
    cutout: 'notch',
    borderRadius: 44,
    bezel: 13,
    os: 'ios',
    description: 'Classic notch iOS display'
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
    os: 'ios',
    description: 'Compact 16:9 classic viewport with bezels'
  },

  // Tablets & Large Displays
  {
    id: 'pixel-tablet',
    name: 'Google Pixel Tablet',
    category: 'Tablets & Large',
    width: 1280,
    height: 800,
    dpr: 1.5,
    aspectRatio: '16:10',
    cutout: 'none',
    borderRadius: 32,
    bezel: 20,
    os: 'android',
    description: 'Android Studio tablet preset'
  },
  {
    id: 'ipad-mini',
    name: 'Apple iPad Mini',
    category: 'Tablets & Large',
    width: 744,
    height: 1133,
    dpr: 2.0,
    aspectRatio: '3:2',
    cutout: 'none',
    borderRadius: 32,
    bezel: 18,
    os: 'ios',
    description: 'Compact tablet viewport'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEVICES };
}
