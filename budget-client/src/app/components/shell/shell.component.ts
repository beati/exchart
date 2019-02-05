import { Component, OnInit } from '@angular/core'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
    DisplayType = DisplayType
    Display: DisplayType

    constructor(
        private readonly responsive: ResponsiveService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.Display = this.responsive.Display()

        this.responsive.DisplayChange.subscribe((displayType) => {
            this.Display = displayType
        })
    }
}
