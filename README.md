![Breadcrumbs Logo](https://raw.githubusercontent.com/pjflanagan/breadcrumbs/master/_readme/header.png)

# breadcrumbs

Regular apps make it easy to find business and landmarks, but what about all the unregistered things? How do you find the best place to lay a towel down in the woods for a picnic, how do you find the roads best paved for rollerblading down?

![Breadcrumbs Screenshots](https://raw.githubusercontent.com/pjflanagan/breadcrumbs/master/_readme/screenshots.png)

## SETUP
1. Install Brew
2. Install Heroku CLI
3. Run `pip install -r requirements.txt` (for Python 2.7)
4. Run `heroku local web`
5. Visit `localhost:5000`

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
| DEFAULT_COLOR | VARCHAR(12)                             |

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

Logo: `#FFFFFF` and `#E2923D`

```
THEME = {
  "red":    "#",
  "orange": "#e2923d",
  "green":  "#", 
  "blue":   "#2783d9",
  "purple": "#9212d5"
}
```
