### ECE 444 Group 1 Web Application - SwapSquad
For this project we went with a monolithic repository structure with separate microservices.
These microservices talk with each other using CRUD APIs. 

### For project management, we are using JIRA.

#### FrontEnd Languages and Frameworks: React, TypeScript & MUI Component Library<br/>
#### BackEnd Languages and Frameworks: Python 
#### Database used: PostgresSQL

To run each of the individual microservices locally you have two approaches:

Method 1: 
``` 
1. Clone the folder called local and run the docker compose yaml file. (Instructions inside local folder readme file)
2. This will load the latest docker images of all the repositories and allow you to run the app from docker.  
```

Method 2: 
```
1. Clone the root repository.
2. Go into frontEnd, backEnd, and local folder and follow each readme instructions.
3. Ensure the frontEnd and backEnd docker images are not running as you will be running them from your IDE terminals.
4. In this method docker image would be mainly used to run the Database instance.
```


[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=15919237&assignment_repo_type=AssignmentRepo)


