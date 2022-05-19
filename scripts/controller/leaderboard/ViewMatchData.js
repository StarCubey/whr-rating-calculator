let viewMatchData=new class ViewMatchData{
    games;
    matchViewCount;
    
    initialize(){
        this.games=index.ratingSystem.getGames();
        
        this.matchViewCount=20;
        this.#updateMatchData();
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

    onDeleteMatchButtonClick(matchNum){
        if(window.confirm("Are you sure you want to delete this match? This action can't be undone.")){
            let teams=this.games[matchNum].getTeams();
            let matchPlayers=[];
            teams.forEach(team=>{
                matchPlayers=matchPlayers.concat(team);
            });
            
            index.ratingSystem.removeGame(this.games[matchNum]);
            this.games.splice(matchNum, 1);
            this.#updateMatchData();

            matchPlayers.forEach((player, index)=>{
                try{
                    player.getName();
                }
                catch{
                    matchPlayers.splice(index);
                }
            });

            index.ratingSystem.ratingUpdate(()=>{
                if(!index.ratingSystem.getConfig().fullIterationsForEachGame){
                    whr.partialIteration(index.ratingSystem, matchPlayers, index.ratingSystem.getConfig().iterationNum);
                }
                else{
                    whr.fullIteration(index.ratingSystem, index.ratingSystem.getConfig().iterationNum);
                }
            });

            addGames.sessionMatchList="Match "+(matchNum+index.ratingSystem.getConfig().deletedGames+1)+" was deleted.<br><br>"+addGames.sessionMatchList;
        }
    }

    onShowMoreButtonClick(){
        if(this.matchViewCount<this.games.length){
            this.matchViewCount+=20;
            this.#updateMatchData();
        }
    }

    onShowLessButtonClick(){
        if(this.matchViewCount>20){
            this.matchViewCount-=20;
            this.#updateMatchData();
        }
    }

    /**
     * @param {number} matchNum 
     * @returns {string}
     */
    getMatchString(matchNum){
        let output="";

        let game=this.games[matchNum];
        let teams=game.getTeams();
        let results=game.getResults();
        let isTeams=false;
        teams.forEach(team=>{
            if(team.length>1){
                isTeams=true;
                return;
            }
        });

        let mode="";
        if(isTeams){
            mode="Teams";
        }
        else{
            if(teams.length>2){
                mode="FFA";
            }
            else{
                mode="1v1";
            }
        }

        let labelNum=matchNum+index.ratingSystem.getConfig().deletedGames+1;
        if(mode==="1v1"){
            if(game.getIsScore()===false){
                output=
                    "Match #"+labelNum+"\n"+
                    "Winner: "+teams[0][0].getName()+"\n"+
                    "Loser: "+teams[1][0].getName();
            }
            else{
                output=
                    "Match #"+labelNum+"\n"+
                    teams[0][0].getName()+" vs\n"+
                    teams[1][0].getName()+"\n"+
                    results[0]+" - "+results[1];
            }
        }
        else if(mode==="Teams"){
            if(game.getIsScore()===false){
                output="Match #"+labelNum+"\n";
                teams.forEach((team, teamNum)=>{
                    output+="#"+(teamNum+1)+" team\n";
                    team.forEach(player=>{
                        output+=player.getName()+"\n";
                    });
                });
                output=output.substring(0, output.length-1);
            }
            else{
                output="Match #"+labelNum+"\n";
                teams.forEach((team, teamNum)=>{
                    output+="Team "+(teamNum+1)+", Score: "+results[teamNum]+"\n";
                    team.forEach(player=>{
                        output+=player.getName()+"\n";
                    });
                });
                output=output.substring(0, output.length-1);
            }
        }
        else if(mode==="FFA"){
            if(game.getIsScore()===false){
                output="Match #"+labelNum+"\n";
                teams.forEach((team, teamNum)=>{
                    output+="#"+(teamNum+1)+": "+team[0].getName()+"\n";
                });
                output=output.substring(0, output.length-1);
            }
            else{
                output="Match #"+labelNum+"\n";
                teams.forEach((team, teamNum)=>{
                    output+=
                        team[0].getName()+"\n"+
                        "Score: "+results[teamNum]+"\n";
                });
                output=output.substring(0, output.length-1);
            }
        }

        return output;
    }

    #updateMatchData(){
        let gamesString="";
        let date=null;
        for(let i=0; i<this.matchViewCount && i<this.games.length; i++){
            let matchNum=this.games.length-1-i;
            
            if(date===null || date.valueOf()!==this.games[matchNum].getDate().valueOf()){
                date=this.games[matchNum].getDate();
                
                let dateStringSplit=date.toUTCString().split(" ");
                dateStringSplit.splice(4, 2);
                let dateString=dateStringSplit.join(" ");

                gamesString+="<strong>"+dateString+"</strong><br><br>";
            }
            gamesString+=
                this.getMatchString(matchNum).split('\n').join('<br>')+'<br>'+
                '<a id="delete-'+(matchNum+1)+'" href="#delete-'+(matchNum+1)+'" onclick="viewMatchData.onDeleteMatchButtonClick('+matchNum+')">Delete match</a><br><br>';
        }

        if(gamesString!=="") document.getElementById("match-data").innerHTML=gamesString;
        else document.getElementById("match-data").innerHTML="No match data.";
    }
}
