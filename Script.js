document.addEventListener('DOMContentLoaded', () => {
  const query = new URLSearchParams(window.location.search).get('query');
  console.log("Search Query:", query); // Debug: Log the query to check if it's correct
  
  // If no query, show an error message and stop further execution
  if (!query) {
    document.getElementById('results').innerHTML = '<p>No search term provided. Go back and try again!</p>';
    return;
  }

  // Fetch data from the OMDB API
  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=fadb5b64`)  // Correct API key format
    .then(response => response.json())
    .then(data => {
      console.log("API Response:", data); // Debug: Log the API response
      
      // Check if the API response is successful
      if (data.Response === "True") {
        displayResults(data.Search);  // Pass the search results to the display function
      } else {
        document.getElementById('results').innerHTML = `<p>No results found for "${query}".</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById('results').innerHTML = '<p>Error loading data. Please try again later.</p>';
    });
});

// Function to display results
function displayResults(results) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = ''; // Clear previous results

  // Loop through the results and create HTML for each movie/show
  results.forEach(item => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie-item');

    movieElement.innerHTML = `
      <h3>${item.Title} (${item.Year})</h3>
      <img src="${item.Poster}" alt="${item.Title} Poster" class="poster">
      <p>Type: ${item.Type}</p>
      <a href="details.html?query=${encodeURIComponent(item.Title)}">View Details</a>
    `;

    // Append each movie element to the results container
    resultsContainer.appendChild(movieElement);
  });
}
