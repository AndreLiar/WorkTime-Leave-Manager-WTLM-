# WorkTime Leave Manager API

API REST moderne en Node.js avec NestJS pour gérer les temps de travail et les congés des employés.

## 📚 Documentation

**📖 [Documentation Technique Complète (Docusaurus)](./docs/)**

La documentation technique complète est disponible dans le dossier `docs/` :
- Guide de démarrage rapide
- Architecture du système
- Référence API complète
- Schéma de base de données
- Guide de déploiement
- **🔄 [Versioning & Rollback Guide](./docs/DEPLOYMENT_VERSIONING.md)**
- **🔵 [PR Pipeline Guide](./docs/PR_PIPELINE.md)** - New!

Pour consulter la documentation :
```bash
cd docs
npm install
npm start
```

## Fonctionnalités

- API REST avec NestJS
- PostgreSQL avec Prisma ORM
- TypeScript configuré
- ESLint pour le linting
- Tests unitaires avec Jest
- Docker et Docker Compose pour la containerisation
- CI/CD avec GitHub Actions
- Documentation technique avec Docusaurus

## Prérequis

- Node.js 18+
- npm
- Docker et Docker Compose
- PostgreSQL (optionnel si vous utilisez Docker)

## Installation

```bash
# Cloner le repository
git clone https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-.git
cd WorkTime-Leave-Manager-WTLM-

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Démarrer PostgreSQL avec Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate
```

## Démarrage

### Mode développement
```bash
npm run start:dev
```

### Mode production
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Avec Docker Compose
```bash
# Build et démarrer tous les services (PostgreSQL + App)
docker-compose up --build

# Ou en mode détaché
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

Voir [docs/DOCKER-COMPOSE.md](./docs/DOCKER-COMPOSE.md) pour plus de détails.

## Tests

```bash
# Run tous les tests
npm test

# Run tests en mode watch
npm run test:watch

# Run tests avec coverage
npm run test:cov
```

## Linting

```bash
# Vérifier TypeScript
npm run ts

# Linter le code
npm run lint
```

## API Endpoints

### GET /
Retourne les informations générales de l'API
```json
{
  "message": "Welcome to WorkTime Leave Manager API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "root": "/"
  }
}
```

### GET /health
Retourne le statut de santé de l'API
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T09:31:17.294Z",
  "uptime": 123.456
}
```

## Workflow Git

Le projet utilise deux branches principales :
- `develop` / `staging` : pour le développement
- `main` : pour la production

### CI/CD Pipeline

#### PR Pipeline (Feature → Dev) **NEW!**
La pipeline PR se déclenche sur les Pull Requests vers `dev` :
1. ✅ **Code Quality** - ESLint, TypeScript, Prettier
2. ✅ **Unit Tests** - With coverage reporting
3. ✅ **Build & Security** - Container vulnerability scanning
4. ✅ **Dependency Scan** - npm audit + Snyk
5. ✅ **SAST Scan** - CodeQL static analysis
6. ✅ **Integration Tests** - Full API testing with database
7. ✅ **PR Summary** - Automated status comment

**See [PR Pipeline Guide](./docs/PR_PIPELINE.md) for details.**

#### CI Pipeline
La pipeline CI se déclenche automatiquement sur chaque Pull Request vers `main` et vérifie :
1. Installation des dépendances
2. Vérification TypeScript
3. Linting du code
4. Tests unitaires
5. Build de l'application

#### CD Pipeline (with Versioning & Rollback)
La pipeline CD se déclenche automatiquement sur push vers `main` :
1. ✅ **Automatic Semantic Versioning** - Creates version tag (YYYY.MM.DD-SHA)
2. ✅ **Docker Build & Push** - Tagged with version to GHCR
3. ✅ **Deployment to Render** - Monitored via API
4. ✅ **Smoke Tests** - Automatic endpoint validation
5. ✅ **Rollback Ready** - Can revert to any previous version

**See [Deployment Versioning Guide](./docs/DEPLOYMENT_VERSIONING.md) for rollback procedures.**

## Scripts npm

- `npm run build` : Compile le projet TypeScript
- `npm run start` : Démarre l'application en mode production
- `npm run start:dev` : Démarre l'application en mode développement
- `npm run lint` : Lint le code avec ESLint
- `npm run ts` : Vérifie les types TypeScript
- `npm test` : Exécute les tests
- `npm run test:watch` : Exécute les tests en mode watch
- `npm run test:cov` : Exécute les tests avec couverture
- `npm run prisma:generate` : Génère le client Prisma
- `npm run prisma:migrate` : Crée et applique une migration
- `npm run prisma:migrate:deploy` : Applique les migrations (production)
- `npm run prisma:studio` : Ouvre Prisma Studio (interface GUI)

## Structure du projet

```
.
├── .github/
│   └── workflows/
│       ├── pr-pipeline.yml          # PR Pipeline (feature→dev) (NEW)
│       ├── ci.yml                   # CI Pipeline
│       ├── cd.yml                   # CD with versioning
│       ├── rollback.yml             # Rollback workflow
│       └── list-versions.yml        # Version listing
├── docs/
│   ├── DEPLOYMENT_VERSIONING.md     # Versioning & rollback guide
│   └── PR_PIPELINE.md               # PR pipeline guide (NEW)
├── prisma/
│   └── schema.prisma       # Schéma de base de données Prisma
├── src/
│   ├── database/
│   │   ├── prisma.service.ts    # Service Prisma
│   │   └── database.module.ts   # Module de base de données
│   ├── modules/
│   │   ├── health/              # Module health check
│   │   └── leave-request/       # Module gestion des congés
│   ├── app.module.ts       # Module principal
│   └── main.ts             # Point d'entrée
├── test/                   # Tests E2E et intégration
├── docker-compose.yml      # Configuration Docker Compose (production)
├── docker-compose.dev.yml  # Configuration Docker Compose (développement)
├── Dockerfile              # Configuration Docker
├── .env.example            # Variables d'environnement exemple
└── package.json            # Dépendances et scripts
```

## License

ISC

## API Endpoints

The WorkTime Leave Manager API provides the following endpoints:

### Health Check
- `GET /health` - Check application health and uptime

### Leave Request Management
- `POST /leave-requests` - Create a new leave request
- `GET /leave-requests` - List all leave requests
- `GET /leave-requests?employeeId={id}` - Filter requests by employee
- `GET /leave-requests/:id` - Get a specific leave request
- `GET /leave-requests/statistics` - Get overall leave statistics
- `GET /leave-requests/statistics?employeeId={id}` - Get employee-specific statistics
- `PATCH /leave-requests/:id/approve` - Approve a leave request
- `PATCH /leave-requests/:id/reject` - Reject a leave request
- `DELETE /leave-requests/:id` - Delete a leave request

### Testing with Postman

Import the `WorkTime-Leave-Manager.postman_collection.json` file into Postman to test all endpoints.

## Deployment Status

The application uses a robust CI/CD pipeline with:
- ✅ Automated testing on pull requests
- ✅ Docker image building and publishing to GHCR
- ✅ Render API integration for accurate deployment verification
- ✅ Real-time deployment status tracking

For deployment setup details, see [RENDER-API-SETUP.md](./RENDER-API-SETUP.md).
