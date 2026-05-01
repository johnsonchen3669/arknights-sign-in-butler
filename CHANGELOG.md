# Changelog / 更新日誌

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

### 📝 Project Maintenance / 專案維護

**EN:**
- Renamed the project and repository links to Arknights Sign-in Butler
- Added pnpm-based development workflow documentation and TypeScript project configuration
- Stopped versioning local planning documents and moved project analysis notes to a local-only plans directory

**中文：**
- 將專案名稱與 repository 連結統一更新為 Arknights Sign-in Butler
- 補上以 pnpm 為主的開發流程文件與 TypeScript 專案設定
- 停止追蹤本地計畫文件，並將分析筆記移到僅本地使用的 plans 資料夾

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
