import express from "express";
import { authMiddleware } from "./middleware";
import { prisma } from "database/client";

const app = express();
app.use(express.json());

app.post("/api/v1/website", authMiddleware, async (req, res) => {
  // go through the authMiddleware
  // get the userId and url
  const userId = req.userId!;
  const { url } = req.body;

  // dump it to the database
  const data = await prisma.websites.create({
    data: {
      userId,
      url,
    },
  });

  // send it back to the user
  res.json({
    id: data.id,
  });
});

app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
  const websiteId = req.query.websiteId! as unknown as string;
  const userId = req.userId;

  const data = await prisma.websites.findFirst({
    where: {
      id: websiteId,
      userId,
      disabled: false,
    },
    include: {
      ticks: true,
    },
  });

  res.json(data);
});

app.get("/api/v1/website", authMiddleware, async (req, res) => {
  const userId = req.userId!;

  const websites = await prisma.websites.findMany({
    where: {
      userId,
      disabled: false,
    },
  });

  res.json({
    websites,
  });
});

app.delete("/api/v1/website/:websiteId", authMiddleware, async (req, res) => {
  const websiteId = req.body.websiteId;
  const userId = req.userId!;

  await prisma.websites.update({
    where: {
      id: websiteId,
      userId,
    },
    data: {
      disabled: true,
    },
  });

  res.json({
    message: "deleted website successfully",
  });
});
app.listen(3000);
