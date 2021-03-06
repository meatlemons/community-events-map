# community-events-map

# Local build

**UI**
1. `cd community-events-map`
2. `npm install`
3. `ng serve`

**UI Unit Tests**
1. `cd community-events-map`
2. `npm install` (if not run previously)
3. `npx jest` with optional file filter e.g. `npx jest -- filter-dialog.component.spec.ts`

**APIs**
1. `cd server` 
2. `npm install`
3. `node index.js`

**Database**
1. Requires MySQL installation and running service on localhost:3306
2. Configure new database with credentials 'root' and 'password'
3. Run script under `community-events-map/server/scripts/create_table.sql`
4. API should connect automatically and log connection ID

# Technologies

- Angular 12
- Jest
- Sass (SCSS)
- Material Library
- Google Maps API (directions and geocoding)
- RxJS
- MySQL
- Express