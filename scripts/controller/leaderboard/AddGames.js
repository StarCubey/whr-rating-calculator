let addGames=new class AddGames{
    players;
    sessionMatchList="";
    lastMatchString="";
    escChars=["\\", "*", "_", "~", "`", ">", ":"];

    initialize(){
        this.players=index.ratingSystem.getPlayers();

        let playerList=document.getElementById("player-list");
        this.players.forEach(player=>{
            let option=document.createElement("option");
            option.setAttribute("value", player.getName());
            playerList.appendChild(option);
        });

        if(this.sessionMatchList!=="") document.getElementById("match-log").innerHTML=this.sessionMatchList;
        
        let today=new Date();
        let date=String(today.getUTCDate());
        if(date.length===1) date="0"+date;
        let month=String(today.getUTCMonth()+1);
        if(month.length===1) month="0"+month;
        document.getElementById("match-date").value=today.getUTCFullYear()+"-"+month+"-"+date;

        document.getElementById("game-mode").value=index.ratingSystem.getConfig().lastGameMode;
        document.getElementById("is-score").value=index.ratingSystem.getConfig().lastScoreMode;
        this.#updateScoreInputBoxes();
    }

    onBackButtonClick(){
        let xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange=function(){
            if (this.readyState==4 && this.status==200) {
                document.documentElement.innerHTML=this.responseText;
                mainMenu.initialize();
            }
        };
        xhttp.open("GET", "./main-menu.html", true);
        xhttp.send();
    }

    onCopyLastMatchButtonClick(){
        let output=this.lastMatchString;
        
        if(index.ratingSystem.getConfig().escapeDiscordMarkdown){
            this.escChars.forEach(escChar=>{
                output=output.split(escChar).join("\\"+escChar);
            });
        }
        navigator.clipboard.writeText(output);
    }

    onCopyAllMatchesButtonClick(){
        let output=this.sessionMatchList.split("<br>").join("\n");
        
        if(index.ratingSystem.getConfig().escapeDiscordMarkdown){
            this.escChars.forEach(escChar=>{
                output=output.split(escChar).join("\\"+escChar);
            });
        }
        navigator.clipboard.writeText(output);
    }

    onGameModeChange(){
        this.#updateScoreInputBoxes();

        index.ratingSystem.getConfig().lastGameMode=document.getElementById("game-mode").value;
    }

    onIsScoreChange(){
        this.#updateScoreInputBoxes();

        index.ratingSystem.getConfig().lastScoreMode=document.getElementById("is-score").value;
    }

    addPlayer(isScore){
        let scores=document.getElementById("scores");
        let children=scores.children;

        let addRemoveButtons=document.createElement("p");
        addRemoveButtons.innerHTML=children[children.length-1].innerHTML;
        
        if(!isScore){
            children[children.length-1].innerHTML='#'+children.length+' player: <input type="text" id="player-'+children.length+'" list="player-list">';
        }
        else{
            children[children.length-1].innerHTML=
                'Player '+children.length+': <input type="text" id="player-'+children.length+'" list="player-list"><br>'+
                'Score: <input type="number" id="player-'+children.length+'-score" value="0">';
        }
        
        scores.appendChild(addRemoveButtons);
    }

    removePlayer(){
        let scores=document.getElementById("scores");
        let children=scores.children;
        if(children.length>2) scores.removeChild(children[children.length-2]);
    }

    addTeam(isScore){
        let scores=document.getElementById("scores");
        let children=scores.children;
        
        let addRemoveButtons=document.createElement("p");
        addRemoveButtons.innerHTML=children[children.length-1].innerHTML;

        if(!isScore){
            children[children.length-1].innerHTML=
                '#'+children.length+' Team<br>'+
                'Player 1: <input type="text" id="team-'+children.length+'-player-1" list="player-list"><br>'+
                'Player 2: <input type="text" id="team-'+children.length+'-player-2" list="player-list"><br>'+
                '<a id="team-'+children.length+'-add-player" href="#team-'+children.length+'-add-player" onclick="addGames.addPlayerToTeam('+children.length+', false)">Add player</a> '+
                '<a href="#team-'+children.length+'-add-player" onclick="addGames.removePlayerFromTeam('+children.length+', false)">Remove player</a>';
        }
        else{
            children[children.length-1].innerHTML=
                'Team '+children.length+'<br>'+
                'Score: <input type="number" id="team-'+children.length+'-score" value="0"><br>'+
                'Player 1: <input type="text" id="team-'+children.length+'-player-1" list="player-list"><br>'+
                'Player 2: <input type="text" id="team-'+children.length+'-player-2" list="player-list"><br>'+
                '<a id="team-'+children.length+'-add-player" href="#team-'+children.length+'-add-player" onclick="addGames.addPlayerToTeam('+children.length+', true)">Add player</a> '+
                '<a href="#team-'+children.length+'-add-player" onclick="addGames.removePlayerFromTeam('+children.length+', true)">Remove player</a>';
        }

        scores.appendChild(addRemoveButtons);
    }

    removeTeam(){
        this.removePlayer();
    }
    
    addPlayerToTeam(teamNum, isScore){
        let teamP=document.getElementById("scores").children[teamNum-1];
        let lines=teamP.innerHTML.split("<br>");
        let addRemoveButtons=lines[lines.length-1];

        let playerNames=[];
        let i=0;
        while(document.getElementById("team-"+teamNum+"-player-"+(i+1))!==null){
            playerNames[i]=document.getElementById("team-"+teamNum+"-player-"+(i+1)).value;
            i++;
        }

        if(!isScore){
            lines[lines.length-1]='Player '+(lines.length-1)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-1)+'" list="player-list">';
        }
        else{
            lines[lines.length-1]='Player '+(lines.length-2)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-2)+'" list="player-list">';
        }

        lines.push(addRemoveButtons);
        teamP.innerHTML=lines.join("<br>");

        playerNames.forEach((playerName, i)=>{
            document.getElementById("team-"+teamNum+"-player-"+(i+1)).value=playerName;
        });
    }

    removePlayerFromTeam(teamNum, isScore){
        let teamP=document.getElementById("scores").children[teamNum-1];
        let lines=teamP.innerHTML.split("<br>");
        let addRemoveButtons=lines[lines.length-1];

        let playerNames=[];
        let i=0;
        while(document.getElementById("team-"+teamNum+"-player-"+(i+1))!==null){
            playerNames[i]=document.getElementById("team-"+teamNum+"-player-"+(i+1)).value;
            i++;
        }
        
        if((!isScore&&lines.length>3) || (isScore&&lines.length>4)){
            lines.pop();
            lines[lines.length-1]=addRemoveButtons;
            teamP.innerHTML=lines.join("<br>");
        }

        for(let i=0; i<playerNames.length-1; i++){
            document.getElementById("team-"+teamNum+"-player-"+(i+1)).value=playerNames[i];
        }
    }

    onAddGameButtonClick(){
        let matchDate=new Date(document.getElementById("match-date").value);
        let gameModeInput=document.getElementById("game-mode");
        let isScoreInput=document.getElementById("is-score");
        
        let teamsAndResults=this.#getTeamsAndResults();
        if(teamsAndResults===undefined) return;
        let teams=teamsAndResults.teams;
        let oldRatings=teamsAndResults.oldRatings;
        let results=teamsAndResults.results;

        let matchPlayers=[];
        teams.forEach(team=>{
            matchPlayers=matchPlayers.concat(team);
        });

        if(isScoreInput.value==="Score"){
            index.ratingSystem.addGameWithScore(teams, results, matchDate);
        }
        else{
            index.ratingSystem.addGameWithoutScore(teams, results, matchDate);
        }
        
        index.ratingSystem.ratingUpdate(()=>{
            if(!index.ratingSystem.getConfig().fullIterationsForEachGame){
                whr.partialIteration(index.ratingSystem, matchPlayers, index.ratingSystem.getConfig().iterationNum);
            }
            else{
                whr.fullIteration(index.ratingSystem, index.ratingSystem.getConfig().iterationNum);
            }
        });

        let rlChangeStrings=[];
        teams.forEach((team, teamNum)=>{
            rlChangeStrings.push([]);
            team.forEach((player, playerNum)=>{
                if(player.getUntilRated()>0){
                    let gameNumUntilRated=index.ratingSystem.getConfig().gameNumUntilRated;
                    rlChangeStrings[teamNum].push("("+(gameNumUntilRated-player.getUntilRated())+"/"+gameNumUntilRated+" games until rated)");
                }
                else{
                    let oldRating=oldRatings[teamNum][playerNum];
                    if(oldRating===undefined){
                        rlChangeStrings[teamNum].push("(unrated→"+Math.round(player.getRL())+")");
                    }
                    else{
                        let ratingDifference=Math.round(player.getRL())-Math.round(oldRating);
                        rlChangeStrings[teamNum].push("("+Math.round(oldRating)+"→"+Math.round(player.getRL())+", "+(ratingDifference>=0?"+":"")+ratingDifference+")");
                    }
                }
            });
        });

        this.lastMatchString="";
        let matchNum=index.ratingSystem.getGamesLength()+index.ratingSystem.getConfig().deletedGames;
        if(gameModeInput.value==="1v1"){
            if(isScoreInput.value==="No score"){
                this.lastMatchString+=
                    "Match #"+matchNum+"\n"+
                    "Winner: "+teams[0][0].getName()+" "+rlChangeStrings[0][0]+"\n"+
                    "Loser: "+teams[1][0].getName()+" "+rlChangeStrings[1][0];
            }
            else if(isScoreInput.value==="Score"){
                this.lastMatchString+=
                    "Match #"+matchNum+"\n"+
                    teams[0][0].getName()+" "+rlChangeStrings[0][0]+" vs\n"+
                    teams[1][0].getName()+" "+rlChangeStrings[1][0]+"\n"+
                    results[0]+" - "+results[1];
            }
        }
        else if(gameModeInput.value==="Teams"){
            if(isScoreInput.value==="No score"){
                this.lastMatchString+="Match #"+matchNum+"\n";
                teams.forEach((team, teamNum)=>{
                    this.lastMatchString+="#"+(teamNum+1)+" team\n";
                    team.forEach((player, playerNum)=>{
                        this.lastMatchString+=player.getName()+" "+rlChangeStrings[teamNum][playerNum]+"\n";
                    });
                });
                this.lastMatchString=this.lastMatchString.substring(0, this.lastMatchString.length-1);
            }
            else if(isScoreInput.value==="Score"){
                this.lastMatchString+="Match #"+matchNum+"\n";
                teams.forEach((team, teamNum)=>{
                    this.lastMatchString+="Team "+(teamNum+1)+", Score: "+results[teamNum]+"\n";
                    team.forEach((player, playerNum)=>{
                        this.lastMatchString+=player.getName()+" "+rlChangeStrings[teamNum][playerNum]+"\n";
                    });
                });
                this.lastMatchString=this.lastMatchString.substring(0, this.lastMatchString.length-1);
            }
        }
        else if(gameModeInput.value==="FFA"){
            if(isScoreInput.value==="No score"){
                this.lastMatchString+="Match #"+matchNum+"\n";
                teams.forEach((team, teamNum)=>{
                    this.lastMatchString+="#"+(teamNum+1)+": "+team[0].getName()+" "+rlChangeStrings[teamNum][0]+"\n";
                });
                this.lastMatchString=this.lastMatchString.substring(0, this.lastMatchString.length-1);
            }
            else if(isScoreInput.value==="Score"){
                this.lastMatchString+="Match #"+matchNum+"\n";
                teams.forEach((team, teamNum)=>{
                    this.lastMatchString+=
                        team[0].getName()+" "+rlChangeStrings[teamNum][0]+"\n"+
                        "Score: "+results[teamNum]+"\n";
                });
                this.lastMatchString=this.lastMatchString.substring(0, this.lastMatchString.length-1);
            }
        }
        
        let matchStringHTML=this.lastMatchString.split("\n").join("<br>");
        this.sessionMatchList=matchStringHTML+"<br><br>"+this.sessionMatchList;
        document.getElementById("match-log").innerHTML=this.sessionMatchList;

        this.#updateScoreInputBoxes();
    }

    #updateScoreInputBoxes(){
        let scores=document.getElementById("scores");
        let gameModeInput=document.getElementById("game-mode");
        let isScoreInput=document.getElementById("is-score");

        scores.innerHTML="";

        if(gameModeInput.value==="1v1"){
            if(isScoreInput.value==="No score"){
                scores.innerHTML='<p>Winner: <input type="text" id="player-1" list="player-list"></p>'+
                    '<p>Loser: <input type="text" id="player-2" list="player-list"></p>';
            }
            else if(isScoreInput.value==="Score"){
                scores.innerHTML=
                    '<p>'+
                        'Player 1: <input type="text" id="player-1" list="player-list"><br>'+
                        'Score: <input type="number" id="player-1-score" value="0">'+
                    '</p>'+
                    '<p>'+
                        'Player 2: <input type="text" id="player-2" list="player-list"><br>'+
                        'Score: <input type="number" id="player-2-score" value="0">'+
                    '</p>';
            }
        }
        else if(gameModeInput.value==="Teams"){
            if(isScoreInput.value==="No score"){
                scores.innerHTML=
                    '<p>'+
                        '#1 Team<br>'+
                        'Player 1: <input type="text" id="team-1-player-1" list="player-list"><br>'+
                        'Player 2: <input type="text" id="team-1-player-2" list="player-list"><br>'+
                        '<a id="team-1-add-player" href="#team-1-add-player" onclick="addGames.addPlayerToTeam(1, false)">Add player</a> '+
                        '<a href="#team-1-add-player" onclick="addGames.removePlayerFromTeam(1, false)">Remove player</a>'+
                    '</p>'+
                    '<p>'+
                        '#2 Team<br>'+
                        'Player 1: <input type="text" id="team-2-player-1" list="player-list"><br>'+
                        'Player 2: <input type="text" id="team-2-player-2" list="player-list"><br>'+
                        '<a id="team-2-add-player" href="#team-2-add-player" onclick="addGames.addPlayerToTeam(2, false)">Add player</a> '+
                        '<a href="#team-2-add-player" onclick="addGames.removePlayerFromTeam(2, false)">Remove player</a>'+
                    '</p>'+
                    '<p>'+
                        '<a id="add-team" href="#add-team" onclick="addGames.addTeam(false)">Add team</a> '+
                        '<a href="#add-team" onclick="addGames.removeTeam()">Remove team</a>'+
                    '</p>';
            }
            else if(isScoreInput.value==="Score"){
                scores.innerHTML=
                    '<p>'+
                        'Team 1<br>'+
                        'Score: <input type="number" id="team-1-score" value="0"><br>'+
                        'Player 1: <input type="text" id="team-1-player-1" list="player-list"><br>'+
                        'Player 2: <input type="text" id="team-1-player-2" list="player-list"><br>'+
                        '<a id="team-1-add-player" href="#team-1-add-player" onclick="addGames.addPlayerToTeam(1, true)">Add player</a> '+
                        '<a href="#team-1-add-player" onclick="addGames.removePlayerFromTeam(1, true)">Remove player</a>'+
                    '</p>'+
                    '<p>'+
                        'Team 2<br>'+
                        'Score: <input type="number" id="team-2-score" value="0"><br>'+
                        'Player 1: <input type="text" id="team-2-player-1" list="player-list"><br>'+
                        'Player 2: <input type="text" id="team-2-player-2" list="player-list"><br>'+
                        '<a id="team-2-add-player" href="#team-2-add-player" onclick="addGames.addPlayerToTeam(2, true)">Add player</a> '+
                        '<a href="#team-2-add-player" onclick="addGames.removePlayerFromTeam(2, true)">Remove player</a>'+
                    '</p>'+
                    '<p>'+
                        '<a id="add-team" href="#add-team" onclick="addGames.addTeam(true)">Add team</a> '+
                        '<a href="#add-team" onclick="addGames.removeTeam()">Remove team</a>'+
                    '</p>';
            }
        }
        else if(gameModeInput.value==="FFA"){
            if(isScoreInput.value==="No score"){
                scores.innerHTML=
                    '<p>#1 player: <input type="text" id="player-1" list="player-list"></p>'+
                    '<p>#2 player: <input type="text" id="player-2" list="player-list"></p>'+
                    '<p>'+
                        '<a id="add-player" href="#add-player" onclick="addGames.addPlayer(false)">Add player</a> '+
                        '<a href="#add-player" onclick="addGames.removePlayer()">Remove player</a>'+
                    '</p>';
            }
            else if(isScoreInput.value==="Score"){
                scores.innerHTML=
                    '<p>'+
                        'Player 1: <input type="text" id="player-1" list="player-list"><br>'+
                        'Score: <input type="number" id="player-1-score" value="0">'+
                    '</p>'+
                    '<p>'+
                        'Player 2: <input type="text" id="player-2" list="player-list"><br>'+
                        'Score: <input type="number" id="player-2-score" value="0">'+
                    '</p>'+
                    '<p>'+
                        '<a id="add-player" href="#add-player" onclick="addGames.addPlayer(true)">Add player</a> '+
                        '<a href="#add-player" onclick="addGames.removePlayer()">Remove player</a>'+
                    '</p>';
            }
        }
    }

    /**
     * Gets teams, results, and old ratings. Old ratings is a 2d array of ratings from each player on each team. Elements of oldRatings are undefined if the player is unrated or doesn't have a valid rating.
     * Adds players to the rating system if necissary. Returns undefined if there is an error.
     * @returns {{teams: [[Player]], oldRatings: [number], results: [number]}}
     */
    #getTeamsAndResults(){
        let gameModeInput=document.getElementById("game-mode");
        let isScoreInput=document.getElementById("is-score");
        
        let teams=[];
        let oldRatings=[];
        let newPlayers=[];
        let hasDuplicate=false;
        let hasBlank=false;
        if(gameModeInput.value==="1v1" || gameModeInput.value==="FFA"){
            let playerNum=1;
            while(document.getElementById("player-"+playerNum)!==null){
                let playerName=document.getElementById("player-"+playerNum).value;

                if(playerName===""){
                    hasBlank=true;
                    break;
                }

                hasDuplicate=teams.find(x=>{return x.find(x=>x.getName()===playerName);})!==undefined;
                if(hasDuplicate) break;

                let player=this.players.find(x=>x.getName()===playerName);
                if(player===undefined){
                    player=index.ratingSystem.addPlayer(playerName);
                    newPlayers.push(player);
                }

                teams.push([player]);
                if(player.getUntilRated()===0) oldRatings.push([player.getRL()]);
                else oldRatings.push([undefined]);

                playerNum++;
            }
        }
        else if(gameModeInput.value==="Teams"){
            let teamNum=1;
            while(document.getElementById("team-"+teamNum+"-player-1")!==null){
                let playerNum=1;
                teams.push([]);
                oldRatings.push([]);
                while(document.getElementById("team-"+teamNum+"-player-"+playerNum)!==null){
                    let playerName=document.getElementById("team-"+teamNum+"-player-"+playerNum).value;

                    if(playerName===""){
                        hasBlank=true;
                        break;
                    }

                    hasDuplicate=teams.find(x=>{return x.find(x=>x.getName()===playerName);})!==undefined;
                    if(hasDuplicate) break;

                    let player=this.players.find(x=>x.getName()===playerName);
                    if(player===undefined){
                        player=index.ratingSystem.addPlayer(playerName);
                        newPlayers.push(player);
                    }

                    teams[teamNum-1].push(player);
                    if(player.getUntilRated()===0) oldRatings[teamNum-1].push(player.getRL());
                    else oldRatings[teamNum-1].push(undefined);

                    playerNum++;
                }
                if(hasDuplicate||hasBlank) break;
                
                teamNum++;
            }
        }

        let results=[];
        let hasNegative=false;
        let allZero=isScoreInput.value==="Score";
        if(isScoreInput.value==="Score"){
            if(gameModeInput.value==="1v1" || gameModeInput.value==="FFA"){
                teams.forEach((_, teamNum)=>{
                    let score=Number(document.getElementById("player-"+(teamNum+1)+"-score").value);

                    if(score<0) hasNegative=true;
                    if(score>0) allZero=false;

                    results.push(score);
                });
            }
            else if(gameModeInput.value==="Teams"){
                teams.forEach((_, teamNum)=>{
                    let score=Number(document.getElementById("team-"+(teamNum+1)+"-score").value);

                    if(score<0) hasNegative=true;
                    if(score>0) allZero=false;

                    results.push(score);
                });
            }
        }
        else{
            teams.forEach((_, teamNum)=>{
                results.push(teamNum);
            });
        }

        let error=hasBlank||hasDuplicate||hasNegative||allZero;

        if(hasBlank) window.alert("Error: Blank player name.");
        if(hasDuplicate) window.alert("Duplicate player names aren't allowed.");
        if(hasNegative && !hasBlank) window.alert("Negative scores aren't allowed");
        if(allZero && !hasBlank) window.alert("Error: All scores are set to 0.");
        
        if(!error && newPlayers.length>0 && !window.confirm(newPlayers.length+" new player(s) will be added to the rating system. Are you sure you want to continue?")){
            error=true;
        }

        if(error){
            newPlayers.forEach(player=>{
                index.ratingSystem.removePlayer(player);
            });
        }
        else{
            this.players=this.players.concat(newPlayers);

            let playerList=document.getElementById("player-list");
            newPlayers.forEach(player=>{
                let option=document.createElement("option");
                option.setAttribute("value", player.getName());
                playerList.appendChild(option);
            });
        }

        if(!error) return {teams: teams, oldRatings: oldRatings, results: results};
        else return undefined;
    }
}
