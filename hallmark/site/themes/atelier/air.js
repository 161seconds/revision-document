/* The air: one WebGL field behind the page. Domain-warped simplex noise drifts upward like
   a scent in still air; the pointer's recent path parts it, and a chosen scent tints it.
   Runs only while a zone that shows it (hero, the four, the visit) is on screen.
   Reduced motion: one still frame. No WebGL or no script: the still in style.css stays. */
(() => {
  const canvas = document.querySelector('[data-air]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SCALE = 0.5;          // the field is soft, so it renders at half the CSS size
  const T0 = 37.0;            // the still in style.css is this moment
  const TRAIL = 8;

  /* oklch to linear sRGB, so the field mixes in light, not in gamma */
  const lin = (L, C, h) => {
    const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s].map((v) => Math.max(0, v));
  };
  const PAPER = lin(0.945, 0.010, 76);
  const DEEP = lin(0.50, 0.034, 55);
  const LIGHT = lin(0.988, 0.014, 86);
  /* the haze of each scent; 0 is the house amber */
  const HAZE = [lin(0.885, 0.040, 74), lin(0.875, 0.048, 18), lin(0.88, 0.042, 128), lin(0.87, 0.052, 62), lin(0.885, 0.036, 205)];
  const mixc = (x, y, k) => x.map((v, i) => v + (y[i] - v) * k);

  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform float uScroll;uniform float uUnit;
uniform vec4 uP[${TRAIL}];uniform vec4 uSrc[3];uniform vec3 uPaper;uniform vec3 uHaze;uniform vec3 uPlume;uniform vec3 uDeep;uniform vec3 uLight;
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}
vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nr=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nr.x;p1*=nr.y;p2*=nr.z;p3*=nr.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*sn(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.48;}return s;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 uv=fc/uRes;
  vec2 p=vec2(fc.x,fc.y*.7)/uUnit*.72;
  p.y-=uScroll/uUnit*.5;
  float clear=0.;
  for(int i=0;i<${TRAIL};i++){
    vec4 P=uP[i];
    vec2 d=(fc-P.xy)/P.w;
    float g=exp(-dot(d,d)*1.3)*P.z;
    p+=d*g*(P.w/uUnit)*.9;
    clear+=g;
  }
  clear=clamp(clear,0.,1.);
  float t=uTime;
  vec3 a=vec3(p+vec2(t*.004,-t*.012),t*.016);
  vec2 q=vec2(fbm(a),fbm(a+vec3(5.2,1.3,2.1)));
  vec3 b=vec3(p+.85*q+vec2(0.,-t*.018),t*.022);
  vec2 r=vec2(fbm(b+vec3(1.7,9.2,.4)),fbm(b+vec3(8.3,2.8,1.9)));
  float f=fbm(vec3(p+.95*r,t*.018));
  float soft=smoothstep(-.32,.78,f);
  soft=soft*soft*(3.-2.*soft);
  /* light through the haze: the veils' cores glow paler than the paper, their rims stay amber */
  float glow=smoothstep(.12,.82,f+.35*r.x);
  float side=.42+.5*smoothstep(-.1,1.2,uv.x*.9+uv.y*.3);
  /* the plumes: scent rising from the stained tips of the blotters, widening as it climbs */
  float pl=0.;
  for(int i=0;i<3;i++){
    vec4 S=uSrc[i];
    if(S.w>0.){
      vec2 sd=(fc-S.xy)/S.z;
      float up=max(sd.y,0.);
      float wd=.22+up*.5;
      pl+=exp(-sd.x*sd.x/(wd*wd))*smoothstep(-.18,.12,sd.y)*exp(-up*.42)*S.w;
    }
  }
  pl=clamp(pl*smoothstep(-.55,.45,f+.25*q.x),0.,1.);
  float dens=max(soft*side,pl*.9)*(1.-.6*clear);
  vec3 hz=mix(uHaze,uPlume,clamp(pl*1.3,0.,1.));
  vec3 col=mix(uPaper,hz,clamp(dens*.9,0.,1.));
  col=mix(col,uLight,clamp(glow*side*.62*(1.-.5*clear),0.,1.));
  col=pow(col,vec3(1./2.2));
  col+=(hash(fc+fract(t*.37)*61.)-.5)*(1.6/255.);
  gl_FragColor=vec4(col,1.);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uTime', 'uScroll', 'uUnit', 'uP', 'uSrc', 'uPaper', 'uHaze', 'uPlume', 'uDeep', 'uLight'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform3fv(U.uPaper, PAPER);
  gl.uniform3fv(U.uDeep, DEEP);
  gl.uniform3fv(U.uLight, LIGHT);

  /* state */
  let w = 0, h = 0;
  const haze = HAZE[0].slice(), plume = HAZE[0].slice();
  let target = HAZE[0], targetPlume = HAZE[0];
  /* plume sources in page coordinates: [x, y, radius, strength], read from the elements that marked them */
  let sources = [];
  const measure = () => {
    sources = [...document.querySelectorAll('[data-plume]')].slice(0, 3).map((el) => {
      const tips = [...el.querySelectorAll(el.dataset.plume)];
      if (!tips.length) return null;
      let x = 0, y = 0;
      tips.forEach((t) => { const r = t.getBoundingClientRect(); x += r.left + r.width / 2; y += el.dataset.plumeEnd === 'bottom' ? r.bottom : r.top; });
      return [x / tips.length, y / tips.length + scrollY, Number(el.dataset.plumeR || 260), Number(el.dataset.plumeS || 0.9)];
    }).filter(Boolean);
  };
  const trail = Array.from({ length: TRAIL }, () => ({ x: -1e4, y: -1e4, s: 0 }));
  let head = 0, lastDrop = 0;
  const ptr = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, speed: 0, seen: false };
  let time = T0, last = 0, raf = 0, running = false, visible = true;
  const zones = new Set();

  const size = () => {
    const cw = Math.max(1, Math.round(innerWidth * SCALE)), ch = Math.max(1, Math.round(innerHeight * SCALE));
    if (cw === w && ch === h) return;
    w = cw; h = ch; canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  const draw = () => {
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uUnit, Math.max(w, h));
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uScroll, scrollY * SCALE);
    gl.uniform3fv(U.uHaze, haze);
    gl.uniform3fv(U.uPlume, plume);
    const src = new Float32Array(12);
    sources.forEach((q, i) => { src.set([q[0] * SCALE, h - (q[1] - scrollY) * SCALE, q[2] * SCALE, q[3]], i * 4); });
    gl.uniform4fv(U.uSrc, src);
    const arr = new Float32Array(TRAIL * 4);
    trail.forEach((p, i) => { arr.set([p.x * SCALE, h - p.y * SCALE, p.s, 150 * SCALE], i * 4); });
    gl.uniform4fv(U.uP, arr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = (now) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    time += dt;
    /* the tint arrives like a scent does: slowly */
    const k = 1 - Math.exp(-dt / 0.9);
    for (let i = 0; i < 3; i++) { haze[i] += (target[i] - haze[i]) * k * 0.6; plume[i] += (targetPlume[i] - plume[i]) * k; }
    /* the hand's wake: drop a point every 70ms while moving; each one fades over about a second */
    const fade = Math.exp(-dt / 0.75);
    trail.forEach((p) => { p.s *= fade; });
    ptr.speed *= Math.exp(-dt / 0.12);
    if (ptr.seen && now - lastDrop > 70 && ptr.speed > 0.02) {
      lastDrop = now;
      head = (head + 1) % TRAIL;
      trail[head] = { x: ptr.x, y: ptr.y, s: Math.min(0.85, ptr.speed) };
    }
    draw();
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || reduce.matches) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  const sync = () => { (visible && zones.size && !reduce.matches) ? start() : stop(); };

  size();
  measure();
  draw();
  addEventListener('load', () => { measure(); if (!running) draw(); });
  setTimeout(() => { measure(); if (!running) draw(); }, 2200);
  requestAnimationFrame(() => document.documentElement.classList.add('air-on'));

  addEventListener('resize', () => { size(); measure(); if (!running) draw(); }, { passive: true });
  addEventListener('scroll', () => { if (!running) requestAnimationFrame(draw); }, { passive: true });
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    if (ptr.seen) ptr.speed = Math.min(1, ptr.speed + Math.hypot(dx, dy) / 140);
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.seen = true;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; sync(); });
  reduce.addEventListener?.('change', () => { sync(); draw(); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { en.isIntersecting ? zones.add(en.target) : zones.delete(en.target); });
    sync();
  }, { rootMargin: '0px' });
  document.querySelectorAll('[data-air-zone]').forEach((z) => io.observe(z));

  window.Air = {
    scent(n) {
      targetPlume = HAZE[n || 0];
      target = mixc(HAZE[0], targetPlume, 0.55);
      if (!running) { for (let i = 0; i < 3; i++) { haze[i] = target[i]; plume[i] = targetPlume[i]; } draw(); }
    },
    measure() { measure(); if (!running) draw(); },
    snapshot() { draw(); return canvas.toDataURL('image/jpeg', 0.9); },
  };
})();
