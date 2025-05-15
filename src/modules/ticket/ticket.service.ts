import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { In, Repository } from 'typeorm';
import { DTO_RP_Ticket } from '../trip/trip.dto';
import { Trip } from '../trip/trip.entity';
import {
  DTO_RP_TicketSearch,
  DTO_RQ_Ticket,
  DTO_RQ_TicketByPaymentService,
  DTO_RQ_TicketId,
  DTO_RQ_TicketSearch,
  DTO_RQ_UpdateTicketOnPlatform,
} from './ticket.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { RefundService } from '../refund/refund.service';
import { InterestTicketService } from '../interest-ticket/interest-ticket.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,

    private readonly mailerService: MailerService,
    private readonly refundService: RefundService,
    @Inject(forwardRef(() => InterestTicketService))
    private readonly interestTicketService: InterestTicketService,
  ) {}

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
      money_paid: ticket.money_paid,
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
    console.log(
      '🟢 Tất cả vé có đang ở trạng thái chưa đặt không?',
      allTicketsAreAvailable,
    );

    if (!allTicketsAreAvailable) {
      console.error('❌ Có ít nhất 1 vé đã được đặt → huỷ thao tác!');
      throw new HttpException('Có vé đã được đặt', HttpStatus.CONFLICT);
    }

    for (const ticket of tickets) {
      console.log(
        `✅ Đang cập nhật vé ID ${ticket.id} → set status_booking_ticket = true`,
      );
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
    console.log(
      '🟢 Tất cả vé có đang ở trạng thái đã đặt không?',
      allTicketsAreBooked,
    );

    if (!allTicketsAreBooked) {
      console.error('❌ Có ít nhất 1 vé chưa được đặt → huỷ thao tác!');
      throw new HttpException('Có vé chưa được đặt', HttpStatus.CONFLICT);
    }

    for (const ticket of tickets) {
      console.log(
        `✅ Đang cập nhật vé ID ${ticket.id} → set status_booking_ticket = false`,
      );
      ticket.status_booking_ticket = false;
    }

    console.log('💾 Đang lưu các vé đã cập nhật vào DB...');
    await this.ticketRepository.save(tickets);

    console.log('🎉 Cập nhật vé thành công!');
  }

  async abortTicketOnPlatform(data: DTO_RQ_TicketId | number): Promise<void> {
    console.log('👉 Bắt đầu xử lý abortTicketOnPlatform với dữ liệu:', data);

    // Handle both cases: when data is a DTO object or a direct number ID
    const ticketId = typeof data === 'object' && data !== null ? data.id : Number(data);
    console.log('🔍 Searching for ticket ID:', ticketId);

    try {
      // First try to find the ticket directly to verify it exists
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['trip', 'company'],
      });

      if (!ticket) {
        console.error(`❌ Ticket with ID ${ticketId} not found in database`);
        throw new HttpException('Dữ liệu vé không tồn tại', HttpStatus.NOT_FOUND);
      }

      console.log(`✅ Found ticket ID ${ticketId}:`, ticket);

      // Find interest tickets first before doing anything else
      let interestTickets = [];
      let savedInterestTicketData = null;
      
      try {
        interestTickets = await this.interestTicketService.findByTicketId(ticketId);
        console.log(`✅ Found ${interestTickets.length} interest tickets for ticket ID ${ticketId}`);

        // Save the first interest ticket data for later use
        if (interestTickets && interestTickets.length > 0) {
          savedInterestTicketData = {
            account_id: interestTickets[0].account_id,
            passenger_name: interestTickets[0].passenger_name,
            passenger_phone: interestTickets[0].passenger_phone,
            point_up: interestTickets[0].point_up,
            point_down: interestTickets[0].point_down,
            ticket_note: interestTickets[0].note,
            passenger_email: interestTickets[0].passenger_email,
            gender: interestTickets[0].gender
          };
          
          // Delete the interest tickets right away
          for (const interestTicket of interestTickets) {
            await this.interestTicketService.delete({ id: interestTicket.id });
            console.log(`✅ Deleted associated interest ticket with ID: ${interestTicket.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing interest tickets: ${error.message}`);
        // Continue even if interest ticket processing fails
      }
      
      // Create refund record if needed
      if (ticket.passenger_name && ticket.email) {
        try {
          await this.refundService.create({
            ticket_id: ticket.id,
            passenger_name: ticket.passenger_name,
            passenger_phone: ticket.passenger_phone,
            passenger_email: ticket.email,
            money_paid: ticket.money_paid,
          });
          console.log(`✅ Đã tạo hồ sơ hoàn tiền cho vé ${ticket.id}`);
          
          // Send Vietnamese email notification about refund
          if (ticket.email) {
            await this.mailerService
              .sendMail({
                to: ticket.email,
                subject: `Thông báo huỷ vé và hoàn tiền - Mã vé ${ticket.id}`,
                template: 'refund-notification',
                context: {
                  ticketId: ticket.id,
                  passengerName: ticket.passenger_name,
                  tripInfo: ticket.trip ? `${ticket.trip.route?.name || ''}` : '',
                  companyName: ticket.company?.name || '',
                  refundAmount: ticket.money_paid || ticket.base_price || 0,
                },
                html: ticket.trip ? 
                  `<div>
                    <h2>Thông báo huỷ vé và hoàn tiền</h2>
                    <p>Kính gửi ${ticket.passenger_name},</p>
                    <p>Vé của bạn với mã <strong>${ticket.id}</strong> cho chuyến đi ${ticket.trip.route?.name || ''} đã được huỷ thành công.</p>
                    <p>Số tiền hoàn trả: <strong>${(ticket.money_paid || ticket.base_price || 0).toLocaleString('vi-VN')} VNĐ</strong> sẽ được xử lý trong thời gian sớm nhất.</p>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                    <p>Trân trọng,<br/>Dịch vụ khách hàng</p>
                  </div>` :
                  `<div>
                    <h2>Thông báo huỷ vé và hoàn tiền</h2>
                    <p>Kính gửi ${ticket.passenger_name},</p>
                    <p>Vé của bạn với mã <strong>${ticket.id}</strong> đã được huỷ thành công.</p>
                    <p>Số tiền hoàn trả: <strong>${(ticket.money_paid || ticket.base_price || 0).toLocaleString('vi-VN')} VNĐ</strong> sẽ được xử lý trong thời gian sớm nhất.</p>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                    <p>Trân trọng,<br/>Dịch vụ khách hàng</p>
                  </div>`,
              })
              .then(() => {
                console.log(`📧 Đã gửi email thông báo hoàn tiền đến: ${ticket.email}`);
              })
              .catch((error) => {
                console.error(`❌ Không thể gửi email thông báo hoàn tiền: ${error.message}`);
              });
          }
        } catch (error) {
          console.error(`❌ Lỗi khi tạo hồ sơ hoàn tiền: ${error.message}`);
        }
      }

      // Now update the ticket with saved interest ticket data if available, 
      // or just reset and change status if no interest ticket data
      if (savedInterestTicketData) {
        // Update with interest ticket data
        await this.updateTicketOnPlatform([{
          id: ticket.id,
          passenger_id: savedInterestTicketData.account_id,
          passenger_name: savedInterestTicketData.passenger_name,
          passenger_phone: savedInterestTicketData.passenger_phone,
          point_up: savedInterestTicketData.point_up,
          point_down: savedInterestTicketData.point_down,
          ticket_note: savedInterestTicketData.ticket_note,
          email: savedInterestTicketData.passenger_email,
          gender: savedInterestTicketData.gender,
          creator_by_id: savedInterestTicketData.account_id,
          status_booking_ticket: false
        }]);
        
        console.log('💾 Đã cập nhật thông tin vé với dữ liệu từ interest ticket và huỷ trạng thái vé');
      } else {
        // Reset ticket data
        ticket.status_booking_ticket = false;
        await this.ticketRepository.save(ticket);
        console.log('💾 Đang lưu vé đã reset vào DB...');
      }

      console.log('🎉 Huỷ vé và cập nhật thông tin thành công!');
    } catch (error) {
      console.error('❌ Error in abortTicketOnPlatform:', error);
      throw error;
    }
  }

  async updateTicketOnPlatform(
    data: DTO_RQ_UpdateTicketOnPlatform[],
  ): Promise<void> {
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
        ticket.payment_method = 1;
        ticket.creator_by_name = 'VinaHome';
        ticket.email = updateData.email;
        ticket.gender = updateData.gender;
        ticket.creator_by_id = updateData.creator_by_id;
        
        // Handle optional status_booking_ticket if provided
        if (updateData.status_booking_ticket !== undefined) {
          ticket.status_booking_ticket = updateData.status_booking_ticket;
        }
      }
    }

    console.log('💾 Đang lưu các vé đã cập nhật vào DB...');
    await this.ticketRepository.save(tickets);

    console.log('🎉 Cập nhật vé thành công!');
  }

  async updateTicketInfoOnBMS(data: any): Promise<void> {
    console.log('Booking Data:', data);
    return null;
  }

  // Tra cứu thông tin vé trên nền tảng
  async searchTicketOnPlatform(
    data: DTO_RQ_TicketSearch,
  ): Promise<DTO_RP_TicketSearch> {
    try {
      console.log('data:', data);
      const { phone, code } = data;

      if (!phone && !code) {
        throw new HttpException(
          'Vui lòng cung cấp số điện thoại hoặc mã vé',
          HttpStatus.BAD_REQUEST,
        );
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
        relations: ['trip', 'trip.route', 'trip.company', 'company'],
      });

      if (!ticket) {
        throw new HttpException(
          'Không tìm thấy thông tin vé',
          HttpStatus.NOT_FOUND,
        );
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
        company_id: ticket.company.id,
        trip_id: ticket.trip.id,
      };
      console.log('response:', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm vé:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi tìm kiếm vé',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTicketByPaymentService(
    data: DTO_RQ_TicketByPaymentService,
  ): Promise<any> {
    console.log('Payment Service send Data:', data);

    const ids = data.ticket.map((item) => item.id);
    const tickets = await this.ticketRepository.findBy({ id: In(ids) });

    if (tickets.length !== ids.length) {
      console.error('❌ Một hoặc nhiều vé không tồn tại trong DB!');
      throw new HttpException('Dữ liệu vé không tồn tại', HttpStatus.NOT_FOUND);
    }

    for (const ticket of tickets) {
      // Cập nhật thông tin chung cho mỗi vé
      ticket.passenger_name = data.passenger_name;
      ticket.passenger_phone = data.passenger_phone;
      ticket.point_up = data.point_up;
      ticket.point_down = data.point_down;
      ticket.ticket_note = data.ticket_note;
      ticket.payment_method = 1;
      ticket.creator_by_name = 'VinaHome';
      ticket.email = data.email;
      ticket.gender = data.gender;
      ticket.creator_by_id = data.creator_by_id;
      ticket.status_booking_ticket = true;
    }

    await this.ticketRepository.save(tickets);
  }

  async updatePaidTicketAmount(data: DTO_RQ_Ticket[]): Promise<Ticket[]> {
    console.log('updatePaidTicketAmount', data);
    const updatedTickets: Ticket[] = [];

    for (const ticketDto of data) {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketDto.id },
        relations: ['company', 'trip'],
      });

      if (!ticket) {
        console.warn(`⚠️ Ticket with ID ${ticketDto.id} not found.`);
        continue;
      }

      ticket.money_paid = ticketDto.price;

      try {
        const updatedTicket = await this.ticketRepository.save(ticket);
        updatedTickets.push(updatedTicket);
        console.log(
          `✅ Updated ticket ID ${ticket.id} with money_paid: ${ticket.money_paid}`,
        );
      } catch (error) {
        console.error(`❌ Failed to update ticket ID ${ticket.id}:`, error);
      }
    }

    console.log('Vé đã cập nhật: \n', updatedTickets);

    const { company, email, passenger_name, trip } = updatedTickets[0];

    await this.mailerService
      .sendMail({
        to: email || 'giaphu432@gmail.com',
        subject: `Thông tin hoá đơn từ VinaHome - Khách hàng ${passenger_name}`,
        template: 'invoice',
        context: {
          company,
          trip,
          tickets: updatedTickets,
          length: updatedTickets.length,
          totalPaid: updatedTickets.reduce(
            (total, ticket) => total + ticket.base_price,
            0,
          ),
        },
      })
      .catch((error) => {
        console.log('Gửi hoá đơn về mail không thành công: \n', error);
      });

    return updatedTickets;
  }

  async getTicketByAccountId(accountId: string): Promise<DTO_RP_TicketSearch[]> {
    console.log('Fetching tickets for account ID:', accountId);

    const tickets = await this.ticketRepository.find({
      where: { creator_by_id: accountId },
      relations: ['trip', 'trip.route', 'company'],
      order: { id: 'DESC' },
    });
    console.log('Fetched tickets:', tickets);
    return tickets.map((ticket) => ({
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
      company_id: ticket.company.id,
      trip_id: ticket.trip.id,
    }));
  }
}