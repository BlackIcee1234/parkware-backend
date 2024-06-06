import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, getDocs } from "firebase/firestore";

type QueueState = {
  users: {
    uid: string;
    position: number;
    timeToNextRide: string;
    timeUntilNextRemoval: string;
    text: string;
    rideTime: string;
  }[];
};

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

async function getQueueState(uid: string): Promise<QueueState> {
  const queueRef = collection(db, "virtualQueue");
  const querySnapshot = await getDocs(queueRef);

  if (querySnapshot.empty) {
    return { users: [] };
  }

  const now = process.env.NODE_ENV === "production" ? getLocalTimeInMexico() : new Date();
  const currentTime = formatTime(now);
  const usersState = [];

  for (const docSnapshot of querySnapshot.docs) {
    const data = docSnapshot.data();
    let timeToNextRide = "";
    let timeUntilNextRemoval = "";

    // Calcular el tiempo hasta el próximo ride basado en el tiempo actual
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
        break;
      }
    }

    // Calcular el tiempo hasta la próxima remoción basado en la posición
    const position = data.position;
    const groupIndex = Math.floor((position - 1) / 3);
    const nextRideTimeIndex = rideTimes.findIndex(rideTime => rideTime > currentTime) + groupIndex;
    if (nextRideTimeIndex < rideTimes.length) {
      const [nextRideHour, nextRideMinute] = rideTimes[nextRideTimeIndex].split(":").map(Number);
      const nextRideDate = new Date(now);
      nextRideDate.setHours(nextRideHour, nextRideMinute, 0, 0);

      const diffMs = nextRideDate.getTime() - now.getTime();
      const diffSeconds = Math.ceil(diffMs / 1000);
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      timeUntilNextRemoval = `${minutes} minutos y ${seconds} segundos`;
    }

    if (data.uid === uid) {
      usersState.push({
        uid: data.uid,
        position: data.position,
        timeToNextRide: timeToNextRide,
        timeUntilNextRemoval: timeUntilNextRemoval,
        text: data.text,
        rideTime: rideTimes[nextRideTimeIndex]
      });
    }
  }

  return { users: usersState };
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { uid } = req.body;
    try {
        if(uid){
            const state = await getQueueState(uid);
            res.status(200).json({ success: true, queueState: state });
        }
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ success: false, error: "Error al procesar la solicitud" });
    }
  } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
