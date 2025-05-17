import { createRouter } from 'next-connect';
import multer from 'multer';
import { execFile } from 'child_process';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { RequestHandler } from 'express';

const UPLOADED_VIDEOS_DIR = 'C:/Users/ishaa/watchai/pipeline/data/uploaded_videos';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: UPLOADED_VIDEOS_DIR,
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}.mp4`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Helper: Wrap Express middleware for next-connect
function runMiddleware(
  middleware: RequestHandler
): (req: NextApiRequest, res: NextApiResponse, next: (err?: any) => void) => void {
  return (req, res, next) => {
    middleware(req as any, res as any, next);
  };
}

// Create the router
const router = createRouter<NextApiRequest, NextApiResponse>();

// Use multer with type compatibility
router.use(runMiddleware(upload.single('video')));

// POST handler
router.post((req: any, res: NextApiResponse) => {
  const videoPath = req.file?.path;

  if (!videoPath) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const pythonScriptPath = path.join(process.cwd(), 'pipeline', 'scripts', 'generate_metadata.py');

  execFile('python', [pythonScriptPath, videoPath], (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error('Python error:', error);
      return res.status(500).json({ error: 'Python processing failed' });
    }

    console.log('Python output:', stdout);
    return res.status(200).json({ message: 'Video uploaded and metadata stored' });
  });
});

// Disable body parsing so multer can handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Export router with error handlers
export default router.handler({
  onError(error, req, res) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
});
