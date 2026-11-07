/**
 * Buzz Blob electrocution look, ported from GameManager.UseShockEffect + `Content/Shader/ShockEffect.fx`
 * (ShockShader0 marks) and GameManager.ShakeScreen(time, 4, 0, 8.5, 0): the whole frame is remapped
 * to a 3-colour palette by luminance while the screen shakes horizontally by up to 4 logical px.
 */
const MARK1 = 0.2675;
const MARK2 = 0.725;
const C0: [number, number, number] = [255, 255, 123]; // float4(1.000, 1.000, 0.482)
const C1: [number, number, number] = [16, 33, 49]; // float4(0.063, 0.129, 0.192)
const C2: [number, number, number] = [255, 255, 255];
const SHAKE_MAX_X = 4;
const SHAKE_SPEED_X = 8.5;

export class ShockEffect {
  private remainingMs = 0;

  public start(ms: number): void {
    this.remainingMs = ms;
  }

  public get active(): boolean {
    return this.remainingMs > 0;
  }

  public update(dtMs: number): void {
    this.remainingMs = Math.max(0, this.remainingMs - dtMs);
  }

  /** GameManager.UpdateShake: horizontal camera offset in logical px. */
  public get shakeX(): number {
    return this.active ? Math.sin((this.remainingMs / 100) * SHAKE_SPEED_X) * SHAKE_MAX_X : 0;
  }

  /** ShockEffect.fx MainPS over the rendered frame. */
  public apply(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.active) return;
    const image = ctx.getImageData(0, 0, width, height);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      const sum = (0.4 * d[i] + 0.2 * d[i + 1] + 0.4 * d[i + 2]) / 255;
      if (sum <= 0) continue;
      const c = sum <= MARK1 ? C0 : sum <= MARK2 ? C1 : C2;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
    }
    ctx.putImageData(image, 0, 0);
  }
}
