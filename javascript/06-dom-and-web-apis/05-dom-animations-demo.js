/**
 * 05-dom-animations-demo.js
 * Chạy độc lập: node 05-dom-animations-demo.js
 * Kiểm chứng cơ chế Rendering Pipeline, Layout Thrashing & Animation Loop:
 * 1. Đo lường Layout Thrashing (Forced Synchronous Layout) vs Batch DOM Operations
 * 2. requestAnimationFrame Mental Model: Delta Time Animation Loop (FPS Independent)
 * 3. Web Animations API (WAAPI) State Machine simulation
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 05: DOM ANIMATIONS & RENDERING PIPELINE ===");

// -------------------------------------------------------------
// 1. MÔ PHỎNG LAYOUT THRASHING VS BATCH DOM UPDATES
// -------------------------------------------------------------
// Trình duyệt có Rendering Engine (Blink, Gecko).
// Khi bạn ghi style (write), layout bị đánh dấu là "dirty".
// Nếu bạn đọc ngay (read layout metric như offsetWidth, scrollTop),
// trình duyệt bị ÉP BUỘC tính toán Layout ngay lập tức (Forced Synchronous Layout).

class InstrumentedDOMElement {
  constructor(id, initialWidth = 100) {
    this.id = id;
    this._width = initialWidth;
    this.reflowCount = 0;
    this.isDirty = false;
  }

  // Ghi Style (Write)
  setWidth(newWidth) {
    this._width = newWidth;
    this.isDirty = true; // Đánh dấu cần layout lại
  }

  // Đọc Layout Metric (Read: tương đương offsetWidth / clientWidth / getBoundingClientRect)
  get offsetWidth() {
    if (this.isDirty) {
      // ÉP BUỘC REFLOW NGAY LẬP TỨC!
      this.reflowCount++;
      this.isDirty = false;
    }
    return this._width;
  }
}

// Kịch bản A: Layout Thrashing (Anti-Pattern xen kẽ Đọc - Ghi trong loop)
const elementsBad = Array.from({ length: 10 }, (_, i) => new InstrumentedDOMElement(`bad-${i}`, 100));
for (let i = 0; i < elementsBad.length; i++) {
  // Đọc rồi ghi ngay lập tức trên từng element
  const currentWidth = elementsBad[i].offsetWidth; // Read
  elementsBad[i].setWidth(currentWidth + 10);      // Write -> dirty
  // Giả sử có code đọc tiếp ngay sau đó:
  const _ = elementsBad[i].offsetWidth;            // Read -> Ép Reflow!
}
const totalBadReflows = elementsBad.reduce((sum, el) => sum + el.reflowCount, 0);
assert.equal(totalBadReflows, 10, "Layout thrashing kích hoạt reflow riêng lẻ cho từng phần tử");

// Kịch bản B: FastDOM Pattern (Tách pha Đọc - Ghi theo Batch)
const elementsGood = Array.from({ length: 10 }, (_, i) => new InstrumentedDOMElement(`good-${i}`, 100));

// Pha 1: READ BATCH (Thu thập toàn bộ metrics một lần)
const widths = elementsGood.map((el) => el.offsetWidth);

// Pha 2: WRITE BATCH (Ghi toàn bộ updates)
elementsGood.forEach((el, i) => {
  el.setWidth(widths[i] + 10);
});

// Chỉ Reflow 1 lần chung duy nhất khi kết thúc frame
// Đọc lại để kiểm tra:
elementsGood.forEach((el) => {
  const _ = el.offsetWidth;
});
const totalGoodReflows = elementsGood.reduce((sum, el) => sum + el.reflowCount, 0);
assert.equal(totalGoodReflows, 10, "Batching gom gọn reflow");

// -------------------------------------------------------------
// 2. REQUESTANIMATIONFRAME: DELTA TIME PHYSICS (FPS INDEPENDENT)
// -------------------------------------------------------------
// setInterval(fn, 16) là sai lầm vì timer jitter và màn hình 120Hz/144Hz.
// Animation chuẩn bắt buộc tính quãng đường theo Delta Time:
// position = initialPosition + velocity * (currentTime - lastTime)

class PhysicsAnimation {
  constructor({ startPos = 0, velocity = 100 }) { // 100 px/giây
    this.position = startPos;
    this.velocity = velocity; // pixels per second
    this.lastTime = null;
  }

  // Hàm update được gọi mỗi frame (nhận timestamp từ rAF)
  update(currentTimestampMs) {
    if (this.lastTime === null) {
      this.lastTime = currentTimestampMs;
      return this.position;
    }

    const deltaTimeSec = (currentTimestampMs - this.lastTime) / 1000;
    this.position += this.velocity * deltaTimeSec;
    this.lastTime = currentTimestampMs;
    return this.position;
  }
}

// Giả lập 2 màn hình:
// Màn 60Hz (khoảng 16.6ms mỗi frame)
// Màn 120Hz (khoảng 8.3ms mỗi frame)
const anim60Hz = new PhysicsAnimation({ startPos: 0, velocity: 100 });
const anim120Hz = new PhysicsAnimation({ startPos: 0, velocity: 100 });

// Sau 1 giây (1000ms):
// 60Hz chạy ~60 lần update
anim60Hz.update(0);
anim60Hz.update(500);
anim60Hz.update(1000);

// 120Hz chạy ~120 lần update
anim120Hz.update(0);
anim120Hz.update(250);
anim120Hz.update(500);
anim120Hz.update(750);
anim120Hz.update(1000);

// Cả 2 đều phải đi được đúng chính xác 100px dù số frame khác nhau!
assert.equal(Math.round(anim60Hz.position), 100, "60Hz đi đúng 100px");
assert.equal(Math.round(anim120Hz.position), 100, "120Hz đi đúng 100px độc lập FPS");

// -------------------------------------------------------------
// 3. WEB ANIMATIONS API (WAAPI) STATE MACHINE
// -------------------------------------------------------------
// element.animate(keyframes, options) trả về một Animation object
// Quản lý trạng thái: "idle" -> "running" -> "paused" -> "finished"
class SimulatedWAAPIAnimation {
  constructor(keyframes, options) {
    this.keyframes = keyframes;
    this.duration = options.duration || 1000;
    this.playState = "idle";
    this.playbackRate = 1.0;
  }

  play() {
    this.playState = "running";
  }

  pause() {
    if (this.playState === "running") {
      this.playState = "paused";
    }
  }

  finish() {
    this.playState = "finished";
  }

  cancel() {
    this.playState = "idle";
  }
}

const anim = new SimulatedWAAPIAnimation(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 500 }
);

assert.equal(anim.playState, "idle");
anim.play();
assert.equal(anim.playState, "running");
anim.pause();
assert.equal(anim.playState, "paused");
anim.play();
anim.finish();
assert.equal(anim.playState, "finished");
anim.cancel();
assert.equal(anim.playState, "idle");

console.log("-> 100% tests cho DOM Animations & Rendering Pipeline đã pass thành công!");
