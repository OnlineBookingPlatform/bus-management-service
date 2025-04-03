import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/company.entity';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { Schedule } from '../schedule/schedule.entity';
import { SeatMap } from '../seat/seat_map.entity';
import { Route } from '../route/route.entity';
import { PointOfRoute } from '../point/point_of_route.entity';
import { Point } from '../point/point.entity';
import { Province } from '../location/provinces.entity';
import { DTO_RP_TripDetail } from './trip.dto';
import { Ticket } from '../ticket/ticket.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(SeatMap)
    private readonly seatMapRepository: Repository<SeatMap>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(PointOfRoute)
    private readonly pointOfRouteRepository: Repository<PointOfRoute>,
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(Province)
    private readonly locationRepository: Repository<Province>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async searchTripOnPlatform(data: any): Promise<any> {
    console.log('════════════════════════════════════════');
    console.log('BẮT ĐẦU TÌM KIẾM CHUYẾN ĐI');
    console.log('════════════════════════════════════════');

    // 1. Tìm điểm đón/trả theo tỉnh
    console.log('[1/4] Tìm điểm đón/trả theo tỉnh...');
    console.log(`- Tìm điểm đón thuộc tỉnh ID: ${data.departureId}`);
    console.log(`- Tìm điểm trả thuộc tỉnh ID: ${data.destinationId}`);

    const [departurePoints, destinationPoints] = await Promise.all([
      this.pointRepository.find({
        where: { provinces_id: data.departureId },
        relations: ['province'],
      }),
      this.pointRepository.find({
        where: { provinces_id: data.destinationId },
        relations: ['province'],
      }),
    ]);

    console.log('KẾT QUẢ TÌM ĐIỂM:');
    console.log(`- Tổng điểm đón: ${departurePoints.length}`);
    departurePoints.forEach((p) => {
      console.log(`  • ${p.name} (ID:${p.id}) - ${p.province.name}`);
    });

    console.log(`Tổng điểm trả: ${destinationPoints.length}`);
    destinationPoints.forEach((p) => {
      console.log(`  • ${p.name} (ID:${p.id}) - ${p.province.name}`);
    });

    if (departurePoints.length === 0 || destinationPoints.length === 0) {
      console.log('KHÔNG TÌM THẤY ĐIỂM ĐÓN/TRẢ PHÙ HỢP');
      return [];
    }

    // 2. Tìm các tuyến đường phù hợp
    console.log('[2/4] Tìm tuyến đường có điểm đón trước điểm trả...');
    console.log(
      '- Điểm đón có thể:',
      departurePoints.map((p) => p.id).join(', '),
    );
    console.log(
      '- Điểm trả có thể:',
      destinationPoints.map((p) => p.id).join(', '),
    );

    const routesQuery = this.routeRepository
      .createQueryBuilder('route')
      .innerJoin(
        'route.point_of_route',
        'departurePor',
        'departurePor.point_id IN (:...departurePointIds)',
        {
          departurePointIds: departurePoints.map((p) => p.id),
        },
      )
      .innerJoin(
        'route.point_of_route',
        'destinationPor',
        'destinationPor.point_id IN (:...destinationPointIds)',
        {
          destinationPointIds: destinationPoints.map((p) => p.id),
        },
      )
      .where('departurePor.display_order < destinationPor.display_order');

    if (data.companyId) {
      routesQuery.andWhere('route.company_id = :companyId', {
        companyId: data.companyId,
      });
      console.log(`- Lọc theo công ty ID: ${data.companyId}`);
    }

    const routes = await routesQuery.getMany();
    console.log('KẾT QUẢ TUYẾN ĐƯỜNG:');
    console.log(`- Tổng tuyến đường phù hợp: ${routes.length}`);
    routes.forEach((r) => {
      console.log(`  • ${r.name} (ID:${r.id}) - Công ty: ${r.company_id}`);
    });

    if (routes.length === 0) {
      console.log('❗ KHÔNG TÌM THẤY TUYẾN ĐƯỜNG PHÙ HỢP');
      return [];
    }

    // 3. Tìm chuyến đi trong ngày chỉ định và kiểm tra lịch trình
    console.log('[3/4] Tìm chuyến đi theo ngày và kiểm tra lịch trình...');
    console.log(`- Ngày khởi hành: ${data.departureDate}`);

    const departureDate = new Date(data.departureDate);
    const nextDay = new Date(departureDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Tìm chuyến đi hiện có
    let trips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.schedule', 'schedule')
      .leftJoinAndSelect('trip.company', 'company')
      .leftJoinAndSelect('trip.seat_map', 'seat_map')
      .where('trip.route_id IN (:...routeIds)', {
        routeIds: routes.map((r) => r.id),
      })
      .andWhere(
        'trip.date_departure >= :startDate AND trip.date_departure < :endDate',
        {
          startDate: departureDate,
          endDate: nextDay,
        },
      )
      .orderBy('trip.time_departure', 'ASC')
      .getMany();

    console.log('KẾT QUẢ CHUYẾN ĐI THÔNG TIN:');
    console.log(`- Tổng chuyến đi tìm thấy: ${trips.length}`);
    trips.forEach((t) => {
      console.log(`  • Chuyến ${t.id} - ${t.time_departure} - ${t.route.name}`);
    });

    // LUÔN kiểm tra lịch trình phù hợp, bất kể đã có trips hay chưa
    console.log('KIỂM TRA LỊCH TRÌNH PHÙ HỢP...');

    // Tìm lịch trình phù hợp (thuộc các route đã tìm thấy)
    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('schedule.company', 'company')
      .leftJoinAndSelect('schedule.seat_map', 'seat_map')
      .where('schedule.route_id IN (:...routeIds)', {
        routeIds: routes.map((r) => r.id),
      })
      .andWhere(
        'schedule.start_date <= :departureDate AND (schedule.end_date IS NULL OR schedule.end_date >= :departureDate)',
        {
          departureDate: departureDate,
        },
      )
      .getMany();

    console.log(`ĐÃ TÌM THẤY ${schedules.length} LỊCH TRÌNH PHÙ HỢP:`);
    schedules.forEach((schedule, index) => {
      console.log(`[Lịch trình ${index + 1}]`);
      console.log(`- ID: ${schedule.id}`);
      console.log(
        `- Tuyến đường: ${schedule.route?.name || 'N/A'} (ID: ${schedule.route_id})`,
      );
      console.log(
        `- Công ty: ${schedule.company?.name || 'N/A'} (ID: ${schedule.company})`,
      );
      console.log(`- Thời gian bắt đầu: ${schedule.start_time}`);
      console.log(`- Ngày bắt đầu: ${schedule.start_date}`);
      console.log(`- Ngày kết thúc: ${schedule.end_date || 'Không có'}`);
      console.log(
        `- Sơ đồ ghế: ${schedule.seat_map?.name || 'N/A'} (ID: ${schedule.seat_map})`,
      );
      console.log('-----------------------------------');
    });

    // Nếu có lịch trình nhưng chưa có trip tương ứng, tạo trip mới
    if (schedules.length > 0) {
      // Lọc ra các schedule chưa có trip
      const schedulesWithoutTrips = schedules.filter(
        (schedule) => !trips.some((trip) => trip.schedule?.id === schedule.id),
      );

      if (schedulesWithoutTrips.length > 0) {
        console.log(
          `PHÁT HIỆN ${schedulesWithoutTrips.length} LỊCH TRÌNH CHƯA CÓ CHUYẾN ĐI, ĐANG TẠO MỚI...`,
        );

        const newTrips = schedulesWithoutTrips.map((schedule) => {
          return this.tripRepository.create({
            time_departure: schedule.start_time,
            date_departure: departureDate,
            route: schedule.route,
            schedule: schedule,
            company: schedule.company,
            seat_map: schedule.seat_map,
          });
        });

        const savedTrips = await this.tripRepository.save(newTrips);
        console.log(`ĐÃ TẠO THÀNH CÔNG ${savedTrips.length} CHUYẾN ĐI MỚI`);
        trips = [...trips, ...savedTrips].sort((a, b) =>
          a.time_departure.localeCompare(b.time_departure),
        );
      } else {
        console.log('TẤT CẢ LỊCH TRÌNH ĐÃ CÓ CHUYẾN ĐI TƯƠNG ỨNG');
      }
    } else {
      console.log('KHÔNG CÓ LỊCH TRÌNH PHÙ HỢP');
      if (trips.length === 0) {
        return [];
      }
    }

    // 4. Bổ sung thông tin điểm đón/trả cho tất cả chuyến đi
    console.log('[4/4] Bổ sung thông tin điểm đón/trả...');

    const enhancedTrips = await Promise.all(
      trips.map(async (trip) => {
        const [departurePoint, destinationPoint] = await Promise.all([
          this.pointOfRouteRepository.findOne({
            where: {
              route: { id: trip.route.id },
              point: { provinces_id: data.departureId },
            },
            relations: ['point', 'point.province'],
            order: { display_order: 'ASC' },
          }),
          this.pointOfRouteRepository.findOne({
            where: {
              route: { id: trip.route.id },
              point: { provinces_id: data.destinationId },
            },
            relations: ['point', 'point.province'],
            order: { display_order: 'DESC' },
          }),
        ]);

        if (departurePoint && destinationPoint) {
          console.log(
            `- Chuyến ${trip.id}: Đón tại ${departurePoint.point.name} (${departurePoint.time}), trả tại ${destinationPoint.point.name} (${destinationPoint.time})`,
          );

          return {
            ...trip,
            departureInfo: {
              pointId: departurePoint.point.id,
              pointName: departurePoint.point.name,
              address: departurePoint.point.address,
              province: departurePoint.point.province.name,
              time: departurePoint.time,
            },
            destinationInfo: {
              pointId: destinationPoint.point.id,
              pointName: destinationPoint.point.name,
              address: destinationPoint.point.address,
              province: destinationPoint.point.province.name,
              time: destinationPoint.time,
            },
          };
        } else {
          console.log(
            `- Chuyến ${trip.id}: Không tìm thấy đủ thông tin điểm đón/trả`,
          );
          return trip;
        }
      }),
    );

    console.log('\n════════════════════════════════════════');
    console.log('KẾT THÚC TÌM KIẾM');
    console.log(`- Tổng chuyến đi tìm thấy: ${enhancedTrips.length}`);
    console.log('════════════════════════════════════════');

    return enhancedTrips;
  }

  // async searchTripOnPlatform(data: {
  //   departureId: number;
  //   destinationId: number;
  //   departureDate: string;
  // }): Promise<Trip[]> {
  //   console.log('Bắt đầu tìm kiếm chuyến đi với data:', data);

  //   // 1. Tìm các route hợp lệ
  //   console.log('Bước 1: Tìm route có điểm đi và điểm đến phù hợp...');
  //   const validRoutes = await this.findValidRoutes(data.departureId, data.destinationId);
  //   console.log('Tìm thấy routes:', validRoutes.map(r => ({id: r.id, name: r.name})));

  //   if (validRoutes.length === 0) {
  //     console.log('Không tìm thấy route nào phù hợp');
  //     return [];
  //   }

  //   const routeIds = validRoutes.map(route => route.id);
  //   const departureDate = new Date(data.departureDate);

  //   // 2. Tìm các trip đã tồn tại
  //   console.log('Bước 2: Tìm trip đã tồn tại...');
  //   const existingTrips = await this.findExistingTrips(routeIds, departureDate);
  //   console.log('Tìm thấy trips:', existingTrips.map(t => ({id: t.id, time: t.time_departure})));

  //   if (existingTrips.length > 0) {
  //     console.log('Trả về các trip đã tồn tại');
  //     return existingTrips;
  //   }

  //   // 3. Tạo trip mới từ schedule nếu chưa có
  //   console.log('Bước 3: Tạo trip mới từ schedule...');
  //   const newTrips = await this.generateTripsFromSchedules(routeIds, departureDate, data);
  //   console.log('Đã tạo trips mới:', newTrips.map(t => ({id: t.id, time: t.time_departure})));

  //   return newTrips;
  // }

  private async findValidRoutes(departureId: number, destinationId: number): Promise<Route[]> {
    console.log(`Tìm route có điểm đi ${departureId} trước điểm đến ${destinationId}...`);

    const routes = await this.routeRepository
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.point_of_route', 'departurePoint', 'departurePoint.point_id = :departureId', { departureId })
      .innerJoinAndSelect('route.point_of_route', 'destinationPoint', 'destinationPoint.point_id = :destinationId', { destinationId })
      .where('departurePoint.display_order < destinationPoint.display_order')
      .getMany();

    console.log(`Tìm thấy ${routes.length} routes phù hợp`);
    return routes;
  }

  private async findExistingTrips(routeIds: number[], date: Date): Promise<Trip[]> {
    console.log(`Tìm trip đã tồn tại cho ${routeIds.length} routes vào ngày ${date.toISOString()}...`);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.schedule', 'schedule')
      .leftJoinAndSelect('trip.company', 'company')
      .leftJoinAndSelect('trip.seat_map', 'seat_map')
      .where('trip.route_id IN (:...routeIds)', { routeIds })
      .andWhere('trip.date_departure >= :startDate AND trip.date_departure < :endDate', {
        startDate: date,
        endDate: nextDay,
      })
      .orderBy('trip.time_departure', 'ASC')
      .getMany();

    console.log(`Tìm thấy ${trips.length} trips đã tồn tại`);
    return trips;
  }

  // private async generateTripsFromSchedules(
  //   routeIds: number[],
  //   date: Date,
  //   searchData: { departureId: number, destinationId: number }
  // ): Promise<Trip[]> {
  //   console.log('Bắt đầu tạo trip từ schedule...');

  //   // 1. Tìm các schedule hợp lệ
  //   const dayOfWeek = date.getDay();
  //   const formattedDate = format(date, 'yyyy-MM-dd');
  //   console.log(`Tìm schedule cho ngày ${formattedDate} (thứ ${dayOfWeek + 1})`);

  //   const validSchedules = await this.scheduleRepository
  //     .createQueryBuilder('schedule')
  //     .leftJoinAndSelect('schedule.route', 'route')
  //     .leftJoinAndSelect('schedule.seat_map', 'seat_map')
  //     .leftJoinAndSelect('schedule.company', 'company')
  //     .where('schedule.route_id IN (:...routeIds)', { routeIds })
  //     .andWhere('schedule.start_date <= :date AND (schedule.end_date IS NULL OR schedule.end_date >= :date)', { date: formattedDate })
  //     .andWhere(`EXTRACT(DOW FROM schedule.start_date) = :dayOfWeek OR schedule.is_recurring = true`, { dayOfWeek })
  //     .getMany();

  //   console.log(`Tìm thấy ${validSchedules.length} schedules phù hợp`);

  //   if (validSchedules.length === 0) {
  //     console.log('Không có schedule nào phù hợp để tạo trip');
  //     return [];
  //   }

  //   // 2. Tạo trip từ các schedule
  //   const newTrips: Trip[] = [];

  //   for (const schedule of validSchedules) {
  //     console.log(`Xử lý schedule ${schedule.id}...`);

  //     // Kiểm tra trip đã tồn tại chưa
  //     const existingTrip = await this.tripRepository.findOne({
  //       where: {
  //         schedule: { id: schedule.id },
  //         date_departure: date,
  //       },
  //     });

  //     if (existingTrip) {
  //       console.log(`Đã tồn tại trip ${existingTrip.id} từ schedule này`);
  //       continue;
  //     }

  //     // Lấy thông tin điểm đón/trả
  //     console.log(`Lấy thông tin điểm đón/trả cho route ${schedule.route.id}...`);
  //     const [departurePoint, destinationPoint] = await Promise.all([
  //       this.pointOfRouteRepository.findOne({
  //         where: {
  //           route: { id: schedule.route.id },
  //           point: { id: searchData.departureId },
  //         },
  //       }),
  //       this.pointOfRouteRepository.findOne({
  //         where: {
  //           route: { id: schedule.route.id },
  //           point: { id: searchData.destinationId },
  //         },
  //       }),
  //     ]);

  //     if (!departurePoint || !destinationPoint) {
  //       console.log('Không tìm thấy thông tin điểm đón/trả');
  //       continue;
  //     }

  //     // Tạo trip mới
  //     console.log(`Tạo trip mới từ schedule ${schedule.id}...`);
  //     const newTrip = this.tripRepository.create({
  //       schedule,
  //       route: schedule.route,
  //       company: schedule.company,
  //       seat_map: schedule.seat_map,
  //       time_departure: departurePoint.time,
  //       estimated_arrival_time: destinationPoint.time,
  //       date_departure: date,
  //     });

  //     const savedTrip = await this.tripRepository.save(newTrip);
  //     console.log(`Đã tạo trip ${savedTrip.id} thành công`);
  //     newTrips.push(savedTrip);
  //   }

  //   console.log(`Đã tạo tổng cộng ${newTrips.length} trips mới`);
  //   return newTrips.sort((a, b) => a.time_departure.localeCompare(b.time_departure));
  // }

  async getTripDetailOnPlatform(id: number): Promise<DTO_RP_TripDetail> {
    console.log('[1] Bắt đầu lấy thông tin chuyến đi với ID:', id);
  
    // 1. Lấy thông tin trip từ database
    console.log('[2] Truy vấn thông tin trip từ database...');
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['seat_map', 'seat_map.seats', 'tickets', 'route', 'company'],
    });
  
    if (!trip) {
      console.error('[ERROR] Không tìm thấy trip với ID:', id);
      throw new NotFoundException(`Trip với ID ${id} không tồn tại`);
    }
  
    console.log('[3] Đã tìm thấy trip:', {
      id: trip.id,
      seat_map_id: trip.seat_map?.id,
      ticket_count: trip.tickets?.length,
    });
  
    // 2. Kiểm tra nếu chưa có tickets
    if (!trip.tickets || trip.tickets.length === 0) {
      console.log('[4] Trip chưa có tickets, bắt đầu quy trình tạo mới');
  
      if (!trip.seat_map || !trip.seat_map.seats || trip.seat_map.seats.length === 0) {
        console.error('[ERROR] Trip không có seat_map hoặc seat_map không có seats');
        throw new Error('Trip không có seat_map hoặc không có seats');
      }
  
      console.log('[5] Đã xác định seat_map:', {
        seat_map_id: trip.seat_map.id,
        seat_map_name: trip.seat_map.name,
      });
  
      console.log('[6] Đã xác định số lượng seats:', trip.seat_map.seats.length);
      const basePrice = trip.route.base_price || 0;
      console.log('[6-1] Đã xác định giá vé cơ bản:', basePrice);
      // 3. Tạo tickets từ seats
      console.log('[7] Bắt đầu tạo tickets từ seats...');
      const ticketsToCreate = trip.seat_map.seats.map((seat) => {
        return this.ticketRepository.create({
          seat_name: seat.name,
          seat_code: seat.code,
          seat_floor: seat.floor,
          seat_row: seat.row,
          seat_column: seat.column,
          seat_status: seat.status,
          base_price: basePrice,
          trip: trip,
          company: trip.company,
        });
      });
  
      // 4. Lưu tickets vào database
      console.log('[8] Bắt đầu lưu tickets vào database...');
      try {
        await this.ticketRepository.save(ticketsToCreate);
        console.log('[9] Đã lưu thành công', ticketsToCreate.length, 'tickets');
      } catch (error) {
        console.error('[ERROR] Lỗi khi lưu tickets:', error);
        throw new Error('Không thể tạo tickets');
      }
  
      // 5. Cập nhật lại danh sách tickets
      console.log('[10] Truy vấn lại danh sách tickets...');
      trip.tickets = await this.ticketRepository.find({
        where: { trip: { id } },
      });
  
      console.log('[11] Đã cập nhật danh sách tickets mới:', trip.tickets.length);
    } else {
      console.log('[4] Trip đã có sẵn tickets, số lượng:', trip.tickets.length);
    }
  
    // 6. Chuẩn bị dữ liệu response theo DTO
    console.log('[12] Chuẩn bị dữ liệu response...');
    const result: DTO_RP_TripDetail = {
      id: trip.id,
      seat_map_id: trip.seat_map?.id || 0,
      total_floor: trip.seat_map?.total_floor || 0,
      total_row: trip.seat_map?.total_row || 0,
      total_column: trip.seat_map?.total_column || 0,
      tickets: trip.tickets.map((ticket) => ({
        id: ticket.id,
        seat_name: ticket.seat_name || undefined,
        seat_code: ticket.seat_code,
        seat_floor: ticket.seat_floor,
        seat_row: ticket.seat_row,
        seat_column: ticket.seat_column,
        seat_status: ticket.seat_status,
        base_price: ticket.base_price || 0,
      })),
    };
  
    console.log('[13] Hoàn thành xử lý. Kết quả:', result);
    return result;
  }
}
