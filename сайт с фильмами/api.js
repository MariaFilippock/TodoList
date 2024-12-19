import {MOCK_DATA} from "./mock.js";

export function getVideoMovieByID(id) {
    const url = `https://kinobox.tv/api/players?kinopoisk=${id}`;

    return fetch(url)
        .then((response) => {
            return response.json();
        }).then((responseVideoData) => {
            return responseVideoData;
        })
}


const headers = {
    // "X-API-KEY": "H1WGZ9Y-VT04R1D-KFYYYQ2-ZDB00S5"
    "X-API-KEY": "B8Y4Q8Y-SSG4FVM-QQ1WBYN-RTF0J37"
};

let counter = 0;

export function getMoviesByFirstLetters(name, page = 1, limit = 30) {
    counter++;
    const localCount = counter
    const url = `https://api.kinopoisk.dev/v1.4/movie/search?query=${name}&limit=${limit}&page=${page}`;

    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         if (counter === localCount) {
    //             resolve(MOCK_DATA)
    //         }
    //     }, 1500);
    // })

    return fetch(url, {
        headers: headers
    }).then((data) => {
        if (counter === localCount) {
            return data.json();
        }

    })
}

export function getMoviesByName(name, page = 1, limit = 1) {
    const url = `https://api.kinopoisk.dev/v1.4/movie/search?query=${name}&limit${limit}&page${page}`;

    return fetch(url, {
        headers: headers
    }).then((response) => {
        return response.json();
    })
}


function getMoviesById(id) {
    const url = `https://api.kinopoisk.dev/v1.4/movie/${id}`;

    return fetch(url, {
        headers: headers
    }).then((data) => {
        return data.json();
    })

}



export function fetchMovieAndVideoDataByName(movieName) {
    let responseData;

    return getMoviesByName(movieName)
        .then((_responseData) => {
            responseData = _responseData;
            return getVideoMovieByID(_responseData.docs[0].id)
                .then((responseVideoData) => {
                    return [responseData.docs[0], responseVideoData];
                    })
        })
}

export function fetchMovieAndVideoDataById(movieId) {
    let responseData;
    // debugger
    return getMoviesById(movieId)
        .then((_responseData) => {
            responseData = _responseData;
            return getVideoMovieByID(movieId)
                .then((responseVideoData) => {
                    console.log(responseVideoData);
                    return [responseData, responseVideoData];
                    })
        })
}

