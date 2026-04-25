import { EventEmitter } from "events";
import Logger from "../logger";
import 'reflect-metadata'

class EventEmitterService extends EventEmitter {
  private static instance: EventEmitterService;

  private constructor() {
    super();
  }

  public static getInstance(): EventEmitterService {
    if (!EventEmitterService.instance) {
      EventEmitterService.instance = new EventEmitterService();
    }
    return EventEmitterService.instance;
  }

  public emitEvent(eventName: string, ...payload: any) {
    Logger.info(`Emitting event: ${eventName}`);
    this.emit(eventName, ...payload);
  }
}

export const eventEmitter = EventEmitterService.getInstance();


const EVENT_LISTENERS_METADATA = Symbol("event_listeners");

export function OnEvent(eventName: string): MethodDecorator {
    return (target, propertyKey) => {
        const existingListeners = Reflect.getMetadata(EVENT_LISTENERS_METADATA, target) || [];
        existingListeners.push({ eventName, propertyKey });
        Reflect.defineMetadata(EVENT_LISTENERS_METADATA, existingListeners, target);
    };
}


export function registerEventListeners(instance: any) {
    const listeners = Reflect.getMetadata(EVENT_LISTENERS_METADATA, instance) || [];
  
    listeners.forEach(({ eventName, propertyKey }: { eventName: string; propertyKey: string }) => {
      console.log(`Registering event listener for: ${eventName}`);
      eventEmitter.on(eventName, instance[propertyKey].bind(instance));
    });
}