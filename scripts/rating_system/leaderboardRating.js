let leaderboardRating=new class LeaderboardRating{
    /**
     * @param {number} prior The prior constant.
     * @returns The rating deviation of an unrated player.
     */
    getSigma0(prior){
        return Math.sqrt(2/prior);
    }

    /**
     * @param {number} r Natural rating.
     * @param {number} sigma Rating deviation.
     * @param {number} mean The leaderboard rating of an average player.
     * @param {number} scale The scaling factor from natural ratings to leaderboard ratings.
     * @returns {number} Leaderboard rating.
     */
    getLeaderboardRating(r, sigma, mean, scale){
        return r*scale+mean;
    }

    /**
     * @param {*} sigma Rating deviation.
     * @param {*} scale The scaling factor from natural ratings to leaderboard ratings.
     * @returns {number} Leaderboard sigma.
     */
    getLeaderboardSigma(sigma, scale){
        return sigma*scale;
    }
}
