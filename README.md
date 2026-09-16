# DeBit ⚡

> **Train your robot pet. Keep it alive.**  
> A hyper-casual, client-side Tamagotchi-style virtual pet and micro-tapping game built with zero backend dependencies.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20With-GitHub%20Pages-blue?style=flat-square&logo=github)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-brightgreen?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

### 🤖 What is DeBit?

**DeBit** turns digital pet care into an addictive, micro-dopamine experience. Users take care of a reactive, interactive square robot pet by monitoring its real-time vital stats, keeping it fed and hydrated, and tapping the screen to train its **Intelligence** through an infinite leveling system.

* **Zero Backend & Zero Logins:** Runs 100% locally in the browser using HTML5 Canvas and `localStorage`.
* **7-Day Tamagotchi Survival:** Real-time decay timers continuously drain Food (green) and Water (blue) meters. If either hits zero, your pet enters a 7-day Health decline with sad expressions (`;_;`).
* **Game Over & Emergency Defibrillator:** If Health reaches 0%, the bot faints with `X X` cross eyes and enters lockout. Reviving it shocks it back to life, but completely wipes its Intelligence memory back to Level 1!
* **Tactile Feedback & Audio:** Zero-latency Web Audio synth escalation, screen shakes, particle explosions, and interactive touch-tracking eyes.

---

### ✨ Core Features

* **Intel Leveling Engine:** Tapping the screen awards **+5 Intel** (+25 Intel on Critical hits). Progress fills the forehead **Brain Icon** and HUD progress bar toward 100-point level milestones.
* **8 Progressive Rank Titles:** Watch your pet evolve from **Lvl 1: Baby Bot** all the way to **Lvl 8+: Omniscient Bot**.
* **Targeted Care System:** Tap the **FOOD** or **WATER** meter to select it. Screen taps will directly refill that meter until full, automatically returning you to Intel training mode.
* **Brain Pulse FX:** Training Intel causes the robot's head to physically swell while emitting glowing electric-blue radial shockwaves.
* **Persistent Local State:** Automatically preserves pet level, current Intel, vital meters, and offline decay timestamps across browser sessions.

---

### 🕹️ How to Play

| Action | How It Works |
| :--- | :--- |
| **Train Intel** | Tap anywhere on screen while no meter is highlighted to earn +5 Intel. |
| **Refill Food / Water** | Tap the green **FOOD** or blue **WATER** meter to select it, then tap the screen to replenish the meter. |
| **Critical Hits** | 5% chance on any tap to trigger a **CRIT** burst (+25 Intel, +25 Food, or +30 Water). |
| **Leveling Up** | Every 100 Intel triggers a screen shake, particle explosion, synth tune, and rank unlock. |
| **Game Over & Revive** | At 0% Health, tap **⚡ Emergency Revive** to revive your bot and reset to Level 1. |

---

### 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Rendering Engine** | HTML5 Canvas API |
| **Audio Engine** | Web Audio API (Native Oscillator & Gain Nodes) |
| **Storage** | Browser `localStorage` |
| **Deployment** | Static Hosting via GitHub Pages |

---

### 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
