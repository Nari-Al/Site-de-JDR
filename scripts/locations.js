document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([0, 0], 2); // Set the map center and zoom

    // Create LayerGroups for toggling
    let routesLayer = L.layerGroup();
    let riversLayer = L.layerGroup();

    // Define the biome color map using IDs
    const biomeColors = {
        1: '#fbe79f', // Hot desert
        2: '#b5b887', // Cold desert
        3: '#d2d082', // Savanna
        4: '#c8d68f', // Grassland
        5: '#b6d95d', // Tropical seasonal forest
        6: '#29bc56', // Temperate deciduous forest
        7: '#7dcb35', // Tropical rainforest
        8: '#409c43', // Temperate rainforest
        9: '#4b6b32', // Taiga
        10: '#96784b', // Tundra
        11: '#d5e7eb', // Glacier
        12: '#0b9131', // Wetland
        // Add more as needed
    };

    // Function to dynamically style cells based on the biome ID or type (ocean)
    function styleByBiome(feature) {
        const biomeId = feature.properties.biome; // Assuming 'biome' is an ID property in your GeoJSON
        const cellType = feature.properties.type; // Assuming 'type' property contains the cell type (e.g., "ocean")

        // If the cell is an ocean, apply blue color
        if (cellType === 'ocean') {
            return {
                fillColor: '#3372de', // Blue color for ocean
                weight: 0.2,
                opacity: 0.7,
                color: '#7fb3c0', // Border color for the cells
                fillOpacity: 0.5 // Adjust opacity for ocean cells
            };
        }

        // Otherwise, apply the color based on biome ID
        const color = biomeColors[biomeId] || '#FFFFFF'; // Default to white if biome ID is not found
        return {
            fillColor: color,
            weight: 0.2,
            opacity: 0.4,
            color: 'grey', // Border color for the cells
            fillOpacity: 0.7 // Adjust opacity for land cells
        };
    }

    // Loading Cells (assuming your GeoJSON contains biome information)
    fetch('map/Preroy Cells 2024-10-17-19-44.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJSON(geojsonData, {
                style: styleByBiome // Apply the style function to each feature
            }).addTo(map);
        });

    // Loading Routes
    fetch('map/Preroy Routes 2024-10-17-19-44.geojson') // Replace with the path to your GeoJSON
        .then(response => response.json())
        .then(geojsonData => {
            const routes = L.geoJSON(geojsonData, {
                style: {
                    color: '#7d6850', // Customize this to fit the routes' appearance
                    weight: 1
                }
            });
            routesLayer.addLayer(routes); // Add the routes to the routes layer group
        });

    // Loading Rivers
    fetch('map/Preroy Rivers 2024-10-17-19-44.geojson') // Replace with the path to your GeoJSON
        .then(response => response.json())
        .then(geojsonData => {
            const rivers = L.geoJSON(geojsonData, {
                style: {
                    color: '#7aa5de', // Customize this to fit the rivers' appearance
                    weight: 2
                }
            });
            riversLayer.addLayer(rivers); // Add the rivers to the rivers layer group
        });


    // Loading Markers
    fetch('map/Preroy Markers 2024-10-17-19-44.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJSON(geojsonData, {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(`<b>${feature.properties.name}</b>`);
                    }
                }
            }).addTo(map); // Directly added to the map
        });

    // Create buttons or checkboxes to toggle layers
    const toggleRoutesButton = document.getElementById('toggleRoutes');
    const toggleRiversButton = document.getElementById('toggleRivers');

    // Event listeners for toggling routes
    toggleRoutesButton.addEventListener('click', function () {
        if (map.hasLayer(routesLayer)) {
            toggleRoutesButton.innerText = "Montrer les routes"
            map.removeLayer(routesLayer);
        } else {
            toggleRoutesButton.innerText = "Cacher les routes"
            map.addLayer(routesLayer);
        }
    });

    // Event listeners for toggling rivers
    toggleRiversButton.addEventListener('click', function () {
        if (map.hasLayer(riversLayer)) {
            toggleRiversButton.innerText = "Montrer les rivières"
            map.removeLayer(riversLayer);
        } else {
            toggleRiversButton.innerText = "Cacher les rivières"
            map.addLayer(riversLayer);
        }
    });
});


const SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcfDbkIlX1JDGwoVEZwWewkDPW_B2sOC49u98xt7oAqOTWsjVTi-krJ7sLdCch-VfAVkbXswxtdS4Y/pub?gid=1226234662&single=true&output=csv'

async function fetchData() {
    const response = await fetch(SHEET);
    const data = await response.text();
    console.log(data)
    return data;

}

function csvToJSON(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    const headers = []; // Array to store headers from the first column
    const result = [];

    // Use a regular expression to correctly split CSV lines that may contain commas inside quotes
    const parseCSVLine = (line) => {
        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes; // Toggle the inQuotes flag when encountering a double quote
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim()); // Push the last value
        return values;
    };

    // Loop through each row in the CSV
    for (let i = 0; i < lines.length; i++) {
        const currentline = parseCSVLine(lines[i]);

        // The first value in the row is the header (e.g., Nom, Description)
        const header = currentline[0];

        // Add the header to the headers array
        headers.push(header);

        // For each subsequent value in the row, create or update the corresponding character object
        for (let j = 1; j < currentline.length; j++) {
            if (!result[j - 1]) {
                result[j - 1] = {}; // Initialize a new object for each character if it doesn't exist
            }
            result[j - 1][header] = currentline[j]; // Add the current value to the object using the header as key
        }
    }

    return result;
}


async function createCards() {
    const csvData = await fetchData(); // Fetch the CSV data
    const characters = csvToJSON(csvData); // Convert CSV to JSON objects

    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''; // Clear the container

    characters.forEach(character => {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardTitle = document.createElement('p');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = `${character['nom']}`;

        const cardImg = document.createElement('div');
        cardImg.classList.add('card-img');
        const img = document.createElement('img');
        img.src = `${character['imgUrl']}`;
        img.alt = `Image de ${character['nom']}`;
        cardImg.appendChild(img);

        const cardDescription = document.createElement('p');
        cardDescription.classList.add('card-description');
        cardDescription.textContent = `${character['description']}`;

        card.appendChild(cardTitle);
        card.appendChild(cardImg);
        card.appendChild(cardDescription);

        cardContainer.appendChild(card);
    });
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    createCards();
});