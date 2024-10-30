import { useState } from "react";
import { useLandpadsData } from "./useLandpads";

export const Landpads = () => {
  const [page, setPage] = useState(0);
  const pageSize = 3;

  const { data, isLoading, error, refetch } = useLandpadsData({
    limit: pageSize,
    offset: page * pageSize,
  });

  const handleRefetch = async () => {
    console.log("Manually triggering landpads refetch...");
    await refetch();
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>SpaceX Landpads</h2>
        <div>
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            style={{ marginRight: "10px" }}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>Page {page + 1}</span>
          <button
            onClick={handleNextPage}
            disabled={!data || data.landpads.length < pageSize}
            style={{ marginRight: "20px" }}
          >
            Next
          </button>
          <button
            onClick={handleRefetch}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Refetching..." : "🔄 Refetch Data"}
          </button>
        </div>
      </div>

      {isLoading && <div className="loading">Loading...</div>}
      {data && (
        <div style={{ display: "grid", gap: "20px" }}>
          {data.landpads.map((landpad) => (
            <div
              key={landpad.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{landpad.full_name}</h3>
              <p>
                <strong>Type:</strong> {landpad?.landing_type}
              </p>
              <p>
                <strong>Status:</strong> {landpad?.status}
              </p>
              <p>
                <strong>Location:</strong> {landpad?.location?.name},{" "}
                {landpad?.location?.region}
              </p>
              <p>
                <strong>Coordinates:</strong> {landpad?.location?.latitude},{" "}
                {landpad?.location?.longitude}
              </p>
              <p>
                <strong>Landings:</strong> {landpad?.successful_landings}{" "}
                successful / {landpad?.attempted_landings} attempted
              </p>
              {landpad?.details && (
                <p>
                  <strong>Details:</strong> {landpad?.details}
                </p>
              )}
              {landpad?.wikipedia && (
                <p>
                  <a
                    href={landpad.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0066cc" }}
                  >
                    Wikipedia →
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
