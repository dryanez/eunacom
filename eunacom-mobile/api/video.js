import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import videoIndex from '../src/lib/videoIndex.json' assert { type: 'json' };

export default async function handler(req, res) {
  const { subsystem, lessonNumber } = req.query;

  if (!subsystem || !lessonNumber) {
    return res.status(400).json({ error: 'Missing subsystem or lessonNumber' });
  }

  const subsystemIndex = videoIndex[subsystem];
  if (!subsystemIndex) {
    return res.status(404).json({ error: 'Subsystem not found in video index' });
  }

  const r2Key = subsystemIndex[String(lessonNumber)];
  if (!r2Key) {
    return res.status(404).json({ error: 'Video not found for this lesson' });
  }

  const accountId = process.env.VITE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.VITE_R2_BUCKET || process.env.R2_BUCKET || 'eunacomvideos';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return res.status(500).json({ error: 'Missing R2 environment variables' });
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
    });

    // Generate a presigned URL valid for 4 hours
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 14400 });

    // Instantly redirect the browser's <video> tag exactly to the raw file
    res.redirect(302, signedUrl);
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ error: 'Failed to generate secure video link' });
  }
}
