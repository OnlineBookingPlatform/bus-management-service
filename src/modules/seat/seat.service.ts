import { Injectable } from '@nestjs/common';
import { DTO_RP_SeatMap, DTO_RQ_SeatMap } from './seat.dto';

@Injectable()
export class SeatService {
  constructor() {}

  createSeat(data: DTO_RQ_SeatMap):Promise<DTO_RP_SeatMap> {
    console.log('Received Data Seat from client: ', data);
    return data;
  }
}
