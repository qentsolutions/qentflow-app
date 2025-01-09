import { NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export async function GET(req: Request) {
  try {
    if (!(global as any).io) {
      console.log("New Socket.io server...");
      const httpServer: NetServer = (global as any).httpServer;
      const io = new SocketIOServer(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
      });
      (global as any).io = io;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}