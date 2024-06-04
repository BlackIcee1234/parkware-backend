import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

const rideTimes: string[] = [
  "08:00",
  "08:20",
  "08:40",
  "09:00",
  "09:20",
  "09:40",
  "10:00",
  "10:20",
  "10:40",
  "11:00",
  "11:20",
  "11:40",
  "12:00",
  "12:20",
  "12:40",
  "13:00",
  "13:20",
  "13:40",
  "14:00",
  "14:20",
  "14:40",
  "15:00",
  "15:20",
  "15:40",
  "16:00",
  "16:20",
  "16:40",
  "17:00",
  "17:20",
  "17:40",
  "18:00",
  "18:20",
  "18:40",
  "19:00",
  "19:20",
  "19:40",
  "20:00",
  "20:20",
  "20:40",
  "21:00",
  "21:20",
  "21:40",
  "22:00",
  "22:20",
  "22:40",
  "23:00",
  "23:20",
  "23:40"
];

async function updateQRCodeStatus(qrCode: string, newStatus: string) {
  const qrCodesRef = collection(db, "qrcodes");
  const q = query(qrCodesRef, where("text", "==", qrCode));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await updateDoc(doc(db, "qrcodes", docSnapshot.id), { status: newStatus });
  });
}

function getLocalTimeInMexico() {
  const now = new Date();
  const offset = now.getTimezoneOffset() / 60;
  const centralTimeOffset = -6;
  const isDST = now.getMonth() >= 3 && now.getMonth() <= 10;
  const mexicoCityOffset = isDST ? centralTimeOffset + 1 : centralTimeOffset;

  const mexicoCityTime = new Date(now.getTime() + (mexicoCityOffset - offset) * 3600 * 1000);
  return mexicoCityTime;
}

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { uid, qrCodes } = req.body;
    try {
      if (qrCodes && uid) {
        const arrayQrCodes: string[] = JSON.parse(qrCodes);
        const now = getLocalTimeInMexico();
        const currentTime = formatTime(now);

        for (const qrCode of arrayQrCodes) {
          await updateQRCodeStatus(qrCode, "haciendo fila");

          let nextRideTime = "";
          for (const rideTime of rideTimes) {
            if (rideTime > currentTime) {
              nextRideTime = rideTime;
              break;
            }
          }

          await addDoc(collection(db, "virtualQueue"), {
            uid,
            text: qrCode,
            rideTime: nextRideTime
          });
        }

        res.status(200).json({ success: true, message: "Unido a la fila virtual" });
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
