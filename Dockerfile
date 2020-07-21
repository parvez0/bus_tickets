FROM node:14
# creating working home directory for docker container
WORKDIR /app
# copying all the project files
COPY . /app
# installing production dependencies
RUN npm install --production
# available enviroment variables
ENV CONFIG_FILE_PATH='/app/config.yml'
ENV PORT=3000
ENV LOGGER_LOG_LEVEL='info'

CMD ["node", "bin/www"]
