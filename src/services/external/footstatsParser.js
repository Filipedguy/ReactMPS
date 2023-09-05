import dayjs from 'dayjs';

export default function parseTable(response) {
    return {
        table: {
            rounds: response.data.rodadas.map(r => parseRound(r))
        }
    };
}

function parseRound(round) {
    return {
        roundNumber: round.rodada,
        matches: round.partidas.map(m => parseMatch(m, round.rodada))
    };
}

function parseMatch(match, roundNumber) {
    return {
        id: match.id,
        homeTeam: parseTeam(match.mandante),
        awayTeam: parseTeam(match.visitante),
        homeScore: match.mandante.gols,
        awayScore: match.visitante.gols,
        status: parseStatus(match.periodoJogo),
        round: roundNumber,
        date: dayjs(match.dataHora).format(),
        period: match.periodoJogo,
        stadium: undefined
    }
}

function parseTeam(team) {
    return {
        code: team.sigla,
        name: team.nome,
        shield: team.urlLogo
    };
}

function parseStatus(status) {
    if (status === "Final") {
        return "finalizado";
    }
    else if (status === "Não Inic.") {
        return "agendado";
    }
    else {
        return "em andamento";
    }
}

function parseStadium(stadium) {
    if (!stadium) {
        return null;
    }

    return {
        id: stadium.estadio_id,
        name: stadium.nome_popular
    };
}