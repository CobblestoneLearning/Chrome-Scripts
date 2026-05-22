# 🛠 Cobblestone Learning — Chrome Scripts

Internal bookmarklets and DevTools snippets for web operations.

---

## 🖼 Image Extractor

Scans any page for images, detects iStock IDs, filters by type, and bulk downloads.

**Install:**
1. Right-click the bookmarks bar → **Add page**
2. Name: `🖼 Image Extractor`
3. URL: paste the bookmarklet below

**Bookmarklet:**

    javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/CobblestoneLearning/REPONAME@main/ie-extractor.js?v='+Date.now();document.head.appendChild(s);})()

**Source:** `ie-extractor.js`

---
