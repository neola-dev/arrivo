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
import { useRef } from "react";
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
  const [preAlertWarning, setPreAlertWarning] = useState(null);
  const speedMap = {
    walking: 5,
    bike: 15,
    car: 40,
    bus: 30,
    train: 80,
  };

  const [journeyStarted, setJourneyStarted] = useState(false);
  const [audio] = useState(new Audio("/alert.mp3"));


  const [currentSpeed, setCurrentSpeed] = useState(0);
  const lastPosition = useRef(null);
  const lastTimestamp = useRef(null);

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

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const timestamp = position.timestamp;

        setUserLat(lat);
        setUserLng(lng);
        setLocationError(false);

        // 🔥 REAL GPS SPEED (m/s → km/h)
        let speedKmh = position.coords.speed ? position.coords.speed * 3.6 : 0;

        lastPosition.current = { lat, lng };
        lastTimestamp.current = timestamp;

        // 🔥 fallback manual speed calc
        if (!position.coords.speed && lastPosition.current && lastTimestamp.current) {
          const d = getDistance(lastPosition.lat, lastPosition.lng, lat, lng);
          const timeDiff = (timestamp - lastTimestamp) / 3600000; // hours

          if (timeDiff > 0) {
            speedKmh = d / timeDiff;
          }
        }

        // 🔥 smooth speed (prevents jumps)
        setCurrentSpeed((prev) =>
          prev === 0 ? speedKmh : prev * 0.7 + speedKmh * 0.3
        );

        setLastPosition({ lat, lng });
        setLastTimestamp(timestamp);

        if (!destLat || !destLng) return;

        const d = getDistance(lat, lng, destLat, destLng);
        handleDistanceLogic(d, speedKmh);
      },
      (error) => {
          console.log("Geo error:", error);

          if (error.code === 1) {
            // PERMISSION DENIED
            setLocationError("denied");
          } else if (error.code === 2) {
            // POSITION UNAVAILABLE
            setLocationError("unavailable");
          } else if (error.code === 3) {
            // TIMEOUT
            setLocationError("timeout");
          } else {
            setLocationError(true);
         }
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [destLat, destLng, travelMode]);

  // manual trigger
  useEffect(() => {
    if (!userLat || !userLng || !destLat || !destLng) return;

    const d = getDistance(userLat, userLng, destLat, destLng);
    handleDistanceLogic(d, currentSpeed);
  }, [userLat, userLng, destLat, destLng]);

  // 🔥 DISTANCE LOGIC (FIXED + LIVE SPEED)
  const handleDistanceLogic = (d, liveSpeed) => {
    setDistance(d.toFixed(2));

    const fallbackSpeed = {
      walking: 4,
      bike: 20,
      car: 30,
      bus: 25,
      train: 60,
    };

    const speed =
  liveSpeed && liveSpeed > 1
    ? liveSpeed
    : fallbackSpeed[travelMode];
    const baseTime = (d / speed) * 60;

    const bufferMap = {
      walking: 1.3,
      bike: 1.2,
      car: 1.15,
      bus: 1.25,
      train: 1.1,
    };

    const adjustedTime = baseTime * (bufferMap[travelMode] || 1.2);

    setEta(Math.round(adjustedTime));
    setRemainingTime(adjustedTime);

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

    if (allowAlert && adjustedTime <= alertTime * 2 && alertStage === null) {
      setAlertStage("warning");
      setShowAlert(true);
      setAlertMessage("🟡 You are getting close to your destination");
    }

    if (allowAlert && adjustedTime <= alertTime && !alertTriggered) {
      setAlertStage("final");
      setShowAlert(true);
      setAlertMessage("🔴 Final alert: You are about to reach your destination");

      audio.play().catch(() => {});
      navigator.vibrate?.([500, 300, 500]);

      setAlertTriggered(true);
    }
  };

  // START JOURNEY (PRE-CHECK)
  const handleStartJourney = () => {
    if (!userLat || !userLng || !destLat || !destLng) {
      alert("Please select destination first");
      return;
    }

    const d = getDistance(userLat, userLng, destLat, destLng);
    const speed = currentSpeed > 1 ? currentSpeed : 30;
    const timeToReach = (d / speed) * 60;

    if (timeToReach <= alertTime) {
      setPreAlertWarning({
        distance: d.toFixed(2),
        time: timeToReach.toFixed(1),
      });
      return;
    }

    setJourneyStarted(true);
  };


  return loading ? (
    <SplashScreen onFinish={() => setLoading(false)} />
  ) : (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="app-container">

        <h1 className="app-title">ARRIVO</h1>

        <p className="app-subtitle">
          Never miss your stop again. Smart wake-up alerts for travelers.
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

        {locationError && !isDesktop && (
          <div className="error-box">
            📍 Location access is required for tracking.

            <br />

            <button
              className="manual-src-btn"
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setUserLat(pos.coords.latitude);
                    setUserLng(pos.coords.longitude);
                    setLocationError(false);
                  },
                  () => alert("Please enable location in phone settings"),
                  { enableHighAccuracy: true }
                );
              }}
            >
              Enable Location
            </button>

            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              If popup doesn’t appear, enable location in Settings → Permissions → Location
            </p>
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

          {!journeyStarted && (
            <>
              <div className="control-block">
                <p className="control-title">Mode of Transport: {travelMode}</p>
                <div className="toggle-group">
                  {["walking", "bike", "car", "bus", "train"].map((mode) => (
                    <button
                      key={mode}
                      className={`toggle-btn ${travelMode === mode ? "active" : ""}`}
                      onClick={() => setTravelMode(mode)}
                    >
                      {mode === "walking" && "🚶"}
                      {mode === "bike" && "🛵"}
                      {mode === "car" && "🚗"}
                      {mode === "bus" && "🚌"}
                      {mode === "train" && "🚆"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-block">
                <p className="control-title">Alert Before: {alertTime} mins</p>
                <div className="toggle-group">
                  {[5, 10, 15].map((time) => (
                    <button
                      key={time}
                      className={`toggle-btn ${alertTime === time ? "active" : ""}`}
                      onClick={() => setAlertTime(time)}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="controls-row">
                <JourneyControls
                  journeyStarted={journeyStarted}
                  setJourneyStarted={handleStartJourney}
                  destLat={destLat}
                  destLng={destLng}
                  resetJourney={resetJourney}
                  audio={audio}
                />

                <button
                  className="test-btn"
                  onClick={async() => {
                    if (!userLat || !userLng) {
                      alert("Location not available!");
                      return;
                    }
                    try {
                      await audio.play();   // 🔥 unlock
                      audio.pause();
                      audio.currentTime = 0;
                    } catch {}

                    setDestLat(userLat);
                    setDestLng(userLng);
                    setPlaceName("📍 Test Mode");
                    setAlertTime(0.5);
                    setTestMode(true);
                    setJourneyStarted(true);
                  }}
                >
                  Test Mode
                </button>
              </div>
            </>
          )}

          {journeyStarted && (
            <JourneyControls
              journeyStarted={journeyStarted}
              setJourneyStarted={setJourneyStarted}
              destLat={destLat}
              destLng={destLng}
              resetJourney={resetJourney}
              audio={audio}
            />
          )}
        </div>
        
        {preAlertWarning && (
          <div className="warning-box">
            ⚠️ You’re already very close to your destination.<br />
            You may reach in {preAlertWarning.time} mins.

            <div className="warning-actions">
              <button
                onClick={() => {
                  setPreAlertWarning(null);
                  setJourneyStarted(true);
                }}
              >
                Start Anyway
              </button>

              <button onClick={() => setPreAlertWarning(null)}>
                Adjust Alert
              </button>
            </div>
          </div>
        )}

        <div className="section center">
          <p><strong>DESTINATION:</strong> {placeName || "NOT SELECTED"}</p>
          {testMode && ( <> <div className="test-banner">🧪 Test Mode Active</div> <p>Source & destination are the same, so alerts trigger instantly.</p> </> )}
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
                <p>Speed</p>
                <h2>{currentSpeed ? currentSpeed.toFixed(1) : "--"} km/h</h2>
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
