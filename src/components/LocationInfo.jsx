import "./LocationInfo.css";
function LocationInfo({ userLat, userLng, distance, journeyStarted }) {
  let status = "";
  let statusClass = "";

  if (distance > 10) {
    status = "🟢 Far from destination";
    statusClass = "status-far";
  } else if (distance > 3) {
    status = "🟡 Getting closer";
    statusClass = "status-mid";
  } else {
    status = "🔴 Almost there";
    statusClass = "status-near";
  }
  return (
    <div className={`journey-box ${statusClass}`}>

      <p className="source-text">
        <strong>Source:</strong> 📍 Your Current Location
      </p>

      {journeyStarted && (
        <div className="journey-box">
          <h2>🌙 Journey Mode Active</h2>

          <p className="distance-text">
            Distance Left: {distance ? distance + " km" : "-"}
          </p>

          <p className="status-text">{status}</p>
        </div>
      )}

    </div>
  );
}

export default LocationInfo;