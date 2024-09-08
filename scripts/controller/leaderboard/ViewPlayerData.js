let viewPlayerData=new class ViewMatchData{
  activePlayers=[];

  initialize(){
    this.players=index.ratingSystem.getPlayers();

    let playerList=document.getElementById("player-list");
    this.players.forEach(player=>{
      let option=document.createElement("option");
      option.setAttribute("value", player.getName());
      playerList.appendChild(option);
    });

    const ctx=document.getElementById("chart");

    this.chart=new Chart(ctx, {
      type: "line",
      data: {
        datasets: [],
      },
      options: {
        scales: {
          x: {
            type: "time",
          },
          y: {
            title: {
              display: true,
              text: "MMR",
            }
          }
        }
      },
    });
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

  /**
   * Adds the selected player to the active players list.
   */
  addActivePlayer(){
    let playerName=document.getElementById("active-list-selection").value;

    if(playerName===""){
        window.alert("Error: Blank player name.");
        return;
    }

    let player=this.players.find(x=>x.getName()===playerName);

    if(player===undefined){
      window.alert("Error: Player not found.");
      return;
    }

    this.activePlayers.push(player);
    this.#displayActivePlayers();
    this.#updateChart();
  }

  /**
   * Removes the selected player from the active players list.
   */
  removeActivePlayer(){
    let playerName=document.getElementById("active-list-selection").value;

    if(playerName===""){
      window.alert("Error: Blank player name.");
      return;
    }

    let player=this.activePlayers.find(x=>x.getName()===playerName);

    if(player===undefined){
      window.alert("Error: Player not found.");
      return;
    }

    let index=this.activePlayers.indexOf(player);
    this.activePlayers.splice(index, 1);
    this.#displayActivePlayers();
    this.#updateChart();
  }

  /**
   * Clears the active players list.
   */
  clearActivePlayers(){
    this.activePlayers=[];
    this.#displayActivePlayers();
    this.#updateChart();
  }

  addAllPlayers(){
    this.activePlayers=[...this.players];
    this.#displayActivePlayers();
    this.#updateChart();
  }

  /**
   * Displays players in activePlayers
   */
  #displayActivePlayers(){
    let enableRatingGroups=index.ratingSystem.getConfig().enableRatingGroups;
    let ratingGroups=index.ratingSystem.getConfig().ratingGroups;

    this.activePlayers.sort((p1, p2)=>{
      if(p1.getRL()===undefined || p2.getRL()===undefined) return 0;
      return p2.getRL()-p1.getRL();
    });

    let output="";

    if(this.players.length===0) output="The player list is empty.";

    for(let i=0; i<this.activePlayers.length; i++){
      let player=this.activePlayers[i];

      output+=`#${i+1}: ${player.getName()} (${player.getRL().toFixed()}`;

      if(enableRatingGroups && player.getRatingGroupIgnoreMinGames()!==player.getRatingGroup()){
          let groupIgnoreString=ratingGroups[player.getRatingGroupIgnoreMinGames()];
          let {games, total}=player.getGamesUntilEligible();
          output+="* "+games+"/"+total+" "+groupIgnoreString+" games";
      }
      
      output+=`${player.getUntilRated() ? `, ${player.getUntilRated()} game(s) until rated` : ""})<br>`;
    }

    document.getElementById("active-list").innerHTML=output;
  }

  #updateChart(){
    let datasets=[];

    this.activePlayers.forEach(player=>{
      let dataset={label: player.getName(), data: []};
      let ratingDays=player.getRatingDays();
      ratingDays.forEach(ratingDay=>{
        dataset.data.push({
          x: ratingDay.getDate(),
          y: ratingDay.getRL(),
        });
      });
      datasets.push(dataset);
    });

    this.chart.data.datasets=datasets;
    this.chart.update();
  }
}
