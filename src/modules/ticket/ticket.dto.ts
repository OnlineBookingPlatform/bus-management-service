export class DTO_RP_Ticket {
    id: number;
    seat_name: string;
    seat_code: string;
    seat_floor: number;
    seat_row: number;
    seat_column: number;
    seat_status: boolean;
    status_booking_ticket: boolean;
    base_price: number;

    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    ticket_note: string;
    email: string;
    gender: number;
    creator_by_name: string;
    payment_method: number;
    money_paid: number;
}

export class DTO_RQ_TicketId {
    id: number;
}
export class DTO_RQ_UpdateTicketOnPlatform {
    id: number;
    passenger_id: string;
    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    ticket_note: string;
    email: string;
    gender: number;
    creator_by_id: string;
}

export interface DTO_RQ_TicketSearch {
    phone: string;
    code: number;
  }
  export interface DTO_RP_TicketSearch {
    id: number;
    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    email: string;
    base_price: number;
    payment_method: number;
    seat_name: string;
    route_name: string;
    license_plate: string;
    start_time: string;
    start_date: string;
    company_id: number;
    trip_id: number;
  }
  export class DTO_RQ_Ticket {
    id: number;
    seat_name: string;
    price: number;
}
  export interface DTO_RQ_TicketByPaymentService {
    account_id: string;
    service_provider_id: number;
    service_provider_name: string;
    ticket: DTO_RQ_Ticket[];

    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    ticket_note: string;
    email: string;
    gender: number;
    creator_by_id: string;
  }