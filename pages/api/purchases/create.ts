import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/config";
import { collection, query, where, getDocs, addDoc, getDoc, DocumentReference } from "firebase/firestore";
import { DocumentData } from "@firebase/firestore-types";

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
  res: NextApiResponse<Order | { error: string }>
) {
  if (req.method === "POST") {
    try {
      const { uid, date, products, total } = req.body;

      if (!uid || !date || !products || !total) {
        return res.status(400).json({ error: "UID, date, products, and total are required in the request body" });
      }

      const orderNumber = generateOrderNumber();

      const orderNumberExists = await checkOrderNumberExists(orderNumber);
      if (orderNumberExists) {
        return res.status(500).json({ error: "Failed to generate a unique order number" });
      }

      const ordersRef = collection(db, "/orders");
      const newOrderRef = await addDoc(ordersRef, {
        uid: uid,
        date: new Date(date),
        products: products,
        total: total,
        status: "pending",
        orderNumber: orderNumber,
      });

      const newOrderSnapshot = await getDoc(newOrderRef as DocumentReference<DocumentData>);
      const newOrderData = newOrderSnapshot.data();

      if (newOrderData) {
        const newOrder: Order = {
          id: newOrderSnapshot.id,
          date: newOrderData.date.toDate(),
          products: newOrderData.products,
          status: newOrderData.status,
          uid: newOrderData.uid,
          total: newOrderData.total,
          orderNumber: newOrderData.orderNumber,
        };
        res.status(200).json(newOrder);
      } else {
        res.status(500).json({ error: "Failed to create order" });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Function to generate a random 5-digit order number
function generateOrderNumber(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

// Function to check if the order number already exists
async function checkOrderNumberExists(orderNumber: number): Promise<boolean> {
  const ordersRef = collection(db, "/orders");
  const q = query(ordersRef, where("orderNumber", "==", orderNumber));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}
