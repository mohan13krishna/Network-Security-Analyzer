
async function startScan() {
  const rawUrl = document.getElementById('urlInput').value;
  console.log(rawUrl);
  const sanitizedUrl = rawUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^http?:\/\//, '');
  console.log(sanitizedUrl);
  try {
    const response = await fetch('http://localhost:3000/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: sanitizedUrl })
    });

    const data = await response.json();
    displayResults(data);
  } catch (error) {
    document.getElementById('results').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

function analyzeResults(data) {
  const vulnerabilities = [];

  // SSL Checks
  const ssl = data.ssl;
  if (!ssl) vulnerabilities.push("❌ SSL certificate missing or invalid.");
  else {
    const expiry = new Date(ssl.valid_to);
    const now = new Date();
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 30) vulnerabilities.push("⚠️ SSL certificate expires in less than 30 days.");
    if (!['TLSv1.3', 'TLSv1.2'].includes(ssl.protocol))
      vulnerabilities.push(`❌ Insecure SSL protocol used: ${ssl.protocol}`);
  }

  // Header Checks
  const headers = data.headers || {};
  const requiredHeaders = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "x-xss-protection"
  ];
  requiredHeaders.forEach(header => {
    if (!headers[header]) vulnerabilities.push(`⚠️ Missing security header: ${header}`);
  });

  // Open Ports
  const riskyPorts = [21, 22, 23, 25, 110, 135, 139, 143, 3389];
  (data.ports || []).forEach(port => {
    if (riskyPorts.includes(port))
      vulnerabilities.push(`🛑 Risky port open: ${port}`);
  });

  return vulnerabilities;
}

function displayResults(data) {
  const vulnerabilities = analyzeResults(data);
  const resultsDiv = document.getElementById('results');

  resultsDiv.innerHTML = `
    <div class="card">
      <h2>🔐 SSL Info</h2>
      <p><b>Protocol:</b> ${data.ssl.protocol}</p>
      <p><b>Valid From:</b> ${data.ssl.valid_from}</p>
      <p><b>Valid To:</b> ${data.ssl.valid_to}</p>
      <p><b>Issued By:</b> ${data.ssl.issuer.CN}</p>
    </div>

    <div class="card">
      <h2>📦 HTTP Headers</h2>
      <ul>${Object.entries(data.headers).map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`).join('')}</ul>
    </div>

    <div class="card">
      <h2>🌐 Open Ports</h2>
      <p>${data.ports.join(', ')}</p>
    </div>

    <div class="card ${vulnerabilities.length ? 'alert' : 'safe'}">
      <h2>${vulnerabilities.length ? '⚠️ Vulnerabilities Found' : '✅ No Critical Vulnerabilities'}</h2>
      <ul>${vulnerabilities.map(v => `<li>${v}</li>`).join('')}</ul>
    </div>
  `;
}
