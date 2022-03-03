let addGames=new class AddGames{
    players;
    sessionMatchList="";

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
        let addRemoveButtons="<p>"+children[children.length-1].innerHTML+"</p>";
        
        if(!isScore){
            children[children.length-1].innerHTML='#'+children.length+' player: <input type="text" id="player-'+children.length+'" list="player-list">';
        }
        else{
            children[children.length-1].innerHTML=
                'Player '+children.length+': <input type="text" id="player-'+children.length+'" list="player-list"><br>'+
                'Score: <input type="number" id="player-'+children.length+'-score" value="0">';
        }
        
        scores.innerHTML+=addRemoveButtons;
    }

    removePlayer(){
        let scores=document.getElementById("scores");
        let children=scores.children;
        if(children.length>2) scores.removeChild(children[children.length-2]);
    }

    addTeam(isScore){
        let scores=document.getElementById("scores");
        let children=scores.children;
        let addRemoveButtons="<p>"+children[children.length-1].innerHTML+"</p>";

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

        scores.innerHTML+=addRemoveButtons;
    }

    removeTeam(){
        this.removePlayer();
    }
    
    addPlayerToTeam(teamNum, isScore){
        let teamP=document.getElementById("scores").children[teamNum-1];
        let lines=teamP.innerHTML.split("<br>");
        let addRemoveButtons=lines[lines.length-1];

        if(!isScore){
            lines[lines.length-1]='Player '+(lines.length-1)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-1)+'">';
        }
        else{
            lines[lines.length-1]='Player '+(lines.length-2)+': <input type="text" id="team-'+teamNum+'-player-'+(lines.length-2)+'">';
        }

        lines.push(addRemoveButtons);
        teamP.innerHTML=lines.join("<br>");
    }

    removePlayerFromTeam(teamNum, isScore){
        let teamP=document.getElementById("scores").children[teamNum-1];
        let lines=teamP.innerHTML.split("<br>");
        let addRemoveButtons=lines[lines.length-1];

        if((!isScore&&lines.length>3) || (isScore&&lines.length>4)){
            lines.pop();
            lines[lines.length-1]=addRemoveButtons;
            teamP.innerHTML=lines.join("<br>");
        }
    }

    onAddGameButtonClick(){
        //add the game
        //add to sessionMatchList
        //clear player names
    }

    #updateScoreInputBoxes(){
        let scores=document.getElementById("scores");
        let gameModeInput=document.getElementById("game-mode");
        let isScoreInput=document.getElementById("is-score");

        scores.innerHTML="";

        if(gameModeInput.value==="1v1"){
            if(isScoreInput.value==="No score"){
                scores.innerHTML='<p>Winner: <input type="text" id="player-1"></p>'+
                    '<p>Loser: <input type="text" id="player-2"></p>';
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
