import './App.css';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { GetTable } from './services/tableService';
import SoccerTable from './components/SoccerTable';
import Statistics from './components/Statistics';
import React, { useState, useEffect } from 'react';
import { simulate, simulateNextMatch, simulateMatchById } from './services/simulatorService';
import EnumPicker from './components/EnumPicker';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import SimulationType from './services/enums/simulationType';
import SimulationMode from './services/enums/simulationMode';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';

let loading = false;
let loaded = false;

function needsSimulation(table) {
    if (!table) {
        return false;
    }

    return table.rounds.some(r => r.matches.some(m => m.status !== "finalizado"));
}

function totalMatches(table) {
    if (!table) {
        return 0;
    }

    return table.rounds.flatMap(r => r.matches).length;
}

function finishedMatches(table) {
    if (!table) {
        return 0;
    }

    return table.rounds.flatMap(r => r.matches).filter(m => m.status === "finalizado").length;
}

function buildAllStats() {
    var simulators = Object.enum(SimulationType);

    var stats = [];

    simulators.forEach(s => stats.push(buildStats(s.value, s.label)));

    return stats;
}

function buildStats(id, name) {
    return {
        id,
        name,
        champ: {},
        continentalCup: {},
        continentalCupQualifiers: {},
        descending: {}
    }
}

function App() {
    var [table, setTable] = useState({ loading: true });
    var [progress, setProgress] = useState(0);
    var [isSimulating, setSimulating] = useState(false);
    var [simulationType, setSimulationType] = useState(0);
    var [simulationMode, setSimulationMode] = useState(0);
    var [totalRuns, setTotalRuns] = useState(10000);

    var [statistics, setStatistics] = useState(buildAllStats);

    var [simulatedTable, setSimulatedTable] = useState();

    dayjs.extend(relativeTime);
    dayjs.locale('pt-br');

    const reset = () => {
        loading = true;
        setProgress(0);
        setStatistics(buildAllStats);
        setSimulationMode(0);
        setSimulationType(0);

        GetTable()
            .then(tbl => {
                setTable(tbl);
                setSimulatedTable(tbl);
                loading = false;
                loaded = true;
            })
            .catch(err => {
                console.log(err);
                loading = false;
            });
    };

    useEffect(() => {
        if (!loading && !loaded) {
            reset();
        };
    });

    useEffect(() => {
        if (isSimulating && progress < totalRuns && simulationMode !== SimulationMode.Table) {
            Object.enum(SimulationType).forEach(s => {
                var specificStatistics = statistics.filter(x => x.id === s.value)[0];

                var simulationResult = simulate(table, simulationType, specificStatistics);
                simulationResult.id = s.value;
                simulationResult.name = s.label;

                var newStats = [simulationResult];

                statistics.forEach(x => {
                    if (x.id !== s.value) { newStats.push(x); }
                })

                setStatistics(newStats);
            });

            setProgress(progress + 1);
        }
        else if (isSimulating && simulationMode !== SimulationMode.Chances && needsSimulation(simulatedTable)) {
            // Just ignore because table simulation is ongoing
        }
        else if (isSimulating && simulationMode !== SimulationMode.Table) {
            setSimulating(false);
        }
    }, [isSimulating, progress, statistics, table, simulationType, simulationMode, simulatedTable]);

    useEffect(() => {
        if (isSimulating && simulationMode !== SimulationMode.Chances && needsSimulation(simulatedTable)) {
            var newTable = simulateNextMatch(simulatedTable, simulationType, totalRuns);

            setSimulatedTable(newTable);
        }
        else if (isSimulating && progress < totalRuns && simulationMode !== SimulationMode.Table) {
            // Just ignore because chances simulation is ongoing
        }
        else if (isSimulating && simulationMode !== SimulationMode.Chances) {
            setSimulating(false);
        }
    }, [isSimulating, progress, statistics, simulatedTable, simulationType, simulationMode]);

    var run = () => {
        setSimulating(!isSimulating);
    };

    var handleSimulateRequest = (matchId) => {
        var newTable = simulateMatchById(matchId, simulatedTable, simulationType, totalRuns);

        setSimulatedTable(newTable);
    };

    var title = isSimulating ? "Stop" : "Run";
    var color = isSimulating ? "warning" : "success";

    var teams = table?.rank?.map(r => r.team);

    return (
        <div className="App">
            {(table.loading || loading)
                ? "Loading..."
                : <Container>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="h1" sx={{ fontFamily: "Caprasimo" }}>ProbSim</Typography>
                        </Grid>
                        <Grid item xs={12} mb={2}>
                            <TextField type="number" label="Simulações" value={totalRuns} disabled={isSimulating} onChange={(event) => setTotalRuns(event.target.value)} />
                            <EnumPicker enum={SimulationMode} label="Tipo" disabled={isSimulating} value={simulationMode} onChange={(type) => setSimulationMode(type)} sx={{ ml: 1 }} />
                            <EnumPicker enum={SimulationType} label="Algoritimo" disabled={isSimulating} value={simulationType} onChange={(type) => setSimulationType(type)} sx={{ ml: 1 }} />
                            <Button variant="outlined" color={color} onClick={run} sx={{ height: "100%", ml: 1 }}>{title}</Button>
                            <Button variant="outlined" disabled={isSimulating} color="error" onClick={reset} sx={{ height: "100%", ml: 1 }}>Reset</Button>
                        </Grid>
                        {(simulationMode !== SimulationMode.Table && isSimulating) ? (
                            <>
                                <Grid item xs={2}>
                                </Grid>
                                <Grid item xs={8} mb={2}>
                                    Chances
                                    <LinearProgress variant="determinate" value={(progress / totalRuns) * 100} />
                                    <Typography variant="body1">{progress}/{totalRuns}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                </Grid>
                            </>
                        ) : ''}
                        {(simulationMode !== SimulationMode.Chances && isSimulating) ? (
                            <>
                                <Grid item xs={2}>
                                </Grid>
                                <Grid item xs={8} mb={2}>
                                    Table
                                    <LinearProgress variant="determinate" value={(finishedMatches(simulatedTable) / totalMatches(simulatedTable)) * 100} />
                                    <Typography variant="body1">{finishedMatches(simulatedTable)}/{totalMatches(simulatedTable)}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                </Grid>
                            </>
                        ) : ''}
                    </Grid>
                    {simulationMode !== SimulationMode.Table ? <Statistics total={progress} teams={teams} statistics={statistics.filter(s => s.id === simulationType)[0]} /> : ""}
                    {simulationMode !== SimulationMode.Chances ? <SoccerTable table={simulatedTable} test="true" onSimulateRequest={handleSimulateRequest} /> : ""}
                </Container>
            }
        </div>
    );
}

export default App;
