

export const fetchGoogleBooks = async (query, apiKey) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items || [];
};