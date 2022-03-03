class Player{
    #data;
    #id;

    constructor(data, id){
        this.#data=data;
        this.#id=id;
    }

    getId(){
        return this.#id;
    }

    getName(){
        return this.#data.players[this.#id].name;
    }

    /**
     * @returns Whether or not the player has been inactive for long enough to be considered unrated.
     */
    getIsArchived(){
        return this.#data.players[this.#id].isArchived;
    }

    /**
     * @returns {Date} The date that the player joined, or the date that they were unarchived.
     */
    getUnarchivedDate(){
        return new Date(this.#data.players[this.#id].unarchivedDate);
    }

    /**
     * @returns {number} Games until rated. Equal to 0 if rated. 
     * Equal to -1 if they don't meet the ratedThreshold requirement.
     */
    getUntilRated(){
        return this.#data.players[this.#id].untilRated;
    }

    /**
     * @returns {[RatingDay]}
     */
    getRatingDays(){
        let ratingDays=[];
        let ratingDayIds=this.#data.players[this.#id].ratingDays;
        ratingDayIds.forEach(ratingDayId=>{
            ratingDays.push(new RatingDay(this.#data, ratingDayId));
        });

        return ratingDays;
    }

    /**
     * @returns {number} Natural rating from the last rating day.
     */
    getR(){
        let ratingDays=this.#data.players[this.#id].ratingDays;
        if(ratingDays.length===0){
            return 0;
        }
        else{
            return this.#data.ratingDays[ratingDays[ratingDays.length-1]].r;
        }
    }

    /**
     * @returns Leaderboard rating. Undefined if no matches were played.
     */
    getRL(){
        let ratingDays=this.#data.players[this.#id].ratingDays;
        if(ratingDays.length===0){
            return undefined;
        }
        else{
            return leaderboardRating.getLeaderboardRating(this.getR(), this.getSigma(), 
                this.#data.config.meanRating, this.#data.config.ratingScale);
        }
    }

    /**
     * @returns {number} Rating deviation from the last rating day. Undefined if there are no games or no rating updates were done.
     */
    getSigma(){
        let ratingDays=this.#data.players[this.#id].ratingDays;
        if(ratingDays.length===0){
            if(this.#data.config.prior!=0){
                return leaderboardRating.getSigma0(this.#data.config.prior);
            }
            else
                return undefined;
        }
        else{
            let w2=Math.pow(this.#data.config.w, 2);
            let sigma=this.#data.ratingDays[ratingDays[ratingDays.length-1]].sigma;
            let lastRatingDate=this.#data.ratingDays[ratingDays[ratingDays.length-1]].date;
            let today=new Date().setUTCHours(0, 0, 0, 0);
            if(today.valueOf()>lastRatingDate.valueOf()){
                sigma=Math.sqrt(Math.pow(sigma, 2)+(today.valueOf()-lastRatingDate.valueOf())/86_400_000*w2);
            }
            return sigma;
        }
    }

    /**
     * @returns {number} Leaderboard rating deviation based on the leaderboard rating scale. Undefined if there are no games or no rating updates were done.
     */
    getSigmaL(){
        let sigma=this.getSigma();
        if(sigma===undefined){
            return undefined;
        }
        else{
            return leaderboardRating.getLeaderboardSigma(sigma, this.#data.config.ratingScale);
        }
    }

    setName(name){
        this.#data.players[this.#id].name=name;
    }

    /**
     * @param {boolean} isArchived Whether or not the player has been inactive for long enough to be considered unrated.
     */
    setIsArchived(isArchived){
        this.#data.players[this.#id].isArchived=isArchived;
    }

    /**
     * @param {Date} unarchivedDate The date that the player joined, or the date that they were unarchived.
     */
    setUnarchivedDate(unarchivedDate){
        this.#data.players[this.#id].unarchivedDate=unarchivedDate.valueOf();
    }

    /**
     * @param {number} untilRated Games until rated.
     */
    setUntilRated(untilRated){
        this.#data.players[this.#id].untilRated=untilRated;
    }
}
