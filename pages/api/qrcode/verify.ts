import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs } from "firebase/firestore";

type QRCodeData = {
  text: string;
  base64Data: string;
  status: string;
};

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { text } = req.body;

    try {
      const q = query(collection(db, "qrcodes"), where("text", "==", text));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(200).json({ success: true, message: "Este código QR no está registrado" });
      }

      const qrDoc = querySnapshot.docs[0];
      const qrCodeData = qrDoc.data() as QRCodeData;
      if (qrCodeData.status === "activo") {
        return res.status(200).json({ success: true, message: "Este código QR está activo" });
      } else {
        return res.status(200).json({ success: true, message: "Este código QR no está activo" });
      }
    } catch (error) {
      console.error("Error searching QR code:", error);
      res.status(500).json({ success: false, error: "Error searching QR code" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
