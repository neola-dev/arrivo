import { useState, useEffect } from "react";
import { LoadScript } from "@react-google-maps/api";
import { getDistance } from "./utils/distance";
import "./App.css";

import LocationInfo from "./components/LocationInfo";
import JourneyControls from "./components/JourneyControls";
import AlertBox from "./components/AlertBox";
import MapSelector from "./components/MapSelector";
import SearchDestination from "./components/SearchDestination";
import SplashScreen from "./components/SplashScreen";

const libraries = ["places"];

function App() {
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationError, setLocationError] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);
  const [selectingSource, setSelectingSource] = useState(false);

  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  const [destLat, setDestLat] = useState(null);
  const [destLng, setDestLng] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [testMode, setTestMode] = useState(false);

  const [alertTime, setAlertTime] = useState(10);
  const [remainingTime, setRemainingTime] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [alertStage, setAlertStage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [travelMode, setTravelMode] = useState("car");

  const [prevDistance, setPrevDistance] = useState(null);
  const [isMovingTowards, setIsMovingTowards] = useState(false);
  const [hasStartedMoving, setHasStartedMoving] = useState(false);

  const speedMap = {
    walking: 5,
    bike: 15,
    car: 40,
    bus: 30,
    train: 80,
  };

  const [journeyStarted, setJourneyStarted] = useState(false);
  const [audio] = useState(new Audio("/alert.mp3"));

  // ✅ Detect device
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    setIsDesktop(!isMobile);
  }, []);

  const resetJourney = () => {
    setJourneyStarted(false);
    setAlertTriggered(false);
    setAlertStage(null);
    setShowAlert(false);
    setEta(null);
    setRemainingTime(null);
    setTestMode(false);

    setPrevDistance(null);
    setIsMovingTowards(false);
    setHasStartedMoving(false);

    audio.pause();
    audio.currentTime = 0;
  };

  // 📍 GEOLOCATION TRACKING
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLat(lat);
        setUserLng(lng);
        setLocationError(false);

        if (!destLat || !destLng) return;

        const d = getDistance(lat, lng, destLat, destLng);
        handleDistanceLogic(d);
      },
      () => setLocationError(true),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [destLat, destLng, travelMode]);

  // ✅ FIX: manual selection calculation
  useEffect(() => {
    if (!userLat || !userLng || !destLat || !destLng) return;

    const d = getDistance(userLat, userLng, destLat, destLng);
    handleDistanceLogic(d);
  }, [userLat, userLng, destLat, destLng]);

  // 🔥 COMMON DISTANCE LOGIC
  const handleDistanceLogic = (d) => {
    setDistance(d.toFixed(2));

    const speed = speedMap[travelMode] || 40;
    const timeMin = (d / speed) * 60;

    setEta(timeMin.toFixed(1));
    setRemainingTime(timeMin);

    if (prevDistance !== null) {
      if (d < prevDistance) {
        setIsMovingTowards(true);
        setHasStartedMoving(true);
      } else {
        setIsMovingTowards(false);
      }
    }

    setPrevDistance(d);

    if (!journeyStarted) return;

    const allowAlert = testMode || (hasStartedMoving && isMovingTowards);

    if (allowAlert && timeMin <= alertTime * 2 && alertStage === null) {
      setAlertStage("warning");
      setShowAlert(true);
      setAlertMessage("🟡 You are getting close to your destination");
    }

    if (allowAlert && timeMin <= alertTime && !alertTriggered) {
      setAlertStage("final");
      setShowAlert(true);
      setAlertMessage("🔴 Final alert: You are about to reach your destination");

      audio.play().catch(() => {});
      navigator.vibrate?.([500, 300, 500]);

      setAlertTriggered(true);
    }
  };

  return loading ? (
    <SplashScreen onFinish={() => setLoading(false)} />
  ) : (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="app-container">

        <h1 className="app-title">ARRIVO</h1>

        <p className="app-subtitle">
          💤 Never miss your stop again. Smart wake-up alerts for travelers.
        </p>

        {/* ✅ FIXED ERROR BOX */}
        {isDesktop && locationError && (
          <div className="error-box">
            📍 <strong>Location not detected.</strong><br />
            Click below to select your source manually.<br />
            📱 For best experience, use mobile.

            <br />
            <button
              className="manual-src-btn"
              onClick={() => setSelectingSource(true)}
            >
              Select Source on Map
            </button>
          </div>
        )}

        {/* MAP */}
        <div className="section map-section">
          <MapSelector
            userLat={userLat}
            userLng={userLng}
            destLat={destLat}
            destLng={destLng}
            setDestLat={setDestLat}
            setDestLng={setDestLng}
            setPlaceName={setPlaceName}
            setTestMode={setTestMode}
            journeyStarted={journeyStarted}
            setUserLat={setUserLat}
            setUserLng={setUserLng}
            selectingSource={selectingSource}
            setSelectingSource={setSelectingSource}
          />
        </div>

        <div className="section center">
          <LocationInfo
            userLat={userLat}
            userLng={userLng}
            distance={distance}
            journeyStarted={journeyStarted}
          />
        </div>

        {!journeyStarted && (
          <div className="section">
            <SearchDestination
              setDestLat={setDestLat}
              setDestLng={setDestLng}
              setPlaceName={setPlaceName}
              setTestMode={setTestMode}
            />
          </div>
        )}

        <div className="control-panel">
          <JourneyControls
            journeyStarted={journeyStarted}
            setJourneyStarted={setJourneyStarted}
            destLat={destLat}
            destLng={destLng}
            resetJourney={resetJourney}
            audio={audio}
          />
        </div>

        <div className="section center">
          <p><strong>Destination:</strong> {placeName || "Not selected"}</p>

          {journeyStarted && (
            <div className="stats-container">
              <div className="stat-card">
                <p>Distance</p>
                <h2>{distance || "--"} km</h2>
              </div>

              <div className="stat-card">
                <p>ETA</p>
                <h2>{eta || "--"} min</h2>
              </div>

              <div className="stat-card">
                <p>Remaining</p>
                <h2>{remainingTime?.toFixed(1) || "--"} min</h2>
              </div>
            </div>
          )}
        </div>

        <AlertBox showAlert={showAlert} message={alertMessage}/>
      </div>
    </LoadScript>
  );
}

export default App;