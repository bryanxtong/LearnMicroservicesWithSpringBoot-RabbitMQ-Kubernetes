class GameApiClient {
    // k8s/kind: traffic goes through Ingress → /api prefix is stripped by nginx-ingress rewrite
    // local dev: set REACT_APP_API_URL=http://localhost:8000 before npm start
    static SERVER_URL = process.env.REACT_APP_API_URL || '/api';
    static GET_LEADERBOARD = '/leaders';

    static leaderBoard(): Promise<Response> {
        return fetch(GameApiClient.SERVER_URL +
            GameApiClient.GET_LEADERBOARD);
    }

}

export default GameApiClient;