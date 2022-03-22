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

            let w=document.getElementById("w").value;
            if(w!=="" && Number(w)>0){
                index.ratingSystem.getConfig().w=Number(w);
            }

            let meanRating=document.getElementById("mean-rating").value;
            if(meanRating!==""){
                index.ratingSystem.getConfig().meanRating=Number(meanRating);
            }

            let ratingScale=document.getElementById("rating-scale").value;
            if(ratingScale!=="" && Number(ratingScale)>0){
                index.ratingSystem.getConfig().ratingScale=Number(ratingScale);
            }

            let untilRated=document.getElementById("until-rated").value;
            if(untilRated!=="" && Number(untilRated)>=0){
                index.ratingSystem.getConfig().gameNumUntilRated=Math.ceil(Number(untilRated));
            }

            index.ratingSystem.getConfig().fullIterationsForEachGame=document.getElementById("full-iterations-for-each-game").checked;

            let iterationNum=document.getElementById("iterations-per-game").value;
            if(iterationNum!=="" && Number(iterationNum)>0){
                index.ratingSystem.getConfig().iterationNum=Math.ceil(Number(iterationNum));
            }

            index.ratingSystem.getConfig().infiniteGames=document.getElementById("infinite-games").checked;

            let maximumNumOfGames=document.getElementById("maximum-number-of-games").value;
            if(maximumNumOfGames!=="" && Number(maximumNumOfGames)>0){
                index.ratingSystem.updateMaxGameNum(Math.ceil(Number(maximumNumOfGames)));
            }

            let characterLimit=document.getElementById("character-limit").value;
            if(characterLimit!=="" && Number(characterLimit)>0){
                index.ratingSystem.getConfig().characterLimit=Math.ceil(Number(characterLimit));
            }

            index.ratingSystem.getConfig().escapeDiscordMarkdown=document.getElementById("escape-discord-markdown").checked;

            this.restore();
        }
    }

    restore(){
        document.getElementById("prior").value=index.ratingSystem.getConfig().prior;
        document.getElementById("w").value=index.ratingSystem.getConfig().w;

        document.getElementById("mean-rating").value=index.ratingSystem.getConfig().meanRating;
        document.getElementById("rating-scale").value=index.ratingSystem.getConfig().ratingScale;
        document.getElementById("until-rated").value=index.ratingSystem.getConfig().gameNumUntilRated;
        document.getElementById("full-iterations-for-each-game").checked=index.ratingSystem.getConfig().fullIterationsForEachGame;
        document.getElementById("iterations-per-game").value=index.ratingSystem.getConfig().iterationNum;

        let infiniteGames=index.ratingSystem.getConfig().infiniteGames;
        document.getElementById("infinite-games").checked=infiniteGames;
        document.getElementById("maximum-number-of-games").disabled=infiniteGames;

        document.getElementById("maximum-number-of-games").value=index.ratingSystem.getConfig().maximumNumOfGames;
        
        document.getElementById("character-limit").value=index.ratingSystem.getConfig().characterLimit;
        document.getElementById("escape-discord-markdown").checked=index.ratingSystem.getConfig().escapeDiscordMarkdown;
    }
}
