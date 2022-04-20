/**
 * Manages rating data.
 */
class RatingSystem{
    #data={
        config: {
            seasonNum: 1,
            meanRating: 1500,
            ratingScale: 173.72,
            gameNumUntilRated: 5,
            ratedThreshold: 1,
            infiniteGames: false,
            maximumNumOfGames: 10_000,
            prior: 1.2,
            w: 0.0215,
            deletedGames: 0
        },
        players: {
            ids: [],
            nextId: 0
        },
        games: {
            ids: [],
            nextId: 0
        },
        ratingDays: {
            ids: [],
            nextId: 0
        }
    };

    /**
     * @returns {object} Data object containing rating system data.
     */
    saveData(){
        return this.#data;
    }

    /**
     * Loads rating system data from data object.
     * @param {object} data 
     */
    loadData(data){
        this.#data=data;
    }

    /**
     * @returns {[Player]}
     */
    getPlayers(){
        let players=[];
        this.#data.players.ids.forEach(id=>{
            players.push(new Player(this.#data, id));
        });
        return players;
    }

    /**
     * @returns {number} The number of players in the rating system.
     */
    getPlayersLength(){
        return this.#data.players.ids.length;
    }

    /**
     * @returns {[Game]}
     */
    getGames(){
        let games=[];
        this.#data.games.ids.forEach(id=>{
            games.push(new Game(this.#data, id));
        });
        return games;
    }

    /**
     * @returns {number} The number of ganes in the rating system.
     */
    getGamesLength(){
        return this.#data.games.ids.length;
    }

    /**
     * @returns {object} The config settings.
     */
    getConfig(){
        return this.#data.config;
    }
    
    /**
     * Adds a player to the rating system.
     * @param {string} name Player name.
     * @returns {Player} The player that was added to the rating system.
     */
    addPlayer(name){
        let players=this.#data.players;

        players[players.nextId]={
            name: name,
            isArchived: false,
            unarchivedDate: Date.now(),
            untilRated: this.#data.config.gameNumUntilRated,
            ratingDays: []
        };
        
        let playerId=players.nextId;
        players.ids.push(playerId);
        players.nextId++;

        return new Player(this.#data, playerId);
    }

    /**
     * Removes a player from the rating system.
     * @param {Player} player
     */
    removePlayer(player){
        let players=this.#data.players;
        let ratingDays=this.#data.ratingDays;

        let playerRatingDays=player.getRatingDays();

        playerRatingDays.forEach(ratingDay=>{
            ratingDay.getGames().forEach(game=>{
                this.removeGame(game);
            });
        });

        playerRatingDays.forEach(ratingDay=>{
            delete ratingDays[ratingDay.getId()];
            let index=ratingDays.ids.findIndex(x=>{return x==ratingDay.getId();});
            ratingDays.ids.splice(index, 1);
        });
        
        delete players[player.getId()];
        let index=players.ids.findIndex(x=>{return x==player.getId();});
        players.ids.splice(index, 1);
    }

    /**
     * Adds a game to the leaderboard, adds the match to the player's rating day, 
     * and removes a match if the match limit is exceeded.
     * @param {[[Player]]} teams A list of teams of players.
     * @param {[number]} results The score of each team.
     * @param {Date} date The time of the match.
     * @returns {Game} The game that was added to the rating system.
     */
    addGameWithScore(teams, results, date){
        date=date.setUTCHours(0, 0, 0, 0);

        let teamsIds=[];

        teams.forEach((team, teamIndex)=>{
            teamsIds.push([]);
            team.forEach((player, playerIndex)=>{
                teamsIds[teamIndex].push(player.getId());
            });
        });

        let game={
            date: date.valueOf(),
            teams: teamsIds,
            isScore: true,
            results: results
        };
        return this.#addGame(game);
    }

    /**
     * Adds a game to the leaderboard, adds the match to the players' rating day, 
     * and removes a match if the match limit is exceeded.
     * @param {[[Player]]} teams A list of teams of players.
     * @param {[number]} results A list of team indexes sorted based on placement where the best team is first.
     * @param {Date} date The time of the match.
     * @returns {Game} The game that was added to the rating system.
     */
    addGameWithoutScore(teams, results, date){
        date=date.setUTCHours(0, 0, 0, 0);

        let teamsIds=[];

        teams.forEach((team, teamIndex)=>{
            teamsIds.push([]);
            team.forEach((player, playerIndex)=>{
                teamsIds[teamIndex].push(player.getId());
            });
        });
        
        let game={
            date: date.valueOf(),
            teams: teamsIds,
            isScore: false,
            results: results
        };
        return this.#addGame(game);
    }

    /**
     * Removes a game from the leaderboard.
     * @param {Game} game
     */
    removeGame(game){
        let games=this.#data.games;
        let players=this.#data.players;
        let ratingDays=this.#data.ratingDays;

        game.getTeams().forEach(team=>{team.forEach(player=>{
            let playerRatingDays=player.getRatingDays();
            let ratingDayIndex=playerRatingDays.findIndex(x=>{return x.getDate().valueOf()===game.getDate().valueOf();});
            let ratingDay=playerRatingDays[ratingDayIndex];
            let nextRatingDay=ratingDayIndex>=playerRatingDays.length-1 ? undefined : playerRatingDays[ratingDayIndex+1];

            let ratingDayGames=ratingDay.getGames();
            let _index=ratingDayGames.findIndex(x=>{return x.getId()===game.getId()});
            ratingDays[ratingDay.getId()].games.splice(_index, 1);

            if(ratingDayGames.length===1){
                let hasPrior=ratingDays[ratingDay.getId()].hasPrior;
                if(nextRatingDay!==undefined && !nextRatingDay.hasPrior()) nextRatingDay.setHasPrior(hasPrior);
                
                delete ratingDays[ratingDay.getId()];
                let ratingDaysRatingDayIdIndex=ratingDays.ids.findIndex(x=>{return x===ratingDay.getId();});
                ratingDays.ids.splice(ratingDaysRatingDayIdIndex, 1);
                let playerObj=players[player.getId()];
                let playerRatingDayIdIndex=playerObj.ratingDays.findIndex(x=>{return x===ratingDay.getId();});
                playerObj.ratingDays.splice(playerRatingDayIdIndex, 1);

                if(player.getRatingDays().length===0){
                    this.removePlayer(player);
                }
            }
        });});

        delete games[game.getId()];
        let index=games.ids.findIndex(x=>{return x==game.getId();});
        games.ids.splice(index, 1);
    }

    /**
     * Updates ratings and manages the leaderboard.
     * @param {()=>{}} ratingUpdateFunction A function that updates ratings. ex. ()=>{whr.fullIteration(ratingSystem, 10);}.
     */
    ratingUpdate(ratingUpdateFunction){
        ratingUpdateFunction();
        
        this.getPlayers().forEach(player=>{
            if(player.getUntilRated()>this.#data.config.gameNumUntilRated){
                player.setUntilRated(this.#data.config.gameNumUntilRated);
            }

            if(player.getSigma()>leaderboardRating.getSigma0(this.#data.config.prior)){
                player.setIsArchived(true);
            }
        });
        
        this.#data.players.ids.sort((playerId1, playerId2)=>{
            let player1=new Player(this.#data, playerId1);
            let player2=new Player(this.#data, playerId2);
            if(player1.getRL()===undefined || player1.getUntilRated()!==0){
                if(player2.getRL()===undefined || player2.getUntilRated()!==0){
                    return 0;
                }
                else{
                    return 1;
                }
            }
            else if(player2.getRL()===undefined || player2.getUntilRated()!==0){
                return -1;
            }
            else{
                return player2.getRL()-player1.getRL();
            }
        });
    }

    /**
     * Starts a new season and clears out the leaderboard while keeping rating data.
     */
    startNewSeason(){
        this.getPlayers().forEach(player=>{
            player.setUntilRated(this.#data.config.gameNumUntilRated);
        });

        this.#data.config.seasonNum++;
    }

    /**
     * @param {number} maximumNumOfGames 
     */
    updateMaxGameNum(maximumNumOfGames){
        let games=this.#data.games;
        
        this.#data.config.maximumNumOfGames=maximumNumOfGames;
        
        while(!this.#data.config.infiniteGames && games.ids.length>this.#data.config.maximumNumOfGames){
            this.removeGame(new Game(this.#data, games.ids[0]));
            this.#data.config.deletedGames++;
        }
    }

    /**
     * Adds a game to the leaderboard, adds the match to the player's rating day, 
     * and removes a match if the match limit is exceeded.
     * @param {game object}
     * @returns {Game} The game that was added to the rating system.
     */
    #addGame(game){
        let games=this.#data.games;
        let players=this.#data.players;
        let ratingDays=this.#data.ratingDays;
        
        let duplicates=false;
        game.teams.forEach(team1=>{team1.forEach(playerId1=>{
            let count=0;
            game.teams.forEach(team2=>{team2.forEach(playerId2=>{
                if(playerId1==playerId2 && !duplicates)
                    count++;
            });});
            if(count>1)
                duplicates=true;
        });});
        if(duplicates){
            console.log("Game rejected due to duplicate player ids.");
            return;
        }
        
        let gameId=games.nextId;
        games[gameId]=game;
        games.ids.push(gameId);
        games.nextId++;

        let gameIndex=games.ids.length-1;
        while(gameIndex>0 && games[gameId].date<games[games.ids[gameIndex-1]].date){
            games.ids[gameIndex]=games.ids[gameIndex-1];
            games.ids[gameIndex-1]=gameId;
            gameIndex--;
        }
        
        game.teamsRatingDays=[];
        game.teams.forEach((team, teamIndex)=>{
            game.teamsRatingDays.push([]);
            team.forEach(playerId=>{
                let player=players[playerId];
                let ratingDayId=player.ratingDays.find(x=>{return ratingDays[x].date===game.date;});
                let ratingDay;

                if(ratingDayId===undefined){
                    ratingDay={
                        date: game.date,
                        r: 0,
                        hasPrior: player.ratingDays.length===0,
                        games: [gameId]
                    };
                    player.ratingDays.push(ratingDays.nextId);
                    
                    for(let i=player.ratingDays.length-2; i>=0; i--){
                        let previousRatingDay=ratingDays[player.ratingDays[i]];
                        if(ratingDay.date<previousRatingDay.date){
                            let hold=player.ratingDays[i];
                            player.ratingDays[i]=player.ratingDays[i+1];
                            player.ratingDays[i+1]=hold;
                        }
                        else{
                            ratingDay.r=previousRatingDay.r;
                        }
                    }

                    ratingDayId=ratingDays.nextId;
                    ratingDays[ratingDayId]=ratingDay;
                    ratingDays.ids.push(ratingDayId);
                    ratingDays.nextId++;
                }
                else{
                    ratingDay=ratingDays[ratingDayId];
                    ratingDay.games.push(gameId);
                }

                game.teamsRatingDays[teamIndex].push(ratingDayId);
            });
        });

        let gameInstance=new Game(this.#data, gameId);
        gameInstance.getTeams().forEach((team, teamIndex)=>{
            team.forEach((player, playerIndex)=>{
                if(player.getIsArchived() && gameInstance.getDate().valueOf()>=player.getUnarchivedDate().valueOf()){
                    player.setIsArchived(false);
                    player.setUnarchivedDate(gameInstance.getDate().valueOf());
                    gameInstance.getTeamsRatingDays()[teamIndex][playerIndex].setHasPrior(true);
                }
                
                let threshold=this.#data.config.ratedThreshold*leaderboardRating.getSigma0(this.#data.config.prior);
                    
                if(player.getUntilRated()>0){
                    player.setUntilRated(player.getUntilRated()-1);

                    if(player.getUntilRated()===0){
                        if(player.getSigma()>threshold){
                            player.setUntilRated(-1);
                        }
                    }
                }
                else if(player.getUntilRated()===-1 && player.getSigma()<=threshold){
                    player.setUntilRated(0);
                }
            });
        });
        
        while(!this.#data.config.infiniteGames && games.ids.length>this.#data.config.maximumNumOfGames){
            this.removeGame(new Game(this.#data, games.ids[0]));
            this.#data.config.deletedGames++;
        }

        return new Game(this.#data, gameId);
    }
}

//lol
index.initialize();
