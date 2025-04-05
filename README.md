# Real-time notifications using websockets

### Backend
- bun, typescript
- express@5
- socket.io
- sqlite3

### Web
- react (`vite`)
- socket.io-client

---

## Run project

### Backend setup

- clone the repo
  ```bash
  git clone https://github.com/theonlysroy/socket-notify.git
  ```

- navigate to the the `backend` folder
  ```bash
  cd backend
  ```

- create necessary files and folders
  ```bash
  # create .env file and `socketNotify.db` for the sqlite3 database
  touch .env socketNotify.db

  # copy the env variables from .env.example and then change with your own values
  cp ./.env.example ./.env
  ```

- Install dependencies and start the project
  ```bash
  bun install
  bun run --watch index.ts
  ```

### Frontend setup

- navigate to the `web` folder from the root
  ```bash
  cd web
  ```

- create `environment` files
  ```bash
  touch .env
  cp ./.env.example ./.env  # copy the env variables from the example and change with own values
  ```

- Install the dependencies and start project
  ```bash
  bun install
  bun dev
  ```
