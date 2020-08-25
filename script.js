var searchContainer = $("#search-container");

var searchBox = $("#search-box");
var searchBtn = $("#search-button");
var searchHistoryDisplay = $("#search-history");


var searchHistory = [];
var storedCities = JSON.parse(localStorage.getItem("cities"));

if (storedCities != null) {
    searchHistory = storedCities;
    populateSearchHistory();
}

function populateSearchHistory() {

    searchHistoryDisplay.empty();
    var searchHistoryBtnGroup = $("<div></div>");
    searchHistoryBtnGroup.addClass("btn-group-vertical");

    for (i = 0; i < searchHistory.length; i++) {

        var searchHistoryBtn = $("<button></button>");

        var city = searchHistory[i];

        searchHistoryBtn.attr("id", "search-history-button");
        searchHistoryBtn.attr("data-city", city);
        searchHistoryBtn.text(city);
        searchHistoryBtnGroup.prepend(searchHistoryBtn);

        searchHistoryBtn.on("click", function(event) {

            event.preventDefault();

            var city = $(this).data("city");

            getWeather(city);
        })
    }
    searchHistoryDisplay.append(searchHistoryBtnGroup);
}


searchBtn.on("click", function(event) {

    event.preventDefault();

    var city = searchBox.val();

    getWeather(city);

    searchHistory.push(city);

    localStorage.setItem("cities", JSON.stringify(searchHistory));

    populateSearchHistory();

    searchBox.val("");
})

function getWeather(city) {

    var apiKey = "b6dd22eec4fc1ecc48ff4ce115d14500";

    var mainUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;

    $.ajax({
        url: mainUrl,
        method: "GET",

    }).then(function(response) {

        var mainDisplay = $("#main");
        mainDisplay.empty();

        var mainDiv = $("<div></div>");
        mainDiv.addClass("card main");

        var mainTitle = $("<div></div>");
        mainTitle.addClass("card-title main");

        mainTitle.text(response.name + "(" + moment().format("l") + ")");

        var titleIcon = $("<img></img>");
        var iconSrc = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
        titleIcon.attr("src", iconSrc);
        mainTitle.append(titleIcon);

        var mainTemp = $("<div></div>");
        mainTemp.addClass("card-text main");
        mainTemp.text("Temperature: " + response.main.temp);

        var mainHumid = $("<div></div>");
        mainHumid.addClass("card-text main");
        mainHumid.text("Humidity: " + response.main.humidity);

        var mainWind = $("<div></div>");
        mainWind.addClass("card-text main");
        mainWind.text("Wind Speed: " + response.wind.speed + " MPH");

        var mainUV = $("<div></div>");
        var UVSpan = $("<span></span>");

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var UVUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

        $.ajax({
            url: UVUrl,
            method: "GET",
        }).then(function(UVResponse) {

            var UVNumber = UVResponse.value;
            mainUV.text("UV Index: ");
            UVSpan.text(UVNumber);

            if (UVNumber >= 10) {
                UVSpan.addClass("bg-danger");
            } else if (UVNumber >= 6 && UVNumber <= 9.99) {
                UVSpan.addClass("bg-warning");
            } else {
                UVSpan.addClass("bg-success");
            }

            mainUV.append(UVSpan);
        })

        mainTitle.append(mainTemp, mainHumid, mainWind, mainUV);

        mainDiv.append(mainTitle);

        mainDisplay.append(mainDiv);

    })

    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey;

    $.ajax({
        url: forecastUrl,
        method: "GET",

    }).then(function(response) {

        var forecastDisplay = $("#forecast");
        forecastDisplay.empty();

        var forecastRow = $("<div></div>");
        forecastRow.addClass("row");

        var forecastArray = response.list;
        var forecastIterator = 8;

        for (i = 0; i < forecastArray.length; i += forecastIterator) {

            var forecastCol = $("<div></div>");
            forecastCol.addClass("col-md-2");

            var forecastCard = $("<div></div>");
            forecastCard.addClass("card forecast");

            var forecastDate = $("<div></div>");
            forecastDate.addClass("card-title forecast");
            var fullForecastDate = forecastArray[i].dt_txt;
            var subForecastDate = fullForecastDate.substring(5, 10);
            forecastDate.text(subForecastDate);

            var forecastIcon = $("<img></img>");
            var iconSrc = "http://openweathermap.org/img/wn/" + forecastArray[i].weather[0].icon + "@2x.png";
            forecastIcon.attr("src", iconSrc);

            var forecastTemp = $("<div></div>");
            forecastTemp.addClass("card-text forecast");
            forecastTemp.text("Temp: " + forecastArray[i].main.temp);

            var forecastHumid = $("<div></div>");
            forecastHumid.addClass("card-text");
            forecastHumid.text("Humidity: " + forecastArray[i].main.humidity);

            forecastCard.append(forecastDate, forecastIcon, forecastTemp, forecastHumid);

            forecastCol.append(forecastCard);

            forecastRow.append(forecastCol);

            forecastDisplay.append(forecastRow);

        }

    })
}