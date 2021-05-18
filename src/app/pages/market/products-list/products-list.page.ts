import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, IonSlides } from '@ionic/angular';
import { Article } from 'src/app/models/Article';
import { Categorie_Article } from 'src/app/models/Categorie_Article';
import { LigneCommande } from 'src/app/models/LigneCommande';
import { Page } from 'src/app/models/UiModels/Page';
import { Utilisateur } from 'src/app/models/User';
import { AlertService } from 'src/app/services/alert.service';
import {FormService} from "src/app/services/form.service"
import { StorageService } from 'src/app/services/storage.service';
@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.page.html',
  styleUrls: ['./products-list.page.scss'],
})
export class ProductsListPage implements OnInit {

  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild(IonSelect) select: IonSelect;  

  private slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  
  public Pages: Page[];

  public CurrentPagesLoaded = [];

  public Categories: Categorie_Article[];
  public selectedCategorie: Categorie_Article;

  public Articles = [];
  public ArticlesNext = [];
  public ArticlesPrev = [];

  public ModeMenu = 0;

  public currentSlideNumber = 0;
  public currentSlideName = this.currentSlideNumber;

  public pageCount = [];
  public nbPages = 0;
  public nbArt = 0;

  public nbElemParPage = 5;

  private isButtonSlideChange = false;
  private filterVisible = false;

  private searchText = "";
  
  constructor(private formService: FormService,private storageService: StorageService,private alertService: AlertService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentSlideNumber = 0;  
    this.init();
    this.getCategories();
  }
  init(){
    this.Pages = [];
    this.Articles = [];
    console.log(this.currentSlideName)
    this.route.data.subscribe(data => {
      this.ModeMenu = data.estMenu;
    })

    this.Pages = new Array<Page>();
    let maxelem = (this.nbElemParPage * 3);
    let query = "/Article?pageSize=" + maxelem.toString() + 
                "&pageNumber=" + this.currentSlideNumber + 
                "&estMenu=" + this.ModeMenu.toString();

    if(this.searchText !== ""){
      query = query + "&descriptionArticle=" + this.searchText +
      "&libelleArticle=" + this.searchText
    }
    console.log(query)
    this.formService.getList(query).toPromise().then(response => {
      (response as Array<Article>).forEach(element => {
        this.Articles.push(element);
      });

      let countQuery = "";
      if(this.ModeMenu === 1){
        countQuery = "/Article/menu/count"
      }else{
        countQuery = "/Article/ingr/count"
  
      }
      if(this.searchText === ""){
        this.formService.getList(countQuery).toPromise().then(response => {
          this.nbArt = (response as number);
          this.nbPages = Math.ceil((response as number) / this.nbElemParPage);
    
          for(let i = 0; i < this.nbPages; i++){
            let page = new Page();
            page.NumeroPage = i;
            this.Pages.push(page);
          }
    
          this.Pages[0].Articles = this.getArticlePrevPage();
          if(this.Pages.length > 1)
          {
            this.Pages[1].Articles = this.getArticleCurrentPage();
          }
        }).catch(reason => {
          this.alertService.presentAlertOk("Error",reason.message);
        });
      }else{
        this.nbArt = this.Articles.length;
        this.nbPages = Math.ceil(this.nbArt / this.nbElemParPage);
        if(this.nbPages === 1){
          let page = new Page();
          page.NumeroPage = 1;
          this.Pages.push(page);
        }else{
          for(let i = 0; i < this.nbPages+1; i++){
            let page = new Page();
            page.NumeroPage = i;
            this.Pages.push(page);
          }
        }
        this.Pages[0].Articles = this.getArticlePrevPage();
        if(this.Pages.length > 1)
        {
          this.Pages[1].Articles = this.getArticleCurrentPage();
        }
        console.log(query,this.Pages)
      }
    }).catch(reason => {
      this.alertService.presentAlertOk("Error",reason.message);
    });
  }
  searchArticle(){
    this.init();
  }
  
  removeFilters(){
    this.searchText = "";
    this.init();
  }

  showHideFilters(){
    if(this.filterVisible){
      this.filterVisible = false;
    }else{
      this.filterVisible = true;
    }
  }
  slideChanged(){ 
    if(!this.isButtonSlideChange){
      this.slides.getActiveIndex().then(value=>{
        if(value !== this.currentSlideNumber){
          this.currentSlideNumber = value;
          this.getArticles();
        }
      })
    }
  } 

  async prevPage(){ 
    if(this.currentSlideNumber - 1 > -1){
      this.isButtonSlideChange = true;
      //this.Articles = this.ArticlesPrev;
      this.currentSlideNumber--;
      this.slides.slidePrev();
    }
  }

  async nextPage(){
    if(this.currentSlideNumber + 1 <= this.Pages.length){
      //this.Articles = this.ArticlesNext;
      this.isButtonSlideChange = true;
      this.currentSlideNumber++;
      this.slides.slideNext().finally(async () =>{
        await this.getArticles().finally(()=>{
          this.isButtonSlideChange = false;
        });
      });
    }
  }

  async setPage(){
    this.currentSlideNumber = this.select.value;
    this.getArticles().then(async () =>{
      this.slides.slideTo(this.select.value)
    });
  }


  getCategories(){
    this.Categories =[];
    this.formService.getList("Categorie_Article").toPromise().then(response => {
      (response as Array<Categorie_Article>).forEach(element => {
        this.Categories.push(element);
      });
    }).catch(reason => {
      this.alertService.presentAlertOk("Error",reason.message);
    });
  }
  
  getArticlePrevPage(){
    return this.Articles.slice(0,this.nbElemParPage);
  } 
  getArticleNextPage(){
    return this.Articles.slice(this.nbElemParPage * 3 ,this.nbElemParPage * 4 );

  }
  getArticleCurrentPage(){
    return this.Articles.slice(this.nbElemParPage, this.nbElemParPage + this.nbElemParPage);
  }
  
  // Permet de récupérer les articles de la page suivante lorsque l'on navigue sur une autre pour éviter les clignotements et améliorer le temps de réponses des pages
  async getArticles(){  

    //Next page
    if(this.currentSlideNumber < this.Pages.length && this.Pages.length > 1){
      this.Pages[this.currentSlideNumber].Articles = new Array<Article>();
      let query = "/Article?pageSize=" + this.nbElemParPage + 
                  "&pageNumber=" + (this.currentSlideNumber + 1).toString() + 
                  "&estMenu=" + this.ModeMenu.toString();
      if(this.searchText !== ""){
        query = query + "&descriptionArticle=" + this.searchText +
        "&libelleArticle=" + this.searchText
      }
      await this.formService.getList(query).toPromise().then(response => {
        (response as Array<Article>).forEach(element => {
          this.Pages[this.currentSlideNumber].Articles.push(element);
        });
      }).catch(reason => {
        this.alertService.presentAlertOk("Error",reason.message +"\\n" + this.currentSlideNumber);
      });    
    }

    if(this.currentSlideNumber - 1 > 0){
      this.Pages[this.currentSlideNumber - 1].Articles = new Array<Article>();
      let query = "/Article?pageSize=" + this.nbElemParPage + 
                  "&pageNumber=" + (this.currentSlideNumber).toString() + 
                  "&estMenu=" + this.ModeMenu.toString();
      if(this.searchText !== ""){
        query = query + "&descriptionArticle=" + this.searchText +
        "&libelleArticle=" + this.searchText
      }
      await this.formService.getList(query).toPromise().then(response => {
        (response as Array<Article>).forEach(element => {
          this.Pages[this.currentSlideNumber - 1].Articles.push(element);
        });
      }).catch(reason => {
        this.alertService.presentAlertOk("Error",reason.message +"\\n" + this.currentSlideNumber);
      });    
    } 
    if(this.currentSlideNumber - 2 > 0 && this.Pages.length > 1){
      this.Pages[this.currentSlideNumber - 2].Articles = new Array<Article>();
      let query = "/Article?pageSize=" + this.nbElemParPage + 
                  "&pageNumber=" + (this.currentSlideNumber - 1).toString() + 
                  "&estMenu=" + this.ModeMenu.toString();
      if(this.searchText !== ""){
        query = query + "&descriptionArticle=" + this.searchText +
        "&libelleArticle=" + this.searchText
      }
      await this.formService.getList(query).toPromise().then(response => {
        (response as Array<Article>).forEach(element => {
          this.Pages[this.currentSlideNumber - 2].Articles.push(element);
        });
      }).catch(reason => {
        this.alertService.presentAlertOk("Error",reason.message +"\\n" + this.currentSlideNumber);
      });    
    }   
  }

  async addItemToBasket(article: Article){
    let ligneCommande = new LigneCommande();
    ligneCommande.article = article;
    this.alertService.presentMarketDialogQty().then(x=>{
      x.present();
      x.onWillDismiss().then((data) =>{
        if(data.data !== undefined){
          if(data.data.values["Quantity"] !== ''){
            ligneCommande.quantiteArticle = data.data.values["Quantity"]
            this.storageService.addItemToBasket(ligneCommande);
          }
        }
      });
    });
  }
  
  get
}
