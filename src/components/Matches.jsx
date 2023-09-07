import React from 'react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import LiveMatchSimulation from './LiveMatchSimulation';

export default function Matches(props) {
    var allMatches = props.rounds.flatMap(r => r.matches);
    var initialRound = 38;

    if (allMatches.some(m => m.status === "em andamento")) {
        initialRound = (allMatches.filter(m => m.status === "em andamento" && m.date).sort(m => m.date))[0].round;
    }

    else if (allMatches.some(m => m.status === "agendado")) {
        initialRound = (allMatches.filter(m => m.status === "agendado" && m.date).sort(m => m.date))[0].round;
    }

    var [currentRound, setCurrentRound] = React.useState(initialRound - 1);

    var previousDisabled = currentRound === 0;
    var previousRound = () => {
        if (previousDisabled) {
            return;
        }

        setCurrentRound(currentRound - 1);
    }

    var nextDisabled = currentRound === 37;
    var nextRound = () => {
        if (nextDisabled) {
            return;
        }

        setCurrentRound(currentRound + 1);
    }

    var handleSimulateRequest = (matchId) => {
        props.onSimulateRequest?.(matchId);
    };

    return (
        <Stack>
            <Stack direction="row">
                <Button disabled={previousDisabled} onClick={previousRound}><ArrowBackIcon /></Button>
                <Typography variant="h5">Rodada {currentRound + 1}</Typography>
                <Button disabled={nextDisabled} onClick={nextRound}><ArrowForwardIcon /></Button>
            </Stack>
            {props.rounds[currentRound].matches.map(m => <Match key={m.id} data={m} rank={props.rank} onSimulateRequest={handleSimulateRequest}></Match>)}
        </Stack>
    );
}

function Match(props) {
    var handleSimulateRequest = () => {
        props.onSimulateRequest?.(props.data.id);
    };

    var percent = (value) => {
        return `${(value * 100).toFixed()}%`;
    };

    var dateAndLocation = (data) => {

        if (data.date) {
            var dateComponent = (
                <Typography variant="caption" sx={{ fontSize: "0.7 rem" }}><strong>{dayjs(data.date).format('ddd DD/MM/YYYY').toUpperCase()}</strong> {data.stadium?.name.toUpperCase()} <strong>{dayjs(data.date).format('HH:mm').toUpperCase()}</strong></Typography>
            );
        }
        else {
            var dateComponent = "";
        }

        if (data.status === "em andamento") {
            return (
                <Badge badgeContent={data.gameTime} color="error">
                    {dateComponent}
                </Badge>
            )
        }
        else {
            return dateComponent;
        }
    };

    var color = (data, defaultColor) => {
        if (data.status === "em andamento") {
            return "error.main";
        }

        return defaultColor;
    };

    return (
        <Card>
            <CardContent>
                {dateAndLocation(props.data)}
                <Stack direction="row" justifyContent="center" spacing={1}>
                    <Typography variant="h6">{props.data.homeTeam.code}</Typography>
                    <img src={props.data.homeTeam.shield} alt={props.data.homeTeam.code} width={32} height={32} />
                    <Typography variant="h5" color={color(props.data)} >{props.data.homeScore}</Typography>
                    <Typography variant="h6" color={color(props.data, "lightgray")} >x</Typography>
                    <Typography variant="h5" color={color(props.data)} >{props.data.awayScore}</Typography>
                    <img src={props.data.awayTeam.shield} alt={props.data.awayTeam.code} width={32} height={32} />
                    <Typography variant="h6">{props.data.awayTeam.code}</Typography>
                </Stack>
                <Chances statistics={props.data.statistics} />
            </CardContent>
            <CardActions>
                <Container>
                    <Stack direction="row" justifyContent="center" spacing={1}>
                        <Button size="small" variant="outlined" disabled={props.data.status === "finalizado"} onClick={handleSimulateRequest}>Simulate</Button>
                        {/* This feature should not be on production yet */}
                        {/* <LiveMatchSimulation match={props.data} rank={props.rank} disabled={props.data.status === "finalizado"} /> */}
                    </Stack>
                </Container>
            </CardActions>
        </Card>
    );
}

function Chances(props) {
    if (!props.statistics) {
        return "";
    }

    var percent = (value) => {
        return `${(value * 100).toFixed()}%`;
    };

    var homeColor = (props.statistics.homeChances > props.statistics.awayChances && props.statistics.homeChances > props.statistics.drawChances) ? "success" : "warning";
    var drawColor = (props.statistics.drawChances > props.statistics.homeChances && props.statistics.drawChances > props.statistics.awayChances) ? "success" : "warning";
    var awayColor = (props.statistics.awayChances > props.statistics.homeChances && props.statistics.awayChances > props.statistics.drawChances) ? "success" : "warning";

    return (
        <Container sx={{ mt: 1 }} >
            <Stack direction="row" justifyContent="space-around" spacing={1}>
                <Chip size="small" variant="outlined" color={homeColor} label={percent(props.statistics.homeChances)} />
                <Chip size="small" variant="outlined" color={drawColor} label={percent(props.statistics.drawChances)} />
                <Chip size="small" variant="outlined" color={awayColor} label={percent(props.statistics.awayChances)} />
            </Stack>
        </Container>
    );
}