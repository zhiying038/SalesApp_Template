import { createContext, useContext } from "react";
import EventEmitter from "eventemitter3";

type EventProps = {
  children?: React.ReactNode;
};

const event = new EventEmitter();

const EventContext = createContext<EventEmitter>(event);

export const EventProvider: React.FC<EventProps> = ({ children }) => {
  return <EventContext.Provider value={event}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  return useContext(EventContext);
};
