import { apiClient } from '@shared/utils/api-client'
import { AxiosInstance } from 'axios'
import { injectable } from 'tsyringe'

@injectable()
export class ApiService {
  readonly http: AxiosInstance
  constructor() {
    this.http = apiClient()
  }
}
