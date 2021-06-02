import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import jwt_decode from 'jwt-decode';
import { Adresse_Utilisateur } from 'src/app/models/Adresse_Utilisateur';
import { Commande } from 'src/app/models/Commande';
import { Utilisateur } from 'src/app/models/Utilisateur';
import { FormService } from 'src/app/services/form.service';
import { UtilityService } from 'src/app/services/utility.service';

const { Storage } = Plugins;
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  public userId: '';
  public Token = '';
  public email = '';

  public addressLivr: Adresse_Utilisateur;
  public addressFact: Adresse_Utilisateur;
  public user: Utilisateur;
  public commandes: Array<Commande>;

  public displayMode: 'Adresse_Utilisateur' | 'Commande';

  countries: any;
  constructor(
    private formService: FormService,
    private util: UtilityService
  ) { }

  ngOnInit() {
    // this.getInfo();
    this.user = new Utilisateur();
    this.user.init_empty();
    this.getToken('token').then(value => this.Token = value.toString());
    Storage.get({ key: 'token' }).then((x: any) => {
      if (x.value !== null && x.value !== undefined) {
        console.log((jwt_decode(x.value) as any));
        this.email = (jwt_decode(x.value) as any).email;
        this.userId = (jwt_decode(x.value) as any).id;
        this.getUser().then(() => {
          this.getOrders();
          this.getAdresses();
        });
      }
    });
  }

  async getToken(key: string): Promise<{ value: any }> {
    const ret = await Storage.get({ key });
    return JSON.parse(ret.value);
  }

  async deleteToken(key: string) {
    const ret = await Storage.remove({ key });
    this.util.token = '';
  }

  async getOrders() {
    this.formService.getList('Commande?idUtilisateur=' + this.userId).toPromise().then((response: any) => {
      if (response !== undefined) {
        this.commandes = response;
      }
    });
  }

  async getUser() {
    this.formService.getList('Utilisateur/' + this.userId).toPromise().then((response: any) => {
      if (response !== undefined) {
        this.user = response as Utilisateur;
      }
    });
  }

  async getInfo() {
    this.formService.getList('secured/infos').toPromise().then((response: any) => {
      console.log(response);
    });
  }

  async getAdresses() {
    this.formService.getList('Adresse_Utilisateur?idUtilisateur=' + this.userId).toPromise().then((response: any) => {
      if (response !== undefined) {
        this.addressLivr = response[0];
        this.addressFact = response[1];
        if(this.addressLivr){
          this.addressLivr = new Adresse_Utilisateur();
          this.addressLivr.init_empty();
        }

        if(this.addressFact){
          this.addressFact = new Adresse_Utilisateur();
          this.addressFact.init_empty();
        }
      }
    });
  }

}
