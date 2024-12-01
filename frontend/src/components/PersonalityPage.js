import React, { useState } from "react";

function PersonalityPage() {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDescription = async () => {
    setError(""); // Reset error
    setLoading(true); // Show loading state
    try {
      const token = localStorage.getItem("authToken"); // Use the stored auth token
      const response = await fetch("/api/spotify/personality/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDescription(data.description);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server");
    } finally {
      setLoading(false); // Remove loading state
    }
  };

  return (
    <div>
      <h1>Spotify Personality Description</h1>
      <button onClick={fetchDescription} disabled={loading}>
        {loading ? "Generating..." : "Generate Description"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {description && <p>{description}</p>}
    </div>
  );
}

export default PersonalityPage;
