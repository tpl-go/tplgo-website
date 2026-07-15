module.exports = {
  apps: [
    {
      name: "tpl-api",
      cwd: "/var/www/tpl-project/tpl-api",
      script: "dist/server.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
        HOST: "0.0.0.0"
      },
      max_memory_restart: "512M",
      kill_timeout: 10000,
      listen_timeout: 10000,
      time: true
    },
    {
      name: "tpl-web",
      cwd: "/var/www/tpl-project",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      max_memory_restart: "768M",
      kill_timeout: 10000,
      listen_timeout: 10000,
      time: true
    }
  ]
};
