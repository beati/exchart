import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-button-spinner',
    templateUrl: './button-spinner.component.html',
    styleUrls: ['./button-spinner.component.scss'],
})
export class ButtonSpinnerComponent {
    @Input() type: string
    @Input() Active: boolean
    @Input() Color: string
    @Input() SpinnerColor: string
    @Input() Raised: boolean
    @Input() FullWidth: boolean
    @Input() disabled: boolean
}
