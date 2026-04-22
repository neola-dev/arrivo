import { useEffect, useState } from "react";
import LottieImport from "lottie-react";
import splashAnim from "../animations/travel1.json";
import "./splash.css";

const Lottie = LottieImport.default; // ✅ FIX

function SplashScreen({ onFinish }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(() => onFinish?.(), 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
  <div className={`splash-container ${exit ? "exit" : ""}`}>
    <div className="bg-glow"></div>
    <div className="content-wrapper">
      <div className="lottie-wrapper">
        <Lottie animationData={splashAnim} loop />
      </div>
      <div className="logo">ARRIVO</div>

      <p className="tagline">Your Personal Travel Companion</p>

      <div className="subtitle">
        Sleep peacefully — we’ll wake you right on time.
      </div>

      <div className="subtitle small">
        We track your journey in real-time so you never miss your stop.
      </div>

      <div className="subtitle small">
        Smart alerts • Live tracking • Stress-free travel
      </div>

    </div>
  </div>
);
}

export default SplashScreen;