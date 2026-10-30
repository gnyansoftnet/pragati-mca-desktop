import { injectable } from "tsyringe";
import type {RowDataPacket } from "mysql2";
import { db } from "../../../core/config/database.config";
import { PaginatedRoutesDto, RouteResponseDto } from "../dtos/route-response.dto";
import { PaginationRequestDto } from "../../../utils/pagination.dto";


interface RouteRow extends RowDataPacket {
  id: number;
  route_name: string;
  route_code: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}


@injectable()
export class RouteRepo {

  async getRoutes(): Promise<RouteResponseDto[]> {
    const [rows] = await db.execute<RouteRow[]>(
      `SELECT id, route_name,route_code
       FROM route
       ORDER BY id DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      routeName: r.route_name,
      routeCode: r.route_code,
    }));
  }

  async getPaginatedRoutes(data:PaginationRequestDto):Promise<PaginatedRoutesDto>{
    const page = Number(data.page);
    const limit = Number(data.limit);
    const offset = (page - 1) * limit;

    let where = "";
    const whereParams: string[] = [];

    const term = data.search?.trim();
    if (term) {
      where = `WHERE route_name LIKE ? OR route_code LIKE ?`;
      const like = `%${term}%`;
      whereParams.push(like, like);
    }
    const [countRows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM route ${where}`,
      whereParams
    );
    const total = Number(countRows[0].total);
    const totalPages = Math.ceil(total / limit);


    const [rows] = await db.query<RouteRow[]>(
      `SELECT id, route_name, route_code
       FROM route
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    return {
      data: rows.map((r) => ({
        id: r.id,
        routeName: r.route_name,
        routeCode: r.route_code,
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

