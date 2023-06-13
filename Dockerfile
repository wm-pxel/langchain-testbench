# Base image
FROM python:3.9-slim-buster

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
        libssl-dev \
        libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y --no-install-recommends nodejs

# Install virtualenv
RUN pip install virtualenv

# Copy requirements files
COPY requirements.txt .
COPY app/package.json app/package-lock.json ./app/

# Create and activate virtual environment
RUN virtualenv venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies
RUN . venv/bin/activate && pip install -r requirements.txt

# Install Node.js dependencies
RUN cd app && npm install

# Copy the entire project
COPY . .

# Expose ports
EXPOSE 27017 4900

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=mongoadmin
ENV MONGO_INITDB_ROOT_PASSWORD=[Mongo Password]
ENV MONGODB_URL=mongodb://testbench:testbench@mongo:27017/admin
ENV MONGODB_DATABASE=testbench
ENV OPENAI_API_KEY=[Open AI API Key]
ENV HUGGINGFACEHUB_API_TOKEN=[Hugging Face API Key]

# Start the services
CMD docker-compose up