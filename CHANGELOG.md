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

---

## v1.0.6 (2026-03-17)

### 🐛 Bug Fixes / 錯誤修復

**EN:**
- Fixed duplicate sign-in tab openings caused by race conditions between startup checks and alarm triggers
- Added auto-check dedup protection with execution lock and short attempt window to prevent repeated openings
- Improved background-mode reliability: when opening a tab fails (no browser window), fallback to creating a window for sign-in flow

**中文：**
- 修復啟動檢查與鬧鐘觸發競態條件造成重複開啟簽到頁的問題
- 新增自動檢查防重機制（執行鎖與短時間嘗試去重），避免短時間內重複開頁
- 改善背景模式可靠性：當無視窗導致分頁建立失敗時，改以建立視窗作為簽到流程備援

---

## v1.0.5 (2026-02-08)

### 🐛 Bug Fixes / 錯誤修復

**EN:**
- Fixed sign-in detection logic that incorrectly reported "already signed in" even when the current day was not yet checked in
- The issue was caused by detecting `#completed-overlay` globally (which exists on all past days), instead of checking the current day's status
- Now uses `#lottie-container` presence to accurately identify the current unchecked day

**中文：**
- 修復簽到檢測邏輯錯誤判斷「今日已簽到」的問題
- 原因是全局檢測 `#completed-overlay`（所有已簽到的日期都有此元素），而非正確檢查當天狀態
- 現在使用 `#lottie-container` 的存在與否來準確識別當天待簽到的項目

### ✨ New Features / 新功能

**EN:**
- Added informational text in popup explaining background execution behavior
- Added Chrome background apps permission instructions
- Added GitHub repository link in popup footer

**中文：**
- 在彈出視窗中新增背景執行說明文字
- 新增 Chrome 背景應用程式權限設定指引
- 在彈出視窗底部新增 GitHub 連結

### 📝 UI Improvements / 介面改進

**EN:**
- Improved popup layout with dedicated info section
- Added version number display in footer

**中文：**
- 改進彈出視窗布局，新增專屬資訊區塊
- 在底部顯示版本號

---

## v1.0.4 and earlier

See GitHub commit history for previous changes.
