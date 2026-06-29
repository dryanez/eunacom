import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

const accountId = '1feadf1b0863cb9b502faaa828b563aa';
const bucketName = 'eunacomvideos';
const accessKeyId = '543b4c368c26b7bc4f210e26e82ff596';
const secretAccessKey = '1b2c3df467dcc3b664d3d353239b995b3b9a146a901d7296830d9f6910e10fec';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const indexStr = fs.readFileSync(path.join(process.cwd(), 'src/lib/videoIndex.json'), 'utf8');
const videoIndex = JSON.parse(indexStr);

async function checkAudioCodec(key) {
  const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/');
  const url = `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/${encodedKey}`;
  
  try {
    const cmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${url}"`;
    const { stdout, stderr } = await execPromise(cmd);
    if (stderr && stderr.includes('HTTP error 404')) return 'NOT_FOUND';
    return stdout.trim();
  } catch (err) {
    if (err.message.includes('404')) return 'NOT_FOUND';
    console.error(`Error probing ${key}:`, err.message);
    return null;
  }
}

async function fixVideo(key) {
  const tempIn = path.join(process.cwd(), 'temp_in.mp4');
  const tempOut = path.join(process.cwd(), 'temp_out.mp4');

  try {
    console.log(`[${key}] Downloading...`);
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
    const writeStream = fs.createWriteStream(tempIn);
    Body.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`[${key}] Transcoding (copying video, converting audio to AAC)...`);
    await execPromise(`ffmpeg -y -i "${tempIn}" -c:v copy -c:a aac "${tempOut}"`);

    console.log(`[${key}] Uploading back to R2...`);
    const readStream = fs.createReadStream(tempOut);
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: readStream,
        ContentType: 'video/mp4'
      }
    });
    await upload.done();

    console.log(`[${key}] SUCCESS!`);
  } catch (err) {
    console.error(`[${key}] ERROR:`, err);
  } finally {
    if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }
}

async function main() {
  const allKeys = [];
  for (const subsystem in videoIndex) {
    for (const lesson in videoIndex[subsystem]) {
      allKeys.push(videoIndex[subsystem][lesson]);
    }
  }

  console.log(`Found ${allKeys.length} videos to check.`);
  let fixedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    console.log(`\n(${i+1}/${allKeys.length}) Checking: ${key}`);
    
    const codec = await checkAudioCodec(key);
    console.log(`  Audio codec: ${codec}`);

    if (codec === 'NOT_FOUND') {
      console.log(`  WARNING: Video does not exist on R2. Skipping.`);
      notFoundCount++;
    } else if (codec && codec !== 'aac') {
      console.log(`  Needs fixing! Converting to aac...`);
      await fixVideo(key);
      fixedCount++;
    } else if (codec === 'aac') {
      console.log(`  OK.`);
    } else {
      console.log(`  Could not determine codec or no audio. Skipping.`);
    }
  }

  console.log(`\nDONE. Fixed ${fixedCount} videos. ${notFoundCount} videos were not found on R2.`);
}

main();
