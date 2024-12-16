export function getVideoMovieByID(id) {
    const url = `https://kinobox.tv/api/players?kinopoisk=${id}`;


    return fetch(url)
        .then((data) => {
            return data.json();
        }).then((responseVideoData) => {
            return responseVideoData;
        })
}


const headers = {
    "X-API-KEY": "H1WGZ9Y-VT04R1D-KFYYYQ2-ZDB00S5"
};

let counter = 0;

export function getMoviesByFirstLetters(name, page = 1, limit = 30) {
    counter++;
    const localCount = counter
    const url = `https://api.kinopoisk.dev/v1.4/movie/search?query=${name}&limit=${limit}&page=${page}`;

    // return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         if (counter === localCount) {
    //             resolve(MOCK_DATA)
    //             // console.log(MOCK_DATA);
    //         }
    //     }, 1500);
    // }).then((responseData) => {
        
    //     getListOfMovies(responseData);
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
    }).then((data) => {
        return data.json();
    }).then((responseData) => {
        return responseData;

        // if (responseData.error) {
        //     state.error = 'Ошибка!';
        //     return new Error(state.error);
        // } else {
        //     updateMovieInfo(responseData);
        //     state.error = '';
        // }
        // searchInput.value = '';
    })
}



