import type { TableData } from '../components/TableGrid';

const MOCK_TABLES: TableData[] = [
  { id: 1, name: 'Table 01', type: 'Pool', status: 'available' },
  { id: 2, name: 'Table 02', type: 'Carom', status: 'playing', startTime: new Date(Date.now() - 1245000).toISOString() },
  { id: 3, name: 'Table 03', type: 'Pool', status: 'available' },
  { id: 4, name: 'Table 04', type: 'Pool', status: 'reserved' },
  { id: 5, name: 'Table 05', type: 'Carom', status: 'playing', startTime: new Date(Date.now() - 2847000).toISOString() },
  { id: 6, name: 'Table 06', type: 'Pool', status: 'available' },
  { id: 7, name: 'Table 07', type: 'Pool', status: 'maintenance' },
  { id: 8, name: 'Table 08', type: 'Carom', status: 'playing', startTime: new Date(Date.now() - 567000).toISOString() },
  { id: 9, name: 'Table 09', type: 'Pool', status: 'available' },
  { id: 10, name: 'Table 10', type: 'Pool', status: 'reserved' },
  { id: 11, name: 'Table 11', type: 'Carom', status: 'available' },
  { id: 12, name: 'Table 12', type: 'Pool', status: 'playing', startTime: new Date(Date.now() - 3456000).toISOString() },
];

export const tableService = {
  async getAll(): Promise<TableData[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return MOCK_TABLES;
  },
};
