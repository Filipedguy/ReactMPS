import { randomIntFromInterval } from '../randomService';

export default function indexSimulation(match, rank) {
    var getStats = (team) => {
        return rank.filter(r => r.team.code === team.code)[0];
    }

    if (!match.homeScore) {
        match.homeScore = 0;
    }

    if (!match.awayScore) {
        match.awayScore = 0;
    }

    var initialSet = 0;
    var finalSet = 1700;

    var statsThreshold = -170; // Inicia em -170 porque da 10% de chances do mandante vencer

    // Calcula a diferença na tabela e adiciona 5% de chance para cada diferença
    statsThreshold += ((getStats(match.homeTeam).position - getStats(match.awayTeam).position) * 85);

    match.status = "em progresso";

    var result = randomIntFromInterval(initialSet + statsThreshold, finalSet + statsThreshold);

    resultApply(match, result);

    match.status = "finalizado";
}

function resultApply(match, number) {
    if (number < 100) {
        match.homeScore += 3;
        match.awayScore += 0;
    }
    else if (number >= 100 && number < 200) {
        match.homeScore += 3;
        match.awayScore += 1;
    }
    else if (number >= 200 && number < 300) {
        match.homeScore += 2;
        match.awayScore += 0;
    }
    else if (number >= 300 && number < 400) {
        match.homeScore += 3;
        match.awayScore += 2;
    }
    else if (number >= 400 && number < 500) {
        match.homeScore += 2;
        match.awayScore += 1;
    }
    else if (number >= 500 && number < 600) {
        match.homeScore += 1;
        match.awayScore += 0;
    }
    else if (number >= 600 && number < 700) {
        match.homeScore += 3;
        match.awayScore += 3;
    }
    else if (number >= 700 && number < 800) {
        match.homeScore += 2;
        match.awayScore += 2;
    }
    else if (number >= 800 && number < 1000) {
        match.homeScore += 1;
        match.awayScore += 1;
    }
    else if (number >= 1000 && number < 1200) {
        match.homeScore += 0;
        match.awayScore += 0;
    }
    else if (number >= 1200 && number < 1300) {
        match.homeScore += 0;
        match.awayScore += 1;
    }
    else if (number >= 1300 && number < 1400) {
        match.homeScore += 1;
        match.awayScore += 2;
    }
    else if (number >= 1400 && number < 1500) {
        match.homeScore += 2;
        match.awayScore += 3;
    }
    else if (number >= 1500 && number < 1600) {
        match.homeScore += 0;
        match.awayScore += 2;
    }
    else if (number >= 1600 && number < 1700) {
        match.homeScore += 1;
        match.awayScore += 3;
    }
    else if (number >= 1700) {
        match.homeScore += 0;
        match.awayScore += 3;
    }
    else {
        // Should never happen

        match.homeScore += 0;
        match.awayScore += 0;
    }
}