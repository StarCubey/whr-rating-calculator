class Game{
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
        return new Date(this.#data.games[this.#id].date);
    }

    /**
     * @returns {[[Player]]}
     */
    getTeams(){
        let teamsPlayerIds=this.#data.games[this.#id].teams;
        let teams=[];
        teamsPlayerIds.forEach((team, teamIndex)=>{
            teams.push([]);
            team.forEach(playerId=>{
                teams[teamIndex].push(new Player(this.#data, playerId));
            });
        });

        return teams;
    }

    /**
     * @returns {[[RatingDay]]} The rating day for each player on each team that corresponds to this game.
     */
    getTeamsRatingDays(){
        let teamsRatingDayIds=this.#data.games[this.#id].teamsRatingDays;
        let teamsRatingDays=[];
        teamsRatingDayIds.forEach((team, teamIndex)=>{
            teamsRatingDays.push([]);
            team.forEach(ratingDayId=>{
                teamsRatingDays[teamIndex].push(new RatingDay(this.#data, ratingDayId));
            });
        });

        return teamsRatingDays;
    }

    getIsScore(){
        return this.#data.games[this.#id].isScore;
    }

    /**
     * @returns {[number]}
     */
    getResults(){
        return this.#data.games[this.#id].results;
    }

    /**
     * @param {Date} date 
     */
    setDate(date){
        this.#data.games[this.#id].date=date.valueOf();
    }

    setIsScore(isScore){
        this.#data.games[this.#id].isScore=isScore;
    }

    /**
     * @param {[number]} results
     */
    setResults(results){
        this.#data.games[this.#id].results=results;
    }
}
