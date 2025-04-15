export class DTO_RP_Ticekt {
    id: number;
    seat_name: string;
    seat_code: string;
    seat_floor: number;
    seat_row: number;
    seat_column: number;
    seat_status: boolean;
    status_booking_ticket: boolean;
    base_price: number;
}

export class DTO_RQ_TicketId {
    id: number;
}