import { Link, useNavigate } from "react-router-dom";
import "./NotFound.scss";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div
      className="text-light"
      style={{
        fontSize: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        textAlign: "center",
      }}
    >
      <h1>404</h1>
      <p>Portfolio not found</p>
      <Link to="/">Go back to Dashboard</Link>
    </div>
  );
}
