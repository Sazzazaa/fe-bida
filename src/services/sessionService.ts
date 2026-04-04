export interface SessionData {
  sessionId: number;
  tableId: number;
  startedAt: string;
}

let sessionCounter = 2000;
const activeSessionsByTable = new Map<number, SessionData>();

export const sessionService = {
  async startSession(tableId: number): Promise<SessionData> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const existing = activeSessionsByTable.get(tableId);
    if (existing) return existing;

    const newSession: SessionData = {
      sessionId: ++sessionCounter,
      tableId,
      startedAt: new Date().toISOString(),
    };

    activeSessionsByTable.set(tableId, newSession);
    return newSession;
  },

  async endSession(sessionId: number): Promise<{ sessionId: number; endedAt: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    for (const [tableId, session] of activeSessionsByTable.entries()) {
      if (session.sessionId === sessionId) {
        activeSessionsByTable.delete(tableId);
        break;
      }
    }

    return { sessionId, endedAt: new Date().toISOString() };
  },
};
