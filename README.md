# breadcrumbs

Regular apps make it easy to find business and landmarks, but what about all the unregistered things? How do you find the best place to lay a towel down in the woods for a picnic, how do you find the roads best paved for rollerblading down?

## SETUP
1. Install Brew
2. Install Heroku CLI
3. Run "pip install -r requirements.txt" (for Python 2.7)
4. Run "heroku local web"
5. Visit localhost:5000

## Login To SQL Server
```
mysql -h <host> -u <user> -p
<password>
use heroku_6b02ccad46cca00;
show tables;
```

### USERS
| COLUMN        | TYPE                                    |
| ------------- |:---------------------------------------:|
| ID            | INT NOT NULL AUTO_INCREMENT PRIMARY KEY | INCORRECT (SEE user_table.sql)
| USERNAME      | VARCHAR(12)                             |
| COLOR         | VARCHAR(12)                             |

## Mongo
```
mongo <host> -u <user> -p
```

## RUN LOCALLY
```
heroku local web
ps -ax | grep gunicorn
kill <running process id>
```

## COLORS
Logo: #FFFFFF #E2923D
```
THEME = {
  "red":    "#",
  "orange": "#e2923d",
  "green":  "#", 
  "blue":   "#2783d9",
  "purple": "#9212d5"
}
```
https://s3-us-west-2.amazonaws.com/sticks-and-stones/assets/marker-COLOR.png