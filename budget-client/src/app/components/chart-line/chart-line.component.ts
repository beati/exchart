import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core'

import * as Chartist from 'chartist'

import { DomIDService } from '../../services/dom-id.service'

@Component({
    selector: 'app-chart-line',
    templateUrl: './chart-line.component.html',
    styleUrls: ['./chart-line.component.scss'],
})
export class ChartLineComponent implements AfterViewInit, OnDestroy {
    @Input() AspectRatio: string

    private data: Chartist.IChartistData
    @Input()
    set Data(data: Chartist.IChartistData) {
        this.data = data

        if (this.chart != undefined) {
            this.chart.update(this.Data, this.Options, false)
        }
    }
    get Data(): Chartist.IChartistData {
        return this.data
    }

    private options: Chartist.ILineChartOptions
    @Input()
    set Options(options: Chartist.ILineChartOptions) {
        this.options = options

        if (this.chart != undefined) {
            this.chart.update(this.Data, this.Options, false)
        }
    }
    get Options() {
        return this.options
    }

    ID: string
    private chart: Chartist.IChartistLineChart

    constructor(domIDService: DomIDService) {
        this.ID = domIDService.Generate()
    }

    ngAfterViewInit(): void {
        this.chart = new Chartist.Line(`#${this.ID}`, this.Data, this.Options)
    }

    ngOnDestroy(): void {
        if (this.chart != undefined) {
            this.chart.detach()
        }
    }
}
