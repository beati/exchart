import { Component, OnInit } from '@angular/core'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
    Mobile: boolean

    constructor(
        private readonly responsive: ResponsiveService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.Mobile = this.responsive.Display() === DisplayType.Mobile

        this.responsive.DisplayChange.subscribe((display) => {
            this.Mobile = display === DisplayType.Mobile
        })
    }
}
