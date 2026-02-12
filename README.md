# WorkTime Leave Manager API

API minimale en Node.js avec NestJS pour gérer les temps de travail et les congés.

## 🚀 Fonctionnalités

- ✅ API REST avec NestJS
- ✅ TypeScript configuré
- ✅ ESLint pour le linting
- ✅ Tests unitaires avec Jest
- ✅ Docker pour la containerisation
- ✅ CI/CD avec GitHub Actions

## 📋 Prérequis

- Node.js 18+
- npm
- Docker (optionnel)

## 🛠️ Installation

```bash
# Cloner le repository
git clone https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-.git
cd WorkTime-Leave-Manager-WTLM-

# Installer les dépendances
npm install
```

## 🏃 Démarrage

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

### Avec Docker
```bash
# Build l'image
docker build -t wtlm-api .

# Run le container
docker run -p 3000:3000 wtlm-api
```

## 🧪 Tests

```bash
# Run tous les tests
npm test

# Run tests en mode watch
npm run test:watch

# Run tests avec coverage
npm run test:cov
```

## 🔍 Linting

```bash
# Vérifier TypeScript
npm run ts

# Linter le code
npm run lint
```

## 📚 API Endpoints

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

## 🔄 Workflow Git

Le projet utilise deux branches principales :
- `develop` / `staging` : pour le développement
- `main` : pour la production

### CI Pipeline
La pipeline CI se déclenche automatiquement sur chaque Pull Request vers `main` et vérifie :
1. Installation des dépendances
2. Vérification TypeScript
3. Linting du code
4. Tests unitaires
5. Build de l'application

## 📦 Scripts npm

- `npm run build` : Compile le projet TypeScript
- `npm run start` : Démarre l'application en mode production
- `npm run start:dev` : Démarre l'application en mode développement
- `npm run lint` : Lint le code avec ESLint
- `npm run ts` : Vérifie les types TypeScript
- `npm test` : Exécute les tests
- `npm run test:watch` : Exécute les tests en mode watch
- `npm run test:cov` : Exécute les tests avec couverture

## 🏗️ Structure du projet

```
.
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline CI/CD
├── src/
│   ├── app.controller.ts   # Contrôleur principal
│   ├── app.service.ts      # Service principal
│   ├── app.module.ts       # Module principal
│   ├── main.ts             # Point d'entrée
│   ├── app.controller.spec.ts  # Tests controller
│   └── app.service.spec.ts     # Tests service
├── Dockerfile              # Configuration Docker
├── .dockerignore          # Fichiers ignorés par Docker
├── .eslintrc.js           # Configuration ESLint
├── .prettierrc            # Configuration Prettier
├── jest.config.js         # Configuration Jest
├── tsconfig.json          # Configuration TypeScript
├── tsconfig.build.json    # Configuration build TypeScript
└── package.json           # Dépendances et scripts
```

## 📝 License

ISC
