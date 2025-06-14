# 🛡️ Network Security Analyzer     
              
<div align="center">   
 
[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=E53E3E&center=true&vCenter=true&random=false&width=600&lines=Network+Security+Analyzer;Real-time+Vulnerability+Scanner;SSL%2FTLS+%26+Port+Analysis;Built+by+Security+Enthusiasts)](https://git.io/typing-svg)

![Network Security](https://img.shields.io/badge/Security-Network%20Scanner-red?style=for-the-badge&logo=security&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black) 
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
 
**A comprehensive web security analysis platform that identifies vulnerabilities and strengthens digital defenses**

</div>

---


## 🤖 Overview

Network Security Analyzer is an innovative security assessment platform designed for cybersecurity professionals and developers. This **Industrial Oriented Mini Project** was conceptualized and developed as part of our academic curriculum at **ACE Engineering College**. The platform combines real-time vulnerability scanning with comprehensive security analysis to create a dynamic security testing experience, leveraging advanced scanning techniques to provide intelligent insights into web application security posture.

### 🎓 Academic Project Information

This project represents our commitment to bridging the gap between academic learning and industry requirements. Developed under the guidance of distinguished faculty members, this mini project showcases practical implementation of network security concepts in a real-world application.

## ✨ Features

- **🔐 SSL/TLS Analysis:** Complete certificate validation, cipher suite analysis, and HSTS compliance checking
- **🛡️ Security Headers Detection:** Comprehensive analysis of CSP, X-Frame-Options, and other protective headers
- **🌐 Intelligent Port Scanning:** Advanced port detection with service identification and vulnerability correlation
- **📊 Risk Assessment:** Automated security scoring with CVSS-based vulnerability assessment
- **📱 Responsive Interface:** Optimized for both desktop and mobile security testing

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm (Node Package Manager)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/network-security-analyzer.git
cd network-security-analyzer
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Configure your environment**

Create a new file `backend/.env` with the following content:

```bash
NODE_ENV=development
PORT=3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SCAN_TIMEOUT=30000
MAX_CONCURRENT_SCANS=10
```

4. **Run the application**

```bash
# Start the backend server
node server.js
```

5. **Launch the frontend**

```bash
# Navigate to frontend directory
cd ../frontend

# Option 1: Open directly in browser
# Simply open index.html in your web browser

# Option 2: Use a local server (recommended)
npx http-server -p 8080
```

The application will be running on:
- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:8080` or directly via `index.html`

## 🏗️ Project Structure

Actual project structure based on the repository:

```
NetworkSecurityAnalyzer/
├── backend/
│   ├── routes/
│   │   └── scan.js                   # Main scanning endpoints and API routes
│   ├── utils/
│   │   ├── headerScanner.js          # HTTP security headers analysis
│   │   ├── portScanner.js            # Network port scanning functionality
│   │   └── sslScanner.js             # SSL/TLS certificate analysis
│   ├── package.json                  # Backend dependencies and scripts
│   ├── package-lock.json             # Backend dependency lock file
│   └── server.js                     # Express.js application server
└── frontend/
    ├── index.html                    # Main application interface
    ├── script.js                     # Frontend logic and API communication
    └── style.css                     # Complete styling and animations
```

## 🔧 Configuration

### Backend Configuration

The backend uses environment variables for configuration. Update the `.env` file in the backend directory:

```bash
# Server settings
NODE_ENV=development
PORT=3000

# Security settings
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # Max 100 requests per window

# Scanning configuration
SCAN_TIMEOUT=30000        # 30 seconds timeout
MAX_CONCURRENT_SCANS=10   # Maximum concurrent scans
```

## 📚 Usage

### Basic Security Scan

1. Launch the application and navigate to the main interface
2. Enter a domain name (e.g., `example.com`) in the input field
3. Click "Scan Website" to initiate a comprehensive security analysis
4. Review the detailed security report with recommendations

### Understanding Results

The scanner provides analysis in several key areas:

#### SSL/TLS Security
- Certificate validity and expiration dates
- Cipher suite strength and protocol support
- HSTS (HTTP Strict Transport Security) implementation

#### Security Headers
- Content Security Policy (CSP) configuration
- Clickjacking protection via X-Frame-Options
- MIME-type sniffing prevention headers

#### Network Security
- Open port identification and service detection
- Potentially risky service exposure
- Network configuration recommendations

## 📊 API Usage Examples

### Basic Scan Request

```javascript
const response = await fetch('http://localhost:3000/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    target: 'example.com',
    scanType: 'comprehensive'
  })
});

const result = await response.json();
console.log('Security Score:', result.securityScore);
```

### Advanced Scan Configuration

```javascript
const advancedScan = {
  target: 'your-website.com',
  options: {
    ssl: {
      checkCertificateChain: true,
      validateCipherSuites: true,
      checkHSTS: true
    },
    headers: {
      checkCSP: true,
      validateSecurityHeaders: true
    },
    ports: {
      range: '1-1000',
      timeout: 5000
    }
  }
};
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Express.js](https://expressjs.com/) for the powerful web framework
- [Node.js](https://nodejs.org/) for the robust runtime environment
- [OWASP](https://owasp.org/) for security guidelines and best practices
- [Mozilla Observatory](https://observatory.mozilla.org/) for security insights

## 👥 Team Members & Academic Credits

### 🎓 **Project Team**
This **Industrial Oriented Mini Project** was developed by students of **ACE Engineering College** as part of our academic curriculum, focusing on practical implementation of network security concepts.

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/mohan13krishna.png" width="100px;" alt="Mohan Krishna"/>
      <br />
      <sub><b>Mohan Krishna</b></sub>
      <br />
      <small>Full Stack Developer</small>
      <br />
      <a href="https://github.com/mohan13krishna">🐙 GitHub</a> • 
      <a href="https://www.linkedin.com/in/mohan-krishna-thalla-a423a3301/">💼 LinkedIn</a>
    </td>
    <td align="center">
      <img src="https://github.com/sandeepraju6581.png" width="100px;" alt="Sandeep"/>
      <br />
      <sub><b>Sandeep Raju</b></sub>
      <br />
      <small>Frontend Specialist</small>
      <br />
      <a href="https://github.com/sandeepraju6581">🐙 GitHub</a> • 
      <a href="https://www.linkedin.com/in/sandeep-raju-937801183/">💼 LinkedIn</a>
    </td>
    <td align="center">
      <img src="https://github.com/Rajesh-challa.png" width="100px;" alt="Rajesh"/>
      <br />
      <sub><b>Rajesh</b></sub>
      <br />
      <small>Backend Security Engineer</small>
      <br />
      <a href="https://github.com/Rajesh-challa">🐙 GitHub</a> • 
      <a href="https://www.linkedin.com/in/challa-rajesh-695962256">💼 LinkedIn</a>
    </td>
  </tr>
</table>

### 👨‍🏫 **Faculty Guidance & Support**

We extend our heartfelt gratitude to the distinguished faculty members of **ACE Engineering College** who provided invaluable guidance, ideas, and continuous support throughout the development of this project:

<div align="center">

| **Role** | **Faculty Member** | **Designation** |
|----------|-------------------|-----------------|
| 🎯 **Project Guide** | **Mrs. K. Swathi** | Assistant Professor |
| 📋 **Project Coordinator** | **Mr. B. Narasimhulu** | Associate Professor |
| 📚 **Class Incharge** | **Mrs. P. Swaroopa** | Assistant Professor |
| 👥 **Head of Section** | **Mr. V. Chandra Shekar Reddy** | Associate Professor |
| 🎓 **Professor & Dean CSE** | **Dr. M. V. Vijaya Saradhi** | Professor & Dean |

</div>

### 🏛️ **Institution**
**ACE Engineering College**  
*Committed to Excellence in Technical Education*

Their expertise, mentorship, and continuous encouragement were instrumental in transforming our concept into a fully functional security analysis platform.

## 📞 Contact

Project Link: [https://github.com/mohan13krishna/Network-Security-Analyzer](https://github.com/mohan13krishna/Network-Security-Analyzer)

---

<div align="center">

⭐ Star this repository if you find it helpful! ⭐

> **Note**: This project is for educational and security research purposes. Please use responsibly and respect the terms of service of all scanned websites.

</div>
