
import { useState } from "react";
import Header from "./components/Header/Header";
import SellerProfile from "./pages/SellerProfile/SellerProfile";
import "./App.css";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";

function App() {
  const [page, setPage] = useState("seller-profile");
  if (window.location.pathname === "/verify-email") {
    return <VerifyEmail />;
  }
  return (
    <div className="app">
      <Header onNavigate={setPage} />

      {page === "seller-profile" ? (
        <SellerProfile />
      ) : (
        <main className="placeholder-page">
          <h1>{page.replace("-", " ")}</h1>
          <p>This marketplace module will be developed next.</p>
          <button onClick={() => setPage("seller-profile")}>
            Back to Seller Profile
          </button>
        </main>
      )}

      <footer className="app-footer">
        <strong>NEXORA.</strong>
        <span>Original Global Marketplace Platform</span>
        <span>© 2026 NEXORA</span>
      </footer>
    </div>
  );
}

export default App;
