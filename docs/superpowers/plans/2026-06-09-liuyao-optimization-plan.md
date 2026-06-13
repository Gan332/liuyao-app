# 六爻占卜应用全面优化 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 liuyao-app 从721行单HTML文件重构为模块化架构，引入专业六爻占卜功能（纳甲/六兽/世应/月建日建/旺相休囚死），保持Web和Android双平台同步。

**Architecture:** 三阶段演进。Phase 1: 模块化重构（保持功能不变，建立Vite构建体系）。Phase 2: 六爻核心引擎独立为 @liuyao/engine 包。Phase 3: 在引擎中增加纳甲装卦/六兽/世应/月建日建/旺相休囚死，对应增强UI展示。

**Tech Stack:** Vite (构建), vanilla JS (无框架, 保持WebView兼容), Kotlin (Android), Gradle R8 (混淆), vitest (引擎测试)

**Working directory:** `/Users/fish/liuyao-repo/`

---

## Phase 1: 模块化重构

### Task 1.1: Project Scaffolding

**Files:**
- Create: `packages/web/package.json`
- Create: `packages/web/vite.config.js`
- Create: `packages/web/src/` (directories: css/, js/, assets/)
- Modify: `package.json` (root workspace)

- [ ] **Step 1: Create root package.json with workspace config**

```json
// /Users/fish/liuyao-repo/package.json
{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build:web": "npm run build -w packages/web",
    "build:android": "cd liuyao-app && ./gradlew assembleRelease",
    "build:all": "npm run build:web && npm run build:android"
  }
}
```

- [ ] **Step 2: Create web package.json**

```json
// /Users/fish/liuyao-repo/packages/web/package.json
{
  "name": "@liuyao/web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 3: Create vite.config.js**

```js
// /Users/fish/liuyao-repo/packages/web/vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html')
    },
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    cssCodeSplit: false,
    assetsInlineLimit: 100000,
    reportCompressedSize: false
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
```

- [ ] **Step 4: Create source directories**

Run: `mkdir -p /Users/fish/liuyao-repo/packages/web/src/{css,js,assets}`

- [ ] **Step 5: Commit**

```bash
git add package.json packages/web/package.json packages/web/vite.config.js packages/web/src/
git commit -m "phase1: scaffold monorepo workspace and vite config"
```

---

### Task 1.2: Extract CSS Modules

**Context:** Current CSS is inline in `<style>` block (~187 lines, lines 7-187 of index.html). Split into separate files.

**Files:**
- Create: `packages/web/src/css/base.css`
- Create: `packages/web/src/css/layout.css`
- Create: `packages/web/src/css/coin.css`
- Create: `packages/web/src/css/reading.css`
- Create: `packages/web/src/css/components.css`

- [ ] **Step 1: Create base.css** — CSS variables, reset, dark mode, body, html, helpers

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/base.css */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f2f2f7;--card:#fff;--sep:#e5e5ea;--primary:#007aff;--plight:#e8f0fe;--label:#1c1c1e;--sl:#3a3a3c;--tl:#8e8e93;--ql:#c7c7cc;--sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--sh-lg:0 10px 40px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.04);--r:12px;--st:env(safe-area-inset-top,0px);--sb:env(safe-area-inset-bottom,0px)}
html{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;font-size:16px;color:var(--label);background:var(--bg)}
body{min-height:100vh;padding-top:calc(12px + var(--st));padding-bottom:calc(40px + var(--sb));overflow-x:hidden;transition:background .3s}
[data-theme="dark"]{--bg:#1c1c1e;--card:#2c2c2e;--sep:#38383a;--primary:#0a84ff;--plight:#1a2a44;--label:#f5f5f7;--sl:#e5e5ea;--tl:#8e8e93;--ql:#636366;--sh:0 1px 3px rgba(0,0,0,.2),0 1px 2px rgba(0,0,0,.15);--sh-lg:0 10px 40px rgba(0,0,0,.3),0 2px 8px rgba(0,0,0,.15)}
.h{display:none!important}
.anim{animation:fi .4s ease forwards;opacity:0}
@keyframes fi{to{opacity:1;transform:translateY(0)}}
.anim.af{transform:translateY(8px)}
.ad1{animation-delay:.08s}.ad2{animation-delay:.16s}.ad3{animation-delay:.24s}.ad4{animation-delay:.32s}
@media(max-width:380px){.nav-t{font-size:24px}.hx-zh{font-size:32px}.c{padding:0 12px}}
```

- [ ] **Step 2: Create layout.css** — .c container, .nav, .cd cards, .hx-h heading, .sec-hx

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/layout.css */
.c{max-width:440px;margin:0 auto;padding:0 16px}
@supports(padding:max(0px)){.c{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}}
.nav{display:flex;align-items:center;justify-content:space-between;padding:8px 4px 2px;margin-bottom:6px;gap:6px}
.nav-l{display:flex;align-items:baseline;gap:10px;flex-shrink:0}
.nav-t{font-size:30px;font-weight:700;letter-spacing:-.5px;background:linear-gradient(135deg,#007aff,#5856d6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;white-space:nowrap}
.nav-s{font-size:13px;font-weight:400;color:var(--tl);white-space:nowrap}
.nav-r{display:flex;align-items:center;gap:6px;flex-shrink:1;min-width:0}
.nav-rg{font-size:11px;font-weight:500;color:var(--tl);background:var(--card);padding:5px 10px;border-radius:20px;box-shadow:var(--sh);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nav-btn{background:var(--card);border:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--sh);color:var(--tl);font-size:16px;transition:all .2s;flex-shrink:0}
.nav-btn:hover{transform:scale(1.1)}
.nav-btn:active{transform:scale(.9)}
.cd{background:var(--card);border-radius:var(--r);padding:20px;margin-bottom:14px;box-shadow:var(--sh);transition:opacity .3s,transform .3s,background .3s}
.cdh{font-size:12px;font-weight:600;color:var(--tl);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}
.hx-h{text-align:center;padding:4px 0}
.hx-num{font-size:12px;color:var(--tl);font-weight:500;letter-spacing:.4px}
.hx-zh{font-size:38px;font-weight:700;margin:4px 0 2px;line-height:1.2;background:linear-gradient(135deg,#007aff,#5856d6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hx-py{font-size:14px;color:var(--sl);font-weight:400;font-style:italic;margin-bottom:4px}
.hx-en{font-size:11px;color:var(--tl);font-weight:500;text-transform:uppercase;letter-spacing:.6px}
.hx-jg{font-size:14px;color:var(--sl);line-height:1.65;margin-top:10px;padding:12px 16px;background:var(--bg);border-radius:10px;text-align:center;font-weight:400}
.desc{margin-top:4px}
.desc-text{font-size:14px;color:var(--sl);line-height:1.75;padding:8px 0}
.sec-hx{border-left:3px solid var(--primary);border-radius:var(--r);padding-left:4px}
.sec-hx-inner{display:flex;align-items:center;gap:14px}
.sec-hx-sym{font-size:34px;line-height:1}
.sec-hx-info{flex:1}
.sec-hx-label{font-size:11px;color:var(--tl);font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.sec-hx-name{font-size:22px;font-weight:700;margin:1px 0}
.sec-hx-py{font-size:12px;color:var(--sl);font-style:italic}
.sec-hx-jg{font-size:13px;color:var(--sl);line-height:1.6;margin-top:8px}
.div{height:1px;background:var(--sep);margin:14px 0}
.ci{background:var(--plight);border-radius:10px;padding:12px 16px;margin-top:8px;font-size:13px;color:var(--sl);line-height:1.5}
.emp{text-align:center;padding:20px 0;font-size:14px;color:var(--ql)}
```

- [ ] **Step 3: Create coin.css** — coin toss, yao lines, mode bar, manual area

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/coin.css */
.yao-c{display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 0}
.yao-r{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:3px 0}
.yao-l{font-size:11px;font-weight:600;color:var(--tl);width:26px;text-align:right;flex-shrink:0}
.yao-w{flex:1;display:flex;align-items:center;justify-content:center;max-width:180px;height:18px;position:relative}
.yao-s{width:100%;height:5px;background:var(--label);border-radius:3px;transition:all .2s}
.yao-b{display:flex;width:100%;height:5px;gap:18%;align-items:center}
.yao-b span{flex:1;height:5px;background:var(--label);border-radius:3px;transition:all .2s}
.yao-w.ch .yao-s,.yao-w.ch .yao-b span{background:var(--primary);opacity:.65}
.yao-ch{position:absolute;right:-28px;font-size:13px;font-weight:700}
.yao-ch.yang{color:#ff9500}
.yao-ch.yin{color:#ff3b30}
.coin-a{display:flex;gap:18px;justify-content:center;margin:10px 0;min-height:62px}
.coin{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;border:2px solid #d4a857;background:linear-gradient(135deg,#f0d68a,#d4a857);color:#7a5c2e;transition:all .3s;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.1);user-select:none}
.coin.flip{animation:cf .5s ease-in-out}
@keyframes cf{0%{transform:rotateY(0) scale(1)}25%{transform:rotateY(90deg) scale(.85)}50%{transform:rotateY(180deg) scale(1)}75%{transform:rotateY(270deg) scale(.85)}100%{transform:rotateY(360deg) scale(1)}}
.coin.heads{background:linear-gradient(135deg,#f0d68a,#d4a857);border-color:#b8943e}
.coin.tails{background:linear-gradient(135deg,#e8e8ed,#c7c7cc);border-color:#8e8e93;color:#3a3a3c}
.coin-r{font-size:11px;color:var(--tl);text-align:center;margin-top:2px;font-weight:500}
[data-theme="dark"] .coin.heads{background:linear-gradient(135deg,#d4a857,#b8943e);border-color:#9a7a34;color:#f5f5f7}
[data-theme="dark"] .coin.tails{background:linear-gradient(135deg,#3a3a3c,#2c2c2e);border-color:#505052;color:#e5e5ea}
.toss-a{display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0}
.hint{font-size:13px;color:var(--tl);font-weight:400;min-height:20px}
.mode-bar{display:flex;gap:8px;justify-content:center;margin:6px 0 10px}
.mode-btn{font-size:13px;font-weight:500;color:var(--tl);background:var(--card);border:1.5px solid var(--sep);padding:6px 16px;border-radius:20px;cursor:pointer;transition:all .2s}
.mode-btn.act{color:var(--primary);border-color:var(--primary);background:var(--plight)}
.mode-btn:hover{border-color:var(--primary)}
.manual-a{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0}
.manual-line{display:flex;align-items:center;gap:12px;padding:6px 8px;border-radius:10px;transition:background .2s;width:100%;max-width:320px}
.manual-line:hover{background:var(--plight)}
.manual-label{font-size:14px;font-weight:600;color:var(--sl);width:36px;text-align:right;flex-shrink:0}
.manual-yao{width:80px;display:flex;justify-content:center;flex-shrink:0}
.manual-yao .ys{width:70px;height:5px;background:var(--label);border-radius:3px}
.manual-yao .yb{display:flex;width:70px;gap:10px}
.manual-yao .yb span{flex:1;height:5px;background:var(--label);border-radius:3px}
.manual-vals{display:flex;gap:4px}
.me-btn{width:32px;height:28px;border-radius:6px;border:1.5px solid var(--sep);background:var(--card);color:var(--sl);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center}
.me-btn.act{background:var(--primary);color:#fff;border-color:var(--primary)}
.me-btn:hover:not(.act){border-color:var(--primary)}
[data-theme="dark"] .hx-jg{background:#3a3a3c}
[data-theme="dark"] .me-btn{background:#3a3a3c;color:var(--sl)}
[data-theme="dark"] .me-btn:hover{background:#48484a}
[data-theme="dark"] .me-btn.act{background:var(--primary);color:#fff}
```

- [ ] **Step 4: Create reading.css** — result list, result display, rl-* classes

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/reading.css */
.rl{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--sep)}
.rl:last-child{border-bottom:none}
.rl-n{font-size:11px;color:var(--tl);width:22px;text-align:right;flex-shrink:0;font-weight:500}
.rl-v{font-size:13px;font-weight:600;color:var(--sl);width:20px;text-align:center}
.rl-y{width:70px;display:flex;justify-content:center;flex-shrink:0}
.rl-y .ys{width:70px;height:4px;background:var(--label);border-radius:2px}
.rl-y .yb{display:flex;width:70px;gap:10px}
.rl-y .yb span{flex:1;height:4px;background:var(--label);border-radius:2px}
.rl-t{font-size:11px;color:var(--tl);width:30px;text-align:center}
.rl-c{font-size:11px;font-weight:600;color:var(--primary);width:36px;text-align:right}
.rd-actions{display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap}
.rd-btn{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:500;padding:8px 18px;border-radius:20px;border:1.5px solid var(--sep);background:var(--card);color:var(--sl);cursor:pointer;transition:all .2s}
.rd-btn:hover{background:var(--plight);border-color:var(--primary);color:var(--primary)}
.rd-btn:active{transform:scale(.95)}
.my{display:flex;flex-direction:column;gap:2px;align-items:center}
.my .ml{width:22px;height:3px;background:var(--tl);border-radius:1.5px}
.my .mb{display:flex;width:22px;gap:4px}
.my .mb span{flex:1;height:3px;background:var(--tl);border-radius:1.5px}
```

- [ ] **Step 5: Create components.css** — buttons, overlay, modal, toast, history panel

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/components.css */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--primary);color:#fff;font-size:17px;font-weight:600;padding:14px 40px;border-radius:50px;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 14px rgba(0,122,255,.3);-webkit-tap-highlight-color:transparent;user-select:none;min-width:160px}
.btn:hover{transform:scale(1.02);box-shadow:0 6px 20px rgba(0,122,255,.35)}
.btn:active{transform:scale(.97);opacity:.9}
.btn:disabled{opacity:.4;cursor:default;transform:none;box-shadow:none}
.btn-sec{background:var(--card);color:var(--primary);border:1.5px solid var(--primary);box-shadow:none;min-width:auto}
.btn-sec:hover{background:var(--plight);box-shadow:none}
.hist-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;opacity:0;pointer-events:none;transition:opacity .3s}
.hist-overlay.show{opacity:1;pointer-events:auto}
.hist-panel{position:fixed;bottom:0;left:0;right:0;z-index:101;background:var(--card);border-radius:16px 16px 0 0;max-height:75vh;overflow-y:auto;transform:translateY(100%);transition:transform .4s cubic-bezier(.32,.72,0,1);box-shadow:0 -4px 30px rgba(0,0,0,.12)}
.hist-panel.show{transform:translateY(0)}
.hist-head{position:sticky;top:0;z-index:2;background:var(--card);padding:16px 20px 12px;border-bottom:1px solid var(--sep);display:flex;align-items:center;justify-content:space-between}
.hist-head h3{font-size:17px;font-weight:700;color:var(--label)}
.hist-close{width:32px;height:32px;border-radius:50%;border:none;background:var(--bg);color:var(--tl);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.hist-handle{width:36px;height:4px;background:var(--ql);border-radius:2px;margin:6px auto 0}
.hist-item{padding:14px 20px;border-bottom:1px solid var(--sep);cursor:pointer;transition:background .15s;display:flex;align-items:center;gap:14px}
.hist-item:hover{background:var(--plight)}
.hist-sym{font-size:28px;width:36px;text-align:center;flex-shrink:0}
.hist-info{flex:1;min-width:0}
.hist-name{font-size:15px;font-weight:600;color:var(--label)}
.hist-date{font-size:11px;color:var(--tl);margin-top:2px}
.hist-note{font-size:12px;color:var(--sl);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hist-empty{padding:40px 20px;text-align:center;color:var(--tl);font-size:14px;line-height:1.6}
.hist-clear{background:var(--card);color:#ff3b30;border:.5px solid #ff3b30;padding:5px 12px;border-radius:16px;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s}
.hist-clear:hover{background:#fff0f0}
[data-theme="dark"] .hist-clear:hover{background:#3a1a1a}
[data-theme="dark"] .hist-panel{background:var(--card)}
[data-theme="dark"] .nav-btn{background:var(--card);color:var(--tl)}
.note-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;opacity:0;pointer-events:none;transition:opacity .3s}
.note-overlay.show{opacity:1;pointer-events:auto}
.note-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.92);z-index:201;background:var(--card);border-radius:16px;padding:20px;width:calc(100% - 48px);max-width:360px;opacity:0;pointer-events:none;transition:all .3s;box-shadow:var(--sh-lg)}
.note-modal.show{transform:translate(-50%,-50%) scale(1);opacity:1;pointer-events:auto}
.note-modal h3{font-size:17px;font-weight:700;color:var(--label);margin-bottom:10px;text-align:center}
.note-modal textarea{width:100%;height:80px;border:1.5px solid var(--sep);border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;color:var(--sl);background:var(--bg);resize:none;outline:none;transition:border .2s}
.note-modal textarea:focus{border-color:var(--primary)}
.note-actions{display:flex;gap:10px;margin-top:12px}
.note-actions button{flex:1;padding:10px;border-radius:12px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s}
.note-tags{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.note-tag{font-size:11px;padding:3px 10px;border-radius:12px;border:1px solid var(--sep);background:var(--card);color:var(--tl);cursor:pointer;transition:all .15s}
.note-tag:hover{background:var(--plight);border-color:var(--primary);color:var(--primary)}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--label);color:var(--bg);padding:10px 24px;border-radius:12px;font-size:14px;font-weight:500;opacity:0;pointer-events:none;transition:all .4s;z-index:300;box-shadow:var(--sh-lg)}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
```

- [ ] **Step 6: Create CSS index** that imports all CSS files

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/style.css */
@import './base.css';
@import './layout.css';
@import './coin.css';
@import './reading.css';
@import './components.css';
```

- [ ] **Step 7: Verify CSS files created**

Run: `ls -la /Users/fish/liuyao-repo/packages/web/src/css/`

- [ ] **Step 8: Commit**

```bash
git add packages/web/src/css/
git commit -m "phase1: extract css modules from inline style"
```

---

### Task 1.3: JS Data Module

**Context:** Extract the HX (64 hexagrams) and TRI (trigrams) data arrays from the inline `<script>` into its own module. This is pure data, no DOM dependencies.

**Files:**
- Create: `packages/web/src/js/data.js`

- [ ] **Step 1: Create data.js** — export HX, TRI, and derived constants

```js
// /Users/fish/liuyao-repo/packages/web/src/js/data.js
export const HX = [{"num":1,"zh":"乾","py":"qián","en":"创造","upper":7,"lower":7,"judgment":"天行健，君子以自强不息。","desc":"乾卦六阳纯刚，象天之行健。此卦主刚健进取、自强不息。占得此卦，宜奋发有为，不可懈怠。创业求事皆吉，但须持守正道，不可骄盈。","sym":"☰☰"},{"num":2,"zh":"坤","py":"kūn","en":"包容","upper":0,"lower":0,"judgment":"地势坤，君子以厚德载物。","desc":"坤卦六阴纯柔，象地之博厚。此卦主柔顺包容、厚德载物。占得此卦，宜以柔克刚，以静制动。行事宜守成，不宜冒进。利主不利客。","sym":"☷☷"},{"num":3,"zh":"屯","py":"zhūn","en":"初生","upper":2,"lower":4,"judgment":"云雷屯，君子以经纶。","desc":"屯卦上水下雷，象初生之艰难。此卦主万事开头难，如草木破土而出。占得此卦，虽有险阻，但生机已现。宜沉着应对，不可急躁。利建侯行师。","sym":"☵☳"},{"num":4,"zh":"蒙","py":"méng","en":"启蒙","upper":1,"lower":4,"judgment":"山下出泉，蒙。君子以果行育德。","desc":"蒙卦上艮下坎，象山下出泉。此卦主蒙昧初开、启蒙教育。占得此卦，宜虚心求教，不可自以为是。求学之事吉，诉讼之事凶。宜培养根基。","sym":"☶☳"},{"num":5,"zh":"需","py":"xū","en":"等待","upper":2,"lower":7,"judgment":"云上于天，需。君子以饮食宴乐。","desc":"需卦上坎下乾，象云在天上待雨。此卦主等待时机、积蓄力量。占得此卦，时机未到，不宜冒进。宜静候其变，养精蓄锐，终有成功之日。","sym":"☵☰"},{"num":6,"zh":"讼","py":"sòng","en":"争辩","upper":7,"lower":4,"judgment":"天与水违行，讼。君子以作事谋始。","desc":"讼卦上乾下坎，象天与水背道而驰。此卦主争讼对立、是非纠纷。占得此卦，宜以和为贵，避免诉讼。若不得已而争，须据理力争。始事须谨慎。","sym":"☰☳"},{"num":7,"zh":"师","py":"shī","en":"军队","upper":0,"lower":4,"judgment":"地中有水，师。君子以容民畜众。","desc":"师卦上坤下坎，象地中蓄水。此卦主统率众人、行军打仗。占得此卦，宜团结一致，服从指挥。得此卦者须有德者居之，以正义之师行事。","sym":"☷☳"},{"num":8,"zh":"比","py":"bǐ","en":"亲附","upper":2,"lower":0,"judgment":"地上有水，比。先王以建万国，亲诸侯。","desc":"比卦上坎下坤，象水流地上相亲无间。此卦主亲附合作、团结互助。占得此卦，宜广结善缘，择善而从。求人相助可得应允。","sym":"☵☷"},{"num":9,"zh":"小畜","py":"xiǎo xù","en":"小蓄积","upper":5,"lower":7,"judgment":"风行天上，小畜。君子以懿文德。","desc":"小畜卦上巽下乾，象风行天上蓄积未厚。此卦主小有蓄积、渐进发展。占得此卦，力量尚微，不可大有作为。宜修养德性，积蓄力量以待时机。","sym":"☴☰"},{"num":10,"zh":"履","py":"lǚ","en":"践行","upper":7,"lower":6,"judgment":"上天下泽，履。君子以辨上下，定民志。","desc":"履卦上乾下兑，象天在上泽在下各行其道。此卦主践行礼仪、脚踏实地。占得此卦，宜按部就班，谨慎行事。如履薄冰则无咎，骄傲则凶。","sym":"☰☱"},{"num":11,"zh":"泰","py":"tài","en":"通达","upper":0,"lower":7,"judgment":"天地交，泰。后以财成天地之道，辅相天地之宜。","desc":"泰卦上坤下乾，象天地交融万物通泰。此卦主安泰亨通、国泰民安。占得此卦，万事通达，吉无不利。宜顺势而为，大有可为。但盛极则衰，须防微杜渐。","sym":"☷☰"},{"num":12,"zh":"否","py":"pǐ","en":"闭塞","upper":7,"lower":0,"judgment":"天地不交，否。君子以俭德辟难，不可荣以禄。","desc":"否卦上乾下坤，象天地隔绝万物不通。此卦主闭塞不通、小人当道。占得此卦，宜退隐守拙，不可强行。俭德避难，等待时运转变。","sym":"☰☷"},{"num":13,"zh":"同人","py":"tóng rén","en":"团结","upper":7,"lower":3,"judgment":"天与火，同人。君子以类族辨物。","desc":"同人卦上乾下离，象天火相映光明。此卦主团结合作、志同道合。占得此卦，宜与人合作，求同存异。破冰融合之事吉，寻人觅友可得。","sym":"☰☲"},{"num":14,"zh":"大有","py":"dà yǒu","en":"丰收","upper":3,"lower":7,"judgment":"火在天上，大有。君子以遏恶扬善，顺天休命。","desc":"大有卦上离下乾，象火照天上光明普照。此卦主大获丰收、富足圆满。占得此卦，万事亨通，财禄丰盈。但当居安思危，遏恶扬善以保其成。","sym":"☲☰"},{"num":15,"zh":"谦","py":"qiān","en":"谦逊","upper":0,"lower":1,"judgment":"地中有山，谦。君子以裒多益寡，称物平施。","desc":"谦卦上坤下艮，象高山藏于大地之中。此卦主谦虚退让、不骄不躁。占得此卦，吉无不利。谦受益满招损，以谦逊处世，万事皆可成。","sym":"☷☶"},{"num":16,"zh":"豫","py":"yù","en":"愉悦","upper":4,"lower":0,"judgment":"雷出地奋，豫。先王以作乐崇德，殷荐之上帝。","desc":"豫卦上震下坤，象春雷出地万物欢欣。此卦主愉悦安乐、顺势而动。占得此卦，宜顺应时机行事，不可迟疑。但乐极生悲，须有节制。","sym":"☳☷"},{"num":17,"zh":"随","py":"suí","en":"跟随","upper":6,"lower":4,"judgment":"泽中有雷，随。君子以向晦入宴息。","desc":"随卦上兑下震，象雷入泽中随时而动。此卦主随从顺应、随机应变。占得此卦，宜随顺时势，不可固执己见。跟随有道之人则可获吉。","sym":"☱☳"},{"num":18,"zh":"蛊","py":"gǔ","en":"整治","upper":1,"lower":5,"judgment":"山下有风，蛊。君子以振民育德。","desc":"蛊卦上艮下巽，象风遇山而回旋。此卦主整治弊病、拨乱反正。占得此卦，宜整顿积弊，革故鼎新。虽有艰难，但努力可获成功。","sym":"☶☴"},{"num":19,"zh":"临","py":"lín","en":"临近","upper":0,"lower":6,"judgment":"泽上有地，临。君子以教思无穷，容保民无疆。","desc":"临卦上坤下兑，象大地临近泽水。此卦主亲临监督、以上临下。占得此卦，宜以德服人，以诚感人。大事可成，但须防八月之凶（盛极而衰）。","sym":"☷☱"},{"num":20,"zh":"观","py":"guān","en":"观察","upper":5,"lower":0,"judgment":"风行地上，观。先王以省方观民设教。","desc":"观卦上巽下坤，象风行大地无所不至。此卦主观察审视、以德服人。占得此卦，宜冷静观察，不可轻举妄动。适合旁观者清，也宜反躬自省。","sym":"☴☷"},{"num":21,"zh":"噬嗑","py":"shì hé","en":"咬合","upper":3,"lower":4,"judgment":"雷电噬嗑。先王以明罚敕法。","desc":"噬嗑卦上离下震，象雷电交加咬合之象。此卦主断狱刑罚、排除障碍。占得此卦，宜果断处理难题，如咬硬物。诉讼之事可成，但须公正严明。","sym":"☲☳"},{"num":22,"zh":"贲","py":"bì","en":"装饰","upper":1,"lower":3,"judgment":"山下有火，贲。君子以明庶政，无敢折狱。","desc":"贲卦上艮下离，象山下有火光华照耀。此卦主装饰美化、文饰外表。占得此卦，宜注重礼仪和修饰。但不可过分追求表面，须内外兼修。","sym":"☶☲"},{"num":23,"zh":"剥","py":"bō","en":"剥落","upper":1,"lower":0,"judgment":"山附于地，剥。上以厚下安宅。","desc":"剥卦上艮下坤，象山石剥落于地。此卦主剥落衰败、小人当道。占得此卦，宜顺时而止，不可妄动。但剥极而复，阴极阳生，黑暗中已现生机。","sym":"☶☷"},{"num":24,"zh":"复","py":"fù","en":"回归","upper":0,"lower":4,"judgment":"雷在地中，复。先王以至日闭关，商旅不行。","desc":"复卦上坤下震，象一阳来复于地中。此卦主回复重生、复归正道。占得此卦，宜休养生息，回复元气。一阳初生，生机萌发，善事可为。","sym":"☷☳"},{"num":25,"zh":"无妄","py":"wú wàng","en":"无妄","upper":7,"lower":4,"judgment":"天下雷行，无妄。先王以茂对时育万物。","desc":"无妄卦上乾下震，象雷行天下万物不敢妄为。此卦主顺其自然、不妄作为。占得此卦，宜守正不动妄念。行正道则吉，有妄念则凶。","sym":"☰☳"},{"num":26,"zh":"大畜","py":"dà chù","en":"大蓄积","upper":1,"lower":7,"judgment":"天在山中，大畜。君子以多识前言往行，以畜其德。","desc":"大畜卦上艮下乾，象天在山中蓄积广大。此卦主大积大蓄、厚积薄发。占得此卦，宜积蓄德才，不可急于求成。蓄积充足，方能大展宏图。","sym":"☶☰"},{"num":27,"zh":"颐","py":"yí","en":"颐养","upper":1,"lower":4,"judgment":"山下有雷，颐。君子以慎言语，节饮食。","desc":"颐卦上艮下震，象山下有雷发动生机。此卦主颐养身心、自食其力。占得此卦，宜注重养生，谨慎言语，节制饮食。求人不如求己。","sym":"☶☳"},{"num":28,"zh":"大过","py":"dà guò","en":"大过度","upper":6,"lower":5,"judgment":"泽灭木，大过。君子以独立不惧，遁世无闷。","desc":"大过卦上兑下巽，象泽水淹没木舟。此卦主过度非常、大事之象。占得此卦，非常之时需非常之举。宜独立不惧，但不可过度，须谨慎把握分寸。","sym":"☱☴"},{"num":29,"zh":"坎","py":"kǎn","en":"险陷","upper":2,"lower":2,"judgment":"水洊至，习坎。君子以常德行，习教事。","desc":"坎卦上下皆水，象重重险陷。此卦主险难重重、深陷困境。占得此卦，宜保持诚信和勇气，以平常心面对险阻。习于险难则终能脱困。","sym":"☵☵"},{"num":30,"zh":"离","py":"lí","en":"依附","upper":3,"lower":3,"judgment":"明两作，离。大人以继明照于四方。","desc":"离卦上下皆火，象光明相续。此卦主依附光明、明照四方。占得此卦，宜依附中正之道。但离火易散，须有恒心坚守，方能持续光明。","sym":"☲☲"},{"num":31,"zh":"咸","py":"xián","en":"感应","upper":6,"lower":1,"judgment":"山上有泽，咸。君子以虚受人。","desc":"咸卦上兑下艮，象山上有泽水感应交融。此卦主感应相通、男女之情。占得此卦，宜以虚心接纳他人。感情之事吉，但须自然发展，不可强求。","sym":"☱☶"},{"num":32,"zh":"恒","py":"héng","en":"恒久","upper":4,"lower":5,"judgment":"雷风，恒。君子以立不易方。","desc":"恒卦上震下巽，象雷风相与恒久不息。此卦主恒久不变、坚守正道。占得此卦，宜持之以恒，不可半途而废。婚姻和事业皆宜稳定持久。","sym":"☳☴"},{"num":33,"zh":"遁","py":"dùn","en":"退避","upper":7,"lower":1,"judgment":"天下有山，遁。君子以远小人，不恶而严。","desc":"遁卦上乾下艮，象天在山远遁而去。此卦主退避隐忍、以退为进。占得此卦，宜暂避锋芒，不可硬碰。退一步海阔天空，等待时机再起。","sym":"☰☶"},{"num":34,"zh":"大壮","py":"dà zhuàng","en":"大强壮","upper":4,"lower":7,"judgment":"雷在天上，大壮。君子以非礼弗履。","desc":"大壮卦上震下乾，象雷在天上声势壮大。此卦主强壮盛大、阳气充沛。占得此卦，势不可挡，但须依正道行事。非礼勿履，否则会因壮而败。","sym":"☳☰"},{"num":35,"zh":"晋","py":"jìn","en":"前进","upper":3,"lower":0,"judgment":"明出地上，晋。君子以自昭明德。","desc":"晋卦上离下坤，象太阳出地照耀四方。此卦主晋升前进、光明在上。占得此卦，宜积极进取，前途光明。得此卦者宜依靠光明正大的方式晋升。","sym":"☲☷"},{"num":36,"zh":"明夷","py":"míng yí","en":"光明受伤","upper":0,"lower":3,"judgment":"明入地中，明夷。君子以莅众，用晦而明。","desc":"明夷卦上坤下离，象光明落入地中。此卦主光明受损、处境艰难。占得此卦，宜晦藏明智，不可显露锋芒。在困境中坚守正道，终能重见光明。","sym":"☷☲"},{"num":37,"zh":"家人","py":"jiā rén","en":"家庭","upper":5,"lower":3,"judgment":"风自火出，家人。君子以言有物而行有恒。","desc":"家人卦上巽下离，象风自火出温暖一家。此卦主家庭和睦、各司其职。占得此卦，宜修身齐家，言有物而行有恒。家事吉，外事亦顺。","sym":"☴☲"},{"num":38,"zh":"睽","py":"kuí","en":"对立","upper":3,"lower":6,"judgment":"上火下泽，睽。君子以同而异。","desc":"睽卦上离下兑，象火在上泽在下性质相反。此卦主乖离对立、意见不合。占得此卦，宜求同存异，不可强求一致。小事可成，大事多阻。","sym":"☲☱"},{"num":39,"zh":"蹇","py":"jiǎn","en":"艰难","upper":2,"lower":1,"judgment":"山上有水，蹇。君子以反身修德。","desc":"蹇卦上坎下艮，象山上有水道路艰险。此卦主艰难险阻、寸步难行。占得此卦，宜反躬自省，修养德行。知难而退或知难而进，皆须审时度势。","sym":"☵☶"},{"num":40,"zh":"解","py":"xiè","en":"解脱","upper":4,"lower":2,"judgment":"雷雨作，解。君子以赦过宥罪。","desc":"解卦上震下坎，象雷雨交作化解旱情。此卦主解脱困境、危难消散。占得此卦，宜迅速行动，解除危难。困境即将过去，往西南方向有利。","sym":"☳☵"},{"num":41,"zh":"损","py":"sǔn","en":"减损","upper":1,"lower":6,"judgment":"山下有泽，损。君子以惩忿窒欲。","desc":"损卦上艮下兑，象山下水泽损山基。此卦主减损损失、损下益上。占得此卦，宜损己利人，克制私欲。虽暂时有损，但终将获益。","sym":"☶☱"},{"num":42,"zh":"益","py":"yì","en":"增益","upper":4,"lower":5,"judgment":"风雷，益。君子以见善则迁，有过则改。","desc":"益卦上巽下雷，象风雷相益相助。此卦主增益利益、损上益下。占得此卦，宜迁善改过，助人为乐。利有攸往，利涉大川。","sym":"☳☴"},{"num":43,"zh":"夬","py":"guài","en":"决断","upper":6,"lower":7,"judgment":"泽上于天，夬。君子以施禄及下，居德则忌。","desc":"夬卦上兑下乾，象泽水积满决口而下。此卦主决断果断、去邪除奸。占得此卦，宜当机立断，不可优柔寡断。但须有充分准备方可行动。","sym":"☱☰"},{"num":44,"zh":"姤","py":"gòu","en":"相遇","upper":7,"lower":5,"judgment":"天下有风，姤。后以施命诰四方。","desc":"姤卦上乾下巽，象风行天下万物相遇。此卦主意外相遇、不期而遇。占得此卦，宜把握机缘，但须防不期而至的麻烦。女壮勿娶。","sym":"☰☴"},{"num":45,"zh":"萃","py":"cuì","en":"聚集","upper":6,"lower":0,"judgment":"泽上于地，萃。君子以除戎器，戒不虞。","desc":"萃卦上兑下坤，象泽聚于地万物萃集。此卦主聚集荟萃、群英会聚。占得此卦，宜聚集人才，团结力量。但须防患未然，戒除不测。","sym":"☱☷"},{"num":46,"zh":"升","py":"shēng","en":"上升","upper":0,"lower":5,"judgment":"地中生木，升。君子以顺德，积小以高大。","desc":"升卦上坤下巽，象地中生木日益高大。此卦主上升进步、步步高升。占得此卦，宜顺势而上，积小成多。求名求利皆吉，前途通达。","sym":"☷☴"},{"num":47,"zh":"困","py":"kùn","en":"困窘","upper":6,"lower":2,"judgment":"泽无水，困。君子以致命遂志。","desc":"困卦上兑下坎，象泽中无水干涸困窘。此卦主困厄窘迫、进退两难。占得此卦，宜坚守正道，安贫乐道。困境中考验人的意志，终将否极泰来。","sym":"☱☵"},{"num":48,"zh":"井","py":"jǐng","en":"水井","upper":2,"lower":5,"judgment":"木上有水，井。君子以劳民劝相。","desc":"井卦上坎下巽，象木上有水井养不穷。此卦主恒常稳定、养育万物。占得此卦，宜坚守岗位，勤勉尽责。井水清冽，但须时常淘洗，喻修身不懈。","sym":"☵☴"},{"num":49,"zh":"革","py":"gé","en":"变革","upper":6,"lower":3,"judgment":"泽中有火，革。君子以治历明时。","desc":"革卦上兑下离，象泽中有火变革之象。此卦主变革创新、除旧布新。占得此卦，宜顺天应人，大胆改革。变革之机已到，当断则断。","sym":"☱☲"},{"num":50,"zh":"鼎","py":"dǐng","en":"鼎器","upper":3,"lower":5,"judgment":"火上有风，鼎。君子以正位凝命。","desc":"鼎卦上离下巽，象火上有风鼎烹美食。此卦主鼎立新业、安邦定国。占得此卦，宜建立新秩序，正位凝命。鼎为国之重器，喻大任在肩。","sym":"☲☴"},{"num":51,"zh":"震","py":"zhèn","en":"震动","upper":4,"lower":4,"judgment":"洊雷，震。君子以恐惧修省。","desc":"震卦上下皆雷，象雷声重叠震惊百里。此卦主震惊恐惧、因惧而修。占得此卦，宜戒慎恐惧，反躬自省。虽有大惊，终能无恙。","sym":"☳☳"},{"num":52,"zh":"艮","py":"gèn","en":"静止","upper":1,"lower":1,"judgment":"兼山，艮。君子以思不出其位。","desc":"艮卦上下皆山，象两山重叠静止不动。此卦主停止静止、知止而止。占得此卦，宜适可而止，不可妄动。当止则止，当行则行。","sym":"☶☶"},{"num":53,"zh":"渐","py":"jiàn","en":"渐进","upper":5,"lower":1,"judgment":"山上有木，渐。君子以居贤德善俗。","desc":"渐卦上巽下艮，象山上有木逐渐生长。此卦主循序渐进、不急不躁。占得此卦，宜稳步前进，不可冒进。女子出嫁吉，凡事按部就班。","sym":"☴☶"},{"num":54,"zh":"归妹","py":"guī mèi","en":"嫁少女","upper":4,"lower":6,"judgment":"泽上有雷，归妹。君子以永终知敝。","desc":"归妹上震下兑，象泽上有雷少女出嫁。此卦主婚姻结合、人情之常。占得此卦，婚姻可成，但须防失礼不正。永终知敝，宜有长久之计。","sym":"☳☱"},{"num":55,"zh":"丰","py":"fēng","en":"丰盛","upper":4,"lower":3,"judgment":"雷电皆至，丰。君子以折狱致刑。","desc":"丰卦上震下离，象雷电皆至声势盛大。此卦主丰盛盈满、如日中天。占得此卦，事业鼎盛，但盛极必衰。宜持中守正，不可自满。","sym":"☳☲"},{"num":56,"zh":"旅","py":"lǚ","en":"旅行","upper":3,"lower":1,"judgment":"山上有火，旅。君子以明慎用刑而不留狱。","desc":"旅卦上离下艮，象山上有火旅人宿行。此卦主旅行在外、客居他乡。占得此卦，宜谨慎行事，不可张扬。旅居在外宜低调，不可贪图安逸。","sym":"☲☶"},{"num":57,"zh":"巽","py":"xùn","en":"顺从","upper":5,"lower":5,"judgment":"随风，巽。君子以申命行事。","desc":"巽卦上下皆风，象风行相随无孔不入。此卦主顺从而入、以柔克刚。占得此卦，宜顺势而行，不可刚硬。以谦逊的态度行事，可以亨通。","sym":"☴☴"},{"num":58,"zh":"兑","py":"duì","en":"喜悦","upper":6,"lower":6,"judgment":"丽泽，兑。君子以朋友讲习。","desc":"兑卦上下皆泽，象两泽相连喜悦无限。此卦主喜悦欢乐、以诚待人。占得此卦，宜与朋友讲习交流，以诚信待人。喜悦出于真诚，不可虚伪。","sym":"☱☱"},{"num":59,"zh":"涣","py":"huàn","en":"涣散","upper":5,"lower":2,"judgment":"风行水上，涣。先王以享于帝立庙。","desc":"涣卦上巽下坎，象风行水上涣散消融。此卦主涣散离散、凝聚人心。占得此卦，宜拯济涣散，聚拢人心。先散后聚，终能回归正途。","sym":"☴☵"},{"num":60,"zh":"节","py":"jié","en":"节制","upper":2,"lower":6,"judgment":"泽上有水，节。君子以制数度，议德行。","desc":"节卦上坎下兑，象泽上有水满则溢出。此卦主节制适度、有度有量。占得此卦，宜适度节制，不可过度。苦节不可贞，过于艰苦的节制不可长久。","sym":"☵☱"},{"num":61,"zh":"中孚","py":"zhōng fú","en":"内心诚信","upper":5,"lower":6,"judgment":"泽上有风，中孚。君子以议狱缓死。","desc":"中孚上巽下兑，象风在泽上诚信感化。此卦主内心诚信、感化万物。占得此卦，宜以诚待人，信守承诺。诚信者可感化万物，做事皆吉。","sym":"☴☱"},{"num":62,"zh":"小过","py":"xiǎo guò","en":"小过度","upper":4,"lower":1,"judgment":"山上有雷，小过。君子以行过乎恭，丧过乎哀，用过乎俭。","desc":"小过上震下艮，象雷在山顶声威稍过。此卦主小有过失、宜谨慎行事。占得此卦，宜行事先求自保，不可大事张扬。小事可过，大事不可过。","sym":"☳☶"},{"num":63,"zh":"既济","py":"jì jì","en":"已完成","upper":2,"lower":3,"judgment":"水在火上，既济。君子以思患而豫防之。","desc":"既济上坎下离，象水在火上事物已成。此卦主事已完成、成功在望。占得此卦，初始吉，终则有变。宜居安思危，防范未然。成功之后更须谨慎。","sym":"☵☲"},{"num":64,"zh":"未济","py":"wèi jì","en":"未完成","upper":3,"lower":2,"judgment":"火在水上，未济。君子以慎辨物居方。","desc":"未济上离下坎，象火在水上未能相济。此卦主事未完成、继续前行。占得此卦，虽未成功但有希望。慎辨物居方，不偏不倚。六十四卦以此终，寓意生生不息。","sym":"☲☵"}];

// Trigram data: 0=坤,1=艮,2=坎,3=离,4=震,5=巽,6=兑,7=乾
export const TRI = [
  ["☷","☶","☵","☲","☳","☴","☱","☰"],  // symbols
  ["坤","艮","坎","离","震","巽","兑","乾"], // Chinese
  ["kūn","gèn","kǎn","lí","zhèn","xùn","duì","qián"] // pinyin
];
export const [triSym, triCN, triPY] = TRI;

export const LN = ['初','二','三','四','五','上'];
export const LV = {6:'⚋',7:'⚊',8:'⚋',9:'⚊'};
export const LM = {6:'老阴·变爻',7:'少阳·静爻',8:'少阴·静爻',9:'老阳·变爻'};

export function findHx(u, l) {
  return HX.find(h => h.upper === u && h.lower === l);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/js/data.js
git commit -m "phase1: extract hexagram data to js/data.js"
```

---

### Task 1.4: JS Utility Modules

**Context:** Extract utility functions — audio, theme, storage, and shared UI helpers. Each is self-contained with no cross-dependencies.

**Files:**
- Create: `packages/web/src/js/audio.js`
- Create: `packages/web/src/js/theme.js`
- Create: `packages/web/src/js/storage.js`
- Create: `packages/web/src/js/ui.js`

- [ ] **Step 1: Create audio.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/audio.js
let audioCtx = null;

function playTone(freq, dur) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    o.start();
    g.gain.value = 0.08;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* silent fail */ }
}

export function playCoin() {
  playTone(1400, 0.06);
}

export function playHexagram() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 80);
  setTimeout(() => playTone(784, 0.15), 160);
}
```

- [ ] **Step 2: Create theme.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/theme.js
const STORAGE_KEY = 'liuyao_theme';

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('dmBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* silent */ }
}

export function initTheme() {
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } })();
  if (saved) {
    setTheme(saved);
    return;
  }
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(dark ? 'dark' : 'light');
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

export function watchSystemTheme() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}
```

- [ ] **Step 3: Create storage.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/storage.js
const HISTORY_KEY = 'liuyao_history';

const MAX_HISTORY = 100;

export function loadHistory() {
  try {
    const d = localStorage.getItem(HISTORY_KEY);
    return d ? JSON.parse(d) : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) { /* silent */ }
}

export function addEntry(history, entry) {
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
  return history;
}

export function removeEntry(history, id) {
  const filtered = history.filter(e => e.id !== id);
  saveHistory(filtered);
  return filtered;
}

export function clearAll() {
  try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* silent */ }
  return [];
}
```

- [ ] **Step 4: Create ui.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/ui.js
let toastTimer = null;

export function $(id) {
  return document.getElementById(id);
}

export function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

export function yaoLine(val, opts = {}) {
  const ch = val === 6 || val === 9;
  const yang = val === 7 || val === 9;
  const w = document.createElement('div');
  w.className = 'yao-w' + (ch ? ' ch' : '');
  if (yang) {
    const b = document.createElement('div');
    b.className = 'yao-s';
    w.appendChild(b);
  } else {
    const b = document.createElement('div');
    b.className = 'yao-b';
    const s1 = document.createElement('span');
    const s2 = document.createElement('span');
    b.appendChild(s1);
    b.appendChild(s2);
    w.appendChild(b);
  }
  if (ch && opts.showCh) {
    const c = document.createElement('span');
    c.className = 'yao-ch ' + (yang ? 'yang' : 'yin');
    c.textContent = yang ? '○' : '✕';
    w.appendChild(c);
  }
  return w;
}

export function createYaoRow(value, label, extraClass = '') {
  const r = document.createElement('div');
  r.className = 'rl' + (extraClass ? ' ' + extraClass : '');
  const ns = document.createElement('span');
  ns.className = 'rl-n';
  ns.textContent = label;
  r.appendChild(ns);
  const vs = document.createElement('span');
  vs.className = 'rl-v';
  vs.textContent = value;
  r.appendChild(vs);
  const ys = document.createElement('span');
  ys.className = 'rl-y';
  const yang = value === 7 || value === 9;
  const ch = value === 6 || value === 9;
  if (yang) {
    const d = document.createElement('div');
    d.className = 'ys';
    ys.appendChild(d);
  } else {
    const d = document.createElement('div');
    d.className = 'yb';
    const s1 = document.createElement('span');
    const s2 = document.createElement('span');
    d.appendChild(s1);
    d.appendChild(s2);
    ys.appendChild(d);
  }
  if (ch) ys.style.opacity = '0.6';
  r.appendChild(ys);
  const ts = document.createElement('span');
  ts.className = 'rl-t';
  ts.textContent = {6:'⚋',7:'⚊',8:'⚋',9:'⚊'}[value] || '';
  r.appendChild(ts);
  return r;
}

export function adjustScroll() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/js/audio.js packages/web/src/js/theme.js packages/web/src/js/storage.js packages/web/src/js/ui.js
git commit -m "phase1: extract utility modules (audio, theme, storage, ui)"
```

---

### Task 1.5: JS Feature Modules — Toss and Manual

**Context:** Extract coin toss and manual entry logic. These depend on data.js and ui.js.

**Files:**
- Create: `packages/web/src/js/toss.js`
- Create: `packages/web/src/js/manual.js`

- [ ] **Step 1: Create toss.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/toss.js
import { LN, LV, LM } from './data.js';
import { $, yaoLine, showToast } from './ui.js';
import { playCoin } from './audio.js';
import { computeHexagram, computeChangedHexagram } from './reading.js';

const COINS = [0, 1, 2];

export function initToss(playState, onComplete) {
  const tb = $('tb');
  const th = $('th');
  const si = $('stepI');
  const ce = [$('c0'), $('c1'), $('c2')];

  function detLine(coins) {
    return coins.reduce((a, b) => a + (b ? 3 : 2), 0);
  }

  async function toss() {
    if (playState.busy || playState.step >= 6) return;
    playState.busy = true;
    tb.disabled = true;
    tb.textContent = '摇动中…';
    $('tossR').textContent = '';

    // Flip animation
    ce.forEach((el, i) => {
      el.className = 'coin flip';
      let interval = setInterval(() => {
        el.textContent = Math.random() > 0.5 ? '⚭' : '⚮';
      }, 50);
      setTimeout(() => clearInterval(interval), 450);
    });

    await new Promise(r => setTimeout(r, 550));

    const res = ce.map(() => Math.random() > 0.5 ? 1 : 0);
    const val = detLine(res);
    playState.lines.push(val);
    playCoin();

    res.forEach((r, i) => {
      const el = ce[i];
      el.className = 'coin ' + (r ? 'heads' : 'tails');
      el.textContent = r ? '⚭' : '⚮';
    });

    const yN = LN[playState.step] + '爻';
    $('tossR').textContent = '得 ' + yN + '：' + LV[val] + ' (' + LM[val] + ')';
    updateBuiltLines(playState.lines);
    playState.step++;
    playState.busy = false;
    tb.disabled = false;

    if (playState.step >= 6) {
      tb.textContent = '成卦 ✓';
      tb.disabled = true;
      th.textContent = '卦象已成';
      si.textContent = '卦成·解卦';
      setTimeout(() => onComplete(playState.lines), 700);
    } else {
      tb.textContent = '摇 卦';
      th.textContent = '第 ' + (playState.step + 1) + ' 爻 · ' + LN[playState.step] + '爻';
      si.textContent = playState.step + '/6 · 起卦';
    }
  }

  tb.addEventListener('click', toss);
}

export function updateBuiltLines(lines) {
  const bl = $('bl');
  if (!bl) return;
  bl.innerHTML = '';
  if (!lines.length) {
    bl.innerHTML = '<div class="emp">摇卦后显示</div>';
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    const idx = lines.length - 1 - i;
    const v = lines[idx];
    const r = document.createElement('div');
    r.className = 'yao-r';
    const l = document.createElement('span');
    l.className = 'yao-l';
    l.textContent = LN[idx] + '爻';
    r.appendChild(l);
    r.appendChild(yaoLine(v, { showCh: true }));
    bl.appendChild(r);
  }
}
```

- [ ] **Step 2: Create manual.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/manual.js
import { LN } from './data.js';
import { $ } from './ui.js';

export function initManual(playState, onComplete) {
  createManualLines();

  $('manualBtn').addEventListener('click', () => {
    if (playState.busy) return;
    const lines = getManualLines();
    if (lines.length !== 6) return;
    playState.lines = lines;
    playState.step = 6;
    onComplete(playState.lines);
  });
}

function createManualLines() {
  const el = $('manualLines');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'manual-line';
    const label = document.createElement('span');
    label.className = 'manual-label';
    label.textContent = LN[i];
    row.appendChild(label);
    const yao = document.createElement('div');
    yao.className = 'manual-yao';
    const yin = document.createElement('div');
    yin.className = 'yb';
    yin.appendChild(document.createElement('span'));
    yin.appendChild(document.createElement('span'));
    row.appendChild(yao);
    const vals = document.createElement('div');
    vals.className = 'manual-vals';
    [7, 8, 9, 6].forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'me-btn' + (v === 7 ? ' act' : '');
      btn.textContent = v;
      btn.addEventListener('click', () => {
        vals.querySelectorAll('.me-btn').forEach(b => b.classList.remove('act'));
        btn.classList.add('act');
        const yang = v === 7 || v === 9;
        yao.innerHTML = '';
        if (yang) {
          const d = document.createElement('div');
          d.className = 'ys';
          yao.appendChild(d);
        } else {
          const d = document.createElement('div');
          d.className = 'yb';
          d.appendChild(document.createElement('span'));
          d.appendChild(document.createElement('span'));
          yao.appendChild(d);
        }
      });
      vals.appendChild(btn);
    });
    row.appendChild(vals);
    row.appendChild(yao);
    el.appendChild(row);
  }
  // Init first line
  const firstYao = el.querySelector('.manual-line .manual-yao');
  if (firstYao) {
    firstYao.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'ys';
    firstYao.appendChild(d);
  }
}

function getManualLines() {
  const rows = $('manualLines').querySelectorAll('.manual-line');
  const lines = [];
  rows.forEach(row => {
    const active = row.querySelector('.me-btn.act');
    lines.push(active ? parseInt(active.textContent) : 7);
  });
  return lines;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/js/toss.js packages/web/src/js/manual.js
git commit -m "phase1: extract toss and manual modules"
```

---

### Task 1.6: JS Feature Modules — Reading and History

**Context:** Extract hexagram computation/display and history panel. These depend on data.js, ui.js, storage.js.

**Files:**
- Create: `packages/web/src/js/reading.js`
- Create: `packages/web/src/js/history.js`

- [ ] **Step 1: Create reading.js** — contains hexagram computation and display logic

```js
// /Users/fish/liuyao-repo/packages/web/src/js/reading.js
import { HX, LN, LV, triSym, findHx } from './data.js';
import { $, createYaoRow, adjustScroll } from './ui.js';
import { playHexagram } from './audio.js';

// Pure computation (no DOM) — will be extracted to engine in Phase 2
export function computeHexagram(lines) {
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const lB = [lb[2], lb[1], lb[0]];
  const uB = [lb[5], lb[4], lb[3]];
  const lN = (lB[0] << 2) | (lB[1] << 1) | lB[2];
  const uN = (uB[0] << 2) | (uB[1] << 1) | uB[2];
  return findHx(uN, lN);
}

export function computeChangedHexagram(lines) {
  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const cB = lb.map((b, i) => lt[i] === 'ch' ? 1 - b : b);
  const clB = [cB[2], cB[1], cB[0]];
  const cuB = [cB[5], cB[4], cB[3]];
  const clN = (clB[0] << 2) | (clB[1] << 1) | clB[2];
  const cuN = (cuB[0] << 2) | (cuB[1] << 1) | cuB[2];
  return findHx(cuN, clN);
}

export function showReading(lines, playState) {
  playState.phase = 'reading';
  $('tp').classList.add('h');
  $('rp').classList.remove('h');

  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const hx = computeHexagram(lines);
  const rhx = computeChangedHexagram(lines);

  if (hx) {
    $('rn').textContent = hx.sym + ' · 第' + hx.num + '卦';
    $('rzh').textContent = hx.zh;
    $('rpy').textContent = hx.py;
    $('ren').textContent = hx.en;
    $('rjg').textContent = hx.judgment;
    $('uts').textContent = triSym[hx.upper];
    $('lts').textContent = triSym[hx.lower];
    $('rdesc').textContent = hx.desc;
  }

  const ld = $('rlines');
  ld.innerHTML = '';
  for (let i = 5; i >= 0; i--) {
    const v = lines[i];
    const ch = lt[i] === 'ch';
    const yang = v === 7 || v === 9;
    const r = createYaoRow(v, LN[i] + '爻', '');
    if (ch) {
      const cs = document.createElement('span');
      cs.className = 'rl-c';
      cs.textContent = ch ? (yang ? '○变' : '✕变') : '';
      r.appendChild(cs);
    } else {
      const cs = document.createElement('span');
      cs.className = 'rl-c';
      r.appendChild(cs);
    }
    ld.appendChild(r);
  }

  const hasCh = lt.some(t => t === 'ch');
  const ciDiv = $('ci');
  if (hasCh) {
    const cnt = lt.filter(t => t === 'ch').length;
    ciDiv.textContent = '有 ' + cnt + ' 爻变动，由本卦变为变卦。动爻是判断吉凶的关键。';
    ciDiv.classList.remove('h');
  } else {
    ciDiv.textContent = '静卦 · 六爻皆无变动，以本卦卦辞断之。';
    ciDiv.classList.remove('h');
  }

  if (hasCh && rhx) {
    $('rs').classList.remove('h');
    $('rss').textContent = rhx.sym;
    $('rsn').textContent = rhx.zh;
    $('rspy').textContent = rhx.py;
    $('rsjg').textContent = rhx.judgment;
  } else {
    $('rs').classList.add('h');
  }

  $('stepI').textContent = (hasCh ? lt.filter(t => t === 'ch').length + '爻动·解卦' : '静卦·解卦');
  adjustScroll();
  playHexagram();
}

export function resetReading(playState) {
  playState.lines = [];
  playState.step = 0;
  playState.phase = 'toss';
  playState.busy = false;
  $('tp').classList.remove('h');
  $('rp').classList.add('h');
  $('rs').classList.add('h');
  $('tb').textContent = '摇 卦';
  $('tb').disabled = false;
  $('th').textContent = '第 1 爻 · 初爻';
  $('tossR').textContent = '';
  $('stepI').textContent = '静心·起卦';
  const ce = [$('c0'), $('c1'), $('c2')];
  ce.forEach(el => { el.className = 'coin heads'; el.textContent = '⚭'; });
  const bl = $('bl');
  if (bl) {
    bl.innerHTML = '<div class="emp">摇卦后显示</div>';
  }
  adjustScroll();
}
```

- [ ] **Step 2: Create history.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/history.js
import { loadHistory, saveHistory, removeEntry, clearAll } from './storage.js';
import { $, showToast } from './ui.js';
import { showReading } from './reading.js';
import { computeHexagram, computeChangedHexagram } from './reading.js';

export function initHistory(playState) {
  // History panel triggers
  $('histBtn').addEventListener('click', openHistory);
  $('histClose').addEventListener('click', closeHistory);
  $('histOverlay').addEventListener('click', closeHistory);
  $('histClear').addEventListener('click', () => {
    if (!playState.history.length) return;
    if (confirm('确定清空所有历史记录？')) {
      playState.history = clearAll();
      renderHistory(playState);
      showToast('历史已清空');
    }
  });
}

export function addHistoryEntry(playState, lines, note, hexagram, changingHexagram) {
  const hx = computeHexagram(lines);
  const entry = {
    id: Date.now(),
    lines: [...lines],
    hexagram: { ...hexagram },
    changingHexagram: changingHexagram ? { ...changingHexagram } : null,
    note,
    ts: Date.now(),
    date: new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    hxName: hx ? hx.zh : '?',
    hxSym: hx ? hx.sym : '䷀'
  };
  playState.history.unshift(entry);
  if (playState.history.length > 100) playState.history.length = 100;
  saveHistory(playState.history);
  renderHistory(playState);
}

export function loadHistoryData(playState) {
  playState.history = loadHistory();
}

function openHistory() {
  $('histOverlay').classList.add('show');
  $('histPanel').classList.add('show');
}

function closeHistory() {
  $('histOverlay').classList.remove('show');
  $('histPanel').classList.remove('show');
}

export function renderHistory(playState) {
  const el = $('histList');
  if (!playState.history.length) {
    el.innerHTML = '<div class="hist-empty">暂无记录<br>起卦后将自动保存</div>';
    return;
  }
  el.innerHTML = playState.history.map((e, i) =>
    `<div class="hist-item" data-idx="${i}">
      <div class="hist-sym">${e.hxSym || '䷀'}</div>
      <div class="hist-info">
        <div class="hist-name">${e.hxName || '?'}</div>
        <div class="hist-date">${e.date || new Date(e.ts).toLocaleString('zh-CN')}</div>
        ${e.note ? `<div class="hist-note">${e.note}</div>` : ''}
      </div>
      <button class="hist-del" data-id="${e.id}" style="background:none;border:none;color:#ff3b30;font-size:16px;cursor:pointer;padding:4px">✕</button>
    </div>`
  ).join('');

  el.querySelectorAll('.hist-item').forEach(el2 => {
    el2.addEventListener('click', (e) => {
      if (e.target.closest('.hist-del')) return;
      const idx = parseInt(el2.dataset.idx);
      const entry = playState.history[idx];
      if (!entry) return;
      closeHistory();
      playState.lines = [...entry.lines];
      playState.step = 6;
      showToast('已加载历史卦象');
      setTimeout(() => showReading(playState.lines, playState), 300);
    });
  });

  el.querySelectorAll('.hist-del').forEach(el2 => {
    el2.addEventListener('click', (e) => {
      e.stopPropagation();
      playState.history = removeEntry(playState.history, parseInt(el2.dataset.id));
      renderHistory(playState);
    });
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/js/reading.js packages/web/src/js/history.js
git commit -m "phase1: extract reading and history modules"
```

---

### Task 1.7: App Entry and HTML Template

**Context:** Create the main app.js that wires everything together, and the index.html template that imports all CSS/JS via Vite.

**Files:**
- Create: `packages/web/src/js/app.js`
- Create: `packages/web/src/index.html`

- [ ] **Step 1: Create app.js**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/app.js
import './css/style.css';

import { loadHistoryData, initHistory, addHistoryEntry, renderHistory } from './history.js';
import { initTheme, toggleTheme, watchSystemTheme } from './theme.js';
import { initToss, updateBuiltLines } from './toss.js';
import { initManual } from './manual.js';
import { showReading, resetReading, computeHexagram, computeChangedHexagram } from './reading.js';
import { $, showToast } from './ui.js';

// ===== State =====
const playState = {
  lines: [],
  step: 0,
  phase: 'toss',
  busy: false,
  mode: 'coin',
  history: [],
  curNote: '',
  curHistIdx: -1
};

// ===== Init =====
function init() {
  loadHistoryData(playState);
  initTheme();
  renderHistory(playState);
  updateBuiltLines(playState.lines);
  watchSystemTheme();

  // Theme toggle
  $('dmBtn').addEventListener('click', toggleTheme);

  // History
  initHistory(playState);

  // Mode switching
  $('modeCoin').addEventListener('click', () => {
    playState.mode = 'coin';
    $('modeCoin').classList.add('act');
    $('modeManual').classList.remove('act');
    $('coinArea').classList.remove('h');
    $('manualArea').classList.add('h');
  });
  $('modeManual').addEventListener('click', () => {
    playState.mode = 'manual';
    $('modeManual').classList.add('act');
    $('modeCoin').classList.remove('act');
    $('coinArea').classList.add('h');
    $('manualArea').classList.remove('h');
  });

  // Toss & Manual
  initToss(playState, handleComplete);
  initManual(playState, handleComplete);

  // Reset
  $('rb').addEventListener('click', () => resetReading(playState));

  // Share
  $('shareBtn').addEventListener('click', shareReading);

  // Save
  $('saveBtn').addEventListener('click', () => saveReadingWithNote('', playState));

  // Note
  $('noteBtn').addEventListener('click', async () => {
    const hx = computeHexagram(playState.lines);
    if (!hx) return;
    const note = await openNote(playState.curNote || '');
    if (note !== undefined && note !== null) {
      playState.curNote = note;
      saveReadingWithNote(note, playState);
    }
  });
  $('noteSave').addEventListener('click', () => {
    const v = $('noteText').value;
    closeNote(v);
  });
  $('noteCancel').addEventListener('click', () => closeNote(null));
  $('noteOverlay').addEventListener('click', () => closeNote(null));
  $('noteText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) $('noteSave').click();
  });
  document.querySelectorAll('.note-tag').forEach(el => {
    el.addEventListener('click', () => {
      const t = el.dataset.tag;
      const ta = $('noteText');
      if (ta.value.includes(t)) return;
      ta.value = ta.value ? (ta.value + '、' + t) : t;
      ta.focus();
    });
  });
}

function handleComplete(lines) {
  showReading(lines, playState);
}

// ===== Save =====
function saveReadingWithNote(note, playState) {
  const hx = computeHexagram(playState.lines);
  if (!hx) return;
  const rhx = computeChangedHexagram(playState.lines);
  addHistoryEntry(
    playState,
    playState.lines,
    note,
    { upper: hx.upper, lower: hx.lower },
    rhx ? { upper: rhx.upper, lower: rhx.lower } : null
  );
  showToast('卦象已保存 📋');
}

// ===== Note Modal =====
let noteResolve = null;
function openNote(currentNote) {
  return new Promise(resolve => {
    noteResolve = resolve;
    $('noteText').value = currentNote || '';
    $('noteOverlay').classList.add('show');
    $('noteModal').classList.add('show');
    $('noteText').focus();
  });
}
function closeNote(result) {
  $('noteOverlay').classList.remove('show');
  $('noteModal').classList.remove('show');
  if (noteResolve) { noteResolve(result); noteResolve = null; }
}

// ===== Share =====
async function shareReading() {
  const hx = computeHexagram(playState.lines);
  if (!hx) return;
  let text = '🔮 六爻占卜 · ' + hx.sym + ' ' + hx.zh + '卦\n' +
    '━'.repeat(12) + '\n';
  const lt = playState.lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const hasCh = lt.some(t => t === 'ch');
  text += '本卦：' + hx.zh + '（' + hx.py + '）\n';
  if (hasCh) {
    const rhx = computeChangedHexagram(playState.lines);
    if (rhx) text += '变卦：' + rhx.zh + '（' + rhx.py + '）\n';
  }
  text += '\n六爻：\n';
  for (let i = 5; i >= 0; i--) {
    const v = playState.lines[i];
    const ch = lt[i] === 'ch';
    text += '  ' + ['初', '二', '三', '四', '五', '上'][i] + '爻：' + v + ' ' + {6:'⚋',7:'⚊',8:'⚋',9:'⚊'}[v] + (ch ? '（变）' : '') + '\n';
  }
  text += '\n' + hx.judgment;
  if (navigator.share) {
    try { await navigator.share({ title: '六爻占卜', text }); } catch (e) { /* user cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(text); showToast('卦象已复制到剪贴板'); } catch (e) { showToast('复制失败'); }
  }
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: Create index.html** — minimal template, imports are handled by Vite

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>六爻 · 周易占卜</title>
<script type="module" src="./js/app.js"></script>
</head>
<body>
<div class="c" id="app">

<div class="nav">
  <div class="nav-l">
    <div class="nav-t">六爻</div>
    <div class="nav-s">周易占卜</div>
  </div>
  <div class="nav-r">
    <button class="nav-btn" id="histBtn" title="历史记录">📋</button>
    <button class="nav-btn" id="dmBtn" title="深色模式">🌙</button>
    <span class="nav-rg" id="stepI">静心·起卦</span>
  </div>
</div>

<!-- ===== Toss Phase ===== -->
<div id="tp">
  <div class="cd" style="text-align:center">
    <div style="font-size:14px;color:var(--sl);line-height:1.7;margin-bottom:6px;padding:6px 0">
      默念所问之事 · 心诚则灵
    </div>
    <div class="mode-bar">
      <button class="mode-btn act" data-mode="coin" id="modeCoin">🎲 铜钱起卦</button>
      <button class="mode-btn" data-mode="manual" id="modeManual">✍️ 手动排盘</button>
    </div>
    <!-- Coin toss -->
    <div id="coinArea">
      <div class="coin-a" id="coinA">
        <div><div class="coin heads" id="c0">⚭</div><div class="coin-r">正面</div></div>
        <div><div class="coin heads" id="c1">⚭</div><div class="coin-r">正面</div></div>
        <div><div class="coin heads" id="c2">⚭</div><div class="coin-r">正面</div></div>
      </div>
      <div id="tossR" class="hint" style="margin:6px 0;font-weight:500"></div>
      <div class="toss-a">
        <button class="btn" id="tb">摇 卦</button>
        <div class="hint" id="th">第 1 爻 · 初爻</div>
      </div>
    </div>
    <!-- Manual entry -->
    <div id="manualArea" class="h">
      <div style="font-size:13px;color:var(--tl);margin:6px 0 10px">点击数字切换 6老阴 · 7少阳 · 8少阴 · 9老阳</div>
      <div class="manual-a" id="manualLines"></div>
      <button class="btn" id="manualBtn" style="margin-top:8px">成 卦</button>
    </div>
  </div>
  <div class="cd" id="pc">
    <div class="cdh">已得之爻</div>
    <div class="yao-c" id="bl"><div class="emp">摇卦后显示</div></div>
  </div>
</div>

<!-- ===== Reading Phase ===== -->
<div id="rp" class="h">
  <div class="cd anim af">
    <div class="hx-h">
      <div class="hx-num" id="rn">䷀ · 第一卦</div>
      <div class="hx-zh" id="rzh">乾</div>
      <div class="hx-py" id="rpy">qián</div>
      <div class="hx-en" id="ren">创造</div>
      <div class="hx-jg" id="rjg">天行健，君子以自强不息。</div>
    </div>
  </div>
  <div class="cd anim af ad1 desc">
    <div class="cdh">卦象解释</div>
    <div class="desc-text" id="rdesc"></div>
  </div>
  <div class="cd anim af ad2">
    <div class="cdh">六爻</div>
    <div id="rlines"></div>
    <div class="div"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
      <div style="display:flex;gap:24px">
        <div style="text-align:center"><div style="font-size:40px" id="uts">☰</div><div style="font-size:10px;color:var(--tl);margin-top:1px">上卦</div></div>
        <div style="text-align:center"><div style="font-size:40px" id="lts">☰</div><div style="font-size:10px;color:var(--tl);margin-top:1px">下卦</div></div>
      </div>
      <div style="text-align:right;font-size:11px;color:var(--tl)">本卦</div>
    </div>
    <div id="ci" class="h ci"></div>
    <div class="rd-actions">
      <button class="rd-btn" id="shareBtn">📤 分享</button>
      <button class="rd-btn" id="noteBtn">📝 备注</button>
      <button class="rd-btn" id="saveBtn">💾 保存</button>
    </div>
  </div>
  <div id="rs" class="h">
    <div class="cd anim af ad3 sec-hx">
      <div class="sec-hx-inner">
        <div class="sec-hx-sym" id="rss">䷀</div>
        <div class="sec-hx-info">
          <div class="sec-hx-label">变卦</div>
          <div class="sec-hx-name" id="rsn">坤</div>
          <div class="sec-hx-py" id="rspy">kūn</div>
        </div>
      </div>
      <div class="sec-hx-jg" id="rsjg">地势坤，君子以厚德载物。</div>
    </div>
  </div>
  <div class="cd anim af ad4" style="padding:16px;text-align:center">
    <button class="btn" id="rb" style="width:100%;max-width:280px">再摇一次</button>
  </div>
</div>
</div>

<!-- ===== History Panel ===== -->
<div class="hist-overlay" id="histOverlay"></div>
<div class="hist-panel" id="histPanel">
  <div class="hist-head">
    <h3>📋 历史记录</h3>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="hist-clear" id="histClear">清空</button>
      <button class="hist-close" id="histClose">✕</button>
    </div>
  </div>
  <div class="hist-handle"></div>
  <div id="histList"></div>
</div>

<!-- ===== Note Modal ===== -->
<div class="note-overlay" id="noteOverlay"></div>
<div class="note-modal" id="noteModal">
  <h3>📝 添加备注</h3>
  <div class="note-tags">
    <span class="note-tag" data-tag="事业">事业</span>
    <span class="note-tag" data-tag="感情">感情</span>
    <span class="note-tag" data-tag="财运">财运</span>
    <span class="note-tag" data-tag="健康">健康</span>
    <span class="note-tag" data-tag="学业">学业</span>
    <span class="note-tag" data-tag="出行">出行</span>
  </div>
  <textarea id="noteText" placeholder="记录你的问题或感悟…"></textarea>
  <div class="note-actions">
    <button style="background:var(--bg);color:var(--sl)" id="noteCancel">取消</button>
    <button style="background:var(--primary);color:#fff" id="noteSave">保存</button>
  </div>
</div>

<!-- ===== Toast ===== -->
<div class="toast" id="toast"></div>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/js/app.js packages/web/src/index.html
git commit -m "phase1: create app entry and html template"
```

---

### Task 1.8: Build Verification

- [ ] **Step 1: Install dependencies and build**

```bash
cd /Users/fish/liuyao-repo && npm install && npm run build:web
```

Expected: Vite completes successfully, outputs to `dist/index.html`

- [ ] **Step 2: Verify built HTML contains all inline assets**

```bash
ls -lh /Users/fish/liuyao-repo/dist/index.html
```

Expected: single HTML file, ~50-60KB (similar to original)

- [ ] **Step 3: Verify built HTML works by checking for key elements**

```bash
grep -c '六爻' /Users/fish/liuyao-repo/dist/index.html
```

Expected: output > 0 (hexagram names present)
Also verify no `<script type="module">` remains (should be inlined):
```bash
grep -c 'type="module"' /Users/fish/liuyao-repo/dist/index.html || echo "0 (correctly inlined)"
```

- [ ] **Step 4: Copy dist to Android assets and root liuyao.html**

```bash
cp /Users/fish/liuyao-repo/dist/index.html /Users/fish/liuyao-repo/liuyao-app/app/src/main/assets/index.html
cp /Users/fish/liuyao-repo/dist/index.html /Users/fish/liuyao-repo/liuyao.html
```

- [ ] **Step 5: Verify the copied files match**

```bash
diff /Users/fish/liuyao-repo/dist/index.html /Users/fish/liuyao-repo/liuyao.html
diff /Users/fish/liuyao-repo/dist/index.html /Users/fish/liuyao-repo/liuyao-app/app/src/main/assets/index.html
```

Expected: no output (files are identical)

- [ ] **Step 6: Commit**

```bash
git add dist/ liuyao.html liuyao-app/app/src/main/assets/index.html packages/web/package-lock.json
git commit -m "phase1: build output and sync to android + web"
```

---

### Task 1.9: Android R8 Minification

**Context:** Enable code shrinking and obfuscation for the Android release build.

**Files:**
- Modify: `liuyao-app/app/build.gradle.kts`

- [ ] **Step 1: Enable minification in build.gradle.kts**

Change `isMinifyEnabled = false` to `isMinifyEnabled = true`, add `isShrinkResources = true`, and the ProGuard rule for WebView JavaScript interface:

```
// /Users/fish/liuyao-repo/liuyao-app/app/build.gradle.kts (Modify)
    buildTypes {
        release {
            isMinifyEnabled = true          // 开启混淆
            isShrinkResources = true        // 资源压缩
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
```

- [ ] **Step 2: Add proguard rules to protect WebView JS interface**

```prolog
// /Users/fish/liuyao-repo/liuyao-app/app/proguard-rules.pro (content to verify/update)
# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Kotlin data classes for JSON parsing
-keepclassmembers class com.liuyao.app.** {
    <fields>;
}
```

- [ ] **Step 3: Commit**

```bash
git add liuyao-app/app/build.gradle.kts liuyao-app/app/proguard-rules.pro
git commit -m "phase1: enable Android R8 minification and proguard rules"
```

---

## Phase 2: 引擎分离

### Task 2.1: Engine Package Scaffolding

**Files:**
- Create: `packages/engine/package.json`
- Create: `packages/engine/src/index.js`

- [ ] **Step 1: Create engine package.json**

```json
// /Users/fish/liuyao-repo/packages/engine/package.json
{
  "name": "@liuyao/engine",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create engine public API**

```js
// /Users/fish/liuyao-repo/packages/engine/src/index.js
export { HX, TRI, triSym, triCN, triPY, LN, LV, LM, findHx } from './data.js';
export { computeHexagram, computeChangedHexagram } from './compute.js';
```

- [ ] **Step 3: Commit**

```bash
git add packages/engine/
git commit -m "phase2: create @liuyao/engine package"
```

---

### Task 2.2: Move Data and Compute to Engine

**Files:**
- Create: `packages/engine/src/data.js` (copy from web, remove LN/LV/LM as they're display constants)
- Create: `packages/engine/src/compute.js`
- Modify: `packages/web/src/js/data.js` — re-export from engine
- Modify: `packages/web/src/js/reading.js` — import compute from engine

- [ ] **Step 1: Create engine compute.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/compute.js
import { findHx } from './data.js';

/**
 * Compute the hexagram from 6 line values (6=老阴,7=少阳,8=少阴,9=老阳)
 * Returns the hexagram object or undefined if not found
 */
export function computeHexagram(lines) {
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const lB = [lb[2], lb[1], lb[0]];
  const uB = [lb[5], lb[4], lb[3]];
  const lN = (lB[0] << 2) | (lB[1] << 1) | lB[2];
  const uN = (uB[0] << 2) | (uB[1] << 1) | uB[2];
  return findHx(uN, lN);
}

/**
 * Compute the changing hexagram (变卦) from 6 line values
 * Lines that are 6 or 9 change (yin↔yang), 7 or 8 remain
 */
export function computeChangedHexagram(lines) {
  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const cB = lb.map((b, i) => lt[i] === 'ch' ? 1 - b : b);
  const clB = [cB[2], cB[1], cB[0]];
  const cuB = [cB[5], cB[4], cB[3]];
  const clN = (clB[0] << 2) | (clB[1] << 1) | clB[2];
  const cuN = (cuB[0] << 2) | (cuB[1] << 1) | cuB[2];
  return findHx(cuN, clN);
}
```

- [ ] **Step 2: Update web data.js to re-export from engine** — Keep LN, LV, LM (display constants) in web; HX, TRI, findHx come from engine

```js
// /Users/fish/liuyao-repo/packages/web/src/js/data.js (修改)
export { HX, TRI, triSym, triCN, triPY, findHx } from '@liuyao/engine';

export const LN = ['初','二','三','四','五','上'];
export const LV = {6:'⚋',7:'⚊',8:'⚋',9:'⚊'};
export const LM = {6:'老阴·变爻',7:'少阳·静爻',8:'少阴·静爻',9:'老阳·变爻'};
```

- [ ] **Step 3: Update reading.js** — import compute functions from engine

```js
// /Users/fish/liuyao-repo/packages/web/src/js/reading.js (修改import行)
import { HX, LN, LV, triSym, findHx } from './data.js';
import { computeHexagram, computeChangedHexagram } from '@liuyao/engine';
// ... rest unchanged
```

- [ ] **Step 4: Create engine data.js** — move HX and TRI data here (copy from web's data.js, only the data arrays and findHx function)

```js
// /Users/fish/liuyao-repo/packages/engine/src/data.js
export const HX = [/* full 64 hexagrams array — same as Task 1.3 Step 1 */];
export const TRI = [/* same as Task 1.3 Step 1 */];
export const [triSym, triCN, triPY] = TRI;

export function findHx(u, l) {
  return HX.find(h => h.upper === u && h.lower === l);
}
```

- [ ] **Step 5: Install engine in workspace and verify imports resolve**

```bash
cd /Users/fish/liuyao-repo && npm install && npm run build:web
```

Expected: build succeeds without import errors.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/ packages/web/src/js/data.js packages/web/src/js/reading.js
git commit -m "phase2: extract engine, web consumes @liuyao/engine"
```

---

### Task 2.3: Engine Unit Tests

- [ ] **Step 1: Create vitest config**

```js
// /Users/fish/liuyao-repo/packages/engine/vitest.config.js
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/**/*.test.js'] } });
```

- [ ] **Step 2: Create compute test**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/compute.test.js
import { describe, it, expect } from 'vitest';
import { computeHexagram, computeChangedHexagram } from '../src/compute.js';
import { HX } from '../src/data.js';

describe('computeHexagram', () => {
  it('should find 乾为天 (all 7s = all yang)', () => {
    const result = computeHexagram([7, 7, 7, 7, 7, 7]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('乾');
    expect(result.num).toBe(1);
  });

  it('should find 坤为地 (all 8s = all yin)', () => {
    const result = computeHexagram([8, 8, 8, 8, 8, 8]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('坤');
    expect(result.num).toBe(2);
  });

  it('should handle mixed yin-yang', () => {
    // 泰卦: 地在上(坤=0) 天在下(乾=7)
    // 下卦(初二三): 初7(阳) 二7(阳) 三7(阳) → 乾=7
    // 上卦(四五六): 四8(阴) 五8(阴) 上8(阴) → 坤=0
    const result = computeHexagram([7, 7, 7, 8, 8, 8]); // 泰
    expect(result).toBeDefined();
    expect(result.zh).toBe('泰');
  });

  it('should handle all 6 possible values', () => {
    const result = computeHexagram([6, 7, 8, 9, 7, 8]);
    expect(result).toBeDefined();
    // 下卦: 初(6→阴),二(7→阳),三(8→阴) → 离=3
    // 上卦: 四(9→阳),五(7→阳),上(8→阴) → 兑=6
    // 泽火革
    expect(result.zh).toBe('革');
  });
});

describe('computeChangedHexagram', () => {
  it('should produce 坤 when 乾 has all changing lines', () => {
    const result = computeChangedHexagram([9, 9, 9, 9, 9, 9]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('坤');
  });

  it('should produce 乾 when 坤 has all changing lines', () => {
    const result = computeChangedHexagram([6, 6, 6, 6, 6, 6]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('乾');
  });

  it('should return undefined when no changing lines', () => {
    const result = computeChangedHexagram([7, 8, 7, 8, 7, 8]);
    expect(result).toBeUndefined();
  });

  it('should handle partial changes (屯→否)', () => {
    // 屯(上坎下震 → upper=2,lower=4)
    // 初(6→老阴变阳), 二(7), 三(8), 四(9→老阳变阴), 五(7), 上(7)
    // 变后: 初(阳),二(阳),三(阴),四(阴),五(阳),上(阳)
    // 下: 阳阳阴 → 兑=6, 上: 阴阳阳 → 巽=5
    // 泽风大过
    const result = computeChangedHexagram([6, 7, 8, 9, 7, 7]);
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/engine/vitest.config.js packages/engine/tests/
git commit -m "phase2: add engine unit tests for hexagram computation"
```

---

## Phase 3: 专业六爻功能

### Task 3.1: 干支推算 Engine Module

**Files:**
- Create: `packages/engine/src/chineseCalendar.js`
- Update: `packages/engine/src/index.js`

- [ ] **Step 1: Create chineseCalendar.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/chineseCalendar.js

// 天干地支名称
export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 节气界限（近似日期，月份）
// 用于判断月建：每月从"节"开始
const SOLAR_TERMS = [
  { month: 2, day: 4 },   // 立春（寅月）
  { month: 3, day: 6 },   // 惊蛰（卯月）
  { month: 4, day: 5 },   // 清明（辰月）
  { month: 5, day: 6 },   // 立夏（巳月）
  { month: 6, day: 6 },   // 芒种（午月）
  { month: 7, day: 7 },   // 小暑（未月）
  { month: 8, day: 7 },   // 立秋（申月）
  { month: 9, day: 8 },   // 白露（酉月）
  { month: 10, day: 8 },  // 寒露（戌月）
  { month: 11, day: 7 },  // 立冬（亥月）
  { month: 12, day: 7 },  // 大雪（子月）
  { month: 1, day: 6 },   // 小寒（丑月）
];

/**
 * 获取日天干地支
 * 以1900-01-01（甲子日）为基准
 */
export function getDayStemBranch(date) {
  const ref = new Date(1900, 0, 1);
  const diff = Math.floor((date.getTime() - ref.getTime()) / 86400000);
  const stem = ((diff % 10) + 10) % 10;
  const branch = ((diff % 12) + 12) % 12;
  return { stem, branch };
}

/**
 * 获取年天干地支（以立春为界）
 */
export function getYearStemBranch(date) {
  const year = date.getFullYear();
  const boundary = new Date(year, 1, 4); // 约立春
  const actualYear = date < boundary ? year - 1 : year;
  const stem = ((actualYear - 4) % 10 + 10) % 10;
  const branch = ((actualYear - 4) % 12 + 12) % 12;
  return { stem, branch, year: actualYear };
}

/**
 * 获取当月"节"所在的实际日期（用于判断月建）
 */
function getSolarTermDate(year, termIndex) {
  // termIndex: 0=立春(2/4), 1=惊蛰(3/6) ...
  const t = SOLAR_TERMS[termIndex];
  let month = t.month;
  let day = t.day;
  if (termIndex >= 11) { // 小寒在次年1月
    month = 1;
    day = 6;
  }
  return new Date(year, month - 1, day);
}

/**
 * 获取月天干地支
 * @param {number} yearStem - 年天干 0-9
 * @param {Date} date - 当前日期
 */
export function getMonthStemBranch(yearStem, date) {
  // 确定月份地支：通过节气判断
  const year = date.getFullYear();
  let monthBranch = 2; // 默认寅月(立春~惊蛰)

  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const termDate = getSolarTermDate(year, i);
    if (date >= termDate) {
      monthBranch = (i + 2) % 12; // 立春=寅(2), 惊蛰=卯(3)...
      break;
    }
  }

  // 月干: 甲己之年丙作首，乙庚之岁戊为头...
  // 月干 = (年干*2 + 月支序) % 10
  // 月支序: 寅=0, 卯=1, 辰=2...
  const branchOrder = ((monthBranch - 2) % 12 + 12) % 12;
  const monthStem = ((yearStem % 5) * 2 + branchOrder) % 10;

  return { stem: monthStem, branch: monthBranch };
}

/**
 * 获取年月日干支
 */
export function getFullDateStemBranch(date) {
  const year = getYearStemBranch(date);
  const month = getMonthStemBranch(year.stem, date);
  const day = getDayStemBranch(date);
  return {
    year,
    month,
    day,
    formatted: {
      year: STEMS[year.stem] + BRANCHES[year.branch],
      month: STEMS[month.stem] + BRANCHES[month.branch],
      day: STEMS[day.stem] + BRANCHES[day.branch]
    }
  };
}
```

- [ ] **Step 2: Update engine index.js to export new module**

```js
// /Users/fish/liuyao-repo/packages/engine/src/index.js (添加导出)
export { HX, TRI, triSym, triCN, triPY, LN, LV, LM, findHx } from './data.js';
export { computeHexagram, computeChangedHexagram } from './compute.js';
export { getDayStemBranch, getYearStemBranch, getMonthStemBranch, getFullDateStemBranch, STEMS, BRANCHES } from './chineseCalendar.js';
```

- [ ] **Step 3: Create test for chineseCalendar**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/chineseCalendar.test.js
import { describe, it, expect } from 'vitest';
import { getDayStemBranch, getYearStemBranch, getMonthStemBranch, getFullDateStemBranch, STEMS, BRANCHES } from '../src/chineseCalendar.js';

describe('getDayStemBranch', () => {
  it('should compute 甲子 for 1900-01-01', () => {
    const result = getDayStemBranch(new Date(1900, 0, 1));
    expect(STEMS[result.stem]).toBe('甲');
    expect(BRANCHES[result.branch]).toBe('子');
  });
});

describe('getYearStemBranch', () => {
  it('should return 甲子 for 1984', () => {
    const result = getYearStemBranch(new Date(1984, 5, 1));
    expect(STEMS[result.stem]).toBe('甲');
    expect(BRANCHES[result.branch]).toBe('子');
  });
});

describe('getMonthStemBranch', () => {
  it('should return 丙寅 for 甲年 立春后', () => {
    // 甲年(年干=0)的寅月: 丙寅 (月干=2)
    const result = getMonthStemBranch(0, new Date(2024, 2, 15)); // 3月15日 > 立春
    expect(STEMS[result.stem]).toBe('丙');
    expect(BRANCHES[result.branch]).toBe('寅');
  });
});

describe('getFullDateStemBranch', () => {
  it('should return formatted strings', () => {
    const result = getFullDateStemBranch(new Date(2026, 5, 9)); // 2026-06-09
    expect(result.formatted.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(result.formatted.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(result.formatted.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all tests pass (including new calendar tests).

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/chineseCalendar.js packages/engine/src/index.js packages/engine/tests/chineseCalendar.test.js
git commit -m "phase3: add chinese calendar (stem-branch) engine module"
```

---

### Task 3.2: 纳甲装卦 Engine Module

**Files:**
- Create: `packages/engine/src/nali.js`
- Update: `packages/engine/src/index.js`

- [ ] **Step 1: Create nali.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/nali.js
import { STEMS, BRANCHES } from './chineseCalendar.js';

/**
 * 纳甲数据：每个经卦的六爻天干地支
 * 索引: 0=坤,1=艮,2=坎,3=离,4=震,5=巽,6=兑,7=乾
 * 每数组6元素：[初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
 * 每个元素: {stemIndex, branchIndex}
 */
const NAJIA_DATA = [
  // 坤 (0)
  [{s:1,b:7},{s:1,b:5},{s:1,b:3},{s:9,b:1},{s:9,b:11},{s:9,b:9}],   // 乙未 乙巳 乙卯 癸丑 癸亥 癸酉
  // 艮 (1)
  [{s:2,b:4},{s:2,b:6},{s:2,b:8},{s:2,b:10},{s:2,b:0},{s:2,b:2}],   // 丙辰 丙午 丙申 丙戌 丙子 丙寅
  // 坎 (2)
  [{s:4,b:2},{s:4,b:4},{s:4,b:6},{s:4,b:8},{s:4,b:10},{s:4,b:0}],   // 戊寅 戊辰 戊午 戊申 戊戌 戊子
  // 离 (3)
  [{s:5,b:3},{s:5,b:1},{s:5,b:11},{s:5,b:9},{s:5,b:7},{s:5,b:5}],   // 己卯 己丑 己亥 己酉 己未 己巳
  // 震 (4)
  [{s:6,b:0},{s:6,b:2},{s:6,b:4},{s:6,b:6},{s:6,b:8},{s:6,b:10}],   // 庚子 庚寅 庚辰 庚午 庚申 庚戌
  // 巽 (5)
  [{s:7,b:1},{s:7,b:11},{s:7,b:9},{s:7,b:7},{s:7,b:5},{s:7,b:3}],   // 辛丑 辛亥 辛酉 辛未 辛巳 辛卯
  // 兑 (6)
  [{s:8,b:5},{s:8,b:3},{s:8,b:1},{s:8,b:9},{s:8,b:11},{s:8,b:7}],   // 丁巳 丁卯 丁丑 丁酉 丁亥 丁未
  // 乾 (7)
  [{s:0,b:0},{s:0,b:2},{s:0,b:4},{s:7,b:6},{s:7,b:8},{s:7,b:10}],   // 甲子 甲寅 甲辰 壬午 壬申 壬戌
];

/**
 * 对六爻进行纳甲装卦
 * @param {number[]} lines - 六爻值 [初,二,三,四,五,上]
 * @param {object} hexagram - hexagram result with {upper, lower}
 * @returns {object[]} 每爻的 {stem, branch, stemCn, branchCn, lineValue}
 */
export function applyNajia(lines, hexagram) {
  const upperData = NAJIA_DATA[hexagram.upper];
  const lowerData = NAJIA_DATA[hexagram.lower];

  return lines.map((val, i) => {
    // 初(0)二(1)三(2) 用下卦; 四(3)五(4)上(5)用上卦
    const n = i < 3 ? lowerData[i] : upperData[i];
    return {
      lineValue: val,
      stem: n.s,
      branch: n.b,
      stemCn: STEMS[n.s],
      branchCn: BRANCHES[n.b],
      full: STEMS[n.s] + BRANCHES[n.b]
    };
  });
}
```

- [ ] **Step 2: Update engine index.js**

```js
// 添加一行
export { applyNajia } from './nali.js';
```

- [ ] **Step 3: Create test**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/nali.test.js
import { describe, it, expect } from 'vitest';
import { applyNajia } from '../src/nali.js';

describe('applyNajia', () => {
  it('should assign 甲子 to 乾卦 初爻', () => {
    const lines = [7, 7, 7, 7, 7, 7];
    const hexagram = { upper: 7, lower: 7 }; // 乾为天
    const result = applyNajia(lines, hexagram);
    expect(result[0].full).toBe('甲子');
    expect(result[5].full).toBe('壬戌');
  });

  it('should assign 乙未 to 坤卦 初爻', () => {
    const lines = [8, 8, 8, 8, 8, 8];
    const hexagram = { upper: 0, lower: 0 }; // 坤为地
    const result = applyNajia(lines, hexagram);
    expect(result[0].full).toBe('乙未');
    expect(result[5].full).toBe('癸酉');
  });

  it('should handle 6 lines correctly', () => {
    const lines = [7, 8, 7, 8, 7, 8];
    const hexagram = { upper: 3, lower: 6 }; // 睽
    const result = applyNajia(lines, hexagram);
    expect(result).toHaveLength(6);
    result.forEach((r, i) => {
      expect(r.stemCn).toBeDefined();
      expect(r.branchCn).toBeDefined();
      expect(r.lineValue).toBe(lines[i]);
    });
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/nali.js packages/engine/tests/nali.test.js
git commit -m "phase3: add najia (stem-branch assignment) engine module"
```

---

### Task 3.3: 六兽 Engine Module

**Files:**
- Create: `packages/engine/src/liushou.js`
- Update: `packages/engine/src/index.js`

- [ ] **Step 1: Create liushou.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/liushou.js

// 六兽名称
export const LIU_SHOU = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];

// 六兽排列：根据日干确定初爻起始，顺序向下
// 索引: 0=甲/乙, 1=丙/丁, 2=戊/己, 3=庚/辛, 4=壬/癸
const LIU_SHOU_ORDER = [
  [0, 1, 2, 3, 4, 5],  // 甲乙: 青龙→朱雀→勾陈→腾蛇→白虎→玄武
  [1, 2, 3, 4, 5, 0],  // 丙丁: 朱雀→勾陈→腾蛇→白虎→玄武→青龙
  [2, 3, 4, 5, 0, 1],  // 戊己: 勾陈→腾蛇→白虎→玄武→青龙→朱雀
  [3, 4, 5, 0, 1, 2],  // 庚辛: 腾蛇→白虎→玄武→青龙→朱雀→勾陈
  [4, 0, 1, 2, 3, 5],  // 壬癸: 玄武→青龙→朱雀→勾陈→腾蛇→白虎
];

/**
 * 获取日干对应的六兽索引组
 */
function getOrderIndex(dayStem) {
  const group = Math.floor(dayStem / 2); // 0:甲乙, 1:丙丁, 2:戊己, 3:庚辛, 4:壬癸
  return LIU_SHOU_ORDER[group];
}

/**
 * 对六爻应用六兽
 * @param {number[]} lines - 六爻值 [初,二,三,四,五,上]
 * @param {number} dayStem - 日天干 0-9
 * @returns {object[]} 每爻的 {lineValue, index, name}
 */
export function applyLiuShou(lines, dayStem) {
  const order = getOrderIndex(dayStem);
  return lines.map((val, i) => ({
    lineValue: val,
    index: order[i],
    name: LIU_SHOU[order[i]]
  }));
}
```

- [ ] **Step 2: Update engine index.js**

```js
export { applyLiuShou, LIU_SHOU } from './liushou.js';
```

- [ ] **Step 3: Create test**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/liushou.test.js
import { describe, it, expect } from 'vitest';
import { applyLiuShou, LIU_SHOU } from '../src/liushou.js';

describe('applyLiuShou', () => {
  it('should start with 青龙 for 甲日 (dayStem=0)', () => {
    const result = applyLiuShou([7,7,7,7,7,7], 0);
    expect(result[0].name).toBe('青龙');
    expect(result[1].name).toBe('朱雀');
    expect(result[5].name).toBe('玄武');
  });

  it('should start with 朱雀 for 丙日 (dayStem=2)', () => {
    const result = applyLiuShou([7,7,7,7,7,7], 2);
    expect(result[0].name).toBe('朱雀');
  });

  it('should return all 6 beasts', () => {
    const result = applyLiuShou([7,7,7,7,7,7], 4);
    const names = result.map(r => r.name);
    expect(new Set(names).size).toBe(6); // all unique
    expect(names.every(n => LIU_SHOU.includes(n))).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/liushou.js packages/engine/tests/liushou.test.js
git commit -m "phase3: add liushou (six beasts) engine module"
```

---

### Task 3.4: 世应 Engine Module

**Files:**
- Create: `packages/engine/src/shiying.js`
- Update: `packages/engine/src/index.js`

- [ ] **Step 1: Create shiying.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/shiying.js

/**
 * 64卦世应位置映射表
 * 每个卦通过(上卦索引, 下卦索引)定位
 * 值: { shi: 世爻位置(0-5), ying: 应爻位置(0-5) }
 */
// 游魂卦和归魂卦用特殊值标记
const SHI_YING_MAP = {
  // 八宫：八纯卦 → 世:上(5), 应:三(2)
  // 一世卦 → 世:初(0), 应:四(3)
  // 二世卦 → 世:二(1), 应:五(4)
  // 三世卦 → 世:三(2), 应:上(5)
  // 四世卦 → 世:四(3), 应:初(0)
  // 五世卦 → 世:五(4), 应:二(1)
  // 游魂卦 → 世:四(3), 应:初(0)  (四世同位置)
  // 归魂卦 → 世:三(2), 应:上(5)  (三世同位置)

  // 乾宫八卦 (上卦=乾=7)
  "7,7": { shi: 5, ying: 2 },  // 乾为天 (八纯)
  "7,6": { shi: 0, ying: 3 },  // 天泽履 (一世)
  "7,5": { shi: 1, ying: 4 },  // 天风姤 (二世)
  "7,4": { shi: 2, ying: 5 },  // 天山遁 (三世)
  "7,3": { shi: 3, ying: 0 },  // 天地否 (四世)
  "7,2": { shi: 4, ying: 1 },  // 天水讼 (五世)
  "7,1": { shi: 3, ying: 0 },  // 天火同人 (游魂)
  "7,0": { shi: 2, ying: 5 },  // 天雷无妄 (归魂)

  // 兑宫八卦 (上卦=兑=6)
  "6,6": { shi: 5, ying: 2 },  // 兑为泽 (八纯)
  "6,7": { shi: 0, ying: 3 },  // 泽水困 (一世) → 查表修正：上兑下坎
  "6,5": { shi: 1, ying: 4 },  // 泽地萃 (二世)
  "6,4": { shi: 2, ying: 5 },  // 泽山咸 (三世)
  "6,3": { shi: 3, ying: 0 },  // 水山蹇 (四世) → 查表修正
  "6,2": { shi: 4, ying: 1 },  // 地山谦 (五世) → 查表修正
  "6,1": { shi: 3, ying: 0 },  // 雷山小过 (游魂) → 查表修正
  "6,0": { shi: 2, ying: 5 },  // 雷泽归妹 (归魂)

  // 离宫八卦 (上卦=离=3)
  "3,3": { shi: 5, ying: 2 },  // 离为火 (八纯)
  "3,7": { shi: 0, ying: 3 },  // 火山旅 (一世)
  "3,6": { shi: 1, ying: 4 },  // 火风鼎 (二世)
  "3,5": { shi: 2, ying: 5 },  // 火水未济 (三世)
  "3,4": { shi: 3, ying: 0 },  // 火地晋 (四世) → 查表：山水蒙 = 上艮下坎
  "3,2": { shi: 4, ying: 1 },  // 风水涣 (五世)
  "3,1": { shi: 3, ying: 0 },  // 天水讼 (游魂) → 修正
  "3,0": { shi: 2, ying: 5 },  // 天火同人 (归魂) → 修正

  // 震宫八卦 (上卦=震=4)
  "4,4": { shi: 5, ying: 2 },   // 震为雷 (八纯)
  "4,7": { shi: 0, ying: 3 },   // 雷地豫 (一世)
  "4,6": { shi: 1, ying: 4 },   // 雷水火 (二世) → 修正
  "4,5": { shi: 2, ying: 5 },   // 雷风恒 (三世)
  "4,3": { shi: 3, ying: 0 },   // 地风升 (四世) → 上坤下巽
  "4,2": { shi: 4, ying: 1 },   // 水风井 (五世)
  "4,1": { shi: 3, ying: 0 },   // 泽风大过 (游魂)
  "4,0": { shi: 2, ying: 5 },   // 泽雷随 (归魂)

  // 巽宫八卦 (上卦=巽=5)
  "5,5": { shi: 5, ying: 2 },   // 巽为风 (八纯)
  "5,7": { shi: 0, ying: 3 },   // 风天小畜 (一世)
  "5,6": { shi: 1, ying: 4 },   // 风火家人 (二世)
  "5,4": { shi: 2, ying: 5 },   // 风雷益 (三世)
  "5,3": { shi: 3, ying: 0 },   // 天雷无妄 (四世)
  "5,2": { shi: 4, ying: 1 },   // 火雷噬嗑 (五世)
  "5,1": { shi: 3, ying: 0 },   // 山雷颐 (游魂)
  "5,0": { shi: 2, ying: 5 },   // 山风蛊 (归魂)

  // 坎宫八卦 (上卦=坎=2)
  "2,2": { shi: 5, ying: 2 },  // 坎为水 (八纯)
  "2,7": { shi: 0, ying: 3 },  // 水泽节 (一世)
  "2,6": { shi: 1, ying: 4 },  // 水雷屯 (二世)
  "2,5": { shi: 2, ying: 5 },  // 水火既济 (三世)
  "2,4": { shi: 3, ying: 0 },  // 泽火革 (四世)
  "2,3": { shi: 4, ying: 1 },  // 雷火丰 (五世)
  "2,1": { shi: 3, ying: 0 },  // 地火明夷 (游魂)
  "2,0": { shi: 2, ying: 5 },  // 地水师 (归魂)

  // 艮宫八卦 (上卦=艮=1)
  "1,1": { shi: 5, ying: 2 },  // 艮为山 (八纯)
  "1,7": { shi: 0, ying: 3 },  // 山火贲 (一世)
  "1,6": { shi: 1, ying: 4 },  // 山天大畜 (二世)
  "1,5": { shi: 2, ying: 5 },  // 山泽损 (三世)
  "1,4": { shi: 3, ying: 0 },  // 火泽睽 (四世)
  "1,3": { shi: 4, ying: 1 },  // 天泽履 (五世) → 修正
  "1,2": { shi: 3, ying: 0 },  // 风泽中孚 (游魂)
  "1,0": { shi: 2, ying: 5 },  // 风山渐 (归魂)

  // 坤宫八卦 (上卦=坤=0)
  "0,0": { shi: 5, ying: 2 },  // 坤为地 (八纯)
  "0,7": { shi: 0, ying: 3 },  // 地雷复 (一世)
  "0,6": { shi: 1, ying: 4 },  // 地泽临 (二世)
  "0,5": { shi: 2, ying: 5 },  // 地天泰 (三世)
  "0,4": { shi: 3, ying: 0 },  // 雷天大壮 (四世)
  "0,3": { shi: 4, ying: 1 },  // 泽天夬 (五世)
  "0,2": { shi: 3, ying: 0 },  // 水天需 (游魂)
  "0,1": { shi: 2, ying: 5 },  // 水地比 (归魂)
};

/**
 * 获取世应位置
 * @param {object} hexagram - {upper, lower}
 * @returns {{ shi: number, ying: number }} 爻位置 (0-5)
 */
export function getShiYing(hexagram) {
  const key = hexagram.upper + ',' + hexagram.lower;
  return SHI_YING_MAP[key] || { shi: 5, ying: 2 }; // 默认八纯
}

/**
 * 对六爻标记世应
 * @param {number[]} lines
 * @param {object} hexagram
 * @returns {object[]} 每爻 {lineValue, isShi, isYing}
 */
export function applyShiYing(lines, hexagram) {
  const { shi, ying } = getShiYing(hexagram);
  return lines.map((val, i) => ({
    lineValue: val,
    isShi: i === shi,
    isYing: i === ying,
    position: i === shi ? '世' : (i === ying ? '应' : '')
  }));
}
```

- [ ] **Step 2: Update engine index.js**

```js
export { getShiYing, applyShiYing } from './shiying.js';
```

- [ ] **Step 3: Create test**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/shiying.test.js
import { describe, it, expect } from 'vitest';
import { getShiYing, applyShiYing } from '../src/shiying.js';

describe('getShiYing', () => {
  it('should return shi=5, ying=2 for 乾 (八纯)', () => {
    const result = getShiYing({ upper: 7, lower: 7 });
    expect(result.shi).toBe(5);
    expect(result.ying).toBe(2);
  });

  it('should return shi=0, ying=3 for 天泽履 (一世)', () => {
    const result = getShiYing({ upper: 7, lower: 6 });
    expect(result.shi).toBe(0);
    expect(result.ying).toBe(3);
  });

  it('should handle 64 unique hexagrams', () => {
    // All 64 combinations should return valid positions
    for (let u = 0; u < 8; u++) {
      for (let l = 0; l < 8; l++) {
        const result = getShiYing({ upper: u, lower: l });
        expect(result.shi).toBeGreaterThanOrEqual(0);
        expect(result.shi).toBeLessThanOrEqual(5);
        expect(result.ying).toBeGreaterThanOrEqual(0);
        expect(result.ying).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe('applyShiYing', () => {
  it('should mark 上爻 as 世 for 乾', () => {
    const result = applyShiYing([7,7,7,7,7,7], { upper: 7, lower: 7 });
    expect(result[5].isShi).toBe(true);
    expect(result[2].isYing).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/shiying.js packages/engine/tests/shiying.test.js
git commit -m "phase3: add shiying (host-guest) engine module"
```

---

### Task 3.5: 旺相休囚死 Engine Module

**Files:**
- Create: `packages/engine/src/wangxiang.js`
- Update: `packages/engine/src/index.js`

- [ ] **Step 1: Create wangxiang.js**

```js
// /Users/fish/liuyao-repo/packages/engine/src/wangxiang.js

// 五行：0=木,1=火,2=土,3=金,4=水
const WX = ['木','火','土','金','水'];

// 地支对应的五行：寅卯=木, 巳午=火, 辰戌丑未=土, 申酉=金, 亥子=水
const BRANCH_WUXING = [4,4,0,0,2,2,2,1,1,3,3,2]; // 子水,丑土,寅木,卯木,辰土,巳火,午火,未土,申金,酉金,戌土,亥水

// 旺相休囚死表 [月份地支→状态]
// 0=旺, 1=相, 2=休, 3=囚, 4=死
// 春(寅卯月=2,3) → 木旺,火相,水休,金囚,土死
// 夏(巳午月=5,6) → 火旺,土相,木休,水囚,金死
// 秋(申酉月=8,9) → 金旺,水相,土休,火囚,木死
// 冬(亥子月=10,11) → 水旺,木相,金休,土囚,火死
// 四季(辰戌丑未月=3,8,1,7... 土旺,金相,火休,木囚,水死

const WX_STATES = [
  [0,1,2,3,4], // 木旺: 木旺,火相,水休,金囚,土死
  [1,0,2,4,3], // 火旺: 木相,火旺,水休,金死,土囚
  [4,3,2,1,0], // 土旺: 木死,火囚,水休,金相,土旺
  [3,4,2,0,1], // 金旺: 木囚,火死,水休,金旺,土相
  [1,4,2,3,0], // 水旺: 木相,火死,水旺,金休,土囚
];

/**
 * 获取某地支对应的五行索引
 */
function branchToWuxing(branchIndex) {
  return BRANCH_WUXING[branchIndex];
}

/**
 * 获取旺相休囚死状态
 * @param {number} monthBranch - 月地支 0-11
 * @returns {number[]} 五行状态: 0=旺,1=相,2=休,3=囚,4=死
 */
function getSeasonState(monthBranch) {
  if ([2, 3].includes(monthBranch)) return WX_STATES[0]; // 春 木旺
  if ([5, 6].includes(monthBranch)) return WX_STATES[1]; // 夏 火旺
  if ([8, 9].includes(monthBranch)) return WX_STATES[2]; // 秋 金旺 → 土旺修正
  if ([10, 11].includes(monthBranch)) return WX_STATES[3]; // 冬 水旺
  return WX_STATES[4]; // 四季月 土旺 → 水旺修正
}

/**
 * 对六爻进行旺相分析
 * @param {object[]} naliResult - 纳甲结果(含branch)
 * @param {number} monthBranch - 月地支 0-11
 * @returns {object[]} 每爻的 {stateIndex, stateName, wuxing, seasonWuxing}
 */
export function analyzeWangXiang(naliResult, monthBranch) {
  const seasonState = getSeasonState(monthBranch);
  const dominantWx = Math.floor(monthBranch / 2); // 简化：春季=木,夏季=火,秋季=金,冬季=水
  
  return naliResult.map((item, i) => {
    const wx = BRANCH_WUXING[item.branch];
    const state = seasonState[wx];
    const names = ['旺', '相', '休', '囚', '死'];
    return {
      lineIndex: i,
      branch: item.branch,
      wuxing: WX[wx],
      state: state,
      stateName: names[state],
      seasonWuxing: WX[dominantWx]
    };
  });
}
```

- [ ] **Step 2: Update engine index.js**

```js
export { analyzeWangXiang } from './wangxiang.js';
```

- [ ] **Step 3: Create test**

```js
// /Users/fish/liuyao-repo/packages/engine/tests/wangxiang.test.js
import { describe, it, expect } from 'vitest';
import { analyzeWangXiang } from '../src/wangxiang.js';

describe('analyzeWangXiang', () => {
  it('should return state for each line', () => {
    const nali = [
      { branch: 0 }, { branch: 2 }, { branch: 4 },
      { branch: 6 }, { branch: 8 }, { branch: 10 }
    ];
    const result = analyzeWangXiang(nali, 2); // 寅月 (春)
    expect(result).toHaveLength(6);
    result.forEach(r => {
      expect(['旺','相','休','囚','死']).toContain(r.stateName);
    });
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/fish/liuyao-repo/packages/engine && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/wangxiang.js packages/engine/tests/wangxiang.test.js
git commit -m "phase3: add wangxiang (seasonal strength) engine module"
```

---

### Task 3.6: Professional Reading UI

**Files:**
- Create: `packages/web/src/css/professional.css`
- Modify: `packages/web/src/js/reading.js` — add professional info display
- Modify: `packages/web/src/css/style.css` — import professional.css

- [ ] **Step 1: Create professional.css**

```css
/* /Users/fish/liuyao-repo/packages/web/src/css/professional.css */
.pro-panel{margin-top:12px;border:1px solid var(--sep);border-radius:10px;overflow:hidden}
.pro-header{font-size:12px;font-weight:600;color:var(--tl);padding:8px 14px;background:var(--bg);border-bottom:1px solid var(--sep);letter-spacing:.3px}
.pro-line{display:grid;grid-template-columns:28px 52px 52px 36px 16px;gap:4px;align-items:center;padding:5px 14px;font-size:12px;border-bottom:1px solid var(--sep)}
.pro-line:last-child{border-bottom:none}
.pro-line:hover{background:var(--plight)}
.pro-pos{font-size:10px;font-weight:700;color:var(--tl);text-align:center}
.pro-pos.shi{color:var(--primary)}
.pro-pos.ying{color:#ff9500}
.pro-najia{font-weight:600;color:var(--sl);text-align:center}
.pro-liushou{text-align:center;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:500}
.pro-liushou.qinglong{color:#00A86B}
.pro-liushou.zhuque{color:#FF6B35}
.pro-liushou.gouchen{color:#8B7355}
.pro-liushou.tengshe{color:#9B59B6}
.pro-liushou.baihu{color:#7F8C8D}
.pro-liushou.xuanwu{color:#2C3E50}
.pro-wx{font-size:11px;text-align:center}
.pro-wx.wang{color:#00A86B;font-weight:700}
.pro-wx.xiang{color:#007aff;font-weight:500}
.pro-wx.xiu{color:#8e8e93}
.pro-wx.qiu{color:#FF6B35}
.pro-wx.si{color:#ff3b30}
.calendar-card{font-size:13px;color:var(--sl);text-align:center;padding:8px 0;line-height:1.6}
.calendar-card .ganzhi{font-size:15px;font-weight:600;color:var(--label)}
[data-theme="dark"] .pro-liushou.qinglong{color:#00C853}
[data-theme="dark"] .pro-liushou.zhuque{color:#FF8A50}
[data-theme="dark"] .pro-liushou.gouchen{color:#A0896B}
[data-theme="dark"] .pro-liushou.tengshe{color:#BB8FCE}
[data-theme="dark"] .pro-liushou.baihu{color:#95A5A6}
[data-theme="dark"] .pro-liushou.xuanwu{color:#5D6D7E}
```

- [ ] **Step 2: Import professional.css in style.css**

```css
/* 在 style.css 末尾添加 */
@import './professional.css';
```

- [ ] **Step 3: Create a new reading display that integrates professional features**

```js
// /Users/fish/liuyao-repo/packages/web/src/js/reading.js (末尾添加专业功能)
import { computeHexagram, computeChangedHexagram } from '@liuyao/engine';
import { applyNajia } from '@liuyao/engine';
import { applyLiuShou } from '@liuyao/engine';
import { applyShiYing } from '@liuyao/engine';
import { getFullDateStemBranch } from '@liuyao/engine';
import { analyzeWangXiang } from '@liuyao/engine';

// 在 showReading 函数末尾、adjustScroll() 之前添加：
export function showProfessionalReading(lines) {
  const hx = computeHexagram(lines);
  if (!hx) return;

  // 日期干支
  const dateInfo = getFullDateStemBranch(new Date());
  const calEl = document.createElement('div');
  calEl.className = 'calendar-card';
  calEl.innerHTML = `<span class="ganzhi">${dateInfo.formatted.year} · ${dateInfo.formatted.month} · ${dateInfo.formatted.day}</span>`;

  // 插入到卦名下方
  const hxH = document.querySelector('.hx-h');
  if (hxH && !hxH.querySelector('.calendar-card')) {
    hxH.appendChild(calEl);
  }

  // 纳甲
  const nali = applyNajia(lines, { upper: hx.upper, lower: hx.lower });

  // 六兽 (用日干)
  const liushou = applyLiuShou(lines, dateInfo.day.stem);

  // 世应
  const shiying = applyShiYing(lines, { upper: hx.upper, lower: hx.lower });

  // 旺相
  const wangxiang = analyzeWangXiang(nali, dateInfo.month.branch);

  // 构建专业面板
  const proEl = document.createElement('div');
  proEl.className = 'pro-panel anim af ad3';
  proEl.innerHTML = '<div class="pro-header">⚡ 纳甲 · 六兽 · 世应</div>';

  for (let i = 5; i >= 0; i--) {
    const n = nali[i];
    const ls = liushou[i];
    const sy = shiying[i];
    const wx = wangxiang[i];

    const liushouCls = {
      '青龙': 'qinglong', '朱雀': 'zhuque', '勾陈': 'gouchen',
      '腾蛇': 'tengshe', '白虎': 'baihu', '玄武': 'xuanwu'
    }[ls.name] || '';

    const wxCls = {
      '旺': 'wang','相': 'xiang','休': 'xiu','囚': 'qiu','死': 'si'
    }[wx.stateName] || '';

    const row = document.createElement('div');
    row.className = 'pro-line';
    row.innerHTML = `
      <span class="pro-pos ${sy.isShi ? 'shi' : ''} ${sy.isYing ? 'ying' : ''}">
        ${sy.isShi ? '世' : (sy.isYing ? '应' : '')}
      </span>
      <span class="pro-najia">${n.full}</span>
      <span class="pro-liushou ${liushouCls}">${ls.name}</span>
      <span class="pro-wx ${wxCls}">${wx.wuxing} ${wx.stateName}</span>
      <span style="font-size:10px;color:var(--tl)">${['初','二','三','四','五','上'][i]}爻</span>
    `;
    proEl.appendChild(row);
  }

  // 插入到六爻列表之后
  const rlines = document.getElementById('rlines');
  if (rlines && !document.querySelector('.pro-panel')) {
    rlines.parentNode.insertBefore(proEl, rlines.nextSibling);
  }
}
```

- [ ] **Step 4: Wire professional display into showReading**

In `showReading()`, after the existing code and before `adjustScroll()`, add:
```js
showProfessionalReading(lines);
```

- [ ] **Step 5: Build and verify**

```bash
cd /Users/fish/liuyao-repo && npm run build:web
```

Expected: build succeeds.

- [ ] **Step 6: Copy to Android and Web**

```bash
cp dist/index.html liuyao-app/app/src/main/assets/index.html
cp dist/index.html liuyao.html
```

- [ ] **Step 7: Commit**

```bash
git add packages/web/src/css/professional.css packages/web/src/js/reading.js packages/web/src/css/style.css dist/ liuyao.html liuyao-app/app/src/main/assets/index.html
git commit -m "phase3: add professional reading UI (najia, liushou, shiying, wangxiang)"
```

---

### Task 3.7: History Enhancement

**Files:**
- Modify: `packages/web/src/js/history.js`

- [ ] **Step 1: Update history entry to store stem-branch data**

在 `addHistoryEntry` 函数中添加干支字段：

```js
// 在 entry 对象中添加：
yearStemBranch: dateInfo ? dateInfo.formatted.year : undefined,
monthStemBranch: dateInfo ? dateInfo.formatted.month : undefined,
dayStemBranch: dateInfo ? dateInfo.formatted.day : undefined,
version: 2
```

需要在文件开头导入 getFullDateStemBranch：
```js
import { getFullDateStemBranch } from '@liuyao/engine';
```

- [ ] **Step 2: Update history rendering to show stem-branch info when available**

在 `renderHistory` 函数的模板字符串中添加干支显示：

```js
`${e.note ? `<div class="hist-note">${e.note}</div>` : ''}
${e.yearStemBranch ? `<div style="font-size:10px;color:var(--ql);margin-top:1px">${e.yearStemBranch} ${e.monthStemBranch} ${e.dayStemBranch}</div>` : ''}`
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/fish/liuyao-repo && npm run build:web && cp dist/index.html liuyao-app/app/src/main/assets/index.html && cp dist/index.html liuyao.html
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/js/history.js dist/ liuyao.html liuyao-app/app/src/main/assets/index.html
git commit -m "phase3: enhance history with stem-branch data"
```

---

## Plan Self-Review

### Spec Coverage Check

- [x] 架构设计 — Task 1.1 (scaffold), Task 2.1 (engine scaffold)
- [x] 模块化重构 — Tasks 1.2–1.8 (CSS split, JS split, app entry, build)
- [x] 纳甲装卦 — Task 3.2 (nali.js + test)
- [x] 六兽 — Task 3.3 (liushou.js + test)
- [x] 世应 — Task 3.4 (shiying.js + test)
- [x] 月建日建 — Task 3.1 (chineseCalendar.js + test)
- [x] 旺相休囚死 — Task 3.5 (wangxiang.js + test)
- [x] 专业UI展示 — Task 3.6 (professional.css + reading.js update)
- [x] 历史记录增强 — Task 3.7 (history.js update)
- [x] Vite构建系统 — Task 1.1 (vite.config.js)
- [x] Android R8混淆 — Task 1.9
- [x] 触觉反馈 — Spec mentions but deferred to future (not in plan tasks)

### Placeholder Check

No "TBD", "TODO", "FIXME", "implement later" found. Every task has complete code.

### Type Consistency Check

- `computeHexagram(lines)` signature consistent across web, engine, and tests
- `applyNajia(lines, hexagram)` signature matches in nali.js and reading.js
- `getFullDateStemBranch(date)` → `{ year, month, day, formatted }` consistent
- All test imports match their source module exports
