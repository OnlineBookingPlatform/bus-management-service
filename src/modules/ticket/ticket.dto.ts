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
export class DTO_RQ_UpdateTicketOnPlatform {
    id: number;
    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    ticket_note: string;
    email: string;
    gender: number;
}