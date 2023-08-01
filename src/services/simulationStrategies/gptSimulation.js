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

    for (var minutesPlayed = 0; minutesPlayed < 9; minutesPlayed++) {
        if (hasChance(match.homeTeam, match.awayTeam, minutesPlayed, match.homeScore, match.awayScore, true) && hasScored(match.homeTeam, match.awayTeam)) {
            match.homeScore++;
        }

        if (hasChance(match.awayTeam, match.homeTeam, minutesPlayed, match.awayScore, match.homeScore, false) && hasScored(match.awayTeam, match.homeTeam)) {
            match.awayScore++;
        }
    }

    match.status = "finalizado";
}

function ImprovedGPTSimulation(match, homeStats, awayStats) {
    var homeBaseChance = 50 + homeStats.pointsPercentage - awayStats.pointsPercentage + 10;
    var awayBaseChance = 50 + awayStats.pointsPercentage - homeStats.pointsPercentage - 10;

    var homeScoreChances = (homeStats.forGoals / homeStats.matches / 9.00) * 100.00;
    var homeDefenseChances = (homeStats.againtsGoals / awayStats.matches / 9.00) * 100.00;

    var awayScoreChances = (awayStats.forGoals / awayStats.matches / 9.00) * 100.00;
    var awayDefenseChances = (awayStats.againtsGoals / homeStats.matches / 9.00) * 100.00;

    var hasChance = (baseChances, minutesPlayed, offenseScore, defenseScore) => {
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

    var hasScored = (scoreChances, defenseChances) => {
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

    for (var minutesPlayed = 0; minutesPlayed < 9; minutesPlayed++) {
        if (hasChance(homeBaseChance, minutesPlayed, match.homeScore, match.awayScore) && hasScored(homeScoreChances, awayDefenseChances)) {
            match.homeScore++;
        }

        if (hasChance(awayBaseChance, minutesPlayed, match.awayScore, match.homeScore) && hasScored(awayScoreChances, homeDefenseChances)) {
            match.awayScore++;
        }
    }

    match.status = "finalizado";
}