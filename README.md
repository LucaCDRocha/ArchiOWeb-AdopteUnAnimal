# ArchiOWeb-AdopteUnAnimal

## API REST

Ce projet est une API REST construite avec Express.js, fournissant des endpoints pour l'authentification des utilisateurs, la gestion des animaux et la gestion des demandes d'adoption. Il est conçu pour faciliter l'adoption des animaux.

Le frontend de l'application est disponible [ici](https://devmobil-adopteunanimal.onrender.com/) et le dépôt est disponible [ici](https://github.com/LucaCDRocha/DevMobil-AdopteUnAnimal)

## Table des matières

- [ArchiOWeb-AdopteUnAnimal](#archioweb-adopteunanimal)
  - [API REST](#api-rest)
  - [Table des matières](#table-des-matières)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Exécution de l'application](#exécution-de-lapplication)
  - [Peuplement de la base de données](#peuplement-de-la-base-de-données)
    - [Prérequis](#prérequis)
    - [Exécution des seeders](#exécution-des-seeders)
  - [Exécution des tests](#exécution-des-tests)
  - [Documentation de l'API](#documentation-de-lapi)

## Installation

Clonez le dépôt :

```bash
git clone https://github.com/LucaCDRocha/ArchiOWeb-AdopteUnAnimal.git
cd ArchiOWeb-AdopteUnAnimal
```

Installez les dépendances :

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du répertoire et fournissez les variables d'environnement indiquées dans le fichier `.env.example`.

## Exécution de l'application

Pour démarrer l'application en mode développement, exécutez :

```bash
npm run dev
```

Pour démarrer l'application en mode production, exécutez :

```bash
npm start
```

## Peuplement de la base de données

Pour faciliter le processus de développement et de test, vous pouvez peupler la base de données avec des données initiales.

### Prérequis

Assurez-vous que MongoDB est en cours d'exécution.

### Exécution des seeders

Pour peupler la base de données, exécutez la commande suivante :

```bash
npm run seed
```

## Exécution des tests

Pour exécuter les tests, utilisez la commande suivante :

```bash
npm run test
```

## Documentation de l'API

La documentation de l'API est disponible à l'endpoint `/api-docs` lorsque l'application est en cours d'exécution.
