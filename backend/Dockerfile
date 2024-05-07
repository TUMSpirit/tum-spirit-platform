# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.10-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Copy the .env file into the container at /app
COPY .env .

# Install any necessary dependencies
RUN pip install -r requirements.txt

# Copy the FastAPI app files to the container
COPY app /app/app
COPY BigFiveModels /app/BigFiveModel
COPY MTBIModels /app/MTBIModel

# Expose the port that Uvicorn will run on
EXPOSE 8000

# Run Uvicorn 
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]