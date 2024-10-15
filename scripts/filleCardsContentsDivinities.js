const SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcfDbkIlX1JDGwoVEZwWewkDPW_B2sOC49u98xt7oAqOTWsjVTi-krJ7sLdCch-VfAVkbXswxtdS4Y/pub?gid=652307919&single=true&output=csv'

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

        const cardSkills = document.createElement('p');
        cardSkills.classList.add('card-aptitudes');
        cardSkills.textContent = `Traits : ${character['bonus']}`;

        card.appendChild(cardTitle);
        card.appendChild(cardImg);
        card.appendChild(cardDescription);
        card.appendChild(cardSkills);

        cardContainer.appendChild(card);
    });
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    createCards();
});