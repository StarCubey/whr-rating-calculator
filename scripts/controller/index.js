let index=new class Index{
    ratingSystem;
    leaderboardName="untitled";

    initialize(){
        this.ratingSystem=new RatingSystem();
        this.ratingSystem.getConfig().partialIterationNum=10;
        this.ratingSystem.getConfig().fullIterationNum=10;
        this.ratingSystem.getConfig().daysBetweenFullIterations=1;

        window.onbeforeunload = function() {return true;};

        //TDOO DEBUG
        /*
        (async ()=>{
            await new Promise(resolve=>{setTimeout(resolve, 500)});
            let rs=new RatingSystem();
            let p1=rs.addPlayer("tes");
            let p2=rs.addPlayer("t");
            rs.addGameWithoutScore([[p1], [p2]], [0, 1], new Date());
            rs.addGameWithoutScore([[p1], [p2]], [0, 1], new Date(Date.now()+86_400_000));
            rs.ratingUpdate(()=>{
                for(let i=0; i<10; i++){
                    whr.fullIteration(rs, 1);
                    console.log("Log likelihood: "+whr.logLikelihood(rs));
                }
            });
            console.log(rs.getPlayers()[0].getName());
            console.log("rating: "+rs.getPlayers()[0].getRL());
            console.log("RD: "+rs.getPlayers()[0].getSigmaL());
            console.log(rs.getPlayers()[1].getName());
            console.log("rating: "+rs.getPlayers()[1].getRL());
            console.log("RD: "+rs.getPlayers()[1].getSigmaL());
        })();
        */
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
