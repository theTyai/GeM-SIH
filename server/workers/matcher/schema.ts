import { z } from 'zod';

export const matchedAttributeSchema = z.object({
  attribute: z.string().describe("The name of the attribute (e.g., 'RAM', 'Processor')"),
  target: z.string().describe("The expected value from the GeM Listing specs"),
  observed: z.string().describe("The value actually found in the market evidence"),
  match: z.boolean().describe("Whether the observed value meets or exceeds the target"),
});

export const matchResultSchema = z.object({
  spec_match_score: z.number().min(0).max(100).describe("The overall confidence score of the match, 0-100"),
  matched_attributes: z.array(matchedAttributeSchema),
  mismatches: z.array(matchedAttributeSchema),
  unknown_attributes: z.array(z.string()).describe("Attributes that were required but could not be found in the evidence"),
  confidence: z.number().min(0).max(1).describe("The AI's confidence in its own analysis (0.0 to 1.0)"),
  extracted_price: z.number().nullable().describe("The base price extracted from the page, if clearly visible"),
});

export type MatchResult = z.infer<typeof matchResultSchema>;
