import { browser, by, element } from 'protractor'

export class AppPage {
    async navigateTo(): Promise<any> {
        return browser.get('/')
    }

    async getTitleText(): Promise<string> {
        return element(by.css('app-root h1')).getText()
    }
}
