$(document).ready(function () {
    // set airport name based on location.href
    let selectedAirportName = $("#airport-list option:selected").text();

    // get airport code from params
    let airportPageURL = new URL(window.location.href);
    let icaoParam = airportPageURL.searchParams.get("icao");

    // fetch airport json data
    fetch("http://localhost:4000/airports/").then(response => response.json()).then(data => {
        buildAirportOptions(data);
        setNameOfActiveAirport(data);
    });

    // build drop-down list for airports
    function buildAirportOptions(airportJSON) {
        $(airportJSON).each(function (index) {
            let airportCode = airportJSON[index]["icao"];
            let airportName = airportJSON[index]["name"];

            $("#airport-list").append(
                "<option value=" + airportCode + ">" + airportName + "</option>"
            );
        })

        // initialize airport list drop-down w/ select2
        $("#airport-list").select2({
            placeholder: "Select Airport",
            width: "resolve"
        });

        // show airport drop-down list (which is hidden by default)
        $("#airports").css({"display": "block"});
    }

    // based on the airport parameter, set the airport name and get airport data
    function setNameOfActiveAirport (airportJSON) {
        let airportPageURL = new URL(window.location.href);
        let icaoParam = airportPageURL.searchParams.get("icao");


        $(airportJSON).each(function (index) {
            if (airportJSON[index]["icao"] === icaoParam) {
                // console.log(airportJSON[index]["name"]);
                return $("#airport").text(airportJSON[index]["name"])
            }
        })
    }

    // show selected airport and set url airport value
    $("select#airport-list").change(function () {
        let selectedAirportICAO = $("#airport-list option:selected").val();
        window.location.href = window.location.origin + `?icao=${selectedAirportICAO}`;
    });

    // get airport code and pass that to another function which gets the airport survey
    (function getAirportCode () {
        if (icaoParam === null) {
            return;
        } else {
            let url = "http://localhost:4000/" + icaoParam;
            getAirportSurvey(url, icaoParam);
        }
    }(icaoParam));

    // load data for the airport in question
    function getAirportSurvey(url, airportCode) {
        fetch(url).then(response => {
            if (response.status !== 200) {
                $("#survey-responses").html("<p>There was a problem retrieving the survey for " + airportCode + ".</p> <p>Code " + response.status + ".</p>");
                $("#survey-responses").css("display", "block");
                return;
            }

            response.json().then(function(data) {
                $("#survey-responses").css("display", "block");
                $(data).each(function (index) {
                    let number = data[index]["question_number"];
                    let question = data[index]["question"];
                    let response = data[index]["response"];

                    // $("#response-list").append(
                    //     "<li>"+ number +". " + question + " response" + "</li>"
                    // )

                    $("#response-list").append(
                        "<li><h3 class='question' style='margin-bottom: 5px;'>" + number + ". " + question + "</h3><p class='response' style='margin-top: 0;'>" + response + "</p></li>"
                    )
                })
                $("#response-list").css("display", "block");

                // list.js initialization
                var listOptions = { valueNames: [ 'question', 'response' ] };
                var surveyResponses = new List("survey-responses", listOptions);
            })
        })
    }
});