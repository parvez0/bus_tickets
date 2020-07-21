const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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

try {
    _.map(process.env, (value, key) => {
        if (key && key.startsWith('CONFIG__')) {
            const configKeys = key.split('__');
            // eslint-disable-next-line default-case
            switch (configKeys.length) {
            case 2: configFile[key[1]] = value;
                break;
            case 3: configFile[configKeys[1]][configKeys[2]] = value;
                break;
            case 4: configFile[configKeys[1]][configKeys[2]][configKeys[3]] = value;
                break;
            case 5: configFile[configKeys[1]][configKeys[2]][configKeys[3]][configKeys[4]] = value;
                break;
            }
        }
    });
} catch (e) {
    console.log('[CONFIG] Failed to read config variables from environment: ', e.message);
}

module.exports = configFile;
