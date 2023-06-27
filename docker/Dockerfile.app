FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY app/public public
COPY app/*.html .
COPY app/*.json .
COPY app/*.ts .
COPY app/.env .

RUN npm install

EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
