function AlertBox({ showAlert ,message}) {
  if (!showAlert) return null;

  return (
    <div style={{
      background: "red",
      color: "white",
      padding: "15px",
      marginTop: "20px",
      borderRadius: "10px",
      fontWeight: "bold"
    }}>
      {message}
    </div>
  );
}


export default AlertBox;