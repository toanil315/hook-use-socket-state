import { MESSAGE_TYPES_ENUM } from "./constant";

export interface Message {
  type: string;
  data: any;
  from: string;
  channel: string;
}

export interface SubscribeMessage {
  type: MESSAGE_TYPES_ENUM.SUBSCRIBE__TO__CHANNEL;
  user_id: string;
}

export interface UnsubscribeMessage {
  type: MESSAGE_TYPES_ENUM.UNSUBSCRIBE__FROM__CHANNEL;
  user_id: string;
}
