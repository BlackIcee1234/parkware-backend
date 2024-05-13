import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs } from "firebase/firestore";

type Order = {
  id: string;
  date: Date;
  products: string[];
  status: string;
  uid: string;
  total: number;
  orderNumber: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | { error: string }>
) {
  if (req.method === "POST") {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ error: "UID is required in the request body" });
      }

      const ordersRef = collection(db, "/orders");
      const q = query(ordersRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const date = doc.data().date.toDate();
        orders.push({
          id: doc.id,
          date: date,
          products: doc.data().products,
          status: doc.data().status,
          uid: doc.data().uid,
          total: doc.data().total,
          orderNumber: doc.data().orderNumber,
        });
      });

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
