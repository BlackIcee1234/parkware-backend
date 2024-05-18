import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

type QueueState = {
  users: {
    uid: string;
    position: number;
    timeToNextRide: string;
    timeUntilNextRemoval: string;
  }[];
};

let virtualQueue: { text: string, uid: string }[] = [];
console.log(virtualQueue);

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
  "17:40"
];
console.log(rideTimes);

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
  // Guadalajara is in the Central Time Zone (UTC-6), and observes Daylight Saving Time (UTC-5 during DST)
  const offset = now.getTimezoneOffset() / 60; // getTimezoneOffset() returns minutes, convert to hours
  const centralTimeOffset = -6; // Standard time (UTC-6)
  const isDST = now.getMonth() >= 3 && now.getMonth() <= 10; // Rough estimate of DST period (April to October)
  const mexicoCityOffset = isDST ? centralTimeOffset + 1 : centralTimeOffset;

  const mexicoCityTime = new Date(now.getTime() + (mexicoCityOffset - offset) * 3600 * 1000);
  return mexicoCityTime;
}

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getQueueState(uid: string): QueueState {
  const userQueue = virtualQueue.filter(entry => entry.uid === uid);

  if (userQueue.length === 0) {
    return { users: [] };
  }

  const now = getLocalTimeInMexico();
  const currentTime = formatTime(now);

  const usersState = userQueue.map((entry, index) => {
    const position = index + 1;
    let timeToNextRide = "";
    let timeUntilNextRemoval = "";

    for (const rideTime of rideTimes) {
      if (rideTime > currentTime) {
        const [rideHour, rideMinute] = rideTime.split(":").map(Number);
        const rideDate = new Date(now);
        rideDate.setHours(rideHour, rideMinute, 0, 0);

        const diffMs = rideDate.getTime() - now.getTime();
        const diffSeconds = Math.ceil(diffMs / 1000);
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        timeToNextRide = `${minutes} minutos y ${seconds} segundos`;
        timeUntilNextRemoval = `${minutes + (20 * (position - 1))} minutos y ${seconds} segundos`;
        break;
      }
    }
    return {
      uid: entry.uid,
      position: position,
      timeToNextRide: timeToNextRide,
      timeUntilNextRemoval: timeUntilNextRemoval
    };
  });

  return { users: usersState };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { uid, qrCodes, leave } = req.body;
    try {
      if (qrCodes) {
        const arrayQrCodes: string[] = JSON.parse(qrCodes);
        for (const qrCode of arrayQrCodes) {
          await updateQRCodeStatus(qrCode, "haciendo fila");
          virtualQueue.push({ text: qrCode, uid });
        }

        res.status(200).json({ success: true, message: "Unido a la fila virtual" });
      }
      else if (leave) {
        const index = virtualQueue.findIndex(entry => entry.uid === uid);
        if (index !== -1) {
          virtualQueue.splice(index, 1);
          res.status(200).json({ success: true, message: "Saliste de la fila virtual" });
        } else {
          res.status(404).json({ success: false, error: "El usuario no está en la fila virtual" });
        }
      }
      else {
        const usersInQueue = virtualQueue.filter(entry => entry.uid === uid);
        if (usersInQueue.length > 0) {
          const state = getQueueState(uid);
          res.status(200).json({ success: true, queueState: state });
        } else {
          res.status(404).json({ success: false, error: "El usuario no está en la fila virtual" });
        }
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else if (req.method === "DELETE") {
    try {
      virtualQueue.splice(0, 2);
      res.status(200).json({ success: true, message: "Los primeros dos elementos han sido eliminados de la fila virtual" });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
