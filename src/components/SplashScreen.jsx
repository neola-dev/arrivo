import { useEffect, useState } from "react";
import LottieImport from "lottie-react";
import splashAnim from "../animations/travel2.json";
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

      <div className="lottie-wrapper">
        <Lottie animationData={splashAnim} loop />
      </div>

      <div className="logo">ARRIVO</div>

      <p className="tagline">Wake-Up Alerts for Travelers</p>

      <div className="subtitle">
        💤 Don’t miss your stop — we’ll wake you up on time
      </div>

      <div className="subtitle small">
        📍 Real-time tracking • Smart alerts • Travel stress-free
      </div>
    </div>
  );
}

export default SplashScreen;