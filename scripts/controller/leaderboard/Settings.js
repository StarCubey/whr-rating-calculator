let settings=new class Settings{
    initialize(){
        this.defaultGroupNames=["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grand Master"];
        this.defaultMinRatings=[-2, -1, 0, 1, 2, 3];

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

    onAddGroupClick(){
        let meanRating=index.ratingSystem.getConfig().meanRating;
        let ratingScale=index.ratingSystem.getConfig().ratingScale;
        
        let newGroupName="";
        if(this.ratingGroups.length<this.defaultGroupNames.length)
            newGroupName=this.defaultGroupNames[this.ratingGroups.length];
        else
            newGroupName="Group "+(this.ratingGroups.length+1);

        let newMinRating=meanRating;
        if(this.groupMinRatings.length<this.defaultMinRatings.length)
            newMinRating=(this.defaultMinRatings[this.groupMinRatings.length]*ratingScale)+meanRating;

        this.ratingGroups.push(newGroupName);
        this.groupMinRatings.push(newMinRating);
        this.groupMinGames.push(0);
        this.updateRatingGroupSettings();
    }

    onRemoveGroupClick(){
        if(this.ratingGroups.length<=1) return;

        this.ratingGroups.pop();
        this.groupMinRatings.pop();
        this.groupMinGames.pop();
        this.updateRatingGroupSettings();
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

            let ratingGroups=[];
            let i=0;
            let ratingGroup=document.getElementById("group-0-name");
            while(ratingGroup && this.ratingGroups[i]!==undefined){
                if(ratingGroups.find(x=>x===ratingGroup.value)){
                    window.alert("Error: Duplicate rating group name.");
                    return;
                }
                ratingGroups.push(ratingGroup.value);
                i++;
                ratingGroup=document.getElementById("group-"+i+"-name");
            }
            let groupNum=ratingGroups.length;

            let groupMinRatings=[];
            i=1;
            let minRating=document.getElementById("group-1-min-rating");
            while(minRating){
                minRating=Number(minRating.value);
                if(Number.isNaN(minRating)){
                    window.alert("Error: Invalid group minimum rating.");
                    return;
                }
                if(minRating<groupMinRatings[groupMinRatings.length-1]){
                    window.alert("Error: Each group minimum rating must be greater than or equal to the previous one.");
                    return;
                }
                groupMinRatings.push((minRating-meanRating)/ratingScale);
                i++;
                minRating=document.getElementById("group-"+i+"-min-rating");
            }
            this.setArrayLength(groupMinRatings, groupNum-1);

            index.ratingSystem.getConfig().groupMinGames=[];
            i=1;
            let minGames=document.getElementById("group-1-min-games");
            while(minGames){
                minGames=Number(minGames.value);
                if(Number.isNaN(minGames)) minGames=0;
                index.ratingSystem.getConfig().groupMinGames.push(minGames);
                i++;
                minGames=document.getElementById("group-"+i+"-min-games");
            }
            this.setArrayLength(index.ratingSystem.getConfig().groupMinGames, groupNum-1);

            index.ratingSystem.getConfig().enableRatingGroups=document.getElementById("enable-rating-groups").checked;
            index.ratingSystem.getConfig().ratingGroups=ratingGroups;
            index.ratingSystem.getConfig().groupMinRatings=groupMinRatings;

            this.restore();
        }
    }

    updateRatingGroupSettings(){
        let i=0;
        let ratingGroup=document.getElementById("group-0-name");
        while(ratingGroup && this.ratingGroups[i]!==undefined){
            this.ratingGroups[i]=ratingGroup.value;
            i++;
            ratingGroup=document.getElementById("group-"+i+"-name");
        }

        i=1;
        let minRating=document.getElementById("group-1-min-rating");
        while(minRating && this.groupMinRatings[i-1]!==undefined){
            this.groupMinRatings[i-1]=minRating.value;
            i++;
            minRating=document.getElementById("group-"+i+"-min-rating");
        }

        i=1;
        let minGames=document.getElementById("group-1-min-games");
        while(minGames && this.groupMinGames[i-1]!==undefined){
            this.groupMinGames[i-1]=minGames.value;
            i++;
            minGames=document.getElementById("group-"+i+"-min-games");
        }

        this.drawRatingGroupSettings();
    }

    drawRatingGroupSettings(){
        let div=document.getElementById("rating-group-settings");

        if(!document.getElementById("enable-rating-groups").checked){
            div.innerHTML='';
        }
        else{
            let groupSettings='<p>Group name: <input type="text" id="group-0-name" value="'+this.ratingGroups[0]+'"></p><br>';

            for(let i=1; i<this.ratingGroups.length; i++){
                groupSettings+='<p>Group name: <input type="text" id="group-'+i+'-name" value="'+this.ratingGroups[i]+'"><br>' +
                    'Minimum rating: <input type="number" id="group-'+i+'-min-rating" value="'+this.groupMinRatings[i-1]+'"><br>' +
                    'Minimum games until eligable: <input type="number" id="group-'+i+'-min-games" value="'+this.groupMinGames[i-1]+'"></p><br>';
            }

            groupSettings+='<p><a href="#add-group" id="add-group" onclick="settings.onAddGroupClick()">Add rating group</a> ' +
                '<a href="#add-group" onclick="settings.onRemoveGroupClick()">Remove rating group</a></p><br>';

            div.innerHTML=groupSettings;
        }
    }

    restore(){
        document.getElementById("prior").value=index.ratingSystem.getConfig().prior;
        document.getElementById("w").value=index.ratingSystem.getConfig().w;

        let meanRating=index.ratingSystem.getConfig().meanRating;
        let ratingScale=index.ratingSystem.getConfig().ratingScale
        document.getElementById("mean-rating").value=meanRating;
        document.getElementById("rating-scale").value=ratingScale;
        document.getElementById("until-rated").value=index.ratingSystem.getConfig().gameNumUntilRated;
        document.getElementById("full-iterations-for-each-game").checked=index.ratingSystem.getConfig().fullIterationsForEachGame;
        document.getElementById("iterations-per-game").value=index.ratingSystem.getConfig().iterationNum;

        let infiniteGames=index.ratingSystem.getConfig().infiniteGames;
        document.getElementById("infinite-games").checked=infiniteGames;
        document.getElementById("maximum-number-of-games").disabled=infiniteGames;

        document.getElementById("maximum-number-of-games").value=index.ratingSystem.getConfig().maximumNumOfGames;
        
        document.getElementById("character-limit").value=index.ratingSystem.getConfig().characterLimit;
        document.getElementById("escape-discord-markdown").checked=index.ratingSystem.getConfig().escapeDiscordMarkdown;

        if(index.ratingSystem.getConfig().enableRatingGroups!==undefined)
            document.getElementById("enable-rating-groups").checked=index.ratingSystem.getConfig().enableRatingGroups;
        else
            document.getElementById("enable-rating-groups").checked=false;

        let ratingGroups=index.ratingSystem.getConfig().ratingGroups;
        if(ratingGroups!==undefined)
            this.ratingGroups=[...ratingGroups];
        else
            this.ratingGroups=[this.defaultGroupNames[0]];

        let groupMinRatings=index.ratingSystem.getConfig().groupMinRatings;
        if(groupMinRatings!==undefined)
            this.groupMinRatings=[...groupMinRatings.map(x=>x*ratingScale+meanRating)];
        else{
            this.groupMinRatings=[];
            for(let i=0; i<this.ratingGroups.length-1; i++){
                this.groupMinRatings.push(index.ratingSystem.getConfig().meanRating);
            }
        }

        let groupMinGames=index.ratingSystem.getConfig().groupMinGames;
        if(groupMinGames!==undefined)
            this.groupMinGames=[...groupMinGames];
        else{
            this.groupMinGames=[];
            for(let i=0; i<this.ratingGroups.length-1; i++){
                this.groupMinGames.push(0);
            }
        }

        this.drawRatingGroupSettings();
    }

    setArrayLength(arr, len){
        let arrLen=arr.length;
        if(arrLen<len){
            for(let i=0; i<len-arrLen; i++){
                arr.push(0);
            }
        }
        else if(arrLen>len){
            arr.splice(len, arrLen-len);
        }
    }
}
