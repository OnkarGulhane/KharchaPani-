# 📱 KharchaPani — Native Android App Setup & Run Guide

Welcome to the **100% Native Android** version of KharchaPani built with **Kotlin** and **Jetpack Compose (Material 3)**.

---

## 🏛️ Project Architecture
- **Language:** Kotlin 1.9.23
- **UI Framework:** Jetpack Compose (Material 3)
- **Theme:** Obsidian Dark Mode (`#070b14`), Glass Cards & Emerald Accents
- **Network Layer:** Retrofit 2 + OkHttp 4 + AuthInterceptor (Auto JWT Refresh)
- **State Management:** MVVM with Kotlin `StateFlow`
- **Native Android Superpowers:**
  - 📲 **BankSmsReceiver:** Automatic Indian Bank & UPI SMS detection (HDFC, SBI, ICICI, GPay, PhonePe, Paytm)
  - 🎙️ **बोली खर्चा:** Speech-to-text NLP voice expense parser in Marathi, Hindi, and English
  - 🤖 **खर्चा Guru:** Dedicated AI Chatbot
  - 📊 **AI Financial Suite:** Financial Health (0-100), Burn Rate & Forecaster, Sentiment CBT
  - ⚙️ **Dynamic Server IP Switcher:** Configure emulator (`10.0.2.2:8000`) or Wi-Fi LAN IP (`192.168.x.x:8000`) in 1 click.

---

## 🚀 How to Run & Build in VS Code (Without Android Studio)

### 1. Prerequisites Check
Your PC already has **Java 21 LTS** installed.

### 2. Connect Your Android Phone (Physical Device)
1. On your phone: Go to **Settings > About Phone > Tap 'Build Number' 7 times**.
2. Go to **Developer Options > Turn ON 'USB Debugging'**.
3. Connect phone to PC using USB cable.

### 3. Server Configuration
- Make sure your FastAPI backend is running:
  ```bash
  cd e:\kharchaPani\backend
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- In the app's **Settings (⚙️)** screen, set the server URL to your PC's Wi-Fi IP address (e.g. `http://192.168.1.10:8000/api/v1/`).

---

## 📂 Codebase Structure
```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/kharchapani/app/
│           ├── KharchaPaniApp.kt
│           ├── MainActivity.kt
│           ├── theme/             # Obsidian Dark Theme & Colors
│           ├── data/              # Retrofit API, Repositories, SessionManager
│           ├── viewmodel/         # Auth, Dashboard, Expense, AI ViewModels
│           ├── ui/                # Compose Screens (Dashboard, Guru, Voice, Analytics)
│           └── receiver/          # Bank SMS Auto-Debit Reader
└── build.gradle.kts
```
