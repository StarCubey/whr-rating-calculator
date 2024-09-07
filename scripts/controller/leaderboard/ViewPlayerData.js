let viewPlayerData=new class ViewMatchData{
  initialize(){
    const ctx=document.getElementById("chart");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          new Date(2024, 1, 1),
          new Date(2024, 2, 15),
          new Date(2024, 3, 1),
          new Date(2024, 6, 4),
        ],
        datasets: [{
          label: "uwu",
          data: [10, 20, 15, 30],
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "hi",
            },
            type: "time",
          },
          y: {
            title: {
              display: true,
              text: "owo",
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
}
