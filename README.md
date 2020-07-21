# Node express app
Backend for booking bus tickets

### INFO
A simple Node.js and MongoDB backend application for booking bus tickets with registration and login functionality. It also provides an admin user with different role associated with it for resetting the approving the ticket and resetting the settings back to original. Please use the following link to try out the api https://parvez.tech

### Usage
Start the application using the following command
    
    npm start or node bin/www
#### Docker
For a containerised solution run the following commands
     
     docker pull grokkertech/bus_tickets:latest
     docker run -p 3000:3000 -e CONFIG__MONGODB__URI=mongodb://mongodb:27017 -e CONFIG__MONGODB__SEEDING=true  grokkertech/bus_tickets:latest
     
For a complete deployment with database please use the docker-compose file present in the project

### Exposed API
Import the collection from postman/api-collection.json to look at all the available apis

### Linting and testing
Eslint was used for linting of the code which enforce some known good practices about the coding style of javascript. For testing jest framework was used with the help of supertest.

### Authentication
This project uses simple JWT token for authentication and authorization and mongodb for a session based authentication, for initial authentication an admin user will be created you can find the username and password in db-seeds/mongo.js file. It will also populate some test data at the start of the project.

### Use cases
You can find the available use cases for this project in project-details/use_case.jpg

### Database
MongoDb (no-sql) data-base was used for storing all the required data, you can find the following schema for required collections in db-seeds/mongo.js

### Config file
You can provide the config from environment as well as from a yaml file, take a look at config.yml file in the project for environment variable use the following format

    CONFIG__MONGODB__URI=mongodb://mongodb:27017
    CONFIG__MONGODB__ARGUMENTS=authDatabase=admin
    CONFIG__JWT__EXPIRY_TIME=500
    

#####Thanks for being with me, had a lot of fun creating this 
