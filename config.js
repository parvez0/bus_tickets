const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

const filePath = process.env.CONFIG_FILE_PATH || path.join(__dirname, '/config.yml');
let configFile = null;

try {
    if (process.env.CONFIG) {
        logger.info('Config is provided in the environment variable as json string');
        configFile = JSON.parse(process.env.CONFIG);
    } else {
        logger.info('Reading config file from:', filePath);
        configFile = fs.readFileSync(path.resolve(filePath), 'utf-8');
        configFile = yaml.parse(configFile);
    }
} catch (e) {
    logger.error(`Failed to parse config - ${process.env.CONFIG || filePath}, exiting the process -`, e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
}

module.exports = configFile;
