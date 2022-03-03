let createLeaderboard=new class CreateLeaderboard{
    initialize(){
    }

    onBackButtonClick(){
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

    onCreateButtonClick(){
        let nameInput=document.getElementById("name");

        if(nameInput.value==="") return;

        index.leaderboardName=nameInput.value;
        
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
