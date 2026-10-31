import { injectable } from "tsyringe";
import type {RowDataPacket } from "mysql2";
import { db } from "../../../core/config/database.config";
import { PaginatedVendorsDto, VendoreDto } from "../dtos/vendor.dto";
import { PaginationRequestDto } from "../../../utils/pagination.dto";



interface VendorRow extends RowDataPacket {
  id: number;
  dsk_name: string;
  dsk_code: string;
  vendor_code: string;
  mobile_number: string;
  route_code: string;
  supervisor_emp_id: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}




@injectable()
export class VendorRepo {

  async getVendors(): Promise<VendoreDto[]> {
    const [rows] = await db.execute<VendorRow[]>(
      `SELECT id, dsk_code,dsk_name,vendor_code
       FROM vendor
       ORDER BY id ASC`
    );
    return rows.map((r) => ({
     id:r.id,
     dskCode:r.dsk_code,
     dskName:r.dsk_name,
     vendorCode:r.vendor_code,
    }));
  }

   async getPaginatedVendors(data:PaginationRequestDto):Promise<PaginatedVendorsDto>{
      const page = Number(data.page);
      const limit = Number(data.limit);
      const offset = (page - 1) * limit;
  
      let where = "";
      const whereParams: string[] = [];
  
      const term = data.search?.trim();
      if (term) {
        where = `WHERE mobile_number LIKE ? OR dsk_name LIKE ?  OR dsk_code LIKE ?`;
        const like = `%${term}%`;
        whereParams.push(like, like,like);
      }
      const [countRows] = await db.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM vendor ${where}`,
        whereParams
      );
      const total = Number(countRows[0].total);
      const totalPages = Math.ceil(total / limit);
  
  
      const [rows] = await db.query<VendorRow[]>(
        `SELECT id, dsk_name, dsk_code,vendor_code,mobile_number,route_code,supervisor_emp_id
         FROM vendor
         ${where}
         ORDER BY id ASC
         LIMIT ? OFFSET ?`,
        [...whereParams, limit, offset]
      );
  
      return {
        data: rows.map((r) => ({
        id: r.id,
        dskCode:r.dsk_code,
        dskName:r.dsk_name,
        vendorCode:r.vendor_code,
        mobileNumber:r.mobile_number,
        routeCode:r.route_code,
        supervisorEmpId:r.supervisor_emp_id,
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

