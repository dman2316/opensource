module.exports = {
  apps: [
    {
      name: "free-movies-tv",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}
