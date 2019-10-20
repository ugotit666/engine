interface EventBus {
  on: (event: string, handler: (...args: Array<any>) => void) => string;
  off: (handlerId: string) => void;
  emit: (event: string, ...args: Array<any>) => void;
}

export { EventBus };
