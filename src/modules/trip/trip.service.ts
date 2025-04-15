import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/company.entity';
import {
  Between,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  In,
  EntityManager,
} from 'typeorm';
import { Trip } from './trip.entity';
import { Schedule } from '../schedule/schedule.entity';
import { SeatMap } from '../seat/seat_map.entity';
import { Route } from '../route/route.entity';
import { PointOfRoute } from '../point/point_of_route.entity';
import { Point } from '../point/point.entity';
import { Province } from '../location/provinces.entity';
import { DTO_RP_ListTrip, DTO_RP_TripDetail, DTO_RP_TripPoint } from './trip.dto';
import { Ticket } from '../ticket/ticket.entity';
import { Seat } from '../seat/seat.entity';

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

  // async searchTripOnPlatform(data: any): Promise<any> {
  //   console.log('════════════════════════════════════════');
  //   console.log('BẮT ĐẦU TÌM KIẾM CHUYẾN ĐI');
  //   console.log('════════════════════════════════════════');

  //   // 1. Tìm điểm đón/trả theo tỉnh
  //   console.log('[1/4] Tìm điểm đón/trả theo tỉnh...');
  //   console.log(`- Tìm điểm đón thuộc tỉnh ID: ${data.departureId}`);
  //   console.log(`- Tìm điểm trả thuộc tỉnh ID: ${data.destinationId}`);

  //   const [departurePoints, destinationPoints] = await Promise.all([
  //     this.pointRepository.find({
  //       where: { provinces_id: data.departureId },
  //       relations: ['province'],
  //     }),
  //     this.pointRepository.find({
  //       where: { provinces_id: data.destinationId },
  //       relations: ['province'],
  //     }),
  //   ]);

  //   console.log('KẾT QUẢ TÌM ĐIỂM:');
  //   console.log(`- Tổng điểm đón: ${departurePoints.length}`);
  //   departurePoints.forEach((p) => {
  //     console.log(`  • ${p.name} (ID:${p.id}) - ${p.province.name}`);
  //   });

  //   console.log(`Tổng điểm trả: ${destinationPoints.length}`);
  //   destinationPoints.forEach((p) => {
  //     console.log(`  • ${p.name} (ID:${p.id}) - ${p.province.name}`);
  //   });

  //   if (departurePoints.length === 0 || destinationPoints.length === 0) {
  //     console.log('KHÔNG TÌM THẤY ĐIỂM ĐÓN/TRẢ PHÙ HỢP');
  //     return [];
  //   }

  //   // 2. Tìm các tuyến đường phù hợp
  //   console.log('[2/4] Tìm tuyến đường có điểm đón trước điểm trả...');
  //   console.log(
  //     '- Điểm đón có thể:',
  //     departurePoints.map((p) => p.id).join(', '),
  //   );
  //   console.log(
  //     '- Điểm trả có thể:',
  //     destinationPoints.map((p) => p.id).join(', '),
  //   );

  //   const routesQuery = this.routeRepository
  //     .createQueryBuilder('route')
  //     .innerJoin(
  //       'route.point_of_route',
  //       'departurePor',
  //       'departurePor.point_id IN (:...departurePointIds)',
  //       {
  //         departurePointIds: departurePoints.map((p) => p.id),
  //       },
  //     )
  //     .innerJoin(
  //       'route.point_of_route',
  //       'destinationPor',
  //       'destinationPor.point_id IN (:...destinationPointIds)',
  //       {
  //         destinationPointIds: destinationPoints.map((p) => p.id),
  //       },
  //     )
  //     .where('departurePor.display_order < destinationPor.display_order');

  //   if (data.companyId) {
  //     routesQuery.andWhere('route.company_id = :companyId', {
  //       companyId: data.companyId,
  //     });
  //     console.log(`- Lọc theo công ty ID: ${data.companyId}`);
  //   }

  //   const routes = await routesQuery.getMany();
  //   console.log('KẾT QUẢ TUYẾN ĐƯỜNG:');
  //   console.log(`- Tổng tuyến đường phù hợp: ${routes.length}`);
  //   routes.forEach((r) => {
  //     console.log(`  • ${r.name} (ID:${r.id}) - Công ty: ${r.company_id}`);
  //   });

  //   if (routes.length === 0) {
  //     console.log('❗ KHÔNG TÌM THẤY TUYẾN ĐƯỜNG PHÙ HỢP');
  //     return [];
  //   }

  //   // 3. Tìm chuyến đi trong ngày chỉ định và kiểm tra lịch trình
  //   console.log('[3/4] Tìm chuyến đi theo ngày và kiểm tra lịch trình...');
  //   console.log(`- Ngày khởi hành: ${data.departureDate}`);

  //   const departureDate = new Date(data.departureDate);
  //   const nextDay = new Date(departureDate);
  //   nextDay.setDate(nextDay.getDate() + 1);

  //   // Tìm chuyến đi hiện có
  //   let trips = await this.tripRepository
  //     .createQueryBuilder('trip')
  //     .leftJoinAndSelect('trip.route', 'route')
  //     .leftJoinAndSelect('trip.schedule', 'schedule')
  //     .leftJoinAndSelect('trip.company', 'company')
  //     .leftJoinAndSelect('trip.seat_map', 'seat_map')
  //     .where('trip.route_id IN (:...routeIds)', {
  //       routeIds: routes.map((r) => r.id),
  //     })
  //     .andWhere(
  //       'trip.date_departure >= :startDate AND trip.date_departure < :endDate',
  //       {
  //         startDate: departureDate,
  //         endDate: nextDay,
  //       },
  //     )
  //     .orderBy('trip.time_departure', 'ASC')
  //     .getMany();

  //   console.log('KẾT QUẢ CHUYẾN ĐI THÔNG TIN:');
  //   console.log(`- Tổng chuyến đi tìm thấy: ${trips.length}`);
  //   trips.forEach((t) => {
  //     console.log(`  • Chuyến ${t.id} - ${t.time_departure} - ${t.route.name}`);
  //   });

  //   // LUÔN kiểm tra lịch trình phù hợp, bất kể đã có trips hay chưa
  //   console.log('KIỂM TRA LỊCH TRÌNH PHÙ HỢP...');

  //   // Tìm lịch trình phù hợp (thuộc các route đã tìm thấy)
  //   const schedules = await this.scheduleRepository
  //     .createQueryBuilder('schedule')
  //     .leftJoinAndSelect('schedule.route', 'route')
  //     .leftJoinAndSelect('schedule.company', 'company')
  //     .leftJoinAndSelect('schedule.seat_map', 'seat_map')
  //     .where('schedule.route_id IN (:...routeIds)', {
  //       routeIds: routes.map((r) => r.id),
  //     })
  //     .andWhere(
  //       'schedule.start_date <= :departureDate AND (schedule.end_date IS NULL OR schedule.end_date >= :departureDate)',
  //       {
  //         departureDate: departureDate,
  //       },
  //     )
  //     .getMany();

  //   console.log(`ĐÃ TÌM THẤY ${schedules.length} LỊCH TRÌNH PHÙ HỢP:`);
  //   schedules.forEach((schedule, index) => {
  //     console.log(`[Lịch trình ${index + 1}]`);
  //     console.log(`- ID: ${schedule.id}`);
  //     console.log(
  //       `- Tuyến đường: ${schedule.route?.name || 'N/A'} (ID: ${schedule.route_id})`,
  //     );
  //     console.log(
  //       `- Công ty: ${schedule.company?.name || 'N/A'} (ID: ${schedule.company})`,
  //     );
  //     console.log(`- Thời gian bắt đầu: ${schedule.start_time}`);
  //     console.log(`- Ngày bắt đầu: ${schedule.start_date}`);
  //     console.log(`- Ngày kết thúc: ${schedule.end_date || 'Không có'}`);
  //     console.log(
  //       `- Sơ đồ ghế: ${schedule.seat_map?.name || 'N/A'} (ID: ${schedule.seat_map})`,
  //     );
  //     console.log('-----------------------------------');
  //   });

  //   // Nếu có lịch trình nhưng chưa có trip tương ứng, tạo trip mới
  //   if (schedules.length > 0) {
  //     // Lọc ra các schedule chưa có trip
  //     const schedulesWithoutTrips = schedules.filter(
  //       (schedule) => !trips.some((trip) => trip.schedule?.id === schedule.id),
  //     );

  //     if (schedulesWithoutTrips.length > 0) {
  //       console.log(
  //         `PHÁT HIỆN ${schedulesWithoutTrips.length} LỊCH TRÌNH CHƯA CÓ CHUYẾN ĐI, ĐANG TẠO MỚI...`,
  //       );

  //       const newTrips = schedulesWithoutTrips.map((schedule) => {
  //         return this.tripRepository.create({
  //           time_departure: schedule.start_time,
  //           date_departure: departureDate,
  //           route: schedule.route,
  //           schedule: schedule,
  //           company: schedule.company,
  //           seat_map: schedule.seat_map,
  //         });
  //       });

  //       const savedTrips = await this.tripRepository.save(newTrips);
  //       console.log(`ĐÃ TẠO THÀNH CÔNG ${savedTrips.length} CHUYẾN ĐI MỚI`);
  //       trips = [...trips, ...savedTrips].sort((a, b) =>
  //         a.time_departure.localeCompare(b.time_departure),
  //       );
  //     } else {
  //       console.log('TẤT CẢ LỊCH TRÌNH ĐÃ CÓ CHUYẾN ĐI TƯƠNG ỨNG');
  //     }
  //   } else {
  //     console.log('KHÔNG CÓ LỊCH TRÌNH PHÙ HỢP');
  //     if (trips.length === 0) {
  //       return [];
  //     }
  //   }

  //   // 4. Bổ sung thông tin điểm đón/trả cho tất cả chuyến đi
  //   console.log('[4/4] Bổ sung thông tin điểm đón/trả...');

  //   const enhancedTrips = await Promise.all(
  //     trips.map(async (trip) => {
  //       const [departurePoint, destinationPoint] = await Promise.all([
  //         this.pointOfRouteRepository.findOne({
  //           where: {
  //             route: { id: trip.route.id },
  //             point: { provinces_id: data.departureId },
  //           },
  //           relations: ['point', 'point.province'],
  //           order: { display_order: 'ASC' },
  //         }),
  //         this.pointOfRouteRepository.findOne({
  //           where: {
  //             route: { id: trip.route.id },
  //             point: { provinces_id: data.destinationId },
  //           },
  //           relations: ['point', 'point.province'],
  //           order: { display_order: 'DESC' },
  //         }),
  //       ]);

  //       if (departurePoint && destinationPoint) {
  //         console.log(
  //           `- Chuyến ${trip.id}: Đón tại ${departurePoint.point.name} (${departurePoint.time}), trả tại ${destinationPoint.point.name} (${destinationPoint.time})`,
  //         );

  //         return {
  //           ...trip,
  //           departureInfo: {
  //             pointId: departurePoint.point.id,
  //             pointName: departurePoint.point.name,
  //             address: departurePoint.point.address,
  //             province: departurePoint.point.province.name,
  //             time: departurePoint.time,
  //           },
  //           destinationInfo: {
  //             pointId: destinationPoint.point.id,
  //             pointName: destinationPoint.point.name,
  //             address: destinationPoint.point.address,
  //             province: destinationPoint.point.province.name,
  //             time: destinationPoint.time,
  //           },
  //         };
  //       } else {
  //         console.log(
  //           `- Chuyến ${trip.id}: Không tìm thấy đủ thông tin điểm đón/trả`,
  //         );
  //         return trip;
  //       }
  //     }),
  //   );

  //   console.log('\n════════════════════════════════════════');
  //   console.log('KẾT THÚC TÌM KIẾM');
  //   console.log(`- Tổng chuyến đi tìm thấy: ${enhancedTrips.length}`);
  //   console.log('════════════════════════════════════════');

  //   return enhancedTrips;
  // }

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
      .leftJoinAndSelect('seat_map.seats', 'seats')
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
      .leftJoinAndSelect('seat_map.seats', 'seats')
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

    // 4. Bổ sung thông tin điểm đón/trả và kiểm tra vé
    console.log('[4/4] Bổ sung thông tin điểm đón/trả và kiểm tra vé...');


    const enhancedTrips = await Promise.all(
      trips.map(async (trip) => {
        // Kiểm tra xem chuyến đi đã có vé chưa
        const existingTickets = await this.ticketRepository.find({
          where: { trip: { id: trip.id } },
        });

        // Chỉ tạo vé mới nếu chưa có vé nào và có thông tin seat_map
        if (existingTickets.length === 0 && trip.seat_map?.seats?.length > 0) {
          console.log(`Tạo tickets mới cho chuyến đi ${trip.id}...`);

          const basePrice = trip.route?.base_price || 0;
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
              status_booking_ticket: false,
            });
          });

          await this.ticketRepository.save(ticketsToCreate);
          trip.tickets = ticketsToCreate;
        } else {
          // Nếu đã có vé thì sử dụng vé hiện có
          trip.tickets = existingTickets;
          if (existingTickets.length > 0) {
            console.log(
              `Chuyến ${trip.id} đã có ${existingTickets.length} vé, không tạo mới`,
            );
          } else {
            console.log(`Chuyến ${trip.id} không có seat_map để tạo vé`);
          }
        }

        // Bổ sung thông tin điểm đón/trả
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

        const result: any = {
          id: trip.id,
          time_departure: trip.time_departure,
          date_departure: trip.date_departure,
          route: trip.route,
          company: trip.company,
          seat_map: trip.seat_map,
          tickets_available: trip.tickets?.filter(
            (ticket) => ticket.status_booking_ticket === false,
          ).length,
          // tickets:
          //   trip.tickets?.map((ticket) => ({
          //     id: ticket.id,
          //     seat_name: ticket.seat_name,
          //     seat_code: ticket.seat_code,
          //     seat_floor: ticket.seat_floor,
          //     seat_row: ticket.seat_row,
          //     seat_column: ticket.seat_column,
          //     seat_status: ticket.seat_status,
          //     base_price: ticket.base_price,
          //     status_booking_ticket: ticket.status_booking_ticket,
          //   })) || [],
        };

        if (departurePoint && destinationPoint) {
          console.log(
            `- Chuyến ${trip.id}: Đón tại ${departurePoint.point.name} (${departurePoint.time}), trả tại ${destinationPoint.point.name} (${destinationPoint.time})`,
          );

          result.departureInfo = {
            pointId: departurePoint.point.id,
            pointName: departurePoint.point.name,
            address: departurePoint.point.address,
            province: departurePoint.point.province.name,
            time: departurePoint.time,
          };
          result.destinationInfo = {
            pointId: destinationPoint.point.id,
            pointName: destinationPoint.point.name,
            address: destinationPoint.point.address,
            province: destinationPoint.point.province.name,
            time: destinationPoint.time,
          };
        } else {
          console.log(
            `- Chuyến ${trip.id}: Không tìm thấy đủ thông tin điểm đón/trả`,
          );
        }

        return result;
      }),
    );

    console.log('\n════════════════════════════════════════');
    console.log('KẾT THÚC TÌM KIẾM');
    console.log(`- Tổng chuyến đi tìm thấy: ${enhancedTrips.length}`);
    console.log('════════════════════════════════════════');

    return enhancedTrips;
  }

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

      if (
        !trip.seat_map ||
        !trip.seat_map.seats ||
        trip.seat_map.seats.length === 0
      ) {
        console.error(
          '[ERROR] Trip không có seat_map hoặc seat_map không có seats',
        );
        throw new Error('Trip không có seat_map hoặc không có seats');
      }

      console.log('[5] Đã xác định seat_map:', {
        seat_map_id: trip.seat_map.id,
        seat_map_name: trip.seat_map.name,
      });

      console.log(
        '[6] Đã xác định số lượng seats:',
        trip.seat_map.seats.length,
      );
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

      console.log(
        '[11] Đã cập nhật danh sách tickets mới:',
        trip.tickets.length,
      );
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
        status_booking_ticket: ticket.status_booking_ticket || false,
      })),
    };

    console.log('[13] Hoàn thành xử lý. Kết quả:', result);
    return result;
  }

  async getTripsByDateAndRoute(data: {
    date: string;
    company_id: number;
    route_id: number;
  }): Promise<DTO_RP_ListTrip[]> {
    console.log('1. Bắt đầu hàm getTripsByDateAndRoute');

    try {
      // 1. Validate input
      console.log('2. Kiểm tra dữ liệu đầu vào');
      const { date, company_id, route_id } = data;

      if (!date) {
        throw new HttpException('Thiếu ngày', HttpStatus.BAD_REQUEST);
      }
      if (!company_id) {
        throw new HttpException('Thiếu company_id', HttpStatus.BAD_REQUEST);
      }
      if (!route_id) {
        throw new HttpException('Thiếu route_id', HttpStatus.BAD_REQUEST);
      }

      // 2. Parse date
      console.log('3. Parse ngày');
      const searchDate = new Date(date);
      if (isNaN(searchDate.getTime())) {
        throw new HttpException('Ngày không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      // 3. Start transaction
      console.log('4. Bắt đầu transaction');
      return await this.tripRepository.manager.transaction(async (manager) => {
        const tripRepo = manager.getRepository(Trip);
        const scheduleRepo = manager.getRepository(Schedule);
        const ticketRepo = manager.getRepository(Ticket);

        // 4. Check company and route existence
        console.log('5. Kiểm tra tồn tại company và route');
        const [company, route] = await Promise.all([
          manager.getRepository(Company).findOneBy({ id: company_id }),
          manager.getRepository(Route).findOneBy({ id: route_id }),
        ]);

        if (!company) {
          throw new HttpException(
            'Công ty không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }
        if (!route) {
          throw new HttpException(
            'Tuyến đường không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }

        // 5. Find active schedules
        console.log('6. Tìm active schedules');
        const activeSchedules = await scheduleRepo.find({
          where: [
            {
              company: { id: company_id },
              route: { id: route_id },
              start_date: LessThanOrEqual(searchDate),
              end_date: IsNull(),
            },
            {
              company: { id: company_id },
              route: { id: route_id },
              start_date: LessThanOrEqual(searchDate),
              end_date: MoreThanOrEqual(searchDate),
            },
          ],
          relations: ['seat_map', 'seat_map.seats'],
        });

        console.log(`7. Tìm thấy ${activeSchedules.length} schedules`);

        // 6. Process each schedule
        const trips = [];
        for (const schedule of activeSchedules) {
          console.log(`8. Xử lý schedule ${schedule.id}`);

          let trip = await tripRepo.findOne({
            where: {
              schedule: { id: schedule.id },
              date_departure: Between(
                new Date(searchDate.setHours(0, 0, 0, 0)),
                new Date(searchDate.setHours(23, 59, 59, 999)),
              ),
            },
            relations: ['tickets'],
          });

          if (!trip) {
            console.log('9. Tạo trip mới');
            trip = await tripRepo.save(
              tripRepo.create({
                company: { id: company_id },
                schedule,
                route: { id: route_id },
                seat_map: schedule.seat_map,
                time_departure: schedule.start_time,
                date_departure: searchDate,
              }),
            );
          }

          if (
            schedule.seat_map?.seats?.length > 0 &&
            (!trip.tickets || trip.tickets.length === 0)
          ) {
            console.log(`10. Tạo ${schedule.seat_map.seats.length} tickets`);

            if (!trip.id) {
              throw new HttpException(
                'Trip chưa có ID',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }

            let route = schedule.route;
            if (!route) {
              route = await manager
                .getRepository(Route)
                .findOneBy({ id: schedule.route_id });
              if (!route) {
                throw new HttpException(
                  'Không tìm thấy thông tin tuyến đường',
                  HttpStatus.NOT_FOUND,
                );
              }
            }

            const basePrice = route?.base_price || 0;

            const tickets = schedule.seat_map.seats.map((seat) => {
              const ticket = new Ticket();
              ticket.seat_name = seat.name;
              ticket.seat_code = seat.code;
              ticket.seat_floor = seat.floor;
              ticket.seat_row = seat.row;
              ticket.seat_column = seat.column;
              ticket.seat_status = seat.status;
              ticket.base_price = basePrice;

              ticket.company = { id: company_id } as Company;
              ticket.trip = { id: trip.id } as Trip;

              return ticket;
            });
            await ticketRepo.save(tickets);
          }

          trips.push(trip);
        }

        // 7. Return full trip data
        console.log('11. Lấy thông tin đầy đủ các trips');
        const tripsData = await tripRepo.find({
          where: { id: In(trips.map((t) => t.id)) },
          relations: ['company', 'schedule', 'route', 'seat_map', 'tickets'],
          order: { time_departure: 'ASC' },
        });

        const result: DTO_RP_ListTrip[] = tripsData.map((trip) => ({
          id: trip.id,
          time_departure: trip.time_departure,
          date_departure: trip.date_departure,
          total_ticket: trip.tickets?.length || 0,
          total_ticket_booking:
            trip.tickets?.filter(
              (ticket) => ticket.status_booking_ticket === true,
            ).length || 0,
          seat_map: trip.seat_map
            ? {
                id: trip.seat_map.id,
                name: trip.seat_map.name,
              }
            : undefined,
          route: trip.route
            ? {
                id: trip.route.id,
                name: trip.route.name,
              }
            : undefined,
        }));

        console.log('12. Kết thúc hàm thành công');
        return result;
      });
    } catch (error) {
      console.error('Lỗi trong getTripsByDateAndRoute:', {
        error: error.message,
        stack: error.stack,
      });
      if (error instanceof HttpException) throw error;
      throw new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPointUpByTrip(tripId: number): Promise<DTO_RP_TripPoint[]> {
    console.log('Bắt đầu hàm getPointUpByTrip với tripId:', tripId);
  
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
        relations: ['route', 'route.point_of_route', 'route.point_of_route.point', 'schedule'],
      });
  
      if (!trip) {
        throw new HttpException('Chuyến đi không tồn tại', HttpStatus.NOT_FOUND);
      }
  
      const sortedPoints = trip.route.point_of_route
        .sort((a, b) => a.display_order - b.display_order)
        .map((por) => ({
          id: por.point.id,
          name: por.point.name,
          address: por.point.address,
          display_order: por.display_order,
          province_id: por.point.provinces_id,
          time_point: por.time,
          start_time: trip.schedule.start_time
        }));
      return sortedPoints;
    } catch (error) {
      console.error('Lỗi trong getPointUpByTrip:', error);
      throw new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPointDownByTrip(tripId: number): Promise<DTO_RP_TripPoint[]> {
    console.log('Bắt đầu hàm getPointDownByTrip với tripId:', tripId);
  
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
        relations: ['route', 'route.point_of_route', 'route.point_of_route.point', 'schedule'],
      });
  
      if (!trip) {
        throw new HttpException('Chuyến đi không tồn tại', HttpStatus.NOT_FOUND);
      }
  
      const sortedPoints = trip.route.point_of_route
        .sort((a, b) => b.display_order - a.display_order)
        .map((por) => ({
          id: por.point.id,
          name: por.point.name,
          address: por.point.address,
          display_order: por.display_order,
          province_id: por.point.provinces_id,
          time_point: por.time,
          start_time: trip.schedule.start_time
        }));
  
      return sortedPoints;
    } catch (error) {
      console.error('Lỗi trong getPointDownByTrip:', error);
      throw new HttpException('Lỗi hệ thống', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  


}
