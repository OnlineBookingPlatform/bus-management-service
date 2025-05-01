import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { In, Repository } from 'typeorm';
import { DTO_RP_Ticket } from '../trip/trip.dto';
import { Trip } from '../trip/trip.entity';
import { DTO_RP_TicketSearch, DTO_RQ_TicketId, DTO_RQ_TicketSearch, DTO_RQ_UpdateTicketOnPlatform } from './ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) { }

  async getTicketByTrip(id: number): Promise<DTO_RP_Ticket[]> {
    console.log('getTicketByTrip', id);
    const trip = await this.tripRepository.findOne({ where: { id: id } });
    if (!trip) {
      throw new HttpException(
        'Dữ liệu chuyến không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    const tickets = await this.ticketRepository.find({
      where: { trip: { id: id } },
      relations: ['trip'],
    });
    const result: DTO_RP_Ticket[] = tickets.map((ticket) => ({
      id: ticket.id,
      seat_name: ticket.seat_name,
      seat_code: ticket.seat_code,
      seat_floor: ticket.seat_floor,
      seat_row: ticket.seat_row,
      seat_column: ticket.seat_column,
      seat_status: ticket.seat_status,
      status_booking_ticket: ticket.status_booking_ticket,
      base_price: ticket.base_price,


      passenger_name: ticket.passenger_name,
      passenger_phone: ticket.passenger_phone,
      point_up: ticket.point_up,
      point_down: ticket.point_down,
      ticket_note: ticket.ticket_note,
      email: ticket.email,
      gender: ticket.gender,
      creator_by_name: ticket.creator_by_name,
      payment_method: ticket.payment_method,
    }));
    console.log('result:', result);
    return result;
  }

  async changeTicketBooked(data: DTO_RQ_TicketId[]): Promise<void> {
    console.log('👉 Bắt đầu xử lý changeTicketBooked với dữ liệu:', data);

    const ids = data.map((item) => item.id);
    console.log('🆔 Danh sách ID cần xử lý:', ids);

    const tickets = await this.ticketRepository.findBy({ id: In(ids) });
    console.log('📦 Vé lấy từ DB:', tickets);

    if (tickets.length !== ids.length) {
      console.error('❌ Một hoặc nhiều vé không tồn tại trong DB!');
      throw new HttpException('Dữ liệu vé không tồn tại', HttpStatus.NOT_FOUND);
    }

    // ✅ Kiểm tra nếu tất cả vé đều chưa được đặt (status_booking_ticket === false)
    const allTicketsAreAvailable = tickets.every(
      (ticket) => ticket.status_booking_ticket === false,
    );
    console.log('🟢 Tất cả vé có đang ở trạng thái chưa đặt không?', allTicketsAreAvailable);

    if (!allTicketsAreAvailable) {
      console.error('❌ Có ít nhất 1 vé đã được đặt → huỷ thao tác!');
      throw new HttpException('Có vé đã được đặt', HttpStatus.CONFLICT);
    }

    for (const ticket of tickets) {
      console.log(`✅ Đang cập nhật vé ID ${ticket.id} → set status_booking_ticket = true`);
      ticket.status_booking_ticket = true;
    }

    console.log('💾 Đang lưu các vé đã cập nhật vào DB...');
    await this.ticketRepository.save(tickets);

    console.log('🎉 Cập nhật vé thành công!');
  }

  async changeTicketAvailable(data: DTO_RQ_TicketId[]): Promise<void> {
    console.log('👉 Bắt đầu xử lý changeTicketAvailable với dữ liệu:', data);

    const ids = data.map((item) => item.id);
    console.log('🆔 Danh sách ID cần xử lý:', ids);

    const tickets = await this.ticketRepository.findBy({ id: In(ids) });
    console.log('📦 Vé lấy từ DB:', tickets);

    if (tickets.length !== ids.length) {
      console.error('❌ Một hoặc nhiều vé không tồn tại trong DB!');
      throw new HttpException('Dữ liệu vé không tồn tại', HttpStatus.NOT_FOUND);
    }

    // ✅ Kiểm tra nếu tất cả vé đều đã được đặt (status_booking_ticket === true)
    const allTicketsAreBooked = tickets.every(
      (ticket) => ticket.status_booking_ticket === true,
    );
    console.log('🟢 Tất cả vé có đang ở trạng thái đã đặt không?', allTicketsAreBooked);

    if (!allTicketsAreBooked) {
      console.error('❌ Có ít nhất 1 vé chưa được đặt → huỷ thao tác!');
      throw new HttpException('Có vé chưa được đặt', HttpStatus.CONFLICT);
    }

    for (const ticket of tickets) {
      console.log(`✅ Đang cập nhật vé ID ${ticket.id} → set status_booking_ticket = false`);
      ticket.status_booking_ticket = false;
    }

    console.log('💾 Đang lưu các vé đã cập nhật vào DB...');
    await this.ticketRepository.save(tickets);

    console.log('🎉 Cập nhật vé thành công!');
  }

  async updateTicketOnPlatform(data: DTO_RQ_UpdateTicketOnPlatform[]): Promise<void> {
    console.log('👉 Bắt đầu xử lý updateTicketOnPlatform với dữ liệu:', data);

    const ids = data.map((item) => item.id);
    console.log('🆔 Danh sách ID cần xử lý:', ids);

    const tickets = await this.ticketRepository.findBy({ id: In(ids) });
    console.log('📦 Vé lấy từ DB:', tickets);

    if (tickets.length !== ids.length) {
      console.error('❌ Một hoặc nhiều vé không tồn tại trong DB!');
      throw new HttpException('Dữ liệu vé không tồn tại', HttpStatus.NOT_FOUND);
    }

    for (const ticket of tickets) {
      const updateData = data.find((item) => item.id === ticket.id);
      if (updateData) {
        ticket.passenger_name = updateData.passenger_name;
        ticket.passenger_phone = updateData.passenger_phone;
        ticket.point_up = updateData.point_up;
        ticket.point_down = updateData.point_down;
        ticket.ticket_note = updateData.ticket_note;
        ticket.creator_by_id = updateData.passenger_id;
        ticket.payment_method = 1;
        ticket.creator_by_name = "VinaHome";
        ticket.email = updateData.email;
        ticket.gender = updateData.gender;
        ticket.creator_by_id = updateData.passenger_id;
      }
    }

    console.log('💾 Đang lưu các vé đã cập nhật vào DB...');
    await this.ticketRepository.save(tickets);

    console.log('🎉 Cập nhật vé thành công!');
  }

  async updateTicketInfoOnBMS(data: any): Promise<void> {
    console.log("Booking Data:", data)
    return null;
  }

  // Tra cứu thông tin vé trên nền tảng
  async searchTicketOnPlatform(data: DTO_RQ_TicketSearch): Promise<DTO_RP_TicketSearch> {
    try {
      console.log('data:', data);
      const { phone, code } = data;
      
      if (!phone && !code) {
        throw new HttpException('Vui lòng cung cấp số điện thoại hoặc mã vé', HttpStatus.BAD_REQUEST);
      }
      const numericCode = code ? Number(code) : undefined;
      if (code && isNaN(numericCode)) {
        throw new HttpException('Mã vé không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      console.log('numericCode:', numericCode);
      const ticket = await this.ticketRepository.findOne({
        where: {
          id: numericCode,
          passenger_phone: phone,
        },
        relations: ['trip', 'trip.route'],
      });

      if (!ticket) {
        throw new HttpException('Không tìm thấy thông tin vé', HttpStatus.NOT_FOUND);
      }

      const response: DTO_RP_TicketSearch = {
        id: ticket.id,
        passenger_name: ticket.passenger_name,
        passenger_phone: ticket.passenger_phone,
        point_up: ticket.point_up,
        point_down: ticket.point_down,
        email: ticket.email,
        base_price: ticket.base_price,
        payment_method: ticket.payment_method,
        seat_name: ticket.seat_name,
        route_name: ticket.trip.route.name,
        license_plate: null,
        start_time: ticket.trip.time_departure.toString(),
        start_date: ticket.trip.date_departure.toString(),
      };
      console.log('response:', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm vé:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi tìm kiếm vé',
        HttpStatus.INTERNAL_SERVER_ERROR,)
    }

  }

}
