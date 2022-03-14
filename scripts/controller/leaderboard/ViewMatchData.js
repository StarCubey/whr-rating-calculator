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

    getMatchString(){
        //TODO
        //similar to addGames.onAddGameButtonClick() except no rating change, <br> for line breaks, and you have to figure out if a game is 1v1, FFA or teams based on the game data.
        //use \n, then convert to <br> in #updateMatchData()
    }

    #updateMatchData(){
        let gamesString="";
        for(let i=0; i<this.matchViewCount && i<this.games.length; i++){
            //if the date is different, add the date. then add the match string with a delete button below.
        }

        if(gameString!=="") document.getElementById("match-data").innerHTML=gamesString;
        else document.getElementById("match-data").innerHTML="No match data.";
    }
}
