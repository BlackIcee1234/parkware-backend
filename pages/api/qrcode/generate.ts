import { NextApiRequest, NextApiResponse } from "next";
import qr from "qrcode";
import { db } from "../../../utils/config";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

type QRCodeData = {
  text: string;
  base64Data: string;
  status: string;
};

type ResponseData = {
  success: boolean;
  qrCodeData?: QRCodeData;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { uid } = req.body;

    try {
      const qrDoc = await getDoc(doc(db, "qrcodes", uid));

      if (qrDoc.exists()) {
        const qrCodeData = qrDoc.data() as QRCodeData;
        return res.status(200).json({ success: true, qrCodeData });
      }
      const randomString = generateRandomString();
      const base64Data = await generateQRCode(randomString);
      const qrCodeData: QRCodeData = {
        text: randomString,
        base64Data,
        status: "activo"
      };
      await saveQRCodeToFirestore(uid, qrCodeData);

      res.status(200).json({ success: true, qrCodeData });
    } catch (error) {
      console.error("Error generating or saving QR code:", error);
      res.status(500).json({ success: false, error: "Error generating or saving QR code" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}

async function generateQRCode(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    qr.toDataURL(text, (err, qrCode) => {
      if (err) {
        reject(err);
      } else {
        resolve(qrCode);
      }
    });
  });
}

async function saveQRCodeToFirestore(uid: string, qrCodeData: QRCodeData): Promise<void> {
  await addDoc(collection(db, "qrcodes"), { ...qrCodeData, uid });
}

function generateRandomString(length: number = 10): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
