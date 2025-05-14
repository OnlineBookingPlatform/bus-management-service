import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Evaluate } from "./evaluate.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DTO_RP_Evaluate, DTO_RQ_Evaluate } from "./evaluate.dto";
import { Company } from "../company/company.entity";
import { Trip } from "../trip/trip.entity";

@Injectable()
export class EvaluateService {
    constructor(
        @InjectRepository(Evaluate)
        private readonly evaluateRepository: Repository<Evaluate>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
    ) { }

    async createEvaluate(data: DTO_RQ_Evaluate): Promise<DTO_RP_Evaluate> {
        try {
            console.log("Received Data Evaluate from client: ", data);

            const existingCompany = await this.companyRepository.findOne({
                where: { id: data.company_id },
            });
            if (!existingCompany) {
                throw new HttpException(
                    'Dữ liệu công ty không tồn tại!',
                    HttpStatus.NOT_FOUND,
                );
            }

            const existingTrip = await this.tripRepository.findOne({
                where: { id: data.trip_id },
            });
            if (!existingTrip) {
                throw new HttpException(
                    'Dữ liệu chuyến đi không tồn tại!',
                    HttpStatus.NOT_FOUND,
                );
            }

            const newEvaluate = this.evaluateRepository.create({
                ...data,
                company: existingCompany,
                trip: existingTrip,
            });

            const savedEvaluate = await this.evaluateRepository.save(newEvaluate);
            console.log("Saved Evaluate: ", savedEvaluate);

            const fullEvaluate = await this.evaluateRepository.findOne({
                where: { id: savedEvaluate.id },
                relations: [ 'company', 'trip' ],
            });

            if (!fullEvaluate) {
                throw new HttpException(
                    'Đã xảy ra lỗi khi tải dữ liệu đánh giá!',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                id: fullEvaluate.id,
                created_at: fullEvaluate.created_at.toString(),
                desc: fullEvaluate.desc,
                rating: fullEvaluate.rating,
                company_id: fullEvaluate.company.id,
                trip_id: fullEvaluate.trip.id,
                ticket_id: fullEvaluate.ticket_id,
                account_id: fullEvaluate.account_id,
                account_name: fullEvaluate.account_name,
                ticket_phone: fullEvaluate.ticket_phone,
                account_email: fullEvaluate.account_email,
                account_avatar: fullEvaluate.account_avatar,
            };
        } catch (error) {
            console.error("Error while creating evaluation:", error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Đã xảy ra lỗi khi tạo đánh giá!',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getEvaluatesByTripId(tripId: number): Promise<DTO_RP_Evaluate[]> {
        try {
            console.log(`Getting evaluations for trip ID: ${tripId}`);
            
            // Verify trip exists
            const existingTrip = await this.tripRepository.findOne({
                where: { id: tripId },
            });
            
            if (!existingTrip) {
                throw new HttpException(
                    'Chuyến đi không tồn tại!',
                    HttpStatus.NOT_FOUND,
                );
            }
            
            // Get all evaluations for this trip
            const evaluates = await this.evaluateRepository.find({
                where: { trip: { id: tripId } },
                relations: ['company', 'trip'],
                order: { created_at: 'DESC' },
            });
            
            // Map to response DTO
            return evaluates.map(evaluate => ({
                id: evaluate.id,
                created_at: evaluate.created_at.toString(),
                desc: evaluate.desc,
                rating: evaluate.rating,
                company_id: evaluate.company.id,
                trip_id: evaluate.trip.id,
                ticket_id: evaluate.ticket_id,
                account_id: evaluate.account_id,
                account_name: evaluate.account_name,
                ticket_phone: evaluate.ticket_phone,
                account_email: evaluate.account_email,
                account_avatar: evaluate.account_avatar,
            }));
        } catch (error) {
            console.error("Error while fetching evaluations:", error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Đã xảy ra lỗi khi tải danh sách đánh giá!',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getAverageEvaluateByTripId(tripId: number): Promise<{ tripId: number, averageRating: number, totalReviews: number }> {
        try {
            console.log(`Getting average rating for trip ID: ${tripId}`);
            
            // Verify trip exists
            const existingTrip = await this.tripRepository.findOne({
                where: { id: tripId },
            });
            
            if (!existingTrip) {
                throw new HttpException(
                    'Chuyến đi không tồn tại!',
                    HttpStatus.NOT_FOUND,
                );
            }
            
            // Get all evaluations for this trip
            const evaluates = await this.evaluateRepository.find({
                where: { trip: { id: tripId } },
                select: ['rating'],
            });
            
            if (evaluates.length === 0) {
                return {
                    tripId,
                    averageRating: 0,
                    totalReviews: 0
                };
            }
            
            // Calculate average rating
            const totalRating = evaluates.reduce((sum, evaluate) => sum + evaluate.rating, 0);
            const averageRating = totalRating / evaluates.length;
            
            return {
                tripId,
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews: evaluates.length
            };
        } catch (error) {
            console.error("Error while calculating average rating:", error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Đã xảy ra lỗi khi tính điểm đánh giá trung bình!',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}