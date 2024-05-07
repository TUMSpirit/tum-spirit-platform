# TUM Sprit 👻 Monorepo

Welcome to the `TUM Sprit` monorepo! This project is structured into two main components: the frontend, built with React, and the backend, developed with FastAPI. The backend architecture is designed to run within Docker containers, ensuring consistency across development, testing, and production environments. It includes a Redis server for caching and event scheduling, Ollama for LLM tasks, MongoDB as the primary database, and FastAPI to handle the API requests.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Frontend](#frontend)
  - [Development](#development)
  - [Building for Production](#building-for-production)
- [Backend](#backend)

  - [Services Overview](#services-overview)
  - [Running with Docker Compose](#running-with-docker-compose)

- [License](#license)
- [Technical Support or Questions](#technical-support-or-questions)
- [Contact](#contact)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (Preferably the latest LTS version)
- Docker and Docker Compose
- An active internet connection for downloading dependencies

### Installation

1. Clone the repo

```sh
git clone https://github.com/TUMSpirit/tum-spirit-platform.git
```

2. Install NPM packages for the frontend

```sh
cd frontend
npm install
```

3. Ensure Docker is running on your system. No need to manually install the backend dependencies as Docker will handle this.

## Frontend

The frontend is a React application bootstrapped with Create React App. It communicates with the backend to fetch data and display it to the users.

### Development

To start the frontend application in development mode, run:

```sh
cd frontend
npm start
```

This will start a development server on `http://localhost:3000`.

### Building for Production

To build the frontend for production, run:

```sh
cd frontend
npm run build
```

This command builds the app for production to the `build` folder.

## Backend

The backend is a FastAPI application, intended to run as a Dockerized environment alongside Redis, MongoDB, and Ollama instances.

### Services Overview

- **FastAPI**: Serves as the backbone of the users API requests.
- **Redis**: Used for caching hot data to improve the performance and schedule events.
- **Ollama**: A machine learning model server (ensure it’s correctly configured for your needs).
- **MongoDB**: Acts as the primary database to store data.

### Running with Docker Compose

To start all services of the backend, use Docker Compose with the supplied `docker-compose.yml` file, which defines and runs the multi-container Docker applications.

```sh
cd backend
docker-compose up -d
```

This will build the images (if not done previously) and start the services. The FastAPI app will be available on `http://localhost:8000`.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Technical Support or Questions

If you have questions, please [contact me](mailto:jonas.bender@tum.de) instead of opening an issue.

## Contact

Jonas Bender - jonas.bender@tum.de

Project Link: [https://github.com/TUMSpirit/tum-spirit-platform](https://github.com/TUMSpirit/tum-spirit-platform)
