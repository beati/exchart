import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { UserService } from '../../services/user.service'

@Component({
    selector: 'app-email-verifier',
    templateUrl: './email-verifier.component.html',
    styleUrls: ['./email-verifier.component.scss'],
})
export class EmailVerifierComponent implements OnInit {
    Done = false
    Error = false

    constructor(
        private readonly route: ActivatedRoute,
        private readonly userService: UserService,
    ) {}

    async ngOnInit(): Promise<void> {
        let id = ''
        let token = ''
        let action = ''
        let param = this.route.snapshot.queryParamMap.get('id')
        if (param != undefined) {
            id = param
        }
        param = this.route.snapshot.queryParamMap.get('token')
        if (param != undefined) {
            token = param
        }
        param = this.route.snapshot.queryParamMap.get('action')
        if (param != undefined) {
            action = param
        }

        try {
            this.userService.VerifyEmail(id, token, action)
            this.Done = true
        } catch (error) {
            this.Error = true
        }
    }
}
