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
}