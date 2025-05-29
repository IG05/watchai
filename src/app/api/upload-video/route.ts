import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import type { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse multipart/form-data from Next.js Request
async function parseForm(req: Request) {
  const form = formidable({ multiples: false });

  const buffer = Buffer.from(await req.arrayBuffer());

  const mockReq = Object.assign(Readable.from(buffer), {
    headers: {
      "content-type": req.headers.get("content-type") || "",
      "content-length": buffer.length.toString(),
    },
  }) as IncomingMessage;

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(mockReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { files } = await parseForm(request);
    const file = files.video;
    if (!file) {
      return NextResponse.json({ error: "No video file uploaded" }, { status: 400 });
    }

    const videoFile = Array.isArray(file) ? file[0] : file;

    if (!videoFile.filepath) {
      return NextResponse.json({ error: "Uploaded file path missing" }, { status: 400 });
    }

    const originalFilename = videoFile.originalFilename || "";
    const ext = originalFilename.split(".").pop()?.toLowerCase();
    if (ext !== "mp4") {
      return NextResponse.json({ error: "Only .mp4 files are allowed" }, { status: 400 });
    }

    const fileBuffer = await fs.promises.readFile(videoFile.filepath);
    const key = `uploads/${uuidv4()}.mp4`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ContentType: "video/mp4",
      })
    );

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ url });
  } 
  catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.error("Unknown upload error:", error);
  return NextResponse.json({ error: "Upload failed" }, { status: 500 });
}
}
