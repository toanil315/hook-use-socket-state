import { Reducer, useEffect, useReducer } from "react";
import { useSocketContext } from "./SocketProvider";
import { MESSAGE_TYPES_ENUM } from "./constant";
import { Message } from "./interface";

interface Props<State, Action> {
  topic: string;
  channelId: string;
  reducer: Reducer<State, Action>;
  initialValue: State;
}

const useSharedReducer = <State, Action>({
  topic,
  channelId,
  reducer,
  initialValue,
}: Props<State, Action>) => {
  const [state, dispatch] = useReducer(reducer, initialValue);
  const { socket } = useSocketContext();

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
      dispatch(message.data as Action);
    };

    socket.on(topic, handleSocketMessage);

    return () => {
      socket.off(topic, handleSocketMessage);
    };
  }, [topic, channelId, socket, dispatch]);

  const sharedReducerDispatch = (action: Action, noEmit = false) => {
    if (socket && !noEmit) {
      socket.emit(topic, {
        type: MESSAGE_TYPES_ENUM.SHARED_MESSAGE,
        data: action,
        from: socket.id,
        channel: channelId,
      });
    }
    dispatch(action);
  };

  return [state, sharedReducerDispatch];
};
export default useSharedReducer;
