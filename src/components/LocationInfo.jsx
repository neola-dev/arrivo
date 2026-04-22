import "./LocationInfo.css";
function LocationInfo({ userLat, userLng, distance, journeyStarted }) {
  
  return (
    <div className={`journey-box`}>

      <p className="source-text">
        <strong>SOURCE:</strong> 📍 Your Current Location
      </p>

      {journeyStarted && (
        <div>
          <h2>🌙 Journey Mode Active</h2>

          <p className="distance-text">
            Distance Left: {distance ? distance + " km" : "-"}
          </p>

        </div>
      )}

    </div>
  );
}

export default LocationInfo;