import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

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

const ip = getLocalIp();
const publicUrl = `http://${ip}:5173`;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (envContent.includes('VITE_PUBLIC_URL=')) {
  envContent = envContent.replace(/VITE_PUBLIC_URL=.*/, `VITE_PUBLIC_URL=${publicUrl}`);
} else {
  envContent += `\nVITE_PUBLIC_URL=${publicUrl}\n`;
}

fs.writeFileSync(envPath, envContent);

console.log('✅ Local IP Sync Complete!');
console.log(`🌐 Your Phone URL: ${publicUrl}`);
console.log('--------------------------------------------------');
console.log('1. Make sure your phone is on the same Wi-Fi.');
console.log('2. Issue a NEW certificate or refresh the dashboard.');
console.log('3. Scan the QR code—it will now open perfectly on your phone!');
console.log('--------------------------------------------------');
