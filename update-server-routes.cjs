const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  "import apiRoutes from './server/routes/api.routes';",
  "import apiRoutes from './server/routes/api.routes';\nimport analyticsRoutes from './server/routes/analytics.routes';\nimport publicRoutes from './server/routes/public.routes';"
);

content = content.replace(
  "app.use('/api', apiRoutes);",
  "app.use('/api', apiRoutes);\n  app.use('/api', analyticsRoutes);\n  app.use('/api', publicRoutes);"
);

fs.writeFileSync('server.ts', content);
