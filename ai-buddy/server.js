import 'dotenv/config';

import app from './src/app.js';
import http from 'http';
import {initSocketServer} from './src/sockets/socket.server.js';
const httpServer = http.createServer(app);
initSocketServer(httpServer);

app.listen(3005, () => {
  console.log('ai-buddy server is running on port 3005');
});