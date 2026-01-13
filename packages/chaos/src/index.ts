import { setTimeout as timersSetTimeout } from 'node:timers/promises';

export type ChaosConfig = {
  // milliseconds to delay PDF generation; 0 means no delay
  pdfDelayMs: number;
  // probability between 0 and 1 to fail DB operations; 0 means never fail
  dbFailRate: number;
};

class ChaosControllerClass {
  private config: ChaosConfig;

  constructor() {
    this.config = {
      pdfDelayMs: 0,
      dbFailRate: 0,
    };
  }

  getConfig(): ChaosConfig {
    // return a shallow copy to avoid external mutation
    return { ...this.config };
  }

  updateConfig(patch: Partial<ChaosConfig>): ChaosConfig {
    this.config = { ...this.config, ...patch };
    return this.getConfig();
  }

  async delayPdf(): Promise<void> {
    const ms = this.config.pdfDelayMs ?? 0;
    if (ms > 0) {
      await timersSetTimeout(ms);
    }
  }

  maybeFailDb(): void {
    const rate = this.config.dbFailRate ?? 0;
    if (rate <= 0) return;
    if (rate >= 1) throw new Error('ChaosController: forced DB failure');
    if (Math.random() < rate) {
      throw new Error('ChaosController: random DB failure');
    }
  }
}

export const ChaosController = new ChaosControllerClass();

export default ChaosController;
