
class VoteDisplay {
    constructor(usersCount, votesCount, votesYes, votesNo) {
        this.usersCount = usersCount;
        this.votesCount = votesCount;
        this.votesYes = votesYes;
        this.votesNo = votesNo;
    }

    getStatsForDisplaying(usersCount, votesCount, votesYes, votesNo) {
        const yesPercentage = 100 * (votesYes / votesCount)
        const noPercentage = 100 * (votesNo / votesCount)
        return { usersCount, votesCount, yesPercentage, noPercentage };
    }

    drawVisualBar(votesPercentage) {

        const visualBar = ['╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍', '╍'];
        const fillBar = '▰';

        let count = votesPercentage < 9 ? Math.ceil(votesPercentage / 10) : Math.floor(votesPercentage / 10);
        for (let i = 0; i < count; i++) {
            visualBar[i] = fillBar;
        }
        return visualBar.join(` `)
    }
}

module.exports = VoteDisplay;