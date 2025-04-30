# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.10-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Aktualisieren und Installieren von Java
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean;

# Festlegen der Umgebungsvariablen für Java
ENV JAVA_HOME /usr/lib/jvm/default-java
ENV PATH $JAVA_HOME/bin:$PATH


# Install necessary packages, including Git
RUN apt-get update && apt-get install -y git && apt-get clean

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Copy the .env file into the container at /app
# COPY /app/.env .

# Install Tesseract OCR with automatic "yes" to prompts
RUN apt-get update && apt-get install -y tesseract-ocr && apt-get clean

# Install any necessary dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN python -m spacy download en_core_web_lg

# Copy the FastAPI app files to the container
COPY app /app/app

# Adjust the auto imports for the function translation
RUN python3 /app/app/src/avatar/insert_imports.py

#COPY BigFiveModels /app/BigFiveModel
#COPY MTBIModels /app/MTBIModel

# Expose the port that Uvicorn will run on
EXPOSE 8000

# Run Uvicorn 
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
