import { NextApiRequest, NextApiResponse } from 'next'

type JoinRequestData = {
  name: string
}

type ResponseData = {
  success: boolean
  message: string
}

// Lista que simula ser la fila virtual
let virtualQueue: string[] = []

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    // Código para manejar la solicitud POST
  } else if (req.method === 'GET') {
    // Devolver la lista actualizada de personas en la fila virtual
    res.status(200).json({ success: true, queue: virtualQueue })
  } else {
    // Devolver un error si el método de solicitud no es POST ni GET
    res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }
}
