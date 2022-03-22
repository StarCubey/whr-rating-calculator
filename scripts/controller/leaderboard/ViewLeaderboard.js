let viewLeaderboard=new class ViewLeaderboard{
    iterationLog="";
    players;
    lbPlayerCount;
    lbCopyStrings;
    escChars=["\\", "*", "_", "~", "`", ">", ":"];

    initialize(){
        this.players=index.ratingSystem.getPlayers();
        this.lbPlayerCount=20;
        this.#showLeaderboardData();
        this.#updateLbCopyStrings();

        let playerList=document.getElementById("player-list");
        this.players.forEach(player=>{
            let option=document.createElement("option");
            option.setAttribute("value", player.getName());
            playerList.appendChild(option);
        });
        
        if(this.iterationLog!=""){
            document.getElementById("iteration-log").innerHTML=this.iterationLog;
        }

        let lastFullIterationDate=index.ratingSystem.getConfig().lastFullIterationDate;
        if(lastFullIterationDate!==-1){
            document.getElementById("last-full-iteration").innerHTML="Date of last full iteration: "+new Date(lastFullIterationDate).toDateString();
        }
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

    onRunIterationsButtonClick(){
        let iterationCount=Number(document.getElementById("iteration-count").value);

        if(iterationCount<=0) return;

        let iterationString=
            iterationCount+" iterations<br>"+
            "Initial log likelihood: <br>"+
            whr.logLikelihood(index.ratingSystem)+"<br>";

        index.ratingSystem.ratingUpdate(()=>{whr.fullIteration(index.ratingSystem, iterationCount);});
        this.players=index.ratingSystem.getPlayers();

        iterationString+="Final log likelihood: <br>"+whr.logLikelihood(index.ratingSystem)+"<br><br>";

        this.iterationLog=iterationString+this.iterationLog;

        document.getElementById("iteration-log").innerHTML=this.iterationLog;

        this.#showLeaderboardData();
        this.#updateLbCopyStrings();

        let lastFullIterationDate=Date.now();
        index.ratingSystem.getConfig().lastFullIterationDate=lastFullIterationDate;
        document.getElementById("last-full-iteration").innerHTML="Date of last full iteration: "+new Date(lastFullIterationDate).toDateString();
    }

    onRenamePlayerPressed(){
        let oldName=document.getElementById("old-name").value;
        let newName=document.getElementById("new-name").value;
        let player=this.players.find(x=>x.getName()===oldName);

        if(newName===""){
            window.alert("Error: New name blank.");
            return;
        }
        
        if(player===undefined){
            window.alert("Player not found.");
            return;
        }

        if(this.players.find(x=>x.getName()===newName)!==undefined){
            window.alert("Error: Name taken.");
            return;
        }

        player.setName(newName);

        this.#showLeaderboardData();
        this.#updateLbCopyStrings();

        window.alert("Name changed.");
    }

    onCopyLeaderboardButtonClick(stringNum){
        navigator.clipboard.writeText(this.lbCopyStrings[stringNum]);
    }

    onShowMoreButtonClick(){
        if(this.lbPlayerCount<this.players.length){
            this.lbPlayerCount+=20;
            this.#showLeaderboardData();
        }
    }

    onShowLessButtonClick(){
        if(this.lbPlayerCount>20){
            this.lbPlayerCount-=20;
            this.#showLeaderboardData();
        }
    }

    #showLeaderboardData(){
        let gameNumUntilRated=index.ratingSystem.getConfig().gameNumUntilRated;
        
        let lbString="";
        for(let playerNum=0; playerNum<this.lbPlayerCount && playerNum<this.players.length; playerNum++){
            let player=this.players[playerNum];
            
            if(playerNum!==0) lbString+="<br><br>";

            if(player.getUntilRated()===0){
                lbString+=
                    "#"+(playerNum+1)+": "+player.getName()+"<br>"+
                    "MMR: "+Math.round(player.getRL())+"<br>"+
                    "RD: "+Math.round(player.getSigmaL()*100)/100;
            }
            else{
                lbString+=
                    player.getName()+" ("+(gameNumUntilRated-player.getUntilRated())+"/"+gameNumUntilRated+" games until rated)<br>"+
                    "MMR: "+Math.round(player.getRL())+"<br>"+
                    "RD: "+Math.round(player.getSigmaL()*100)/100;
            }
        }

        if(lbString!=="") document.getElementById("leaderboard").innerHTML=lbString;
        else document.getElementById("leaderboard").innerHTML="No leaderboard data.";
    }

    #updateLbCopyStrings(){
        this.lbCopyStrings=[""];
        let i=0;
        this.players.forEach((player, playerNum)=>{
            let append="";

            if(playerNum!==0) append+="\n-\n";

            if(player.getUntilRated()===0){
                append+=
                    "#"+(playerNum+1)+": "+player.getName()+"\n"+
                    "MMR: "+Math.round(player.getRL())+"\n"+
                    "RD: "+Math.round(player.getSigmaL()*100)/100;
            }
            else return;

            if(index.ratingSystem.getConfig().escapeDiscordMarkdown){
                this.escChars.forEach(escChar=>{
                    append=append.split(escChar).join("\\"+escChar);
                });

                if(this.lbCopyStrings[i].length+append.length > index.ratingSystem.getConfig().characterLimit){
                    i++;
                    this.lbCopyStrings.push("");
                }
            }

            this.lbCopyStrings[i]+=append;
        });

        if(this.lbCopyStrings.length===1){
            document.getElementById("copy-string-buttons").innerHTML='<a href="#" onclick="viewLeaderboard.onCopyLeaderboardButtonClick(0)">Copy leaderboard</a>';
        }
        else{
            let innerHTMLString="";
            for(let i=0; i<this.lbCopyStrings.length; i++){
                innerHTMLString+='<a href="#" onclick="viewLeaderboard.onCopyLeaderboardButtonClick('+i+')">Copy leaderboard '+(i+1)+'</a>';
                if(i<this.lbCopyStrings.length-1){
                    innerHTMLString+='<br>';
                }
            }
            document.getElementById("copy-string-buttons").innerHTML=innerHTMLString;
        }
    }
}
