import { useLaunchesData } from "./useLaunches";

export const Launches = () => {
  const { data, isLoading, error, refetch } = useLaunchesData();

  const handleRefetch = async () => {
    console.log("Manually triggering refetch...");
    await refetch();
  };

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Recent Launches</h2>
        <button 
          onClick={handleRefetch}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Refetching...' : '🔄 Refetch Data'}
        </button>
      </div>

      {isLoading && <div className="loading">Loading...</div>}
      {data && (
        <div>
          {data.launches.map((launch, index) => (
            <div key={index} className="launch-item">
              <h3>{launch.mission_name}</h3>
              <p>
                Date: {new Date(launch.launch_date_local).toLocaleDateString()}
              </p>
              <p>
                Status:{" "}
                <span className={launch.launch_success ? "success" : "failure"}>
                  {launch.launch_success ? "✅ Success" : "❌ Failed"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
