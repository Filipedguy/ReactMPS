import axios from 'axios';
import parseTable from './footstatsParser';

var baseUrl = 'https://footstatsapiapp.azurewebsites.net/campeonatos/850/calendario';
var token = 'Basic cG9ydGFsLWkyYTpndXYwdUFFY3FLdzc=';

var soccerApi = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: { Authorization: token }
});

export async function getData() {
    try {
        var res = await soccerApi.get();

        return parseTable(res.data);
    }
    catch (err) {
        console.error(err.message);
        console.error(err.stack);
    }
}