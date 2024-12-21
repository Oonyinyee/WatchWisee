window.addEventListener('DOMContentLoaded', () => {
  const query = new URLSearchParams(window.location.search).get('query');
  const movieDetails = document.getElementById('movie-details');

  if (!query) {
    movieDetails.innerHTML = '<p>No movie or show selected. Go back and try again!</p>';
    return;
  }

  fetchMovieDetails(query); // Fetch movie/show details
  setupStarRating(); // Set up star rating system
  setupReviewSection(query); // Set up review section
});

// Fetch movie/show details from the OMDB API
function fetchMovieDetails(query) {
  fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=fadb5b64`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        displayDetails(data); // Display movie/show details
        fetchTrailer(data.Title); // Fetch trailer for the movie/show
        fetchRecommendations(data.Genre); // Fetch recommended movies/shows
      } else {
        document.getElementById('movie-details').innerHTML = `<p>No details found for "${query}".</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching movie details:', error);
      document.getElementById('movie-details').innerHTML = '<p>Error loading details. Please try again later.</p>';
    });
}

// Display the movie/show details
function displayDetails(data) {
  const poster = data.Poster !== "N/A" ? data.Poster : 'placeholder.jpg';

  document.getElementById('movie-details').innerHTML = `
    <div id="details-container">
      <div id="poster-section">
        <h2>${data.Title} (${data.Year})</h2>
        <img src="${poster}" alt="${data.Title} Poster" class="poster">
        <p><strong>Genre:</strong> ${data.Genre || 'Not available'}</p>
        <p><strong>Plot:</strong> ${data.Plot || 'No plot available'}</p>
        <p><strong>Director:</strong> ${data.Director || 'Not available'}</p>
        <p><strong>Cast:</strong> ${data.Actors || 'Not available'}</p>
        <p><strong>IMDB Rating:</strong> ${data.imdbRating || 'Not rated yet'}</p>
      </div>
      <div id="trailer-section">
        <p>Loading trailer...</p>
      </div>
      <div id="recommendation-section">
        <h3>Recommended Titles</h3>
        <div id="recommendation-slider"></div>
      <div id="reviews-section">
        <h3>User Reviews</h3>
        <div id="reviews-container"></div>
        <form id="review-form">
          <textarea id="review-input" placeholder="Write your review here..." required></textarea>
          <button type="submit">Submit Review</button>
        </form>
      </div>
      <div id="rating-section">
        <h4>Your Rating:</h4>
        <div id="stars">
          <span class="star" data-value="1">&#9733;</span>
          <span class="star" data-value="2">&#9733;</span>
          <span class="star" data-value="3">&#9733;</span>
          <span class="star" data-value="4">&#9733;</span>
          <span class="star" data-value="5">&#9733;</span>
        </div>
        <p id="selected-rating">Rating: 0</p>
      </div>
    </div>
  `;
}

// Fetch and display the trailer from YouTube
function fetchTrailer(title) {
  const trailerSection = document.getElementById('trailer-section');
  const apiKey = 'AIzaSyCeOjoQqyvpIjFmQbqwkEZTVg3ea-sWaOQ';
  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title)}+trailer&type=video&key=${apiKey}`;

  fetch(youtubeApiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        trailerSection.innerHTML = `
          <h3>Trailer</h3>
          <iframe 
            width="400" 
            height="225" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        `;
      } else {
        trailerSection.innerHTML = '<p>No trailer found for this title.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching trailer:', error);
      trailerSection.innerHTML = '<p>Error loading trailer. Please try again later.</p>';
    });
}

// Recommendation slider functionality
let slideIndex = 0;

function fetchRecommendations(genre) {
  const recommendationSection = document.getElementById('recommendation-slider');
  recommendationSection.innerHTML = 'Loading recommendations...';

  const genreKeyword = genre ? genre.split(",")[0].trim() : "popular";

  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(genreKeyword)}&apikey=fadb5b64`)
    .then(response => response.json())
    .then(data => {
      if (data.Search && data.Search.length > 0) {
        const recommendationsHTML = data.Search.map(movie => `
          <div class="recommendation-slide">
            <img src="${movie.Poster}" alt="${movie.Title} Poster">
            <p>${movie.Title} (${movie.Year})</p>
          </div>
        `).join('');

        recommendationSection.innerHTML = `
          <div class="recommendation-slider-wrapper">
            <div class="recommendation-slides">
              ${recommendationsHTML}
            </div>
            <button class="prev" onclick="moveSlide(-1)">&#10094;</button>
            <button class="next" onclick="moveSlide(1)">&#10095;</button>
          </div>
        `;
        updateSlides();
      } else {
        recommendationSection.innerHTML = '<p>No recommendations found.</p>';
      }
    })

    .catch(error => {
      console.error('Error fetching recommendations:', error);
      recommendationSection.innerHTML = '<p>Error loading recommendations.</p>';
    });
}

function updateSlides() {
  const slides = document.querySelectorAll('.recommendation-slide');
  slides.forEach((slide, index) => {
    slide.style.display = index === slideIndex ? 'block' : 'none';
  });
}

function moveSlide(n) {
  const slides = document.querySelectorAll('.recommendation-slide');
  if (!slides.length) return;

  slideIndex = (slideIndex + n + slides.length) % slides.length;
  updateSlides();
}

// Star rating functionality
function setupStarRating() {
  const stars = document.querySelectorAll('.star');
  const selectedRating = document.getElementById('rating-value');
  let currentRating = 0;

  stars.forEach((star) => {
    const starValue = parseInt(star.dataset.value);

    star.addEventListener('mouseover', () => updateStarHighlight(starValue));
    star.addEventListener('mouseout', () => updateStarHighlight(currentRating));
    star.addEventListener('click', () => {
      currentRating = starValue;
      updateStarHighlight(currentRating);
      selectedRating.textContent = `Rating: ${currentRating}`;
    });
  });

  function updateStarHighlight(value) {
    stars.forEach((star) => {
      const isHighlighted = parseInt(star.dataset.value) <= value;
      star.classList.toggle('highlighted', isHighlighted);
    });
  }
}

// Review section functionality
function setupReviewSection(movieTitle) {
  const reviewsContainer = document.getElementById('reviews-container');
  const reviewForm = document.getElementById('review-form');
  const reviewInput = document.getElementById('review-input');
  const reviewsKey = `reviews-${movieTitle}`;
  const savedReviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];

  function displayReviews() {
    reviewsContainer.innerHTML = savedReviews.length
      ? savedReviews.map(review => `<div class="review"><p>${review}</p></div>`).join('')
      : '<p>No reviews yet. Be the first to add one!</p>';
  }

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newReview = reviewInput.value.trim();
    if (newReview) {
      savedReviews.push(newReview);
      localStorage.setItem(reviewsKey, JSON.stringify(savedReviews));
      reviewInput.value = '';
      displayReviews();
    }
  });

  displayReviews();
}
