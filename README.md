# Arknights Sign-in Butler

此 Chrome 擴充功能用於自動執行 SKPORT 官網的每日簽到任務，目前支援《明日方舟》與《明日方舟：終末地》。

GitHub repository:
https://github.com/johnsonchen3669/arknights-sign-in-butler

Chrome store link:
https://chromewebstore.google.com/detail/Endfield%20%E8%87%AA%E5%8B%95%E7%B0%BD%E5%88%B0/dlfggcgclahjbigdebgfamllaajjfimj

## Description / 簡介

**[English]**
Arknights Sign-in Butler is a Chrome extension for SKPORT daily sign-in flows. It currently supports both Arknights and Arknights: Endfield official sign-in pages, with configurable scheduled checks, one-click manual triggering, and Traditional Chinese / English UI.

**[繁體中文]**
「明日方舟簽到管家」是一個用於 SKPORT 每日簽到流程的 Chrome 擴充功能，目前支援《明日方舟》與《明日方舟：終末地》官網簽到頁。它提供可設定的定時檢查、手動一鍵觸發，以及繁體中文與英文介面。

## 功能

- 🎮 **多遊戲模式**：可選擇只簽《明日方舟》、只簽《終末地》，或兩者都觸發。
- 📅 **定時檢查**：預設每天 00:30 自動檢查簽到狀態，可自行修改。
- 🔓 **自動開頁**：自動打開對應簽到頁面並嘗試完成簽到流程。
- 🔔 **狀態即時顯示**：Popup 介面顯示目前模式下各遊戲的最後簽到日期與整體狀態。
- ⚡ **手動觸發**：可透過擴充功能圖示隨時手動啟動一個或兩個簽到流程。
- 🌐 **多語言支援**：支援繁體中文與英文。

## 使用方式

1. 開啟擴充功能 popup。
2. 選擇簽到模式：《終末地》、《明日方舟》，或兩者都觸發。
3. 設定每日自動簽到時間。
4. 視需要按下「立即手動簽到」測試流程。

## 注意事項
- 記得先開啓瀏覽器「執行背景應用程式」的權限，自動開啓瀏覽器的功能才會生效。
- 執行簽到時請確保瀏覽器已登入 SKPORT 帳號。
- 選擇「兩者都觸發」時，擴充功能會依序開啟兩個簽到頁面。
- 《明日方舟》與《終末地》的頁面結構可能不同，若 SKPORT 改版，可能需要更新選擇器邏輯。
- 簽到完成後，頁面會保持開啟狀態以便確認結果。

## Credit
代碼設計和部分文本來自以下repo:
https://github.com/brownsugar/baha-auto-sign
