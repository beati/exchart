import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { LandingPageComponent } from './component/landing-page/landing-page.component'
import { LoginComponent } from './component/login/login.component'
import { MainComponent } from './component/main/main.component'
import { RegisterComponent } from './component/register/register.component'
import { ShellComponent } from './component/shell/shell.component'

@NgModule({
    declarations: [
        AppComponent,
        LandingPageComponent,
        LoginComponent,
        MainComponent,
        RegisterComponent,
        ShellComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
