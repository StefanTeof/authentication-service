# GameX App

## Prerequisites
- [Docker](https://www.docker.com/) (tested with version 27.5.1)
- [Git](https://git-scm.com/)
## Start Project

### 1. Clone the Project

```bash
git clone https://github.com/your-username/gamex-app.git
```

### 2. Go to user-service
```bash
cd gamex-app/user-service
```

### 3. Create env file
```bash
cp .env.example .env
```

### 4. Run docker compose
```bash
docker-compose up --build
```