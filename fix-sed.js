const fs = require('fs');
let code = fs.readFileSync('server/routes/extension.routes.ts', 'utf8');

// Undo the bad sed
code = code.replace(/title,\n      category: 'Uncategorized',/g, 'title,');

// Insert it in the correct db.insert area
code = code.replace(
`      title,
      listedPrice: price.toString(),`,
`      title,
      category: 'Uncategorized',
      listedPrice: price.toString(),`
);

fs.writeFileSync('server/routes/extension.routes.ts', code);
