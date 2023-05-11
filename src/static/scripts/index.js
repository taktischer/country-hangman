window["country_hangman"] = window["country_hangman"] || {};
let CH = window["country_hangman"];

CH["guesses"] = 0;
CH["country_data"] = [];
CH["country_name"] = "";
CH["reveal_rate"] = 1;
CH["score"] = 0;
CH["regions"] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
CH["settings"] = {
    show_flag: [false, -5],
    show_capital: [false, -5],
    show_population: [false, -1],
    show_languages: [false, -1],
    reversed: [false, 10],
    helps_first: [false, CH["guesses"]-1]
}

CH["new_country"] = false;
CH["changed_settings"] = false;
CH["reveal"] = 0;
CH["help_level"] = 0;

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
    if (e.keyCode === 13){
        CH["guesses"]++;
        if (CH.getAnswerField().value.toLowerCase().trim() === CH["country_name"].toLowerCase()){
            CH["score"] += 15;
            for (let settingsKey in CH["settings"]) {
                if (CH["settings"][settingsKey][0]){
                    CH["score"]+=CH["settings"][settingsKey][1];
                }
            }

            CH["score"]-=(CH["guesses"]-1)*2;
            if (CH["score"] > 0){
                CH.getScoreInfo().textContent = `Score: ${CH["score"]}`;
            } else {
                CH.getScoreInfo().textContent = "";
            }
            guessedCountry();
            return;
        }
        CH.getAnswerField().value = "";
        if (CH["guesses"]%CH["reveal_rate"] === 0){
            if (CH["reveal"]/CH["reveal_rate"] === CH["country_name"].length-2) {
                CH["guesses"] = 0;
                CH["score"] -= 15;
                if (CH["score"] > 0){
                    CH.getScoreInfo().textContent = `Score: ${CH["score"]}`;
                } else {
                    CH["score"] = 0;
                    CH.getScoreInfo().textContent = "";
                }
                guessedCountry();
                return;
            }
            console.log(CH["help_level"]);
            if (CH["settings"]["helps_first"][0] === true && CH["help_level"] !== 4){
                switch (CH["help_level"]){
                    case 0:
                        CH.getLanguagesInfo().textContent = `Spoken languages: ${CH["country_data"]['languages']}`;
                        break;
                    case 1:
                        CH.getPopulationInfo().textContent = `Population: ${CH["country_data"]['population']}`;
                        break;
                    case 2:
                        CH.getCapitalInfo().textContent = `Capital: ${CH["country_data"]['capital']}`;
                        break;
                    case 3:
                        CH.getFlagImg().src = `${CH["country_data"]['flag']}`;
                        CH.getFlagImg().alt = `${CH["country_name"]}`;
                        break;
                }
                CH["help_level"]+=1;
            } else {
                CH["reveal"]+=1;
                let text_content;
                if (CH["settings"]['reversed'][0]){
                    CH["text_content"] = CH.getCountryText().textContent.substring(0, CH["reveal"]/CH["reveal_rate"]) +
                        CH["country_name"][CH["country_name"].length-1-CH["reveal"]/CH["reveal_rate"]] +
                        CH.getCountryText().textContent.substring(CH["reveal"]/CH["reveal_rate"]+2, CH.getCountryText().length);
                } else {
                    text_content = CH.getCountryText().textContent.substring(0, CH["reveal"]/CH["reveal_rate"]) +
                        CH["country_name"][CH["reveal"]/CH["reveal_rate"]] +
                        CH.getCountryText().textContent.substring(CH["reveal"]/CH["reveal_rate"]+2, CH.getCountryText().length);
                }
                CH.getCountryText().textContent = text_content;
            }
        }
    }
})

CH.getSettingsButton().onclick = function (){
    CH.getSettingsModal().style.display = 'block';
}

CH.getCloseSettings().onclick = function (){
    if (CH["changed_settings"]){
        getRandomCountry();
    }
    CH["changed_settings"] = false;
    CH.getSettingsModal().style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === CH["settings_modal"]) {
        if (CH["changed_settings"]){
            getRandomCountry();
        }
        CH["changed_settings"] = false;
        CH.getSettingsModal().style.display = "none";
    }
}

function getRandomCountry(){
    console.dir(CH["settings"])
    if (CH["new_country"]){
        return;
    }

    CH.getAnswerField().disabled = false;
    CH.getAnswerField().value = "";
    CH.getCapitalInfo().textContent = "";
    CH.getPopulationInfo().textContent = "";
    CH.getLanguagesInfo().textContent = "";
    CH.getFlagImg().src = "";
    CH.getFlagImg().alt = "";
    CH.getNextCountryBar().hidden = true;

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
            if (population/1000 > 1) {
                population = population/1000;
                if (population/1000 > 1){
                    population = `${(population/1000).toFixed(1)} M`;
                } else {
                    population = `${population.toFixed(1)} k`;
                }
            }
            CH["country_data"] = {
                region: country_obj['region'],
                capital: country_obj['capital']['0'],
                flag: country_obj['flags']['png'],
                population: population,
                languages: languages
            }
            CH.getAnswerField().focus();

            let text_content = CH["country_name"][0];
            if (CH["settings"]['reversed'][0]){
                text_content = CH["country_name"][CH["country_name"].length-1];
            }

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
            CH.getCountryText().textContent = text_content;

            if (CH["settings"]['show_flag'][0]){
                CH.getFlagImg().src = `${CH["country_data"]['flag']}`;
                CH.getFlagImg().alt = `${CH["country_name"]}`;
            }
            if (CH["settings"]['show_capital'][0]){
                CH.getCapitalInfo().textContent = `Capital: ${CH["country_data"]['capital']}`;
            }
            if (CH["settings"]['show_population'][0]){
                CH.getPopulationInfo().textContent = `Population: ${CH["country_data"]['population']}`;
            }
            if (CH["settings"]['show_languages'][0]){
                CH.getLanguagesInfo().textContent = `Spoken languages: ${CH["country_data"]['languages']}`;
            }

        })
    CH.getRequiredGuesses().hidden = true;
    CH["guesses"] = CH["help_level"] = CH["reveal"] = 0;
    return CH["country_name"];
}

function guessedCountry(){
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
    CH.getNextCountryBar().hidden = true;//false;
    setTimeout(function () {
        CH["new_country"] = false;
        getRandomCountry();
    }, 5000);
}

document.querySelector('#settings_checkboxes').onclick = function(element) {
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
    for (let i in CH["regions"]){
        if (document.getElementById(CH["regions"][i].toLowerCase()).checked){
            new_regions.push(CH["regions"][i]);
        }
    }
    CH["regions"] = new_regions;
    let show_settings = ["flag", "capital", "population", "languages"];

    for (let i in show_settings){
        CH["settings"][`show_${show_settings[i]}`][0] = document.getElementById(`show_${show_settings[i]}`).checked;
    }
    CH["settings"]['reversed'][0] = document.getElementById("reversed").checked;
    CH["settings"]['helps_first'][0] = document.getElementById('helps_first').checked;
    getRandomCountry();
}

