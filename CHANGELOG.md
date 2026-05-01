# Changelog / 更新日誌

## v1.0.3 (2026-05-01)

### 🛠 Popup Stability / Popup 穩定性

**EN:**
- Fixed the popup bootstrap flow to avoid the white screen caused by extension CSP after the Astro migration
- Fixed popup localization and storage refresh so the UI follows browser locale and saved settings are reflected immediately
- Improved popup interaction feedback with loading states, disabled actions during requests, and a polished card-based layout

**中文：**
- 修正 Astro 遷移後受擴充功能 CSP 影響造成的 popup 白畫面問題
- 修正 popup 多語系與 storage 同步流程，讓介面可跟隨瀏覽器語系，且儲存後立即反映最新設定
- 強化 popup 操作回饋，加入載入狀態、請求期間禁用操作，以及更完整的卡片式介面樣式

### 🔧 Internal Changes / 內部調整

**EN:**
- Moved popup mounting to a dedicated entry script and forced external asset output for extension-safe loading
- Scoped frontend-only tooling to development dependencies to keep the production dependency audit clean

**中文：**
- 將 popup 掛載流程改為獨立 entry script，並強制輸出外部資產以符合擴充功能載入限制
- 將前端檢查工具調整為開發依賴，讓正式環境依賴的安全檢查維持乾淨

---

## v1.0.2 (2026-05-01)

### ✨ Frontend Migration / 前端遷移

**EN:**
- Added Astro + React + Tailwind CSS v4 + TypeScript scaffold for the popup UI
- Switched the extension popup entry from the legacy static page to the built Astro popup
- Restored first-run default schedule syncing in the new popup so UI state and alarms stay aligned

**中文：**
- 為 popup UI 新增 Astro + React + Tailwind CSS v4 + TypeScript 前端骨架
- 將擴充功能 popup 入口從舊版靜態頁切換為 Astro 建置產物
- 在新版 popup 補回首次使用時的預設排程同步，讓介面狀態與 alarm 維持一致

### 🔧 Project Maintenance / 專案維護

**EN:**
- Renamed the project and repository links to Arknights Sign-in Butler
- Added pnpm-based development workflow documentation and TypeScript project configuration

**中文：**
- 將專案名稱與 repository 連結統一更新為 Arknights Sign-in Butler
- 補上以 pnpm 為主的開發流程文件與 TypeScript 專案設定

---

## v1.0.1 (2026-05-01)

### ✨ New Features / 新功能

**EN:**
- Added support for both Endfield and Arknights SKPORT sign-in pages
- Added sign-in mode selection in popup: Endfield only, Arknights only, or both
- Manual and scheduled runs now open the selected game pages sequentially

**中文：**
- 新增支援 Endfield 與 Arknights 兩個 SKPORT 簽到頁
- 在 popup 新增簽到模式選擇，可選 Endfield、Arknights 或兩者都觸發
- 手動與排程模式都會依所選模式依序開啟對應簽到頁

### 🔧 Internal Changes / 內部調整

**EN:**
- Refactored background storage to track sign-in and dedup state per game
- Updated content script to detect the current game by URL and report success with game id
- Updated i18n strings and documentation for the multi-game flow

**中文：**
- 重構 background storage，改為每個遊戲各自追蹤簽到與去重狀態
- 更新 content script，依網址判斷目前遊戲並以 game id 回報成功
- 補齊多遊戲流程對應的多語系文案與文件
