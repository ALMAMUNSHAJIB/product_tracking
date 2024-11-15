1. Clone the repository:

2. Change directory to the project folder:


3. Install project dependencies:
- Using npm:
  ```
  npm install
  ```
- Or using Yarn:
  ```
  yarn install
  ```

4. Set up environment variables:
- Create a `.env` file in the root of the project.
- Add the required environment variables. For example:
  ```
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_NAME=your_database_name
  DATABASE_USER=your_database_user
  DATABASE_PASSWORD=your_database_password
  ```

## Running the Project

To run the project in development mode:

1. Start the application:
- Using npm:
  ```
  npm run start:dev
  ```
- Or using Yarn:
  ```
  yarn start:dev
  ```

2. The application will be running at `http://localhost:3000` by default.

## Running Migrations (if applicable)

If your project uses migrations to manage database schema changes, you can run the following commands:

1. To run migrations: npx knex migrate:latest

http://localhost:3000/api (swagger
