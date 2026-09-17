/**
 * external-demo.js
 * Script độc lập bên ngoài để nhúng qua <script src="external-demo.js">
 */

function triggerExternalMessage() {
  const output = document.getElementById("external-output");
  if (output) {
    output.textContent = "Hàm này được gọi từ file external-demo.js thành công!";
    output.style.color = "#16a34a";
  }
}
