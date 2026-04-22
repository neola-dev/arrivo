# 🚀 Arrivo – Smart Journey Alert System

> 💤 Never miss your stop again.
> A smart travel companion that tracks your journey in real-time and alerts you **before reaching your destination** — even if you fall asleep.



## 🌐 Live Demo

👉 [https://arrivo-alert.vercel.app/](https://arrivo-alert.vercel.app/)



## ✨ Features

### 📍 Real-time GPS Tracking

* Uses **Geolocation API (watchPosition)** for continuous tracking
* Automatically updates user position live



### ⚡ Live Speed Detection (NEW 🔥)

* Uses **device GPS speed (`coords.speed`)**
* Fallback: calculates speed manually using distance + time
* Smoothens speed to avoid sudden jumps



### 🧭 Smart ETA Calculation

* ETA is calculated using **real-time speed instead of fixed values**
* Adds **dynamic buffer based on travel mode**
* Adapts to actual movement (traffic, stops, etc.)



### 🔔 Intelligent Alerts System

* 🟡 **Early Warning Alert**
* 🔴 **Final Alert (with sound + vibration)**
* Triggers only when user is **moving towards destination**



### 🧠 Movement Detection

* Detects:

  * ✔ Moving towards destination
  * ❌ Moving away / stationary
* Prevents **false alerts**



### ⚠️ Smart Pre-Alert Warning

* If user can reach destination within alert time:

  * Shows warning before starting journey
  * Prevents “instant alert” confusion (UX fix)



### 📵 GPS Failure Handling (UX Upgrade 🔥)

* Detects:

  * Permission denied
  * Location turned OFF
* Automatically switches to:

  * 📍 Manual map selection mode



### 🗺️ Interactive Map + Search

* Select destination using:

  * Google Maps
  * Search bar (Places API)



### 🧪 Test Mode

* Instantly simulate alerts
* Useful for demo + debugging



### 🎨 Modern UI / UX

* Smooth animations using **Lottie**
* Clean responsive design
* Splash screen with branding



## 🛠️ Tech Stack

* ⚛️ React (Vite)
* 🗺️ Google Maps JavaScript API
* 📍 Geolocation API
* 🎞️ Lottie Animations
* 🎨 Custom CSS


## ⚙️ Installation & Setup

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/arrivo.git
cd arrivo
```


### 2️⃣ Install dependencies

```bash
npm install
```


### 3️⃣ Add Environment Variables

Create a `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```


### 4️⃣ Run locally

```bash
npm run dev
```


## 🚀 Deployment

Deployed using **Vercel**

Steps:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable
4. Deploy


## ⚠️ Important Notes

* 📍 Requires **HTTPS** for location access
* 🔊 Audio alerts require **user interaction (browser policy)**
* 🗺️ Google Maps APIs required:

  * Maps JavaScript API
  * Places API


## 🎯 Use Cases

* 🚌 Bus travel
* 🚆 Train journeys
* 🚗 Road trips
* 😴 Sleeping during travel without missing stop


## 💡 Challenges Solved

* ❌ Static ETA causing wrong alerts
* ❌ Instant alerts when already near destination
* ❌ GPS permission failures breaking UX
* ❌ False alerts when user not moving


## 🚀 Future Improvements

* 📱 PWA (installable app)
* 🔔 Push notifications
* 🧠 AI-based route prediction
* 🗺️ Live public transport tracking


## 👨‍💻 Author

**Neola**


## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

👉 I can give you a **perfect 2-minute explanation script for Arrivo (interview answer)**
👉 Or mock questions interviewer will ask on this README

Just tell me 👍
