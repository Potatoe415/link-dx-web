export class Input {
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      // Register both by code and by key representation
      if (!this.keysDown.has(code) && !this.keysDown.has(key)) {
        this.keysJustPressed.add(code);
        this.keysJustPressed.add(key);
      }
      this.keysDown.add(code);
      this.keysDown.add(key);

      // Prevent scrolling on arrow keys & space
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(code) ||
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
      this.keysDown.delete(e.key.toLowerCase());
    });

    // Reset keys if window loses focus
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.keysJustPressed.clear();
    });
  }

  public isDown(identifier: string): boolean {
    return this.keysDown.has(identifier) || this.keysDown.has(identifier.toLowerCase());
  }

  public wasJustPressed(identifier: string): boolean {
    return this.keysJustPressed.has(identifier) || this.keysJustPressed.has(identifier.toLowerCase());
  }

  public hasAnyActionPressed(): boolean {
    if (this.keysJustPressed.size > 0) return true;
    return (
      this.isDown('Space') ||
      this.isDown(' ') ||
      this.isDown('Enter') ||
      this.isDown('KeyE') ||
      this.isDown('e')
    );
  }

  public wasInteractJustPressed(): boolean {
    return (
      this.wasJustPressed('Space') ||
      this.wasJustPressed(' ') ||
      this.wasJustPressed('Enter') ||
      this.wasJustPressed('KeyE') ||
      this.wasJustPressed('e') ||
      this.wasJustPressed('KeyF') ||
      this.wasJustPressed('f')
    );
  }

  /** Inventory sub-menu toggle (Tab / I). */
  public wasMenuJustPressed(): boolean {
    return this.wasJustPressed('Tab') || this.wasJustPressed('KeyI') || this.wasJustPressed('i');
  }

  /** Item button A (Space / J): in the inventory, assigns the highlighted item to A. */
  public wasButtonAJustPressed(): boolean {
    return this.wasJustPressed('Space') || this.wasJustPressed(' ') || this.wasJustPressed('KeyJ') || this.wasJustPressed('j');
  }

  /** Item button B (Shift / X / K): in the inventory, assigns the highlighted item to B. */
  public wasButtonBJustPressed(): boolean {
    return (
      this.wasJustPressed('ShiftLeft') ||
      this.wasJustPressed('ShiftRight') ||
      this.wasJustPressed('KeyX') ||
      this.wasJustPressed('x') ||
      this.wasJustPressed('KeyK') ||
      this.wasJustPressed('k')
    );
  }

  /** Held state of the physical A / B buttons (sword charge, shield). */
  public isButtonAHeld(): boolean {
    return this.isDown('Space') || this.isDown(' ') || this.isDown('KeyJ') || this.isDown('j');
  }

  public isButtonBHeld(): boolean {
    return this.isShieldHeld() || this.isDown('KeyK') || this.isDown('k');
  }

  /** One-shot 4-way direction (menu cursor): 0 Left, 1 Up, 2 Right, 3 Down, -1 none. */
  public getDirectionJustPressed(): number {
    if (this.wasJustPressed('ArrowLeft') || this.wasJustPressed('KeyA') || this.wasJustPressed('KeyQ')) return 0;
    if (this.wasJustPressed('ArrowUp') || this.wasJustPressed('KeyW') || this.wasJustPressed('KeyZ')) return 1;
    if (this.wasJustPressed('ArrowRight') || this.wasJustPressed('KeyD')) return 2;
    if (this.wasJustPressed('ArrowDown') || this.wasJustPressed('KeyS')) return 3;
    return -1;
  }

  public isShieldHeld(): boolean {
    return (
      this.isDown('ShiftLeft') ||
      this.isDown('ShiftRight') ||
      this.isDown('shift') ||
      this.isDown('KeyX') ||
      this.isDown('x') ||
      this.isDown('KeyB') ||
      this.isDown('b')
    );
  }

  public getMovement(): { dx: number; dy: number; isMoving: boolean; direction: number } {
    let dx = 0;
    let dy = 0;

    // Left: ArrowLeft, A, Q
    if (this.isDown('ArrowLeft') || this.isDown('KeyA') || this.isDown('a') || this.isDown('KeyQ') || this.isDown('q')) {
      dx -= 1;
    }
    // Right: ArrowRight, D
    if (this.isDown('ArrowRight') || this.isDown('KeyD') || this.isDown('d')) {
      dx += 1;
    }
    // Up: ArrowUp, W, Z
    if (this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('w') || this.isDown('KeyZ') || this.isDown('z')) {
      dy -= 1;
    }
    // Down: ArrowDown, S
    if (this.isDown('ArrowDown') || this.isDown('KeyS') || this.isDown('s')) {
      dy += 1;
    }

    const isMoving = dx !== 0 || dy !== 0;

    // Determine 4-way direction: 0: Left, 1: Up, 2: Right, 3: Down
    let direction = -1;
    if (dy > 0) direction = 3;      // Down
    else if (dy < 0) direction = 1; // Up
    else if (dx < 0) direction = 0; // Left
    else if (dx > 0) direction = 2; // Right

    return { dx, dy, isMoving, direction };
  }

  public endFrame(): void {
    this.keysJustPressed.clear();
  }
}
