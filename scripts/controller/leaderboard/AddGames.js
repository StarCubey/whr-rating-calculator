let addGames=new class AddGames{
    players;
    sessionMatchList="";
    lastMatchString="";

    initialize(){
        this.players=index.ratingSystem.getPlayers();

        let playerList=document.getElementById("player-list");
        this.players.forEach(player=>{
            let option=document.createElement("option");
            option.setAttribute("value", player.getName());
            playerList.appendChild(option);
        });
        
        let today=new Date();
        let date=String(today.getUTCDate());
        if(date.length===1) date="0"+date;
        let month=String(today.getUTCMonth()+1);
        if(month.length===1) month="0"+month;
        document.getElementById("match-date").value=today.getUTCFullYear()+"-"+month+"-"+date;
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

    onGameModeChange(){
        this.#updateScoreInputBoxes();
    }

    onIsScoreChange(){
        this.#updateScoreInputBoxes();
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
            lines[lines.length-1]='Player '+(lines.length-1)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-1)+'">';
        }
        else{
            lines[lines.length-1]='Player '+(lines.length-2)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-2)+'">';
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
        let scores=document.getElementById("scores");
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
                oldRatings.push([player.getRL()]);

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
                    oldRatings[teamNum-1].push(player.getRL());

                    playerNum++;
                }
                if(hasDuplicate||hasBlank) break;
                
                teamNum++;
            }
        }

        let error=hasBlank||hasDuplicate;
        //if there's a duplicate, show an alert box
        //else confirmation for adding new players (otherwise, error)
        //if there is an error, new players are removed from index.ratingSystem
        //once new players are confirmed, add them to this.players (done)
        this.players=this.players.concat(newPlayers);

        let playerList=document.getElementById("player-list");
        newPlayers.forEach(player=>{
            let option=document.createElement("option");
            option.setAttribute("value", player.getName());
            playerList.appendChild(option);
        });

        //add the game
        //add to sessionMatchList and update lastMatchString
        //clear player names
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
}
