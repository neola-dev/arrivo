function JourneyControls({
  journeyStarted,
  setJourneyStarted,
  destLat,
  destLng,
  resetJourney,
  audio
}) {
  return (
    <>
      {!journeyStarted && (
        <button
          className="start-btn"
          disabled={!destLat || !destLng}
          onClick={async () => {
            if (!destLat || !destLng) {
              alert("Please set destination first!");
              return;
            }

            try {
              await audio.play();
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {
              console.log("Audio unlock failed", e);
            }

            setJourneyStarted(true);
          }}
        >
          🚀 Start Journey
        </button>
      )}

      {journeyStarted && (
        <button
          className="stop-btn"
          onClick={resetJourney}
        >
          ⛔ Stop Journey
        </button>
      )}
    </>
  );
}

export default JourneyControls;