export interface Person {
  id: string;
  name: string;
}

export interface BillPersonDetails {
  personId: string;
  name: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  days: number;
  amountContributed: number;
}

export interface Bill {
  id: string;
  amount: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  peopleDetails: BillPersonDetails[];
}

export interface AppState {
  people: Person[];
  bills: Bill[];
}
