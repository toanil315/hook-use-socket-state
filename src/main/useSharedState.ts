import { useEffect, useState } from "react";
import { useSocketContext } from "./SocketProvider";
import { Message } from "./interface";
import { MESSAGE_TYPES_ENUM } from "./constant";

interface Props<T> {
  channelId: string;
  topic: string;
  initialValue: T;
  callback: (value: T) => T;
}

const useSharedState = <T>({
  topic,
  channelId,
  initialValue,
  callback,
}: Props<T>) => {
  const [state, setState] = useState<T>(initialValue);
  const socket = useSocketContext().socket;

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", {
      type: MESSAGE_TYPES_ENUM.SUBSCRIBE__TO__CHANNEL,
      user_id: socket.id,
      channel: channelId,
    });

    return () => {
      socket.emit("out", {
        type: MESSAGE_TYPES_ENUM.UNSUBSCRIBE__FROM__CHANNEL,
        user_id: socket.id,
        channel: channelId,
      });
    };
  }, [channelId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (message: Message) => {
      if (message.channel !== channelId) return;
      setState(callback(message.data));
    };

    socket.on(topic, handleSocketMessage);

    return () => {
      socket.off(topic, handleSocketMessage);
    };
  }, [topic, channelId, socket, callback]);

  const setSharedState = (value: T, noEmit = false) => {
    if (socket && !noEmit) {
      socket.emit(topic, {
        type: MESSAGE_TYPES_ENUM.SHARED_MESSAGE,
        data: value,
        from: socket.id,
        channel: channelId,
      });
    }
    setState(callback(value));
  };

  return { sharedState: state, setSharedState };
};
export default useSharedState;
