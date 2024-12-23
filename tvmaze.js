"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for TV shows that match that query. */
async function getShowsByTerm(term) {
  try {
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${term}`);
    const data = await response.json();

    // Return formatted show data
    return data.map(show => ({
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image ? show.show.image.medium : "https://tinyurl.com/tv-missing" // Default image if no image exists
    }));
  } catch (error) {
    console.error("Error fetching shows:", error);
    return [];
  }
}

/** Given a list of shows, populate the DOM with show details */
function populateShows(shows) {
  $showsList.empty(); // Clear any previous shows

  // Loop through each show and create HTML for it
  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
        <div class="media">
          <img class="card-img-top" src="${show.image}" alt="${show.name}" class="w-25 me-3">
          <div class="media-body">
            <h5 class="text-primary">${show.name}</h5>
            <div><small>${show.summary}</small></div>
            <button class="btn btn-outline-light btn-sm Show-getEpisodes">
              Episodes
            </button>
          </div>
        </div>
      </div>
    `);

    // Append the show to the DOM
    $showsList.append($show);
  }
}

/** Given a show ID, get the episodes of that show */
async function getEpisodes(id) {
  try {
    const response = await fetch(`http://api.tvmaze.com/shows/${id}/episodes`);
    const data = await response.json();

    // Return an array of episodes with relevant details
    return data.map(episode => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }));
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

/** Given a list of episodes, populate the episodes list in the DOM */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");  // Target the episodes list element
  $episodesList.empty();  // Clear any previous episodes

  // Loop through each episode and create a list item
  for (let episode of episodes) {
    const $episode = $(`
      <li>
        ${episode.name} (Season ${episode.season}, Episode ${episode.number})
      </li>
    `);

    // Append the episode to the list
    $episodesList.append($episode);
  }

  // Show the episodes area now that episodes have been populated
  $("#episodesArea").show();
}

/** Handle search form submission: get shows from API and display. */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide(); // Hide the episodes area by default
  populateShows(shows);  // Populate the shows in the DOM
}

// Listen for form submission to start search
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

// Event handler for clicking the "Episodes" button
$showsList.on("click", ".Show-getEpisodes", async function(evt) {
  // Get the show ID from the clicked button's parent div (using jQuery's .closest() to traverse DOM)
  const showId = $(this).closest(".Show").data("show-id");

  // Fetch episodes for the clicked show
  const episodes = await getEpisodes(showId);

  // Populate the episodes list
  populateEpisodes(episodes);
});
