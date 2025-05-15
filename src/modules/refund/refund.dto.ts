import { RefundStatus } from './refund.entity';

export class DTO_RQ_CreateRefund {
  ticket_id: number;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  money_paid?: number;
}

export class DTO_RP_Refund {
  id: string;
  ticket_id: number;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  money_paid: number;
  status: RefundStatus;
} 