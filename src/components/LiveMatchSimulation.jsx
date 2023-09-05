import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { Typography } from '../../node_modules/@mui/material/index';
import { randomIntFromInterval } from '../services/randomService';

const FieldProgress = styled(LinearProgress)(({ theme }) => ({
    height: '15px',
    borderRadius: '7px',
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.primary.main,
    },
    [`& .${linearProgressClasses.bar}`]: {
        backgroundColor: theme.palette.warning.main
    }
}));

export default function LiveMatchSimulation(props) {
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState({
        simulating: false,
        homeScore: 0,
        awayScore: 0,
        gameTime: 0,
        halfTime: false,
        intervalTime: 0,
        fieldProgress: 50,
        homePossession: true,
        goal: false,
        goalTime: 0,
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const toggleSimulating = () => {
        var newData = { ...data };

        newData.simulating = !data.simulating;

        setData(newData);
    }

    const getStats = (team) => {
        return props.rank.filter(r => r.team.code === team.code)[0];
    }

    const logic = (newData) => {
        if (newData.halfTime) {
            newData.intervalTime++;

            if (newData.intervalTime >= 20) {
                newData.halfTime = false;
                newData.fieldProgress = 50;
                newData.homePossession = false;
            }
        }
        else if (newData.goal) {
            newData.goalTime++;

            if (newData.goalTime >= 10) {
                newData.goal = false;
                newData.goalTime = 0;
                newData.homePossession = !newData.homePossession;
                newData.fieldProgress = 50;
            }
        }
        else {
            if (newData.gameTime >= 90) {
                newData.simulating = false;

                return;
            }

            gameLogic(newData);

            if (newData.gameTime > 45 && newData.intervalTime <= 0) {
                newData.halfTime = true;
            }
        }
    }

    const gameLogic = (newData) => {
        newData.gameTime++;

        var progression = calculateEvolution(newData);
        var stealChance = calculateStealChange(newData);

        if (randomIntFromInterval(0, 100) < stealChance) {
            newData.homePossession = !newData.homePossession;

            return;
        }

        newData.fieldProgress += progression * (newData.homePossession ? 1 : -1);

        scoreLogic(newData);
    }

    const calculateStealChange = (newData) => {
        var stealChances = (newData.homePossession
            ? newData.fieldProgress
            : 100 - newData.fieldProgress) / 2;

        var homeStats = getStats(props.match.homeTeam);
        var awayStats = getStats(props.match.awayTeam);

        if (stealChances > 35) {
            stealChances = 35;
        }
        else if (stealChances < 5) {
            stealChances = 5;
        }

        var perfIndex = newData.homePossession ? homeStats.position - awayStats.position : awayStats.position - homeStats.position;

        return stealChances + perfIndex;
    }

    const calculateEvolution = (newData) => {
        var realProgress = newData.homePossession
            ? newData.fieldProgress - 50
            : 50 - newData.fieldProgress;

        if (realProgress < 0) {
            return randomIntFromInterval(-5, 20);
        }
        else if (realProgress < 20) {
            return randomIntFromInterval(-5, 10);
        }
        else {
            return randomIntFromInterval(-5, 5);
        }
    }

    const scoreLogic = (newData) => {
        var realProgress = newData.homePossession
            ? newData.fieldProgress - 60
            : 40 - newData.fieldProgress;

        var goalChance = (realProgress + goalIndex(newData));

        if (randomIntFromInterval(0, 100) < goalChance) {
            if (newData.homePossession) {
                newData.homeScore++;
            }
            else {
                newData.awayScore++;
            }

            newData.goal = true;
        }
    }

    const goalIndex = (newData) => {
        var homeStats = getStats(props.match.homeTeam);
        var awayStats = getStats(props.match.awayTeam);

        if (newData.homePossession) {
            return ((homeStats.forGoals / homeStats.matches) + (awayStats.againtsGoals / awayStats.matches)) * 2;
        }
        else {
            return ((awayStats.forGoals / awayStats.matches) + (homeStats.againtsGoals / homeStats.matches)) * 2;
        }
    }

    React.useEffect(() => {

        if (data.simulating) {
            var timeoutId = setTimeout(() => {
                var newData = { ...data };

                logic(newData);

                setData(newData);
            }, 300);
        }

        return () => { if (timeoutId) { clearTimeout(timeoutId); } };
    }, [data]);

    var buttonText = data.simulating ? "Stop" : "Start";
    var gameTimeTitle = data.halfTime ? "Half-time" : (data.goal ? "GOAL!!!" : data.gameTime);

    var homeTeamName = data.homePossession ? <strong>{props.match.homeTeam.name}</strong> : props.match.homeTeam.name;
    var awayTeamName = data.homePossession ? props.match.awayTeam.name : <strong>{props.match.awayTeam.name}</strong>;

    return (
        <div>
            <Button size="small" variant="outlined" disabled={props.disabled} onClick={handleClickOpen}>Live</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Live Match</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography>{gameTimeTitle}</Typography>
                        <Typography>{homeTeamName} {data.homeScore} x {data.awayScore} {awayTeamName}</Typography>
                        <FieldProgress variant="determinate" value={data.fieldProgress} />
                    </DialogContentText>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => toggleSimulating()}>{buttonText}</Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}