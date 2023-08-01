import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function Statistics(props) {
    if (props.total === 0) {
        return (<></>);
    }

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <StatisticsTable title="Campeão" total={props.total} teams={props.teams} data={props.statistics.champ} /> <br />
                </Grid>
                <Grid item xs={3}>
                    <StatisticsTable title="Libertadores" total={props.total} teams={props.teams} data={props.statistics.continentalCup} /> <br />
                </Grid>
                <Grid item xs={3}>
                    <StatisticsTable title="Pré-libertadores" total={props.total} teams={props.teams} data={props.statistics.continentalCupQualifiers} /> <br />
                </Grid>
                <Grid item xs={3}>
                    <StatisticsTable title="Rebaixamento" total={props.total} teams={props.teams} data={props.statistics.descending} /> <br />
                </Grid>
            </Grid>
        </Container>
    );
}

function StatisticsTable(props) {
    var chancesDic = Object.entries(props.data).map(entry => {
        const [key, value] = entry;

        return {
            team: props.teams.filter(t => t.code === key)[0].name,
            chances: ((value / props.total) * 100).toFixed(2)
        };
    });

    chancesDic.sort((a, b) => b.chances - a.chances);

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6">{props.title}</Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Chances</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {chancesDic.map(c => <Row data={c} />)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function Row(props) {
    return (
        <TableRow key={props.data.team}>
            <TableCell component="th" scope="row">
                {props.data.team}
            </TableCell>
            <TableCell align="right">{props.data.chances}</TableCell>
        </TableRow>
    );
}