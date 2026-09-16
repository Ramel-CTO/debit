# DeBit 

> **Tap your debt to zero.**  
> A hyper-casual, zero-friction financial habit tracker designed to turn debt payoff into an addictive micro-game.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20With-GitHub%20Pages-blue?style=flat-square&logo=github)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-brightgreen?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

### 🎮 What is DeBit?

**DeBit** replaces boring financial spreadsheets with instant visual and audio dopamine. By breaking overwhelming debt balances into destructible 3D target blocks, users chip away at their financial goals through rapid screen taps, dynamic audio feedback, and variable "Critical Hits."

* **Zero Bank Logins:** No Plaid, no passwords, and zero financial links. It operates entirely on local device tracking.
* **Micro-Dopamine Loops:** Screen shakes, particle explosions, and scaling pitch effects convert financial stress into micro-wins.
* **Seamless Payment Redirects:** Clearing a daily shred goal prompts a 1-tap deep link to finalize actual transfers inside Venmo, Cash App, or PayPal.

---

### ✨ Core Features

* **3D Particle Destruction Engine:** Built natively on HTML5 Canvas for smooth 60fps performance across iOS, Android, and Desktop.
* **Variable Reward Mechanics:** 5% chance on every tap to trigger a golden **CRIT** burst that wipes out **-$5.00** instead of **-$0.25**.
* **Zero-Latency Web Audio Synthesizer:** Real-time pitch escalation that scales audio frequencies with tapping speed without external MP3 dependencies.
* **Persistent Local State:** Uses browser `localStorage` to automatically preserve active target balances and daily progress between sessions.

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

### 🚀 Quick Start & Development

#### 1. Launch in GitHub Codespaces
1. Click the green **`<> Code`** button at the top of this repository.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Open `index.html` and use the built-in live preview extension to test interactions.

#### 2. Local Setup
Clone the repository and open `index.html` in any browser:

```bash
git clone [https://github.com/YOUR-USERNAME/debit.git](https://github.com/YOUR-USERNAME/debit.git)
cd debit
open index.html
