import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(
        private readonly http: HttpClient,
    ) {}

    async AddUser(email: string, password: string, custName: string): Promise<void> {
        const params = {
            email: email,
            password: password,
            customer_name: custName,
        }
        await this.http.post<void>('/api/user/user', params).toPromise()
    }
}
