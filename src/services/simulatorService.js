import SimulationType from './enums/simulationType';
import RandomSimulation from './simulationStrategies/randomSimulation';
import SemiRandomSimulation from './simulationStrategies/semiRandomSimulation';
import IndexSimulation from './simulationStrategies/indexSimulation';
import GPTSimulation from './simulationStrategies/gptSimulation';
import { updateRank } from './tableService';
import cloneDeep from 'lodash.clonedeep';

export function simulate(table, simulationType, statistics) {
    var simulator = getSimulationStrategy(simulationType);
    var clonedTable = cloneDeep(table);

    var champStatistics = statistics.champ;
    var continentalCupStatistics = statistics.continentalCup;
    var continentalCupQualifiersStatistics = statistics.continentalCupQualifiers;
    var descendedStatistics = statistics.descending;

    simulateTable(clonedTable, simulator);

    registerTeam(champStatistics, clonedTable.rank.filter(r => r.isChampion)[0].team.code);
    clonedTable.rank.filter(r => r.isInContinentalCup).forEach(r => registerTeam(continentalCupStatistics, r.team.code));
    clonedTable.rank.filter(r => r.isInContinentalCupQualifiers).forEach(r => registerTeam(continentalCupQualifiersStatistics, r.team.code));
    clonedTable.rank.filter(r => r.isDescending).forEach(r => registerTeam(descendedStatistics, r.team.code));

    return {
        champ: champStatistics,
        continentalCup: continentalCupStatistics,
        continentalCupQualifiers: continentalCupQualifiersStatistics,
        descending: descendedStatistics
    };
}

export function simulateNextMatch(table, simulationType, runs) {
    var clonedTable = cloneDeep(table);

    var match = clonedTable.rounds.flatMap(r => r.matches).filter(m => m.status !== 'finalizado')[0];

    return simulateMatch(match, clonedTable, simulationType, runs);
}

export function simulateMatchById(matchId, table, simulationType, runs) {
    var clonedTable = cloneDeep(table);

    var match = clonedTable.rounds.flatMap(r => r.matches).filter(m => m.id === matchId)[0];

    return simulateMatch(match, clonedTable, simulationType, runs);
}

export function simulateAll(table, runs, simulator) {
    var champStatistics = {};
    var continentalCupStatistics = {};
    var continentalCupQualifiersStatistics = {};
    var descendedStatistics = {};

    for (var i = 0; i < runs; i++) {
        var clonedTable = cloneDeep(table);

        simulateTable(clonedTable, simulator);

        registerTeam(champStatistics, clonedTable.rank.filter(r => r.isChampion)[0].team.code);
        clonedTable.rank.filter(r => r.isInContinentalCup).forEach(r => registerTeam(continentalCupStatistics, r.team.code));
        clonedTable.rank.filter(r => r.isInContinentalCupQualifiers).forEach(r => registerTeam(continentalCupQualifiersStatistics, r.team.code));
        clonedTable.rank.filter(r => r.isDescending).forEach(r => registerTeam(descendedStatistics, r.team.code));
    }

    return {
        champStatistics,
        continentalCupStatistics,
        continentalCupQualifiersStatistics,
        descendedStatistics
    };
}

function simulateAllImproved(table, runs, simulator) {
    var champStatistics = {};
    var continentalCupStatistics = {};
    var continentalCupQualifiersStatistics = {};
    var descendedStatistics = {};

    for (var i = 0; i < runs; i++) {
        var clonedTable = cloneDeep(table);

        simulateTableImproved(clonedTable, simulator);

        registerTeam(champStatistics, clonedTable.rank.filter(r => r.isChampion)[0].team.code);
        clonedTable.rank.filter(r => r.isInContinentalCup).forEach(r => registerTeam(continentalCupStatistics, r.team.code));
        clonedTable.rank.filter(r => r.isInContinentalCupQualifiers).forEach(r => registerTeam(continentalCupQualifiersStatistics, r.team.code));
        clonedTable.rank.filter(r => r.isDescending).forEach(r => registerTeam(descendedStatistics, r.team.code));
    }

    return {
        champStatistics,
        continentalCupStatistics,
        continentalCupQualifiersStatistics,
        descendedStatistics
    };
}

export function simulateMatch(match, table, simulationType, runs) {
    var simulator = getSimulationStrategy(simulationType);
    var simulatedMatches = [];

    match.status = "em progresso";

    if (match) {
        for (var i = 0; i < runs; i++) {
            var clonedMatch = cloneDeep(match);

            simulator(clonedMatch, table.rank);
            simulatedMatches.push(clonedMatch);
        }

        var avgHome = simulatedMatches.avg(m => m.homeScore);
        var avgAway = simulatedMatches.avg(m => m.awayScore);

        match.homeScore = Math.round(avgHome);
        match.awayScore = Math.round(avgAway);

        match.statistics = {
            homeChances: simulatedMatches.count(m => m.homeScore > m.awayScore) / simulatedMatches.length,
            awayChances: simulatedMatches.count(m => m.homeScore < m.awayScore) / simulatedMatches.length,
            drawChances: simulatedMatches.count(m => m.homeScore === m.awayScore) / simulatedMatches.length
        };

        if (match.homeScore === match.awayScore) {
            if (match.statistics.homeChances > 0.5) {
                match.homeScore++;
            }
            else if (match.statistics.awayChances > 0.5) {
                match.awayScore++;
            }
        }

        match.status = "finalizado";
    }

    updateRank(table);

    return table;
}

function simulateTable(table, simulator) {
    table.rounds.forEach(r => {
        r.matches.forEach(m => {
            if (m.status !== "finalizado" && m.status !== "em andamento") {
                simulator(m, table.rank);
            }
        });

        updateRank(table);
    });
}

function simulateTableImproved(table, simulator) {
    table.rounds.forEach(r => {
        r.matches.forEach(m => {
            if (m.status !== "finalizado" && m.status !== "em andamento") {
                simulator(m, table.rank.filter(r => r.team.code === m.homeTeam.code)[0], table.rank.filter(r => r.team.code === m.awayTeam.code)[0]);
            }
        });
    });

    updateRank(table);
}

function getSimulationStrategy(type) {
    if (type === SimulationType.GPT) {
        return GPTSimulation;
    }
    else if (type === SimulationType.Index) {
        return IndexSimulation;
    }
    else if (type === SimulationType.SemiRandom) {
        return SemiRandomSimulation;
    }
    else if (type === SimulationType.Random) {
        return RandomSimulation;
    }

    return;
}

function registerTeam(dict, team) {
    if (!dict[team]) {
        dict[team] = 1;
    }
    else {
        dict[team]++;
    }
}