# DeBit ⚡

> **Train your robot pet. Keep it alive.**  
> A hyper-casual, client-side Tamagotchi-style virtual pet and micro-tapping game built with zero backend dependencies.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20With-GitHub%20Pages-blue?style=flat-square&logo=github)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-brightgreen?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

### 🤖 What is DeBit?

**DeBit** turns digital pet care into an addictive, micro-dopamine experience. Users take care of a reactive, interactive square robot pet by monitoring its real-time vital stats, feeding and hydrating it, and tapping the screen to train its **Intelligence** through an infinite leveling system.

* **Zero Backend & Zero Logins:** Runs 100% locally in the browser using HTML5 Canvas and `localStorage`.
* **Real-Time Tamagotchi Mechanics:** Dynamic decay timers constantly drain Food and Water meters. If neglected, your pet's Health drops and its face shifts to a sad expression (`;_;`).
* **Tactile Feedback & Haptics:** Zero-latency Web Audio synth escalation, screen shakes, particle explosions, and interactive touch-tracking eyes.

---

### ✨ Core Features

* **Intel Leveling Engine:** Every screen tap awards **+5 Intel** (+25 Intel on Critical hits). Progress fills the forehead **Brain Icon** and HUD progress bar toward 100-point level milestones.
* **8 Progressive Rank Titles:** Watch your pet evolve from **Lvl 1: Baby Bot** all the way up to **Lvl 8+: Omniscient Bot**.
* **Targeted Care System:** Tap the **FOOD** or **WATER** meter to enter Care Mode. Tapping the screen directly refills that stat until full, automatically returning you to Intel training mode.
* **Brain Pulse FX:** Training Intel causes the robot's head to physically swell while emitting glowing electric-blue radial shockwaves.
* **Persistent Local State:** Automatically preserves pet level, current Intel, vital meters, and offline decay timestamps between sessions.

---

### 🕹️ How to Play

| Action | How It Works |
| :--- | :--- |
| **Train Intel** | Tap anywhere on screen while no meter is highlighted to earn +5 Intel. |
| **Refill Food / Water** | Tap the green **FOOD** or blue **WATER** meter to select it, then tap the screen to replenish the meter. |
| **Critical Hits** | 5% chance on any tap to trigger a **CRIT** burst (+25 Intel, +25 Food, or +30 Water). |
| **Leveling Up** | Every 100 Intel triggers a screen shake, particle explosion, synth tune, and rank unlock. |

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

### 🚀 Quick Start & Setup

#### 1. Launch in GitHub Codespaces
1. Click the green **`<> Code`** button at the top of this repository.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Open `index.html` and use a live preview extension to test interactions.

#### 2. Local Setup
Clone the repository and open `index.html` in any web browser:

```bash
git clone [https://github.com/YOUR-USERNAME/debit.git](https://github.com/YOUR-USERNAME/debit.git)
cd debit
open index.html
