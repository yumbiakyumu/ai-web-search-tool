// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.createElement('div'); // Create a div for search results
    const paginationContainer = document.createElement('div'); // Create a container for pagination
    const resultsPerPage = 3; // Number of results per page
    let currentPage = 1; // Track the current page
    let allResults = []; // Store all results

    // Append the results and pagination container to the main container
    document.querySelector('.container').appendChild(searchResults);
    document.querySelector('.container').appendChild(paginationContainer);

    // Handle form submission
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        const query = searchInput.value.trim();

        if (query) {
            searchResults.innerHTML = ''; // Clear previous results
            paginationContainer.innerHTML = ''; // Clear previous pagination
            currentPage = 1; // Reset to the first page

            try {
                allResults = await fetchSearchResults(query);
                displayResults(allResults);
                setupPagination(allResults.length);
            } catch (error) {
                displayError(error);
            }
        } else {
            searchResults.innerHTML = '<p>Please enter a search query.</p>'; // Handle empty input
        }
    });

    // Function to fetch search results from the AI API
    async function fetchSearchResults(query) {
        try {
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: JSON.stringify({
                    model: 'text-davinci-003',
                    prompt: `Search query: ${query}`,
                    max_tokens: 100,
                    n: 3,
                    stop: null,
                    temperature: 0.5
                })
            });

            const data = await response.json();
            const searchResults = data.choices.map(choice => choice.text.trim());
            return searchResults;
        } catch (error) {
            console.error('Error fetching search results:', error);
            throw error;
        }
    }

    // Function to display search results
    function displayResults(results) {
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const resultsToShow = results.slice(start, end);

        resultsToShow.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.textContent = result;
            resultElement.classList.add('result-item');
            resultElement.addEventListener('click', () => {
                // Simulate opening the search result in a new tab
                window.open(`https://www.google.com/search?q=${encodeURIComponent(result)}`, '_blank');
            });
            searchResults.appendChild(resultElement);
        });
    }

    // Function to set up pagination
    function setupPagination(totalResults) {
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('pagination-button');
            pageButton.addEventListener('click', () => {
                currentPage = i; // Update current page
                searchResults.innerHTML = ''; // Clear previous results
                displayResults(allResults); // Display results for the current page
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    // Function to display an error message
    function displayError(error) {
        console.error('Error fetching search results:', error);
        searchResults.innerHTML = '<p>Error fetching search results. Please try again later.</p>';
    }
});