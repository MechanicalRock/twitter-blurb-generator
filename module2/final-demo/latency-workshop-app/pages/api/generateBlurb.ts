import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200);
  res.send({
    body: "Success response",
  });
};

export default handler;
