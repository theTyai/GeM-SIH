const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

content = content.replace(
  "<AuditWorkspace \n                  auditId={activeAuditId}\n                  onBack={() => setActiveAuditId(null)}\n                  onShowToast={showToast}\n                />",
  "<AuditWorkspace \n                  auditId={activeAuditId}\n                  onBack={() => setActiveAuditId(null)}\n                  onShowToast={showToast}\n                  currentUser={currentUser}\n                />"
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
