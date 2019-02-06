import { TranslateLoader } from '@ngx-translate/core'

import { Observable, of } from 'rxjs'

import { en } from './en'
import { fr } from './fr'

const translations: any = {
    en: en,
    fr: fr,
}

export class TranslationLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        return of(translations[lang])
    }
}
