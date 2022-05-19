let index=new class Index{
    ratingSystem;
    leaderboardName="untitled";

    initialize(){
        this.ratingSystem=new RatingSystem();

        let config=this.ratingSystem.getConfig();
        config.iterationNum=10;
        config.fullIterationsForEachGame=true;
        config.lastGameMode="1v1";
        config.lastScoreMode="No score";
        config.escapeDiscordMarkdown=true;
        config.characterLimit=2000;
        config.lastFullIterationDate=-1;

        window.onbeforeunload = function() {return true;};
    }

    onCreateButtonClick(){
        let xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange=function(){
            if (this.readyState==4 && this.status==200) {
                document.documentElement.innerHTML=this.responseText;
                createLeaderboard.initialize();
            }
        };
        xhttp.open("GET", "./create-leaderboard.html", true);
        xhttp.send();
    }

    onLoadButtonClick(){
        let load=document.createElement("input");
        load.setAttribute("type", "file");
        load.setAttribute("accept", ".json");
        load.style.display="none";

        load.addEventListener("input", ()=>{
            let data=load.files[0].text();
            data.then(value=>{
                index.ratingSystem.loadData(JSON.parse(value));

                let nameSplit=load.files[0].name.split(".");
                nameSplit.pop();
                let name=nameSplit.join(".");
                index.leaderboardName=name;

                let xhttp=new XMLHttpRequest();
                xhttp.onreadystatechange=function(){
                    if (this.readyState==4 && this.status==200) {
                        document.documentElement.innerHTML=this.responseText;
                        mainMenu.initialize();
                    }
                };
                xhttp.open("GET", "./main-menu.html", true);
                xhttp.send();
            });
        });

        document.body.appendChild(load);
        load.click();
        document.body.removeChild(load);
    }
}

let scripts=[
    "scripts/controller/leaderboard/AddGames.js",
    "scripts/controller/leaderboard/Settings.js",
    "scripts/controller/leaderboard/ViewLeaderboard.js",
    "scripts/controller/leaderboard/ViewMatchData.js",
    "scripts/controller/CreateLeaderboard.js",
    "scripts/controller/MainMenu.js",
    "scripts/rating_system/Game.js",
    "scripts/rating_system/LeaderboardRating.js",
    "scripts/rating_system/Player.js",
    "scripts/rating_system/RatingDay.js",
    "scripts/rating_system/RatingSystem.js",
    "scripts/rating_system/WHR.js"
];

scripts.forEach((dir, i)=>{
    let script = document.createElement("script");
    script.setAttribute("src", dir);
    document.body.appendChild(script);
});

//index.initialize() is in RatingSystem.js

/*script for genereating test data
for(let i=0; i<20; i++){
	index.ratingSystem.addPlayer(i+"");
}
let players=index.ratingSystem.getPlayers();
for(let i=0; i<1000; i++){
	let p1=Math.floor(Math.random()*20);
	let p2=p1;
	while(p2===p1) p2=Math.floor(Math.random()*20);
	index.ratingSystem.addGameWithoutScore([[players[p1]], [players[p2]]], [0, 1], new Date())
}
*/
