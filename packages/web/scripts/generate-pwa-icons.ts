import { write } from "bun";

// Minimal valid 1x1 base64 encoded PNG for placeholder
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, "base64");

const icons = [
    "icon-192x192.png",
    "icon-192x192-maskable.png",
    "icon-512x512.png",
    "icon-512x512-maskable.png"
];

const iconsDir = "./public/icons";
const fs = await import("fs");
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("Generating placeholder PWA icons...");

for (const icon of icons) {
    await write(`${iconsDir}/${icon}`, buffer);
    console.log(`Created ${iconsDir}/${icon}`);
}

console.log("Done.");
