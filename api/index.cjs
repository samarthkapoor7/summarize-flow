const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const JOBS_FILE = path.join(__dirname, 'transcribe-jobs.json');
function readJobs() {
  if (!fs.existsSync(JOBS_FILE)) return {};
  return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
}
function writeJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

app.get('/api/hello', (req, res) => res.json({ msg: 'Hello from Express!' }));

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const jobId = uuidv4();
    let jobs = readJobs();
    jobs[jobId] = { status: 'processing' };
    writeJobs(jobs);
    res.json({ jobId });
    // Start background transcription
    (async () => {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(req.file.path),
          model: "whisper-1",
        });
        jobs = readJobs();
        jobs[jobId] = { status: 'done', transcript: transcription.text };
        writeJobs(jobs);
      } catch (error) {
        jobs = readJobs();
        jobs[jobId] = { status: 'error', error: error.message };
        writeJobs(jobs);
      } finally {
        fs.unlink(req.file.path, () => {});
      }
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transcribe/status', (req, res) => {
  const { id } = req.query;
  const jobs = readJobs();
  if (!id || !jobs[id]) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(jobs[id]);
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "No transcript provided" });
    }
    console.log("Generating summary for transcript");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text. Create a concise summary of the following transcript."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });
    console.log("Summary generated");
    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = serverless(app);
