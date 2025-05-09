const apiKey = '';
let lat ="";
let long ="";


  const input = document.getElementById("city");
  let Submit = document.getElementById("result");
  let getGeo = document.getElementById("getLocation");

  const temperature = document.querySelector("#temp");
  const detail = document.querySelector("#discription");
  const sky = document.querySelector("#sky");
  const locationText = document.querySelector("#location");

  const feelsLike = document.querySelector("#feels_like");
  const hum = document.querySelector("#humidity");

  const back = document.querySelector("#back");

  const inputLayout = document.querySelector(".content");

function getWeather(){

    let city = input.value;

fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
  .then(response => response.json())
  .then(data => {

    document.querySelector(".main").style.display = "none";
    document.querySelector(".weather").style.display = "block";

    const {description, id} = data.weather[0];
    const {temp, feels_like, humidity} = data.main;


    const city = data.name ;
    const country = data.sys.country;
    
          
          hum.textContent = ` ${humidity}%`;
          feelsLike.textContent = `${Math.round(feels_like-273.15)}°C`;

          detail.innerText = description;


          if(id == 800){
            sky.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
          sky.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
          sky.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
          sky.src = "icons/haze.svg";
        }else if(id >= 801 && id <= 804){
          sky.src = "icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
          sky.src = "icons/rain.svg";
        }
          temperature.textContent = `${Math.round(temp-273.15)}°C `;

          locationText.innerHTML = `${city}, ${country}`;

    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });
};

function getWeatherCor(){
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`)
  .then(response => response.json())
  .then(data => {

    document.querySelector(".main").style.display = "none";
    document.querySelector(".weather").style.display = "block";

    const {description, id} = data.weather[0];
    const {temp, feels_like, humidity} = data.main;


    const city = data.name ;
    const country = data.sys.country;
    
          
          hum.textContent = ` ${humidity}%`;
          feelsLike.textContent = `${Math.round(feels_like-273.15)}°C`;

          detail.innerText = description;


          if(id == 800){
            sky.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
          sky.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
          sky.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
          sky.src = "icons/haze.svg";
        }else if(id >= 801 && id <= 804){
          sky.src = "icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
          sky.src = "icons/rain.svg";
        }
          temperature.textContent = `${Math.round(temp-273.15)}°C `;

          locationText.innerHTML = `${city}, ${country}`;

    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });
}


function showInput(){
  document.querySelector(".main").style.display = "block";
  document.querySelector(".weather").style.display = "none";
  input.value = "";
  input.focus();
}

Submit.onclick = getWeather;
getGeo.onclick = function(){
  navigator.geolocation.getCurrentPosition(
    (position) => {
      lat = position.coords.latitude; 
      long = position.coords.longitude; 
      console.log(`Latitude: ${lat}, Longitude: ${long}`);
      getWeatherCor();
    },
    (error) => {
      console.error("Error getting location:", error);
      alert("Unable to retrieve your location. Please allow location access.");
    }
  );
}

back.onclick = showInput;