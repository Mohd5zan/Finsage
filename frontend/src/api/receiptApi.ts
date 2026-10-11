const API_URL = "http://localhost:5000";

export async function scanReceipt(
  file: File,
  accessToken: string
) {
  const formData = new FormData();

  formData.append("receipt", file);

  const response = await fetch(
    `${API_URL}/api/expenses/scan-receipt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to scan receipt");
  }

  return result.data;
}