import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { Plugins } from '@capacitor/core';
import { UtilityService } from 'src/app/services/utility.service';

const { Storage } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
      private router: Router,
      private authService: AuthService,
      private alertService: AlertService,
      private util: UtilityService
  ) { }

  ngOnInit() {

  }

  login(form: NgForm) {
    this.authService.login(form.value.email, form.value.password)
      .toPromise()
      .then(response => {
        console.log(response);
        if (response.length > 0){
          this.setObject('token', response.replace('"', ''));
          this.util.token = response.replace('"', '');
          this.router.navigateByUrl('/account');
        }else{
          this.alertService.presentAlertOk('Erreur', 'Identifiants incorrects');
        }
      }
      ).catch(reason => {
        this.alertService.presentAlertOk('Erreur', 'Identifiants incorrects');
      });
  }

  async setObject(key: string, value: any) {
    await Storage.set({ key, value: JSON.stringify(value) });
  }
}
