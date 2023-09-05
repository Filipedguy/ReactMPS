import { randomIntFromInterval } from '../randomService';

export default function indexSimulation(match, rank) {
    var getStats = (team) => {
        return rank.filter(r => r.team.code === team.code)[0];
    }

    var hasChance = (offense, defense) => {
        var offenseStatus = getStats(offense);
        var defenseStatus = getStats(defense);

        var chances = 50 + offenseStatus.pointsPercentage - defenseStatus.pointsPercentage;
        if (chances < 5) {
            chances = 5;
        }

        return (randomIntFromInterval(0, 100) < chances);
    }

    var hasScored = (offense, defense) => {
        var offenseStatus = getStats(offense);
        var defenseStatus = getStats(defense);

        var scoreChances = (offenseStatus.forGoals / offenseStatus.matches / 9.00) * 100.00;
        var defenseChances = (defenseStatus.againtsGoals / offenseStatus.matches / 9.00) * 100.00;

        var chances = scoreChances + defenseChances;
        if (chances < 5) {
            chances = 5;
        }

        return (randomIntFromInterval(0, 100) < chances);
    }

    match.status = "em progresso";

    if (!match.homeScore) {
        match.homeScore = 0;
    }

    if (!match.awayScore) {
        match.awayScore = 0;
    }

    var gt = (match.gameTime / 10);
    for (var i = gt; i < 9; i++) {
        if (hasChance(match.homeTeam, match.awayTeam) && hasScored(match.homeTeam, match.awayTeam)) {
            match.homeScore++;
        }

        if (hasChance(match.awayTeam, match.homeTeam) && hasScored(match.awayTeam, match.homeTeam)) {
            match.awayScore++;
        }
    }

    match.status = "finalizado";
}