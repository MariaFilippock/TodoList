import {MOCK_DATA} from "./mock.js";
import {getVideoMovieByID, getMoviesByFirstLetters, getMoviesByName} from "./api.js";


const searchBtn = document.querySelector('.btn-search');
const searchInput = document.getElementById('search-input');
const movieCardContainer = document.querySelector('.wrapper');
const formSearch = document.querySelector('.form-search');
const dropdownContainer = document.getElementById('dropdown-container');



let state = {
    movie: {},  
    error: '',
    isloadedListVisible: false,
    loadedList: [],
    favoritesMovieList: [],
}


searchBtn.addEventListener('click', handleSearchMovieByName);
searchInput.addEventListener('input', handleShowAllMovies);

document.addEventListener('click', (event) => {
    if (formSearch.contains(event.target)) {
        return
    }

    state.isloadedListVisible = false;
    renderListOfMovies();
    searchInput.value = '';
});


function handleShowAllMovies(event) {
    event.preventDefault();
    state.isloadedListVisible = true;

    getMoviesByFirstLetters(searchInput.value)
    .then((responseData) => {
        if (responseData) {
            getListOfMovies(responseData);
        }
    }).then(() => {
        renderListOfMovies();
    });
}


function getListOfMovies(responseData) {
    //получаем данные по фильмам по введенным значениям

    state.loadedList = responseData.docs.filter((movieData) => {
        return movieData.rating.kp > 5;
    });
}

function showExistedInfo(data) {
    return Number(data) > 0 ? data.toFixed(1) : ``;
}


function showAge(data) {
    return Number(data) > 0 ? data.toFixed(0) : `0`;
}


function createList() {
    const list = state.loadedList.map((movieEl) => {
        return `<div class="dropdown-movie-item" id = '${movieEl.id}'>${movieEl.name} 
                    <span class="dropdown-movie-rating">${showExistedInfo(movieEl.rating.kp)}</span>
                </div>`
    }).slice(0, 10);

    return list.join(' ');
}


//отрисовка выпадающего списка и слушатель на клик по одному из выпадающего списка фильму
function renderListOfMovies() {
    
    //рендерим список фильмов по введенным значениям
    dropdownContainer.innerHTML = state.isloadedListVisible ? `<div class="dropdown-list-movies">
                                 ${createList()}
                                 </div>` : '';

    const dropdownListMovies = dropdownContainer.querySelector('.dropdown-list-movies');

    //слушатель, если клик по одному из фильмов
    if (dropdownListMovies) {
        dropdownListMovies.addEventListener('click', handleFindMovieIdAtDropdownList);
    }
}


//поиск данных по фильму из выпадающего списка в поиске
function handleFindMovieIdAtDropdownList(event) {
    // debugger
    let parentNode = event.target.closest('.dropdown-movie-item');

    let parentNodeId = parentNode.id;
    const nameMovie = document.getElementById(parentNodeId).firstChild.textContent.trim();

    let chosenMovie = state.loadedList.find((movieData) => {
        return movieData.name === nameMovie;
    })

    getVideoMovieByID(parentNodeId)
        .then((responseVideoData) => {
            updateMovieInfo({docs: [chosenMovie]}, responseVideoData);
            renderCardOfMovie();
            saveToLocalStorage();        
    })
}


function handleSearchMovieByName(event) {
    event.preventDefault();

    if (!searchInput.value) {
        return;
    }

    let responseData = null;

    getMoviesByName(searchInput.value)
        .then((_responseData) => {
            responseData = _responseData;
            debugger
            return getVideoMovieByID(_responseData.docs[0].id);
        }).then((responseVideoData) => {
        updateMovieInfo(responseData, responseVideoData);
        renderCardOfMovie();
        saveToLocalStorage();
    })
}




function updateMovieInfo(responseData, responseVideoData) {

    state.movie = {
        poster: responseData?.docs[0].poster?.url,
        name: responseData?.docs[0].name,
        year: responseData?.docs[0].year,
        alternativeName: responseData?.docs[0].alternativeName,
        ageRating: responseData?.docs[0].ageRating,
        shortDescription: responseData?.docs[0].shortDescription,
        countryName: responseData?.docs[0].countries[0]?.name,
        genres: responseData?.docs[0].genres,
        movieLength: responseData?.docs[0].movieLength,
        ratingKp: responseData?.docs[0].rating?.kp,
        votesKp: responseData?.docs[0].votes?.kp,
        filmCritics: responseData?.docs[0].votes?.filmCritics,
        description: responseData?.docs[0].description,
        idMovie: responseData?.docs[0].id,
        selectedVideoPlayer: responseVideoData[1].source,
    
        videoPlayers: responseVideoData.filter((obj) => {
            return obj.source !== 'Alloha' 
            && obj.iframeUrl
        }).map((videoPlayer) => {
            return {
                source: videoPlayer.source,
                iframeUrl: videoPlayer.iframeUrl,
            }
        })
    }
}



function countHoursAndMinutes(minutes) {
    let hours = Math.floor(minutes / 60);
    return `${hours} ч ${minutes - (hours * 60)} мин`;
}



function createGenresHTML() {
    const genresAll = state.movie.genres.map((genre) => {
        return `<a href="#">${genre.name}</a>`;
    })

    return genresAll.join(',  ');
}


function createPlayerSelectField() {
    const playersAll = state.movie.videoPlayers.map((players) => {
        return `<option id = "${players.source}"  ${ players.source ===  state.movie.selectedVideoPlayer ? 'selected' : ``} >${players.source}</option>`;
    })

    return `<select id = "select-player">${playersAll.join(' ')}</select>`
}


function renderCardOfMovie() {
    movieCardContainer.innerHTML = '';

    const movieCardHTML = `<div class="wrapper-col-1">
            <img src="${state.movie.poster}" alt="${state.movie.name} ${(state.movie.year)}" >
        </div>
        <div class="wrapper-col-2">
        ${renderFavoritesBtn()}
        
            <h1 class="title">${state.movie.name} (${state.movie.year})</h1>
            <h6 class="subtitle">${state.movie.alternativeName} ${showAge(state.movie.ageRating)}+</h6>
            <p class="description">${state.movie.shortDescription}</p>

            <div class="mb-40">
                <a href="#" class="btn" id = "watch-btn">Смотреть</a>
            </div>

            <ul class="params mb-40">
                <li><span class="text-muted">Аудиодорожки </span>Русский</li>
                <li><span class="text-muted">Возраст </span><span><span class="tag">${showAge(state.movie.ageRating)}+</span></span></li>
            </ul>

            <h2>О фильме</h2>

            <ul class="params">
                <li><span class="text-muted">Год производства </span>${state.movie.year}</li>
                <li><span class="text-muted">Страна </span>${state.movie.countryName}</li>
                <li><span class="text-muted">Жанр </span>
                <span class="genres-list">${createGenresHTML()}</span>
                </li>
                <li><span class="text-muted">Время </span>
                    <time class="text-muted">${state.movie.movieLength} мин. / ${countHoursAndMinutes(state.movie.movieLength)}</time>
                </li>
                <li><span class="text-muted">Описание </span>${state.movie.description}</li>
            </ul>

                <div class="kinobox_player">
                    ${createPlayerSelectField()}
                    <iframe controls id = "iframe-player" src="${getIframeBySource()}" width="100%" height="500px" style = "border: 1px solid #aaa; border-radius: 3px;"></iframe>
                </div>
        </div>
             
        <div class="wrapper-col-3">
            <span class="rating-main">${(state.movie.ratingKp).toFixed(1)}</span>
            <span class="rating-counts">${(state.movie.votesKp).toLocaleString()} оценки</span>
            <a href="#" class="rating-details">${state.movie.filmCritics} рецензий</a>

            <h4 class = "favorites-title"> Мое избранное </h4>   
            ${renderFavoriteMovieList()}
        </div>`


    movieCardContainer.insertAdjacentHTML('afterbegin', movieCardHTML);

    const selectPlayer = document.getElementById('select-player');
    selectPlayer.addEventListener('change', handleSearchPlayerAtSelect);

    //перелистывание до контейнера с видеоплеером
    const watchBtn = document.getElementById('watch-btn');
    watchBtn.addEventListener('click', () => {
        document.getElementById('iframe-player').scrollIntoView({behavior: "smooth",});
    })

    //смена сердечка при клике
    const addToFavorites = document.getElementById('add-to-favorites');
    addToFavorites.addEventListener('click', handleClickFavorites);


    //переход по клику на фильм в Избранном
    const favoritesList = document.getElementById('favorites-list');

    if (favoritesList) {
        favoritesList.addEventListener('click', handleFindMovieIdAtFavoriteList);
    }

}


function handleFindMovieIdAtFavoriteList(event) {
    let parentNode = event.target.closest('.favorite-movie-item');

    let responseData = null;

    getMoviesByName(parentNode.innerText)
        .then((_responseData) => {
            responseData = _responseData;
            return getVideoMovieByID(parentNode.id)
        }).then((responseVideoData) => {
            console.log(responseData);
            updateMovieInfo(responseData, responseVideoData);
            renderCardOfMovie();
            saveToLocalStorage();
        })
   
}


//получение данных по выбранному видеоплееру
function getIframeBySource() { 
     let chosenPlayer = state.movie.videoPlayers.find((player) => {
        return player.source === state.movie.selectedVideoPlayer;
    })

    return chosenPlayer.iframeUrl;
}


//выбор плеера из выпадающего списка и отрисовка
function handleSearchPlayerAtSelect(event) {
    state.movie.selectedVideoPlayer = event.target.value;

    renderCardOfMovie();
}


//клик, чтобы добавить в избранное
function handleClickFavorites() {
    const chooseFavorite = state.favoritesMovieList.find((favMovie) => {
        return favMovie.id === state.movie.idMovie;
    });


    if (!chooseFavorite) {
        state.favoritesMovieList.push({
            //проверяю, что его нет в списке избранных фильмов
            name: state.movie.name,
            poster: state.movie.poster,
            id: state.movie.idMovie
        });
    } else {
        //если повторно жму на фильм, который уже есть в списке избранного
        state.favoritesMovieList = state.favoritesMovieList.filter((favMovie) => {
            return favMovie.id !== state.movie.idMovie;

        })
    }


    renderCardOfMovie();
    saveToLocalStorage();
}

//получить данные по изб фильмам и отрисовать 
function renderFavoriteMovieList() {
    const favoriteMovieList = state.favoritesMovieList.map((favoriteEl) => {
        return `<div class = "favorite-movie-item" id = "${favoriteEl.id}">
                    <img id = "favorite-movie-poster" src = "${favoriteEl.poster}"> <div class="favorite-movie-name">${favoriteEl.name}
                    </div>
                </div>`
    })
    return `<div id="favorites-list">${favoriteMovieList.join(' ')}</div>` 
}


//отрисовка на закрашенное/незакрашенное сердечко
function renderFavoritesBtn() {
    const chooseFavorite = state.favoritesMovieList.find((favMovie) => {
        return favMovie.id === state.movie.idMovie;
    });

    return  `<div id = "add-to-favorites"> 
                <span>Добавить в избранное</span> 
                <span id = "favorites-img">${chooseFavorite ? `<ion-icon name="heart"></ion-icon>` : `<ion-icon name="heart-outline"></ion-icon>`}</span>
            </div>`;

}


function saveToLocalStorage() {
    localStorage.setItem('state', JSON.stringify(state));
}


if (localStorage.getItem('state')) {
    // get - получить данные по ключу (в данном случае ключ: state)
    state = JSON.parse(localStorage.getItem('state'));
    renderCardOfMovie();
}
