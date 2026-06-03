# Preview

<h1 align="center">
  <img src="https://raw.githubusercontent.com/matiziompl/DayFlow/refs/heads/main/screenshots/preview.png">
</h1>

# DayFlow — Daily Task Tracker 🎯

An elegant mobile application (PWA) for tracking daily habits, building streaks, and managing tasks — with 13 themes, light/dark mode, and offline support.

## ✨ Features

    📋 Tasks Tab — Global list of all tasks (even those not visible today).

    🕐 Today Tab — Today's tasks with a progress ring.

    📅 Calendar — Color-coded highlights: completed, partial, frozen days.

    📝 Descriptions — Add notes to your tasks.

    🔀 Subtasks — Break tasks into smaller steps with individual checkboxes.

    🔥 Streak — Counter for consecutive days with 100% completion.

    ❄️ Streak Freeze — Use ice charges to protect your streak on a missed day.

    🧊 Ice System — Charges accumulate automatically every X days (configurable).

    🗓 Schedule — Daily, specific weekdays, or every X days.

    📆 Date Range — Set start/end dates for task visibility.

    ✏️ Edit Tasks — Modify any task's name, schedule, subtasks, and dates.

    🎨 13 Themes × Light/Dark — Midnight, Ocean, Sunset, Forest, Lavender, Sakura, Monokai, Mono, B&W, Violet, Citrus, Slate, Rose.

    💻 Theme Mode — Dark / Light / System.

    👆 Swipe — Smooth gesture navigation between tabs.

    🗄 IndexedDB — Persistent local storage with automatic migration from localStorage.

    📤 Export / 📥 Import — Backup and restore all your data as a `.json` file.

    🎉 Celebration — Confetti animation upon completing all tasks.

    📱 PWA — Fully installable on mobile devices, works offline.

## 🚀 Installation

### On Mobile (Web App)

    Open the site in Chrome (Android) or Safari (iOS).

    Click ⋮ → Add to Home Screen (or the Share icon on iOS).

    Done! The app works just like a native one.

### As an APK

    Go to PWABuilder.com.

    Paste your site URL (e.g., https://matiziompl.github.io/DayFlow/).

    Click Start → select Android → Download APK.

    Install the APK on your phone.

### Locally

Simply open index.html in any web browser — no server or Node.js required.

## 📁 Structure

```text
dayflow/
├── index.html      # HTML structure
├── style.css       # Styling (themes, animations, dark/light mode)
├── app.js          # App logic (IndexedDB, streak, ice, scheduling)
├── manifest.json   # PWA Manifest
├── sw.js           # Service Worker (offline support)
├── icon.png        # App icon
└── README.md       # This file
```

## 🎨 Themes (13 × Light & Dark)

```text
Emoji   Name        Accent
🌙      Midnight    Emerald Green
🌊      Ocean       Sky Blue
🌅      Zachód      Burnt Orange
🌲      Las         Lime Green
💜      Lawenda     Violet Purple
🌸      Sakura      Hot Pink
⚡      Monokai     Golden Yellow
⬜      Mono        Neutral Gray
🖤      B&W         Pure Black/White
🔮      Violet      Deep Purple
🍋      Citrus      Amber
🌫️      Slate       Cool Gray
🌹      Rose        Crimson Red
```

## ❄️ Streak Freeze

- Ice charges accumulate automatically every **X days** (set in ⚙️ Settings).
- Tap the 🔥 streak badge to open the streak popup and see your ice count.
- Press **Streak Freeze** to freeze today (or tap a past day in the Calendar).
- Frozen days appear in **light blue** on the calendar and count toward your streak.
- Each freeze costs **1 ice charge**.

## 🛠 Troubleshooting (APK URL Bar & Android Widgets)

**Removing the URL Bar in APK (Trusted Web Activity)**
If you see the browser address bar in your APK, it means the Digital Asset Links verification failed. To fix this:
1. Extract your APK's SHA-256 fingerprint (from the keystore you used to sign it).
2. Update the `sha256_cert_fingerprints` array in `.well-known/assetlinks.json`.
3. Ensure your site (where `assetlinks.json` is hosted) is deployed and matches the exact domain the APK opens.

**Android Home Screen Widgets**
Currently, DayFlow is built as a pure web application (PWA). Standard PWAs do not have the capability to create native Android home screen widgets.
To achieve native Android widgets, the project would need to be migrated to a native Android environment (Android Studio / Kotlin or Capacitor with native plugins).

## 📄 License
MIT — Feel free to use it however you want!
