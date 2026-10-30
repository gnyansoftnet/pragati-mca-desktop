
import { injectable } from "tsyringe";
import type { RowDataPacket } from "mysql2";
import { db } from "../../../core/config/database.config";
import { PaginationRequestDto } from "../../../utils/pagination.dto";
import { PaginatedMilkCollectionDto } from "../dtos/milk-collection.dto";

interface MilkCollectionRow extends RowDataPacket {
    id: number;
    trans_code: string;
    plant: string;
    user_code: string | null;
    root_code: string | null;
    vendor_code: string | null;
    can_type: string | null;
    weight_system: string | null;
    milk_type: string | null;
    milk_status: string | null;
    tiping_time: string;
    no_of_cans: number;
    gross_weight: number | string;
    net_weight: number | string;
    net_ltr: number | string;
    fat: number | string | null;
    snf: number | string | null;
    clr: number | string | null;
    is_analyse: number;
    created_at: Date | string | null;
    updated_at: Date | string | null;
    d_flag: number;
}

interface CountRow extends RowDataPacket {
    total: number;
}

@injectable()
export class MilkCollectionRepo {
    async getPaginatedMilkCollctions(
        data: PaginationRequestDto
    ): Promise<PaginatedMilkCollectionDto> {
        const page = Math.max(1, Number(data.page) || 1);
        const limit = Math.max(1, Number(data.limit) || 10);
        const offset = (page - 1) * limit;

        let where = "WHERE d_flag = 0";
        const whereParams: string[] = [];

        const term = data.search?.trim();

        if (term) {
            where += ` AND (
                trans_code LIKE ?
                OR user_code LIKE ?
                OR root_code LIKE ?
                OR vendor_code LIKE ?
            )`;

            const like = `%${term}%`;
            whereParams.push(like, like, like, like);
        }

        // Get total record count
        const [countRows] = await db.query<CountRow[]>(
            `SELECT COUNT(*) AS total
             FROM milk_collection_details
             ${where}`,
            whereParams
        );

        const total = Number(countRows[0].total);
        const totalPages = Math.ceil(total / limit);

        // Get paginated milk collection records
        const [rows] = await db.query<MilkCollectionRow[]>(
            `SELECT
                id,
                trans_code,
                plant,
                user_code,
                root_code,
                vendor_code,
                can_type,
                weight_system,
                milk_type,
                milk_status,
                tiping_time,
                no_of_cans,
                gross_weight,
                net_weight,
                net_ltr,
                fat,
                snf,
                clr,
                is_analyse,
                created_at,
                updated_at,
                d_flag
             FROM milk_collection_details
             ${where}
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [...whereParams, limit, offset]
        );

        return {
            data: rows.map((r) => ({
                id: r.id,
                transCode: r.trans_code,
                plant: r.plant,
                userCode: r.user_code ?? "",
                rootCode: r.root_code ?? "",
                vendorCode: r.vendor_code ?? "",
                canType: r.can_type ?? "",
                weightSystem: r.weight_system ?? "",
                milkType: r.milk_type ?? "",
                milkStatus: r.milk_status ?? "",
                tippingTime: r.tiping_time,
                noOfCans: r.no_of_cans,
                grossWeight: Number(r.gross_weight),
                netWeight: Number(r.net_weight),
                netLtr: Number(r.net_ltr),
                fat: r.fat === null ? 0 : Number(r.fat),
                snf: r.snf === null ? 0 : Number(r.snf),
                clr: r.clr === null ? 0 : Number(r.clr),
                isAnalyse: r.is_analyse,
                createdAt: r.created_at
                    ? String(r.created_at)
                    : "",
                updatedAt: r.updated_at
                    ? String(r.updated_at)
                    : "",
                dFlag: r.d_flag,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
}
