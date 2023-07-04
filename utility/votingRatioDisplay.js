class VoteDisplay {

    constructor(usersCount, votesYes, votesNo) {
        this.usersCount = usersCount;
        this.votesYes = votesYes;
        this.votesNo = votesNo;
        this.votesCount = votesYes + votesNo;
        this.yesPercentage = 100 * (votesYes / this.votesCount)
        this.noPercentage = 100 * (votesNo / this.votesCount)
    }

    getVisualBar(votesPercentage) {
        const visualBar = ['╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍'];
        const fillBar = '▰';

        let count = votesPercentage < 9 ? Math.ceil(votesPercentage / 10) : Math.floor(votesPercentage / 10);
        for (let i = 0; i < count; i++) {
            visualBar[i] = fillBar;
        }
        return visualBar.join(` `)
    }


    getVoteDisplay(barsCount) {
        const bars = ['',''];
        bars[0] = this.getVisualBar(this.yesPercentage)
        bars[1] = this.getVisualBar(this.noPercentage)
        return bars;
    }
}

module.exports = VoteDisplay;