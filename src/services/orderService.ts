import { MOCK_FNB_ITEMS } from './fnbService';

export interface SessionOrder {
  id: number;
  sessionId: number;
  fnbItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderedAt: string;
}

const ordersBySession = new Map<number, SessionOrder[]>();
let orderCounter = 5000;

export const orderService = {
  async getBySessionId(sessionId: number): Promise<SessionOrder[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return ordersBySession.get(sessionId) ?? [];
  },

  async create(sessionId: number, fnbItemId: number, quantity: number): Promise<SessionOrder> {
    await new Promise((resolve) => setTimeout(resolve, 220));

    const item = MOCK_FNB_ITEMS.find((menuItem) => menuItem.id === fnbItemId);
    if (!item) {
      throw new Error('F&B item not found');
    }

    const order: SessionOrder = {
      id: ++orderCounter,
      sessionId,
      fnbItemId,
      itemName: item.name,
      quantity,
      unitPrice: item.price,
      totalAmount: item.price * quantity,
      orderedAt: new Date().toISOString(),
    };

    const prevOrders = ordersBySession.get(sessionId) ?? [];
    ordersBySession.set(sessionId, [...prevOrders, order]);

    return order;
  },
};
