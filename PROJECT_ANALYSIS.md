# Arknights Sign-in Butler 專案分析

## 1. 專案定位

這是一個以 Chrome Extension Manifest V3 實作的自動簽到工具，目標是替 SKPORT 官網的《明日方舟：終末地》與《明日方舟》完成每日簽到流程。專案核心設計很直接：

- background service worker 負責排程與開啟簽到頁面
- content script 負責進入指定頁面後尋找可簽到元素並執行點擊
- popup 介面負責顯示狀態、設定每日檢查時間、提供手動觸發入口

目前版本為 1.1.0。除了既有的重複開頁保護與背景執行備援之外，現在也支援由使用者選擇要簽到 Endfield、Arknights，或兩者都觸發。

## 2. 專案檔案結構

### 核心檔案

- manifest.json
  - 定義擴充功能為 Manifest V3。
  - 註冊 background.js 為 service worker。
  - 註冊 popup.html 為操作介面。
  - 讓 content.js 注入到 Endfield 與 Arknights 的簽到頁面。

- background.js
  - 建立每日 alarm。
  - 在安裝、瀏覽器啟動、alarm 觸發時執行自動檢查。
  - 依使用者選擇的模式決定要開啟哪一個或哪兩個簽到頁面，並處理每個遊戲各自的去重狀態。

- content.js
  - 依目前網址判斷是 Endfield 或 Arknights。
  - 在目標頁面輪詢 DOM。
  - 嘗試展開對應站點的獎勵區塊。
  - 判斷今天是否已簽到。
  - 找到待簽到卡片後自動點擊，並向 background 回報對應遊戲的成功結果。

- popup.html / popup.js
  - 提供目前狀態顯示。
  - 提供簽到模式選擇。
  - 提供自動簽到時間設定。
  - 提供手動立即簽到按鈕。

### 其他檔案

- README.md
  - 專案用途、功能與使用說明。

- CHANGELOG.md
  - 版本更新紀錄，1.1.0 開始納入多遊戲支援。

- _locales/en/messages.json
- _locales/zh_TW/messages.json
  - 多語系字串來源，供 popup 介面與內容腳本通知使用。

## 3. 權限與執行環境

manifest 中目前只使用以下權限：

- alarms
  - 用來建立每日排程檢查。

- storage
  - 用來保存簽到紀錄與使用者設定時間。

content script 目前注入下列頁面：

- https://game.skport.com/endfield/sign-in*
- https://game.skport.com/arknights/sign-in*

這代表專案行為仍然非常聚焦，沒有擴張到其他網站或多餘權限。

## 4. 執行流程

### 4.1 安裝與啟動

background.js 在以下時機會建立排程並嘗試自動檢查：

- 擴充功能安裝或更新時
- 瀏覽器啟動時
- 每日 alarm 觸發時

若是首次安裝，還會自動打開 popup.html，讓使用者看到設定介面。

### 4.2 排程邏輯

預設時間是 00:30。若使用者在 popup 修改時間或切換簽到模式，background 會沿用新的設定進行後續手動與排程簽到。

排程運作方式：

- 從 storage 讀取 checkTime
- 計算下一次執行時間
- 使用 chrome.alarms.create 建立每天一次的 alarm

### 4.3 去重與保護機制

background.js 內有兩層保護，並且都是以每個遊戲分開追蹤：

- isAutoCheckRunning
  - 避免同一時間重複進入自動檢查流程。

- lastSignInAttemptAtByGame 與 90 秒 dedup window
  - 避免 onStartup、onInstalled、alarm 等多個事件在短時間內對同一個遊戲連續開頁。

這是 1.0.6 版最重要的穩定性修補之一。

### 4.4 自動簽到流程

當 background 判定今天尚未簽到時，會依使用者所選模式執行一個或多個 performSignIn：

1. 依 mode 決定要處理 Endfield、Arknights，或兩者。
2. 優先使用 chrome.tabs.create 開啟對應簽到頁。
3. 若無法建立分頁，改用 chrome.windows.create 當備援。
4. content.js 注入頁面後開始每 2 秒輪詢一次。
5. content.js 依網址切換站點策略，尋找「查看全部獎勵」或「查看全部」按鈕並展開。
6. 以 lottie / reward card 等 selector 判斷今天尚未簽到的獎勵卡。
7. 找到可點擊容器後自動 click。
8. 成功後回傳帶 game id 的 signInSuccess，background 將該遊戲的日期寫入 storage。

### 4.5 手動簽到流程

popup 點擊「立即手動簽到」後：

- popup 發送 manualSignIn 訊息給 background
- background 依目前模式立即開啟一個或兩個簽到頁
- 手動模式會將分頁或視窗設為前景，方便使用者確認

## 5. 資料儲存設計

chrome.storage.local 目前主要使用下列欄位：

- signInMode
  - 使用者選擇的簽到模式，值為 endfield、arknights 或 both。

- checkTime
  - 使用者設定的每日自動檢查時間，格式為 HH:MM。

- lastCheckInDateByGame
  - 以遊戲為 key 保存最後一次成功簽到的日期字串。

- lastSignInAttemptAtByGame
  - 以遊戲為 key 保存最後一次自動簽到嘗試時間戳，用於短時間去重。

這個設計比單站點版更穩定，因為兩個遊戲的狀態不會再互相覆蓋；但它仍然只保留每個遊戲的最後一天，沒有歷史資料。

## 6. UI 與互動設計

popup 介面包含三個主要區塊：

- 狀態卡片
  - 顯示目前模式下各遊戲的最後簽到日期與整體狀態。

- 設定卡片
  - 可切換 Endfield、Arknights 或兩者都觸發。
  - 可調整自動簽到時間並儲存。

- 說明區塊
  - 提醒使用者開啟 Chrome 背景應用程式權限。

互動上偏向實用型設計，功能明確，但仍屬簡潔介面，沒有額外診斷資訊，例如：

- 最近一次觸發來源
- 最近一次失敗原因
- 是否成功載入目標頁

## 7. 多語系設計

專案透過 _locales 目錄提供繁中與英文兩組字串。

目前多語系涵蓋：

- 擴充功能名稱與描述
- popup UI 文案
- content script 顯示的成功通知
- 頁面內「查看全部獎勵」與「查看全部」按鈕的文字比對

其中 content.js 除了使用 i18n 字串，也保留中文 fallback，這可以降低目標網站 UI 文案變化造成的失敗風險。

## 8. 優點整理

### 架構面

- 模組切分清楚，background、content、popup 職責分離。
- 權限最小化，沒有加入不必要權限。
- 支援自動與手動兩種觸發模式。
- 支援單遊戲或雙遊戲依序觸發。

### 穩定性面

- 有基本的重入鎖與短時間去重機制。
- tabs.create 失敗時有 windows.create 備援。
- 內容腳本採輪詢，能容忍部分頁面非同步載入延遲。

### 維護面

- 程式碼量小，容易理解與接手。
- 版本更新紀錄清楚，能看出近期修補脈絡。

## 9. 目前風險與限制

### 9.1 高度依賴目標網站 DOM 結構

content.js 目前仍依賴以下條件判定是否可簽到：

- #lottie-container 或相關 lottie selector
- class 名稱包含 sc-nuIvE
- 某些父層元素的 cursor: pointer

這些條件都屬於脆弱耦合。多遊戲支援之後，這個風險不是減少，而是分散到兩個站點上。只要官網重構、改 class name、調整動畫容器命名，就可能導致其中一個或兩個自動簽到失效。

### 9.2 成功判斷偏樂觀

找到目標元素後，程式在 click 之後就直接發送 signInSuccess，沒有再次確認：

- 點擊是否真的成功
- 是否跳出錯誤訊息
- 是否需要登入
- 是否有網路或權限問題

也就是說，現在的「成功」比較接近「已經嘗試點擊」，不是「後端確認簽到成功」。

### 9.3 已簽到判斷與頁面載入狀態可能混淆

isTodayAlreadyCompleted() 在沒有找到 lottie 時，會再看 reward card 是否存在。若頁面載入流程改變，仍可能出現誤判空間。

### 9.4 README 與程式預設值不一致

這項問題已在 1.1.0 的文件更新中處理，README 與程式預設值已統一為 00:30。

### 9.5 Arknights selector 仍需實站驗證

雖然目前已將 content.js 改成站點分流，並補上 Arknights 的「查看全部」文字比對，但登入後的待簽到 DOM 規則仍需在實站驗證。若 Arknights 的待領獎勵元素與 Endfield 不同，仍需補充專用 selector。

### 9.6 缺少測試與診斷工具

專案目前沒有：

- 自動化測試
- DOM selector 驗證工具
- 失敗重試結果紀錄
- 明確的錯誤回報 UI

這類專案一旦網站改版，通常只能靠手動實測來發現問題。

## 10. 建議優化方向

### 短期可做

- 統一 README、popup 與 background 的預設時間說明。
- 將「點擊成功」與「簽到成功」拆開，至少多做一次結果確認。
- 在 popup 顯示最近一次執行時間與最後一次觸發來源。
- 在 storage 記錄最近一次失敗原因，方便排查。

### 中期可做

- 把 DOM selector 與判斷條件集中管理，避免散落在 content.js。
- 抽出可測試的判斷函式，降低未來改版風險。
- 新增 debug 模式，在 console 輸出更完整的流程狀態。

### 長期可做

- 為目標頁建立基本 E2E 驗證流程。
- 加入更穩健的簽到成功判定策略。
- 如果未來支持更多地區或網站變體，可再抽象化目標站點設定。

### 前端遷移規劃

如果後續要把目前以原生 HTML / CSS / JavaScript 撰寫的 popup 與靜態說明頁搬遷到現代化前端架構，建議採以下技術組合：

- Astro
  - 作為前端頁面與靜態內容的主框架。
  - 適合這類以靜態 UI 為主、互動點集中在少數區塊的專案。
  - 可讓 popup、說明頁、未來文件頁共用更清楚的版型與資源管理方式。

- React Islands
  - 僅把真正需要互動的區塊做成 React 元件，例如簽到模式選擇、狀態卡片、設定表單。
  - 避免整個 popup 都變成完整 SPA，維持 Chrome extension popup 輕量、載入快的特性。
  - 也能把目前散在 popup.js 的狀態更新與事件處理封裝成可維護的元件邏輯。

- Tailwind CSS
  - 作為樣式系統，取代目前直接寫在 popup.html 裡的 inline style 與頁內 CSS。
  - 有助於統一 spacing、字級、顏色與元件外觀，降低之後 UI 修改成本。
  - 若未來要做亮色 / 暗色主題、狀態色系或多頁面風格一致性，Tailwind 也比較容易擴充。

- pnpm
  - 作為套件管理工具，統一依賴安裝、script 執行與 lockfile 管理。
  - 比 npm / yarn 更適合這種依賴量不大、但希望安裝速度穩定且 lockfile 清楚的專案。
  - 後續若引入 Astro、React、Tailwind、ESLint、Prettier 或測試工具，pnpm 也較容易維持一致的依賴樹。

### 建議遷移範圍

前端遷移建議先聚焦在 popup UI，不要一開始就重寫 background.js 與 content.js：

- 第一階段
  - 用 Astro 建立 popup 頁面殼層。
  - 把目前 popup 的資訊卡、設定卡、說明區塊拆成元件。

- 第二階段
  - 將簽到模式切換、時間設定、狀態顯示改寫成 React islands。
  - 抽出與 chrome.storage、chrome.runtime.sendMessage 溝通的前端 service 層。

- 第三階段
  - 導入 Tailwind，取代頁內樣式與重複的 inline style。
  - 補上 lint、format 與 build script，統一透過 pnpm 執行。

### 建議目錄方向

若啟動遷移，可考慮調整為類似下列結構：

- src/pages/
  - 放 Astro 頁面，例如 popup 頁。

- src/components/
  - 放 Astro 與 React 共用元件。

- src/components/islands/
  - 放需要互動的 React islands。

- src/lib/
  - 放與 chrome.storage、runtime message、設定轉換相關的工具函式。

- public/
  - 放 icon 與靜態資產。

### 遷移注意事項

- Manifest V3 的 background.js 與 content.js 仍然屬於 extension runtime 核心邏輯，不建議和 UI 一起大幅重寫。
- Popup 頁面可以先遷移，但與 Chrome Extension 互動的 API 封裝要維持簡單，避免把 UI 框架與 extension 邏輯耦合過深。
- 若採 Astro + React islands，應優先追求低 hydration 成本，而不是把所有內容都交給 React。
- Tailwind 需要先定義設計 token，否則很容易只是把原本散亂的樣式改寫成另一種散亂的 utility class。
- 使用 pnpm 後，README 與專案文件也要同步改成 pnpm 指令，避免團隊成員混用 npm。

## 11. 維護結論

這個專案屬於小型但目的明確的實用型瀏覽器擴充功能。整體設計沒有過度工程化，對單一網站自動簽到任務來說很合適，近期版本也已補上最重要的重複開頁問題。

真正的維護重點不在擴充功能框架本身，而在於目標網站 DOM 結構是否變動，以及目前過於樂觀的成功判斷是否會造成假陽性。如果後續要長期維護，最值得優先投入的是：

- 強化成功驗證
- 改善失敗可觀測性
- 降低對脆弱 selector 的依賴

如果要同步提升可維護性與 UI 擴充能力，則可把 popup 前端逐步遷移到 Astro + React islands + Tailwind，並以 pnpm 統一專案依賴管理；這樣能在不大動 extension 核心邏輯的前提下，先改善前端結構與開發體驗。

以上三點做好後，這個專案的可靠度會明顯提升。