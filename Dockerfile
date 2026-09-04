FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy app files
COPY . .

# Expose port and run
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
