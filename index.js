//var declarations
const mainTemp = document.getElementById('main-temp-value');
const highTemp = document.getElementById('high-temp-value');
const lowTemp = document.getElementById('low-temp-value');
const feelsLikeTemp = document.getElementById('feels-like-temp-value');
const description = document.getElementById('description-value');
const humidity = document.getElementById('humidity-value');
const windSpeed = document.getElementById('wind-speed-value');
const sunrise = document.getElementById('sunrise-value');
const sunset = document.getElementById('sunset-value');
const visibility = document.getElementById('visibility-value');
const airQuality = document.getElementById('air-quality-value');
const cityMap = document.getElementById('city-map-value');
const searchCityForm = document.getElementById("search-city-form");
const airQualityDiv = document.getElementById('air-quality-div');

const API_KEY = "5d8b7e624b2bb15101986e291c17564b";
// form auto submission

// document.addEventListener('DOMContentLoaded', function() {
//     if (!localStorage.getItem('formSubmitted')) {
//         searchCityForm.submit();
//         localStorage.setItem('formSubmitted', 'true');
//       }
//   });




//set date and time
let currentDate = new Date();

// Get the current date and time
let dateString = currentDate.toDateString();

let dateSplit = dateString.split(' ');
let currDate = "" + dateSplit[1] + " " + dateSplit[2];
const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true 
};


let timeString = currentDate.toLocaleTimeString('en-US', timeOptions);

let datetimeHeading = document.getElementById("datetime-heading");
datetimeHeading.textContent = "" + currDate + ", " + timeString; 




searchCityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    changeNameHeadings();

    //from the city name first fetch the lat and long for the main data call
    let lat = 0;
    let lon= 0;
    fetchLatLong().then((result) => {
        lat = result[0]['lat'];
        lon = result[0]['lon'];
        console.log(result);
        //fetch the weather data
        fetchWeatherData(lat, lon).then((result) => {
            console.log(result);
            updateWeatherData(result);
        })
        updateAirPollutionData(lat, lon);
        updateWeatherMap(lat, lon);
    });
    

    
    
    
})

function changeNameHeadings(){
    //change city heading
    let cityName = document.getElementById('cityname-input').value;
    let cityHeading = document.getElementById('cityname-heading');
    cityHeading.textContent = cityName;    
}


  async function fetchLatLong() {
    let cityName = document.getElementById('cityname-input').value;
    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data", data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; 
    }
}

async function fetchWeatherData(lat, lon){
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data", data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; 
    }
}

function updateWeatherData(result){
    console.log(result)
    console.log(result['main']['temp'] - 273)
    console.log(Math.round(result['main']['temp'] - 273))
    mainTemp.textContent = "" + Math.round(result['main']['temp'] - 273) + "°";
    highTemp.textContent = "H: " + Math.round(result['main']['temp_max'] - 273) + "°";
    lowTemp.textContent = "L: " + Math.round(result['main']['temp_min'] - 273) + "°";
    feelsLikeTemp.textContent = "" + Math.round(result['main']['feels_like'] - 273) + "°";
    description.textContent = result['weather'][0]['main'];
    humidity.textContent = "" + result['main']['humidity'] + "%";
    windSpeed.textContent = "" + result['wind']['speed'] + " m/sec";
    setSunriseSunset(result['sys']['sunrise'], result['sys']['sunset'], result['timezone']);
    visibility.textContent = "" + parseInt(result['visibility'] / 1000) + " km";
    
}

function setSunriseSunset(sunriseTimeUTC, sunsetTimeUTC, timezone){
    const sunriseInTimeZone = sunriseTimeUTC + timezone;
    const sunsetInTimeZone = sunsetTimeUTC + timezone;

    const sunriseDate = new Date(sunriseInTimeZone * 1000);
    const sunsetDate = new Date(sunsetInTimeZone * 1000);
    
    // Get the hours and minutes in UTC
    const sunriseHours = sunriseDate.getUTCHours().toString().padStart(2, '0');
    const sunsetHours = sunsetDate.getUTCHours().toString().padStart(2, '0');

    const sunriseMinutes = sunriseDate.getUTCMinutes().toString().padStart(2, '0');
    const sunsetMinutes = sunsetDate.getUTCMinutes().toString().padStart(2, '0');

    sunrise.textContent = "" + sunriseHours + ":" + sunriseMinutes;
    sunset.textContent = "" + sunsetHours + ":" + sunsetMinutes;
}

async function updateAirPollutionData(lat, lon){
    let currentDateInMilliseconds = new Date().getTime();
    let currentDateInSeconds = Math.floor(currentDateInMilliseconds / 1000);
    let endDateInSeconds = currentDateInSeconds + 1000;
    try{
        const response = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("AQI", data['list'][0]['main']['aqi']);  
        let aqi = data['list'][0]['main']['aqi'];
        let aq = "";
        let aqBackground = "text-bg-light";
        switch (aqi) {
            case 1:
              aq = "Good";
              break;
            case 2:
              aq = "Fair";
              break;
            case 3:
                aq = "Moderate";
                break;
            case 4:
                aq = "Poor";
                aqBackground = "text-bg-danger"
                break;
            case 5:
                aq = "Very Poor";
                aqBackground = "text-bg-danger"
                break;
        }

        airQuality.textContent = aq;
        if(airQualityDiv.classList.contains('text-bg-light')){
            airQualityDiv.classList.remove('text-bg-light')
        }
        else if(airQualityDiv.classList.contains('text-bg-danger')){
            airQualityDiv.classList.remove('text-bg-danger')
        }
        airQualityDiv.classList.add(aqBackground);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; 
    }
}

function updateWeatherMap(lat, lon){
    let mapType = "AerialWithLabels";
    let zoom = 2;
    let width = 250;
    let height = 250;
    let mapSize = "250,250"
    let pushpin = "" + lat + "," + lon;
    let bing_key = "AlbKwGzAnycYXefuq0d33ol7RVS_i7CFmCsLlpo9_g1lxKKvlEl2iIz1mxyX8Qna";
    const apiUrl = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/${lat},${lon}/12?mapSize=250,250&pp=${lat},${lon};66&mapLayer=Basemap,Buildings&key=${bing_key}`;
    cityMap.src = apiUrl;
}





