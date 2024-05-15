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

async function updateQRCodeStatus(qrCode: string, newStatus: string) {
  const qrCodesRef = collection(db, "qrcodes");
  const q = query(qrCodesRef, where("text", "==", qrCode));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await updateDoc(doc(db, "qrcodes", docSnapshot.id), { status: newStatus });
  });
}

function getQueueState(uid: string): QueueState {
  const userQueue = virtualQueue.filter(entry => entry.uid === uid);

  if (userQueue.length === 0) {
    return { users: [] };
  }
  const rideTimes: Date[] = [];
  const startTime = new Date();
  startTime.setHours(8, 0, 0);
  const endTime = new Date();
  endTime.setHours(18, 0, 0);

  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    rideTimes.push(new Date(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + 20);
  }

  const now = new Date();

  const usersState = userQueue.map((entry, index) => {
    const position = index + 1;
    let timeToNextRide = "";
    let timeUntilNextRemoval = "";

    for (const rideTime of rideTimes) {
      if (rideTime > now) {
        const diffMs = rideTime.getTime() - now.getTime();
        const diffSeconds = Math.ceil(diffMs / 1000);
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        timeToNextRide = `${minutes} minutos y ${seconds} segundos`;
        timeUntilNextRemoval = `${minutes + (20 * index)} minutos y ${seconds} segundos`;

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
