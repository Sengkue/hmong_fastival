module.exports = {
  apps: [
    {
      name: 'komsamlak-frontend',
      script: './.output/server/index.mjs',
      watch: false,
      windowsHide: true,
      env: {
        PORT: 3007,
        HOST: '0.0.0.0'
      }
    }
  ]
};
