import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DTO_RP_SeatMap,
  DTO_RP_SeatMapName,
  DTO_RQ_Seat,
  DTO_RQ_SeatMap,
} from './seat.dto';
import { SeatMap } from './seat_map.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/company.entity';
import { Seat } from './seat.entity';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(SeatMap)
    private readonly seatMapRepository: Repository<SeatMap>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createSeatMap(data: DTO_RQ_SeatMap): Promise<DTO_RP_SeatMap> {
    try {
      console.log('Received Data Seat from client: ', data);
      const existingCompany = await this.companyRepository.findOne({
        where: { id: data.company_id },
      });
      if (!existingCompany) {
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newSeatMap = this.seatMapRepository.create({
        name: data.name,
        company: existingCompany,
        total_floor: data.total_floor,
        total_column: data.total_column,
        total_row: data.total_row,
      });

      const savedSeatMap = await this.seatMapRepository.save(newSeatMap);
      console.log('Created seat map:', savedSeatMap);

      const seats = data.seats.map((seat) => ({
        ...seat,
        seat_map: savedSeatMap, // Gán seatMapId cho từng seat
      }));

      const savedSeats = await this.seatRepository.save(seats);
      console.log('✅ Seats saved successfully:', savedSeats);

      return {
        id: savedSeatMap.id,
        name: savedSeatMap.name,
        total_floor: savedSeatMap.total_floor,
        total_column: savedSeatMap.total_column,
        total_row: savedSeatMap.total_row,
        seats: savedSeats.map((seat) => ({
          id: seat.id,
          floor: seat.floor,
          row: seat.row,
          column: seat.column,
          code: seat.code,
          status: seat.status,
          name: seat.name,
        })),
      };
    } catch (error) {
      console.error('❌ [ERROR] Error creating seat map:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi tạo sơ đồ ghế!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSeatMapByCompanyId(id: number): Promise<DTO_RP_SeatMap[]> {
    try {
      console.log('🔍 [STEP 1] Nhận ID công ty từ request:', id);

      // Kiểm tra xem công ty có tồn tại không
      const existingCompany = await this.companyRepository.findOne({
        where: { id: id },
      });

      if (!existingCompany) {
        console.error('❌ [ERROR] Công ty không tồn tại với ID:', id);
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('✅ [STEP 2] Công ty tồn tại:', existingCompany);

      // Truy vấn sơ đồ ghế dựa trên ID công ty
      const seatMaps = await this.seatMapRepository.find({
        where: { company: { id: id } },
        relations: ['seats'],
      });

      console.log('✅ [STEP 3] Số sơ đồ ghế tìm thấy:', seatMaps.length);

      if (seatMaps.length === 0) {
        console.warn(
          '⚠️ [WARNING] Không tìm thấy sơ đồ ghế nào cho công ty ID:',
          id,
        );
      }

      // Ghi log từng sơ đồ ghế và danh sách ghế của nó
      seatMaps.forEach((seatMap, index) => {
        console.log(
          `📌 [STEP 4.${index + 1}] SeatMap ID: ${seatMap.id}, Name: ${seatMap.name}`,
        );
        console.log(
          `   🔹 Tổng số tầng: ${seatMap.total_floor}, Cột: ${seatMap.total_column}, Hàng: ${seatMap.total_row}`,
        );
        console.log(`   🔹 Số ghế: ${seatMap.seats.length}`);

        seatMap.seats.forEach((seat, seatIndex) => {
          console.log(
            `      🔸 Ghế ${seatIndex + 1}: ID=${seat.id}, Code=${seat.code}, Tầng=${seat.floor}, Hàng=${seat.row}, Cột=${seat.column}, Tình trạng=${seat.status}`,
          );
        });
      });

      // Trả về danh sách sơ đồ ghế được định dạng
      return seatMaps.map((seatMap) => ({
        id: seatMap.id,
        name: seatMap.name,
        total_floor: seatMap.total_floor,
        total_column: seatMap.total_column,
        total_row: seatMap.total_row,
        seats: seatMap.seats.map((seat) => ({
          id: seat.id,
          floor: seat.floor,
          row: seat.row,
          column: seat.column,
          code: seat.code,
          status: seat.status,
          name: seat.name,
        })),
      }));
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi lấy sơ đồ ghế:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi lấy sơ đồ ghế!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSeatMap(id: number): Promise<void> {
    try {
      console.log('🔍 [STEP 1] Nhận ID sơ đồ ghế từ request:', id);

      // Tìm sơ đồ ghế theo ID
      const seatMap = await this.seatMapRepository.findOne({
        where: { id: id },
      });

      if (!seatMap) {
        console.error('❌ [ERROR] Không tìm thấy sơ đồ ghế với ID:', id);
        throw new HttpException(
          'Dữ liệu sơ đồ ghế không tồn tại!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Xóa sơ đồ ghế và các ghế liên quan
      await this.seatRepository.delete({ seat_map: seatMap });
      await this.seatMapRepository.delete({ id: id });

      console.log('✅ [STEP 2] Sơ đồ ghế đã được xóa thành công với ID:', id);
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi xóa sơ đồ ghế:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi xóa sơ đồ ghế!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSeatMap(data: {
    id: number;
    data: DTO_RQ_SeatMap;
  }): Promise<DTO_RP_SeatMap> {
    try {
      console.log('🔍 [STEP 1] Nhận ID sơ đồ ghế từ request:', data.id);

      // 1.
      const seatMap = await this.seatMapRepository.findOne({
        where: { id: data.id },
        relations: ['seats'],
      });

      if (!seatMap) {
        throw new HttpException(
          'Dữ liệu sơ đồ ghế không tồn tại!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Validate
      if (
        data.data.total_row <= 0 ||
        data.data.total_column <= 0 ||
        data.data.total_floor <= 0
      ) {
        throw new HttpException(
          'Số tầng, hàng và cột phải lớn hơn 0!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Lưu giá trị ban đầu để so sánh
      const originalConfig = {
        rows: seatMap.total_row,
        columns: seatMap.total_column,
        floors: seatMap.total_floor,
      };

      // 4. Cập nhật thông seat map
      seatMap.name = data.data.name?.trim() || seatMap.name;
      seatMap.total_floor = data.data.total_floor ?? seatMap.total_floor;
      seatMap.total_column = data.data.total_column ?? seatMap.total_column;
      seatMap.total_row = data.data.total_row ?? seatMap.total_row;

      const updatedSeatMap = await this.seatMapRepository.save(seatMap);
      console.log('✅ [STEP 2] Sơ đồ ghế cơ bản đã được cập nhật');

      // 5. Xử lý logic thêm/xóa ghế khi data từ fe thay đổi
      if (
        updatedSeatMap.total_row !== originalConfig.rows ||
        updatedSeatMap.total_column !== originalConfig.columns ||
        updatedSeatMap.total_floor !== originalConfig.floors
      ) {
        console.log('🔄 [STEP 3] Cấu hình thay đổi, xử lý lại ghế ngồi');

        // Lấy danh sách ghế hiện tại từ database
        const currentSeats = await this.seatRepository.find({
          where: { seat_map: { id: updatedSeatMap.id } },
        });

        // Tạo map kiểm tra nhanh ghế tồn tại
        const existingSeatMap = new Map<string, Seat>();
        currentSeats.forEach((seat) => {
          const key = this.getSeatPositionKey(seat);
          existingSeatMap.set(key, seat);
        });

        const requestSeatsMap = new Map<string, DTO_RQ_Seat>();
        if (data.data.seats) {
          data.data.seats.forEach((seat) => {
            const key = this.getSeatPositionKey(seat);
            requestSeatsMap.set(key, seat);
          });
        }

        // Tạo danh sách ghế cần có theo cấu hình mới
        const seatsToKeep: Seat[] = [];
        const seatsToCreate: Partial<Seat>[] = [];

        for (let floor = 1; floor <= updatedSeatMap.total_floor; floor++) {
          for (let row = 1; row <= updatedSeatMap.total_row; row++) {
            for (let col = 1; col <= updatedSeatMap.total_column; col++) {
              const positionKey = this.getSeatPositionKey({
                floor,
                row,
                column: col,
              });
              const existingSeat = existingSeatMap.get(positionKey);
              const requestSeat = requestSeatsMap.get(positionKey);
              if (existingSeat) {
                seatsToKeep.push(existingSeat);
              } else {
                seatsToCreate.push({
                  floor,
                  row,
                  column: col,
                  code: this.generateSeatCode(floor, row, col),
                  status: requestSeat?.status ?? true,
                  name: requestSeat?.name || '',
                  seat_map: {
                    id: updatedSeatMap.id,
                    created_at: undefined,
                    name: '',
                    total_floor: 0,
                    total_row: 0,
                    total_column: 0,
                    company_id: 0,
                    company: new Company(),
                    seats: [],
                    schedules: [],
                  },
                });
              }
            }
          }
        }

        // Xác định ghế cần xóa (có trong DB nhưng không cần nữa)
        const seatsToDelete = currentSeats.filter(
          (seat) => !seatsToKeep.some((s) => s.id === seat.id),
        );

        await this.seatRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Xóa ghế thừa
            if (seatsToDelete.length > 0) {
              await transactionalEntityManager.remove(Seat, seatsToDelete);
              console.log(`🗑️ Đã xóa ${seatsToDelete.length} ghế thừa`);
            }

            // Thêm ghế mới
            if (seatsToCreate.length > 0) {
              const newSeatEntities = seatsToCreate.map((seatData) =>
                this.seatRepository.create(seatData),
              );
              await transactionalEntityManager.save(Seat, newSeatEntities);
              console.log(`➕ Đã thêm ${seatsToCreate.length} ghế mới`);
            }
          },
        );
      }

      // 6. Cập nhật thông tin ghế từ fe lên
      if (data.data.seats?.length > 0) {
        console.log('🔄 [STEP 4] Cập nhật thông tin ghế từ request');

        const updatePromises = data.data.seats.map((seatData) => {
          return this.seatRepository.update(
            { id: seatData.id, seat_map: { id: updatedSeatMap.id } },
            {
              name: seatData.name,
              status: seatData.status,
            },
          );
        });

        await Promise.all(updatePromises);
      }

      // 7. Lấy lại dữ liệu mới nhất từ DB
      const finalSeats = await this.seatRepository.find({
        where: { seat_map: { id: updatedSeatMap.id } },
        order: { floor: 'ASC', row: 'ASC', column: 'ASC' },
      });

      // 8. Trả về kết quả
      return {
        id: updatedSeatMap.id,
        name: updatedSeatMap.name,
        total_floor: updatedSeatMap.total_floor,
        total_column: updatedSeatMap.total_column,
        total_row: updatedSeatMap.total_row,
        seats: finalSeats.map((seat) => ({
          id: seat.id,
          floor: seat.floor,
          row: seat.row,
          column: seat.column,
          code: seat.code,
          status: seat.status,
          name: seat.name,
        })),
      };
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi cập nhật sơ đồ ghế:', error);
      throw new HttpException(
        error.message || 'Đã xảy ra lỗi khi cập nhật sơ đồ ghế!',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getSeatPositionKey(seat: {
    floor: number;
    row: number;
    column: number;
  }): string {
    return `${seat.floor}-${seat.row}-${seat.column}`;
  }

  private generateSeatCode(floor: number, row: number, column: number): string {
    return `T${floor}-H${row}-C${column}`;
  }

  async getSeatMapNameByCompanyId(id: number): Promise<DTO_RP_SeatMapName[]> {
    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });
    if (!existingCompany) {
      console.error('❌ [ERROR] Công ty không tồn tại với ID:', id);
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const seatMap = await this.seatMapRepository.find({
      where: { company_id: id },
    });
    if (!seatMap || seatMap.length === 0) {
      return [];
    }
    const mappedSeatMapName = seatMap.map((seatmap) => {
      return {
        id: seatmap.id,
        name: seatmap.name,
      };
    });

    return mappedSeatMapName;
  }
}
