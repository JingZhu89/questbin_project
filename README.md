# questbin_project db setup

# createdb questbin_project

- psql -d questbin_project < schema.sql or sudo -u postgres psql -d questbin_project < schema.sql in DO

- add a .env file to the root project with ethe following variables
  - PGUSER="postgres"
  - PGPASSWORD="yourpassword"
  - PORT=3001
  - PRODURL = "https://app.jingzwork.space/questbin/"
  - DEVURL = "http://localhost:3001/questbin/"
