# TUM Spirit Backend

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Docker and Docker Compose.
- You have a basic understanding of Docker containerization.

## Getting Started

These instructions will get a copy of your project up and running on your local machine for development and testing purposes.

1. **Clone the repository**

   ```bash
   git clone https://github.com/TUMSpirit/tum-spirit-serverside.git
   cd tum-spirit-serverside
   ```

2. **Running the application**

   To start the application with Docker, run the following command:

   ```bash
   docker-compose up --build
   ```

   You should see the output indicating that both the application and the MongoDB service have started successfully. By default, the application will be available at http://localhost:8000.
