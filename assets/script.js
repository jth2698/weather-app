var searchBox = $("#search-box");
var searchBtn = $("#search-button");

// create an empty array to hold localStorage cities and load any localStorage cities into array
var searchHistory = [];
var storedCities = JSON.parse(localStorage.getItem("cities"));

if (storedCities != null) {
    searchHistory = storedCities;
    populateSearchHistory();
}

// create function to populate search history from searchHistory array
function populateSearchHistory() {

    var searchHistoryDisplay = $("#search-history");

    // need to empty div as part of each function run to avoid duplication
    searchHistoryDisplay.empty();

    var searchHistoryBtnGroup = $("<div></div>");
    searchHistoryBtnGroup.addClass("container btn-group");

    for (i = 0; i < searchHistory.length; i++) {

        // creating serach history as buttons to make them more easily clickable
        var searchHistoryBtn = $("<button></button>");

        var city = searchHistory[i];

        searchHistoryBtn.addClass("btn btn-lg-dark text-white");

        searchHistoryBtn.attr("id", "search-history-button");

        // add data-element to pass in city value to getWeather function when used below
        searchHistoryBtn.attr("data-city", city);

        searchHistoryBtn.text(city);

        searchHistoryBtnGroup.prepend(searchHistoryBtn);

        // on each button click, we call the getWeather function to populate weather for the city
        searchHistoryBtn.on("click", function (event) {

            event.preventDefault();

            var city = $(this).data("city");

            getWeather(city);
        })
    }
    searchHistoryDisplay.append(searchHistoryBtnGroup);
}


searchBtn.on("click", function (event) {

    event.preventDefault();

    if (searchBox.val() != "") {

        var city = searchBox.val();

        getWeather(city);

        // with each search, need to push the searched city into localStorage so that it can be populated as part of searcHistory
        searchHistory.push(city);

        localStorage.setItem("cities", JSON.stringify(searchHistory));

        populateSearchHistory();

        searchBox.val("");
    }
})

// main logic for the app pulling data from openweathermap.org
function getWeather(city) {

    var apiKey = "b6dd22eec4fc1ecc48ff4ce115d14500";

    var mainUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;

    // .ajax call to openweather map current weather for input city to build current weather; forecast will be seperate call
    $.ajax({
        url: mainUrl,
        method: "GET",

    }).then(function (response) {

        // just an extra feature I added to update the background video to approximate current conditions for searched city
        var backgroundVid = $("#background-video");

        backgroundVid.attr("src", "./assets/productionID_3843103.mp4")

        if (response.weather[0].description == "clear sky") {
            backgroundVid.attr("src", "./assets/production-id-4433844_EQoz6k7I.compressed.mp4")
        } else if (response.weather[0].description == ("few clouds" || "scattered clouds" || "broken clouds")) {
            backgroundVid.attr("src", "./assets/pexelsvideos2573_4Y7QJtEq.compressed.mp4")
        } else if (response.weather[0].description == ("shower rain" || "rain")) {
            backgroundVid.attr("src", "./assets/rainyweatheratthefield_fVrYU7gk.compressed.mp4")
        } else if (response.weather[0].description == ("very heavy rain" || "thunderstorm")) {
            backgroundVid.attr("src", "./assets/pexelsvideos4002_fruqQ8MI.compressed.mp4")
        } else {
            backgroundVid.attr("src", "./assets/productionid-3843103_O9SmvKaA.compressed.mp4")
        }

        // create two divs, one to hold city name, date, and icon and one to hold weather information
        var mainDisplay = $("#main");
        mainDisplay.empty();

        var cityDiv = $("<div></div>");

        var mainTitle = $("<p></p>");
        mainTitle.addClass("text-lowercase font-weight-bold");
        mainTitle.text(response.name);

        var mainDate = $("<p></p>");
        mainDate.addClass("text-lowercase font-weight-bold");
        mainDate.text(moment().format('ll'));

        cityDiv.append(mainTitle, mainDate);

        var titleIcon = $("<img></img>");
        var iconSrc = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        titleIcon.attr("src", iconSrc);

        cityDiv.append(mainTitle, mainDate, titleIcon);

        infoDiv = $("<div></div>");

        var mainTemp = $("<p></p>");
        mainTemp.addClass("text-lowercase");
        var fullMainTemp = response.main.temp.toString();

        // added logic to only display whole number for temp; this accounts for 100+ degree temps (3 digit whole numbers)
        if (fullMainTemp.substring(0, 3) == ".") {
            var subMainTemp = fullMainTemp.substring(0, 2);
        } else {
            var subMainTemp = fullMainTemp.substring(0, 3);
        }

        mainTemp.text("temperature: " + subMainTemp + " F");

        var mainHumid = $("<p></p>");
        mainHumid.addClass("text-lowercase");
        mainHumid.text("humidity: " + response.main.humidity + "%");

        var mainWind = $("<p><p>");
        mainWind.addClass("text-lowercase");
        mainWind.text("wind speed: " + response.wind.speed + " MPH");

        var mainUV = $("<p></p>");
        mainUV.addClass("text-lowercase");
        var UVSpan = $("<span></span>");

        // for the UV, needed a seperate .ajax call
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var UVUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

        $.ajax({
            url: UVUrl,
            method: "GET",
        }).then(function (UVResponse) {

            var UVNumber = UVResponse.value;
            mainUV.text("uv index: ");
            UVSpan.text(UVNumber);

            // color codes the UV <span> based on low, moderate, high
            if (UVNumber >= 10) {
                UVSpan.addClass("bg-danger");
            } else if (UVNumber >= 6 && UVNumber <= 9.99) {
                UVSpan.addClass("bg-warning");
            } else {
                UVSpan.addClass("bg-success");
            }

            mainUV.append(UVSpan);
        })

        infoDiv.append(mainTemp, mainHumid, mainWind, mainUV);

        mainDisplay.append(cityDiv, infoDiv);

    })

    // independent .ajax call for the forecast
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey;

    $.ajax({
        url: forecastUrl,
        method: "GET",

    }).then(function (response) {

        var forecastDisplay = $("#forecast");
        forecastDisplay.empty();

        var forecastArray = response.list;
        var forecastIterator = 8;

        // build forecast with a loop iterating by 8 to account for 3 hour increments (8 * 3 = 24 hours)
        for (i = 0; i < forecastArray.length; i += forecastIterator) {

            var forecastDiv = $("<div></div>");

            var forecastDate = $("<p></p>");
            forecastDate.addClass("text-lowercase font-weight-bold");
            var fullForecastDate = forecastArray[i].dt_txt;

            // slice date returned in lieu of tyring to tie results to moment.js
            var subForecastDate = fullForecastDate.substring(5, 10);
            forecastDate.text(subForecastDate);

            var forecastIcon = $("<img></img>");
            var iconSrc = "https://openweathermap.org/img/wn/" + forecastArray[i].weather[0].icon + "@2x.png";
            forecastIcon.attr("src", iconSrc);

            var forecastTemp = $("<p></p>");
            forecastTemp.addClass("text-lowercase");
            var fullForecastTemp = forecastArray[i].main.temp.toString();

            // same logic as above to only display whole number for temp; this accounts for 100+ degree temps (3 digit whole numbers)
            if (fullForecastTemp.substring(0, 3) == ".") {
                var subForecastTemp = fullForecastTemp.substring(0, 2);
            } else {
                var subForecastTemp = fullForecastTemp.substring(0, 3);
            }

            var subForecastTemp = fullForecastTemp.substring(0, 2);
            forecastTemp.text("temp: " + subForecastTemp + " F");

            var forecastHumid = $("<p></p>");
            forecastHumid.addClass("text-lowercase");
            forecastHumid.text("humid: " + forecastArray[i].main.humidity + "%");

            forecastDiv.append(forecastDate, forecastIcon, forecastTemp, forecastHumid);

            forecastDisplay.append(forecastDiv);

        }

    })
}