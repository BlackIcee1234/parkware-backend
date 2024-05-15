import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs } from "firebase/firestore";

type JoinRequestData = {
  base64Data: string;
  uid: string;
};

type ResponseData = {
  success: boolean;
  timeToNextRide?: string;
  positionInQueue?: number;
  error?: string;
};

let waitingQueue: string[] = [];
let enjoyingRideQueue: string[] = [];
let lastUpdateTime: number = Date.now();
console.log(lastUpdateTime);

async function moveUsersToEnjoyingRideQueue() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour % 1 === 0 && currentTime.getMinutes() === 0) {
    const usersToMove = waitingQueue.splice(0, 10);
    enjoyingRideQueue.push(...usersToMove);
    lastUpdateTime = currentTime.getTime();
  }
}

function getPositionInQueue(uid: string): number {
  return waitingQueue.indexOf(uid) + 1;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  await moveUsersToEnjoyingRideQueue();

  if (req.method === "POST") {
    const { base64Data, uid }: JoinRequestData = req.body;

    try {
      const ordersRef = collection(db, "/qrcodes");
      const q = query(ordersRef, where("base64Data", "==", base64Data));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if(doc.data().base64Data === base64Data) {
          const position = getPositionInQueue(uid);
          return res.status(200).json({ success: true, positionInQueue: position });
        } else {
          return res.status(400).json({ success: false, error: "Invalid QR code" });
        }
      });
    } catch (error) {
      console.error("Error verifying QR code:", error);
      return res.status(500).json({ success: false, error: "Error verifying QR code" });
    }
  } else if (req.method === "GET") {
    const currentTime = new Date();
    const timeToNextRide = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), (Math.floor(currentTime.getHours()) + 1), 0, 0).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return res.status(200).json({ success: true, timeToNextRide });
  } else {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}
