import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Matches from './Matches';

export default function SoccerTable(props) {
    var handleSimulateRequest = (matchId) => {
        props.onSimulateRequest?.(matchId);
    };

    return (
        <Container>
            <Grid container>
                <Grid item xs={8}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>POS</TableCell>
                                    <TableCell>TIME</TableCell>
                                    <TableCell>P</TableCell>
                                    <TableCell>J</TableCell>
                                    <TableCell>V</TableCell>
                                    <TableCell>E</TableCell>
                                    <TableCell>D</TableCell>
                                    <TableCell>GP</TableCell>
                                    <TableCell>GC</TableCell>
                                    <TableCell>SG</TableCell>
                                    <TableCell>APR</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {props.table.rank.map(r => <Row data={r} />)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={4}>
                    <Matches rounds={props.table.rounds} onSimulateRequest={handleSimulateRequest} />
                </Grid>
            </Grid>
        </Container>
    );
}

function Row(props) {
    var color = props.data.isChampion ? "blue" :
        (props.data.isInContinentalCup ? "green" :
            (props.data.isInContinentalCupQualifiers ? "lightgreen" :
                (props.data.isDescending ? "red" : "black")
            )
        );

    return (
        <TableRow key={props.data.team.name}>
            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", color: color }}>{props.data.position}</TableCell>
            <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>{props.data.team.name}</TableCell>
            <TableCell>{props.data.points}</TableCell>
            <TableCell>{props.data.matches}</TableCell>
            <TableCell>{props.data.victories}</TableCell>
            <TableCell>{props.data.draws}</TableCell>
            <TableCell>{props.data.losses}</TableCell>
            <TableCell>{props.data.forGoals}</TableCell>
            <TableCell>{props.data.againtsGoals}</TableCell>
            <TableCell>{props.data.netGoals}</TableCell>
            <TableCell>{props.data.pointsPercentage.toFixed(0)} %</TableCell>
        </TableRow>
    );
}