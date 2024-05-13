import { NextApiRequest, NextApiResponse } from "next";
import qr from "qrcode";
import { Firestore } from "@google-cloud/firestore";

type QRCodeData = {
  text: string;
  base64Data: string;
};

type ResponseData = {
  success: boolean;
  qrCodeData?: QRCodeData;
  error?: string;
};

// Inicializar Firestore
const firestore = new Firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    // Obtener el texto para el código QR desde la consulta de la URL
    const text = req.query.text as string;

    try {
      // Generar el código QR
      const base64Data = await generateQRCode(text);

      // Guardar el código QR en Firestore
      const qrCodeData: QRCodeData = {
        text,
        base64Data
      };
      await saveQRCodeToFirestore(qrCodeData);

      // Devolver el código QR en formato base64
      res.status(200).json({ success: true, qrCodeData });
    } catch (error) {
      // Si hay un error al generar o guardar el código QR, devolver un mensaje de error
      res
        .status(500)
        .json({ success: false, error: "Error generating or saving QR code" });
    }
  } else {
    // Devolver un error si el método de solicitud no es GET
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

async function saveQRCodeToFirestore(qrCodeData: QRCodeData): Promise<void> {
  // Agregar el documento a una colección llamada 'qrcodes'
  await firestore.collection("qrcodes").add(qrCodeData);
}
