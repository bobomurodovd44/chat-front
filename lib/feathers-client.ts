import { feathers } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import authentication from "@feathersjs/authentication-client";
import io from "socket.io-client";

// Initialize the socket connection
const socket = io("http://localhost:3030");

// Initialize the Feathers client
const client = feathers();

// Configure Socket.io real-time APIs
client.configure(socketio(socket));

// Configure authentication
client.configure(
  authentication({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  })
);

export default client;

export type User = {
  _id: string;
  email: string;
  password?: string;
  fullName: string;
  username: string;
};

export type Message = {
  _id: string;
  text: string;
  senderId: string;
  chatId: string;
  createdAt: number;
  updatedAt: number;
  senderEmail: string;
  senderFullName: string;
  senderUserId: string;
};

export type MessageData = {
  text: string;
};

export type Group = {
  _id: string;
  name: string;
};
