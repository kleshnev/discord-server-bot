class VoteDisplay {
    constructor(usersCount, votesYes, votesNo) {
        this.usersCount = usersCount;
        this.votesYes = votesYes;
        this.votesNo = votesNo;
        this.votesCount = votesYes + votesNo;
        if (votesNo + votesYes != 0) {
            this.yesPercentage = 100 * (votesYes / this.votesCount)
            this.noPercentage = 100 * (votesNo / this.votesCount)
        } else {
            this.yesPercentage = 0;
            this.noPercentage = 0;
        }

        this.bars = [' ', ' '];
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



    getVoteDisplay() {
        this.bars[0] = this.getVisualBar(this.yesPercentage)
        this.bars[1] = this.getVisualBar(this.noPercentage)
    }
}

module.exports = VoteDisplay;