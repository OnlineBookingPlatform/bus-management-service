import { Injectable } from '@nestjs/common';

@Injectable()
export class SeatService {
  constructor() {}

  createSeat(data: any) {
    console.log('Received Data Seat from client: ', data);
    return data;
  }
}
