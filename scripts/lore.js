document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.dropdown-title').addEventListener('click', function () {
        const dropdownOptions = document.querySelector('.dropdown-options');
        dropdownOptions.style.display = dropdownOptions.style.display === 'block' ? 'none' : 'block';
    });

    document.querySelectorAll('.dropdown-options li').forEach(function (option) {
        option.addEventListener('click', function () {
            const title = document.querySelector('.dropdown-title');
            title.textContent = this.textContent;  // Update the dropdown title with the selected option
            title.dataset.value = this.dataset.value;  // Store the selected value in a dataset

            // Hide the options after selecting
            document.querySelector('.dropdown-options').style.display = 'none';

            // Call the appropriate function based on the selected value
            handleDropdownSelection(this.dataset.value);
        });
    });

    // Function to handle the dropdown selection and call the correct function
    function handleDropdownSelection(selectedCategory) {
        const cardContainer = document.querySelector('.card-container');
        cardContainer.innerHTML = ''; // Clear previous cards

        switch (selectedCategory) {
            case 'divinities':
                fillCardsContentsDivinities();  // Call the function to fill with divinities information
                break;
            case 'factions':
                fillCardsContentsFactions();  // Call the function to fill with factions information
                break;
            case 'legends':
                fillCardsContentsLegends();  // Call the function to fill with legends information
                break;
            default:
                console.error('Unknown category selected');
                break;
        }
    }
})

const DIVINITIES_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcfDbkIlX1JDGwoVEZwWewkDPW_B2sOC49u98xt7oAqOTWsjVTi-krJ7sLdCch-VfAVkbXswxtdS4Y/pub?gid=652307919&single=true&output=csv'

async function fetchData(SHEET) {
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


async function fillCardsContentsDivinities() {
    const csvData = await fetchData(SHEET = DIVINITIES_SHEET); // Fetch the CSV data
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

        const cardSkills = document.createElement('p');
        cardSkills.classList.add('card-aptitudes');
        cardSkills.textContent = `Fidèles : ${character['fideles']}`;

        card.appendChild(cardTitle);
        card.appendChild(cardImg);
        card.appendChild(cardDescription);
        card.appendChild(cardSkills);

        cardContainer.appendChild(card);
    });
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fillCardsContentsDivinities();
});