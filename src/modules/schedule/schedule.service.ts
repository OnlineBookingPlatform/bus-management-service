import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Schedule } from './schedule.entity';
import { Company } from '../company/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DTO_RP_Schedule, DTO_RQ_Schedule } from './schedule.dto';
import { Route } from '../route/route.entity';
import { Repository } from 'typeorm';
import { SeatMap } from '../seat/seat_map.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(SeatMap)
    private readonly seatMapRepository: Repository<SeatMap>,
  ) {}

  async createSchedule(schedule: DTO_RQ_Schedule): Promise<DTO_RP_Schedule> {
    const existingCompany = await this.companyRepository.findOne({
      where: { id: schedule.company_id },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingRoute = await this.routeRepository.findOne({
      where: { id: schedule.route_id },
    });

    if (!existingRoute) {
      throw new HttpException(
        'Dữ liệu tuyến không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingSeatMap = await this.seatMapRepository.findOne({
      where: { id: schedule.seat_map_id },
    });
    if (!existingSeatMap) {
      throw new HttpException(
        'Dữ liệu sơ đồ ghế không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const newSchedule = this.scheduleRepository.create({
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      start_time: schedule.start_time,
      is_end_date_set: schedule.is_end_date_set,
      route: existingRoute,
      seat_map: existingSeatMap,
      company: existingCompany,
    });

    const savedSchedule = await this.scheduleRepository.save(newSchedule);

    return {
      id: savedSchedule.id,
      start_date: savedSchedule.start_date,
      end_date: savedSchedule.end_date,
      start_time: savedSchedule.start_time,
      is_end_date_set: savedSchedule.is_end_date_set,
      route_id: savedSchedule.route.id,
      route_name: savedSchedule.route.name,
      seat_map_id: savedSchedule.seat_map.id,
      seat_map_name: savedSchedule.seat_map.name,
      company_id: savedSchedule.company.id,
      created_at: savedSchedule.created_at.toISOString(),
    };
  }

  async getScheduleByCompany(id: number): Promise<DTO_RP_Schedule[]> {
    console.log('Received Company ID from client:', id);

    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    console.log('Company found:', existingCompany);

    if (!existingCompany) {
      console.error('Company not found!');
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const schedules = await this.scheduleRepository.find({
      where: { company: { id: id } },
      relations: ['route', 'seat_map', 'company'],
    });

    console.log('Schedules fetched for the company:', schedules);

    if (!schedules.length) {
      console.log('No schedules found for the company.');
      return [];
    }

    const mappedSchedules = schedules.map((schedule) => {
      console.log('Mapping schedule:', schedule);

      return {
        id: schedule.id,
        start_date: new Date(schedule.start_date),
        end_date: schedule.end_date ? new Date(schedule.end_date) : null,
        start_time: schedule.start_time,
        is_end_date_set: schedule.is_end_date_set,
        route_id: schedule.route ? schedule.route.id : null,
        route_name: schedule.route ? schedule.route.name : null,
        seat_map_id: schedule.seat_map ? schedule.seat_map.id : null,
        seat_map_name: schedule.seat_map ? schedule.seat_map.name : null,
        company_id: schedule.company ? schedule.company.id : null,
        created_at: schedule.created_at.toISOString(),
      };
    });

    console.log('Mapped schedules:', mappedSchedules);
    return mappedSchedules;
  }

  async deleteSchedule(id: number): Promise<void> {
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id: id },
    });

    if (!existingSchedule) {
      throw new HttpException(
        'Dữ liệu lịch trình không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.scheduleRepository.delete(id);
  }

  async updateSchedule(
    id: number,
    schedule: DTO_RQ_Schedule,
  ): Promise<DTO_RP_Schedule> {
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id: id },
    });

    if (!existingSchedule) {
      throw new HttpException(
        'Dữ liệu lịch trình không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingCompany = await this.companyRepository.findOne({
      where: { id: schedule.company_id },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingRoute = await this.routeRepository.findOne({
      where: { id: schedule.route_id },
    });

    if (!existingRoute) {
      throw new HttpException(
        'Dữ liệu tuyến không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingSeatMap = await this.seatMapRepository.findOne({
      where: { id: schedule.seat_map_id },
    });
    if (!existingSeatMap) {
      throw new HttpException(
        'Dữ liệu sơ đồ ghế không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    existingSchedule.start_date = schedule.start_date;
    existingSchedule.end_date = schedule.end_date;
    existingSchedule.start_time = schedule.start_time;
    existingSchedule.is_end_date_set = schedule.is_end_date_set;
    existingSchedule.route = existingRoute;
    existingSchedule.seat_map = existingSeatMap;
    existingSchedule.company = existingCompany;

    const updatedSchedule = await this.scheduleRepository.save(
      existingSchedule,
    );

    return {
      id: updatedSchedule.id,
      start_date: updatedSchedule.start_date,
      end_date: updatedSchedule.end_date,
      start_time: updatedSchedule.start_time,
      is_end_date_set: updatedSchedule.is_end_date_set,
      route_id: updatedSchedule.route.id,
      route_name: updatedSchedule.route.name,
      seat_map_id: updatedSchedule.seat_map.id,
      seat_map_name: updatedSchedule.seat_map.name,
      company_id: updatedSchedule.company.id,
      created_at: updatedSchedule.created_at.toISOString(),
    };
  }
}
