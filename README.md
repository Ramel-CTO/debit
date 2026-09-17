# DeBit 

> **Train your robot pet. Prevent core overheating.**  
> A Tamagotchi-style virtual pet game.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20With-GitHub%20Pages-blue?style=flat-square&logo=github)](https://pages.github.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

### 🤖 What is DeBit?

**DeBit** turns digital pet care into an addictive, micro-dopamine experience. Users manage a reactive square microchip robot pet by monitoring its real-time operational stats, keeping it energized and liquid-cooled, and tapping the screen to train its **Intelligence** through an infinite leveling system.

* **Zero Backend & Zero Logins:** Runs 100% locally in the browser using HTML5 Canvas and `localStorage`.
* **Hardware Overheat Survival:** Real-time decay timers drain Energy (green) and Water cooling (blue) meters. If either hits zero, your pet enters a 7-day **Compute Power** decline due to thermal throttling (`_`).
* **System Overheat & Emergency Reboot:** If Compute reaches 0%, the bot faints with `X X` cross eyes and enters a total system lockout. Rebooting the core shocks it back to life, but completely wipes its Intelligence memory back to Level 1!
* **PWA Enabled:** Install directly to an iOS or Android home screen for a full-screen, offline-ready native app experience.

---

### ✨ Core Features

* **Intel Leveling Engine:** Tapping the screen awards **+5 Intel** (+25 Intel on Critical hits). Progress fills the forehead **Brain Icon** and HUD progress bar toward 100-point level milestones.
* **8 Progressive Rank Titles:** Watch your pet evolve from **Lvl 1: Baby Bot** all the way to **Lvl 8+: Omniscient Bot**.
* **Targeted Care System:** Tap the **ENERGY** or **WATER** meter to select it. General screen taps will directly replenish that stat until full before automatically returning to Intel training mode.
* **Brain Pulse FX:** Training Intel causes the robot's head to physically swell while emitting glowing electric-blue radial shockwaves.
* **Persistent Local State:** Automatically preserves pet level, current Intel, vital meters, and offline decay timestamps across browser sessions.

---

### 🕹️ How to Play

| Action | How It Works |
| :--- | :--- |
| **Train Intel** | Tap anywhere on screen while no meter is highlighted to earn +5 Intel. |
| **Refill Energy / Water** | Tap the green **ENERGY** or blue **WATER** meter to select it, then tap the screen to replenish it. |
| **Critical Hits** | 5% chance on any tap to trigger a **CRIT** burst (+25 Intel, +25 Energy, or +30 Water). |
| **Leveling Up** | Every 100 Intel triggers a screen shake, particle explosion, synth tune, and rank unlock. |
| **System Reboot** | At 0% Compute Power, tap **⚡ Emergency Reboot** to shock your bot back to life and reset to Level 1. |

---

### 📲 Mobile Installation (PWA)

* **iOS (Safari):** Open the app URL, tap the **Share** button, and select **Add to Home Screen**.
* **Android (Chrome):** Open the app URL and tap **Install App** or the **Add to Home Screen** banner prompt.

---

### 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Rendering Engine** | HTML5 Canvas API |
| **Audio Engine** | Web Audio API (Native Oscillator & Gain Nodes) |
| **Storage & PWA** | Browser `localStorage`, Service Worker, Web App Manifest |
| **Deployment** | Static Hosting via GitHub Pages |

---

### 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
