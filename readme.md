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

- **FastAPI**: Serves as the backbone for user API requests.
- **Redis**: Used for caching hot data to improve performance and schedule events.
- **Ollama**: A machine learning model server (ensure it’s correctly configured for your needs).
- **MongoDB**: Acts as the primary database to store data.

### Running with Docker Compose

To start all services of the backend, use Docker Compose with the supplied `docker-compose.yml` file, which defines and runs the multi-container Docker applications.

```sh
cd backend
docker-compose up -d
```

This will build the images (if not done previously) and start the services. The FastAPI app will be available on `http://localhost:8000`.

### Setting Up the Ollama Model

Before running the Ollama service, you need to pull the desired model. In this case, we'll use the `llama3` model. Follow these steps:

1. Access the Ollama Docker container:

   ```sh
   docker exec -it <ollama_container_id_or_name> /bin/sh
   ```

2. Pull the `llama3` model:

   ```sh
   ollama pull llama3
   ```

Replace `<ollama_container_id_or_name>` with your actual container ID or name, which you can find by running `docker ps`.

### Nginx Configuration

To set up Nginx as a reverse proxy for your FastAPI backend and serve your React frontend, you can use a configuration similar to the one shown below. This configuration assumes your FastAPI application is running on port 8000 and your React build files are located in the `build` directory.

1. Create an Nginx configuration file, for example, `fastapi_nginx.conf`:

   ```nginx
   server {
       listen 80;
       server_name your_domain_or_IP;

       location / {
           root /path/to/your/react/build;
           index index.html;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   - Replace `/path/to/your/react/build` with the actual path to your React build directory.
   - Ensure the `proxy_pass` directive for `/api` points to your FastAPI application's address and port.

2. Place this configuration file in the Nginx configuration directory (e.g., `/etc/nginx/conf.d/`).

3. Restart Nginx to apply the changes:

   ```sh
   sudo systemctl restart nginx
   ```

### Adding SSL Certificates

To enable SSL for your FastAPI application via Nginx, you need to obtain an SSL certificate. Here’s a brief guide on getting and adding an SSL certificate using Let's Encrypt:

1. **Install Certbot**:

   ```sh
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain the SSL Certificate**:

   Run the following command, replacing `your_domain_or_IP` with your actual domain or IP address:

   ```sh
   sudo certbot --nginx -d your_domain_or_IP
   ```

3. Certbot will automatically update your Nginx configuration to use the SSL certificate and reload the Nginx service. You should see a configuration similar to the one below:

   ```nginx
   server {
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    server_name spirit.lfe.ed.tum.de;

    ssl_certificate /etc/letsencrypt/live/spirit.lfe.ed.tum.de-0001/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/spirit.lfe.ed.tum.de-0001/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    # Serve static files for the root path
    location / {
        root /home/spirit/Documents/tum-spirit-platform/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy for FastAPI
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
   }


    server {
    if ($host = spirit.lfe.ed.tum.de) {
            return 301 https://$host$request_uri;
    } # managed by Certbot

        listen 80;
        listen [::]:80;
        server_name spirit.lfe.ed.tum.de;
        return 404; # managed by Certbot

    }
   ```

4. Verify the configuration and restart Nginx if necessary:

   ```sh
   sudo nginx -t
   sudo systemctl restart nginx
   ```

   For detailed information, visit the [Certbot documentation](https://certbot.eff.org/).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Technical Support or Questions

If you have questions, please [contact me](mailto:jonas.bender@tum.de) instead of opening an issue.

## Contact

Jonas Bender - jonas.bender@tum.de

Project Link: [https://github.com/TUMSpirit/tum-spirit-platform](https://github.com/TUMSpirit/tum-spirit-platform)
