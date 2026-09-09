import { CloudTasksClient } from '@google-cloud/tasks';

// Initialize the Cloud Tasks client
const client = new CloudTasksClient();

// The GCP project and location where your queues are located
const project = process.env.GOOGLE_CLOUD_PROJECT || 'gem-intel-project';
const location = process.env.CLOUD_TASKS_LOCATION || 'asia-south1';
const queue = process.env.CLOUD_TASKS_QUEUE || 'audit-jobs-queue';

// The URL of the worker endpoint (this should point to your Cloud Run service)
const serviceUrl = process.env.SERVICE_URL || 'http://localhost:3000';
// The service account email that has permissions to invoke the Cloud Run service
const serviceAccountEmail = process.env.INVOKER_SERVICE_ACCOUNT || 'gem-intel-worker@gem-intel-project.iam.gserviceaccount.com';

export async function enqueueAuditJob(auditId: string, jobType: 'SCRAPE' | 'MATCH' | 'SCORE') {
  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const payload = {
    auditId,
    jobType,
    queuedAt: new Date().toISOString()
  };

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url: `${serviceUrl}/api/internal/jobs/execute`,
      headers: {
        'Content-Type': 'application/json',
      },
      oidcToken: {
        serviceAccountEmail,
        audience: serviceUrl,
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
  };

  console.log(`[Tasks] Enqueuing ${jobType} job for audit ${auditId}`);

  try {
    // In local development, we often simulate task execution directly 
    // rather than using the real Cloud Tasks API, to avoid needing a public URL.
    if (process.env.NODE_ENV !== 'production' && !process.env.USE_REAL_CLOUD_TASKS) {
       console.log(`[Tasks] Local environment detected. Skipping real enqueue. In production, this would call Cloud Tasks.`);
       // Note: To actually simulate locally, we'd normally do a fetch() to localhost here.
       return;
    }

    // Send create task request.
    const [response] = await client.createTask({ parent, task });
    console.log(`Created task ${response.name}`);
    return response;
  } catch (error) {
    console.error('Error enqueuing task:', error);
    throw new Error('Failed to enqueue task');
  }
}
