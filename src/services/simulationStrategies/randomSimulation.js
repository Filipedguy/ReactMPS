import { randomIntFromInterval } from '../randomService';

export default function indexSimulation(match, rank) {
    match.status = "em progresso";

    var result = randomIntFromInterval(0, 17);

    resultApply(match, result);

    match.status = "finalizado";
}

function resultApply(match, number) {
    if (number === 0) {
        match.homeScore = 3;
        match.awayScore = 0;
    }
    else if (number === 1) {
        match.homeScore = 3;
        match.awayScore = 1;
    }
    else if (number === 2) {
        match.homeScore = 3;
        match.awayScore = 2;
    }
    else if (number === 3) {
        match.homeScore = 2;
        match.awayScore = 0;
    }
    else if (number === 4) {
        match.homeScore = 2;
        match.awayScore = 1;
    }
    else if (number === 5) {
        match.homeScore = 1;
        match.awayScore = 0;
    }
    else if (number === 6) {
        match.homeScore = 3;
        match.awayScore = 3;
    }
    else if (number === 7) {
        match.homeScore = 2;
        match.awayScore = 2;
    }
    else if (number === 8 || number === 9) {
        match.homeScore = 1;
        match.awayScore = 1;
    }
    else if (number === 10 || number === 11) {
        match.homeScore = 0;
        match.awayScore = 0;
    }
    else if (number === 12) {
        match.homeScore = 0;
        match.awayScore = 1;
    }
    else if (number === 13) {
        match.homeScore = 1;
        match.awayScore = 2;
    }
    else if (number === 14) {
        match.homeScore = 0;
        match.awayScore = 2;
    }
    else if (number === 15) {
        match.homeScore = 2;
        match.awayScore = 3;
    }
    else if (number === 16) {
        match.homeScore = 1;
        match.awayScore = 3;
    }
    else if (number === 17) {
        match.homeScore = 0;
        match.awayScore = 3;
    }
    else {
        // Should never happen

        match.homeScore = 0;
        match.awayScore = 0;
    }
}