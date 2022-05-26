//Does WHR calculations.
let whr=new class WHR{
    /**
     * Runs a full iteration.
     * @param {RatingSystem} rs
     * @param {number} count The number of iterations.
     */
    fullIteration(rs, count){
        this.partialIteration(rs, rs.getPlayers(), count);
    }

    /**
     * Runs a partial iteration.
     * @param {RatingSystem} rs
     * @param {[Player]} players
     * @param {number} count The number of iterations.
     */
    partialIteration(rs, players, count){
        for(let i=0; i<count; i++){
            players.forEach(player=>{
                let g=this.#playerGradient(rs, player);
                let hd=this.#playerHessianDiagonal(rs, player);
                let hsd=this.#playerHessianSubdiagonal(rs, player);

                let a=[];
                let b=[];
                let d=[];
                
                d.push(hd[0]-.001);
                for(let j=0; j<hd.length-1; j++){
                    a.push(hsd[j]/d[j]);
                    b.push(hsd[j]);
                    d.push(hd[j+1]-.001-a[j]*b[j]);
                }

                let y=[];
                
                y.push(g[0]);
                for(let j=1; j<g.length; j++){
                    y.push(g[j]-a[j-1]*y[j-1]);
                }

                let x=[];
                for(let j=0; j<g.length; j++) x.push(0);
                
                x[g.length-1]=y[g.length-1]/d[g.length-1];
                for(let j=g.length-2; j>=0; j--){
                    x[j]=(y[j]-b[j]*x[j+1])/d[j];
                }

                player.getRatingDays().forEach((ratingDay, rdIndex)=>{
                    if(Math.exp(ratingDay.getR()-x[rdIndex])<Infinity){
                        ratingDay.setR(ratingDay.getR()-x[rdIndex]);
                    }
                    else{
                        ratingDay.setR(0);
                    }
                });

                if(i===count-1){
                    this.#updatePlayerSigma(rs, player, hd, hsd);
                }
            });
        }
    }

    /**
     * @param {RatingSystem} rs
     * @returns {number}
     */
    logLikelihood(rs){
        let loglikelihood=0;
        let prior=rs.getConfig().prior;
        let w2=Math.pow(rs.getConfig().w, 2);

        let dayLength=86_400_000;
        rs.getPlayers().forEach(player=>{
            let ratingDays=player.getRatingDays();
            ratingDays.forEach((ratingDay, rdIndex)=>{
                let r=ratingDay.getR();

                if(ratingDay.getHasPrior()){
                    loglikelihood+=prior*(r-2*Math.log(Math.exp(r)+1));
                }
                if(rdIndex<ratingDays.length-1){
                    let nextDay=ratingDays[rdIndex+1];
                    let sigma2=(nextDay.getDate().valueOf()-ratingDay.getDate().valueOf())/dayLength*w2;
                    loglikelihood+=2*Math.log(1/Math.sqrt(2*sigma2*Math.PI)*Math.exp(-Math.pow(r-nextDay.getR(), 2)/2/sigma2));
                }
            });
        });

        let games=rs.getGames();
        games.forEach(game=>{
            let teamRs=[];
            let totalGamma=0;
            game.getTeamsRatingDays().forEach((team, teamNum)=>{
                teamRs.push(0);
                team.forEach(teamPlayerRatingDay=>{
                    teamRs[teamNum]+=teamPlayerRatingDay.getR();
                });
                totalGamma+=Math.exp(teamRs[teamNum]);
            });
            
            if(game.getIsScore()){
                game.getResults().forEach((score, teamNum)=>{
                    loglikelihood+=score*(teamRs[teamNum]-Math.log(totalGamma));
                });
            }
            else{
                let remainingGamma=totalGamma;
                game.getResults().forEach(teamNum=>{
                    loglikelihood+=teamRs[teamNum]-Math.log(remainingGamma);
                    remainingGamma-=Math.exp(teamRs[teamNum]);
                });
            }
        });

        return loglikelihood;
    }

    /**
     * @param {RatingSystem} rs
     * @param {Player} player
     * @param {[number]} hd Player hessian diagonal.
     * @param {[number]} hsd Player hessian subdiagonal.
     */
    #updatePlayerSigma(rs, player, hd, hsd){
        let a=[];
        let b=[];
        let d=[];
        
        d.push(hd[0]-.001);
        for(let i=0; i<hd.length-1; i++){
            a.push(hsd[i]/d[i]);
            b.push(hsd[i]);
            d.push(hd[i+1]-.001-a[i]*b[i]);
        }
        
        let aPrime=[];
        for(let i=0; i<hd.length-1; i++) aPrime.push(0);
        let bPrime=[];
        for(let i=0; i<hd.length-1; i++) bPrime.push(0);
        let dPrime=[];
        for(let i=0; i<hd.length; i++) dPrime.push(0);

        dPrime[hd.length-1]=hd[hd.length-1]-.001;
        for(let i=hd.length-2; i>=0; i--){
            aPrime[i]=hsd[i]/dPrime[i+1];
            bPrime[i]=hsd[i];
            dPrime[i]=hd[i]-.001-aPrime[i]*bPrime[i];
        }

        let ratingDays=player.getRatingDays();
        ratingDays.forEach((ratingDay, i)=>{
            if(i<ratingDays.length-1){
                ratingDay.setSigma(Math.sqrt(dPrime[i+1]/(b[i]*bPrime[i]-d[i]*dPrime[i+1])));
            }
            else
                ratingDay.setSigma(Math.sqrt(-1/d[i]));
        });
    }

    /**
     * Calculates a player's gradient vector according to the WHR algorithm.
     * @param {RatingSystem} rs
     * @param {Player} player
     * @returns {[number]} Gradient vector.
     */
    #playerGradient(rs, player){
        let gradient=[];
        let prior=rs.getConfig().prior;
        let w2=Math.pow(rs.getConfig().w, 2);

        let dayLength=86_400_000;
        let ratingDays=player.getRatingDays();
        ratingDays.forEach((ratingDay, rdIndex)=>{
            gradient.push(0);
            let r=ratingDay.getR();

            if(ratingDay.getHasPrior()){
                gradient[rdIndex]+=prior*(1-2*Math.exp(r)/(Math.exp(r)+1));
            }
            if(rdIndex<ratingDays.length-1){
                let nextDay=ratingDays[rdIndex+1];
                let sigma2=(nextDay.getDate().valueOf()-ratingDay.getDate().valueOf())/dayLength*w2;
                gradient[rdIndex]-=(r-nextDay.getR())/sigma2;
            }
            if(rdIndex>0){
                let previousDay=ratingDays[rdIndex-1];
                let sigma2=(ratingDay.getDate().valueOf()-previousDay.getDate().valueOf())/dayLength*w2;
                gradient[rdIndex]-=(r-previousDay.getR())/sigma2;
            }

            ratingDay.getGames().forEach(game=>{
                let teams=game.getTeams();

                let teamRs=[];
                let teamGamma;
                let totalGamma=0;
                game.getTeamsRatingDays().forEach((team, teamNum)=>{
                    teamRs.push(0);
                    team.forEach(teamPlayerRatingDay=>{
                        teamRs[teamNum]+=teamPlayerRatingDay.getR();
                    });
                    if(teams[teamNum].find(x=>{return x.getId()===player.getId();})!==undefined){
                        teamGamma=Math.exp(teamRs[teamNum]);
                    }
                    totalGamma+=Math.exp(teamRs[teamNum]);
                });
                
                if(game.getIsScore()){
                    game.getResults().forEach((score, teamNum)=>{
                        if(teams[teamNum].find(x=>{return x.getId()===player.getId();})!==undefined){
                            gradient[rdIndex]+=score-score*teamGamma/totalGamma;
                        }
                        else{
                            gradient[rdIndex]-=score*teamGamma/totalGamma;
                        }
                    });
                }
                else{
                    let remainingGamma=totalGamma;
                    let exitLoop=false;
                    game.getResults().forEach((teamNum, teamIndex)=>{
                        if(exitLoop || teamIndex===game.getResults().length-1) return;
                        if(teams[teamNum].find(x=>{return x.getId()===player.getId();})!==undefined){
                            gradient[rdIndex]+=1-teamGamma/remainingGamma;
                            exitLoop=true;
                        }
                        else{
                            gradient[rdIndex]-=teamGamma/remainingGamma;
                        }
                        remainingGamma-=Math.exp(teamRs[teamNum]);
                    });
                }
            });
        });

        return gradient;
    }

    /**
     * Calculates the diagonal of a player's hessian matrix according to the WHR algorithm.
     * @param {RatingSystem} rs
     * @param {Player} player
     * @returns {[number]} The diagonal of the hessian.
     */
    #playerHessianDiagonal(rs, player){
        let hessianDiagonal=[];
        let prior=rs.getConfig().prior;
        let w2=Math.pow(rs.getConfig().w, 2);

        let dayLength=86_400_000;
        let ratingDays=player.getRatingDays();
        ratingDays.forEach((ratingDay, rdIndex)=>{
            hessianDiagonal.push(0);
            let r=ratingDay.getR();

            if(ratingDay.getHasPrior()){
                hessianDiagonal[rdIndex]-=2*prior*(Math.exp(r)/Math.pow((Math.exp(r)+1), 2));
            }
            if(rdIndex<ratingDays.length-1){
                let nextDay=ratingDays[rdIndex+1];
                let sigma2=(nextDay.getDate().valueOf()-ratingDay.getDate().valueOf())/dayLength*w2;
                hessianDiagonal[rdIndex]-=1/sigma2;
            }
            if(rdIndex>0){
                let previousDay=ratingDays[rdIndex-1];
                let sigma2=(ratingDay.getDate().valueOf()-previousDay.getDate().valueOf())/dayLength*w2;
                hessianDiagonal[rdIndex]-=1/sigma2;
            }

            ratingDay.getGames().forEach(game=>{
                let teams=game.getTeams();

                let teamRs=[];
                let teamGamma;
                let opposingGamma=0;
                game.getTeamsRatingDays().forEach((team, teamNum)=>{
                    teamRs.push(0);
                    team.forEach((teamPlayerRatingDay)=>{
                        teamRs[teamNum]+=teamPlayerRatingDay.getR();
                    });
                    if(teams[teamNum].find(x=>{return x.getId()===player.getId();})!==undefined){
                        teamGamma=Math.exp(teamRs[teamNum]);
                    }
                    else{
                        opposingGamma+=Math.exp(teamRs[teamNum]);
                    }
                });
                
                if(game.getIsScore()){
                    game.getResults().forEach(score=>{
                        hessianDiagonal[rdIndex]-=score*teamGamma*opposingGamma/Math.pow(teamGamma+opposingGamma, 2);
                    });
                }
                else{
                    let remainingOpposingGamma=opposingGamma;
                    let exitLoop=false;
                    game.getResults().forEach((teamNum, teamIndex)=>{
                        if(exitLoop || teamIndex===game.getResults().length-1) return;
                        
                        hessianDiagonal[rdIndex]-=teamGamma*remainingOpposingGamma/Math.pow(teamGamma+remainingOpposingGamma, 2);
                        
                        if(teams[teamNum].find(x=>{return x.getId()===player.getId();})!==undefined){
                            exitLoop=true;
                        }

                        remainingOpposingGamma-=Math.exp(teamRs[teamNum]);
                    });
                }
            });
        });

        return hessianDiagonal;
    }

    /**
     * Calculates the subdiagonal of a player's hessian matrix according to the WHR algorithm.
     * @param {RatingSystem} rs
     * @param {Player} player
     * @returns {[number]} The sub-diagonal of the hessian.
     */
     #playerHessianSubdiagonal(rs, player){
        let hessianSubDiagonal=[];
        let w2=Math.pow(rs.getConfig().w, 2);

        let dayLength=86_400_000;
        let ratingDays=player.getRatingDays();
        for(let rdIndex=0; rdIndex<ratingDays.length-1; rdIndex++){
            let ratingDay=ratingDays[rdIndex];
            let nextRatingDay=ratingDays[rdIndex+1];
            
            let sigma2=(nextRatingDay.getDate().valueOf()-ratingDay.getDate().valueOf())/dayLength*w2;
            hessianSubDiagonal.push(1/sigma2);
        }

        return hessianSubDiagonal;
     }
}
