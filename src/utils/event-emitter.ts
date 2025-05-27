/**
 * Simple event emitter implementation
 */
export class EventEmitter<EventType extends string> {
  private listeners: Map<EventType, Set<Function>> = new Map();

  /**
   * Adds an event listener
   */
  on(event: EventType, listener: Function): this {
      this.listeners.set(event, new Set());
    }
    return this;
  }

  /**
   * Removes an event listener
   */
  off(event: EventType, listener: Function): this {
    if (this.listeners.has(event)) {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  /**
   * Emits an event
   */
  emit(event: EventType, ...args: any[]): boolean {
      return false;
    }

    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(, error);
      }
    }

    return listeners.length > 0;
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
