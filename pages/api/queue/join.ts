import { NextApiRequest, NextApiResponse } from "next";

type JoinRequestData = {
  name: string;
};

type ResponseData = {
  success: boolean;
  message?: string;
  queue?: string[];
  timeToNextPerson?: number;
};

// Lista que simula ser la fila virtual
let virtualQueue: string[] = [];
let lastUpdateTime: number = Date.now();

// Función para verificar si se debe sacar a la próxima persona de la fila
function checkQueue() {
  const currentTime = Date.now();
  if (virtualQueue.length > 0 && currentTime - lastUpdateTime >= 120000) { // 2 minutos
    virtualQueue.shift(); // Sacar a la próxima persona de la fila
    lastUpdateTime = currentTime;
  }
}

// Función para calcular el tiempo restante para sacar a la próxima persona de la fila
function getTimeToNextPerson() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastUpdateTime;
  return Math.max(120000 - elapsedTime, 0); // 2 minutos en milisegundos
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar si se debe sacar a la próxima persona de la fila
  checkQueue();

  if (req.method === "POST") {
    // Obtener los datos enviados en el cuerpo de la solicitud
    const { name }: JoinRequestData = req.body;

    // Agregar el nombre a la fila virtual
    virtualQueue.push(name);
    lastUpdateTime = Date.now(); // Actualizar el tiempo de la última actualización

    // Devolver un mensaje de éxito con el nombre agregado
    res.status(200).json({ success: true, message: `Added ${name} to virtual queue` });
  } else if (req.method === "GET" && req.query.action === "timeToNextPerson") {
    // Calcular el tiempo restante para sacar a la próxima persona de la fila
    const timeToNextPerson = getTimeToNextPerson();
    res.status(200).json({ success: true, timeToNextPerson });
  } else if (req.method === "GET") {
    // Devolver la lista actualizada de personas en la fila virtual
    res.status(200).json({ success: true, queue: virtualQueue });
  } else if (req.method === "DELETE") {
    // Obtener el nombre de la persona a eliminar
    const { name }: JoinRequestData = req.body;

    // Encontrar y eliminar la persona de la fila virtual
    const index = virtualQueue.indexOf(name);
    if (index !== -1) {
      virtualQueue.splice(index, 1);
      res.status(200).json({ success: true, message: `Removed ${name} from virtual queue` });
    } else {
      res.status(404).json({ success: false, message: `${name} not found in virtual queue` });
    }
  } else {
    // Devolver un error si el método de solicitud no es POST, GET o DELETE
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
