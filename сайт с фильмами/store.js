const Store = {
   state: {
    movie: {},  
    error: '',
    isloadedListVisible: false,
    loadedList: [],
    favoritesMovieList: [],
   },

    setListOfMovies: function(responseData) {
        //получаем данные по фильмам по введенным значениям
        this.state.loadedList = responseData.docs.filter((movieData) => {
            return movieData.rating.kp > 5;
        });
    },

    saveToLocalStorage: function() {
        localStorage.setItem('state', JSON.stringify(this.state));
    },

    initStateFromLocalStorage: function() {
        if (localStorage.getItem('state')) {
            // get - получить данные по ключу (в данном случае ключ: state)
            this.state = JSON.parse(localStorage.getItem('state'));
        }
    },

    updateMovieInfo: function(doc, responseVideoData) {
    
        this.state.movie = {
            poster: doc.poster?.url,
            name: doc.name,
            year: doc.year,
            alternativeName: doc.alternativeName,
            ageRating: doc.ageRating,
            shortDescription: doc.shortDescription,
            countryName: doc.countries[0]?.name,
            genres: doc.genres,
            movieLength: doc.movieLength,
            ratingKp: doc.rating?.kp,
            votesKp: doc.votes?.kp,
            filmCritics: doc.votes?.filmCritics,
            description: doc.description,
            idMovie: doc.id,
            selectedVideoPlayer: responseVideoData[1].source,
            isSerial: doc.isSeries,
            seriesLength: doc.seriesLength,
        
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

        this.saveToLocalStorage();
    },

    //получение данных по выбранному видеоплееру
    getIframeBySource: function() { 
        let chosenPlayer = this.state.movie.videoPlayers.find((player) => {
        return player.source === this.state.movie.selectedVideoPlayer;
        })

        return chosenPlayer.iframeUrl;
    },


}

export { Store }