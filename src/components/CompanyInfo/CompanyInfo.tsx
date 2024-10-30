import { useCompanyData } from "./useCompany";

export const CompanyInfo = () => {
  const { data, isLoading, error } = useCompanyData();

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Company Info</h2>
      {isLoading && <div className="loading">Loading...</div>}
      {data && (
        <div>
          <p>CEO: {data.company.ceo}</p>
          <p>Name: {data.company.name}</p>
          <p>Founded: {data.company.founded}</p>
        </div>
      )}
    </div>
  );
}; 