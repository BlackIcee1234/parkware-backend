import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";

async function updateQRCodeStatus(qrCode: string, newStatus: string) {
  const qrCodesRef = collection(db, "qrcodes");
  const q = query(qrCodesRef, where("text", "==", qrCode));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await updateDoc(doc(db, "qrcodes", docSnapshot.id), { status: newStatus });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { uid, qrCodes, leave } = req.body;
    try {
      if (leave && qrCodes && uid) {
        const arrayQrCodes: string[] = JSON.parse(qrCodes);
        const queueRef = collection(db, "virtualQueue");

        // Step 1: Delete the specified users from the virtual queue
        let minPosition = Number.MAX_SAFE_INTEGER;
        for (const qrCode of arrayQrCodes) {
          const q = query(queueRef, where("uid", "==", uid), where("text", "==", qrCode));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach(async (docSnapshot) => {
              const data = docSnapshot.data();
              if (data.position < minPosition) {
                minPosition = data.position;
              }
              await deleteDoc(doc(db, "virtualQueue", docSnapshot.id));
              await updateQRCodeStatus(qrCode, "activo");
            });
          }
        }

        // Step 2: Reorder the positions of the remaining users in the queue
        const allQueueSnapshot = await getDocs(query(queueRef, orderBy("position")));

        for (const docSnapshot of allQueueSnapshot.docs) {
          const data = docSnapshot.data();
          if (data.position > minPosition) {
            await updateDoc(doc(db, "virtualQueue", docSnapshot.id), { position: data.position - arrayQrCodes.length });
          }
        }

        res.status(200).json({ success: true, message: "Saliste de la fila virtual y las posiciones han sido reacomodadas" });
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
