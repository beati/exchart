import { Component, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
    selector: 'app-year-selector',
    templateUrl: './year-selector.component.html',
    styleUrls: ['./year-selector.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => YearSelectorComponent),
        multi: true,
    }],
})
export class YearSelectorComponent implements ControlValueAccessor {
    Year = 0

    private isDisabled = false
    private onChange: (_: any) => void

    Increment(): void {
        if (!this.isDisabled) {
            this.Year += 1
            if (this.onChange != undefined) {
                this.onChange(this.Year)
            }
        }
    }

    Decrement(): void {
        if (!this.isDisabled) {
            this.Year -= 1
            if (this.onChange != undefined) {
                this.onChange(this.Year)
            }
        }
    }

    writeValue(year: number): void {
        if (year == undefined) {
            return
        }
        this.Year = year
    }
    registerOnChange(f: (_: any) => void): void {
        this.onChange = f
    }
    registerOnTouched(f: (_: any) => void): void {}
    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled
    }
}
