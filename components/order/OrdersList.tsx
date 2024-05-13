import React, { useEffect, useState } from "react";
import { db } from "../../utils/config";
import { collection, getDocs } from "firebase/firestore";

interface Order {
  id: string;
  date: Date;
  products: string[];
  status: string;
}

const OrdersComponent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  // const [page, setPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const querySnapshot = await getDocs(ordersRef);
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const orderData: Order = {
            id: doc.id,
            date: new Date(doc.data().date),
            products: doc.data().products,
            status: doc.data().status
          };
        ordersData.push(orderData);
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Error obteniendo los documentos: ", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Órdenes</h1>
      <ul>
        {orders.map(order => (
          <li key={order.id} className="border border-gray-200 p-4 mb-4">
            <div>ID: {order.id}</div>
            <div>Fecha: {order.date.toLocaleString()}</div>
            <div>Productos: {order.products.join(", ")}</div>
            <div>Estado: {order.status}</div>
            {/* Agrega más campos aquí según tus necesidades */}
          </li>
        ))}
      </ul>
      {/* Agrega la paginación aquí */}
    </div>
  );
};

export default OrdersComponent;
