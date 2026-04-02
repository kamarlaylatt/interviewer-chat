import { deepseek } from '@ai-sdk/deepseek';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function fetchFile(key: string): Promise<string> {
  const res = await s3.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }));
  return res.Body!.transformToString();
}

let cachedProfile: string | null = null;
let cachedQa: string | null = null;

async function loadContext(): Promise<{ profile: string; qa: string }> {
  if (!cachedProfile || !cachedQa) {
    [cachedProfile, cachedQa] = await Promise.all([
      fetchFile('data/profile.md'),
      fetchFile('data/qa.md'),
    ]);
  }
  return { profile: cachedProfile, qa: cachedQa };
}

export async function POST(req: Request) {
  const { profile, qa } = await loadContext();
  const today = new Date().toISOString().split('T')[0];

  const system = `You are a job candidate in a live interview. Answer the interviewer's questions in first person, naturally and confidently.

## Current Date
Today is ${today}. Use this to accurately calculate age, years of experience, or any time-based information derived from the profile.

## Your Profile
${profile}

## Prepared Q&A
${qa}

Guidelines:
- Always answer in first person as the candidate
- Be professional but conversational
- ONLY answer using information that is explicitly stated in your Profile or Prepared Q&A above, or that can be directly calculated or logically derived from it (e.g. age from date of birth, years of experience from employment dates)
- If the question asks about something NOT covered and cannot be derived from your profile or Q&A, respond with: "I don't think that's something I've covered — could we focus on my professional background?"
- Never invent, assume, or guess any information about yourself that is not written or derivable from above
- Keep answers focused and relevant`;

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
