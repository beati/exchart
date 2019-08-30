import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-icon-button-spinner',
    templateUrl: './icon-button-spinner.component.html',
    styleUrls: ['./icon-button-spinner.component.scss'],
})
export class IconButtonSpinnerComponent {
    @Input() color: string
}
