window["country_hangman"] = window["country_hangman"] || {};
let CH = window["country_hangman"];

// initialize default settings which are build like this
// [enabled, effect on score]
CH["settings"] = {
    show_flag: [false, -5],               // show the flag at the start of a round
    show_capital: [false, -5],            // show the capital at the start of a round
    show_population: [false, -1],         // show the population at the start of a round
    show_languages: [false, -1],          // show the spoken languages at the start of a round
    reversed: [false, 10],                // show the country name in reversed
    helps_first: [false, CH["guesses"]-1] // show helps (flag, capital, population, languages) before revealing letters
}
// reveal_rate is defined as the guesses, between every reveal of a letter
CH["reveal_rate"] = 1;

// initialize global variables
CH["guesses"] = 0;
CH["country_data"] = [];
CH["country_name"] = "";
CH["score"] = 0;
CH["regions"] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
CH["new_country"] = false;
CH["changed_settings"] = false;
CH["reveal"] = 0;
CH["help_level"] = 0;

// definition of functions which refers to elements
CH.getAnswerField = () => document.getElementById("answer_field");
CH.getCountryText = () => document.getElementById("country_text");
CH.getRequiredGuesses = () => document.getElementById("required_guesses");
CH.getNextCountryBar = () => document.getElementById("next_country_bar");
CH.getFlagImg = () => document.getElementById("flag_img");
CH.getCapitalInfo = () => document.getElementById("capital_information");
CH.getPopulationInfo = () => document.getElementById("population_information");
CH.getLanguagesInfo = () => document.getElementById("languages_information");
CH.getScoreInfo = () => document.getElementById('score');
CH.getSettingsButton = () => document.getElementById('open_settings');
CH.getSettingsModal = () =>  document.getElementById('settings_modal');
CH.getCloseSettings = () => document.getElementsByClassName("close_settings")[0];

CH.getAnswerField().addEventListener('keydown', (e) => {
    // check if key "enter" is pressed
    if (e.keyCode === 13){
        CH["guesses"]++;

        // check if the answer is correct
        if (CH.getAnswerField().value.toLowerCase().trim() === CH["country_name"].toLowerCase()){

            // calculate the new score
            CH["score"] += 15;
            for (let settingsKey in CH["settings"]) {
                if (CH["settings"][settingsKey][0]){
                    CH["score"]+=CH["settings"][settingsKey][1];
                }
            }
            CH["score"]-=(CH["guesses"]-1)*2;

            // update the score_info element
            if (CH["score"] > 0){
                CH.getScoreInfo().textContent = `Score: ${CH["score"]}`;
            } else {
                CH.getScoreInfo().textContent = "";
            }

            showCountryInformation();
            return;
        }

        // clear answer_field
        CH.getAnswerField().value = "";

        // check if something should be revealed (reveal_rate)
        if (CH["guesses"]%CH["reveal_rate"] === 0){

            // check if country is already cleared by reveals
            if (CH["reveal"]/CH["reveal_rate"] === CH["country_name"].length-2) {
                CH["guesses"] = 0;
                CH["score"] -= 15;

                // update the score_info element
                if (CH["score"] > 0){
                    CH.getScoreInfo().textContent = `Score: ${CH["score"]}`;
                } else {
                    CH["score"] = 0;
                    CH.getScoreInfo().textContent = "";
                }

                showCountryInformation();
                return;
            }

            if (CH["settings"]["helps_first"][0] === true && CH["help_level"] !== 4){
                switch (CH["help_level"]){
                    case 0:     // reveal spoken languages
                        CH.getLanguagesInfo().textContent = `Spoken languages: ${CH["country_data"]['languages']}`;
                        break;
                    case 1:     // reveal population
                        CH.getPopulationInfo().textContent = `Population: ${CH["country_data"]['population']}`;
                        break;
                    case 2:     // reveal capital
                        CH.getCapitalInfo().textContent = `Capital: ${CH["country_data"]['capital']}`;
                        break;
                    case 3:     // reveal flag
                        CH.getFlagImg().src = `${CH["country_data"]['flag']}`;
                        CH.getFlagImg().alt = `${CH["country_name"]}`;
                        break;
                }
                CH["help_level"]+=1;
            } else {
                CH["reveal"]+=1;
                let text_content;

                // update country_name, reveal next letter
                // example: A__ -> Ab_
                if (CH["settings"]['reversed'][0]){
                    CH["text_content"] = CH.getCountryText().textContent.substring(0, CH["reveal"]/CH["reveal_rate"]) +
                        CH["country_name"][CH["country_name"].length-1-CH["reveal"]/CH["reveal_rate"]] +
                        CH.getCountryText().textContent.substring(CH["reveal"]/CH["reveal_rate"]+2, CH.getCountryText().length);
                } else {
                    text_content = CH.getCountryText().textContent.substring(0, CH["reveal"]/CH["reveal_rate"]) +
                        CH["country_name"][CH["reveal"]/CH["reveal_rate"]] +
                        CH.getCountryText().textContent.substring(CH["reveal"]/CH["reveal_rate"]+2, CH.getCountryText().length);
                }

                // update country_text element
                CH.getCountryText().textContent = text_content;
            }
        }
    }
})

CH.getSettingsButton().onclick = function (){
    // show settings modal
    CH.getSettingsModal().style.display = 'block';
}

CH.getCloseSettings().onclick = function (){
    // check if something got changed
    if (CH["changed_settings"]){
        getRandomCountry();
    }
    CH["changed_settings"] = false;
    // hide settings modal
    CH.getSettingsModal().style.display = 'none';
}

window.onclick = function(event) {
    // check if something got changed
    if (event.target === CH["settings_modal"]) {
        if (CH["changed_settings"]){
            getRandomCountry();
        }
        CH["changed_settings"] = false;
        // hide settings modal
        CH.getSettingsModal().style.display = "none";
    }
}

function getRandomCountry(){
    // check if country is already a new generated country
    if (CH["new_country"]){
        return;
    }

    // reset country information
    CH.getAnswerField().disabled = false;
    CH.getAnswerField().value = "";
    CH.getCapitalInfo().textContent = "";
    CH.getPopulationInfo().textContent = "";
    CH.getLanguagesInfo().textContent = "";
    CH.getFlagImg().src = "";
    CH.getFlagImg().alt = "";
    CH.getNextCountryBar().hidden = true;

    // send request to https://restcountries.com/v3.1/region/...
    fetch(`https://restcountries.com/v3.1/region/${CH["regions"][Math.floor(CH["regions"].length * Math.random())]}`)
        .then((response) => response.json())
        .then((data) => {
            let country_obj = data[`${Math.floor(data.length*Math.random())}`]
            CH["new_country"] = false;
            CH["country_name"] = country_obj['translations']['deu']['common'];
            let languages = "";
            for (let language in country_obj['languages']){
                languages += country_obj['languages'][language] + ", ";
            }
            languages = languages.substring(0, languages.length-2);
            let population = country_obj['population'];

            // make population readable (1.5k, 2.5M)
            if (population/1000 > 1) {
                population = population/1000;
                if (population/1000 > 1){
                    population = `${(population/1000).toFixed(1)} M`;
                } else {
                    population = `${population.toFixed(1)} k`;
                }
            }
            // set country_data
            CH["country_data"] = {
                region: country_obj['region'],
                capital: country_obj['capital']['0'],
                flag: country_obj['flags']['png'],
                population: population,
                languages: languages
            }

            CH.getAnswerField().focus();
            let text_content = CH["country_name"][0];

            // reverse country_name if reversed is enabled
            if (CH["settings"]['reversed'][0]){
                text_content = CH["country_name"][CH["country_name"].length-1];
            }

            // convert country_name to hangman styled text
            // example: Österreich -> Ö_________
            for (let i = 1; i < CH["country_name"].length; i++){
                if (CH["country_name"][i] !== " "){
                    if (CH["country_name"][i] === "." || CH["country_name"][i] === "-"){
                        text_content += " . ";
                    } else {
                        text_content += " _";
                    }
                } else {
                    text_content += " ⠀ ";
                }
            }
            // update country_text element
            CH.getCountryText().textContent = text_content;

            // show flag if enabled
            if (CH["settings"]['show_flag'][0]){
                CH.getFlagImg().src = `${CH["country_data"]['flag']}`;
                CH.getFlagImg().alt = `${CH["country_name"]}`;
            }

            // show capital if enabled
            if (CH["settings"]['show_capital'][0]){
                CH.getCapitalInfo().textContent = `Capital: ${CH["country_data"]['capital']}`;
            }

            // show population if enabled
            if (CH["settings"]['show_population'][0]){
                CH.getPopulationInfo().textContent = `Population: ${CH["country_data"]['population']}`;
            }

            // show spoken languages if enabled
            if (CH["settings"]['show_languages'][0]){
                CH.getLanguagesInfo().textContent = `Spoken languages: ${CH["country_data"]['languages']}`;
            }

        })
    // hide required guesses element
    CH.getRequiredGuesses().hidden = true;

    // reset guesses, help_level, revealed letter counter
    CH["guesses"] = CH["help_level"] = CH["reveal"] = 0;

    // return the generated country_name
    return CH["country_name"];
}

function showCountryInformation(){
    CH.getAnswerField().disabled = true;
    CH.getAnswerField().blur();
    CH.getAnswerField().value = "";
    CH.getCountryText().textContent = CH["country_name"];
    CH.getCapitalInfo().textContent = `Capital: ${CH["country_data"]['capital']}`;
    CH.getPopulationInfo().textContent = `Population: ${CH["country_data"]['population']}`;

    CH.getLanguagesInfo().textContent = `Spoken languages: ${CH["country_data"]['languages']}`;

    CH.getFlagImg().src = `${CH["country_data"]['flag']}`;
    CH.getFlagImg().alt = `${CH["country_name"]}`;
    if (CH["guesses"] !== 0){
        if (CH["guesses"] === 1){
            CH.getRequiredGuesses().textContent = `${CH["guesses"]} attempt needed`;
        } else {
            CH.getRequiredGuesses().textContent = `${CH["guesses"]} attempts needed`;
        }
        CH.getRequiredGuesses().hidden = false;
    }
    CH["new_country"] = true;
    CH.getNextCountryBar().hidden = true;
    setTimeout(function () {
        CH["new_country"] = false;
        getRandomCountry();
    }, 5000);
}

document.querySelector('#settings_checkboxes').onclick = function(element) {
    // check which settings are checked in the settings_checkboxes
    // and update those in the CH["settings"]

    if (element.target.value.startsWith("show_")){
        CH["settings"][element.target.value][0] = element.target.checked;
        CH["changed_settings"] = true;
    } else if(element.target.value === "reversed") {
        CH["settings"]["reversed"][0] = element.target.checked;
        CH["changed_settings"] = true;
    } else if (element.target.value === "helps_first"){
        CH["settings"]["helps_first"][0] = element.target.checked;
        CH["changed_settings"] = true;
    }
    else {
        if (element.target.checked === false) {
            if (CH["regions"].length === 1){
                element.target.checked = true;
            } else {
                let new_regions = []
                for (let i = 0; i < CH["regions"].length; i++){
                    if (CH["regions"][i] !== element.target.value){
                        new_regions.push(CH["regions"][i]);
                    }
                }
                CH["regions"] = new_regions;
                CH["changed_settings"] = true;
            }
        } else {
            if (!CH["regions"].includes(element.target.value) && element.target.value !== undefined){
                CH["regions"].push(element.target.value);
                CH["changed_settings"] = true;
            }
        }
    }
}

function loadBody(){
    let new_regions = [];

    // add enabled regions to new_regions
    for (let i in CH["regions"]){
        if (document.getElementById(CH["regions"][i].toLowerCase()).checked){
            new_regions.push(CH["regions"][i]);
        }
    }

    // set active regions to the enabled regions (new_regions)
    CH["regions"] = new_regions;

    // check which settings are enabled and update the CH["settings"]
    let show_settings = ["flag", "capital", "population", "languages"];
    for (let i in show_settings){
        CH["settings"][`show_${show_settings[i]}`][0] = document.getElementById(`show_${show_settings[i]}`).checked;
    }
    CH["settings"]['reversed'][0] = document.getElementById("reversed").checked;
    CH["settings"]['helps_first'][0] = document.getElementById('helps_first').checked;
    getRandomCountry();
}

