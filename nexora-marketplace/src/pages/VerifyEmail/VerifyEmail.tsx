
import { useEffect, useState } from "react";
import "./VerifyEmail.css";

type Status = "loading" | "success" | "error";

const API_URL = "http://localhost:8000/api/v1";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState(
    "Verifying your email address..."
  );

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(
        window.location.search
      );

      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Email verification failed."
          );
        }

        setStatus("success");
        setMessage(data.message);

        // Remove the token from the visible URL.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      }
    };

    void verify();
  }, []);

  return (
    <main className="verification-page">
      <section className="verification-card">
        <h1>NEXORA</h1>

        <div className={`verification-status ${status}`}>
          {status === "loading" && "Verifying..."}
          {status === "success" && "Email Verified"}
          {status === "error" && "Verification Failed"}
        </div>

        <p>{message}</p>

        {status === "success" && (
          <a href="/">
            Return to NEXORA
          </a>
        )}
      </section>
    </main>
  );
}
