
import 'dotenv/config';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN : "";
const DB = process.env.DB ? process.env.DB : "";
const DBUSER = process.env.DBUSER ? process.env.DBUSER : "";
const DBPASS = process.env.DBPASS ? process.env.DBPASS : "";
const DBHOST = process.env.DBHOST ? process.env.DBHOST : "";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8088;

//export all these constants
export { DB, DBHOST, DBPASS, DBUSER, PORT, TELEGRAM_BOT_TOKEN };

