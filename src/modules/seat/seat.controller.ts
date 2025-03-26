import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { SeatService } from "./seat.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { DTO_RP_SeatMap, DTO_RQ_SeatMap } from "./seat.dto";

@Controller()
export class SeatController {
    constructor(private readonly seatService: SeatService) {}

    // E7.UC01: Create Seating Chart
    @MessagePattern('create_seat_map')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async createSeat(@Payload() data: DTO_RQ_SeatMap): Promise<DTO_RP_SeatMap> {
        return await this.seatService.createSeat(data);
    }
}