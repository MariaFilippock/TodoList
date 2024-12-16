const searchInput = document.querySelector('.search_input');
const searchBtn = document.querySelector('.search_btn');
const cardsContainer = document.querySelector('.cards_container');
const switchTempBtn = document.querySelector('.switchTemp_btn');
const clearAll = document.querySelector('.clearAll');
const errBlock = document.getElementById('error_block');


searchBtn.addEventListener('click', handleSearchCity);
clearAll.addEventListener('click', handleClearAll);

let state = {

    cities: [
        // {
        //     city: '',
        //     temp: 0,
        //     icon: '',
        //     timeOfWeather: 0,
        //     tempF: 0,
        // }
    ],

    switch: 'C', //'F'
    error: '',
    // isLoading: false,

}


function renderLoading(isLoading) {
    const preloader = document.getElementById('page_preloader');
    if (isLoading) {
        preloader.classList.remove('hidden');
    } else {
        preloader.classList.add('hidden');
    }
}


function handleSearchCity(event) {
    event.preventDefault();

    if (!searchInput.value) {
        //нужна заглушка, тк на loadWeatherOfCity есть подписка и другие функции ждут результата отработки loadWeatherOfCity
        return;
    }

    renderLoading(true);

    //написать условие, если в названии ошибка, то выведи отрисовку ошибки на экране
    loadWeatherOfCity(searchInput.value).then(() => {
        //нужно и тут вызвать рендер, чтобы отрисовка происходила в моменте как только введем новый город
        renderWeather();
        saveToLocalStorage();
    }).catch((err) => {
        renderWeather();

    }).finally(() => {
        renderLoading(false);
    });
}

//убираем пробелы в ID
function removeSpacesInId(city) {
    return city.replaceAll(' ', '');
}


function renderShowMoreInfo(city) {
    // debugger
    return city.isMoreDetailsVisible ? `<div class="uv">УФ-индекс: ${city.uv}</div>
                                <div class="windDir">Ветер: ${city.windDir}</div>
                                <div class="text_info">Состояние: ${city.conditionWeather}</div>
                                <div class="hidden_info_btn" data-action="hiddenInfo">Скрыть</div>` : '';
}


function renderWeather() {
    //когда вводим новый город, значит, старый надо удалить
    cardsContainer.innerHTML = '';
    // debugger
    if (state.cities.length > 0) {
        state.cities.forEach((cityData) => {
            const timeWeather = new Date(cityData.timeOfWeather).toLocaleTimeString();
            const temperature = state.switch === 'C' ? `${cityData.temp} °C` : `${cityData.tempF} ℉`;

            const cityWeatherHTML = `
                <div class="weather_info" id = ${removeSpacesInId(cityData.city)}>
                <button class='clear_btn' type="button" data-action = 'clear'>x</button>
                <div class="city_name">${cityData.city}</div>
                <div class="city_temperature">${temperature}</div>
                <img class="icon_temperature" src = '${cityData.icon}'/> 
                <div class="additional_info" >
                    <div class="additional_title" data-action="showInfo">Подробнее</div>
                    <div class="container_additional">${renderShowMoreInfo(cityData)}</div>
                </div>
                <div class="localtimeOfWeather">Актуально на ${timeWeather}</div>
                </div>`;

            cardsContainer.insertAdjacentHTML('beforeend', cityWeatherHTML);

            const cityWeatherCard = document.getElementById(removeSpacesInId(cityData.city));
            const clearBtn = cityWeatherCard.querySelector('.clear_btn');
            const additionalInfoBtn = cityWeatherCard.querySelector('.additional_title');
            const hiddenInfoBtn = cityWeatherCard.querySelector('.hidden_info_btn');

            clearBtn.addEventListener('click', handleClearCard);
            additionalInfoBtn.addEventListener('click', (event) => handleShowAdditionalInfo(event, cityData));
            if (hiddenInfoBtn) {
                return hiddenInfoBtn.addEventListener('click', (event) => handleHiddenAdditionalInfo(event, cityData));
            }
        })

        errBlock.innerText = state.error;

    } else {
        renderEmpty();
    }
}

function handleHiddenAdditionalInfo(event, city) {
    // debugger
    if (event.target.dataset.action !== 'hiddenInfo') return;
    city.isMoreDetailsVisible = false;

    renderWeather();
    saveToLocalStorage();
}

function handleShowAdditionalInfo(event, city) {
    if (event.target.dataset.action !== 'showInfo') return;
    city.isMoreDetailsVisible = true;

    renderWeather();
    saveToLocalStorage();
}


function handleClearAll(event) {
    if (event.target.dataset.action !== 'clearAll') return;

    state.cities = [];
    saveToLocalStorage();
    renderWeather();

}


function handleClearCard(event) {
    if (event.target.dataset.action !== 'clear') return;

    let parentNode = event.target.closest('.weather_info');
    let cityName = parentNode.id;

    state.cities = state.cities.filter((cityData) => removeSpacesInId(cityData.city) !== cityName);

    saveToLocalStorage();
    renderWeather();
}


switchTempBtn.addEventListener('click', handleSwitchTemp);

function handleSwitchTemp() {
    state.switch === 'C' ? state.switch = 'F' : state.switch = 'C';

    renderWeather();
    saveToLocalStorage();
}


function loadWeatherOfCity(cityName) {

    const apiKey = '5ed60a5aaf934bf49c7150247243010';
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}`;

    return fetch(url).then((response) => {
        return response.json()
    }).then((responseData) => {
        if (responseData.error) {
            state.error = 'Ошибка! Введите корректное название города.';
            return new Error(state.error);
        } else {
            updateCityState(responseData, cityName);
            state.error = '';
        }
        searchInput.value = '';

    })
}


function updateCityState(responseData, cityName) {


    let i = state.cities.findIndex((cityData) => {
        return cityData.city === cityName;
    })

    const loadedCity = {
        temp: responseData?.current?.temp_c,
        city: responseData?.location?.name,
        icon: responseData?.current?.condition.icon,
        timeOfWeather: responseData?.location?.localtime,
        tempF: responseData?.current?.temp_f,
        uv: responseData?.current?.uv,
        windDir: responseData?.current?.wind_dir,
        conditionWeather: responseData?.current?.condition?.text,
    };

    //проверка на то, был ли уже добавлен этот город, если был, то обновляем инфо, если нет - пушим
    if (i >= 0) {
        // debugger
        state.cities[i] = {...state.cities[i], ...loadedCity};


    } else {
        state.cities.push({...loadedCity, isMoreDetailsVisible: false});
    }


}


function saveToLocalStorage() {
    localStorage.setItem('state', JSON.stringify(state));
}

function renderEmpty() {
    return cardsContainer.insertAdjacentHTML('beforeend', `<div class="empty_container">Пусто. Введите город.<div/>`);
}

//старт моего приложения
if (localStorage.getItem('state')) {
    //функция по отрисовке html, нужно чтобы при 100500 обновлении мы каждый раз видели инфу на странице
    //данные до и после обновления страницы не пропали и те же, что были до обновления страницы
    state = JSON.parse(localStorage.getItem('state'));
    renderLoading(true);
    Promise.all(state.cities.map(city => loadWeatherOfCity(city.city)))
        .then(() => renderWeather())
        .catch((err) => {
            renderWeather();
            console.error(err);
        })
        .finally(() => {
            renderLoading(false);
        });
} else {
    renderEmpty();
}


