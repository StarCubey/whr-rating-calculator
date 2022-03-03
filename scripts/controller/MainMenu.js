let mainMenu=new class MainMenu{
    initialize(){
        document.getElementById("leaderboard-name").innerHTML="Leaderboard name: "+index.leaderboardName;
        document.getElementById("number-of-players").innerHTML="Number of players: "+index.ratingSystem.getPlayersLength();
        document.getElementById("number-of-games").innerHTML="Number of games: "+index.ratingSystem.getGamesLength();
    }

    onSaveButtonClick(){
        let data=index.ratingSystem.saveData();
        let name=index.leaderboardName;

        let save=document.createElement("a");
        save.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data)));
        save.setAttribute("download", name+".json");
        save.style.display="none";

        document.body.appendChild(save);
        save.click();
        document.body.removeChild(save);
    }

    onUnloadButtonClick(){
        if(!window.confirm("Are you sure you want to unload leaderboard data? Save data may be lost.")) return;

        index.ratingSystem=new RatingSystem();
        index.leaderboardName="untitled";

        let xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange=function(){
            if (this.readyState==4 && this.status==200) {
                document.documentElement.innerHTML=this.responseText;
                index.initialize();
            }
        };
        xhttp.open("GET", "./index.html", true);
        xhttp.send();
    }

    onAddGamesButtonClick(){
        let xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange=function(){
            if (this.readyState==4 && this.status==200) {
                document.documentElement.innerHTML=this.responseText;
                addGames.initialize();
            }
        };
        xhttp.open("GET", "./leaderboard/add-games.html", true);
        xhttp.send();
    }

    onViewLeaderboardButtonClick(){
        //TODO
    }

    onViewMatchDataButtonClick(){
        //TODO
    }

    onSettingsButtonClick(){
        //TODO
    }
}
