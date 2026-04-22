import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

function SearchDestination({ setDestLat, setDestLng, setPlaceName, setTestMode }) {
  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setDestLat(lat);
    setDestLng(lng);
    setTestMode(false);

    // ✅ Better name
    setPlaceName(place.formatted_address || place.name);
  };

  return (
    <div style={{ marginTop: "20px",textAlign: "center"}}>
      <h3>SEARCH DESTINATION:</h3>

      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Search place (village, city, shop...)"
          style={{ width: "300px", padding: "8px"}}
        />
      </Autocomplete>
    </div>
  );
}

export default SearchDestination;