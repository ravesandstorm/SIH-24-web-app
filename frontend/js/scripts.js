console.log('Website loaded successfully.');

// Initialize slider variables
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const slideInterval = 3000; // Change slide every 3 seconds

// Function to change slides
function changeSlide(n) {
    showSlides(slideIndex += n);
}

// Function to show slides based on the current index
function showSlides(n) {
    if (n >= slides.length) slideIndex = 0; // Wrap around to the first slide
    if (n < 0) slideIndex = slides.length - 1; // Wrap around to the last slide

    slides.forEach((slide) => {
        slide.style.transform = `translateX(-${slideIndex * 100}%)`; // Move slide to the left
    });
}

// Initialize the slider
showSlides(slideIndex);

// Automatic slide change
setInterval(() => {
    changeSlide(1); // Change to the next slide
}, slideInterval);

// Set default values on page load
function setDefaultDate() {
    document.getElementById('inputDay').value = "07"; // Default day
    document.getElementById('inputMonth').value = "07"; // Default month (July)
}

// Fetch the API result and display it
async function fetchInitialPrediction() {
    try {
        const response = await fetch('http://127.0.0.1:8000/getval/', {
            method: 'POST',
        });
        const result = await response.json();
        const valueContain = document.getElementById('newValues');
        
        if (result.error) {
            valueContain.innerHTML = `<p>${result.error}</p>`;
        } else {
            valueContain.innerHTML = `
                <p><strong>Current Time Power Usage Prediction: ${result.value.toFixed(2)} MW</strong></p>
            `;
        }
    } catch (error) {
        console.error('Error fetching prediction:', error);
        document.getElementById('newValues').innerHTML = `<p>Error fetching prediction: ${error.message}</p>`;
    }
}

// Set default date and fetch initial prediction on page load
window.onload = function() {
    setDefaultDate();
    fetchInitialPrediction(); // Fetch and display API result
};

// Handle form submission
document.getElementById('predictForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Form submitted.');

    // Get the form data
    const day = document.getElementById('inputDay').value.padStart(2, '0'); // Ensure two-digit format
    const month = document.getElementById('inputMonth').value.padStart(2, '0'); // Ensure two-digit format
    const date = `1900-${month}-${day}`; // Combine with default year 1900
    const time = document.getElementById('inputTime').value;

    // Prepare data for request
    const requestData = { Date: date, Time: time };

    try {
        // Send the form data to the FastAPI endpoint
        const response = await fetch('http://127.0.0.1:8000/predict/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        console.log('Response status:', response.status);

        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Get the JSON response
        const result = await response.json();
        console.log('API result:', result);

        // Display the prediction result
        const resultContainer = document.getElementById('predictionResults');
        if (result.error) {
            resultContainer.innerHTML = `<p>${result.error}</p>`;
        } else {
            resultContainer.innerHTML = `
                <h3>Past Load Data:</h3>
                <p><strong>Date and Time:</strong> ${month}-${day} ${time}</p>
                <p><strong>Load:</strong> ${result.prediction.toFixed(2)} MW</p>
            `;
        }

        // Update the current time power usage prediction
        const valueContain = document.getElementById('newValues');
        if (result.error) {
            valueContain.innerHTML = `<p>${result.error}</p>`;
        } else {
            valueContain.innerHTML = `
                <p><strong>Current Time Power Usage Prediction: ${result.value.toFixed(2)} MW</strong></p>
            `;
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('predictionResults').innerHTML = `<p>Error occurred while fetching prediction: ${error.message}</p>`;
    }
});