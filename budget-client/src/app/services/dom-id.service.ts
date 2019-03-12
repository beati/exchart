import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class DomIDService {
    private counter = 0

    Generate(): string {
        const id = `domid_${this.counter}`
        this.counter += 1
        return id
    }
}
