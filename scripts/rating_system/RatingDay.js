class RatingDay{
    #data;
    #id;

    constructor(data, id){
        this.#data=data;
        this.#id=id;
    }

    getId(){
        return this.#id;
    }

    /**
     * @returns {Date}
     */
    getDate(){
        return new Date(this.#data.ratingDays[this.#id].date);
    }

    /**
     * @returns {number} Natural rating.
     */
    getR(){
        return this.#data.ratingDays[this.#id].r;
    }

    /**
     * @returns {number} Leaderboard rating.
     */
    getRL(){
        return leaderboardRating.getLeaderboardRating(this.#data.ratingDays[this.#id].r, 
            this.#data.ratingDays[this.#id].sigma, this.#data.config.meanRating, this.#data.config.ratingScale);
    }

    /**
     * @returns {number} Rating variance. Undefined if no rating updates were done.
     */
    getSigma(){
        return this.#data.ratingDays[this.#id].sigma;
    }

    /**
     * @returns Leaderboard rating deviation based on the leaderboard rating scale. Undefined if no rating updates were done.
     */
    getSigmaL(){
        let sigma=this.#data.ratingDays[this.#id].sigma;
        if(sigma===undefined){
            return undefined;
        }
        else{
            return leaderboardRating.getLeaderboardSigma(sigma, this.#data.config.ratingScale);
        }
    }

    /**
     * @returns {boolean}
     */
    getHasPrior(){
        return this.#data.ratingDays[this.#id].hasPrior;
    }

    /**
     * @returns {[Game]}
     */
    getGames(){
        let games=[];
        let gameIds=this.#data.ratingDays[this.#id].games;
        gameIds.forEach(gameId=>{
            games.push(new Game(this.#data, gameId));
        });

        return games;
    }

    /**
     * @param {Date} date 
     */
    setDate(date){
        this.#data.ratingDays[this.#id].date=date.valueOf();
    }

    /**
     * @param {number} r Natural rating.
     */
    setR(r){
        this.#data.ratingDays[this.#id].r=r;
    }

    /**
     * @param {number} sigma Rating deviation.
     */
    setSigma(sigma){
        this.#data.ratingDays[this.#id].sigma=sigma;
    }

    /**
     * @param {boolean} hasPrior 
     */
    setHasPrior(hasPrior){
        this.#data.ratingDays[this.#id].hasPrior=hasPrior;
    }
}
