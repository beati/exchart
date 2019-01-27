import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { AuthService } from 'src/app/services/auth.service'

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
    LoggedIn = false

    constructor(
        private readonly router: Router,
        private readonly auth: AuthService,
    ) {}

    ngOnInit(): void {
        this.auth.UnauthenticationSig.subscribe(
            () => {
                this.router.navigate(["/login"])
            },
        )

        this.LoggedIn = this.auth.LoggedIn()
    }
}
