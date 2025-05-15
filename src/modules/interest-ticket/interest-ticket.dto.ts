export class DTO_RQ_CreateInterestTicket {
  ticket_id: number;
  account_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  point_up?: string;
  point_down?: string;
  ticket_note?: string;
  gender?: number;
}

export class DTO_RP_InterestTicket {
  id: string;
  ticket_id: number;
  account_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  point_up: string;
  point_down: string;
  ticket_note: string;
  gender: number;
}

export class DTO_RQ_DeleteInterestTicket {
  id: string;
} 