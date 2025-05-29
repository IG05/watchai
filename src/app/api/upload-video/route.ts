// // pages/api/upload-video.ts
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { NextApiRequest, NextApiResponse } from "next";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import multiparty from "multiparty";
// import fs from "fs";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const s3 = new S3Client({
//   region: "us-east-1",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const form = new multiparty.Form();

//   form.parse(req, async (err, fields, files) => {
//     if (err) return res.status(500).json({ error: "Failed to parse form" });

//     const file = files.video?.[0];
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const fileContent = fs.readFileSync(file.path);
//     const ext = path.extname(file.originalFilename || ".mp4");
//     const key = `uploads/${uuidv4()}${ext}`;

//     try {
//       await s3.send(
//         new PutObjectCommand({
//           Bucket: process.env.AWS_S3_BUCKET_NAME!,
//           Key: key,
//           Body: fileContent,
//           ContentType: file.headers["content-type"],
//           ACL: "public-read",
//         })
//       );

//       const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//       res.status(200).json({ url });
//     } catch (error) {
//       console.error("S3 Upload Error:", error);
//       res.status(500).json({ error: "Upload failed" });
//     }
//   });
// }
// pages/api/upload-video.ts

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
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
