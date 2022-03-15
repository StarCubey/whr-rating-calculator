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
        //TODO confirmation box, write in addGames.sessionMatchList
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

        if(mode==="1v1"){
            if(game.getIsScore()===false){
                output=
                    "Match #"+(matchNum+1)+"\n"+
                    "Winner: "+teams[0][0].getName()+"\n"+
                    "Loser: "+teams[1][0].getName();
            }
            else{
                output=
                    "Match #"+(matchNum+1)+"\n"+
                    teams[0][0].getName()+" vs\n"+
                    teams[1][0].getName()+"\n"+
                    results[0]+" - "+results[1];
            }
        }
        else if(mode==="Teams"){
            if(game.getIsScore()===false){
                output="Match #"+(matchNum+1)+"\n";
                teams.forEach((team, teamNum)=>{
                    output+="#"+(teamNum+1)+" team\n";
                    team.forEach(player=>{
                        output+=player.getName()+"\n";
                    });
                });
                output=output.substring(0, output.length-1);
            }
            else{
                output="Match #"+(matchNum+1)+"\n";
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
                output="Match #"+(matchNum+1)+"\n";
                teams.forEach((team, teamNum)=>{
                    output+="#"+(teamNum+1)+": "+team[0].getName()+"\n";
                });
                output=output.substring(0, output.length-1);
            }
            else{
                output="Match #"+(matchNum+1)+"\n";
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
        for(let i=0; i<this.matchViewCount && i<this.games.length; i++){
            //if the date is different, add the date. then add the match string with a delete button below.
            gamesString+=this.getMatchString(this.games.length-1).split("\n").join("<br>")+"<br><br>";//TODO debug
        }

        if(gamesString!=="") document.getElementById("match-data").innerHTML=gamesString;
        else document.getElementById("match-data").innerHTML="No match data.";
    }
}
