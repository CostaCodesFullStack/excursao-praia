module.exports = {
  apps: [
    {
      name: "excursao-backend",
      cwd: "./backend",
      script: "./dist/src/server.js",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3333,
      },
    },
  ],
};
