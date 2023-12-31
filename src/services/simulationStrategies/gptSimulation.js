import { randomIntFromInterval } from '../randomService';

export default function GPTSimulation(match, rank) {
    var getStats = (team) => {
        return rank.filter(r => r.team.code === team.code)[0];
    }

    var hasChance = (offense, defense, minutesPlayed, offenseScore, defenseScore, offenseIsHomeTeam) => {
        var offenseStatus = getStats(offense);
        var defenseStatus = getStats(defense);

        var baseChances = 50 + offenseStatus.pointsPercentage - defenseStatus.pointsPercentage;

        if (offenseIsHomeTeam) {
            baseChances += 10;
        } else {
            baseChances -= 10;
        }

        if (minutesPlayed >= 80 && offenseScore < defenseScore) {
            baseChances += 15;
        } else if (minutesPlayed >= 70 && offenseScore < defenseScore) {
            baseChances += 5;
        }

        if (baseChances < 5) {
            baseChances = 5;
        }

        let randomFactor = randomIntFromInterval(-10, 10);
        baseChances += randomFactor;

        return (randomIntFromInterval(0, 100) < baseChances);
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
    for (var minutesPlayed = gt; minutesPlayed < 9; minutesPlayed++) {
        if (hasChance(match.homeTeam, match.awayTeam, minutesPlayed, match.homeScore, match.awayScore, true) && hasScored(match.homeTeam, match.awayTeam)) {
            match.homeScore++;
        }

        if (hasChance(match.awayTeam, match.homeTeam, minutesPlayed, match.awayScore, match.homeScore, false) && hasScored(match.awayTeam, match.homeTeam)) {
            match.awayScore++;
        }
    }

    match.status = "finalizado";
}