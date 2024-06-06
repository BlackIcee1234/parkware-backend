import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getCountFromServer } from "firebase/firestore";

async function updateQRCodeStatus(qrCode: string, newStatus: string) {
  const qrCodesRef = collection(db, "qrcodes");
  const q = query(qrCodesRef, where("text", "==", qrCode));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await updateDoc(doc(db, "qrcodes", docSnapshot.id), { status: newStatus });
  });
}

async function getQueuePosition() {
  const virtualQueueRef = collection(db, "virtualQueue");
  const snapshot = await getCountFromServer(virtualQueueRef);
  return snapshot.data().count + 1;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { uid, qrCodes } = req.body;
    try {
      if (qrCodes && uid) {
        const arrayQrCodes: string[] = JSON.parse(qrCodes);

        for (const qrCode of arrayQrCodes) {
          await updateQRCodeStatus(qrCode, "haciendo fila");

          const position = await getQueuePosition();

          await addDoc(collection(db, "virtualQueue"), {
            uid,
            text: qrCode,
            position
          });
        }

        res.status(200).json({ success: true, message: "Unido a la fila virtual" });
      } else {
        console.error("Datos incompletos o incorrectos.");
        res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
