/**
 * Simple event emitter implementation
 */
export class EventEmitter<EventType extends string> {
  private listeners: Map<EventType, Set<Function>> = new Map();

  /**
   * Adds an event listener
   */
  on(event: EventType, listener: Function): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
    return this;
  }

  /**
   * Removes an event listener
   */
  off(event: EventType, listener: Function): this {
    if (this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
      this.listeners.delete(event);
    }
  }
}
    return this;
  }

  /**
   * Emits an event
   */
  emit(event: EventType, ...args: any[]): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      return false;
    }

    for (const listener of eventListeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    }

    return eventListeners.size > 0;
  }

  /**
   * Removes all listeners
   */
  removeAllListeners(event?: EventType): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}