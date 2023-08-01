import axios from 'axios';
import dayjs from 'dayjs';

const baseUrl = "http://localhost:1337/api";

export async function GetTable() {
    var response = await axios.get(`${baseUrl}/table`);

    var table = response.data.table;

    table.rounds.forEach(r => {
        r.matches.forEach(m => {
            if (m.date === 'Invalid Date') {
                m.date = undefined;
            }
        });

        r.matches = r.matches.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        })
    });

    updateRank(table);

    return table;
}

function createRank(rounds) {

    var rank = [...new Set(rounds.flatMap(r => r.matches).map(m => m.homeTeam).map(teamToStr))].map(t => { return createRankObj(strToTeam(t)); });

    rounds.forEach(round => {
        round.matches.forEach(match => {
            if (match.status !== 'finalizado' && match.status !== 'em andamento') {
                return;
            }

            computeResult(rank.filter(r => r.team.code === match.homeTeam.code)[0], match);
            computeResult(rank.filter(r => r.team.code === match.awayTeam.code)[0], match);
        })
    });

    rank.sort((a, b) => b.forGoals - a.forGoals)
        .sort((a, b) => b.netGoals - a.netGoals)
        .sort((a, b) => b.victories - a.victories)
        .sort((a, b) => b.points - a.points);

    populateStatistics(rank);

    return rank;
}

export function updateRank(table) {
    table.rank = createRank(table.rounds);
}

function teamToStr(team) {
    return `${team.code}|${team.name}|${team.shield}`;
}

function strToTeam(str) {
    var data = str.split('|');

    return {
        code: data[0],
        name: data[1],
        shield: data[2]
    };
}

function createRankObj(team) {
    return {
        team,
        position: 0,
        points: 0,
        matches: 0,
        victories: 0,
        draws: 0,
        losses: 0,
        forGoals: 0,
        againtsGoals: 0,
        netGoals: 0,
        pointsPercentage: 0
    };
}

function computeResult(rank, match) {
    var againstGoals = 0;
    var forGoals = 0;
    var points = 0;

    if (match.homeTeam.code === rank.team.code) {
        points = getPoints(match)[0];
        forGoals = match.homeScore;
        againstGoals = match.awayScore;
    }
    else if (match.awayTeam.code === rank.team.code) {
        points = getPoints(match)[1];
        forGoals = match.awayScore;
        againstGoals = match.homeScore;
    }
    else {
        return;
    }

    rank.matches++;

    if (points === 3)
        rank.victories++;
    else if (points === 1)
        rank.draws++;
    else
        rank.losses++;

    rank.points += points;
    rank.forGoals += forGoals;
    rank.againtsGoals += againstGoals;
    rank.netGoals += (forGoals - againstGoals);
    rank.pointsPercentage = (rank.points / (rank.matches * 3)) * 100;
}

function getPoints(match) {
    if (match.status !== 'finalizado' && match.status !== 'em andamento')
        return [0, 0];
    else if (match.homeScore > match.awayScore)
        return [3, 0];
    else if (match.awayScore > match.homeScore)
        return [0, 3];
    else
        return [1, 1];
}

function populateStatistics(rank) {
    var i = 1;
    var continentalCupSpots = 4;
    var continentalCupQualifiersSpots = 6;

    rank.forEach(r => {
        r.position = i;

        r.isChampion = false;
        r.isInContinentalCup = false;
        r.isInContinentalCupQualifiers = false;
        r.isDescending = false;

        if (i === 1) {
            r.isChampion = true;
        }

        if (i <= continentalCupSpots) {
            r.isInContinentalCup = true;
        }

        if (i <= continentalCupQualifiersSpots) {
            r.isInContinentalCupQualifiers = true;
        }

        if (i > 16) {
            r.isDescending = true;
        }

        i++;
    });
}