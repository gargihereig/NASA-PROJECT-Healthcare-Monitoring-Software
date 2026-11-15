# ZENITH Overview

This project keeps the exact top-level structure shown in your VS Code screenshot:

```text
zenith-precision2/
├── node_modules/        # created by npm install
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package-lock.json    # created by npm install
├── package.json
└── README.md
```

## Run
Open this folder in VS Code, then run:

```powershell
npm install
npm run dev
```

The dashboard currently uses illustrative sample crew and alert data. Connect your real API before treating any values as live telemetry or medical information.


## 3D body scan
The Overview uses a procedurally assembled Three.js holographic human model. It slowly rotates, includes a moving horizontal scan plane, glowing biometric landmarks, an illustrative internal organ/skeletal layer, and ambient scan particles. The values shown are simulated demo values, not clinical measurements.

Install and run from this folder:
```powershell
npm.cmd install
npm.cmd run dev
```
