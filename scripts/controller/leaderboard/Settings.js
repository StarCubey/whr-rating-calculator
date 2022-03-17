let settings=new class Settings{
    initialize(){
        this.restore();
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

    onNewSeasonButtonClick(){
        if(window.confirm("Are you sure you want to start a new season? Everyone will be set to unrated. This action can't be undone.")){
            index.ratingSystem.startNewSeason();
        }
    }

    onInfiniteGamesCheckboxClick(){
        document.getElementById("maximum-number-of-games").disabled=document.getElementById("infinite-games").checked;
    }

    onInfinitePlayersCheckboxClick(){
        document.getElementById("maximum-number-of-players").disabled=document.getElementById("infinite-players").checked;
    }
    
    onApplySettingsButtonClick(){
        if(window.confirm("Are you sure you want to use these settings?")){
            let prior=document.getElementById("prior").value;
            if(prior!=="" && Number(prior)>=0){
                index.ratingSystem.getConfig().prior=Number(prior);
            }

            //TODO

            this.restore();
        }
    }

    restore(){
        document.getElementById("prior").value=index.ratingSystem.getConfig().prior;
        document.getElementById("w").value=index.ratingSystem.getConfig().w;

        document.getElementById("mean-rating").value=index.ratingSystem.getConfig().meanRating;
        document.getElementById("rating-scale").value=index.ratingSystem.getConfig().ratingScale;
        document.getElementById("until-rated").value=index.ratingSystem.getConfig().gameNumUntilRated;
        document.getElementById("full-iterations-for-each-game").checked=index.ratingSystem.getConfig().fullIterationsForEachDay;
        document.getElementById("iterations-per-game").value=index.ratingSystem.getConfig().partialIterationNum;

        let infiniteGames=index.ratingSystem.getConfig().infiniteGames;
        document.getElementById("infinite-games").checked=infiniteGames;
        document.getElementById("maximum-number-of-games").disabled=infiniteGames;

        document.getElementById("maximum-number-of-games").value=index.ratingSystem.getConfig().maximumNumOfGames;

        let infinitePlayers=index.ratingSystem.getConfig().infinitePlayers;
        document.getElementById("infinite-players").checked=infinitePlayers;
        document.getElementById("maximum-number-of-players").disabled=infinitePlayers;

        document.getElementById("maximum-number-of-players").value=index.ratingSystem.getConfig().maximumNumOfPlayers;
        
        document.getElementById("character-limit").value=index.ratingSystem.getConfig().characterLimit;
        document.getElementById("escape-discord-markdown").checked=index.ratingSystem.getConfig().escapeDiscordMarkdown;
    }
}
