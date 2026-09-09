const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('extensionRoutes')) {
  content = content.replace(
    "import publicRoutes from './server/routes/public.routes';",
    "import publicRoutes from './server/routes/public.routes';\nimport extensionRoutes from './server/routes/extension.routes';"
  );

  content = content.replace(
    "app.use('/api', publicRoutes);",
    "app.use('/api', publicRoutes);\n  app.use('/api', extensionRoutes);"
  );

  fs.writeFileSync('server.ts', content);
}
