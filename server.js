const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Get local IPv4 address for QR code / physical device testing
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API endpoint to get system info and local network IP
app.get('/api/info', (req, res) => {
  res.json({
    localIp: getLocalIp(),
    port: PORT
  });
});

// Smart Proxy Middleware: strips X-Frame-Options and Content-Security-Policy
// so any localhost dev server or website can be embedded in iframe without blocking
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing "url" query parameter.');
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL provided.');
  }

  const proxy = createProxyMiddleware({
    target: parsedTarget.origin,
    changeOrigin: true,
    ws: true,
    pathRewrite: () => parsedTarget.pathname + parsedTarget.search,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Send a mobile user-agent to ensure target server returns mobile view
        const userAgent = req.headers['x-device-useragent'] ||
          'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
        proxyReq.setHeader('User-Agent', userAgent);
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
      },
      proxyRes: (proxyRes, req, res) => {
        // Delete headers that prevent iframe embedding
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['frame-ancestors'];
        delete proxyRes.headers['cross-origin-opener-policy'];
        delete proxyRes.headers['cross-origin-embedder-policy'];
        delete proxyRes.headers['cross-origin-resource-policy'];

        // Allow any origin
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        proxyRes.headers['access-control-allow-headers'] = '*';
      },
      error: (err, req, res) => {
        res.status(502).send(`
          <html>
            <body style="font-family:system-ui,sans-serif;padding:24px;background:#121316;color:#e1e4ea;display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
              <h2 style="margin:0 0 8px;">Could not connect to target URL</h2>
              <p style="color:#8b949e;max-width:380px;font-size:14px;line-height:1.5;">${err.message}</p>
              <p style="font-size:13px;color:#58a6ff;margin-top:16px;">Make sure your localhost dev server is running (e.g. npm run dev on port ${parsedTarget.port || 80}).</p>
            </body>
          </html>
        `);
      }
    }
  });

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  const localIp = getLocalIp();
  console.log('========================================================');
  console.log(`🚀 Mobile Device Browser is running!`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Network: http://${localIp}:${PORT}`);
  console.log('========================================================');
});
