document.getElementById('location-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const location = document.getElementById('location-input').value;
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results');
    const downloadBtn = document.getElementById('download-btn');

    loader.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch(`/search?location=${encodeURIComponent(location)}`);
        const restaurants = await response.json();

        loader.classList.add('hidden');
        resultsContainer.innerHTML = restaurants.map((restaurant, index) => `
      <div class="result-item" onclick="alert('Details for ${restaurant.name}')">
        <strong>${restaurant.name}</strong><br>
        <small>Address: ${restaurant.address}</small><br>
        <small>Phone: ${restaurant.phoneNumber}</small>
      </div>
    `).join('');

        downloadBtn.classList.remove('hidden');
        downloadBtn.onclick = () => {
            window.location.href = `/download?data=${encodeURIComponent(JSON.stringify(restaurants))}&query=${encodeURIComponent(location)}`;
        };
    } catch (error) {
        loader.classList.add('hidden');
        resultsContainer.innerHTML = '<p>Error fetching data. Please try again.</p>';
    }
});
