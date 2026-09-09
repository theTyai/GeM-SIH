import { AIService } from './server/services/ai.service';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new AIService();
ai.runAuditPipeline("Dell OptiPlex 7090", 49999, [])
  .then(console.log)
  .catch(console.error);
