let answer_field = document.getElementById("answer_field");
let country_text = document.getElementById("country_text");
let country_data = [];
let country_name = "";
let guesses = 0;
let required_guesses = document.getElementById("required_guesses");
let reveal_rate = 1;

let flag_img = document.getElementById("flag_img");
let capital_info = document.getElementById("capital_information");
let population_info = document.getElementById("population_information");
//let areaCode_info = document.getElementById("areaCode_information");
let languages_info = document.getElementById("languages_information");

let regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
let settings = {
    show_flag: false,
    show_capital: false,
    show_population: false,
    show_languages: false,
    reversed: false
}
let new_country = false;

answer_field.addEventListener('keydown', (e) => {
    if (e.keyCode === 13){

        guesses++;
        if (answer_field.value.toLowerCase().trim() === country_name.toLowerCase()){
            guessedCountry();
            return;
        }
        answer_field.value = "";
        if (guesses%reveal_rate === 0){
            if (guesses/reveal_rate === country_name.length-1) {
                guesses = 0;
                guessedCountry();
                return;
            }
            let text_content;
            if (settings['reversed']){
                text_content = country_text.textContent.substring(0, guesses/reveal_rate) +
                    country_name[country_name.length-1-guesses/reveal_rate] +
                    country_text.textContent.substring(guesses/reveal_rate+2, country_text.length);
            } else {
                text_content = country_text.textContent.substring(0, guesses/reveal_rate) +
                    country_name[guesses/reveal_rate] +
                    country_text.textContent.substring(guesses/reveal_rate+2, country_text.length);
            }
            country_text.textContent = text_content;
        }
    }
})


function getRandomCountry(){
    if (new_country){
        return;
    }
    resetGame();
    fetch(`https://restcountries.com/v3.1/region/${regions[Math.floor(regions.length * Math.random())]}`)
        .then((response) => response.json())
        .then((data) => {
            let country_obj = data[`${Math.floor(data.length*Math.random())}`]
            new_country = false;
            country_name = country_obj['translations']['deu']['common'];
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
            country_data = {
                region: country_obj['region'],
                capital: country_obj['capital']['0'],
                flag: country_obj['flags']['png'],
                population: population,
                //areaCode: country_obj['idd']['root'] + country_obj['idd']['suffixes']['0'],
                languages: languages
            }
            answer_field.focus();

            let text_content = country_name[0];
            if (settings['reversed']){
                text_content = country_name[country_name.length-1];
            }

            for (let i = 1; i < country_name.length; i++){
                if (country_name[i] !== " "){
                    if (country_name[i] === "." || country_name[i] === "-"){
                        text_content += " . ";
                    } else {
                        text_content += " _";
                    }
                } else {
                    text_content += " ⠀ ";
                }
            }
            country_text.textContent = text_content;

            if (settings['show_flag']){
                flag_img.src = `${country_data['flag']}`;
                flag_img.alt = `${country_name}`;
            }
            if (settings['show_capital']){
                capital_info.textContent = `Capital: ${country_data['capital']}`;
            }
            if (settings['show_population']){
                population_info.textContent = `Population: ${country_data['population']}`;
            }
            if (settings['show_languages']){
                languages_info.textContent = `Spoken languages: ${country_data['languages']}`;
            }

        })
    guesses = 0;
    required_guesses.hidden = true;
    return country_name;
}

function guessedCountry(){
    answer_field.disabled = true;
    answer_field.blur();
    answer_field.value = "";
    country_text.textContent = country_name;
    capital_info.textContent = `Capital: ${country_data['capital']}`;

    population_info.textContent = `Population: ${country_data['population']}`;
    //areaCode_info.textContent = `AreaCode: ${country_data['areaCode']}`;

    languages_info.textContent = `Spoken languages: ${country_data['languages']}`;

    flag_img.src = `${country_data['flag']}`;
    flag_img.alt = `${country_name}`;

    if (guesses !== 0){
        if (guesses === 1){
            required_guesses.textContent = `${guesses} attempt needed`;
        } else {
            required_guesses.textContent = `${guesses} attempts needed`;
        }
        required_guesses.hidden = false;
    }
    new_country = true;
    setTimeout(function () {
        new_country = false;
        getRandomCountry();
    }, 5000);
}


document.querySelector('#region_selection').onclick = function(element) {
    if (element.target.value.startsWith("show_")){
        settings[element.target.value] = element.target.checked;
        getRandomCountry();
    } else if(element.target.value === "reversed") {
        settings["reversed"] = element.target.checked;
        getRandomCountry();
    } else {
        if (element.target.checked === false) {
            if (regions.length === 1){
                element.target.checked = true;
            } else {
                let new_regions = []
                for (let i = 0; i < regions.length; i++){
                    if (regions[i] !== element.target.value){
                        new_regions.push(regions[i]);
                    }
                }
                regions = new_regions;
                getRandomCountry();
            }
        } else {
            if (!regions.includes(element.target.value) && element.target.value !== undefined){
                regions.push(element.target.value);
                getRandomCountry();
            }
        }
    }
}

function loadBody(){
    let new_regions = [];
    for (let i in regions){
        if (document.getElementById(regions[i].toLowerCase()).checked){
            new_regions.push(regions[i]);
        }
    }
    regions = new_regions;
    let show_settings = ["flag", "capital", "population", "languages"];

    for (let i in show_settings){
        settings[`show_${show_settings[i]}`] = document.getElementById(`show_${show_settings[i]}`).checked;
    }
    settings['reversed'] = document.getElementById("reversed").checked;

    getRandomCountry();
}


function resetGame(){
    answer_field.disabled = false;
    answer_field.value = "";
    capital_info.textContent = "";
    population_info.textContent = "";
    languages_info.textContent = "";
    flag_img.src = "";
    flag_img.alt = "";
}