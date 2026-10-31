
import { injectable } from "tsyringe";
import type { RowDataPacket } from "mysql2";
import { db } from "../../../core/config/database.config";
import { PaginationRequestDto } from "../../../utils/pagination.dto";
import { MilkCollectionDto, PaginatedMilkCollectionDto } from "../dtos/milk-collection.dto";
import { SaveMilkCollectionDto } from "../dtos/milk-collection-save.dt";

interface MilkCollectionRow extends RowDataPacket {
    id: number;
    trans_code: string;
    plant: string;
    user_code: string ;
    root_code: string ;
    vendor_code: string;
    shift: number;
    sample_date:  string;
    sample_code: number;
    can_type: string;
    weight_system: string;
    milk_type: string;
    milk_status: string;
    tiping_time: string;
    no_of_cans: number;
    gross_weight: number;
    net_weight: number;
    net_ltr: number;
    fat: number ;
    snf: number;
    clr: number;
    is_analyse: number;
    entry: string;
    sync_status: string;
    sync_date: string;
    created_at: string;
    updated_at: string;
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
               *
             FROM milk_collection_details
             ${where}
             ORDER BY id ASC
             LIMIT ? OFFSET ?`,
            [...whereParams, limit, offset]
        );

        return {
            data: rows.map((r) => ({
                id: r.id,
                transCode: r.trans_code,
                plant: r.plant,
                userCode: r.user_code,
                rootCode: r.root_code,
                vendorCode: r.vendor_code,
                shift: r.shift,
                sampleDate: r.sample_date,
                sampleCode: r.sample_code,
                canType: r.can_type,
                weightSystem: r.weight_system,
                milkType: r.milk_type,
                milkStatus: r.milk_status,
                tipingTime: r.tiping_time,
                noOfCans: r.no_of_cans,
                grossWeight: r.gross_weight,
                netWeight: r.net_weight,
                netLtr: r.net_ltr,
                fat: r.fat,
                snf: r.snf,
                clr: r.clr,
                isAnalyse: r.is_analyse,
                entry: r.entry,
                syncStatus: r.sync_status,
                syncDate: r.sync_date,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
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

    

   async saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionDto> {
    console.log(data)
    const [result] = await db.query<MilkCollectionRow[][]>(
        "CALL USP_M_MILK_COLLECTION_IUD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
            "INSERT",
            null,
            data.plant,
            data.userCode,
            data.rootCode,
            data.vendorCode,
            data.shift,
            data.canType,
            data.weightSystem ,
            data.milkType ,
            data.milkStatus,
            data.tipingTime,
            data.noOfCans,
            data.grossWeight,
            data.netWeight,
            data.netLtr,
            data.fat,
            data.snf,
            data.clr,
            data.entry,
        ]
    );

     const row = result[0]?.[0];

    if (!row) {
        throw new Error("No response from procedure");
    }

    if (row.success === 0) {
        throw new Error(String(row.message));
    }

     return {
        id: row.id,
        transCode: row.trans_code,
        plant: row.plant,
        userCode: row.user_code,
        rootCode: row.root_code,
        vendorCode: row.vendor_code,
        shift: row.shift,
        sampleDate: row.sample_date,
        sampleCode: row.sample_code,
        canType: row.can_type,
        weightSystem: row.weight_system,
        milkType: row.milk_type,
        milkStatus: row.milk_status,
        tipingTime: row.tiping_time,
        noOfCans: row.no_of_cans,
        grossWeight: row.gross_weight,
        netWeight: row.net_weight,
        netLtr: row.net_ltr,
        fat: row.fat,
        snf: row.snf,
        clr: row.clr,
        isAnalyse: row.is_analyse,
        entry: row.entry,
        syncStatus: row.sync_status,
        syncDate: row.sync_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dFlag: row.d_flag,
    };
}
}
