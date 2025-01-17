import { Injectable } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { PickerModalPage } from '../modal/picker-modal/picker-modal.page';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    public alertController: AlertController,
    public modalController: ModalController,
    private toastController: ToastController
  ) { }


  /**
   * Presents alert with ok button
   * Affiche une alert avec bouton ok
   * @param title titre
   * @param message message
   */
  async presentAlertOk(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      subHeader: '____',
      message: message as string,
      buttons: ['OK'],
      cssClass: 'custom-alertDanger'
    });
    await alert.present();
  }


  /**
   * Return alert with choices : oui / non
   * Renvoie une alert avec choix : oui / non
   * @param title titre
   * @param message message
   * @returns alert oui non
   */
  async getAlertOuiNon(title: string, message: string): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: title,
      subHeader: '____',
      message: message as string,
      buttons: ['Oui', 'Non']
    });
    return alert;
  }


  /**
   * Presents alert with choices : oui / non
   * Affiche une alert avec choix : oui / non
   * @param title titre
   * @param message message
   * @param yesAction action
   */
  async presentAlertOuiNon(title: string, message: string, yesAction: any) {
    const alert = await this.alertController.create({
      header: title,
      buttons: [
        {
          text: 'Annuler',
          role: 'Annuler'
        },
        {
          text: 'Okay',
          handler: () => {
            console.log('test');
            yesAction();
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Return market dialog qty ready to present ( use to add item to basket)
   * Renvoie une alerte prête à présenter ( à utiliser pour ajouter un item au panier)
   * @returns market dialog qty
   */
  async presentMarketDialogQty(): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: 'Quelle quantité souhaitez-vous commander?',
      inputs: [
        {
          name: 'Quantity',
          type: 'number',
          placeholder: 'Quantité',
        }],
      buttons: [
        {
          text: 'Annuler',
          role: 'Annuler'
        },
        {
          text: 'Okay',
          handler: (alertData) => {
            alert.dismiss(alertData);
          }
        }
      ]
    });
    return alert;
  }

  /**
   * Presents modal to pickup an object for administration
   * Affiche une modal pour sélectionner un objet pour l'administration
   * @param title titre
   * @param route api route
   * @returns modal
   */
  async presentModal(tite: string, route: string): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create({
      component: PickerModalPage,
      componentProps: {
        title: tite,
        route: route as string
      },

      cssClass: 'modal-custom-class'
    });
    return modal;
  }


  /**
   * Presents a toast (use to display Warns / Success)
   * Affiche un message (a utiliser pour les Avertissements sans confirmation et succès)
   * @param type type of toast
   * @param message message
   * @param showButton afficher bouton
   */
  async presentToast(type: 'Error' | 'Success', message: string, showButton: boolean) {
    const typeClass = type === 'Success' ? 'toast-custom-class-success' : 'toast-custom-class-error';
    const toast = await this.toastController.create({
      message: message as string,
      position: 'bottom',
      duration: 2100,
      keyboardClose: showButton,
      cssClass: ['toast-custom-class', typeClass]
    });
    toast.color = 'dark';
    toast.present();
  }
}
